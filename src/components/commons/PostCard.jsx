'use client'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, Eye, Heart, Loader2 } from 'lucide-react'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

const conditionToText = (condition) => {
  if (condition === 'new') return 'Mới'
  if (condition === 'like_new') return 'Như mới'
  if (condition === 'used') return 'Đã qua sử dụng'
  return null
}

export function PostCard({
  post,
  onFavorite,
  isFavorited = false,
  isLoading = false,
  viewMode = 'grid'
}) {
  const navigate = useNavigate()
  const [isImageLoading, setIsImageLoading] = useState(true)

  const handleCardClick = () => {
    navigate(`/post/${post._id}`)
  }

  const handleFavoriteClick = (e) => {
    e.stopPropagation()
    onFavorite?.(post._id)
  }

  if (viewMode === 'grid') {
    return (
      <Card
        className='group cursor-pointer overflow-hidden border border-gray-200/50 hover:border-gray-300 rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-1.5 bg-white'
        onClick={handleCardClick}
      >
        {/* Image Container */}
        <div className='relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50'>
          {post.images && post.images.length > 0 ? (
            <>
              {isImageLoading && (
                <div className='absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse' />
              )}
              <img
                src={post.images[0] || '/placeholder.svg'}
                alt={post.title}
                className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out'
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
                loading='lazy'
              />
            </>
          ) : (
            <div className='w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center'>
              <span className='text-gray-400 text-sm font-medium'>
                Không có hình ảnh
              </span>
            </div>
          )}

          {/* Gradient Overlay */}
          <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500' />

          {/* Time Badge */}
          <div className='absolute z-0 top-3 left-3 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg'>
            {dayjs(post.createdAt).fromNow()}
          </div>

          {/* Featured Badge */}
          {post.isFeatured && (
            <div className='absolute z-0 top-3 left-3 mt-10 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg  flex items-center gap-1'>
              <span>⭐</span>
              <span>Nổi bật</span>
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            disabled={isLoading}
            className='absolute top-3 right-3 w-10 h-10 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 z-0'
          >
            {isLoading ? (
              <Loader2 className='w-5 h-5 text-gray-600 animate-spin' />
            ) : (
              <Heart
                className={`w-5 h-5 transition-all ${
                  isFavorited
                    ? 'fill-red-500 text-red-500 scale-110'
                    : 'text-gray-600 hover:text-red-500'
                }`}
              />
            )}
          </button>

          {/* Image Count */}
          {post.images && post.images.length > 1 && (
            <div className='absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-lg'>
              {post.images.length} ảnh
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className='p-4 space-y-3'>
          {/* Title */}
          <h3 className='font-bold text-gray-900 line-clamp-2 text-base leading-snug min-h-[48px] group-hover:text-gray-700 transition-colors'>
            {post.title}
          </h3>

          {/* Price */}
          <div className='bg-gradient-to-r from-red-50 via-red-100 to-orange-50 rounded-xl px-4 py-2.5 shadow-sm border border-red-100'>
            <p className='text-red-600 font-bold text-xl'>
              {typeof post.price === 'number'
                ? `${post.price.toLocaleString()} đ`
                : 'Thỏa thuận'}
            </p>
          </div>

          {/* Badges Row */}
          <div className='flex flex-wrap gap-2'>
            {post.category && (
              <Badge
                variant='secondary'
                className='bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 font-medium text-xs'
              >
                {post.category.name}
              </Badge>
            )}
            {post.condition && (
              <Badge
                variant='secondary'
                className='bg-green-50 text-green-700 border-green-200 hover:bg-green-100 font-medium text-xs'
              >
                {conditionToText(post.condition)}
              </Badge>
            )}
          </div>

          {/* Description */}
          {post.description && (
            <p className='text-gray-600 text-sm line-clamp-2 leading-relaxed'>
              {post.description}
            </p>
          )}

          {/* Location */}
          <div className='flex items-center gap-2 text-gray-600 pt-2 border-t border-gray-100'>
            <MapPin className='w-4 h-4 flex-shrink-0 text-red-500' />
            <span className='text-sm truncate font-medium'>
              {post.location || 'Chưa có địa chỉ'}
            </span>
          </div>
        </CardContent>

        {/* Footer */}
        <CardFooter className='p-4 pt-0 flex items-center justify-between'>
          {/* Seller Info */}
          <div className='flex items-center gap-2 min-w-0'>
            <div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 ring-2 ring-gray-100'>
              {post.seller?.avatar ? (
                <img
                  src={post.seller.avatar || '/placeholder.svg'}
                  alt={post.seller.username}
                  className='w-full h-full rounded-full object-cover'
                />
              ) : (
                <span className='text-xs text-white font-bold'>
                  {post.seller?.username?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <span className='text-sm text-gray-700 truncate font-medium'>
              {post.seller?.username || 'Người bán'}
            </span>
          </div>

          {/* View Count */}
          <div className='flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded-full'>
            <Eye className='w-4 h-4 text-gray-500' />
            <span className='text-xs font-semibold text-gray-700'>
              {post.views || 0}
            </span>
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card
      className='cursor-pointer hover:shadow-lg transition-all duration-300 flex flex-row overflow-hidden border border-gray-200/50 hover:border-gray-300 rounded-xl bg-white'
      onClick={handleCardClick}
    >
      {/* Image Container */}
      <div className='relative w-52 flex-shrink-0'>
        <div className='relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50'>
          {post.images && post.images.length > 0 ? (
            <>
              {isImageLoading && (
                <div className='absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-100 animate-pulse' />
              )}
              <img
                src={post.images[0] || '/placeholder.svg'}
                alt={post.title}
                className='w-full h-full object-cover hover:scale-105 transition-transform duration-500'
                onLoad={() => setIsImageLoading(false)}
                onError={() => setIsImageLoading(false)}
                loading='lazy'
              />
            </>
          ) : (
            <div className='w-full h-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center'>
              <span className='text-gray-400 text-xs'>Không có ảnh</span>
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            disabled={isLoading}
            className='absolute top-2 right-2 w-9 h-9 bg-white/95 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white hover:scale-110 active:scale-95 transition-all shadow-lg disabled:opacity-50 z-10'
          >
            {isLoading ? (
              <Loader2 className='w-4 h-4 text-gray-600 animate-spin' />
            ) : (
              <Heart
                className={`w-4 h-4 ${
                  isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-600'
                }`}
              />
            )}
          </button>

          {/* Image Count Badge */}
          {post.images && post.images.length > 1 && (
            <div className='absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-xs px-2 py-1 rounded-full'>
              {post.images.length}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className='flex-1 flex flex-col p-4'>
        {/* Title & Price */}
        <div className='flex-1 space-y-2'>
          <h3 className='font-bold text-gray-900 line-clamp-1 text-base'>
            {post.title}
          </h3>

          <div className='bg-gradient-to-r from-red-50 to-orange-50 rounded-lg px-3 py-1.5 inline-block'>
            <p className='text-red-600 font-bold text-lg'>
              {typeof post.price === 'number'
                ? `${post.price.toLocaleString()} đ`
                : 'Thỏa thuận'}
            </p>
          </div>

          {/* Badges */}
          <div className='flex flex-wrap gap-2'>
            {post.category && (
              <Badge
                variant='secondary'
                className='bg-blue-50 text-blue-700 border-blue-200 text-xs'
              >
                {post.category.name}
              </Badge>
            )}
            {post.condition && (
              <Badge
                variant='secondary'
                className='bg-green-50 text-green-700 border-green-200 text-xs'
              >
                {conditionToText(post.condition)}
              </Badge>
            )}
          </div>

          {/* Description */}
          {post.description && (
            <p className='text-gray-600 text-sm line-clamp-1'>
              {post.description}
            </p>
          )}
        </div>

        {/* Footer Info */}
        <div className='flex items-center justify-between pt-3 border-t border-gray-100 mt-3'>
          <div className='flex items-center gap-2'>
            <MapPin className='w-4 h-4 text-red-500 flex-shrink-0' />
            <span className='text-xs text-gray-600 truncate'>
              {post.location || 'Chưa có địa chỉ'}
            </span>
          </div>

          <div className='flex items-center gap-3 text-xs text-gray-500'>
            <div className='flex items-center gap-1'>
              <Calendar className='w-3.5 h-3.5' />
              <span>{dayjs(post.createdAt).fromNow()}</span>
            </div>
            <div className='flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full'>
              <Eye className='w-3.5 h-3.5' />
              <span className='font-semibold'>{post.views || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

function PostCardSkeleton({ viewMode = 'grid' }) {
  if (viewMode === 'grid') {
    return (
      <Card className='overflow-hidden rounded-2xl animate-pulse border border-gray-200'>
        <div className='aspect-square bg-gradient-to-br from-gray-200 to-gray-100' />
        <CardContent className='p-4 space-y-3'>
          <div className='h-12 bg-gray-200 rounded-lg w-full' />
          <div className='h-12 bg-gradient-to-r from-gray-200 to-gray-100 rounded-xl w-3/4' />
          <div className='flex gap-2'>
            <div className='h-6 bg-gray-200 rounded-full w-20' />
            <div className='h-6 bg-gray-200 rounded-full w-16' />
          </div>
          <div className='h-10 bg-gray-100 rounded w-full' />
          <div className='h-4 bg-gray-200 rounded w-2/3' />
        </CardContent>
        <CardFooter className='p-4 pt-0 flex justify-between'>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-gray-200 rounded-full' />
            <div className='h-4 bg-gray-200 rounded w-20' />
          </div>
          <div className='h-6 bg-gray-200 rounded-full w-12' />
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className='flex flex-row overflow-hidden rounded-xl animate-pulse border border-gray-200'>
      <div className='w-52 aspect-square bg-gradient-to-br from-gray-200 to-gray-100' />
      <CardContent className='flex-1 p-4 space-y-3'>
        <div className='h-6 bg-gray-200 rounded w-3/4' />
        <div className='h-10 bg-gradient-to-r from-gray-200 to-gray-100 rounded-lg w-1/2' />
        <div className='flex gap-2'>
          <div className='h-5 bg-gray-200 rounded-full w-16' />
          <div className='h-5 bg-gray-200 rounded-full w-12' />
        </div>
        <div className='h-4 bg-gray-100 rounded w-full' />
        <div className='flex justify-between pt-2'>
          <div className='h-4 bg-gray-200 rounded w-24' />
          <div className='h-4 bg-gray-200 rounded w-20' />
        </div>
      </CardContent>
    </Card>
  )
}

PostCard.Skeleton = PostCardSkeleton
