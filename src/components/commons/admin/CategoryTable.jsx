import { Eye, Loader2, Pencil, Trash, FolderX } from 'lucide-react'
import { useState } from 'react'

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
import { GlobalPopup, useGlobalPopup } from '../popup'
import React from 'react'

export function CategoryTable({
  categories,
  isLoading,
  pagination,
  onView,
  onEdit,
  onDelete,
  searchParams,
  setSearchParams
}) {
  const [deletingCategoryId, setDeletingCategoryId] = useState(null)
  const { popupState, confirm, hidePopup } = useGlobalPopup()

  const search = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)

  const setSearch = (value) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('search', value)
        next.set('page', '1')
        return next
      },
      { replace: true }
    )
  }

  const goToPage = (pageNum) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('page', String(pageNum))
      return next
    })
  }

  const handleDelete = async (category) => {
    confirm(
      'Xóa danh mục',
      `Bạn chắc chắn muốn xóa "${category.name}"?`,
      async () => {
        setDeletingCategoryId(category._id)
        try {
          await onDelete(category._id)
        } finally {
          setDeletingCategoryId(null)
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
        placeholder='Tìm kiếm tên danh mục...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className='mb-4'
      />

      <div className='overflow-x-auto -mx-4 sm:mx-0'>
        <div className='inline-block min-w-full align-middle'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='min-w-[200px]'>Tên danh mục</TableHead>
                <TableHead className='min-w-[150px]'>Mã</TableHead>
                <TableHead className='min-w-[150px]'>Danh mục cha</TableHead>
                <TableHead className='min-w-[180px]'>Ngày tạo</TableHead>
                <TableHead className='text-right w-[120px]'>
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
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className='font-medium'>
                      {category.name}
                    </TableCell>
                    <TableCell>{category.code || '--'}</TableCell>
                    <TableCell>{category.parentCode || '--'}</TableCell>
                    <TableCell>
                      {new Date(category.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className='text-right space-x-1'>
                      <Button
                        disabled={deletingCategoryId === category._id}
                        size='icon'
                        variant='outline'
                        onClick={() => onView(category)}
                      >
                        <Eye className='w-4 h-4' />
                      </Button>
                      <Button
                        disabled={deletingCategoryId === category._id}
                        size='icon'
                        variant='outline'
                        onClick={() => onEdit(category)}
                      >
                        <Pencil className='w-4 h-4' />
                      </Button>
                      <Button
                        disabled={deletingCategoryId === category._id}
                        size='icon'
                        variant='destructive'
                        onClick={() => handleDelete(category)}
                      >
                        {deletingCategoryId === category._id ? (
                          <Loader2 className='animate-spin w-4 h-4' />
                        ) : (
                          <Trash className='w-4 h-4' />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5}>
                    <div className='text-center h-24 flex flex-col items-center justify-center'>
                      <FolderX className='w-8 h-8 text-gray-400 mb-2' />
                      <p className='text-gray-500'>Không tìm thấy danh mục.</p>
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
            className='w-full sm:w-auto'
          >
            Trang trước
          </Button>
          <span className='text-sm text-gray-600'>
            Trang {page} / {pagination.totalPages}
          </span>
          <Button
            onClick={() => goToPage(page + 1)}
            disabled={page === pagination.totalPages}
            className='w-full sm:w-auto'
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  )
}
