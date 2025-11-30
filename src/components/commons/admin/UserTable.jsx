import { Eye, Loader2, Pencil, Trash, UserX } from 'lucide-react'
import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { toast } from 'sonner'
import { GlobalPopup, useGlobalPopup } from '../popup'

export function UserTable({
  users,
  isLoading,
  pagination,
  onView,
  onEdit,
  onDelete,
  searchParams,
  setSearchParams
}) {
  const [deletingUserId, setDeletingUserId] = useState(null)

  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const { popupState, confirm, hidePopup } = useGlobalPopup()

  const setSearch = (value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('search', value)
      next.set('page', '1')
      return next
    })
  }

  const goToPage = (pageNum) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(pageNum))
      return next
    })
  }

  const handleDeleteUser = async (user) => {
    confirm(
      'Xóa người dùng',
      `Bạn chắc chắn muốn xóa "${user.displayName}"?`,
      async () => {
        setDeletingUserId(user._id)
        try {
          await onDelete(user._id)
        } catch (error) {
          // Error toast is handled in the parent component
        } finally {
          setDeletingUserId(null)
          hidePopup()
        }
      }
    )
  }

  return (
    <div className='space-y-4'>
      <GlobalPopup
        {...popupState.config}
        isOpen={popupState.isOpen}
        onClose={hidePopup}
      />
      <Input
        placeholder='Tìm kiếm theo tên, email, username...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='mb-4'
      />

      <div className='overflow-x-auto -mx-4 sm:mx-0'>
        <div className='inline-block min-w-full align-middle'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[50px]'>Avatar</TableHead>
                <TableHead className='min-w-[150px]'>Tên hiển thị</TableHead>
                <TableHead className='min-w-[180px]'>Email</TableHead>
                <TableHead className='min-w-[100px]'>Vai trò</TableHead>
                <TableHead className='w-[140px] text-right'>
                  Hành động
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className='flex h-24 justify-center items-center'>
                      <Loader2 className='animate-spin' />
                    </div>
                  </TableCell>
                </TableRow>
              ) : users.length > 0 ? (
                users.map((user) => (
                  <TableRow>
                    <TableRow key={user._id}>
                      <TableCell>
                        <img
                          src={user.avatar}
                          alt={user.displayName}
                          className='w-8 h-8 rounded-full object-cover'
                        />
                      </TableCell>
                      <TableCell className='font-medium'>
                        {user.displayName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell className='capitalize'>{user.role}</TableCell>
                      <TableCell className='text-right space-x-1'>
                        <Button
                          disabled={deletingUserId === user._id}
                          size='icon'
                          variant='outline'
                          onClick={() => onView(user)}
                        >
                          <Eye className='w-4 h-4' />
                        </Button>
                        <Button
                          disabled={deletingUserId === user._id}
                          size='icon'
                          variant='outline'
                          onClick={() => onEdit(user)}
                        >
                          <Pencil className='w-4 h-4' />
                        </Button>
                        <Button
                          disabled={deletingUserId === user._id}
                          size='icon'
                          variant='destructive'
                          onClick={() => handleDeleteUser(user)}
                        >
                          {deletingUserId === user._id ? (
                            <Loader2 className='animate-spin w-4 h-4' />
                          ) : (
                            <Trash className='w-4 h-4' />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className='text-center h-24 flex flex-col items-center justify-center'>
                      <UserX className='w-8 h-8 text-gray-400 mb-2' />
                      <p className='text-gray-500'>
                        Không tìm thấy người dùng.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className='flex flex-col sm:flex-row justify-between items-center gap-4 pt-4'>
          <Button
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
            variant='outline'
          >
            Trang trước
          </Button>
          <span className='text-sm text-gray-600'>
            Trang {page} / {pagination.totalPages}
          </span>
          <Button
            onClick={() => goToPage(page + 1)}
            disabled={page === pagination.totalPages}
            variant='outline'
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  )
}
