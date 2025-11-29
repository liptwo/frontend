/* eslint-disable no-undef */

let apiRoot = 'https://beremarket.onrender.com/v1'
if (process.env.BUILD_MODE === 'dev') {
  apiRoot = 'https://beremarket.onrender.com/v1'
}
if (process.env.BUILD_MODE === 'production') {
  apiRoot = 'https://beremarket.onrender.com/v1'
}
export const API_ROOT = apiRoot

export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12
