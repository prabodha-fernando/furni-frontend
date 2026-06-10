/**
 * Shared TypeScript interfaces used across dashboard sub-components.
 * Centralised here so each component file imports from a single source of truth.
 */

export interface Order {
  id: string
  customerName: string
  customerEmail: string
  date: string
  total: number
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered'
  items: string
  trackingSteps: { title: string; completed: boolean; date?: string }[]
}

export interface Customer {
  id: number
  name: string
  email: string
  ordersCount: number
  totalSpent: number
  status: 'Active' | 'Suspended'
  avatar: string
}

export interface Ticket {
  id: number
  subject: string
  message: string
  sender: 'customer' | 'admin'
  time: string
  status: 'Open' | 'Resolved'
}

export interface Product {
  id: number
  name: string
  sales: number
  category: string
  amount: number
  emoji: string
  image: string | null
  stock: number
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface SystemLog {
  id: number
  message: string
  type: 'admin' | 'customer' | 'system'
  time: string
}
