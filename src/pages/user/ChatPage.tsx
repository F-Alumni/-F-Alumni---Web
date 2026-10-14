import { useState, useEffect, useRef, useCallback, type FC } from 'react'
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
} from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { chatService } from '@/services/chat'
import { chatHubClient } from '@/services/chat/signalr'
import { usersService } from '@/services/users'
import { useAuthStore } from '@/stores/authStore'
import type { BackendChatRoom, BackendChatMessage } from '@/types/chat.types'
import type { BackendUserSummary } from '@/types/user.types'

export const ChatPage: FC = () => {
  const { currentUser } = useAuthStore()

  // State
  const [rooms, setRooms] = useState<BackendChatRoom[]>([])
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)
  const [messages, setMessages] = useState<BackendChatMessage[]>([])
  const [inputText, setInputText] = useState('')
  const [isLoadingRooms, setIsLoadingRooms] = useState(true)
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)

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
      if (data.length > 0 && !activeRoomId && data[0]) {
        setActiveRoomId(data[0].id)
      }
    } catch (err) {
      console.error('Failed to load chat rooms:', err)
    } finally {
      setIsLoadingRooms(false)
    }
  }, [activeRoomId])

  useEffect(() => {
    fetchRooms()
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
    const loadRoomMessages = async () => {
      setIsLoadingMessages(true)
      try {
        await chatHubClient.joinRoom(activeRoomId)
        const res = await chatService.getMessages(activeRoomId, 1, 50)
        if (isMounted) {
          setMessages(res.items || [])
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
  }, [messages])

  // Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || !activeRoomId || isSending) return

    const content = inputText.trim()
    setInputText('')
    setIsSending(true)

    try {
      // Send via REST endpoint (which also triggers ReceiveMessage broadcast in BE)
      const newMsg = await chatService.sendMessage(activeRoomId, { content })
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
    <div className="h-[calc(100vh-140px)] rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar: Rooms List */}
      <div className="w-full md:w-80 border-r border-slate-200 flex flex-col h-full bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <IconMessageCircle className="h-5 w-5 text-brand-secondary" />
            <h2 className="font-bold text-slate-900 text-sm">Discussions & Chat</h2>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsDirectChatOpen(true)}
              title="New 1-1 Chat"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            >
              <IconUser className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIsCreateGroupOpen(true)}
              title="Create Group Room"
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
              <span>Loading rooms...</span>
            </div>
          ) : rooms.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No chat rooms found.
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
            {/* Room Header */}
            <div className="px-6 py-3.5 border-b border-slate-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-brand-secondary/10 text-brand-secondary flex items-center justify-center font-bold">
                  {activeRoom.roomType === 'Group' ? <IconUsers className="h-4 w-4" /> : <IconUser className="h-4 w-4" />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{activeRoom.name}</h3>
                  <p className="text-[11px] text-slate-500">
                    {activeRoom.roomType === 'Group'
                      ? `Phòng thảo luận cộng đồng ${activeRoom.major ? `• ${activeRoom.major}` : ''}`
                      : 'Cuộc trò chuyện trực tiếp 1-1'}
                  </p>
                </div>
              </div>

              {typingUser && (
                <span className="text-xs text-brand-secondary font-medium italic animate-pulse">
                  {typingUser} is typing...
                </span>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/30">
              {isLoadingMessages ? (
                <div className="flex h-full items-center justify-center text-xs text-slate-400 gap-2">
                  <IconLoader2 className="h-5 w-5 animate-spin" />
                  <span>Loading messages...</span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col h-full items-center justify-center text-slate-400 space-y-2">
                  <IconMessageCircle className="h-10 w-10 text-slate-200" />
                  <p className="text-sm font-medium text-slate-600">No messages yet</p>
                  <p className="text-xs text-slate-400">Say hello and start the community conversation!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine =
                    msg.senderId === currentUser?.id || msg.senderName === currentUser?.name

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-1 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-600">
                          {isMine ? 'You' : msg.senderName}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(msg.sentAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      <div
                        className={`rounded-2xl px-4 py-2.5 max-w-md text-sm leading-relaxed shadow-xs ${
                          isMine
                            ? 'bg-brand-secondary text-white rounded-br-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-200 bg-white flex items-center gap-2">
              <input
                type="text"
                value={inputText}
                onChange={handleInputChange}
                placeholder={`Message #${activeRoom.name}...`}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-brand-primary focus:outline-none"
              />
              <Button
                type="submit"
                disabled={!inputText.trim() || isSending}
                className="bg-brand-secondary hover:bg-brand-secondary/90 text-white rounded-xl px-4 py-2.5 shrink-0"
              >
                {isSending ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <IconSend className="h-4 w-4" />}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <IconMessageCircle className="h-12 w-12 text-slate-200 mb-2" />
            <p className="text-sm font-medium">Select a room to begin chatting</p>
          </div>
        )}
      </div>

      {/* Modal: Create Group Room */}
      {isCreateGroupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Create Group Discussion</h3>
              <button
                onClick={() => setIsCreateGroupOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Room Name</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. FPT Capstone Project Mentorship"
                  required
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Major Focus (Optional)</label>
                <input
                  type="text"
                  value={newGroupMajor}
                  onChange={(e) => setNewGroupMajor(e.target.value)}
                  placeholder="e.g. Kỹ thuật phần mềm"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-brand-primary focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateGroupOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-brand-secondary text-white hover:bg-brand-secondary/90">
                  Create Room
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
              <h3 className="font-bold text-slate-900 text-base">Start Direct Message</h3>
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
                placeholder="Search by student or alumni name..."
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2 text-sm focus:border-brand-primary focus:outline-none"
              />
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100">
              {isSearchingUsers ? (
                <div className="p-4 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                  <IconLoader2 className="h-4 w-4 animate-spin" />
                  <span>Searching directory...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  {userSearchQuery ? 'No members found' : 'Type a name to search members'}
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
                      className="bg-brand-secondary text-white text-xs h-7 px-2.5"
                    >
                      Chat
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
