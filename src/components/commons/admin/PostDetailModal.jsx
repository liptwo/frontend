import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Eye, Loader2, XCircle, Archive } from 'lucide-react'
import { Link } from 'react-router-dom'

const formatPrice = (price) => {
  if (!price) return 'Thương lượng'
  return parseInt(price).toLocaleString('vi-VN') + ' VNĐ'
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
  EXPIRED: 'Đã ẩn',
  DELETED: 'Đã xóa'
}

export function PostDetailModal({
  post,
  open,
  onClose,
  onApprove,
  onReject,
  onHide,
  isActionLoading
}) {
  if (!post) return null

  const isCurrentPostLoading = isActionLoading && isActionLoading === post._id

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-2xl max-h-[90vh] flex flex-col'>
        <DialogHeader>
          <DialogTitle className='text-2xl'>{post.title}</DialogTitle>
          <DialogDescription>
            Đăng bởi: {post.seller?.displayName || 'N/A'} -{' '}
            {new Date(post.createdAt).toLocaleString('vi-VN')}
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-y-auto pr-4 -mr-4 space-y-4'>
          <div className='flex justify-between items-center'>
            <p className='text-2xl font-bold text-primary'>
              {formatPrice(post.price)}
            </p>
            <Badge
              className={STATUS_STYLES[post.status] || STATUS_STYLES.PENDING}
            >
              {STATUS_LABELS[post.status] || 'Không xác định'}
            </Badge>
          </div>

          {post.images && post.images.length > 0 && (
            <div className='grid grid-cols-3 gap-2'>
              {post.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Post image ${index + 1}`}
                  className='w-full h-32 object-cover rounded-md'
                />
              ))}
            </div>
          )}

          <div className='prose max-w-none'>
            <h4>Mô tả chi tiết</h4>
            <p
              dangerouslySetInnerHTML={{
                __html: post.description.replace(/\n/g, '<br />')
              }}
            />
          </div>
          <p className='text-sm text-muted-foreground '>
            Vị trí: {post?.location || 'N/A'}
          </p>
          {post.status === 'REJECTED' && post.rejectionReason && (
            <div className='p-2 bg-red-50 border border-red-200 rounded-md'>
              <p className='text-sm text-red-700'>
                <span className='font-bold'>Lý do từ chối:</span>{' '}
                {post.rejectionReason}
              </p>
            </div>
          )}
        </div>

        <DialogFooter className='pt-4 border-t flex-wrap justify-between sm:justify-between'>
          <div className='flex gap-2'>
            {post.status === 'PENDING' && (
              <>
                <Button
                  className='bg-green-600 hover:bg-green-700'
                  onClick={() => onApprove(post._id)}
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
                  variant='destructive'
                  onClick={() => onReject(post)}
                  disabled={isCurrentPostLoading}
                >
                  <XCircle className='mr-2 h-4 w-4' />
                  Từ chối
                </Button>
              </>
            )}
            {post.status === 'PUBLISHED' && (
              <Button
                variant='outline'
                onClick={() => onHide(post)}
                disabled={isCurrentPostLoading}
              >
                {isCurrentPostLoading ? (
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                ) : (
                  <Archive className='mr-2 h-4 w-4' />
                )}
                Ẩn bài đăng
              </Button>
            )}
          </div>
          <Button variant='secondary' asChild>
            <Link to={`/post/${post._id}`} target='_blank'>
              <Eye className='mr-2 h-4 w-4' />
              Xem trang công khai
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
