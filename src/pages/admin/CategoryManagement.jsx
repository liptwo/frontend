'use client'

import { deleteCategoryAPI, getCategoriesAPI } from '@/apis'
import {
  CategoryDetail,
  CategoryTable,
  CreateOrUpdateCategoryForm
} from '@/components/commons/admin'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks'
import { Plus } from 'lucide-react'
import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

export default function CategoryManagement() {
  const [categories, setCategories] = useState([])
  const [pagination, setPagination] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [searchParams, setSearchParams] = useSearchParams()

  const searchTerm = searchParams.get('search') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const debouncedSearch = useDebounce(searchTerm, 500)

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await getCategoriesAPI({
        page,
        limit: 10,
        search: debouncedSearch
      })
      setCategories(response.data)
      setPagination(response.pagination)
    } catch (error) {
      toast.error('Không thể tải danh sách danh mục.')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  const handleEdit = (category) => {
    setSelectedCategory(category)
    setFormOpen(true)
  }

  const handleView = (category) => {
    setSelectedCategory(category)
    setDetailOpen(true)
  }

  const handleCreate = () => {
    setSelectedCategory(null)
    setFormOpen(true)
  }

  const handleDelete = async (categoryId) => {
    try {
      await deleteCategoryAPI(categoryId)
      toast.success('Xóa danh mục thành công!')
      fetchCategories() // Tải lại danh sách
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Xóa danh mục thất bại.')
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>Quản lý danh mục</h1>
        <Button onClick={handleCreate}>
          <Plus className='w-4 h-4 mr-2' />
          Thêm danh mục
        </Button>
      </div>

      <CategoryTable
        categories={categories}
        isLoading={isLoading}
        pagination={pagination}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />

      <CreateOrUpdateCategoryForm
        open={formOpen}
        initialData={selectedCategory}
        onClose={() => {
          setFormOpen(false)
          setSelectedCategory(null)
        }}
        onSuccess={() => {
          setFormOpen(false)
          setSelectedCategory(null)
          fetchCategories()
        }}
      />

      <CategoryDetail
        open={detailOpen}
        category={selectedCategory}
        onClose={() => {
          setDetailOpen(false)
          setSelectedCategory(null)
        }}
        onEdit={(category) => {
          setDetailOpen(false)
          handleEdit(category)
        }}
      />
    </div>
  )
}
