import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { createCategoryAPI, updateCategoryAPI } from '@/apis'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'

const initialFormData = {
  name: '',
  code: '',
  parentCode: '',
  imageUrl: ''
}

export function CreateOrUpdateCategoryForm({
  open,
  onClose,
  initialData,
  onSuccess
}) {
  const isEditing = !!initialData
  const [formData, setFormData] = useState(initialFormData)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        code: initialData.code || '',
        parentCode: initialData.parentCode || '',
        imageUrl: initialData.imageUrl || ''
      })
    } else {
      setFormData(initialFormData)
    }
  }, [initialData])

  useEffect(() => {
    setErrors({})
  }, [open])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Tên không được bỏ trống'
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})

    try {
      setLoading(true)
      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim() || null,
        parentCode: formData.parentCode.trim() || null,
        imageUrl: formData.imageUrl.trim() || null
      }
      if (isEditing && initialData) {
        await updateCategoryAPI(initialData._id, payload)
        toast.success('Cập nhật danh mục thành công')
      } else {
        await createCategoryAPI(payload)
        toast.success('Tạo danh mục mới thành công')
      }
      onSuccess()
    } catch (err) {
      toast.error(
        err?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Sửa danh mục' : 'Thêm danh mục mới'}
          </DialogTitle>
        </DialogHeader>
        <div className='space-y-4'>
          <label className='text-sm font-medium'>Tên danh mục *</label>
          <Input
            placeholder='Tên danh mục'
            name='name'
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className='text-red-500 text-xs'>{errors.name}</p>}

          <label className='text-sm font-medium'>Mã danh mục</label>
          <Input
            placeholder='Mã danh mục (duy nhất)'
            name='code'
            value={formData.code}
            onChange={handleChange}
          />

          <label className='text-sm font-medium'>Mã danh mục cha</label>
          <Input
            placeholder='Mã của danh mục cha (nếu có)'
            name='parentCode'
            value={formData.parentCode}
            onChange={handleChange}
          />

          <label className='text-sm font-medium'>URL Hình ảnh</label>
          <Input
            placeholder='URL hình ảnh đại diện'
            name='imageUrl'
            value={formData.imageUrl}
            onChange={handleChange}
          />

          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline' onClick={onClose}>
              Hủy
            </Button>
            <Button disabled={loading} onClick={handleSubmit}>
              {loading ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
