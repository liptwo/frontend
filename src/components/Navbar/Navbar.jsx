import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import UserMenu from './UserMenu'
import { Bell, ChevronDown, Heart, List, MessagesSquare } from 'lucide-react'
import logo from '../../assets/logo.png'
import { NavbarSearch } from './NavbarSearch'
import { NotificationDropdown } from './NotificationDropDown'
import { useClickOutside } from '../../hooks/useClickOutside'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'sonner'
import DanhMuc from '../DanhMuc'

// const categories = [
//   {
//     id: 1,
//     name: 'Bất động sản',
//     slug: 'bat-dong-san',
//     icon: '🏠',
//     children: [
//       { id: 101, name: 'Căn hộ/Chung cư', slug: 'can-ho-chung-cu' },
//       { id: 102, name: 'Nhà ở', slug: 'nha-o' },
//       { id: 103, name: 'Đất', slug: 'dat' },
//       {
//         id: 104,
//         name: 'Văn phòng, mặt bằng kinh doanh',
//         slug: 'van-phong-mat-bang'
//       }
//     ]
//   },
//   {
//     id: 2,
//     name: 'Xe cộ',
//     slug: 'xe-co',
//     icon: '🚗',
//     children: [
//       { id: 201, name: 'Ô tô', slug: 'o-to' },
//       { id: 202, name: 'Xe máy', slug: 'xe-may' },
//       { id: 203, name: 'Xe đạp', slug: 'xe-dap' },
//       { id: 204, name: 'Phụ tùng, đồ chơi xe', slug: 'phu-tung-do-choi-xe' }
//     ]
//   },
//   {
//     id: 3,
//     name: 'Đồ điện tử',
//     slug: 'do-dien-tu',
//     icon: '💻',
//     children: [
//       { id: 301, name: 'Điện thoại', slug: 'dien-thoai' },
//       { id: 302, name: 'Máy tính bảng', slug: 'may-tinh-bang' },
//       { id: 303, name: 'Laptop', slug: 'laptop' },
//       { id: 304, name: 'PC & Màn hình', slug: 'pc-man-hinh' },
//       { id: 305, name: 'Tivi, thiết bị âm thanh', slug: 'tivi-am-thanh' }
//     ]
//   },
//   {
//     id: 4,
//     name: 'Đồ gia dụng, nội thất',
//     slug: 'do-gia-dung-noi-that',
//     icon: '🪑',
//     children: [
//       { id: 401, name: 'Đồ điện gia dụng', slug: 'do-dien-gia-dung' },
//       { id: 402, name: 'Đồ nội thất', slug: 'do-noi-that' },
//       { id: 403, name: 'Trang trí nhà cửa', slug: 'trang-tri-nha-cua' },
//       { id: 404, name: 'Dụng cụ nhà bếp', slug: 'dung-cu-nha-bep' }
//     ]
//   },
//   {
//     id: 5,
//     name: 'Thời trang, làm đẹp',
//     slug: 'thoi-trang-lam-dep',
//     icon: '👗',
//     children: [
//       { id: 501, name: 'Quần áo', slug: 'quan-ao' },
//       { id: 502, name: 'Giày dép', slug: 'giay-dep' },
//       { id: 503, name: 'Túi xách', slug: 'tui-xach' },
//       { id: 504, name: 'Đồng hồ & Trang sức', slug: 'dong-ho-trang-suc' },
//       { id: 505, name: 'Mỹ phẩm', slug: 'my-pham' }
//     ]
//   },
//   {
//     id: 6,
//     name: 'Mẹ & bé',
//     slug: 'me-va-be',
//     icon: '🧸',
//     children: [
//       { id: 601, name: 'Đồ dùng cho bé', slug: 'do-dung-cho-be' },
//       { id: 602, name: 'Đồ chơi trẻ em', slug: 'do-choi-tre-em' },
//       { id: 603, name: 'Sữa & thực phẩm cho bé', slug: 'sua-thuc-pham-be' }
//     ]
//   },
//   {
//     id: 7,
//     name: 'Thú cưng',
//     slug: 'thu-cung',
//     icon: '🐶',
//     children: [
//       { id: 701, name: 'Chó', slug: 'cho' },
//       { id: 702, name: 'Mèo', slug: 'meo' },
//       { id: 703, name: 'Thức ăn & phụ kiện', slug: 'thuc-an-phu-kien' }
//     ]
//   },
//   {
//     id: 8,
//     name: 'Việc làm',
//     slug: 'viec-lam',
//     icon: '💼',
//     children: [
//       { id: 801, name: 'Toàn thời gian', slug: 'toan-thoi-gian' },
//       { id: 802, name: 'Bán thời gian', slug: 'ban-thoi-gian' },
//       { id: 803, name: 'Thực tập', slug: 'thuc-tap' }
//     ]
//   },
//   {
//     id: 9,
//     name: 'Dịch vụ, du lịch',
//     slug: 'dich-vu-du-lich',
//     icon: '🧳',
//     children: [
//       { id: 901, name: 'Dịch vụ sửa chữa', slug: 'dich-vu-sua-chua' },
//       { id: 902, name: 'Du lịch, khách sạn', slug: 'du-lich-khach-san' },
//       { id: 903, name: 'Vận chuyển, chuyển nhà', slug: 'van-chuyen' }
//     ]
//   },
//   {
//     id: 10,
//     name: 'Khác',
//     slug: 'khac',
//     icon: '📦',
//     children: [
//       { id: 1001, name: 'Sưu tầm, đồ cổ', slug: 'suu-tam-do-co' },
//       { id: 1002, name: 'Sách, nhạc, phim', slug: 'sach-nhac-phim' },
//       { id: 1003, name: 'Đồ thể thao, dã ngoại', slug: 'do-the-thao' }
//     ]
//   }
// ]

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const location = useLocation()
  const { user } = useAuthStore()
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 250) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }
    }

    if (isHomePage) {
      window.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (isHomePage) {
        window.removeEventListener('scroll', handleScroll)
      }
    }
  }, [isHomePage])

  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(false)
  const [hasNextPage, setHasNextPage] = React.useState(false)
  const [isFetchingNextPage, setIsFetchingNextPage] = React.useState(false)

  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [countNotificationsUnread, setCountNotificationsUnread] = useState(0)
  const [notifications, setNotifications] = useState([])
  const notificationRef = React.useRef()
  useClickOutside(notificationRef, () => {
    setIsNotificationOpen(false)
  })
  const handleToggleNotification = (e) => {
    e.stopPropagation()
    setIsNotificationOpen((prev) => !prev)
  }

  const logout = () => {
    // dispatch(())
    navigate('/')
  }
  // const navigate = useNavigate()
  const handleClickDM = (id) => {
    const params = new URLSearchParams()
    params.set('categoryId', id)
    navigate(`/search?${params.toString()}`)
  }
  return (
    <div
      className={`navbar max-h-[10vh] top-0 z-50  py-[12px] px-3 sm:px-6 min-w-[320px] m-auto flex justify-between items-center transition-all duration-300 ${
        isHomePage && !isScrolled
          ? 'bg-transparent shadow-none absolute'
          : 'bg-yellow-400 shadow-md sticky'
      }`}
    >
      {/* Logo */}
      <div className='flex items-center  gap-[1rem] flex-shrink-0'>
        {/* Categories */}
        <div className='relative inline-flex items-center gap-2 sm:gap-3 cursor-pointer group w-full sm:w-auto'>
          <List className='w-4 h-4 sm:w-5 sm:h-5 group-hover:opacity-70' />
          <span className='text-xs sm:text-sm font-normal group-hover:opacity-70'>
            Danh mục
          </span>
          <ChevronDown className='w-4 h-4 sm:w-5 sm:h-5 group-hover:opacity-70' />

          <div className='absolute top-full left-0 min-h-[300px] sm:left-auto w-full sm:w-[250px] md:w-[300px] sm:pt-2 hidden group-hover:flex rounded-sm z-[20]'>
            <div className='bg-white rounded-md shadow-lg w-full p-4'>
              <DanhMuc hideTitle={true} itemClass='text-sm' />
            </div>
          </div>
        </div>
        <Link className='btn md:flex hidden btn-ghost border-0 text-xl' to='/'>
          <img src={logo} className='w-18' alt='logo' />
        </Link>
      </div>

      <NavbarSearch isHomePage={isHomePage} isScrolled={isScrolled} />
      {/* Icon Section */}
      <div className='flex items-center gap-3 sm:gap-6 text-xs sm:text-sm  justify-center sm:justify-end'>
        <div className='relative sm:flex hidden order-4 sm:order-none'>
          <div className='relative'>
            <Bell
              className='w-5 h-5 sm:w-7 sm:h-7 hover:opacity-70 cursor-pointer'
              onClick={handleToggleNotification}
            />
            {countNotificationsUnread > 0 && (
              <span className='absolute rounded-full size-5 flex items-center justify-center -top-2.5 -right-2.5 text-xs bg-app-secondary cursor-pointer text-white'>
                {countNotificationsUnread}
              </span>
            )}
          </div>

          {isNotificationOpen && (
            <NotificationDropdown
              notifications={notifications}
              notificationRef={notificationRef}
              onClose={() => setIsNotificationOpen(false)}
            />
          )}
        </div>
        <div
          className='relative md:block hidden cursor-pointer'
          onClick={() => {
            if (user) {
              navigate('/messages')
            } else {
              toast.info('Bạn cần đăng nhập để thực hiện hành động này')
            }
          }}
        >
          <MessagesSquare className='w-5 h-5 sm:w-7 sm:h-7 order-1 sm:order-none hover:opacity-70 cursor-pointer' />
        </div>
        <div
          className='relative md:block hidden cursor-pointer'
          onClick={() => {
            if (user) {
              navigate('/favorites')
            } else {
              toast.info('Bạn cần đăng nhập để thực hiện hành động này')
            }
          }}
        >
          <Heart className='w-5 h-5 sm:w-7 sm:h-7 order-1 sm:order-none  hover:opacity-70 cursor-pointer' />
        </div>

        {/* User Menu */}

        <UserMenu />
      </div>
    </div>
  )
}
