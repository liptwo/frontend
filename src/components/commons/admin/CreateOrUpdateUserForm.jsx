import { createUserAPI, updateUserByAdminAPI } from '@/apis'
// import { useUserMutations } from '@/services/query'
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useLoading } from '@/hooks'
import { validate } from '@/lib/validation'
import {
  createUserValidationSchema,
  updateUserValidationSchema
} from '@/lib/validation-schemas'

export default function CreateOrUpdateUserForm({
  open,
  onClose,
  isEditing,
  initialData,
  onSuccess
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    avatar: '',
    address: '',
    phoneNumber: '',
    displayName: '',
    dateOfBirth: '',
    gender: 'MALE',
    role: 'USER'
  })
  const [file, setFile] = useState()
  const [errors, setErrors] = useState({
    address: '',
    bio: '',
    dateOfBirth: '',
    email: '', // Sửa: displayName thay cho name
    name: '',
    password: '',
    phoneNumber: '',
    gender: ''
  })

  const { loading: isUploadingImage, execute: uploadImage } = useLoading()
  const resetFormData = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      avatar: '',
      address: '',
      phoneNumber: '',
      displayName: '',
      dateOfBirth: '',
      gender: 'MALE',
      role: 'USER'
    })
  }

  const resetErrors = () => {
    setErrors({
      address: '',
      bio: '',
      dateOfBirth: '', // Sửa: displayName thay cho name
      email: '',
      name: '',
      password: '',
      phoneNumber: '',
      gender: ''
    })
  }

  useEffect(() => {
    if (initialData) {
      setFormData({
        displayName: initialData.displayName,
        email: initialData.email,
        password: '',
        avatar: initialData.avatar,
        address: initialData.address || '',
        phone: initialData.phone || '',
        username: initialData.username || '',
        birthday: initialData.birthday || '',
        gender: initialData.gender || 'MALE',
        role: initialData.role
      })
    } else {
      resetFormData()
    }
  }, [initialData])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleValidateForm = (validationSchema) => {
    const { isValid, errors } = validate(formData, validationSchema)

    setErrors(errors)
    return isValid
  }

  const handleSubmit = async () => {
    if (isEditing) {
      await handleUpdateUser()
    } else {
      await handleCreateUser()
    }
  }

  const handleUpdateUser = async () => {
    // Simple validation for now
    if (!formData.displayName) {
      return toast.error('Tên hiển thị không được để trống.')
    }
    try {
      const payload = {
        displayName: formData.displayName,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        role: formData.role
      }
      await updateUserByAdminAPI(initialData._id, payload)
      toast.success('Cập nhật người dùng thành công!')
      onSuccess()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Cập nhật thất bại.')
    }
  }

  const handleCreateUser = async () => {
    // Simple validation for now
    if (!formData.email || !formData.password || !formData.username) {
      return toast.error('Email, mật khẩu và username là bắt buộc.')
    }
    try {
      await createUserAPI(formData)
      toast.success('Tạo người dùng thành công!')
      onSuccess()
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Tạo người dùng thất bại.')
    }
  }

  const handleAvatarChange = async (file) => {
    const imageURL = URL.createObjectURL(file)
    setFormData({ ...formData, avatar: imageURL })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className='max-w-lg'>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Chỉnh sửa người dùng' : 'Tạo người dùng mới'}
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-3'>
          {/* {isEditing && (
            <div className='space-y-1 flex flex-col items-center'>
              <label className='block text-sm font-medium'>Avatar</label>
              {formData.avatar && (
                <img
                  src={formData.avatar}
                  alt='Avatar'
                  className='w-16 h-16 rounded-full object-cover'
                />
              )}
              <Button>
                <label htmlFor='avatar' className='cursor-pointer'>
                  Chọn avatar
                  <Input
                    type='file'
                    accept='image/*'
                    id='avatar'
                    hidden
                    disabled={updateUser.isPending || isUploadingImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      setFile(file)
                      if (file) handleAvatarChange(file)
                    }}
                  />
                </label>
              </Button>
            </div>
          )} */}
          <Input
            placeholder='Tên hiển thị'
            name='displayName'
            disabled={isUploadingImage}
            value={formData.displayName}
            onChange={handleChange}
          />
          {errors['name'] && (
            <p className='text-xs text-red-500'>{errors['name']}</p>
          )}
          <Input
            placeholder='Email'
            name='email'
            disabled={isEditing || isUploadingImage}
            value={formData.email}
            onChange={handleChange}
          />
          {errors['email'] && (
            <p className='text-xs text-red-500'>{errors['email']}</p>
          )}
          {!isEditing && (
            <>
              <Input
                placeholder='Tên đăng nhập'
                name='username'
                disabled={isUploadingImage}
                value={formData.username}
                onChange={handleChange}
              />
              {errors['username'] && (
                <p className='text-xs text-red-500'>{errors['username']}</p>
              )}
              <Input
                placeholder='Mật khẩu'
                name='password'
                type='password'
                disabled={isUploadingImage}
                value={formData.password}
                onChange={handleChange}
              />
              {errors['password'] && (
                <p className='text-xs text-red-500'>{errors['password']}</p>
              )}
            </>
          )}

          <Input
            placeholder='Địa chỉ'
            name='address'
            disabled={isUploadingImage}
            value={formData.address}
            onChange={handleChange}
          />
          {errors['address'] && (
            <p className='text-xs text-red-500'>{errors['address']}</p>
          )}
          <Input
            type='text'
            placeholder='SĐT'
            name='phone'
            disabled={isUploadingImage}
            value={formData.phone}
            onChange={handleChange}
          />
          {errors['phoneNumber'] && (
            <p className='text-xs text-red-500'>{errors['phoneNumber']}</p>
          )}

          <Input
            placeholder='Ngày sinh'
            name='birthday'
            type='date'
            disabled={isUploadingImage}
            value={
              formData.birthday
                ? new Date(formData.birthday).toISOString().split('T')[0]
                : ''
            }
            onChange={handleChange}
          />
          {errors['dateOfBirth'] && (
            <p className='text-xs text-red-500'>{errors['dateOfBirth']}</p>
          )}

          <Select
            disabled={isUploadingImage}
            value={formData.gender}
            onValueChange={(val) => setFormData({ ...formData, gender: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder='Chọn giới tính' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='MALE'>Nam</SelectItem>
              <SelectItem value='FEMALE'>Nữ</SelectItem>
              <SelectItem value='OTHER'>Khác</SelectItem>
            </SelectContent>
          </Select>
          {errors['gender'] && (
            <p className='text-xs text-red-500'>{errors['gender']}</p>
          )}

          <Select
            disabled={isUploadingImage}
            value={formData.role}
            onValueChange={(val) => setFormData({ ...formData, role: val })}
          >
            <SelectTrigger>
              <SelectValue placeholder='Chọn vai trò' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='USER'>User</SelectItem>
              <SelectItem value='ADMIN'>Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className='pt-4 flex justify-end gap-2'>
          <Button
            variant='outline'
            onClick={onClose}
            disabled={isUploadingImage}
          >
            Hủy
          </Button>
          <Button disabled={isUploadingImage} onClick={handleSubmit}>
            {isUploadingImage
              ? 'Đang lưu...'
              : isEditing
              ? 'Cập nhật'
              : 'Tạo mới'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
