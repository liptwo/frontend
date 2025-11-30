import React from 'react'
import { useState, useEffect } from 'react'
import {
  Edit,
  Trash2,
  Eye,
  EyeOff,
  PlusCircle,
  Search,
  ArrowLeft,
  Package,
  Filter,
  Calendar,
  Tag,
  MapPin
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { deleteListingAPI, getMyListing } from '@/apis'
import dayjs from 'dayjs'
import { postStatusToText } from '@/helper'
import EditPostModal from '../components/dialog/EditPostModal'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

export default function ManagePosts() {
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tất cả')
  const [editingPost, setEditingPost] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [posts, setPosts] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  const getMyPosts = async () => {
    try {
      setIsLoading(true)
      const myPosts = await getMyListing()
      setPosts(myPosts)
    } catch (error) {
      console.log(error)
      toast.error('Không thể tải danh sách tin đăng')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getMyPosts()
  }, [])

  const filteredPosts = posts.filter((post) => {
    const matchSearch = post.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchStatus =
      statusFilter === 'Tất cả'
        ? true
        : postStatusToText(post.status) === statusFilter
    return matchSearch && matchStatus
  })

  const toggleVisibility = (id) => {
    navigate(`/post/${id}`)
  }

  const deletePost = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa tin này không?')) {
      setPosts((prev) => prev.filter((p) => p._id !== id))
      try {
        const res = await deleteListingAPI(id)
        if (res) toast.success(res?.message)
      } catch (error) {
        console.log(error)
        toast.error('Không thể xóa tin đăng')
      }
    }
  }

  const handleEditPost = (post) => {
    setEditingPost(post)
    setIsEditModalOpen(true)
  }

  const getStatusBadge = (status) => {
    const statusMap = {
      'Đang hiển thị': 'default',
      'Chờ duyệt': 'secondary',
      'Tin nháp': 'outline',
      'Hết hạn': 'destructive',
      'Bị từ chối': 'destructive'
    }
    return statusMap[postStatusToText(status)] || 'outline'
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50'>
      <div className='max-w-7xl mx-auto p-4 md:p-6 lg:p-8'>
        {/* Header Section */}
        <div className='mb-8'>
          <Button
            variant='ghost'
            onClick={() => navigate('/')}
            className='mb-4 text-amber-600 hover:text-amber-700 hover:bg-amber-50'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Quay lại Trang chủ
          </Button>

          <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
            <div>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2'>
                Quản lý tin đăng
              </h1>
              <p className='text-muted-foreground'>
                Quản lý và theo dõi tất cả tin đăng của bạn
              </p>
            </div>
            <Button
              onClick={() => navigate('/PostNews')}
              className='bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg hover:shadow-xl transition-all'
            >
              <PlusCircle className='mr-2 h-5 w-5' />
              Đăng tin mới
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
          <Card className='border-l-4 border-l-amber-500'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Tổng tin đăng</p>
                  <p className='text-2xl font-bold text-amber-600'>
                    {posts.length}
                  </p>
                </div>
                <Package className='h-8 w-8 text-amber-500 opacity-50' />
              </div>
            </CardContent>
          </Card>
          <Card className='border-l-4 border-l-green-500'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Đang hiển thị</p>
                  <p className='text-2xl font-bold text-green-600'>
                    {
                      posts.filter(
                        (p) => postStatusToText(p.status) === 'Đang hiển thị'
                      ).length
                    }
                  </p>
                </div>
                <Eye className='h-8 w-8 text-green-500 opacity-50' />
              </div>
            </CardContent>
          </Card>
          <Card className='border-l-4 border-l-yellow-500'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Chờ duyệt</p>
                  <p className='text-2xl font-bold text-yellow-600'>
                    {
                      posts.filter(
                        (p) => postStatusToText(p.status) === 'Chờ duyệt'
                      ).length
                    }
                  </p>
                </div>
                <Filter className='h-8 w-8 text-yellow-500 opacity-50' />
              </div>
            </CardContent>
          </Card>
          <Card className='border-l-4 border-l-gray-500'>
            <CardContent className='p-4'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Tin nháp</p>
                  <p className='text-2xl font-bold text-gray-600'>
                    {
                      posts.filter(
                        (p) => postStatusToText(p.status) === 'Tin nháp'
                      ).length
                    }
                  </p>
                </div>
                <EyeOff className='h-8 w-8 text-gray-500 opacity-50' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search Section */}
        <Card className='mb-6'>
          <CardContent className='p-6'>
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1 relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <Input
                  type='text'
                  placeholder='Tìm kiếm theo tiêu đề...'
                  className='pl-10'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className='w-full md:w-[200px]'>
                  <SelectValue placeholder='Lọc theo trạng thái' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='Tất cả'>Tất cả</SelectItem>
                  <SelectItem value='Đang hiển thị'>Đang hiển thị</SelectItem>
                  <SelectItem value='Chờ duyệt'>Chờ duyệt</SelectItem>
                  <SelectItem value='Tin nháp'>Tin nháp</SelectItem>
                  <SelectItem value='Hết hạn'>Hết hạn</SelectItem>
                  <SelectItem value='Bị từ chối'>Bị từ chối</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Posts List */}
        {isLoading ? (
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <Card key={i} className='animate-pulse'>
                <CardContent className='p-6'>
                  <div className='flex gap-4'>
                    <div className='w-32 h-24 bg-gray-200 rounded-lg' />
                    <div className='flex-1 space-y-3'>
                      <div className='h-4 bg-gray-200 rounded w-3/4' />
                      <div className='h-4 bg-gray-200 rounded w-1/2' />
                      <div className='h-4 bg-gray-200 rounded w-1/4' />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <Card>
            <CardContent className='p-12 text-center'>
              <Package className='mx-auto h-16 w-16 text-muted-foreground opacity-50 mb-4' />
              <h3 className='text-xl font-semibold mb-2'>
                Không có tin đăng nào
              </h3>
              <p className='text-muted-foreground mb-6'>
                {searchTerm || statusFilter !== 'Tất cả'
                  ? 'Không tìm thấy tin đăng phù hợp với bộ lọc'
                  : 'Bạn chưa có tin đăng nào. Hãy tạo tin đăng đầu tiên!'}
              </p>
              <Button
                onClick={() => navigate('/PostNews')}
                className='bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
              >
                <PlusCircle className='mr-2 h-4 w-4' />
                Đăng tin mới
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className='space-y-4'>
            {filteredPosts.map((post) => (
              <Card
                key={post._id}
                className='hover:shadow-lg transition-all duration-200 border border-gray-200'
              >
                <CardContent className='p-6'>
                  <div className='flex flex-col lg:flex-row gap-6'>
                    {/* Image */}
                    <div className='flex-shrink-0'>
                      <div className='relative w-full lg:w-48 h-36 rounded-xl overflow-hidden bg-gray-100'>
                        <img
                          src={post?.images[0] || '/placeholder.svg'}
                          alt={post?.title}
                          className='w-full h-full object-cover hover:scale-105 transition-transform duration-300'
                        />
                        <div className='absolute top-2 right-2'>
                          <Badge
                            variant={getStatusBadge(post.status)}
                            className='shadow-lg'
                          >
                            {postStatusToText(post.status)}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className='flex-1 flex flex-col justify-between'>
                      <div>
                        <h2 className='text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:text-amber-600 transition-colors'>
                          {post?.title}
                        </h2>
                        <div className='flex items-center gap-2 mb-3'>
                          <div className='px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-full text-lg'>
                            {post.price.toLocaleString()} đ
                          </div>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground'>
                          <div className='flex items-center gap-2'>
                            <Tag className='h-4 w-4 text-amber-600' />
                            <span>
                              Danh mục:{' '}
                              <span className='font-medium text-gray-700'>
                                {post?.categoryId}
                              </span>
                            </span>
                          </div>
                          <div className='flex items-center gap-2'>
                            <Calendar className='h-4 w-4 text-amber-600' />
                            <span>
                              Ngày đăng:{' '}
                              <span className='font-medium text-gray-700'>
                                {dayjs(post.createdAt).format('DD/MM/YYYY')}
                              </span>
                            </span>
                          </div>
                          {post?.location && (
                            <div className='flex items-center gap-2'>
                              <MapPin className='h-4 w-4 text-amber-600' />
                              <span className='font-medium text-gray-700'>
                                {post.location}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className='flex lg:flex-col gap-2 justify-end'>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() => toggleVisibility(post._id)}
                        title='Xem tin'
                        className='hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300'
                      >
                        <Eye className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() => handleEditPost(post)}
                        title='Chỉnh sửa'
                        className='hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300'
                      >
                        <Edit className='h-4 w-4' />
                      </Button>
                      <Button
                        variant='outline'
                        size='icon'
                        onClick={() => deletePost(post._id)}
                        title='Xóa tin'
                        className='hover:bg-red-50 hover:text-red-600 hover:border-red-300'
                      >
                        <Trash2 className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        <EditPostModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          post={editingPost}
          onPostUpdated={getMyPosts}
        />
      </div>
    </div>
  )
}
