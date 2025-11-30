'use client'

import { getAllUsersAPI, deleteUserAPI } from '@/apis'
import { UserTable } from '@/components/commons/admin'
import CreateOrUpdateUserForm from '@/components/commons/admin/CreateOrUpdateUserForm'
import { UserDetail } from '@/components/commons/admin/UserDetail'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks'
import React, { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

export default function UserManagement() {
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const searchTerm = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const debouncedSearch = useDebounce(searchTerm, 500)

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await getAllUsersAPI({
        page,
        limit: 10,
        search: debouncedSearch
      })
      setUsers(response.data)
      setPagination({
        total: response.total,
        totalPages: response.totalPages
      })
    } catch (error) {
      toast.error('Không thể tải danh sách người dùng.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleSuccess = () => {
    fetchUsers() // Tải lại danh sách người dùng sau khi tạo/cập nhật thành công
  }

  const handleEditUser = (userToEdit) => {
    setIsEditing(true)
    setEditingUser(userToEdit)
    setFormOpen(true)
  }

  const handleCreateUser = () => {
    setIsEditing(false)
    setEditingUser(null)
    setFormOpen(true)
  }

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setDetailOpen(true)
  }

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUserAPI(userId)
      toast.success('Xóa người dùng thành công!')
      fetchUsers() // Refresh the user list
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Xóa người dùng thất bại.')
      console.error(error)
    }
  }

  return (
    <>
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
        <h1 className='text-2xl font-bold'>Quản lý người dùng</h1>
        <Button onClick={handleCreateUser} className='w-full sm:w-auto'>
          + Thêm người dùng
        </Button>
      </div>

      <div className='bg-white rounded-lg shadow p-4 overflow-x-auto'>
        <UserTable
          users={users}
          isLoading={isLoading}
          pagination={pagination}
          onView={handleViewUser}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          searchParams={searchParams}
          setSearchParams={setSearchParams}
        />
      </div>

      <CreateOrUpdateUserForm
        open={formOpen}
        isEditing={isEditing}
        onClose={() => {
          setFormOpen(false)
          setEditingUser(null)
        }}
        initialData={editingUser}
        onSuccess={() => {
          setFormOpen(false)
          handleSuccess()
        }}
      />

      <UserDetail
        user={selectedUser}
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false)
          setSelectedUser(null)
        }}
      />
    </>
  )
}
