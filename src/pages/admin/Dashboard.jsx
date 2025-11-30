'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { getDashboardStatsAPI } from '@/apis'
import { toast } from 'sonner'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Users,
  FileText,
  TrendingUp,
  Activity,
  Eye,
  UserPlus,
  ArrowUpRight
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

// Mock data for charts - Replace with actual API data
const userGrowthData = [
  { month: 'T1', users: 120 },
  { month: 'T2', users: 180 },
  { month: 'T3', users: 240 },
  { month: 'T4', users: 300 },
  { month: 'T5', users: 380 },
  { month: 'T6', users: 450 }
]

const listingActivityData = [
  { day: 'T2', active: 65, inactive: 20 },
  { day: 'T3', active: 75, inactive: 15 },
  { day: 'T4', active: 85, inactive: 10 },
  { day: 'T5', active: 95, inactive: 12 },
  { day: 'T6', active: 110, inactive: 8 },
  { day: 'T7', active: 125, inactive: 5 },
  { day: 'CN', active: 100, inactive: 15 }
]

// Mock recent activities - Replace with actual API data
const recentActivities = [
  {
    id: 1,
    user: 'Nguyễn Văn A',
    avatar: '/placeholder-user.jpg',
    action: 'Đăng tin mới',
    description: 'Cho thuê nhà trọ Q1',
    time: '5 phút trước',
    status: 'success'
  },
  {
    id: 2,
    user: 'Trần Thị B',
    avatar: '/placeholder-user.jpg',
    action: 'Đăng ký tài khoản',
    description: 'Tài khoản mới',
    time: '15 phút trước',
    status: 'info'
  },
  {
    id: 3,
    user: 'Lê Văn C',
    avatar: '/placeholder-user.jpg',
    action: 'Cập nhật tin',
    description: 'Nhà cho thuê Q7',
    time: '30 phút trước',
    status: 'warning'
  },
  {
    id: 4,
    user: 'Phạm Thị D',
    avatar: '/placeholder-user.jpg',
    action: 'Xóa tin',
    description: 'Tin đã hết hạn',
    time: '1 giờ trước',
    status: 'danger'
  }
]

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    newUsersThisWeek: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const data = await getDashboardStatsAPI()
        setStats(data)
      } catch (error) {
        toast.error('Không thể tải dữ liệu thống kê.')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const getStatusBadge = (status) => {
    const variants = {
      success: 'default',
      info: 'secondary',
      warning: 'outline',
      danger: 'destructive'
    }
    return variants[status] || 'default'
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Bảng điều khiển</h1>
          <p className='text-muted-foreground mt-2'>
            Tổng quan hoạt động hệ thống
          </p>
        </div>
        <div className='flex gap-2'>
          <Button variant='outline'>
            <Eye className='mr-2 h-4 w-4' />
            Xem báo cáo
          </Button>
          <Button>
            <ArrowUpRight className='mr-2 h-4 w-4' />
            Xuất dữ liệu
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Tổng số người dùng
            </CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {isLoading ? '...' : stats.totalUsers.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              <span className='text-green-600'>+12.5%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Tin đang hoạt động
            </CardTitle>
            <FileText className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {isLoading ? '...' : stats.activeListings.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              <span className='text-green-600'>+8.2%</span> so với tuần trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Người dùng mới trong tuần
            </CardTitle>
            <UserPlus className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {isLoading ? '...' : stats.newUsersThisWeek.toLocaleString()}
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              <span className='text-green-600'>+18.7%</span> so với tuần trước
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-sm font-medium'>
              Tỷ lệ hoạt động
            </CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>87.4%</div>
            <p className='text-xs text-muted-foreground mt-1'>
              <span className='text-green-600'>+3.2%</span> so với tháng trước
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        <Card>
          <CardHeader>
            <CardTitle>Tăng trưởng người dùng</CardTitle>
            <p className='text-sm text-muted-foreground'>
              Số lượng người dùng mới theo tháng
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='month' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type='monotone'
                  dataKey='users'
                  stroke='hsl(var(--primary))'
                  strokeWidth={2}
                  name='Người dùng'
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hoạt động tin đăng</CardTitle>
            <p className='text-sm text-muted-foreground'>
              Tin đang hoạt động và không hoạt động theo ngày
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width='100%' height={300}>
              <BarChart data={listingActivityData}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis dataKey='day' />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey='active'
                  fill='hsl(var(--primary))'
                  name='Đang hoạt động'
                />
                <Bar
                  dataKey='inactive'
                  fill='hsl(var(--muted))'
                  name='Không hoạt động'
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2'>
                <Activity className='h-5 w-5' />
                Hoạt động gần đây
              </CardTitle>
              <p className='text-sm text-muted-foreground mt-1'>
                Các hoạt động mới nhất trong hệ thống
              </p>
            </div>
            <Button variant='ghost' size='sm'>
              Xem tất cả
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Người dùng</TableHead>
                <TableHead>Hành động</TableHead>
                <TableHead>Mô tả</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentActivities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage
                          src={activity.avatar || '/placeholder.svg'}
                          alt={activity.user}
                        />
                        <AvatarFallback>
                          {activity.user.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className='font-medium'>{activity.user}</span>
                    </div>
                  </TableCell>
                  <TableCell className='font-medium'>
                    {activity.action}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {activity.description}
                  </TableCell>
                  <TableCell className='text-muted-foreground'>
                    {activity.time}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadge(activity.status)}>
                      {activity.status === 'success' && 'Thành công'}
                      {activity.status === 'info' && 'Thông tin'}
                      {activity.status === 'warning' && 'Cảnh báo'}
                      {activity.status === 'danger' && 'Lỗi'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
          <p className='text-sm text-muted-foreground'>
            Các chức năng thường dùng
          </p>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Button className='h-24 flex-col gap-2' variant='outline'>
              <Users className='h-6 w-6' />
              <span className='text-sm'>Quản lý người dùng</span>
            </Button>
            <Button className='h-24 flex-col gap-2' variant='outline'>
              <FileText className='h-6 w-6' />
              <span className='text-sm'>Quản lý tin đăng</span>
            </Button>
            <Button className='h-24 flex-col gap-2' variant='outline'>
              <TrendingUp className='h-6 w-6' />
              <span className='text-sm'>Thống kê chi tiết</span>
            </Button>
            <Button className='h-24 flex-col gap-2' variant='outline'>
              <Activity className='h-6 w-6' />
              <span className='text-sm'>Nhật ký hệ thống</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
