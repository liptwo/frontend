import axios from 'axios'

const BASE_URL =
  import.meta.env.MODE === 'development'
    ? import.meta.env.WEBSITE_DOMAIN_DEVELOPMENT
    : import.meta.envWEBSITE_DOMAIN_PRODUCTION
// Set the base URL for axios requests
const axiosInstance = axios.create({
  baseURL: BASE_URL, // Use the BASE_URL constant defined in your constants file
  timeout: 10000, // Set a timeout for requests
  withCredentials: true, // Include credentials in requests if needed
  headers: {
    'Content-Type': 'application/json'
  }
})
export default axiosInstance
