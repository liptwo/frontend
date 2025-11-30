/* eslint-disable no-undef */

const BASE_URL =
  import.meta.env.VITE_BUILD_MODE === 'development'
    ? import.meta.env.VITE_WEBSITE_DOMAIN_DEVELOPMENT
    : import.meta.env.VITE_WEBSITE_DOMAIN_PRODUCTION
export const API_ROOT = BASE_URL
console.log(BASE_URL)
export const DEFAULT_PAGE = 1
export const DEFAULT_ITEMS_PER_PAGE = 12
