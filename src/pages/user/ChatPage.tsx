import { useState, useEffect, useRef, useCallback, type FC } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  IconMessageCircle,
  IconMessageDots,
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
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { chatService } from '@/services/chat'
import { chatHubClient } from '@/services/chat/signalr'
import { usersService } from '@/services/users'
import { useAuthStore } from '@/stores/authStore'
import { validateImageFile } from '@/services/media'
import type { BackendChatRoom, BackendChatMessage } from '@/types/chat.types'
import type { BackendUserSummary } from '@/types/user.types'

export const ChatPage: FC = () => {
  const { currentUser } = useAuthStore()
  const [searchParams] = useSearchParams()
  const requestedConversationId = searchParams.get('conversationId')

  // State
  const [rooms, setRooms] = useState<BackendChatRoom[]>([])
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
  const [messages, setMessages] = useState<BackendChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)

  // CH-07: Image upload state
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // CH-08: In-room search state
  const [isSearchingHistory, setIsSearchingHistory] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredMessages, setFilteredMessages] = useState<BackendChatMessage[] | null>(null)

  // CH-09: Room settings menu
  const [isRoomMenuOpen, setIsRoomMenuOpen] = useState(false)

  // Modals
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupMajor, setNewGroupMajor] = useState('')

  const [isDirectChatOpen, setIsDirectChatOpen] = useState(false)
  const [userSearchQuery, setUserSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<BackendUserSummary[]>([])
  const [isSearchingUsers, setIsSearchingUsers] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Fetch Rooms
  const fetchRooms = useCallback(async () => {
    setIsLoadingRooms(true)
    try {
      const data = await chatService.getRooms()
      setRooms(data)
      if (requestedConversationId && data.some((r) => r.id === requestedConversationId)) {
        setActiveRoomId(requestedConversationId)
      } else if (data.length > 0 && !activeRoomId && data[0]) {
        setActiveRoomId(data[0].id)
      }
    } catch (err) {
      console.error('Failed to load chat rooms:', err)
    } finally {
      setIsLoadingRooms(false)
    }
  }, [activeRoomId, requestedConversationId])

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchRooms()
    }, 0)
    return () => clearTimeout(timer)
  }, [fetchRooms])

  // Setup SignalR Hub
  useEffect(() => {
    let unsubscribeMessage: (() => void) | undefined
    let unsubscribeTyping: (() => void) | undefined

    const initSignalR = async () => {
      await chatHubClient.startConnection()

      unsubscribeMessage = chatHubClient.onReceiveMessage((newMessage) => {
        setMessages((prev) => {
          // De-duplicate by ID
          if (prev.some((m) => m.id === newMessage.id)) return prev
          return [...prev, newMessage]
        })

        // Also update lastMessage in rooms list
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

    initSignalR()

    return () => {
      unsubscribeMessage?.()
      unsubscribeTyping?.()
    }
  }, [activeRoomId, currentUser?.name])

  // Join Room when activeRoomId changes
  useEffect(() => {
    if (!activeRoomId) return

    let isMounted = true
    setFilteredMessages(null)
    setSearchQuery('')
    setIsSearchingHistory(false)

    const loadRoomMessages = async () => {
      setIsLoadingMessages(true)
      try {
        await chatHubClient.joinRoom(activeRoomId)
        const res = await chatService.getMessages(activeRoomId, 1, 50)
        if (isMounted) {
          setMessages(res.items || [])
          // CH-05: Mark messages as Read in Backend
          chatService.markRead(activeRoomId).catch(() => {})
        }
      } catch (err) {
        console.error('Failed to load room messages:', err)
      } finally {
        if (isMounted) setIsLoadingMessages(false)
      }
    }

    loadRoomMessages()

    return () => {
      isMounted = false
      chatHubClient.leaveRoom(activeRoomId)
    }
  }, [activeRoomId])

  // Scroll to bottom on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, filteredMessages])

  // Image Selection Handler (CH-07)
  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.isValid) {
      alert(validation.error || 'Tệp hình ảnh không hợp lệ.')
      if (fileInputRef.current) fileInputRef.current.value = ''
      return
    }

    setSelectedImage(file)
    setImagePreviewUrl(URL.createObjectURL(file))
  }

  const handleRemoveImage = () => {
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setSelectedImage(null)
    setImagePreviewUrl(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Search in conversation history (CH-08)
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

  // Toggle Mute (CH-09)
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
    }
  }

  // Hide conversation (CH-09)
  const handleHideConversation = async () => {
    if (!activeRoomId) return
    setIsRoomMenuOpen(false)
    const targetRoomId = activeRoomId

    setRooms((prev) => prev.filter((r) => r.id !== targetRoomId))
    const remaining = rooms.filter((r) => r.id !== targetRoomId)
    setActiveRoomId(remaining.length > 0 && remaining[0] ? remaining[0].id : null)

    try {
      await chatService.updateSettings(targetRoomId, { isHidden: true })
    } catch (err) {
      console.error('Failed to hide conversation:', err)
    }
  }

  // Send Message (CH-02, CH-07)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if ((!inputText.trim() && !selectedImage) || !activeRoomId || isSending) return

    const content = inputText.trim() || (selectedImage ? 'Đã gửi một hình ảnh' : '')
    setInputText('')
    setIsSending(true)

    let uploadedMediaUrl: string | null = null
    if (selectedImage) {
      setIsUploadingImage(true)
      try {
        uploadedMediaUrl = await chatService.uploadChatMedia(selectedImage)
      } catch (uploadErr) {
        console.error('Failed to upload image to Cloudinary:', uploadErr)
      } finally {
        setIsUploadingImage(false)
        handleRemoveImage()
      }
    }

    try {
      // Send via REST endpoint (broadcast via SignalR Hub in BE)
      const newMsg = await chatService.sendMessage(activeRoomId, {
        content,
        mediaUrl: uploadedMediaUrl,
        messageType: uploadedMediaUrl ? 'Image' : 'Text',
      })

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev
        return [...prev, newMsg]
      })

      // Update room lastMessage
      setRooms((prev) =>
        prev.map((r) => (r.id === activeRoomId ? { ...r, lastMessage: newMsg } : r))
      )
    } catch (err) {
      console.error('Failed to send message:', err)
    } finally {
      setIsSending(false)
    }
  }

  // Handle typing debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value)
    if (activeRoomId) {
      chatHubClient.sendTyping(activeRoomId, true)
    }
  }

  // Create Group Room
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
    }
  }

  // Search users for direct chat
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
    }
  }

  const activeRoom = rooms.find((r) => r.id === activeRoomId)

  return (
    <div className="space-y-4">
      {/* 1. Unified Page Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
            <IconMessageDots className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">Trò chuyện & Thảo luận Cộng đồng</h1>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Realtime SignalR
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Trò chuyện trực tiếp 1-1 với cựu sinh viên và tham gia các phòng thảo luận chuyên môn thời gian thực.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <Button
            variant="outline"
            onClick={() => setIsDirectChatOpen(true)}
            title="Nhắn tin trực tiếp"
            className="h-9 px-3.5 rounded-xl border-slate-200/90 text-xs font-semibold text-slate-700 hover:text-brand-primary hover:border-brand-primary/40 inline-flex items-center gap-1.5 transition-colors"
          >
            <IconUser className="h-4 w-4" />
            <span>Nhắn tin 1-1</span>
          </Button>

          <Button
            onClick={() => setIsCreateGroupOpen(true)}
            title="Tạo nhóm thảo luận"
            className="h-9 px-3.5 rounded-xl bg-brand-primary hover:bg-brand-primary-hover text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <IconPlus className="h-4 w-4" />
            <span>Tạo nhóm</span>
          </Button>
        </div>
      </div>

      {/* 2. Main Chat Container */}
      <div className="h-[calc(100vh-230px)] min-h-[520px] rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden flex flex-col md:flex-row">
        {/* Sidebar: Rooms List */}
        <div className="w-full md:w-80 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconMessageCircle className="h-5 w-5 text-brand-secondary" />
              <h2 className="font-bold text-slate-900 text-sm">Hộp thư & Hội thoại</h2>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsDirectChatOpen(true)}
                title="Nhắn tin 1-1"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              >
                <IconUser className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsCreateGroupOpen(true)}
                title="Tạo nhóm mới"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
              >
                <IconPlus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Rooms Listing */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoadingRooms ? (
              <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                <IconLoader2 className="h-4 w-4 animate-spin" />
                <span>Đang tải danh sách...</span>
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Chưa có cuộc trò chuyện nào.
              </div>
            ) : (
            rooms.map((room) => {
              const isSelected = room.id === activeRoomId
              const isGroup = room.roomType === 'Group'

              return (
                <button
                  key={room.id}
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
                        <span className="text-[10px] text-slate-400 ml-1">
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
      <div className="flex-1 flex flex-col h-full bg-white">
        {activeRoom ? (
          <>
            {/* Room Header (CH-08, CH-09) */}
            <div className="px-6 py-3 border-b border-slate-200 flex items-center justify-between bg-white relative">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-brand-secondary/10 text-brand-secondary flex items-center justify-center font-bold">
                  {activeRoom.roomType === 'Group' ? <IconUsers className="h-4 w-4" /> : <IconUser className="h-4 w-4" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-sm">{activeRoom.name}</h3>
                    {activeRoom.isMuted && (
                      <span title="Đã tắt thông báo">
                        <IconBellOff className="h-3.5 w-3.5 text-amber-500" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {activeRoom.roomType === 'Group'
                      ? `Phòng thảo luận cộng đồng ${activeRoom.major ? `• ${activeRoom.major}` : ''}`
                      : 'Cuộc trò chuyện trực tiếp 1-1'}
                  </p>
                </div>
              </div>

              {/* Header Right Actions */}
              <div className="flex items-center gap-2">
                {typingUser && (
                  <span className="text-xs text-brand-secondary font-medium italic animate-pulse mr-2">
                    {typingUser} đang nhập tin nhắn...
                  </span>
                )}

                {/* Search Toggle (CH-08) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsSearchingHistory(!isSearchingHistory)
                    if (isSearchingHistory) {
                      setFilteredMessages(null)
                      setSearchQuery('')
                    }
                  }}
                  title="Tìm kiếm tin nhắn trong phòng"
                  className={`rounded-lg p-1.5 transition-colors ${
                    isSearchingHistory
                      ? 'bg-brand-secondary/10 text-brand-secondary'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <IconSearch className="h-4 w-4" />
                </button>

                {/* Room Settings Menu (CH-09) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsRoomMenuOpen(!isRoomMenuOpen)}
                    title="Tùy chọn hội thoại"
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

            {/* In-room Search Bar */}
            {isSearchingHistory && (
              <div className="px-6 py-2.5 bg-slate-100/80 border-b border-slate-200 flex items-center gap-2">
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

            {/* Messages Scroll Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
              {isLoadingMessages ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400 gap-2">
                  <IconLoader2 className="h-5 w-5 animate-spin text-brand-primary" />
                  <span>Đang tải tin nhắn...</span>
                </div>
              ) : (filteredMessages || messages).length === 0 ? (
                <div className="flex flex-col h-full items-center justify-center text-slate-400 space-y-2">
                  <IconMessageCircle className="h-10 w-10 text-slate-200" />
                  <p className="text-sm font-medium text-slate-600">
                    {filteredMessages ? 'Không tìm thấy tin nhắn phù hợp' : 'Chưa có tin nhắn nào'}
                  </p>
                  <p className="text-xs text-slate-400">
                    {filteredMessages ? 'Thử tìm kiếm với từ khóa khác' : 'Gửi lời chào để bắt đầu cuộc trò chuyện cộng đồng!'}
                  </p>
                </div>
              ) : (
                (filteredMessages || messages).map((msg) => {
                  const isMine =
                    msg.senderId === currentUser?.id || msg.senderName === currentUser?.name

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
                        {/* CH-05: Double check seen receipt icon */}
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
                        className={`rounded-2xl px-4 py-2.5 max-w-md text-sm leading-relaxed shadow-xs ${
                          isMine
                            ? 'bg-brand-secondary text-white rounded-br-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                        }`}
                      >
                        {/* CH-07: Display Image Attachment */}
                        {msg.mediaUrl && (
                          <div className="mb-2 overflow-hidden rounded-xl bg-black/5">
                            <img
                              src={msg.mediaUrl}
                              alt="Đính kèm"
                              className="max-h-60 w-auto rounded-xl object-contain cursor-pointer hover:opacity-95 transition-opacity"
                              onClick={() => window.open(msg.mediaUrl!, '_blank')}
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

            {/* CH-07: Image Selection Preview Bar */}
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
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Input Form with Photo Upload (CH-07) */}
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
                title="Đính kèm hình ảnh (CH-07)"
                className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-brand-primary transition-colors shrink-0"
              >
                <IconPhoto className="h-5 w-5" />
              </button>

              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder={`Nhắn tin trong #${activeRoom.name}...`}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none"
              />
              <Button
                type="submit"
                disabled={(!inputText.trim() && !selectedImage) || isSending || isUploadingImage}
                className="bg-brand-secondary hover:bg-brand-secondary/90 text-white rounded-xl px-4 py-2.5 shrink-0"
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
            <p className="text-sm font-medium">Chọn một cuộc trò chuyện để bắt đầu nhắn tin</p>
          </div>
        )}
      </div>
    </div>

      {/* Modal: Create Group Room */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Tạo nhóm thảo luận mới</h3>
              <button
                onClick={() => setIsCreateGroupOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên nhóm</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="VD: Nhóm ôn thi Capstone ĐH FPT"
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
                  placeholder="VD: Kỹ thuật phần mềm (SE)"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="bg-brand-primary text-white hover:bg-brand-primary/90">
                  Tạo nhóm
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Start Direct 1-1 Chat */}
      {isDirectChatOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Nhắn tin trực tiếp 1-1</h3>
              <button
                onClick={() => setIsDirectChatOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>

            <div className="relative">
              <IconSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => handleSearchUsers(e.target.value)}
                placeholder="Tìm kiếm theo tên cựu sinh viên, sinh viên..."
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
              {isSearchingUsers ? (
                <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <IconLoader2 className="h-4 w-4 animate-spin text-brand-primary" />
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
                          {user.role} • {user.campus || 'Hòa Lạc'}
                        </p>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      onClick={() => handleStartDirectChat(user)}
                      className="bg-brand-primary text-white text-xs h-7 px-2.5 hover:bg-brand-primary/90"
                    >
                      Nhắn tin
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ChatPage
