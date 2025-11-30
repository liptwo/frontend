'use client'

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/useAuthStore'
import { addFavoriteAPI, removeFavoriteAPI } from '@/apis'
import { PostCard } from './commons/PostCard'
import { Loader2 } from 'lucide-react'

// interface ListSpProps {
//   filteredProducts: Array<{
//     _id: string
//     title: string
//     price: number
//     description?: string
//     images?: string[]
//     location?: string
//     updatedAt: string
//     seller?: {
//       displayName?: string
//     }
//     views?: number
//   }>
//   isLoading?: boolean
//   onLoadMore?: () => void
//   hasMore?: boolean
// }

function ProductSkeleton() {
  return (
    <div className='bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse'>
      <div className='aspect-square bg-gray-200' />
      <div className='p-4 space-y-3'>
        <div className='h-4 bg-gray-200 rounded w-3/4' />
        <div className='h-6 bg-gray-200 rounded w-1/2' />
        <div className='flex items-center gap-2'>
          <div className='h-3 bg-gray-200 rounded w-16' />
          <div className='h-3 bg-gray-200 rounded w-20' />
        </div>
      </div>
    </div>
  )
}

function ListSp({
  filteredProducts,
  isLoading = false,
  onLoadMore,
  hasMore = false
}) {
  const navigate = useNavigate()
  const { user: infoUs } = useAuthStore()
  const isAuthenticated = !!infoUs

  const [favorites, setFavorites] = React.useState(infoUs?.favorites || [])
  const [favoriteLoading, setFavoriteLoading] = React.useState(null)
  const [isLoadingMore, setIsLoadingMore] = React.useState(false)

  React.useEffect(() => {
    if (infoUs?.favorites) {
      setFavorites(infoUs.favorites)
    }
  }, [infoUs])

  const saved = async (id) => {
    if (favoriteLoading) return
    setFavoriteLoading(id)
    try {
      await addFavoriteAPI(id)
      setFavorites((prev) => [...prev, id])
      toast.success('Đã thêm vào yêu thích!')
    } catch (error) {
      console.log(error)
      toast.error('Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setFavoriteLoading(null)
    }
  }

  const remove = async (id) => {
    if (favoriteLoading) return
    setFavoriteLoading(id)
    try {
      await removeFavoriteAPI(id)
      setFavorites((prev) => prev.filter((favId) => favId !== id))
      toast.success('Đã xóa khỏi yêu thích!')
    } catch (error) {
      console.log(error)
      toast.error('Có lỗi xảy ra, vui lòng thử lại.')
    } finally {
      setFavoriteLoading(null)
    }
  }

  const handleLoadMore = async () => {
    if (!onLoadMore || isLoadingMore) return
    setIsLoadingMore(true)
    try {
      await onLoadMore()
    } finally {
      setIsLoadingMore(false)
    }
  }

  if (isLoading && filteredProducts.length === 0) {
    return (
      <div className='space-y-8'>
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-5'>
          {Array.from({ length: 10 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (!filteredProducts || filteredProducts.length === 0) {
    return (
      <div className='space-y-8'>
        <div className='col-span-full text-center py-20'>
          <div className='inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 mb-6 shadow-inner'>
            <svg
              className='w-10 h-10 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
              />
            </svg>
          </div>
          <h3 className='text-xl font-semibold text-gray-700 mb-2'>
            Không tìm thấy sản phẩm
          </h3>
          <p className='text-gray-500 text-sm max-w-sm mx-auto'>
            Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='space-y-8'>
      {/* Product Grid with stagger animation */}
      <div className='grid grid-cols-2 gap-4 md:grid-cols-3  lg:grid-cols-4 xl:grid-cols-5 md:gap-5'>
        {filteredProducts.map((product, index) => (
          <div
            key={product._id}
            className='animate-in fade-in slide-in-from-bottom-4'
            style={{
              animationDelay: `${index * 50}ms`,
              animationFillMode: 'backwards'
            }}
          >
            <PostCard
              post={product}
              viewMode='grid'
              isFavorited={favorites.includes(product._id)}
              isLoading={favoriteLoading === product._id}
              onFavorite={() => {
                if (!isAuthenticated) {
                  toast.info('Bạn cần đăng nhập để yêu thích sản phẩm.')
                  return
                }
                if (favorites.includes(product._id)) {
                  remove(product._id)
                } else {
                  saved(product._id)
                }
              }}
              onClick={() => navigate(`/product/${product._id}`)}
            />
          </div>
        ))}
      </div>

      {/* Load More Button with loading state */}
      {hasMore && (
        <div className='text-center pt-4'>
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className='group relative px-10 py-3.5 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
          >
            {isLoadingMore ? (
              <span className='flex items-center gap-2'>
                <Loader2 className='w-5 h-5 animate-spin' />
                Đang tải...
              </span>
            ) : (
              <span className='flex items-center gap-2'>
                Xem thêm sản phẩm
                <svg
                  className='w-5 h-5 transition-transform group-hover:translate-y-0.5'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M19 9l-7 7-7-7'
                  />
                </svg>
              </span>
            )}
          </button>
        </div>
      )}

      {/* Loading More Skeleton */}
      {isLoadingMore && (
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-5'>
          {Array.from({ length: 5 }).map((_, i) => (
            <ProductSkeleton key={`loading-${i}`} />
          ))}
        </div>
      )}
    </div>
  )
}

export default ListSp
