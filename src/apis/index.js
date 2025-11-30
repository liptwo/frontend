import authorizedAxiosInstance from '../utils/authorizeAxios'
import { API_ROOT } from '../utils/constants'

// =================================== Auth API ===================================

export const loginAPI = async (data) => {
  const res = await authorizedAxiosInstance.post(
    `${API_ROOT}/users/login`,
    data
  )
  return res.data
}

export const registerAPI = async (data) => {
  const res = await authorizedAxiosInstance.post(
    `${API_ROOT}/users/register`,
    data
  )
  return res.data
}

export const logoutAPI = async () => {
  const res = await authorizedAxiosInstance.delete(`${API_ROOT}/users/logout`)
  return res.data
}

export const verifyAccountAPI = async (data) => {
  const res = await authorizedAxiosInstance.put(
    `${API_ROOT}/users/verify`,
    data
  )
  return res.data
}

export const refreshTokenAPI = async () => {
  const res = await authorizedAxiosInstance.get(
    `${API_ROOT}/users/refresh_token`
  )
  return res.data
}

// =================================== Categories API ===================================

export const getCategoriesAPI = async () => {
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/categories`)
  return res.data
}

export const createCategoryAPI = async (data) => {
  const res = await authorizedAxiosInstance.post(`${API_ROOT}/categories`, data)
  return res.data
}

export const getCategoryDetailsAPI = async (id) => {
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/categories/${id}`)
  return res.data
}

export const updateCategoryAPI = async (id, data) => {
  const res = await authorizedAxiosInstance.put(
    `${API_ROOT}/categories/${id}`,
    data
  )
  return res.data
}

export const deleteCategoryAPI = async (id) => {
  const res = await authorizedAxiosInstance.delete(
    `${API_ROOT}/categories/${id}`
  )
  return res.data
}

// =================================== Listings API ===================================

export const getListingsAPI = async (params) => {
  // Sử dụng axios thường vì đây là public API
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/listings`, {
    params
  })
  return res.data
}

export const searchListingsAPI = async (params) => {
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/listings`, {
    params
  })
  return res.data
}

export const getAllListingsSimpleAPI = async () => {
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/listings/all`)
  return res.data
}

export const getListingDetailsAPI = async (id) => {
  // Sử dụng axios thường vì đây là public API
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/listings/${id}`)
  return res.data
}

export const createListingAPI = async (data) => {
  const res = await authorizedAxiosInstance.post(`${API_ROOT}/listings`, data)
  return res.data
}

export const updateListingAPI = async (id, data) => {
  const res = await authorizedAxiosInstance.put(
    `${API_ROOT}/listings/${id}`,
    data
  )
  return res.data
}

export const deleteListingAPI = async (id) => {
  const res = await authorizedAxiosInstance.delete(`${API_ROOT}/listings/${id}`)
  return res.data
}

export const getMyListing = async () => {
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/listings/me`)
  return res.data
}

export const updateUserAPI = async (data) => {
  const res = await authorizedAxiosInstance.put(
    `${API_ROOT}/users/update`,
    data,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  )
  return res.data
}
// =================================== Reviews API ===================================

export const getReviewsByListingAPI = async (listingId) => {
  // Sử dụng axios thường vì đây là public API
  const res = await authorizedAxiosInstance.get(
    `${API_ROOT}/reviews/listing/${listingId}`
  )
  return res.data
}

export const createReviewAPI = async (data) => {
  const res = await authorizedAxiosInstance.post(`${API_ROOT}/reviews`, data)
  return res.data
}

export const updateReviewAPI = async (id, data) => {
  const res = await authorizedAxiosInstance.put(
    `${API_ROOT}/reviews/${id}`,
    data
  )
  return res.data
}

export const deleteReviewAPI = async (id) => {
  const res = await authorizedAxiosInstance.delete(`${API_ROOT}/reviews/${id}`)
  return res.data
}

// =================================== Messages API ===================================

export const getConversationsAPI = async () => {
  const res = await authorizedAxiosInstance.get(
    `${API_ROOT}/messages/conversations`
  )
  return res.data
}

export const getMessagesAPI = async (otherUserId) => {
  const res = await authorizedAxiosInstance.get(
    `${API_ROOT}/messages/${otherUserId}`
  )
  return res.data
}

export const sendMessageAPI = async (data) => {
  const res = await authorizedAxiosInstance.post(`${API_ROOT}/messages`, data)
  return res.data
}

export const findOrCreateConversationAPI = async (receiverId) => {
  const res = await authorizedAxiosInstance.post(
    `${API_ROOT}/messages/find-or-create`,
    { receiverId }
  )
  return res.data
}

// =================================== Favorites API ===================================

export const getFavoritesAPI = async () => {
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/users/favorites`)
  return res.data
}

export const addFavoriteAPI = async (listingId) => {
  const res = await authorizedAxiosInstance.post(
    `${API_ROOT}/users/favorites`,
    { listingId }
  )
  return res.data
}

export const removeFavoriteAPI = async (listingId) => {
  const res = await authorizedAxiosInstance.delete(
    `${API_ROOT}/users/favorites/${listingId}`
  )
  return res.data
}

// =================================== Users API (Admin) ===================================

export const getAllUsersAPI = async (params) => {
  // Sử dụng authorizedAxiosInstance vì đây là API cần quyền admin
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/users/all`, {
    params
  })
  return res.data
}

export const getUserDetailsAPI = async (id) => {
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/users/${id}`)
  return res.data
}

export const createUserAPI = async (data) => {
  const res = await authorizedAxiosInstance.post(`${API_ROOT}/users`, data)
  return res.data
}

export const updateUserByAdminAPI = async (id, data) => {
  const res = await authorizedAxiosInstance.put(`${API_ROOT}/users/${id}`, data)
  return res.data
}

export const deleteUserAPI = async (id) => {
  const res = await authorizedAxiosInstance.delete(`${API_ROOT}/users/${id}`)
  return res.data
}

// =================================== Dashboard API (Admin) ===================================

export const getDashboardStatsAPI = async () => {
  // Sử dụng authorizedAxiosInstance vì đây là API cần quyền admin
  const res = await authorizedAxiosInstance.get(`${API_ROOT}/dashboard/stats`)
  return res.data
}
