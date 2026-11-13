import { useState, useEffect, useRef, useCallback, type FC } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  IconMessageCircle,
  IconSend,
  IconPlus,
  IconUsers,
  IconUser,
  IconHash,
  IconLoader2,
  IconSearch,
  IconX,
  IconPhoto,
  IconChecks,
  IconCheck,
  IconDotsVertical,
  IconBellOff,
  IconBell,
  IconArrowLeft,
  IconAlertCircle,
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Modal } from '@/components/ui/dialog'
import { chatService } from '@/services/chat'
import { chatHubClient } from '@/services/chat/signalr'
import { usersService } from '@/services/users'
import { useAuthStore } from '@/stores/authStore'
import { formatCampusLabel } from '@/constants/campuses'
import type { BackendChatRoom, BackendChatMessage } from '@/types/chat.types'
import type { BackendUserSummary } from '@/types/user.types'

export const ChatPage: FC = () => {
  const { currentUser } = useAuthStore()
  const [searchParams] = useSearchParams()
  const roomIdParam = searchParams.get('roomId')

  const [rooms, setRooms] = useState<BackendChatRoom[]>([])
  const [activeRoomId, setActiveRoomId] = useState<string | null>(roomIdParam)
  const [messages, setMessages] = useState<BackendChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const [chatError, setChatError] = useState<string | null>(null)

  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSearchingHistory, setIsSearchingHistory] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredMessages, setFilteredMessages] = useState<BackendChatMessage[] | null>(null)

  const [isRoomMenuOpen, setIsRoomMenuOpen] = useState(false)

  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupMajor, setNewGroupMajor] = useState('')

  const [isDirectChatOpen, setIsDirectChatOpen] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<BackendUserSummary[]>([])
  const [isSearchingUsers, setIsSearchingUsers] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchRooms = useCallback(async () => {
    setIsLoadingRooms(true)
    try {
      const data = await chatService.getRooms(currentUser?.id)
      setRooms(data)
      if (roomIdParam && data.some((r) => r.id === roomIdParam)) {
        setActiveRoomId(roomIdParam)
      } else if (data.length > 0 && !activeRoomId && data[0] && window.innerWidth >= 768) {
        setActiveRoomId(data[0].id)
      }
    } catch (err) {
      console.error('Failed to load chat rooms:', err)
      setChatError('Không thể tải danh sách hội thoại.')
    } finally {
      setIsLoadingRooms(false)
    }
  }, [activeRoomId, currentUser?.id, roomIdParam])

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchRooms()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchRooms])

  useEffect(() => {
    let unsubscribeMessage: (() => void) | undefined
    let unsubscribeTyping: (() => void) | undefined

    const initSignalR = async () => {
      await chatHubClient.startConnection()

      unsubscribeMessage = chatHubClient.onReceiveMessage((newMessage) => {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMessage.id)) return prev
          return [...prev, newMessage]
        })

        setRooms((prevRooms) =>
          prevRooms.map((r) =>
            r.id === newMessage.roomId ? { ...r, lastMessage: newMessage } : r
          )
        )
      })

      unsubscribeTyping = chatHubClient.onUserTyping(({ roomId, userName, isTyping }) => {
        if (roomId === activeRoomId && userName !== currentUser?.name) {
          if (isTyping) {
            setTypingUser(userName)
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
            typingTimeoutRef.current = setTimeout(() => setTypingUser(null), 3000)
          } else {
            setTypingUser(null)
          }
        }
      })
    }

    void initSignalR()

    return () => {
      unsubscribeMessage?.()
      unsubscribeTyping?.()
    }
  }, [activeRoomId, currentUser?.name])

  useEffect(() => {
    if (!activeRoomId) return

    let isMounted = true
    setFilteredMessages(null)
    setSearchQuery('')
    setIsSearchingHistory(false)
    setChatError(null)

    const loadRoomMessages = async () => {
      setIsLoadingMessages(true)
      try {
        await chatHubClient.joinRoom(activeRoomId)
        const res = await chatService.getMessages(activeRoomId, 1, 50)
        if (isMounted) {
          setMessages(res.items || [])
          chatService.markRead(activeRoomId).catch(() => {})
        }
      } catch (err) {
        console.error('Failed to load room messages:', err)
        if (isMounted) setChatError('Không thể tải tin nhắn của phòng này.')
      } finally {
        if (isMounted) setIsLoadingMessages(false)
      }
    }

    void loadRoomMessages()

    return () => {
      isMounted = false
      void chatHubClient.leaveRoom(activeRoomId)
    }
  }, [activeRoomId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, filteredMessages])

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      setImagePreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleRemoveImage = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setSelectedImage(null)
    setImagePreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSearchHistory = async (q: string) => {
    setSearchQuery(q)
    if (!activeRoomId) return
    if (!q.trim()) {
      setFilteredMessages(null)
      return
    }

    try {
      const results = await chatService.searchMessages(activeRoomId, q.trim())
      setFilteredMessages(results)
    } catch (err) {
      console.error('Failed to search messages in room:', err)
    }
  }

  const handleToggleMute = async () => {
    if (!activeRoomId) return
    const activeRoom = rooms.find((r) => r.id === activeRoomId)
    const nextMuted = !activeRoom?.isMuted

    setRooms((prev) =>
      prev.map((r) => (r.id === activeRoomId ? { ...r, isMuted: nextMuted } : r))
    )
    setIsRoomMenuOpen(false)

    try {
      await chatService.updateSettings(activeRoomId, { isMuted: nextMuted })
    } catch (err) {
      console.error('Failed to update mute settings:', err)
      setChatError('Không thể cập nhật trạng thái thông báo.')
    }
  }

  const handleHideConversation = async () => {
    if (!activeRoomId) return
    setIsRoomMenuOpen(false)
    const targetRoomId = activeRoomId

    const remaining = rooms.filter((r) => r.id !== targetRoomId)
    setRooms(remaining)
    setActiveRoomId(window.innerWidth >= 768 && remaining[0] ? remaining[0].id : null)

    try {
      await chatService.updateSettings(targetRoomId, { isHidden: true })
    } catch (err) {
      console.error('Failed to hide conversation:', err)
      setChatError('Không thể ẩn cuộc trò chuyện.')
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!inputText.trim() && !selectedImage) || !activeRoomId || isSending) return

    const draftText = inputText.trim()
    const content = draftText || (selectedImage ? 'Đã gửi một hình ảnh' : '')
    setInputText('')
    setIsSending(true)
    setChatError(null)

    let uploadedMediaUrl: string | null = null
    if (selectedImage) {
      setIsUploadingImage(true)
      try {
        uploadedMediaUrl = await chatService.uploadChatMedia(selectedImage)
      } catch (uploadErr) {
        console.error('Failed to upload image:', uploadErr)
        setChatError('Không thể tải hình ảnh lên máy chủ.')
        setIsUploadingImage(false)
        setIsSending(false)
        setInputText(draftText)
        return
      } finally {
        setIsUploadingImage(false)
        handleRemoveImage()
      }
    }

    try {
      const newMsg = await chatService.sendMessage(activeRoomId, {
        content,
        mediaUrl: uploadedMediaUrl,
        messageType: uploadedMediaUrl ? 'Image' : 'Text',
      })

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })

      setRooms((prev) =>
        prev.map((r) => (r.id === activeRoomId ? { ...r, lastMessage: newMsg } : r))
      )
    } catch (err) {
      console.error('Failed to send message:', err)
      setChatError('Gửi tin nhắn thất bại. Vui lòng thử lại.')
      setInputText(draftText)
    } finally {
      setIsSending(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
    if (activeRoomId) {
      void chatHubClient.sendTyping(activeRoomId, true)
    }
  }

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newGroupName.trim()) return

    try {
      const created = await chatService.createGroupRoom({
        name: newGroupName.trim(),
        major: newGroupMajor || undefined,
      })

      setIsCreateGroupOpen(false)
      setNewGroupName('')
      setNewGroupMajor('')
      await fetchRooms()
      setActiveRoomId(created.roomId)
    } catch (err) {
      console.error('Failed to create group room:', err)
      setChatError('Không thể tạo phòng chat mới.')
    }
  }

  const handleSearchUsers = async (q: string) => {
    setUserSearchQuery(q)
    if (!q.trim()) {
      setSearchResults([])
      return
    }

    setIsSearchingUsers(true)
    try {
      const res = await usersService.searchUsers({ keyword: q.trim(), pageSize: 10 })
      const filtered = (res?.items || []).filter((u) => u.id !== currentUser?.id)
      setSearchResults(filtered)
    } catch (err) {
      console.error('User search error:', err)
    } finally {
      setIsSearchingUsers(false)
    }
  }

  const handleStartDirectChat = async (targetUser: BackendUserSummary) => {
    try {
      const room = await chatService.createDirectRoom({
        targetUserId: targetUser.id,
        targetUserName: targetUser.fullName,
      })

      setIsDirectChatOpen(false)
      setUserSearchQuery('')
      setSearchResults([])
      await fetchRooms()
      setActiveRoomId(room.roomId)
    } catch (err) {
      console.error('Failed to start direct room:', err)
      setChatError('Không thể mở hội thoại trực tiếp với thành viên này.')
    }
  }

  const activeRoom = rooms.find((r) => r.id === activeRoomId)

  return (
    <div className="h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar: Rooms List */}
      <div
        className={`${
          activeRoomId ? 'hidden md:flex' : 'flex'
        } w-full md:w-80 border-b md:border-b-0 md:border-r border-slate-200 flex-col h-full bg-slate-50/50`}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconMessageCircle className="h-5 w-5 text-brand-secondary" />
            <h2 className="font-bold text-slate-900 text-sm">Tin nhắn & Thảo luận</h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setIsDirectChatOpen(true)}
              title="Nhắn tin 1-1 mới"
              aria-label="Nhắn tin 1-1 mới"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            >
              <IconUser className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsCreateGroupOpen(true)}
              title="Tạo nhóm thảo luận"
              aria-label="Tạo nhóm thảo luận"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            >
              <IconPlus className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {isLoadingRooms ? (
            <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <IconLoader2 className="h-4 w-4 animate-spin" />
              <span>Đang tải hội thoại...</span>
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Chưa có cuộc trò chuyện nào. Hãy bắt đầu nhắn tin với Alumni hoặc tạo nhóm mới!
            </div>
          ) : (
            rooms.map((room) => {
              const isSelected = room.id === activeRoomId
              const isGroup = room.roomType === 'Group'

              return (
                <button
                  key={room.id}
                  type="button"
                  onClick={() => setActiveRoomId(room.id)}
                  className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 ${
                    isSelected
                      ? 'bg-blue-50/80 border-l-4 border-brand-secondary text-slate-900'
                      : 'hover:bg-slate-100/60 text-slate-700'
                  }`}
                >
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isGroup
                        ? 'bg-brand-secondary/10 text-brand-secondary'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {isGroup ? <IconHash className="h-4 w-4" /> : <IconUser className="h-4 w-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs truncate">{room.name}</span>
                      {room.lastMessage && (
                        <span className="text-[10px] text-slate-400 ml-1 shrink-0">
                          {new Date(room.lastMessage.sentAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {room.lastMessage
                        ? `${room.lastMessage.senderName}: ${room.lastMessage.content}`
                        : room.major
                        ? `Nhóm ngành: ${room.major}`
                        : 'Chưa có tin nhắn'}
                    </p>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`${activeRoomId ? 'flex' : 'hidden md:flex'} flex-1 flex-col h-full bg-white min-w-0`}>
        {chatError && (
          <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs text-rose-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <IconAlertCircle className="h-4 w-4 shrink-0" />
              {chatError}
            </span>
            <button type="button" onClick={() => setChatError(null)} className="text-rose-500 hover:text-rose-700">
              <IconX className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {activeRoom ? (
          <>
            {/* Room Header */}
            <div className="px-4 sm:px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-white relative gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setActiveRoomId(null)}
                  className="md:hidden rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 shrink-0"
                  aria-label="Quay lại danh sách phòng chat"
                >
                  <IconArrowLeft className="h-4 w-4" />
                </button>

                <div className="h-9 w-9 rounded-xl bg-brand-secondary/10 text-brand-secondary flex items-center justify-center font-bold shrink-0">
                  {activeRoom.roomType === 'Group' ? <IconUsers className="h-4 w-4" /> : <IconUser className="h-4 w-4" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm truncate">{activeRoom.name}</h3>
                    {activeRoom.isMuted && (
                      <span title="Đã tắt thông báo">
                        <IconBellOff className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {activeRoom.roomType === 'Group'
                      ? `Phòng thảo luận cộng đồng ${activeRoom.major ? `• ${activeRoom.major}` : ''}`
                      : 'Cuộc trò chuyện trực tiếp 1-1'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {typingUser && (
                  <span className="hidden sm:inline text-xs text-brand-secondary font-medium italic animate-pulse mr-1">
                    {typingUser} đang nhập...
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setIsSearchingHistory(!isSearchingHistory)
                    if (isSearchingHistory) {
                      setFilteredMessages(null)
                      setSearchQuery('')
                    }
                  }}
                  title="Tìm kiếm tin nhắn"
                  aria-label="Tìm kiếm tin nhắn"
                  className={`rounded-lg p-1.5 transition-colors ${
                    isSearchingHistory
                      ? 'bg-brand-secondary/10 text-brand-secondary'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <IconSearch className="h-4 w-4" />
                </button>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsRoomMenuOpen(!isRoomMenuOpen)}
                    title="Tùy chọn hội thoại"
                    aria-label="Tùy chọn hội thoại"
                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                  >
                    <IconDotsVertical className="h-4 w-4" />
                  </button>

                  {isRoomMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white p-1.5 shadow-lg border border-slate-200 z-30 text-xs">
                      <button
                        type="button"
                        onClick={handleToggleMute}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors text-left font-medium"
                      >
                        {activeRoom.isMuted ? (
                          <>
                            <IconBell className="h-4 w-4 text-slate-500" />
                            <span>Bật thông báo</span>
                          </>
                        ) : (
                          <>
                            <IconBellOff className="h-4 w-4 text-amber-500" />
                            <span>Tắt thông báo</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleHideConversation}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors text-left font-medium"
                      >
                        <IconX className="h-4 w-4" />
                        <span>Ẩn cuộc trò chuyện</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {isSearchingHistory && (
              <div className="px-4 sm:px-6 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center gap-2">
                <IconSearch className="h-4 w-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchHistory(e.target.value)}
                  placeholder="Nhập từ khóa tìm kiếm tin nhắn trong phòng..."
                  className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setFilteredMessages(null)
                    }}
                    className="text-slate-400 hover:text-slate-600 p-0.5"
                    aria-label="Xóa tìm kiếm"
                  >
                    <IconX className="h-3.5 w-3.5" />
                  </button>
                )}
                {filteredMessages && (
                  <span className="text-[11px] font-semibold text-brand-secondary bg-white px-2 py-0.5 rounded-full border border-slate-200">
                    {filteredMessages.length} kết quả
                  </span>
                )}
              </div>
            )}

            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-slate-50/30">
              {isLoadingMessages ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400 gap-2">
                  <IconLoader2 className="h-5 w-5 animate-spin" />
                  <span>Đang tải tin nhắn...</span>
                </div>
              ) : (filteredMessages || messages).length === 0 ? (
                <div className="flex flex-col h-full items-center justify-center text-slate-400 space-y-2">
                  <IconMessageCircle className="h-10 w-10 text-slate-200" />
                  <p className="text-sm font-medium text-slate-600">
                    {filteredMessages ? 'Không tìm thấy tin nhắn phù hợp' : 'Chưa có tin nhắn nào'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {filteredMessages ? 'Thử tìm kiếm với từ khóa khác' : 'Hãy gửi lời chào để bắt đầu cuộc trò chuyện!'}
                  </p>
                </div>
              ) : (
                (filteredMessages || messages).map((msg) => {
                  const isMine =
                    msg.senderId === currentUser?.id || msg.senderName === currentUser?.name
                  const mediaSrc = msg.attachmentUrl || msg.mediaUrl

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-600">
                          {isMine ? 'Bạn' : msg.senderName}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(msg.sentAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        {isMine && (
                          <span title={msg.isRead ? 'Đã xem' : 'Đã gửi'}>
                            {msg.isRead ? (
                              <IconChecks className="h-3.5 w-3.5 text-blue-500 inline-block ml-0.5" />
                            ) : (
                              <IconCheck className="h-3.5 w-3.5 text-slate-400 inline-block ml-0.5" />
                            )}
                          </span>
                        )}
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-2.5 max-w-[85%] sm:max-w-md text-sm leading-relaxed shadow-sm break-words ${
                          isMine
                            ? 'bg-brand-secondary text-white rounded-br-sm'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                        }`}
                      >
                        {mediaSrc && (
                          <div className="mb-2 overflow-hidden rounded-xl bg-black/5">
                            <img
                              src={mediaSrc}
                              alt="Đính kèm"
                              className="max-h-60 w-auto rounded-xl object-contain cursor-pointer hover:opacity-95 transition-opacity"
                              onClick={() => window.open(mediaSrc, '_blank')}
                            />
                          </div>
                        )}
                        {msg.content}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {imagePreviewUrl && (
              <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src={imagePreviewUrl}
                    alt="Preview"
                    className="h-10 w-10 rounded-lg object-cover border border-slate-200"
                  />
                  <div>
                    <span className="text-xs font-semibold text-slate-700 block truncate max-w-xs">
                      {selectedImage?.name}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Sẵn sàng gửi hình ảnh đính kèm
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
                  aria-label="Hủy ảnh"
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleSelectImage}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Đính kèm hình ảnh"
                aria-label="Đính kèm hình ảnh"
                className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-brand-primary transition-colors shrink-0"
              >
                <IconPhoto className="h-5 w-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder={`Nhắn tin trong ${activeRoom.name}...`}
                className="flex-1 min-w-0 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none"
              />
              <Button
                type="submit"
                disabled={(!inputText.trim() && !selectedImage) || isSending || isUploadingImage}
                className="bg-brand-secondary hover:bg-brand-secondary/90 text-white rounded-xl px-4 py-2.5 shrink-0"
                aria-label="Gửi tin nhắn"
              >
                {isSending || isUploadingImage ? (
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <IconSend className="h-4 w-4" />
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <IconMessageCircle className="h-12 w-12 text-slate-200 mb-2" />
            <p className="text-sm font-medium">Chọn một hội thoại để bắt đầu trò chuyện</p>
          </div>
        )}
      </div>

      {/* Modal: Create Group Room */}
      <Modal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        title="Tạo nhóm thảo luận mới"
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Tên phòng chat</label>
            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Ví dụ: Đồ án tốt nghiệp K18 SE"
              required
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Chuyên ngành (Tùy chọn)</label>
            <input
              type="text"
              value={newGroupMajor}
              onChange={(e) => setNewGroupMajor(e.target.value)}
              placeholder="Ví dụ: Kỹ thuật phần mềm"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" className="bg-brand-secondary text-white hover:bg-brand-secondary/90">
              Tạo phòng
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Start Direct 1-1 Chat */}
      <Modal
        isOpen={isDirectChatOpen}
        onClose={() => setIsDirectChatOpen(false)}
        title="Bắt đầu trò chuyện 1-1"
      >
        <div className="space-y-4">
          <div className="relative">
            <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={userSearchQuery}
              onChange={(e) => void handleSearchUsers(e.target.value)}
              placeholder="Tìm theo tên sinh viên hoặc cựu sinh viên..."
              className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-brand-primary focus:outline-none"
            />
          </div>

          <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
            {isSearchingUsers ? (
              <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <IconLoader2 className="h-4 w-4 animate-spin" />
                <span>Đang tìm kiếm thành viên...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                {userSearchQuery ? 'Không tìm thấy thành viên phù hợp' : 'Nhập tên để tìm kiếm thành viên'}
              </div>
            ) : (
              searchResults.map((user) => (
                <div
                  key={user.id}
                  className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar fallback={user.fullName.slice(0, 2).toUpperCase()} size="sm" />
                    <div>
                      <p className="font-bold text-xs text-slate-900">{user.fullName}</p>
                      <p className="text-[10px] text-slate-500">
                        {user.role} • {formatCampusLabel(user.campus) || 'FPTU'}
                      </p>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => void handleStartDirectChat(user)}
                    className="bg-brand-secondary text-white text-xs h-7 px-2.5"
                  >
                    Nhắn tin
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ChatPage
