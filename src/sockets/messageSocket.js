import { io } from 'socket.io-client'
import { useAuthStore } from '@/stores/useAuthStore'

let socket = null

/**
 * Khởi tạo kết nối Socket.IO với server.
 * Lấy accessToken từ store để xác thực.
 */
export const initializeSocket = () => {
  // Ngắt kết nối socket cũ nếu có để tránh tạo nhiều kết nối

  if (socket) {
    socket.disconnect()
  }

  const accessToken = useAuthStore.getState().accessToken
  console.log('👉 AccessToken gửi lên socket:', accessToken)

  // Chỉ khởi tạo socket nếu người dùng đã đăng nhập (có accessToken)
  if (!accessToken) {
    console.log('Socket not initialized: User is not authenticated.')
    return
  }

  // URL của backend server, bạn có thể đưa vào file .env để dễ quản lý
  const SOCKET_URL = 'http://localhost:8017'

  socket = io(SOCKET_URL, {
    // Server middleware đang mong đợi token trong `auth` payload
    auth: {
      token: accessToken
    }
  })
  console.log('socket đang nghe')
  socket.on('connect', () => {
    console.log('Socket connected successfully:', socket.id)
  })

  socket.on('disconnect', () => {
    console.log('Socket disconnected.')
  })
  socket.on('connect_error', (err) =>
    console.log('❌ Socket connect_error:', err.message)
  )
}

/**
 * Lấy instance của socket đã được khởi tạo.
 */
export const getSocket = () => socket

/**
 * Ngắt kết nối socket hiện tại.
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
