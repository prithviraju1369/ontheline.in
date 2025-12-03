import axios from 'axios'
import toast from 'react-hot-toast'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.error || 'An error occurred'
      
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login'
        toast.error('Session expired. Please login again.')
      } else {
        toast.error(message)
      }
    } else {
      toast.error('Network error. Please try again.')
    }
    
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data)
}

// User APIs
export const userAPI = {
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`)
}

// ONDC APIs
export const ondcAPI = {
  search: (params) => api.post('/ondc/search', params),
  select: (data) => api.post('/ondc/select', data),
  init: (data) => api.post('/ondc/init', data),
  confirm: (data) => api.post('/ondc/confirm', data),
  status: (data) => api.post('/ondc/status', data),
  track: (data) => api.post('/ondc/track', data),
  cancel: (data) => api.post('/ondc/cancel', data),
  support: (data) => api.post('/ondc/support', data)
}

// Cart APIs
export const cartAPI = {
  getCart: () => api.get('/ondc/cart'),
  addToCart: (data) => api.post('/ondc/cart/add', data),
  updateCart: (itemId, data) => api.put(`/ondc/cart/update/${itemId}`, data),
  removeFromCart: (itemId) => api.delete(`/ondc/cart/remove/${itemId}`),
  clearCart: () => api.delete('/ondc/cart/clear')
}

// Order APIs
export const orderAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (orderId) => api.get(`/orders/${orderId}`),
  createOrder: (data) => api.post('/orders/create', data),
  updateOrderStatus: (orderId, data) => api.put(`/orders/${orderId}/status`, data),
  trackOrder: (orderId) => api.get(`/orders/${orderId}/track`),
  cancelOrder: (orderId, data) => api.post(`/orders/${orderId}/cancel`, data),
  getSupport: (orderId) => api.get(`/orders/${orderId}/support`)
}

export default api

