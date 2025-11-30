import React from 'react'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Camera,
  Info,
  X,
  Plus,
  ImageIcon,
  Package,
  FileText,
  MapPin,
  ChevronRight,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import AddressDialog from '../components/dialog/AddressDialog'
import { uploadFileToCloudinary } from '@/services/api/cloudinary'
import { createListingAPI, getCategoriesAPI } from '@/apis'

export default function PostNews() {
  const navigate = useNavigate()

  // Image states
  const [selectedImages, setSelectedImages] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const fileInputRef = useRef(null)

  // Form states
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [age, setAge] = useState('')
  const [condition, setCondition] = useState('')
  const [size, setSize] = useState('')
  // eslint-disable-next-line no-unused-vars
  const [categoryId, setCategoryId] = useState('')
  const [address, setAddress] = useState(null)
  const [showAddressDialog, setShowAddressDialog] = useState(false)

  // Loading and error states
  const [isUploading, setIsUploading] = useState(false)
  const [errors, setErrors] = useState({})

  const [categories, setCategories] = useState([])
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsCategoriesLoading(true)
        const data = await getCategoriesAPI()
        setCategories(data || [])
      } catch (error) {
        toast.error('Không thể tải danh mục.')
      } finally {
        setIsCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [previewUrls])

  const handleImageUpload = (event) => {
    const files = event.target.files
    if (files) {
      let fileArr = Array.from(files)
      if (selectedImages.length > 0) {
        fileArr = [...selectedImages, ...fileArr].slice(0, 6)
      } else {
        fileArr = fileArr.slice(0, 6)
      }
      previewUrls.forEach((url) => URL.revokeObjectURL(url))
      setSelectedImages(fileArr)
      setPreviewUrls(fileArr.map((file) => URL.createObjectURL(file)))
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveImage = (idx) => {
    setSelectedImages((prev) => {
      URL.revokeObjectURL(previewUrls[idx])
      const newArr = prev.filter((_, i) => i !== idx)
      previewUrls.forEach((url, i) => {
        if (i !== idx) URL.revokeObjectURL(url)
      })
      setPreviewUrls(newArr.map((file) => URL.createObjectURL(file)))
      return newArr
    })
  }

  // Drag & drop reorder
  const dragItem = useRef(null)
  const dragOverItem = useRef(null)

  const handleDragStart = (idx) => {
    dragItem.current = idx
  }

  const handleDragEnter = (idx) => {
    dragOverItem.current = idx
  }

  const handleDragEnd = () => {
    const from = dragItem.current
    const to = dragOverItem.current
    if (from === null || to === null || from === to) return

    const newFiles = [...selectedImages]
    const [file] = newFiles.splice(from, 1)
    newFiles.splice(to, 0, file)

    previewUrls.forEach((url) => URL.revokeObjectURL(url))
    setSelectedImages(newFiles)
    setPreviewUrls(newFiles.map((file) => URL.createObjectURL(file)))

    dragItem.current = null
    dragOverItem.current = null
  }

  const validateForm = () => {
    const newErrors = {}

    if (!title.trim()) {
      newErrors.title = 'Vui lòng điền tiêu đề'
    }

    const wordCount = description.trim().split(/\s+/).length
    if (!description.trim() || wordCount < 10) {
      newErrors.description = 'Vui lòng nhập ít nhất 10 từ'
    }

    if (!categoryId) {
      newErrors.categoryId = 'Vui lòng chọn danh mục'
    }

    if (!condition) {
      newErrors.condition = 'Vui lòng chọn tình trạng sản phẩm'
    }

    if (!price.trim() || isNaN(Number(price))) {
      newErrors.price = 'Vui lòng nhập giá bán hợp lệ'
    }

    if (!address || !address.province || !address.ward) {
      newErrors.address = 'Vui lòng chọn đầy đủ địa chỉ'
    }

    if (selectedImages.length === 0) {
      newErrors.images = 'Bạn cần đăng ít nhất 1 ảnh'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (validateForm()) {
      setIsUploading(true)
      const uploadedImageUrls = []

      if (selectedImages.length > 0) {
        setIsUploading(true)
        const uploadPromises = selectedImages.map((file) =>
          uploadFileToCloudinary(file, 'image')
        )
        try {
          const results = await Promise.all(uploadPromises)
          for (const res of results) {
            if (res.success && res.data && res.data.secure_url) {
              uploadedImageUrls.push(res.data.secure_url)
            } else {
              setErrors((prev) => ({
                ...prev,
                images: 'Có ảnh không upload được, hãy thử lại.'
              }))
              return
            }
          }
        } catch (error) {
          setIsUploading(false)
          return
        }
      }

      const payload = {
        title,
        description,
        price: Number(price),
        location: address
          ? `${address.specificAddress}, ${address.wardLabel}, ${address.provinceLabel}`
          : '',
        condition: condition,
        categoryId: categoryId,
        images: uploadedImageUrls
      }

      await createListingAPI(payload)
        .then((res) => {
          if (res._id) {
            toast.success('Đăng tin thành công')
            navigate('/ManagePost')
          } else {
            toast.error('Đăng tin thất bại')
          }
        })
        .catch(() => {
          toast.error('Đăng tin thất bại')
        })
        .finally(() => {
          setIsUploading(false)
        })
    }
  }

  const handleCancel = () => {
    navigate(-1)
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50 py-8'>
      <div className='container mx-auto max-w-7xl px-4'>
        <div className='mb-8'>
          <div className='flex items-center gap-2 text-sm text-muted-foreground mb-4'>
            <span className='hover:text-primary cursor-pointer transition-colors'>
              Trang chủ
            </span>
            <ChevronRight className='w-4 h-4' />
            <span className='text-foreground font-medium'>Đăng tin mới</span>
          </div>
          <div className='space-y-2'>
            <h1 className='text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent'>
              Đăng tin bán sản phẩm
            </h1>
            <p className='text-muted-foreground text-lg'>
              Hoàn tất thông tin dưới đây để đăng tin của bạn
            </p>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
          <div className='lg:col-span-2'>
            <Card className='shadow-lg border-2'>
              <CardHeader>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg'>
                    <ImageIcon className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <CardTitle className='text-xl'>Hình ảnh sản phẩm</CardTitle>
                    <CardDescription>
                      Tối đa 6 ảnh (JPG, PNG hoặc GIF)
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {errors.images && (
                  <Alert variant='destructive' className='border-2'>
                    <X className='h-4 w-4' />
                    <AlertDescription>{errors.images}</AlertDescription>
                  </Alert>
                )}

                <div>
                  {previewUrls.length === 0 ? (
                    <div
                      className='relative border-2 border-dashed border-primary/30 rounded-2xl p-10 bg-gradient-to-br from-primary/5 to-transparent cursor-pointer hover:border-primary/50 hover:bg-primary/10 transition-all duration-300 group'
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Badge
                        variant='secondary'
                        className='absolute right-4 top-4 shadow-sm'
                      >
                        <Info className='w-3 h-3 mr-1' />
                        Hình ảnh hợp lệ
                      </Badge>
                      <div className='flex flex-col items-center space-y-4 justify-center'>
                        <div className='w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg'>
                          <Camera className='w-12 h-12 text-primary' />
                        </div>
                        <div className='text-center space-y-2'>
                          <p className='text-foreground font-semibold text-lg'>
                            Tải ảnh lên
                          </p>
                          <p className='text-sm text-muted-foreground'>
                            Kéo thả hoặc click để chọn ảnh
                          </p>
                          <p className='text-xs text-muted-foreground/70'>
                            Tối đa 5MB mỗi ảnh
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      <div className='grid grid-cols-2 gap-3'>
                        {previewUrls.map((url, idx) => (
                          <div
                            key={idx}
                            className='relative aspect-square rounded-xl overflow-hidden border-2 border-border bg-muted hover:border-primary transition-all duration-200 cursor-move group shadow-md'
                            draggable
                            onDragStart={() => handleDragStart(idx)}
                            onDragEnter={() => handleDragEnter(idx)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                          >
                            <img
                              src={url || '/placeholder.svg'}
                              alt={`preview-${idx}`}
                              className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
                            />
                            <Button
                              type='button'
                              size='icon'
                              variant='destructive'
                              className='absolute top-2 right-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8'
                              onClick={() => handleRemoveImage(idx)}
                              tabIndex={-1}
                            >
                              <X className='w-4 h-4' />
                            </Button>
                            {idx === 0 && (
                              <Badge className='absolute bottom-2 left-2 bg-black/70 hover:bg-black/70'>
                                Ảnh bìa
                              </Badge>
                            )}
                          </div>
                        ))}
                        {previewUrls.length < 6 && (
                          <div
                            className='aspect-square border-2 border-dashed border-muted-foreground/25 rounded-xl flex items-center justify-center cursor-pointer bg-muted/50 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200 group'
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Plus className='w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors' />
                          </div>
                        )}
                      </div>
                      <Alert>
                        <Info className='h-4 w-4' />
                        <AlertDescription className='text-xs'>
                          Kéo và thả để sắp xếp lại thứ tự hình ảnh
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type='file'
                    multiple
                    accept='image/*'
                    onChange={handleImageUpload}
                    className='hidden'
                    id='file-upload'
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className='lg:col-span-3 space-y-6'>
            {/* Category Card */}
            <Card className='shadow-lg border-2'>
              <CardHeader>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg'>
                    <Package className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <CardTitle className='text-xl'>Danh mục</CardTitle>
                    <CardDescription>
                      Chọn danh mục phù hợp với sản phẩm
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <Label htmlFor='category' className='text-base'>
                    Danh mục tin đăng{' '}
                    <span className='text-destructive'>*</span>
                  </Label>
                  <Select
                    value={categoryId}
                    onValueChange={setCategoryId}
                    disabled={isCategoriesLoading || !categories}
                  >
                    <SelectTrigger
                      className={`h-12 ${
                        errors.categoryId ? 'border-destructive' : ''
                      }`}
                    >
                      <SelectValue
                        placeholder={
                          isCategoriesLoading ? 'Đang tải...' : 'Chọn danh mục'
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {categories &&
                        categories.map((cat) => (
                          <SelectItem key={cat._id} value={cat._id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && (
                    <p className='text-sm text-destructive flex items-center gap-1'>
                      <X className='w-3.5 h-3.5' />
                      {errors.categoryId}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Product Details Card */}
            <Card className='shadow-lg border-2'>
              <CardHeader>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg'>
                    <FileText className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <CardTitle className='text-xl'>
                      Thông tin chi tiết
                    </CardTitle>
                    <CardDescription>
                      Mô tả đầy đủ về sản phẩm của bạn
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                  {/* Condition */}
                  <div className='space-y-2'>
                    <Label htmlFor='condition' className='text-base'>
                      Tình trạng <span className='text-destructive'>*</span>
                    </Label>
                    <Select value={condition} onValueChange={setCondition}>
                      <SelectTrigger
                        className={`h-12 ${
                          errors.condition ? 'border-destructive' : ''
                        }`}
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
                      <p className='text-sm text-destructive flex items-center gap-1'>
                        <X className='w-3.5 h-3.5' />
                        {errors.condition}
                      </p>
                    )}
                  </div>

                  {/* Price */}
                  <div className='space-y-2'>
                    <Label htmlFor='price' className='text-base'>
                      Giá bán <span className='text-destructive'>*</span>
                    </Label>
                    <div className='relative'>
                      <Input
                        id='price'
                        type='number'
                        placeholder='0'
                        className={`h-12 pr-12 ${
                          errors.price ? 'border-destructive' : ''
                        }`}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                      />
                      <span className='absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold'>
                        đ
                      </span>
                    </div>
                    {errors.price && (
                      <p className='text-sm text-destructive flex items-center gap-1'>
                        <X className='w-3.5 h-3.5' />
                        {errors.price}
                      </p>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className='space-y-2'>
                  <Label htmlFor='title' className='text-base'>
                    Tiêu đề tin đăng <span className='text-destructive'>*</span>
                  </Label>
                  <Input
                    id='title'
                    type='text'
                    placeholder='VD: iPhone 13 Pro Max 256GB còn mới 99%'
                    className={`h-12 ${
                      errors.title ? 'border-destructive' : ''
                    }`}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={50}
                  />
                  <div className='flex justify-between items-center'>
                    {errors.title ? (
                      <p className='text-sm text-destructive flex items-center gap-1'>
                        <X className='w-3.5 h-3.5' />
                        {errors.title}
                      </p>
                    ) : (
                      <span className='text-sm text-muted-foreground'>
                        Tiêu đề hấp dẫn giúp bán nhanh hơn
                      </span>
                    )}
                    <span className='text-xs text-muted-foreground'>
                      {title.length}/50
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className='space-y-2'>
                  <Label htmlFor='description' className='text-base'>
                    Mô tả chi tiết <span className='text-destructive'>*</span>
                  </Label>
                  <Textarea
                    id='description'
                    placeholder='Mô tả chi tiết về sản phẩm: tình trạng, nguồn gốc, lý do bán...'
                    className={`min-h-32 resize-none ${
                      errors.description ? 'border-destructive' : ''
                    }`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={1500}
                  />
                  <div className='flex justify-between items-center'>
                    {errors.description ? (
                      <p className='text-sm text-destructive flex items-center gap-1'>
                        <X className='w-3.5 h-3.5' />
                        {errors.description}
                      </p>
                    ) : (
                      <span className='text-sm text-muted-foreground'>
                        Tối thiểu 10 từ
                      </span>
                    )}
                    <span className='text-xs text-muted-foreground'>
                      {description.length}/1500
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location Card */}
            <Card className='shadow-lg border-2'>
              <CardHeader>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg'>
                    <MapPin className='w-6 h-6 text-white' />
                  </div>
                  <div>
                    <CardTitle className='text-xl'>Địa chỉ</CardTitle>
                    <CardDescription>Vị trí bán sản phẩm</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-2'>
                  <Label className='text-base'>
                    Khu vực <span className='text-destructive'>*</span>
                  </Label>
                  <div
                    className={`w-full px-4 py-3 bg-muted/50 border-2 ${
                      errors.address ? 'border-destructive' : 'border-input'
                    } rounded-xl cursor-pointer hover:bg-muted transition-all flex items-center justify-between group`}
                    onClick={() => setShowAddressDialog(true)}
                  >
                    {address ? (
                      <div className='flex-1'>
                        <p className='text-foreground font-medium'>
                          {address.specificAddress}
                          {address.specificAddress ? ', ' : ''}
                          {address.wardLabel}
                        </p>
                        <p className='text-sm text-muted-foreground mt-0.5'>
                          {address.provinceLabel}
                        </p>
                      </div>
                    ) : (
                      <span className='text-muted-foreground'>
                        Chọn địa chỉ của bạn
                      </span>
                    )}
                    <ChevronRight className='w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors' />
                  </div>
                  {errors.address && (
                    <p className='text-sm text-destructive flex items-center gap-1'>
                      <X className='w-3.5 h-3.5' />
                      {errors.address}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className='mt-6 shadow-lg border-2 sticky bottom-4 z-10 backdrop-blur-sm bg-background/95'>
          <CardContent className='py-4'>
            <div className='flex items-center justify-center gap-4'>
              <div className='flex gap-3'>
                <Button
                  variant='outline'
                  size='lg'
                  onClick={handleCancel}
                  disabled={isUploading}
                  className='px-8 border-2 bg-transparent'
                >
                  Hủy
                </Button>
                <Button
                  size='lg'
                  onClick={handleSubmit}
                  disabled={isUploading}
                  className='px-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg'
                >
                  {isUploading ? (
                    <>
                      <Loader2 className='w-5 h-5 animate-spin mr-2' />
                      Đang đăng...
                    </>
                  ) : (
                    'Đăng tin'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Alert className='mt-6 border-2 border-blue-200 bg-blue-50/50'>
          <Info className='h-5 w-5 text-blue-600' />
          <AlertDescription className='text-blue-900'>
            <p className='font-semibold mb-2'>Lưu ý khi đăng tin:</p>
            <ul className='space-y-1 text-sm'>
              <li>• Nội dung phải viết bằng tiếng Việt có dấu</li>
              <li>• Tiêu đề tin không dài quá 100 kí tự</li>
              <li>• Mô tả chi tiết không dài quá 3000 kí tự</li>
              <li>• Tin đăng có hình ảnh rõ ràng sẽ được xem nhiều hơn</li>
            </ul>
          </AlertDescription>
        </Alert>
      </div>

      <AddressDialog
        isOpen={showAddressDialog}
        onClose={() => setShowAddressDialog(false)}
        onSave={(data) => {
          setAddress(data)
          setShowAddressDialog(false)
        }}
      />
    </div>
  )
}
