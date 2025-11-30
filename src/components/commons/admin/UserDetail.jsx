import dayjs from 'dayjs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import React from 'react'

// interface Props {
// 	user: IUser | null;
// 	open: boolean;
// 	onClose: () => void;
// }

export function UserDetail({ user, open, onClose }) {
  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chi tiết người dùng</DialogTitle>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='flex justify-center'>
            <img
              src={
                user.avatar ||
                'https://i.pinimg.com/736x/7d/0c/6b/7d0c6bc79cfa39153751c56433141483.jpg'
              }
              alt={user.displayName}
              className='w-24 h-24 rounded-full object-cover'
            />
          </div>

          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div>
              <div className='font-medium'>Tên</div>
              <div>{user.displayName}</div>
            </div>

            <div>
              <div className='font-medium'>Email</div>
              <div>{user.email}</div>
            </div>

            <div>
              <div className='font-medium'>Vai trò</div>
              <div className='capitalize'>{user.role}</div>
            </div>

            <div>
              <div className='font-medium'>Điện thoại</div>
              <div>{user.phoneNumber || '--'}</div>
            </div>

            <div>
              <div className='font-medium'>Giới tính</div>
              <div className='capitalize'>
                {user.gender?.toLowerCase() || '--'}
              </div>
            </div>

            <div>
              <div className='font-medium'>Ngày sinh</div>
              <div>
                {user.birthday
                  ? dayjs(user.birthday).format('DD/MM/YYYY')
                  : '--'}
              </div>
            </div>

            <div>
              <div className='font-medium'>Ngày tạo</div>
              <div>{dayjs(user.createdAt).format('DD/MM/YYYY')}</div>
            </div>

            <div className='col-span-2'>
              <div className='font-medium'>Địa chỉ</div>
              <div>{user.address || '--'}</div>
            </div>

            <div className='col-span-2'>
              <div className='font-medium'>Giới thiệu</div>
              <div>{user.bio || '--'}</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
