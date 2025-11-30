import React from 'react'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Heart,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Share2,
  MoreVertical,
  MapPin,
  Clock,
  Phone
} from 'lucide-react'
import { getRelativeTime } from '@/helper'
import { toast } from 'sonner'
import {
  addFavoriteAPI,
  findOrCreateConversationAPI,
  getListingDetailsAPI,
  removeFavoriteAPI
} from '@/apis'
import { useAuthStore } from '@/stores/useAuthStore'
import { useNavigate } from 'react-router-dom'

const conditionToText = (condition) => {
  if (condition === 'new') return 'Mới'
  if (condition === 'like_new') return 'Như mới'
  if (condition === 'used') return 'Đã qua sử dụng'
  return 'Không rõ'
}

export default function ProductDetailPage() {
  const { id } = useParams()
  const { user: infoUs } = useAuthStore()
  const navigate = useNavigate()
  const [currentImageIdx, setCurrentImageIdx] = useState(0)
  const [showPhone, setShowPhone] = useState(false)
  const isAuthenticated = Boolean(infoUs)
  const archivedIds = infoUs?.favorites || []
  const [isArchived, setIsArchived] = useState(archivedIds.includes(id))
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const [listingDetail, setListingDetail] = useState(null)

  const getListingDetails = async () => {
    try {
      setIsLoading(true)
      setIsError(false)
      const res = await getListingDetailsAPI(id)
      setListingDetail(res)
    } catch (error) {
      console.log(error)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getListingDetails()
  }, [])

  useEffect(() => {
    if (infoUs?.favorites && id) {
      setIsArchived(infoUs.favorites.includes(id))
    }
  }, [infoUs, id])

  if (isLoading)
    return (
      <main className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8'>
        <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Gallery skeleton */}
            <div className='lg:col-span-2'>
              <div className='bg-white rounded-2xl shadow-sm overflow-hidden p-6 animate-pulse'>
                <div className='relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200' />
                <div className='flex mt-4 gap-3'>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className='w-20 h-20 rounded-lg bg-gray-200' />
                  ))}
                </div>
              </div>

              {/* Description skeleton */}
              <div className='mt-6 bg-white rounded-2xl shadow-sm p-6 animate-pulse'>
                <div className='h-6 bg-gray-200 rounded w-1/3 mb-4' />
                <div className='space-y-3'>
                  <div className='h-4 bg-gray-100 rounded w-full' />
                  <div className='h-4 bg-gray-100 rounded w-5/6' />
                  <div className='h-4 bg-gray-100 rounded w-4/6' />
                </div>
              </div>
            </div>

            {/* Info skeleton */}
            <div className='lg:col-span-1'>
              <div className='bg-white rounded-2xl shadow-sm p-6 sticky top-6 animate-pulse space-y-5'>
                <div className='h-8 bg-gray-200 rounded w-3/4' />
                <div className='h-10 bg-gray-200 rounded w-1/2' />
                <div className='h-4 bg-gray-100 rounded w-2/3' />
                <div className='h-12 bg-gray-200 rounded w-full' />
                <div className='h-12 bg-gray-200 rounded w-full' />
              </div>
            </div>
          </div>
        </div>
      </main>
    )

  const post = listingDetail

  if (isError || !post)
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <p className='text-gray-600 text-lg'>
            Không tìm thấy bài đăng hoặc đã có lỗi xảy ra.
          </p>
        </div>
      </div>
    )

  const mainImage = post.images?.[currentImageIdx] || '/placeholder.svg'
  const thumbnails = post.images || []
  const user = post.seller || {}
  const userPhone = user.phone || ''
  const phoneMasked = userPhone
    ? userPhone.replace(/(\d{4})\d{3}(\d{3})/, '$1***$2')
    : ''

  const handlePrev = () => {
    setCurrentImageIdx((prev) =>
      prev === 0 ? thumbnails.length - 1 : prev - 1
    )
  }

  const handleNext = () => {
    setCurrentImageIdx((prev) =>
      prev === thumbnails.length - 1 ? 0 : prev + 1
    )
  }

  const saved = async () => {
    try {
      await addFavoriteAPI(post._id)
      archivedIds.push(post._id)
      setIsArchived(true)
      toast.success('Đã thêm vào danh sách yêu thích!')
    } catch (error) {
      console.log(error)
      toast.error('Có lỗi xảy ra, vui lòng thử lại.')
    }
  }

  const remove = async () => {
    try {
      await removeFavoriteAPI(post._id)
      archivedIds.splice(archivedIds.indexOf(post._id), 1)
      setIsArchived(false)
      toast.success('Đã xóa khỏi danh sách yêu thích!')
    } catch (error) {
      console.log(error)
      toast.error('Có lỗi xảy ra, vui lòng thử lại.')
    }
  }

  return (
    <main className='min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8'>
      <div className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Left Column - Gallery and Description */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Gallery */}
            <div className='bg-white rounded-2xl shadow-sm overflow-hidden'>
              <div className='p-6'>
                <div className='relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 group'>
                  <img
                    src={mainImage || '/placeholder.svg'}
                    alt={post.title}
                    className='object-cover w-full h-full transition-transform duration-300 group-hover:scale-105'
                  />

                  {thumbnails.length > 1 && (
                    <>
                      <button
                        className='absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100'
                        onClick={handlePrev}
                      >
                        <ChevronLeft className='h-5 w-5 text-gray-700' />
                      </button>
                      <button
                        className='absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 transition-all duration-200 opacity-0 group-hover:opacity-100'
                        onClick={handleNext}
                      >
                        <ChevronRight className='h-5 w-5 text-gray-700' />
                      </button>
                    </>
                  )}

                  <div className='absolute top-4 right-4 flex gap-2'>
                    <button className='bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-2 shadow-lg transition-all duration-200'>
                      <Share2 className='h-4 w-4 text-gray-700' />
                    </button>
                    <button className='bg-white/90 hover:bg-white backdrop-blur-sm rounded-full p-2 shadow-lg transition-all duration-200'>
                      <MoreVertical className='h-4 w-4 text-gray-700' />
                    </button>
                  </div>

                  {thumbnails.length > 0 && (
                    <div className='absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium'>
                      {currentImageIdx + 1} / {thumbnails.length}
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                {thumbnails.length > 1 && (
                  <div className='flex mt-4 gap-3 overflow-x-auto pb-2'>
                    {thumbnails.map((url, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIdx(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          index === currentImageIdx
                            ? 'border-blue-500 shadow-md scale-105'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <img
                          src={url || '/placeholder.svg'}
                          alt={`Thumbnail ${index + 1}`}
                          className='w-full h-full object-cover'
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className='bg-white rounded-2xl shadow-sm p-6'>
              <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                <span className='w-1 h-6 bg-blue-500 rounded-full'></span>
                Mô tả chi tiết
              </h2>
              <p className='text-gray-700 leading-relaxed whitespace-pre-line'>
                {post.description}
              </p>
            </div>

            {/* Product Details */}
            <div className='bg-white rounded-2xl shadow-sm p-6'>
              <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                <span className='w-1 h-6 bg-blue-500 rounded-full'></span>
                Thông tin chi tiết
              </h2>
              <div className='space-y-3'>
                <div className='flex justify-between items-center py-3 border-b border-gray-100'>
                  <span className='text-gray-600 font-medium'>Danh mục</span>
                  <span className='text-gray-900 font-semibold'>
                    {post?.categoryId || 'Không rõ'}
                  </span>
                </div>
                <div className='flex justify-between items-center py-3'>
                  <span className='text-gray-600 font-medium'>Tình trạng</span>
                  <span className='text-gray-900 font-semibold'>
                    {conditionToText(post?.condition)}
                  </span>
                </div>
              </div>
            </div>

            {/* Comments */}
            <div className='bg-white rounded-2xl shadow-sm p-6'>
              <h2 className='text-xl font-bold text-gray-900 mb-4 flex items-center gap-2'>
                <span className='w-1 h-6 bg-blue-500 rounded-full'></span>
                Bình luận
              </h2>
              <p className='text-gray-500 text-center py-8'>
                Chưa có bình luận nào.
              </p>
            </div>
          </div>

          {/* Right Column - Product Info */}
          <div className='lg:col-span-1'>
            <div className='bg-white rounded-2xl shadow-sm p-6 sticky top-6 space-y-5'>
              {/* Title and Favorite */}
              <div className='flex justify-between items-start gap-4'>
                <h1 className='text-2xl font-bold text-gray-900 leading-tight flex-1'>
                  {post.title}
                </h1>
                <button
                  className={`flex-shrink-0 p-2 rounded-full transition-all duration-200 ${
                    archivedIds.includes(post._id)
                      ? 'bg-red-50 hover:bg-red-100'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (!isAuthenticated) {
                      toast.info('Bạn cần đăng nhập để yêu thích sản phẩm.')
                      return
                    }
                    if (archivedIds.includes(post._id)) {
                      remove()
                    } else {
                      saved()
                    }
                  }}
                >
                  <Heart
                    className={`w-5 h-5 ${
                      archivedIds.includes(post._id)
                        ? 'text-red-500 fill-red-500'
                        : 'text-gray-600'
                    }`}
                  />
                </button>
              </div>

              {/* Category */}
              <div className='inline-block px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium'>
                {post?.categoryId || 'Chưa phân loại'}
              </div>

              {/* Price */}
              <div className='py-4 px-5 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl'>
                <p className='text-sm text-gray-600 mb-1'>Giá bán</p>
                <p className='text-3xl font-bold text-red-600'>
                  {post.price.toLocaleString()} đ
                </p>
              </div>

              {/* Location and Time */}
              <div className='space-y-3 pt-2'>
                <div className='flex items-center gap-3 text-gray-600'>
                  <MapPin className='w-5 h-5 text-gray-400 flex-shrink-0' />
                  <span className='text-sm'>
                    {post?.location || 'Toàn quốc'}
                  </span>
                </div>
                <div className='flex items-center gap-3 text-gray-600'>
                  <Clock className='w-5 h-5 text-gray-400 flex-shrink-0' />
                  <span className='text-sm'>
                    Cập nhật {getRelativeTime(post.updatedAt)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='space-y-3 pt-4'>
                {userPhone && (
                  <button
                    className='w-full py-3 px-4 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-800 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md'
                    onClick={() => {
                      if (!isAuthenticated) {
                        toast.info('Bạn cần đăng nhập để xem số điện thoại.')
                        return
                      }
                      if (!showPhone) setShowPhone(true)
                    }}
                  >
                    <Phone className='w-5 h-5' />
                    {showPhone ? userPhone : `${phoneMasked}`}
                  </button>
                )}
                <button
                  className='w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl'
                  onClick={() => {
                    if (!isAuthenticated) {
                      toast('Bạn cần đăng nhập để nhắn tin.')
                      navigate('/login')
                      return
                    }
                    const handleChat = async () => {
                      if (!post?.seller?._id) {
                        return toast.error(
                          'Không tìm thấy thông tin người bán.'
                        )
                      }
                      await findOrCreateConversationAPI(post.seller._id)
                      navigate(`/messages?user=${post.seller._id}`)
                    }
                    handleChat()
                  }}
                >
                  <MessageSquare className='w-5 h-5' />
                  Nhắn tin ngay
                </button>
              </div>

              {/* Seller Info */}
              <div className='pt-5 border-t border-gray-200'>
                <p className='text-sm text-gray-600 mb-3 font-medium'>
                  Người bán
                </p>
                {/* <div className='flex items-center gap-3'></div> */}
                <div className='flex items-center gap-2 min-w-0'>
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 ring-2 ring-gray-100'>
                    {user?.avatar ? (
                      <img
                        src={user?.avatar || '/placeholder.svg'}
                        alt={user?.username}
                        className='w-full h-full rounded-full object-cover'
                      />
                    ) : (
                      <span className='text-xs text-white font-bold'>
                        {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className='font-semibold text-gray-900'>
                      {user?.username || 'Người bán'}
                    </p>
                    <p
                      className='text-sm text-gray-500 cursor-pointer hover:underline'
                      onClick={() => navigate(`/user/${user._id}`)}
                    >
                      Xem trang
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
