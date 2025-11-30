import React, { useState, useEffect } from 'react'
import {
  Laptop,
  Shirt,
  Armchair,
  NotebookTabs,
  BoomBox,
  CarFront
} from 'lucide-react'
import { getCategoriesAPI } from '@/apis'
import { useNavigate } from 'react-router-dom'

function DanhMuc({
  setSelectedData,
  setShowDanhMuc,
  hideTitle = false,
  itemClass = ''
}) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const data = await getCategoriesAPI()
        setCategories(data)
        setError(null)
      } catch (err) {
        setError('Không thể tải danh mục.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const handleCategoryClick = (categoryId) => {
    // Chuyển hướng đến trang tìm kiếm với categoryId đã chọn
    navigate(`/search?categoryId=${categoryId}`)
    // Nếu có hàm setShowDanhMuc, gọi nó để đóng dropdown
    if (setShowDanhMuc) {
      setShowDanhMuc(false)
    }
  }

  return (
    <div>
      {!hideTitle && (
        <h1 className='text-lg font-semibold mb-2'>Danh mục sản phẩm</h1>
      )}

      {loading ? (
        <div className='text-center p-4'>Đang tải...</div>
      ) : error ? (
        <div className='text-center p-4 text-red-500'>{error}</div>
      ) : (
        <ul className='text-gray-700 font-medium space-y-2'>
          {categories.map((item) => (
            <li
              key={item.name}
              onClick={() => handleCategoryClick(item._id)}
              className={`hover:bg-gray-50 flex items-center gap-2 cursor-pointer transition-all p-2 rounded-md ${itemClass}`}
            >
              <span>{item.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default DanhMuc
