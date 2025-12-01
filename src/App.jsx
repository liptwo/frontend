import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import PostNews from './pages/PostNews'
import ManagePost from './pages/ManagePost'
import ListSp from './components/ListSp'
import UserProfile from './components/UserProfile'
import Layout from './components/Layout'
import PostsList from './pages/MyPosts'
import MyPosts from './pages/MyPosts'
import ProductPage from './pages/ProductPage'
import ChatPage from './pages/ChatPage'
import FavouritesPage from './pages/FavouritesPage'
import Auth from './pages/Auth'
import AdminLayout from './components/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import UserManagement from './pages/admin/UserManagement'
import PostManagement from './pages/admin/PostManagement'
import CategoryManagement from './pages/admin/CategoryManagement'
import SearchResults from './pages/SearchResults'
import { Navigate } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'

import { useAuthStore } from './stores/useAuthStore'

function App() {
  const AuthRoute = () => {
    const { user } = useAuthStore()
    if (!user) {
      return <Navigate to='/' />
    }
    return <Outlet />
  }

  return (
    <Routes>
      {/* Layout chung có Navbar */}
      <Route element={<Layout />}>
        <Route path='/' element={<Home />} />
        <Route path='/search' element={<SearchResults />} />
        <Route path='/post/:id' element={<ProductPage />} />
        <Route element={<AuthRoute />}>
          <Route path='/PostNews' element={<PostNews />} />
          <Route path='/ManagePost' element={<ManagePost />} />
          <Route path='/profile' element={<UserProfile />} />
          <Route path='/myposts' element={<MyPosts />} />
          <Route path='/messages' element={<ChatPage />} />
          <Route path='/favorites' element={<FavouritesPage />} />
        </Route>
      </Route>

      <Route path='/admin' element={<AdminLayout />}>
        <Route path='dashboard' element={<AdminDashboard />} />
        <Route path='users-management' element={<UserManagement />} />
        <Route path='posts-management' element={<PostManagement />} />
        <Route path='categories-management' element={<CategoryManagement />} />
        {/* <Route path='orders-management' element={<OrderManagement />} />
        <Route path='reviews-management' element={<ReviewManagement />} /> */}
      </Route>
      {/* Trang không dùng Navbar */}
      <Route element={<Auth />}>
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Route>

      <Route
        path='/*'
        element={
          <div className='flex w-screen h-screen items-center justify-center'>
            <div className='text-3xl text-bold text-black'>
              Không tìm thấy trang này
            </div>
          </div>
        }
      />
    </Routes>
  )
}

export default App
