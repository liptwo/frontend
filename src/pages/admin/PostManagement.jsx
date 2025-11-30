/* eslint-disable react-refresh/only-export-components */
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  getAdminListingsAPI,
  getCategoriesAPI,
  updateListingStatusAPI
} from '@/apis'
import { PostStatusTabs } from '@/components/commons/admin'
import { PostDetailModal } from '@/components/commons/admin/PostDetailModal'
import { PostCard } from '@/components/commons/admin/PostCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useDebounce } from '@/hooks/useDebounce'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { toast } from 'sonner'
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal
} from 'lucide-react'
import provincesData from '@/json/provinces.json'
import React from 'react'
const ITEMS_PER_PAGE = 10

export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Ngày tạo' },
  { value: 'price', label: 'Giá' },
  { value: 'title', label: 'Tiêu đề' }
]

// TODO: API chưa hỗ trợ, thêm vào để UI không bị lỗi

const PostCardSkeleton = () => (
  <div className='h-[300px] rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse'>
    <div className='h-40 bg-gray-200 rounded-t-lg' />
    <div className='p-4 space-y-3'>
      <div className='h-4 bg-gray-200 rounded w-3/4' />
      <div className='h-4 bg-gray-200 rounded w-1/2' />
      <div className='h-4 bg-gray-200 rounded w-1/4' />
    </div>
  </div>
)

export default function PostManagement() {
  const [page, setPage] = useState(1)
  const [isAcceptingPostId, setIsAcceptingPostId] = useState()
  const [rejectingPost, setRejectingPost] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [viewingPost, setViewingPost] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Advanced filters
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedProvince, setSelectedProvince] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Default status is PENDING, can be changed by tabs
  const [status, setStatus] = useState('PENDING')

  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const [postResponse, setPostResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [categoriesResponse, setCategoriesResponse] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [isApproving, setIsApproving] = useState(false)

  const queryParams = useMemo(
    () => ({
      page,
      limit: ITEMS_PER_PAGE,
      status: status === 'ALL' ? undefined : status,
      q: debouncedSearchTerm || undefined,
      categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
      minPrice: minPrice ? parseInt(minPrice) : undefined,
      maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
      location: selectedProvince === 'all' ? undefined : selectedProvince,
      sortBy: sortBy,
      sortOrder
    }),
    [
      page,
      status,
      debouncedSearchTerm,
      selectedCategory,
      minPrice,
      maxPrice,
      selectedProvince,
      sortBy,
      sortOrder
    ] // eslint-disable-line react-hooks/exhaustive-deps
  )

  const fetchPosts = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAdminListingsAPI(queryParams)
      setPostResponse(data)
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Không thể tải danh sách bài đăng.'
      )
      setPostResponse(null)
    } finally {
      setLoading(false)
    }
  }, [queryParams])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true)
      try {
        const data = await getCategoriesAPI()
        setCategoriesResponse(data.data || []) // Chỉ lấy mảng data từ response
      } catch (error) {
        toast.error('Không thể tải danh sách danh mục.')
      } finally {
        setCategoriesLoading(false)
      }
    }
    fetchCategories()
  }, [])

  // Reset page when any filter changes
  useEffect(() => {
    setPage(1)
  }, [
    status,
    debouncedSearchTerm,
    selectedCategory,
    minPrice,
    maxPrice,
    selectedProvince,
    sortBy,
    sortOrder
  ])

  // Format price for display
  const formatPrice = (price) => {
    if (!price) return ''
    return parseInt(price).toLocaleString('vi-VN')
  }

  const handleApprove = async (postId) => {
    setIsAcceptingPostId(postId)
    setIsApproving(true)
    try {
      await updateListingStatusAPI(postId, { status: 'PUBLISHED' })
      toast.success('Bài đăng đã được duyệt thành công.')
      // Tải lại danh sách bài đăng sau khi duyệt
      fetchPosts()
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
      )
    } finally {
      setIsAcceptingPostId(undefined)
      setIsApproving(false)
    }
  }

  const handleOpenRejectDialog = (post) => {
    setRejectingPost(post)
    setRejectionReason('')
  }

  const handleReject = async () => {
    if (!rejectingPost || !rejectionReason.trim()) {
      toast.warning('Vui lòng nhập lý do từ chối.')
      return
    }

    setIsAcceptingPostId(rejectingPost._id) // Dùng chung state loading
    setIsApproving(true)
    try {
      await updateListingStatusAPI(rejectingPost._id, {
        status: 'REJECTED',
        rejectionReason: rejectionReason.trim()
      })
      toast.success('Bài đăng đã bị từ chối.')
      fetchPosts() // Tải lại danh sách
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
      )
    } finally {
      setRejectingPost(null)
      setIsApproving(false)
      setIsAcceptingPostId(undefined)
    }
  }

  const handleHidePost = async (postId) => {
    setIsAcceptingPostId(postId)
    setIsApproving(true)
    try {
      await updateListingStatusAPI(postId, { status: 'EXPIRED' })
      toast.success('Bài đăng đã được ẩn thành công.')
      fetchPosts()
      setViewingPost(null) // Close modal on success
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.'
      )
    } finally {
      setIsAcceptingPostId(undefined)
      setIsApproving(false)
    }
  }

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus)
    setPage(1)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setMinPrice('')
    setMaxPrice('')
    setSelectedProvince('')
    setSortBy('createdAt')
    setSortOrder('desc')
    setPage(1)
  }

  // Reset page when search or category filter changes
  const handleSearchChange = (value) => {
    setSearchTerm(value)
    setPage(1)
  }

  const handleCategoryChange = (value) => {
    setSelectedCategory(value)
    setPage(1)
  }

  const handleViewDetails = (post) => {
    setViewingPost(post)
  }

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-bold'>Quản lý bài đăng</h1>

      {/* Search and Filter Section */}
      <div className='space-y-4'>
        <div className='flex flex-col sm:flex-row gap-4'>
          {/* Search Input */}
          <div className='relative flex-1'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
            <Input
              placeholder='Tìm kiếm theo tiêu đề, mô tả...'
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className='pl-10'
            />
            {debouncedSearchTerm && debouncedSearchTerm !== searchTerm && (
              <div className='absolute right-3 top-1/2 transform -translate-y-1/2'>
                <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600'></div>
              </div>
            )}
          </div>

          {/* Category Filter */}
          <div className='w-full sm:w-64'>
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
              disabled={categoriesLoading}
            >
              <SelectTrigger>
                <Filter className='h-4 w-4 mr-2' />
                <SelectValue
                  placeholder={
                    categoriesLoading ? 'Đang tải...' : 'Lọc theo danh mục'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>Tất cả danh mục</SelectItem>
                {categoriesResponse &&
                  categoriesResponse.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters */}
          {(searchTerm ||
            selectedCategory !== 'all' ||
            minPrice ||
            maxPrice ||
            selectedProvince) && (
            <Button
              variant='outline'
              onClick={handleClearFilters}
              className='shrink-0'
            >
              <X className='h-4 w-4 mr-2' />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        {/* Advanced Filters Toggle */}
        <div className='flex items-center justify-between'>
          <Button
            variant='outline'
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className='flex items-center gap-2'
          >
            <SlidersHorizontal className='h-4 w-4' />
            Bộ lọc nâng cao
            {showAdvancedFilters ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
          </Button>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg'>
            {/* Price Range */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Khoảng giá</label>
              <div className='flex gap-2'>
                <Input
                  placeholder='Từ'
                  type='number'
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className='text-sm'
                />
                <Input
                  placeholder='Đến'
                  type='number'
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className='text-sm'
                />
              </div>
            </div>

            {/* Province Filter */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Tỉnh/Thành phố</label>
              <Select
                value={selectedProvince}
                onValueChange={setSelectedProvince}
              >
                <SelectTrigger className='text-sm'>
                  <SelectValue placeholder='Chọn tỉnh/thành' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='all'>Tất cả</SelectItem>
                  {provincesData.map((province) => (
                    <SelectItem key={province.code} value={province.name}>
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort Options */}
            <div className='space-y-2'>
              <label className='text-sm font-medium'>Sắp xếp theo</label>
              <div className='flex gap-2'>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className='text-sm'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((sort) => (
                      <SelectItem key={sort.value} value={sort.value}>
                        {sort.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={sortOrder}
                  onValueChange={(value) => setSortOrder(value)}
                >
                  <SelectTrigger className='text-sm w-24'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='desc'>Giảm dần</SelectItem>
                    <SelectItem value='asc'>Tăng dần</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {(searchTerm ||
          selectedCategory !== 'all' ||
          minPrice ||
          maxPrice ||
          selectedProvince) && (
          <div className='flex flex-wrap gap-2 text-sm text-gray-600'>
            <span>Bộ lọc đang áp dụng:</span>
            {searchTerm && (
              <span className='bg-blue-100 text-blue-800 px-2 py-1 rounded'>
                Tìm kiếm: "{searchTerm}"
              </span>
            )}
            {selectedCategory !== 'all' && categoriesResponse && (
              <span className='bg-green-100 text-green-800 px-2 py-1 rounded'>
                Danh mục:{' '}
                {
                  categoriesResponse.find((cat) => cat._id === selectedCategory)
                    ?.name
                }
              </span>
            )}
            {(minPrice || maxPrice) && (
              <span className='bg-purple-100 text-purple-800 px-2 py-1 rounded'>
                Giá: {formatPrice(minPrice) || '0'} -{' '}
                {formatPrice(maxPrice) || '∞'} VNĐ
              </span>
            )}
            {selectedProvince && (
              <span className='bg-indigo-100 text-indigo-800 px-2 py-1 rounded'>
                Tỉnh: {selectedProvince}
              </span>
            )}
            {(sortBy !== 'createdAt' || sortOrder !== 'desc') && (
              <span className='bg-gray-100 text-gray-800 px-2 py-1 rounded'>
                Sắp xếp:{' '}
                {SORT_OPTIONS.find((sort) => sort.value === sortBy)?.label} (
                {sortOrder === 'desc' ? 'Giảm dần' : 'Tăng dần'})
              </span>
            )}
          </div>
        )}
      </div>

      <PostStatusTabs status={status} onChange={handleStatusChange} />

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-4'>
        {loading ? (
          <>
            {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
              <PostCardSkeleton key={index} />
            ))}
          </>
        ) : !postResponse?.data ? (
          <div className='col-span-3 text-center text-red-500'>
            {postResponse?.message || 'Không thể tải dữ liệu bài đăng.'}
          </div>
        ) : postResponse.data.length === 0 ? (
          <div className='col-span-3 text-center text-gray-500'>
            {searchTerm ||
            selectedCategory !== 'all' ||
            minPrice ||
            maxPrice ||
            selectedProvince
              ? 'Không tìm thấy bài đăng nào phù hợp với bộ lọc'
              : 'Không có bài đăng nào'}
          </div>
        ) : (
          postResponse.data.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onApprove={handleApprove}
              onViewDetails={handleViewDetails}
              onReject={handleOpenRejectDialog}
              isApproving={isApproving}
              isApprovingPostId={isAcceptingPostId}
            />
          ))
        )}
      </div>

      {/* Results Summary */}
      {!loading && postResponse?.data && postResponse.data.length > 0 && (
        <div className='text-sm text-gray-600 text-center'>
          Hiển thị {postResponse.data.length} trong tổng số{' '}
          {postResponse.pagination.totalItems} bài đăng
          {(searchTerm ||
            selectedCategory !== 'all' ||
            minPrice ||
            maxPrice ||
            selectedProvince) &&
            ' phù hợp với bộ lọc'}
        </div>
      )}

      {!loading && postResponse?.data && postResponse.data.length > 0 && (
        <div className='flex items-center justify-center gap-2 pt-6'>
          <Button
            variant='outline'
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Trang trước
          </Button>
          <span className='text-sm text-muted-foreground'>
            Trang {postResponse.pagination.currentPage} /{' '}
            {postResponse.pagination.totalPages}
          </span>
          <Button
            variant='outline'
            disabled={
              postResponse.pagination.currentPage >=
              postResponse.pagination.totalPages
            }
            onClick={() => setPage((p) => p + 1)}
          >
            Trang sau
          </Button>
        </div>
      )}

      {/* Reject Confirmation Dialog */}
      <AlertDialog
        open={!!rejectingPost}
        onOpenChange={() => setRejectingPost(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Bạn có chắc muốn từ chối bài đăng này?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bài đăng "{rejectingPost?.title}" sẽ bị từ chối và người đăng sẽ
              nhận được thông báo. Vui lòng cung cấp lý do từ chối.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder='Nhập lý do từ chối (ví dụ: hình ảnh không phù hợp, thông tin sai sự thật...)'
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className='min-h-[100px]'
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Xác nhận từ chối
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Post Detail Modal */}
      <PostDetailModal
        open={!!viewingPost}
        post={viewingPost}
        onClose={() => setViewingPost(null)}
        onApprove={handleApprove}
        onReject={handleOpenRejectDialog}
        onHide={handleHidePost}
        isActionLoading={isApproving ? isAcceptingPostId : null}
      />
    </div>
  )
}
