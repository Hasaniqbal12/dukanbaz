// User related types
export interface User {
  _id: string
  name: string
  email: string
  role: 'buyer' | 'supplier'
  company?: string
  location?: string
  isAdmin: boolean
  banned: boolean
  createdAt: Date
  updatedAt: Date
}

// Request related types
export interface Request {
  id: number
  productName: string
  description: string
  quantity: string
  contact: string
  date: string
  fileUrl?: string
  fileType?: string
  category: string
  budget?: string
}

// Offer related types
export interface Offer {
  _id: string
  requestId: string | number
  supplierId: User | string
  price: string
  moq: string
  message?: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: Date
  updatedAt: Date
}

// Product related types
export interface Product {
  id: number
  title: string
  img: string
  price: string | number
  moq: string
  supplier: string
  category: string
  rating?: number
}

// Category related types
export interface Category {
  _id: string
  name: string
  description?: string
  slug: string
  image?: string
  createdAt: Date
  updatedAt: Date
}

// Order related types
export interface Order {
  _id: string
  buyerId: string
  supplierId: string
  products: Array<{
    productId: string
    quantity: number
    price: number
  }>
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  totalAmount: number
  shippingAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  createdAt: Date
  updatedAt: Date
}

// Notification related types
export interface Notification {
  _id: string
  userId: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  read: boolean
  createdAt: Date
  updatedAt: Date
}

// Form related types
export interface RequestForm {
  productName: string
  description: string
  quantity: string
  contact: string
  file: File | null
  fileUrl: string
  fileType: string
  category: string
  budget: string
}

export interface OfferForm {
  price: string
  moq: string
  message: string
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Common utility types
export type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high'
export type FilterOption = 'all' | string 