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

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    newUsersThisWeek: 0
  })
  const [userGrowthData, setUserGrowthData] = useState([])
  const [listingActivityData, setListingActivityData] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [recentListings, setRecentListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true)
        const data = await getDashboardStatsAPI()
        setStats(data.stats)
        setUserGrowthData(data.userGrowthData)
        setListingActivityData(data.listingActivityData)
        setRecentUsers(data.recentUsers)
        setRecentListings(data.recentListings)
      } catch (error) {
        toast.error('Không thể tải dữ liệu thống kê.')
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  const recentActivities = [
    ...recentUsers.map((user) => ({
      type: 'user',
      data: user
    })),
    ...recentListings.map((listing) => ({
      type: 'listing',
      data: listing
    }))
  ].sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt))

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
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className='text-center h-24'>
                    Đang tải...
                  </TableCell>
                </TableRow>
              ) : (
                recentActivities.slice(0, 5).map((activity) => (
                  <TableRow key={activity.data._id}>
                    <TableCell>
                      <div className='flex items-center gap-3'>
                        <Avatar className='h-8 w-8'>
                          <AvatarImage
                            src={
                              (activity.type === 'user'
                                ? activity.data.avatar
                                : activity.data.seller?.avatar) ||
                              '/placeholder.svg'
                            }
                            alt={
                              activity.data.displayName ||
                              activity.data.seller?.displayName
                            }
                          />
                          <AvatarFallback>
                            {(
                              activity.data.displayName ||
                              activity.data.seller?.displayName
                            )?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className='font-medium'>
                          {activity.data.displayName ||
                            activity.data.seller?.displayName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='font-medium'>
                      {activity.type === 'user'
                        ? 'Đăng ký mới'
                        : 'Đăng tin mới'}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {activity.type === 'user'
                        ? activity.data.email
                        : activity.data.title}
                    </TableCell>
                    <TableCell className='text-muted-foreground'>
                      {new Date(activity.data.createdAt).toLocaleString(
                        'vi-VN'
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
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
