'use client'

import React, { useState, useRef, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Camera,
  Info,
  CloverIcon as CloseIcon,
  Upload,
  ImageIcon
} from 'lucide-react'
import AddressDialog from './AddressDialog'
import { uploadFileToCloudinary } from '@/services/api/cloudinary'
import { updateListingAPI } from '@/apis'
import { categoriesMock } from '@/constant/constant'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function EditPostModal({
  isOpen,
  onClose,
  post,
  onPostUpdated
}) {
  // Form states, initialized with post data
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [condition, setCondition] = useState('')
  const [address, setAddress] = useState('')

  // Image states
  const [imageFiles, setImageFiles] = useState([]) // For new file uploads
  const [imageUrls, setImageUrls] = useState([]) // For existing and new preview urls
  const fileInputRef = useRef(null)

  // Control states
  const [showAddressDialog, setShowAddressDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen && post) {
      setTitle(post.title || '')
      setDescription(post.description || '')
      setPrice(post.price || '')
      setCategory(post.categoryId || '')
      setCondition(post.condition || '')
      setAddress(post.location || '')
      setImageUrls(post.images || [])
    }
  }, [isOpen, post])

  const validateForm = () => {
    const newErrors = {}
    if (!title.trim()) newErrors.title = 'Vui lòng điền tiêu đề'
    if (!description.trim()) newErrors.description = 'Vui lòng nhập mô tả'
    if (!category) newErrors.category = 'Vui lòng chọn danh mục'
    if (!condition) newErrors.condition = 'Vui lòng chọn tình trạng'
    if (!price.toString().trim() || isNaN(Number(price)))
      newErrors.price = 'Vui lòng nhập giá bán hợp lệ'
    if (!address) newErrors.address = 'Vui lòng chọn địa chỉ'
    if (imageUrls.length === 0) newErrors.images = 'Bạn cần có ít nhất 1 ảnh'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files)
    const totalImages = imageUrls.length + files.length

    if (totalImages > 6) {
      toast.error('Bạn chỉ có thể đăng tối đa 6 hình ảnh.')
      return
    }

    const newImageFiles = [...imageFiles, ...files]
    const newImageUrls = [
      ...imageUrls,
      ...files.map((file) => URL.createObjectURL(file))
    ]

    setImageFiles(newImageFiles)
    setImageUrls(newImageUrls)
  }

  const handleRemoveImage = (index) => {
    const urlToRemove = imageUrls[index]
    // Check if it's a blob URL (newly uploaded file)
    if (urlToRemove.startsWith('blob:')) {
      const fileIndex = imageUrls
        .slice(0, index)
        .filter((u) => u.startsWith('blob:')).length
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex))
    }
    setImageUrls((prev) => prev.filter((_, i) => i !== index))
    URL.revokeObjectURL(urlToRemove)
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // 1. Upload new images to Cloudinary
      const uploadPromises = imageFiles.map((file) =>
        uploadFileToCloudinary(file, 'image')
      )
      const uploadResults = await Promise.all(uploadPromises)

      const newUploadedUrls = uploadResults.map((res) => {
        if (res.success) return res.data.secure_url
        throw new Error('Tải ảnh lên thất bại.')
      })

      // 2. Combine old and new image URLs
      const finalImageUrls = imageUrls
        .filter((url) => !url.startsWith('blob:'))
        .concat(newUploadedUrls)

      // 3. Construct payload
      const payload = {
        title,
        description,
        price: Number(price),
        location: address,
        categoryId: category,
        condition: condition,
        images: finalImageUrls
      }

      // 4. Call API to update
      const updatedPost = await updateListingAPI(post._id, payload)

      if (updatedPost) {
        toast.success('Cập nhật tin đăng thành công!')
        onPostUpdated() // Callback to refresh the list
        onClose() // Close modal
      } else {
        throw new Error('Cập nhật thất bại.')
      }
    } catch (error) {
      toast.error(error.message || 'Đã có lỗi xảy ra.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen || !post) return null

  return (
    <div className='fixed inset-0 flex justify-center items-center bg-black/50 backdrop-blur-sm z-50 p-4'>
      <div className='relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 p-6 text-white relative'>
          <div className='flex items-center gap-3'>
            <div className='w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center'>
              <ImageIcon className='w-6 h-6' />
            </div>
            <div>
              <h3 className='text-2xl font-bold'>Chỉnh sửa tin đăng</h3>
              <p className='text-sm text-white/90'>
                Cập nhật thông tin sản phẩm của bạn
              </p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant='ghost'
            size='icon'
            className='absolute top-4 right-4 text-white hover:bg-white/20'
          >
            <CloseIcon className='w-5 h-5' />
          </Button>
        </div>

        {/* Content */}
        <div className='overflow-y-auto p-6 flex-1'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Left Column: Images */}
            <Card className='border-2'>
              <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center'>
                    <Camera className='w-4 h-4 text-white' />
                  </div>
                  Hình ảnh sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='grid grid-cols-3 gap-3'>
                  {imageUrls.map((url, idx) => (
                    <div
                      key={idx}
                      className='relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 group'
                    >
                      <img
                        src={url || '/placeholder.svg'}
                        alt={`preview-${idx}`}
                        className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
                      />
                      <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity' />
                      <Button
                        type='button'
                        size='icon'
                        variant='destructive'
                        className='absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity'
                        onClick={() => handleRemoveImage(idx)}
                      >
                        <CloseIcon className='w-4 h-4' />
                      </Button>
                    </div>
                  ))}
                  {imageUrls.length < 6 && (
                    <button
                      type='button'
                      className='aspect-square border-2 border-dashed border-orange-300 rounded-xl flex flex-col items-center justify-center cursor-pointer bg-gradient-to-br from-orange-50 to-yellow-50 hover:from-orange-100 hover:to-yellow-100 transition-all group'
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className='w-8 h-8 text-orange-400 mb-1 group-hover:scale-110 transition-transform' />
                      <span className='text-xs text-gray-600 font-medium'>
                        Thêm ảnh
                      </span>
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type='file'
                  multiple
                  accept='image/*'
                  onChange={handleImageUpload}
                  className='hidden'
                />
                {errors.images && (
                  <Alert variant='destructive'>
                    <AlertDescription>{errors.images}</AlertDescription>
                  </Alert>
                )}
                <Alert>
                  <Info className='w-4 h-4' />
                  <AlertDescription className='text-xs'>
                    Tối đa 6 ảnh. Ảnh đầu tiên sẽ là ảnh đại diện.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Right Column: Info */}
            <Card className='border-2'>
              <CardHeader>
                <CardTitle className='text-lg flex items-center gap-2'>
                  <div className='w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center'>
                    <Info className='w-4 h-4 text-white' />
                  </div>
                  Thông tin sản phẩm
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='title' className='text-sm font-semibold'>
                    Tiêu đề <span className='text-red-500'>*</span>
                  </Label>
                  <Input
                    id='title'
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder='Nhập tiêu đề sản phẩm'
                    className={errors.title ? 'border-red-500' : ''}
                  />
                  {errors.title && (
                    <p className='text-xs text-red-500'>{errors.title}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label
                    htmlFor='description'
                    className='text-sm font-semibold'
                  >
                    Mô tả <span className='text-red-500'>*</span>
                  </Label>
                  <Textarea
                    id='description'
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder='Mô tả chi tiết về sản phẩm'
                    className={`h-24 resize-none ${
                      errors.description ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.description && (
                    <p className='text-xs text-red-500'>{errors.description}</p>
                  )}
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='condition' className='text-sm font-semibold'>
                    Tình trạng <span className='text-red-500'>*</span>
                  </Label>
                  <Select value={condition} onValueChange={setCondition}>
                    <SelectTrigger
                      className={errors.condition ? 'border-red-500' : ''}
                    >
                      <SelectValue placeholder='Chọn tình trạng' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='new'>Mới</SelectItem>
                      <SelectItem value='like_new'>Như mới</SelectItem>
                      <SelectItem value='used'>Đã qua sử dụng</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.condition && (
                    <p className='text-xs text-red-500'>{errors.condition}</p>
                  )}
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='price' className='text-sm font-semibold'>
                      Giá (VNĐ) <span className='text-red-500'>*</span>
                    </Label>
                    <Input
                      id='price'
                      type='number'
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder='0'
                      className={errors.price ? 'border-red-500' : ''}
                    />
                    {errors.price && (
                      <p className='text-xs text-red-500'>{errors.price}</p>
                    )}
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='category' className='text-sm font-semibold'>
                      Danh mục <span className='text-red-500'>*</span>
                    </Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger
                        className={errors.category ? 'border-red-500' : ''}
                      >
                        <SelectValue placeholder='Chọn danh mục' />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesMock.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className='text-xs text-red-500'>{errors.category}</p>
                    )}
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='address' className='text-sm font-semibold'>
                    Địa chỉ <span className='text-red-500'>*</span>
                  </Label>
                  <div
                    className={`flex items-center h-10 px-3 py-2 text-sm border rounded-md cursor-pointer hover:bg-gray-50 transition-colors ${
                      errors.address ? 'border-red-500' : 'border-input'
                    }`}
                    onClick={() => setShowAddressDialog(true)}
                  >
                    <p className='text-sm truncate flex-1'>
                      {address || 'Nhấn để chọn địa chỉ'}
                    </p>
                  </div>
                  {errors.address && (
                    <p className='text-xs text-red-500'>{errors.address}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className='border-t bg-white p-4 flex justify-end gap-3'>
          <Button
            variant='outline'
            onClick={onClose}
            disabled={isSubmitting}
            className='min-w-[100px]'
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className='min-w-[120px] bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-white font-semibold'
          >
            {isSubmitting ? (
              <>
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2' />
                Đang lưu...
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </Button>
        </div>

        {/* Address Dialog */}
        {showAddressDialog && (
          <AddressDialog
            isOpen={showAddressDialog}
            onClose={() => setShowAddressDialog(false)}
            onSave={(value) => {
              const fullAddress = `${value.specificAddress}, ${value.wardLabel}, ${value.provinceLabel}`
              setAddress(fullAddress)
              setShowAddressDialog(false)
            }}
            initialAddress={{}}
          />
        )}
      </div>
    </div>
  )
}
