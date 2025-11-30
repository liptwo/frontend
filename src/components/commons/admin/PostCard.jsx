import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import React from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Link } from 'react-router-dom'
const formatPrice = (price) => {
  if (!price) return ''
  return parseInt(price).toLocaleString('vi-VN')
}
const STATUS_STYLES = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PUBLISHED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-100 text-gray-800',
  DELETED: 'bg-gray-100 text-gray-800'
}

const STATUS_LABELS = {
  PENDING: 'Chờ duyệt',
  PUBLISHED: 'Đã đăng',
  REJECTED: 'Bị từ chối',
  EXPIRED: 'Hết hạn',
  DELETED: 'Đã xóa'
}

export function PostCard({
  post,
  onApprove,
  onReject,
  onViewDetails,
  isApproving,
  isApprovingPostId
}) {
  const isCurrentPostLoading = isApproving && isApprovingPostId === post._id

  return (
    <div
      className='rounded-lg border bg-card text-card-foreground shadow-sm flex flex-col cursor-pointer hover:shadow-md transition-shadow'
      onClick={() => onViewDetails(post)}
    >
      <img
        src={
          post.images?.[0] ||
          'https://via.placeholder.com/400x300?text=No+Image'
        }
        alt={post.title}
        className='w-full h-40 object-cover rounded-t-lg'
      />

      <div className='p-4 flex-1 flex flex-col'>
        <div className='flex justify-between items-start mb-2'>
          <h3 className='font-semibold leading-none tracking-tight text-lg flex-1 mr-2'>
            <Link
              to={`/listings/${post._id}`}
              target='_blank'
              rel='noopener noreferrer'
              className='hover:underline'
              onClick={(e) => e.stopPropagation()}
            >
              {post.title}
            </Link>
          </h3>
          <Badge
            className={STATUS_STYLES[post.status] || STATUS_STYLES.PENDING}
          >
            {STATUS_LABELS[post.status] || 'Không xác định'}
          </Badge>
        </div>
        <p className='text-lg text-red-500 font-bold text-primary mb-2'>
          {formatPrice(post.price)} VNĐ
        </p>
        <p className='text-sm text-muted-foreground mb-4'>
          Đăng bởi: {post.seller?.displayName || 'N/A'}
        </p>
        <p className='text-sm text-muted-foreground '>
          Vị trí: {post?.location || 'N/A'}
        </p>
        {post.status === 'REJECTED' && post.rejectionReason && (
          <div className='mb-4 p-2 bg-red-50 border border-red-200 rounded-md'>
            <p className='text-sm text-red-700'>
              <span className='font-bold'>Lý do từ chối:</span>{' '}
              {post.rejectionReason}
            </p>
          </div>
        )}
        <div className='mt-auto pt-4 border-t'>
          {post.status === 'PENDING' ? (
            <div className='flex gap-2'>
              <Button
                size='sm'
                className='flex-1 bg-green-600 hover:bg-green-700'
                onClick={(e) => {
                  e.stopPropagation()
                  onApprove(post._id)
                }}
                disabled={isCurrentPostLoading}
              >
                {isCurrentPostLoading ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <CheckCircle className='mr-2 h-4 w-4' />
                )}
                Duyệt
              </Button>
              <Button
                size='sm'
                variant='destructive'
                className='flex-1'
                onClick={(e) => {
                  e.stopPropagation()
                  onReject(post)
                }}
                disabled={isCurrentPostLoading}
              >
                <XCircle className='mr-2 h-4 w-4' />
                Từ chối
              </Button>
            </div>
          ) : (
            <p className='text-xs text-center text-gray-500'>
              Không có hành động nào
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
