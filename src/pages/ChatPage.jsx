import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { getConversationsAPI, getMessagesAPI, sendMessageAPI } from '@/apis'
import { getSocket, initializeSocket } from '@/sockets/messageSocket'
import { toast } from 'sonner'
import {
  Loader2,
  Send,
  Image as ImageIcon,
  Search,
  MoreVertical,
  ChevronLeft
} from 'lucide-react'
import { uploadFileToCloudinary } from '@/services/api/cloudinary'

const ChatPage = () => {
  const { user: currentUser } = useAuthStore()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [conversations, setConversations] = useState([])
  const [selectedConversationId, setSelectedConversationId] = useState(null)
  const [messages, setMessages] = useState([])
  const [messageInput, setMessageInput] = useState('')
  const [selectedImageFile, setSelectedImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [isLoadingMessages, setIsLoadingMessages] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const messagesEndRef = useRef(null)

  // Derived selectedConversation from id (primitive) to avoid rerun effects
  const selectedConversation = useMemo(
    () => conversations.find((c) => c._id === selectedConversationId) || null,
    [conversations, selectedConversationId]
  )

  // Keep a ref of selectedConversationId for socket handlers (stable primitive)
  const selectedConversationIdRef = useRef(selectedConversationId)
  useEffect(() => {
    selectedConversationIdRef.current = selectedConversationId
  }, [selectedConversationId])

  // 0. Initialize socket connection once (you may choose to call this after login)
  useEffect(() => {
    initializeSocket()

    return () => {
      const socket = getSocket()
      if (socket) {
        socket.disconnect()
      }
    }
    // intentionally run once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 1. Fetch conversations on mount
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const convs = await getConversationsAPI()
        setConversations(convs)

        // If URL has user param and no selectedConversationId yet, auto-select
        const otherUserIdFromUrl = searchParams.get('user')
        if (otherUserIdFromUrl && convs.length > 0) {
          const conv = convs.find(
            (c) => c.otherParticipant._id === otherUserIdFromUrl
          )
          if (conv) setSelectedConversationId(conv._id)
        }
      } catch (error) {
        toast.error('Lỗi khi tải danh sách cuộc trò chuyện.')
        console.error(error)
      }
    }
    fetchConversations()
  }, [searchParams])

  // 2. Fetch messages when a conversation id is selected
  useEffect(() => {
    const fetchMessages = async () => {
      if (!selectedConversationId) {
        setMessages([])
        return
      }

      // need otherUserId to call your API
      const otherUserId = selectedConversation?.otherParticipant?._id
      if (!otherUserId) return

      setIsLoadingMessages(true)
      try {
        const msgs = await getMessagesAPI(otherUserId)
        setMessages(msgs)
      } catch (error) {
        toast.error('Lỗi khi tải tin nhắn.')
        console.error(error)
      } finally {
        setIsLoadingMessages(false)
      }
    }

    fetchMessages()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversationId])

  // Helper: minimal update of conversations (move updated conv to head)
  const updateConversationOnNewMessage = useCallback(
    (newMessage) => {
      setConversations((prevConvs) => {
        const idx = prevConvs.findIndex(
          (c) => c._id === newMessage.conversationId
        )

        if (idx === -1) {
          // Optionally, you can fetch conversation data from server; here we insert minimal object
          const newConv = {
            _id: newMessage.conversationId,
            participants: [newMessage.senderId, newMessage.receiverId],
            otherParticipant:
              newMessage.senderId === currentUser._id
                ? { _id: newMessage.receiverId }
                : { _id: newMessage.senderId },
            lastMessage: newMessage
          }
          return [newConv, ...prevConvs]
        }

        const updated = { ...prevConvs[idx], lastMessage: newMessage }

        if (idx === 0) {
          // minimal change: replace first item only
          const copy = prevConvs.slice()
          copy[0] = updated
          return copy
        }

        return [
          updated,
          ...prevConvs.slice(0, idx),
          ...prevConvs.slice(idx + 1)
        ]
      })
    },
    [currentUser._id]
  )

  // 3. Setup Socket.IO listener (append only, avoid duplicates)
  useEffect(() => {
    const socket = getSocket()
    if (!socket) return

    const handleNewMessage = (newMessage) => {
      // Prevent duplicates
      setMessages((prev) => {
        if (!newMessage || !newMessage._id) return prev
        if (prev.some((m) => m._id === newMessage._id)) return prev

        // If this message belongs to currently opened conversation => append
        if (selectedConversationIdRef.current === newMessage.conversationId) {
          return [...prev, newMessage]
        }
        return prev
      })

      // Update conversation list minimal
      updateConversationOnNewMessage(newMessage)
    }

    socket.on('newMessage', handleNewMessage)

    return () => {
      socket.off('newMessage', handleNewMessage)
    }
  }, [updateConversationOnNewMessage])

  // 4. Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectChat = useCallback(
    (conversation) => {
      setSelectedConversationId(conversation._id)
      navigate(`/messages?user=${conversation.otherParticipant._id}`, {
        replace: true
      })
    },
    [navigate]
  )

  const handleBackToList = useCallback(() => {
    setSelectedConversationId(null)
    navigate('/messages', { replace: true })
  }, [navigate])

  // 5. Send message: optimistic UI (temp message) + replace on server response
  const handleSendMessage = useCallback(
    async (e) => {
      e?.preventDefault()
      if (
        (!messageInput.trim() && !selectedImageFile) ||
        !selectedConversationId
      )
        return

      const otherUserId = selectedConversation?.otherParticipant?._id
      if (!otherUserId) return

      const tempId = `temp-${Date.now()}`
      const tempMessageText = messageInput
      const tempMessage = {
        _id: tempId,
        senderId: currentUser._id,
        receiverId: otherUserId,
        message: tempMessageText,
        createdAt: new Date().toISOString(),
        conversationId: selectedConversationId,
        imageUrl: previewUrl, // Use preview for optimistic UI
        isTemp: true
      }

      // append temp message immediately
      setMessages((prev) => [...prev, tempMessage])
      setMessageInput('')
      setSelectedImageFile(null)
      setPreviewUrl('')
      setIsUploadingImage(false)

      try {
        let finalImageUrl = ''
        if (selectedImageFile) {
          setIsUploadingImage(true)
          const res = await uploadFileToCloudinary(selectedImageFile, 'image')
          if (res.success && res.data.secure_url) {
            finalImageUrl = res.data.secure_url
          } else {
            throw new Error('Image upload failed')
          }
          setIsUploadingImage(false)
        }

        const payload = {
          receiverId: otherUserId,
          message: tempMessageText
        }
        if (finalImageUrl) {
          payload.imageUrl = finalImageUrl
        }

        const realMessage = await sendMessageAPI(payload)
        console.log('realMessage', realMessage)
        // replace temp message with real message (or append if not found)
        setMessages((prev) => {
          if (prev.some((m) => m._id === realMessage._id)) return prev
          return prev.map((m) => (m.isTemp ? realMessage : m))
        })

        // update conversation list
        updateConversationOnNewMessage(realMessage)
      } catch (error) {
        // on failure, remove temp or mark failed
        setMessages((prev) => prev.filter((m) => m._id !== tempId))
        setMessageInput(tempMessageText) // Restore text input
        toast.error('Không gửi được tin nhắn.')
        console.error(error)
      }
    },
    [
      messageInput,
      selectedConversationId,
      selectedConversation,
      selectedImageFile,
      previewUrl,
      currentUser._id,
      updateConversationOnNewMessage
    ]
  )

  // Placeholder for image upload logic
  const handleImageSelect = (event) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error('Kích thước ảnh không được vượt quá 5MB.')
        return
      }
      setSelectedImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  return (
    <div className='flex h-[90vh] bg-white'>
      {/* Sidebar - Danh sách tin nhắn */}
      <div
        className={`${
          selectedConversation ? 'hidden md:flex' : 'flex'
        } w-full md:w-96 bg-white border-r border-gray-200 flex-col overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className='flex justify-between items-center p-4 border-b border-gray-200'>
          <h2 className='text-3xl font-bold'>Tin nhắn</h2>
          <button className='p-2 hover:bg-gray-100 rounded-full transition'>
            <MoreVertical size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className='flex items-center gap-2 px-4 py-3 bg-gray-100 mx-4 rounded-full'>
          <Search size={18} className='text-gray-600' />
          <input
            type='text'
            placeholder='Tìm kiếm...'
            className='bg-transparent outline-none flex-1 text-sm'
          />
        </div>

        {/* Conversations List */}
        <div className='flex-1 overflow-y-auto py-2'>
          {conversations.map((conv) => (
            <div
              key={conv._id}
              className={`flex items-center gap-3 px-3 py-2 cursor-pointer transition border-l-4 ${
                selectedConversationId === conv._id
                  ? 'bg-blue-50 border-l-blue-500'
                  : 'hover:bg-gray-100 border-l-transparent'
              }`}
              onClick={() => handleSelectChat(conv)}
            >
              <img
                src={
                  conv?.otherParticipant?.avatar ||
                  'https://bom.edu.vn/public/upload/2024/12/ad06bd849ba4028c25ede6b743be3a64.webp'
                }
                alt={conv?.otherParticipant?.displayName}
                className='w-14 h-14 rounded-full object-cover flex-shrink-0'
              />
              <div className='flex-1 min-w-0'>
                <h4 className='text-sm font-medium text-black'>
                  {conv?.otherParticipant?.displayName}
                </h4>
                <p className='text-xs text-gray-600 truncate'>
                  {conv.lastMessage?.senderId === currentUser._id && 'Bạn: '}
                  {conv.lastMessage?.message || 'Bắt đầu cuộc trò chuyện'}
                </p>
              </div>
              <span className='text-xs text-gray-600 flex-shrink-0'>
                {conv.lastMessage &&
                  new Date(conv.lastMessage.createdAt).toLocaleTimeString(
                    'vi-VN',
                    { hour: '2-digit', minute: '2-digit' }
                  )}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div
        className={`${
          !selectedConversation ? 'hidden md:flex' : 'flex'
        } flex-1 flex-col bg-white`}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className='flex justify-between items-center px-4 md:px-5 py-3 border-b border-gray-200 bg-white'>
              <div className='flex items-center gap-3'>
                <button
                  onClick={handleBackToList}
                  className='md:hidden p-2 hover:bg-gray-100 rounded-full transition'
                >
                  <ChevronLeft size={24} />
                </button>
                <img
                  src={
                    selectedConversation?.otherParticipant?.avatar ||
                    'https://bom.edu.vn/public/upload/2024/12/ad06bd849ba4028c25ede6b743be3a64.webp'
                  }
                  alt={selectedConversation.otherParticipant.displayName}
                  className='w-10 h-10 rounded-full object-cover'
                />
                <div>
                  <h3 className='text-sm font-semibold text-black'>
                    {selectedConversation.otherParticipant.displayName}
                  </h3>
                  <p className='text-xs text-gray-600'>Đang hoạt động</p>
                </div>
              </div>
              <button className='p-2 hover:bg-gray-100 rounded-full transition'>
                <MoreVertical size={20} />
              </button>
            </div>

            {/* Messages Display */}
            <div className='flex-1 overflow-y-auto px-4 md:px-5 py-4'>
              {isLoadingMessages ? (
                <div className='flex justify-center items-center h-full'>
                  <p>Đang tải tin nhắn...</p>
                </div>
              ) : (
                <div className='flex flex-col gap-2'>
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`flex items-end gap-2 ${
                        msg.senderId === currentUser._id
                          ? 'justify-end'
                          : 'justify-start'
                      } animate-in fade-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md px-4 py-2.5 rounded-2xl shadow-sm ${
                          msg.senderId === currentUser._id
                            ? msg.isTemp
                              ? 'bg-blue-300 text-white rounded-br-sm opacity-70' // Kiểu dáng cho tin nhắn tạm
                              : 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-sm'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                        }`}
                      >
                        {msg.imageUrl && (
                          <img
                            src={msg.imageUrl}
                            alt='Sent image'
                            className='rounded-lg mb-2 max-w-full h-auto'
                          />
                        )}
                        {msg.message && (
                          <p className='text-sm break-words'>{msg.message}</p>
                        )}
                        <span
                          className={`text-xs block mt-1 ${
                            msg.senderId === currentUser._id
                              ? 'text-blue-100'
                              : 'text-gray-600'
                          }`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Message Input Area */}
            <div className='px-4 md:px-5 py-4 border-t border-gray-200 bg-white'>
              {/* Image Preview */}
              {previewUrl && (
                <div className='relative mb-3 w-20 h-20'>
                  <img
                    src={previewUrl}
                    alt='preview'
                    className='w-full h-full rounded-lg object-cover'
                  />
                  <button
                    onClick={() => setPreviewUrl('')}
                    className='absolute -top-2 -right-2 w-6 h-6 bg-gray-700 text-white rounded-full flex items-center justify-center hover:bg-gray-900 transition text-lg'
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Input Container */}
              <form
                onSubmit={handleSendMessage}
                className='flex gap-2 md:gap-3 items-end'
              >
                {/* Image Upload Button */}
                <label
                  htmlFor='image-upload'
                  className='cursor-pointer flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition text-blue-500 flex-shrink-0'
                >
                  <ImageIcon size={20} />
                  <input
                    id='image-upload'
                    type='file'
                    accept='image/*'
                    onChange={handleImageSelect}
                    className='hidden'
                  />
                </label>

                {/* Text Input */}
                <input
                  type='text'
                  placeholder='Nhập tin nhắn...'
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      handleSendMessage(e)
                    }
                  }}
                  className='flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500 transition font-sans'
                />

                {/* Send Button */}
                <button
                  type='submit'
                  onClick={handleSendMessage}
                  className='flex items-center justify-center w-9 h-9 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition flex-shrink-0 disabled:bg-gray-300'
                  disabled={!messageInput.trim()}
                >
                  {isUploadingImage ? (
                    <Loader2 size={20} className='animate-spin' />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className='hidden md:flex flex-col items-center justify-center h-full text-gray-500'>
            <p className='text-lg'>Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPage
