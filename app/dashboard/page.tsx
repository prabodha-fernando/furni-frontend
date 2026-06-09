'use client'

import { useState, useRef, Suspense, useCallback, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DollarSign, Package, ShoppingCart, Plus, Filter, Zap, Clock,
  Loader2, X, Upload, Check, Pencil, ShoppingBag, Award, Truck,
  TrendingUp, Layers, Trash2, Mail, Send, ShieldCheck, UserCheck,
  UserX, Percent, CheckCircle2, ChevronRight, Eye, AlertTriangle,
  BarChart3, Star, RefreshCw, Save, Bell, Lock, Globe, CreditCard,
  Download, FileText, ArrowUpRight, ArrowDownRight, Users, Image,
  Camera, Phone, MapPin, User, LogOut, ChevronDown, Activity,
  PieChart, TrendingDown, Box, Sparkles, Heart
} from "lucide-react"

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Order {
  id: string
  customerName: string
  customerEmail: string
  date: string
  total: number
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered'
  items: string
  trackingSteps: { title: string; completed: boolean; date?: string }[]
}

interface Customer {
  id: number
  name: string
  email: string
  ordersCount: number
  totalSpent: number
  status: 'Active' | 'Suspended'
  avatar: string
}

interface Ticket {
  id: number
  subject: string
  message: string
  sender: 'customer' | 'admin'
  time: string
  status: 'Open' | 'Resolved'
}

interface Product {
  id: number
  name: string
  sales: number
  category: string
  amount: number
  emoji: string
  image: string | null
  stock: number
}

interface CartItem {
  product: Product
  quantity: number
}

interface SystemLog {
  id: number
  message: string
  type: 'admin' | 'customer' | 'system'
  time: string
}

// ─── Static Data ──────────────────────────────────────────────────────────────

const CATEGORY_EMOJIS: Record<string, string> = {
  'Living Room': '🛋️',
  'Dining Room': '🪑',
  'Bedroom': '🛏️',
  'Office': '👨‍💻',
  'Outdoor': '⛱️',
  'Storage': '🗄️',
}

const STATUS_STYLES: Record<string, string> = {
  Pending: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  Processing: 'bg-amber-50 text-amber-700 border-amber-200',
  Shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
}

const BADGE_STYLES: Record<string, string> = {
  Pending: 'bg-zinc-200 text-zinc-700',
  Processing: 'bg-amber-500 text-white',
  Shipped: 'bg-indigo-600 text-white',
  Delivered: 'bg-emerald-600 text-white',
}

// ─── Custom LocalStorage Hook ────────────────────────────────────────────────
function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    try {
      const item = window.localStorage.getItem(key)
      if (item) setStoredValue(JSON.parse(item))
    } catch (error) {
      console.error(error)
    }
  }, [key])

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return [mounted ? storedValue : initialValue, setValue] as const
}

// ─── Main Dashboard Component ─────────────────────────────────────────────────

function DashboardContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const currentRole = searchParams.get('role') === 'admin' ? 'admin' : 'customer'
  const globalSearchQuery = searchParams.get('search') || ''
  const currentTab = searchParams.get('tab') || 'overview'

  // ── Cart ──
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>('cartItems', [])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')

  // ── Modals ──
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportSuccess, setExportSuccess] = useState(false)

  // ── Activity Feed ──
  const [systemLogs, setSystemLogs] = useLocalStorage<SystemLog[]>('systemLogs', [
    { id: 1, message: 'System Live Synchronization started', type: 'system', time: 'Just now' },
    { id: 2, message: currentRole === 'admin' ? 'Admin Token Verified — Full Access Granted' : 'SSL Secure Session Initialized', type: 'system', time: '1 min ago' },
  ])

  // ── Products ──
  const [selectedProductToEdit, setSelectedProductToEdit] = useState<Product | null>(null)
  const [topProducts, setTopProducts] = useLocalStorage<Product[]>('topProducts', [
    { id: 1, name: 'Velvet Luxury Sofa', sales: 148, category: 'Living Room', amount: 275000, emoji: '🛋️', image: null, stock: 12 },
    { id: 2, name: 'Minimalist Wooden Table', sales: 85, category: 'Dining Room', amount: 120000, emoji: '🪑', image: null, stock: 8 },
    { id: 3, name: 'King Size Walnut Bed', sales: 43, category: 'Bedroom', amount: 450000, emoji: '🛏️', image: null, stock: 5 },
    { id: 4, name: 'Premium Ergo Office Chair', sales: 62, category: 'Office', amount: 85000, emoji: '👨‍💻', image: null, stock: 15 },
    { id: 5, name: 'Nordic Outdoor Lounger', sales: 29, category: 'Outdoor', amount: 195000, emoji: '⛱️', image: null, stock: 7 },
  ])

  // ── Product Form ──
  const [prodName, setProdName] = useState('')
  const [prodPrice, setProdPrice] = useState('')
  const [prodCategory, setProdCategory] = useState('Living Room')
  const [prodStock, setProdStock] = useState('')
  const [prodImage, setProdImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // ── Orders ──
  const [orders, setOrders] = useLocalStorage<Order[]>('orders', [
    {
      id: 'ORD-4928', customerName: 'John Doe', customerEmail: 'john@example.com',
      date: '2026-06-08', total: 275000, status: 'Shipped', items: 'Velvet Luxury Sofa (x1)',
      trackingSteps: [
        { title: 'Order Placed', completed: true, date: 'June 8, 09:30 AM' },
        { title: 'Processing', completed: true, date: 'June 8, 02:15 PM' },
        { title: 'In Transit (Colombo Hub)', completed: true, date: 'June 9, 08:00 AM' },
        { title: 'Out for Delivery', completed: false }
      ]
    },
    {
      id: 'ORD-4927', customerName: 'Prabodha Fernando', customerEmail: 'prabodha@consultant.com',
      date: '2026-06-07', total: 120000, status: 'Delivered', items: 'Minimalist Wooden Table (x1)',
      trackingSteps: [
        { title: 'Order Placed', completed: true, date: 'June 7, 10:00 AM' },
        { title: 'Processing', completed: true, date: 'June 7, 01:00 PM' },
        { title: 'In Transit (Colombo Hub)', completed: true, date: 'June 8, 09:00 AM' },
        { title: 'Out for Delivery', completed: true, date: 'June 8, 04:30 PM' }
      ]
    },
    {
      id: 'ORD-4929', customerName: 'Shan Diaz', customerEmail: 'shan@homeowner.com',
      date: '2026-06-09', total: 85000, status: 'Processing', items: 'Premium Ergo Office Chair (x1)',
      trackingSteps: [
        { title: 'Order Placed', completed: true, date: 'June 9, 11:00 AM' },
        { title: 'Processing', completed: true, date: 'June 9, 11:30 AM' },
        { title: 'In Transit (Colombo Hub)', completed: false },
        { title: 'Out for Delivery', completed: false }
      ]
    }
  ])
  const [selectedOrderToTrack, setSelectedOrderToTrack] = useState<string>('ORD-4928')
  const [orderSearch, setOrderSearch] = useState('')
  const [orderStatusFilter, setOrderStatusFilter] = useState('All')

  // ── Customers ──
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', [
    { id: 1, name: 'Prabodha Fernando', email: 'prabodha@consultant.com', ordersCount: 5, totalSpent: 1245000, status: 'Active', avatar: 'PF' },
    { id: 2, name: 'John Doe', email: 'john@example.com', ordersCount: 3, totalSpent: 480000, status: 'Active', avatar: 'JD' },
    { id: 3, name: 'Shan Diaz', email: 'shan@homeowner.com', ordersCount: 1, totalSpent: 85000, status: 'Active', avatar: 'SD' },
    { id: 4, name: 'Jane Smith', email: 'jane@example.com', ordersCount: 0, totalSpent: 0, status: 'Suspended', avatar: 'JS' },
  ])
  const [customerSearch, setCustomerSearch] = useState('')

  // ── Support Tickets ──
  const [tickets, setTickets] = useLocalStorage<Ticket[]>('tickets', [
    { id: 1, subject: 'Delivery Time Inquiry', message: 'Hi support, when can I expect my Luxury Sofa order to arrive in Kandy?', sender: 'customer', time: 'Yesterday', status: 'Open' },
    { id: 2, subject: 'Care Instructions Response', message: 'Hello! For the Velvet Luxury Sofa, use a soft fabric brush or vacuum with a soft brush attachment. Avoid harsh chemicals.', sender: 'admin', time: '2 hrs ago', status: 'Resolved' }
  ])
  const [newTicketSubject, setNewTicketSubject] = useState('')
  const [newTicketMessage, setNewTicketMessage] = useState('')
  const [newTicketCategory, setNewTicketCategory] = useState('Order Issue')
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false)

  // ── Admin Store Settings ──
  const [storeName, setStoreName] = useState('Furniture Store Colombo')
  const [storeEmail, setStoreEmail] = useState('admin@furniture.com')
  const [currency, setCurrency] = useState('LKR')
  const [shippingFee, setShippingFee] = useState('5000')
  const [taxRate, setTaxRate] = useState('8')
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [autoInvoice, setAutoInvoice] = useState(true)
  const [reviewModeration, setReviewModeration] = useState(true)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'billing' | 'security' | 'notifications'>('general')

  // ── Profile Settings (Customer) ──
  const [profileName, setProfileName] = useState('John Doe')
  const [profileEmail, setProfileEmail] = useState('john@example.com')
  const [profileAvatar, setProfileAvatar] = useState<string | null>(null)
  const [profilePhone, setProfilePhone] = useState('+94 77 123 4567')
  const [profileAddress, setProfileAddress] = useState('123 Galle Road, Colombo 03')
  const [profileCity, setProfileCity] = useState('Colombo')
  const [profileBio, setProfileBio] = useState('Interior design enthusiast, Furniture collector.')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [activeProfileTab, setActiveProfileTab] = useState<'profile' | 'security' | 'preferences'>('profile')
  const [emailNotifs, setEmailNotifs] = useState(true)
  const [orderUpdates, setOrderUpdates] = useState(true)
  const [promoNotifs, setPromoNotifs] = useState(false)

  // ── Admin notification alert toggles (hoisted to comply with Rules of Hooks) ──
  const [alertNewOrders, setAlertNewOrders] = useState(true)
  const [alertLowStock, setAlertLowStock] = useState(true)
  const [alertCustomerUpdates, setAlertCustomerUpdates] = useState(true)
  const [alertRevenueMilestone, setAlertRevenueMilestone] = useState(false)
  const [alertSystemMaintenance, setAlertSystemMaintenance] = useState(true)

  useEffect(() => {
    const userStr = localStorage.getItem('currentUser')
    if (userStr) {
      try {
        const user = JSON.parse(userStr)
        if (user.name) setProfileName(user.name)
        if (user.email) setProfileEmail(user.email)
        if (user.avatar) setProfileAvatar(user.avatar)
      } catch (e) { }
    }
  }, [])

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const addLog = (message: string, type: 'admin' | 'customer' | 'system') => {
    const newLog: SystemLog = {
      id: Date.now(),
      message,
      type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }
    setSystemLogs(prev => [newLog, ...prev].slice(0, 8))
  }

  const resetFormFields = () => {
    setProdName(''); setProdPrice(''); setProdStock(''); setProdImage(null); setProdCategory('Living Room')
  }

  const filteredProducts = topProducts.filter(p => {
    const q = globalSearchQuery.toLowerCase()
    const matchSearch = p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory
    return matchSearch && matchCat
  })

  const filteredOrders = orders.filter(o => {
    const q = (globalSearchQuery || orderSearch).toLowerCase()
    const matchSearch = o.id.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.items.toLowerCase().includes(q)
    const matchStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter
    return matchSearch && matchStatus
  })

  const filteredCustomers = customers.filter(c => {
    const q = (globalSearchQuery || customerSearch).toLowerCase()
    return c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
  })

  const filteredTickets = tickets.filter(t => {
    const q = globalSearchQuery.toLowerCase()
    return t.subject.toLowerCase().includes(q) || t.message.toLowerCase().includes(q)
  })

  const filteredLogs = systemLogs.filter(log => {
    const q = globalSearchQuery.toLowerCase()
    return log.message.toLowerCase().includes(q) || log.type.toLowerCase().includes(q)
  })

  const totalRevenue = orders.reduce((a, o) => a + o.total, 0)
  const totalCartItems = cartItems.reduce((a, i) => a + i.quantity, 0)
  const totalCartAmount = cartItems.reduce((a, i) => a + (i.product.amount * i.quantity), 0)
  const loyaltyPoints = Math.round(totalRevenue / 100)
  const activeListingsCount = 1235 + topProducts.length

  // Derived Analytics Data
  const profitMargin = totalRevenue * 0.25
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0
  const conversionRatio = orders.length > 0 ? (orders.length / (topProducts.length * 15) * 100).toFixed(2) : "0.00"

  // Calculate category sales percentages
  const categoryRevenue = topProducts.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + (p.sales * p.amount)
    return acc
  }, {} as Record<string, number>)
  const totalProductRevenue = Object.values(categoryRevenue).reduce((a, b) => a + b, 0)
  const categoryData = Object.keys(CATEGORY_EMOJIS).map(cat => ({
    label: cat,
    pct: totalProductRevenue ? Math.round((categoryRevenue[cat] || 0) / totalProductRevenue * 100) : 0,
    color: ['bg-blue-600', 'bg-amber-500', 'bg-indigo-600', 'bg-emerald-500', 'bg-rose-400', 'bg-purple-500'][Object.keys(CATEGORY_EMOJIS).indexOf(cat) % 6]
  })).sort((a, b) => b.pct - a.pct).filter(c => c.pct > 0)

  // ─── Cart Handlers ─────────────────────────────────────────────────────────

  const handleAddToCart = (productId: number) => {
    const p = topProducts.find(p => p.id === productId)
    if (!p || p.stock <= 0) { alert(`${p?.name || 'Product'} is out of stock!`); return }
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === productId)
      if (existing) return prev.map(i => i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product: p, quantity: 1 }]
    })
    setTopProducts(prev => prev.map(x => x.id === productId ? { ...x, stock: x.stock - 1, sales: x.sales + 1 } : x))
    addLog(`Added "${p.name}" to cart`, 'customer')
  }

  const handleRemoveFromCart = (productId: number, qty: number) => {
    const p = topProducts.find(x => x.id === productId)
    setCartItems(prev => prev.filter(i => i.product.id !== productId))
    setTopProducts(prev => prev.map(x => x.id === productId ? { ...x, stock: x.stock + qty, sales: x.sales - qty } : x))
    if (p) addLog(`Removed "${p.name}" from cart`, 'customer')
  }

  const handleBuyNow = (product: Product) => {
    if (product.stock <= 0) { alert(`${product.name} is out of stock!`); return }
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`
    const newOrder: Order = {
      id: orderId, customerName: profileName, customerEmail: profileEmail,
      date: new Date().toISOString().split('T')[0], total: product.amount,
      status: 'Pending', items: `${product.name} (x1)`,
      trackingSteps: [
        { title: 'Order Placed', completed: true, date: 'Just now' },
        { title: 'Processing', completed: false },
        { title: 'In Transit (Colombo Hub)', completed: false },
        { title: 'Out for Delivery', completed: false }
      ]
    }
    setOrders(prev => [newOrder, ...prev])
    setSelectedOrderToTrack(orderId)
    setTopProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: p.stock - 1, sales: p.sales + 1 } : p))
    addLog(`Placed order ${orderId} for "${product.name}"`, 'customer')
    alert(`✅ Order ${orderId} placed! Track in the Orders tab.`)
  }

  const handleCartCheckout = () => {
    if (cartItems.length === 0) return
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`
    const itemsText = cartItems.map(i => `${i.product.name} (x${i.quantity})`).join(', ')
    const newOrder: Order = {
      id: orderId, customerName: profileName, customerEmail: profileEmail,
      date: new Date().toISOString().split('T')[0], total: totalCartAmount,
      status: 'Pending', items: itemsText,
      trackingSteps: [
        { title: 'Order Placed', completed: true, date: 'Just now' },
        { title: 'Processing', completed: false },
        { title: 'In Transit (Colombo Hub)', completed: false },
        { title: 'Out for Delivery', completed: false }
      ]
    }

    setOrders(prev => [newOrder, ...prev])

    // Update product sales and stock to reflect in Revenue and Category charts
    setTopProducts(prev => prev.map(product => {
      const cartItem = cartItems.find(i => i.product.id === product.id)
      if (cartItem) {
        return {
          ...product,
          sales: product.sales + cartItem.quantity,
          stock: Math.max(0, product.stock - cartItem.quantity)
        }
      }
      return product
    }))

    setSelectedOrderToTrack(orderId)
    setCartItems([])
    setIsCartOpen(false)
    addLog(`Placed cart order ${orderId} (${cartItems.length} items)`, 'customer')
    alert(`✅ Order ${orderId} placed successfully! Track it in Orders tab.`)
  }

  // ─── Product Handlers ──────────────────────────────────────────────────────

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setProdImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newProduct: Product = {
      id: Date.now(), name: prodName, sales: 0, category: prodCategory,
      amount: Number(prodPrice) || 0, emoji: CATEGORY_EMOJIS[prodCategory] || '🛋️',
      image: prodImage, stock: Number(prodStock) || 0
    }
    setTopProducts(prev => [newProduct, ...prev])
    setIsAddProductOpen(false)
    resetFormFields()
    addLog(`Published new product: "${prodName}" at LKR ${Number(prodPrice).toLocaleString()}`, 'admin')
  }

  const openEditModal = (product: Product) => {
    setSelectedProductToEdit(product)
    setProdName(product.name); setProdPrice(product.amount.toString())
    setProdCategory(product.category); setProdStock(product.stock.toString())
    setProdImage(product.image)
    setIsEditProductOpen(true)
  }

  const handleEditProductSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProductToEdit) return
    setTopProducts(prev => prev.map(p => p.id === selectedProductToEdit.id
      ? { ...p, name: prodName, amount: Number(prodPrice) || 0, category: prodCategory, stock: Number(prodStock) || 0, image: prodImage, emoji: CATEGORY_EMOJIS[prodCategory] || p.emoji }
      : p
    ))
    setIsEditProductOpen(false)
    setSelectedProductToEdit(null)
    resetFormFields()
    addLog(`Updated product: "${prodName}"`, 'admin')
  }

  const openDeleteConfirm = (product: Product) => {
    setProductToDelete(product)
    setIsDeleteConfirmOpen(true)
  }

  const handleDeleteProduct = () => {
    if (!productToDelete) return
    setTopProducts(prev => prev.filter(p => p.id !== productToDelete.id))
    addLog(`Deleted product: "${productToDelete.name}"`, 'admin')
    setIsDeleteConfirmOpen(false)
    setProductToDelete(null)
  }

  // ─── Order Handlers ────────────────────────────────────────────────────────

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders(prev => prev.map(order => {
      if (order.id !== orderId) return order
      const steps = order.trackingSteps.map((step, idx) => {
        let completed = false
        if (newStatus === 'Pending' && idx === 0) completed = true
        if (newStatus === 'Processing' && idx <= 1) completed = true
        if (newStatus === 'Shipped' && idx <= 2) completed = true
        if (newStatus === 'Delivered') completed = true
        return { ...step, completed, date: completed ? (step.date || new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) : undefined }
      })
      return { ...order, status: newStatus, trackingSteps: steps }
    }))
    addLog(`Updated order ${orderId} → ${newStatus}`, 'admin')
  }

  const handleNotifyClient = (order: Order) => {
    addLog(`Dispatch notification email sent to ${order.customerEmail} for ${order.id}`, 'admin')
    alert(`📧 Tracking update email dispatched to ${order.customerEmail}`)
  }

  // ─── Customer Handlers ─────────────────────────────────────────────────────

  const handleToggleCustomerStatus = (id: number, current: Customer['status']) => {
    const next = current === 'Active' ? 'Suspended' : 'Active'
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: next } : c))
    const name = customers.find(c => c.id === id)?.name
    addLog(`Account status for "${name}" changed to ${next}`, 'admin')
  }

  const handleSendCoupon = (c: Customer) => {
    addLog(`LKR 2,000 store discount coupon emailed to ${c.email}`, 'admin')
    alert(`🎟️ LKR 2,000 coupon sent to ${c.email}`)
  }

  // ─── Ticket Handlers ───────────────────────────────────────────────────────

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTicketSubject || !newTicketMessage) return
    setIsSubmittingTicket(true)
    setTimeout(() => {
      const newTicket: Ticket = {
        id: Date.now(), subject: `${newTicketCategory}: ${newTicketSubject}`,
        message: newTicketMessage, sender: 'customer', time: 'Just now', status: 'Open'
      }
      setTickets(prev => [newTicket, ...prev])
      addLog(`New support ticket submitted: "${newTicketSubject}"`, 'customer')
      setNewTicketSubject(''); setNewTicketMessage('')
      setIsSubmittingTicket(false)
      setTimeout(() => {
        const autoReply: Ticket = {
          id: Date.now() + 1, subject: `Re: ${newTicketSubject}`,
          message: `Hi ${profileName}, we have received your query about "${newTicketSubject}". Ticket #${Math.floor(10000 + Math.random() * 90000)} has been assigned. Our team will respond within 24 hours.`,
          sender: 'admin', time: 'Just now', status: 'Resolved'
        }
        setTickets(prev => [autoReply, ...prev])
        addLog('Auto-response sent for new support ticket', 'system')
      }, 1500)
    }, 1000)
  }

  // ─── Settings Handlers ─────────────────────────────────────────────────────

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingSettings(true)
    setTimeout(() => {
      setIsSavingSettings(false); setSaveSuccess(true)
      addLog('Global store configuration saved successfully', 'admin')
      setTimeout(() => setSaveSuccess(false), 2500)
    }, 1200)
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    setTimeout(() => {
      setIsSavingProfile(false); setProfileSuccess(true)

      // Update global user info in localStorage
      const userStr = localStorage.getItem('currentUser')
      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          user.name = profileName
          user.email = profileEmail
          if (profileAvatar) user.avatar = profileAvatar
          localStorage.setItem('currentUser', JSON.stringify(user))
          // Dispatch custom event to notify layout.tsx
          window.dispatchEvent(new Event('userUpdated'))
        } catch (e) { }
      }

      addLog(`Profile details updated for ${profileName}`, 'customer')
      setTimeout(() => setProfileSuccess(false), 2500)
    }, 1000)
  }

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return }
    if (newPassword.length < 6) { setPasswordError('Password must be at least 6 characters.'); return }
    setIsSavingPassword(true)
    setTimeout(() => {
      setIsSavingPassword(false); setPasswordSuccess(true)
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      addLog('Account password updated successfully', 'customer')
      setTimeout(() => setPasswordSuccess(false), 2500)
    }, 1200)
  }

  const handleExportReport = () => {
    setIsExporting(true)
    setTimeout(() => {
      const csv = "ID,Product,Category,Price (LKR),Stock,Sales\n" +
        topProducts.map(p => `${p.id},"${p.name}","${p.category}",${p.amount},${p.stock},${p.sales}`).join("\n")
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = "furniture_products_report.csv"
      document.body.appendChild(link); link.click(); document.body.removeChild(link)
      setIsExporting(false); setExportSuccess(true)
      addLog('Exported product catalog to CSV', 'admin')
      setTimeout(() => setExportSuccess(false), 3000)
    }, 1500)
  }

  // ─── UI Helpers ────────────────────────────────────────────────────────────

  const getHeaderTitle = () => {
    const map: Record<string, [string, string]> = {
      overview: ['Dashboard Overview', 'Store analytics, product catalog, and live activity feed.'],
      orders: currentRole === 'admin'
        ? ['Order Dispatch Control', 'Manage incoming orders, update logistics status, and notify clients.']
        : ['My Orders & Tracking', 'Monitor your active shipments and review past purchases.'],
      analytics: currentRole === 'admin'
        ? ['Sales Analytics', 'Revenue trends, category performance, and conversion metrics.']
        : ['My Insights', 'Your purchase history, loyalty rewards, and membership tier.'],
      customers: currentRole === 'admin'
        ? ['Customer Directory', 'Monitor buyer accounts, manage access, and send vouchers.']
        : ['Help Desk & Support', 'Submit support tickets and track replies from our team.'],
      settings: currentRole === 'admin'
        ? ['Store Settings', 'Configure store-wide tax, shipping, invoicing, and security.']
        : ['Account Settings', 'Manage your profile, security, and notification preferences.'],
    }
    return map[currentTab] || map.overview
  }

  const [headerTitle, headerDesc] = getHeaderTitle()

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">

      {/* ── PAGE HEADER ─────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">{headerTitle}</h1>
            <Badge className={`font-bold py-1 px-3 rounded-full text-xs shadow-sm border-none ${currentRole === 'admin' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'}`}>
              {currentRole === 'admin' ? '🛡️ Admin' : '👤 Customer'}
            </Badge>
          </div>
          <p className="text-slate-400 font-medium mt-1.5 text-sm">{headerDesc}</p>
        </div>

        <div className="flex items-center gap-3 ml-auto lg:ml-0 relative z-40 flex-wrap">
          {/* Customer Cart */}
          {currentRole === 'customer' && currentTab === 'overview' && (
            <div className="relative">
              <button
                id="cart-toggle-btn"
                onClick={() => setIsCartOpen(!isCartOpen)}
                className="relative bg-slate-950 hover:bg-slate-800 text-white font-bold p-2.5 rounded-full px-5 flex items-center gap-2 text-xs shadow-lg transition-all active:scale-95"
              >
                <ShoppingBag size={15} className="text-amber-400" />
                My Cart
                {totalCartItems > 0 && (
                  <span className="ml-1 bg-amber-400 text-slate-950 rounded-full px-1.5 text-[10px] font-black">{totalCartItems}</span>
                )}
              </button>

              {isCartOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50/80">
                    <h4 className="font-black text-slate-900 text-sm">Shopping Cart</h4>
                    <Badge variant="outline" className="text-[10px] font-bold text-amber-700 bg-amber-50">{totalCartItems} items</Badge>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                    {cartItems.length > 0 ? cartItems.map(item => (
                      <div key={item.product.id} className="flex items-center gap-3 px-4 py-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-50 border flex items-center justify-center text-lg shrink-0 overflow-hidden">
                          {item.product.image ? <img src={item.product.image} alt="" className="w-full h-full object-cover" /> : item.product.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-900 text-xs truncate">{item.product.name}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">LKR {item.product.amount.toLocaleString()} × {item.quantity}</p>
                        </div>
                        <button onClick={() => handleRemoveFromCart(item.product.id, item.quantity)} className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    )) : (
                      <div className="text-center py-10 text-xs font-semibold text-slate-400">Your cart is empty.</div>
                    )}
                  </div>
                  {cartItems.length > 0 && (
                    <div className="px-4 py-3 border-t bg-slate-50/80 space-y-3">
                      <div className="flex justify-between text-xs font-black text-slate-900">
                        <span>Total Payable</span>
                        <span className="text-blue-600">LKR {totalCartAmount.toLocaleString()}</span>
                      </div>
                      <Button onClick={handleCartCheckout} className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-xs rounded-xl h-9 shadow-md">
                        Proceed to Checkout
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Admin Header Actions */}
          {currentRole === 'admin' && currentTab === 'overview' && (
            <>
              <Button variant="outline" onClick={handleExportReport} disabled={isExporting}
                className={`rounded-full px-5 border-slate-200 text-slate-700 font-semibold h-10 text-xs transition-all ${exportSuccess ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50'}`}>
                {isExporting ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Generating...</> : exportSuccess ? <><Check className="mr-2 h-3.5 w-3.5" />Downloaded!</> : <><Download className="mr-2 h-3.5 w-3.5" />Export CSV</>}
              </Button>
              <Button id="add-product-btn" onClick={() => setIsAddProductOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 gap-2 text-xs shadow-md font-bold h-10">
                <Plus size={16} /> Add Product
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TAB: OVERVIEW
      ══════════════════════════════════════════════════════════════ */}
      {currentTab === 'overview' && (
        <>
          {/* Hero Banner */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 overflow-hidden border-none shadow-xl bg-gradient-to-br from-blue-800 to-indigo-950 text-white relative group min-h-[240px]">
              <img src="/blue-chairs.jpg" alt="Collection" className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/70 to-transparent" />
              <CardContent className="relative p-8 h-full flex flex-col justify-center space-y-4 z-10">
                <Badge className="w-fit bg-blue-400/20 text-blue-100 border-blue-300/20 backdrop-blur font-semibold text-[11px]">
                  <Sparkles size={11} className="mr-1" /> Premium Collection Live
                </Badge>
                <h2 className="text-3xl md:text-4xl font-black tracking-tight max-w-md leading-tight">
                  {currentRole === 'admin' ? 'Admin Control Center Active.' : 'Upgrade your living space today.'}
                </h2>
                <p className="text-blue-100/80 max-w-sm text-sm font-medium">
                  {currentRole === 'admin'
                    ? `${topProducts.length} products live. ${orders.filter(o => o.status !== 'Delivered').length} active shipments in transit.`
                    : 'New arrivals in premium furniture. Shop the Nordic Blue armchair series.'}
                </p>
              </CardContent>
            </Card>

            <Card className="glass-panel premium-shadow premium-hover overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {currentRole === 'admin' ? 'Monthly Revenue' : 'Loyalty Status'}
                  </CardTitle>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-bold rounded-lg text-[10px]">+24.8%</Badge>
                </div>
                <div className="text-3xl font-black text-slate-900 mt-1">
                  {currentRole === 'admin' ? `LKR ${(topProducts.reduce((a, p) => a + (p.amount * p.sales / 1000), 0) / 1000).toFixed(1)}M` : 'Silver Tier'}
                </div>
              </CardHeader>
              <div className="px-2 pt-4">
                <svg viewBox="0 0 400 100" className="w-full h-20 text-blue-600 drop-shadow-md">
                  <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" /><stop offset="100%" stopColor="#2563eb" stopOpacity="0" /></linearGradient></defs>
                  <path d="M0,90 C40,75 80,80 120,50 C165,15 210,40 255,25 C300,8 350,12 400,4 L400,100 L0,100 Z" fill="url(#cg)" />
                  <path d="M0,90 C40,75 80,80 120,50 C165,15 210,40 255,25 C300,8 350,12 400,4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </div>
              <CardContent className="pb-4 pt-1">
                <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
                  <Clock size={13} className="text-blue-500 animate-spin [animation-duration:4s]" /> Real-time data synced
                </p>
              </CardContent>
            </Card>
          </div>

          {/* KPI Cards */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {currentRole === 'admin' ? (
              <>
                {[
                  { label: 'Total Revenue', value: `LKR ${(totalRevenue + 1245000).toLocaleString()}`, sub: '+12.5% from last month', icon: DollarSign, color: 'blue', trend: 'up' },
                  { label: 'Sales Orders', value: `${orders.length} Orders`, sub: '+8.2% since last week', icon: ShoppingCart, color: 'amber', trend: 'up' },
                  { label: 'Active Listings', value: `${activeListingsCount}`, sub: `${topProducts.length} products visible`, icon: Package, color: 'indigo', trend: 'up' },
                  { label: 'Low Stock Alerts', value: `${topProducts.filter(p => p.stock <= 6).length} Items`, sub: 'Need restocking soon', icon: AlertTriangle, color: 'rose', trend: 'warn' },
                ].map(({ label, value, sub, icon: Icon, color, trend }) => (
                  <Card key={label} className="border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</CardTitle>
                      <div className={`p-2 bg-${color}-50 text-${color}-600 rounded-xl`}><Icon size={17} /></div>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-black ${trend === 'warn' ? 'text-rose-600' : 'text-slate-900'}`}>{value}</div>
                      <p className={`text-xs mt-2 font-bold flex items-center gap-1 ${trend === 'up' ? 'text-emerald-600' : trend === 'warn' ? 'text-rose-500' : 'text-slate-400'}`}>
                        {trend === 'up' ? <TrendingUp size={13} /> : trend === 'warn' ? <AlertTriangle size={13} /> : null}{sub}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <>
                {[
                  { label: 'My Cart Items', value: `${totalCartItems} items`, sub: 'Ready for checkout', icon: ShoppingBag, color: 'amber' },
                  { label: 'Active Deliveries', value: `${orders.filter(o => o.status !== 'Delivered').length} Packages`, sub: 'In transit via Colombo Hub', icon: Truck, color: 'indigo' },
                  { label: 'Loyalty Points', value: `${loyaltyPoints} pts`, sub: 'Silver Tier Active', icon: Award, color: 'emerald' },
                  { label: 'Security Status', value: 'Protected', sub: 'SSL encrypted session', icon: ShieldCheck, color: 'blue' },
                ].map(({ label, value, sub, icon: Icon, color }) => (
                  <Card key={label} className="border-slate-100 shadow-sm bg-white hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                      <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</CardTitle>
                      <div className={`p-2 bg-${color}-50 text-${color}-600 rounded-xl`}><Icon size={17} /></div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-black text-slate-900">{value}</div>
                      <p className="text-xs text-slate-400 mt-2 font-medium">{sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>

          {/* Showroom + Activity */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 glass-panel premium-shadow premium-hover rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Collection Showroom</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentRole === 'admin' ? `${topProducts.length} products — click Edit Catalog to modify.` : 'Browse and add to cart or buy directly.'}
                  </p>
                </div>
                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 gap-2">
                  <Filter size={12} className="text-slate-400" />
                  <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer">
                    <option value="All">All Categories</option>
                    {Object.keys(CATEGORY_EMOJIS).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {filteredProducts.length > 0 ? filteredProducts.map(product => (
                  <Card key={product.id} className="border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:border-blue-100 hover:shadow-md transition-all">
                    <div className="p-4 flex gap-4 items-start">
                      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 text-2xl overflow-hidden shadow-inner">
                        {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : <span>{product.emoji}</span>}
                      </div>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <Badge variant="outline" className="text-[9px] text-slate-400 font-bold px-2 py-0">{product.category}</Badge>
                        <h4 className="font-bold text-slate-900 text-sm truncate">{product.name}</h4>
                        <p className="font-black text-blue-600 text-xs">LKR {product.amount.toLocaleString()}</p>
                        <p className={`text-[10px] font-semibold ${product.stock <= 5 ? 'text-rose-500' : 'text-slate-400'}`}>
                          {product.stock <= 5 ? `⚠️ Only ${product.stock} left!` : `Stock: ${product.stock} units`}
                        </p>
                      </div>
                    </div>
                    <div className="bg-slate-50 px-4 py-2.5 flex items-center justify-between border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-bold">{product.sales} sold</span>
                      {currentRole === 'admin' ? (
                        <div className="flex items-center gap-1.5">
                          <Button size="sm" variant="ghost" onClick={() => openEditModal(product)}
                            className="text-blue-600 hover:bg-blue-50 text-[11px] font-bold gap-1 rounded-lg h-7 px-2">
                            <Pencil size={11} /> Edit
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => openDeleteConfirm(product)}
                            className="text-rose-500 hover:bg-rose-50 text-[11px] font-bold gap-1 rounded-lg h-7 px-2">
                            <Trash2 size={11} /> Delete
                          </Button>
                        </div>
                      ) : (
                        <div className="flex gap-1.5">
                          <Button size="sm" onClick={() => handleAddToCart(product.id)}
                            className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold h-7 rounded-lg active:scale-95 transition-transform">
                            + Cart
                          </Button>
                          <Button size="sm" onClick={() => handleBuyNow(product)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold h-7 rounded-lg active:scale-95 transition-transform">
                            Buy Now
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                )) : (
                  <div className="col-span-2 text-center py-16 text-slate-400 font-medium text-sm">No products match the current filters.</div>
                )}
              </div>
            </Card>

            {/* Live Activity Feed */}
            <Card className="glass-panel premium-shadow premium-hover p-5 flex flex-col gap-4 h-fit">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Activity className="text-emerald-500" size={15} /> Live Activity
                </h3>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 rounded-full px-2 py-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />LIVE
                </span>
              </div>
              <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
                {filteredLogs.map((log) => (
                  <div key={log.id} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                    <div className={`w-1 rounded-full shrink-0 min-h-[2.5rem] ${log.type === 'admin' ? 'bg-blue-500' : log.type === 'customer' ? 'bg-amber-400' : 'bg-emerald-500 animate-pulse'}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-800 leading-snug">{log.message}</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">{log.time} · Logged securely</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: ORDERS
      ══════════════════════════════════════════════════════════════ */}
      {currentTab === 'orders' && (
        <div className="space-y-6">
          {currentRole === 'admin' ? (
            <Card className="glass-panel premium-shadow premium-hover rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Store Dispatch Queue</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{orders.length} total orders · {orders.filter(o => o.status === 'Pending').length} pending action</p>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <div className="relative">
                      <input
                        type="text" placeholder="Search orders..."
                        value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
                        className="border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 w-44"
                      />
                    </div>
                    <select value={orderStatusFilter} onChange={e => setOrderStatusFilter(e.target.value)}
                      className="border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none bg-white">
                      <option value="All">All Statuses</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                {/* Status summary pills */}
                <div className="flex gap-3 mt-4 flex-wrap">
                  {(['Pending', 'Processing', 'Shipped', 'Delivered'] as const).map(s => (
                    <div key={s} className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black border ${STATUS_STYLES[s]}`}>
                      {orders.filter(o => o.status === s).length} {s}
                    </div>
                  ))}
                </div>
              </div>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50">
                      <TableHead className="font-black text-slate-700 text-xs">Order ID</TableHead>
                      <TableHead className="font-black text-slate-700 text-xs">Customer</TableHead>
                      <TableHead className="font-black text-slate-700 text-xs">Items</TableHead>
                      <TableHead className="font-black text-slate-700 text-xs">Date</TableHead>
                      <TableHead className="font-black text-slate-700 text-xs text-right">Total</TableHead>
                      <TableHead className="font-black text-slate-700 text-xs">Status</TableHead>
                      <TableHead className="font-black text-slate-700 text-xs text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrders.map(order => (
                      <TableRow key={order.id} className="hover:bg-slate-50/40 transition-colors">
                        <TableCell className="font-black text-slate-900 text-xs">{order.id}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-bold text-slate-800 text-xs">{order.customerName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold">{order.customerEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs font-semibold text-slate-600 max-w-[160px] truncate">{order.items}</TableCell>
                        <TableCell className="text-xs text-slate-500 font-medium">{order.date}</TableCell>
                        <TableCell className="text-right font-black text-blue-600 text-xs">LKR {order.total.toLocaleString()}</TableCell>
                        <TableCell>
                          <select
                            value={order.status}
                            onChange={e => handleStatusChange(order.id, e.target.value as Order['status'])}
                            className={`text-[11px] font-bold border rounded-lg px-2.5 py-1.5 outline-none cursor-pointer ${STATUS_STYLES[order.status]}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Processing">Processing</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                          </select>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button size="sm" variant="ghost" onClick={() => handleNotifyClient(order)}
                            className="text-xs font-bold text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg gap-1 h-7">
                            <Mail size={13} /> Email
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredOrders.length === 0 && (
                      <TableRow><TableCell colSpan={7} className="text-center py-12 text-slate-400 text-sm font-medium">No orders match your search.</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Customer order list */}
              <Card className="lg:col-span-2 glass-panel premium-shadow premium-hover p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">My Purchases</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{filteredOrders.length} orders matched</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {filteredOrders.length > 0 ? filteredOrders.map(order => (
                    <div key={order.id} onClick={() => setSelectedOrderToTrack(order.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${selectedOrderToTrack === order.id ? 'border-blue-400 bg-blue-50/30 shadow-sm' : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'}`}>
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-slate-800">{order.id}</span>
                            <Badge className={`text-[9px] font-bold border-none h-5 ${BADGE_STYLES[order.status]}`}>{order.status}</Badge>
                          </div>
                          <p className="text-xs font-bold text-slate-700 line-clamp-1">{order.items}</p>
                          <p className="text-[10px] font-semibold text-slate-400">{order.date}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-black text-blue-600 text-sm">LKR {order.total.toLocaleString()}</p>
                          <span className="text-[10px] text-slate-400 font-bold flex items-center justify-end gap-0.5 mt-1">
                            Track <ChevronRight size={10} />
                          </span>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-14 text-slate-400 font-medium text-sm">No orders yet. Browse the showroom!</div>
                  )}
                </div>
              </Card>

              {/* Shipment tracker */}
              <Card className="glass-panel premium-shadow premium-hover p-6 rounded-2xl h-fit">
                <h3 className="font-bold text-slate-900 text-sm mb-5 flex items-center gap-2">
                  <Truck size={16} className="text-blue-600" /> Live Shipment Tracker
                </h3>
                {(() => {
                  const tracked = orders.find(o => o.id === selectedOrderToTrack)
                  if (!tracked) return <div className="text-center py-8 text-xs text-slate-400 font-medium">Select an order to track.</div>
                  return (
                    <div className="space-y-5">
                      <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tracking Code</p>
                        <p className="text-sm font-black text-slate-900 mt-0.5">{tracked.id}</p>
                        <p className="text-[11px] font-bold text-blue-600 mt-1 line-clamp-1">{tracked.items}</p>
                      </div>
                      <div className="relative pl-6 border-l-2 border-slate-200 space-y-6">
                        {tracked.trackingSteps.map((step, i) => (
                          <div key={i} className="relative">
                            <span className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center border-2 transition-all ${step.completed ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                              {step.completed && <Check size={9} className="text-white" />}
                            </span>
                            <h4 className={`text-xs font-bold ${step.completed ? 'text-slate-900' : 'text-slate-400'}`}>{step.title}</h4>
                            {step.completed && <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{step.date || 'Logged'}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </Card>
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: ANALYTICS
      ══════════════════════════════════════════════════════════════ */}
      {currentTab === 'analytics' && (
        <div className="space-y-6">
          {currentRole === 'admin' ? (
            <>
              {/* KPIs */}
              <div className="grid gap-5 md:grid-cols-4">
                {[
                  { label: 'Gross Revenue', value: `LKR ${totalRevenue.toLocaleString()}`, sub: '+18.5% YoY', trend: true },
                  { label: 'Profit Margin', value: `LKR ${profitMargin.toLocaleString()}`, sub: '25% gross markup avg', trend: null },
                  { label: 'Avg Order Value', value: `LKR ${Math.round(avgOrderValue).toLocaleString()}`, sub: '+4.2% cart growth', trend: true },
                  { label: 'Conversion Ratio', value: `${conversionRatio}%`, sub: '-0.1% traffic drop', trend: false },
                ].map(({ label, value, sub, trend }) => (
                  <Card key={label} className="border-slate-100 shadow-sm bg-white p-5 hover:shadow-md transition-shadow">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                    <h4 className="text-2xl font-black text-slate-900 mt-1">{value}</h4>
                    <p className={`text-[10px] font-bold mt-2 flex items-center gap-0.5 ${trend === true ? 'text-emerald-600' : trend === false ? 'text-rose-500' : 'text-slate-400'}`}>
                      {trend === true ? <ArrowUpRight size={12} /> : trend === false ? <ArrowDownRight size={12} /> : null}{sub}
                    </p>
                  </Card>
                ))}
              </div>

              {/* Revenue chart + Category breakdown */}
              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 glass-panel premium-shadow premium-hover p-6 rounded-2xl">
                  <div className="flex items-center justify-between border-b pb-4 mb-4">
                    <div>
                      <h3 className="text-lg font-black text-slate-900">Monthly Revenue Trend</h3>
                      <p className="text-[11px] text-slate-400 font-semibold">Gross income over 7 months — Jan to Jul 2026</p>
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 font-bold text-[10px]">↑ Trending Up</Badge>
                  </div>
                  <svg viewBox="0 0 500 180" className="w-full h-44 text-blue-600 overflow-visible">
                    <defs>
                      <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    {[0, 50, 100, 150].map(y => (
                      <line key={y} x1="50" y1={20 + y * 0.8} x2="480" y2={20 + y * 0.8} stroke="#f1f5f9" strokeWidth="1" />
                    ))}
                    <line x1="50" y1="170" x2="480" y2="170" stroke="#cbd5e1" strokeWidth="1.5" />
                    {['LKR 1.5M', 'LKR 1.0M', 'LKR 500K', 'LKR 0'].map((label, i) => (
                      <text key={label} x="42" y={25 + i * 48} className="text-[9px] fill-slate-400 font-bold" textAnchor="end">{label}</text>
                    ))}
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map((month, i) => (
                      <text key={month} x={50 + i * 70} y="188" className="text-[9px] fill-slate-400 font-bold" textAnchor="middle">{month}</text>
                    ))}
                    <path d="M 50 150 Q 85 120, 120 130 T 190 100 T 260 75 T 330 50 T 400 30 T 470 18 L 470 170 L 50 170 Z" fill="url(#rg)" />
                    <path d="M 50 150 Q 85 120, 120 130 T 190 100 T 260 75 T 330 50 T 400 30 T 470 18" fill="none" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round" />
                    {[50, 120, 190, 260, 330, 400, 470].map((cx, i) => {
                      const cy = [150, 130, 100, 75, 50, 30, 18][i]
                      return <circle key={cx} cx={cx} cy={cy} r="4" fill="#fff" stroke="#2563eb" strokeWidth="2.5" />
                    })}
                  </svg>
                </Card>

                <Card className="glass-panel premium-shadow premium-hover p-6 rounded-2xl">
                  <h3 className="text-lg font-black text-slate-900 mb-5">Category Sales</h3>
                  <div className="space-y-4">
                    {categoryData.length > 0 ? categoryData.map(({ label, pct, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                          <span>{label}</span><span>{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className={`${color} h-full rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    )) : (
                      <div className="text-xs text-slate-400 font-medium">No sales data available.</div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Top Products Table */}
              <Card className="glass-panel premium-shadow premium-hover rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                  <h3 className="text-lg font-black text-slate-900">Product Performance</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Sales, revenue, and stock levels for all active products</p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50">
                        <TableHead className="font-black text-slate-700 text-xs">Product</TableHead>
                        <TableHead className="font-black text-slate-700 text-xs">Category</TableHead>
                        <TableHead className="font-black text-slate-700 text-xs text-right">Price (LKR)</TableHead>
                        <TableHead className="font-black text-slate-700 text-xs text-center">Units Sold</TableHead>
                        <TableHead className="font-black text-slate-700 text-xs text-center">Stock</TableHead>
                        <TableHead className="font-black text-slate-700 text-xs text-right">Revenue Est.</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map(p => (
                        <TableRow key={p.id} className="hover:bg-slate-50/40">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center text-base shrink-0 overflow-hidden">
                                {p.image ? <img src={p.image} alt="" className="w-full h-full object-cover" /> : p.emoji}
                              </div>
                              <span className="font-bold text-slate-900 text-xs">{p.name}</span>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="text-[9px] font-bold text-slate-500">{p.category}</Badge></TableCell>
                          <TableCell className="text-right font-black text-slate-900 text-xs">{p.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-center font-bold text-slate-700 text-xs">{p.sales}</TableCell>
                          <TableCell className="text-center">
                            <span className={`text-xs font-black ${p.stock <= 5 ? 'text-rose-600' : p.stock <= 10 ? 'text-amber-600' : 'text-emerald-600'}`}>{p.stock}</span>
                          </TableCell>
                          <TableCell className="text-right font-black text-blue-600 text-xs">{(p.amount * p.sales).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </>
          ) : (
            <>
              {/* Customer Analytics */}
              <div className="grid gap-5 md:grid-cols-3">
                {[
                  { label: 'Total Spent', value: `LKR ${orders.reduce((a, o) => a + o.total, 0).toLocaleString()}`, sub: `Over ${orders.length} orders`, color: 'text-slate-900' },
                  { label: 'Loyalty Points', value: `${loyaltyPoints} pts`, sub: '1 pt per LKR 100 spent', color: 'text-emerald-600' },
                  { label: 'Membership Tier', value: 'Silver Tier', sub: 'Priority privileges active', color: 'text-blue-600' },
                ].map(({ label, value, sub, color }) => (
                  <Card key={label} className="border-slate-100 shadow-sm bg-white p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                    <h4 className={`text-3xl font-black mt-1 ${color}`}>{value}</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-3">{sub}</p>
                  </Card>
                ))}
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 glass-panel premium-shadow premium-hover p-6 rounded-2xl">
                  <h3 className="text-lg font-black text-slate-900 mb-5">Loyalty Reward Roadmap</h3>
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-sm font-black text-slate-800">Progress to Gold Tier</p>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">Earn 5,000 pts to unlock 10% auto-discounts</p>
                        </div>
                        <span className="text-sm font-black text-blue-600">{loyaltyPoints} / 5,000 pts</span>
                      </div>
                      <div className="w-full bg-white/70 border border-blue-100 h-3 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(100, (loyaltyPoints / 5000) * 100)}%` }} />
                      </div>
                    </div>

                    <div className="border rounded-xl p-4 flex items-center justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-black text-slate-900">Claim LKR 1,000 Voucher</h4>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">Redeem 100 points for an instant discount coupon</p>
                      </div>
                      <Button
                        disabled={loyaltyPoints < 100}
                        onClick={() => {
                          alert('🎟️ Coupon CRD-1000 applied! LKR 1,000 off your next order.')
                          addLog('Redeemed 100 pts for LKR 1,000 store voucher', 'customer')
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl px-5 h-9 shrink-0"
                      >
                        Claim Reward
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card className="glass-panel premium-shadow premium-hover p-6 rounded-2xl">
                  <h3 className="font-bold text-slate-900 text-sm mb-4">Silver Member Privileges</h3>
                  <div className="space-y-3">
                    {[
                      'Free local logistics deliveries on all orders',
                      'Priority 24/7 dedicated helpdesk tickets',
                      'First-look access to new arrivals & collections',
                      'Exclusive member-only seasonal discounts',
                    ].map(perk => (
                      <p key={perk} className="text-xs text-slate-600 font-medium flex items-start gap-2">
                        <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />{perk}
                      </p>
                    ))}
                  </div>
                  <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-xl py-3 text-center">
                    <p className="text-xs font-black text-indigo-700">🏅 Silver Member Club Verified</p>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: CUSTOMERS / SUPPORT
      ══════════════════════════════════════════════════════════════ */}
      {currentTab === 'customers' && (
        <>
          {currentRole === 'admin' ? (
            <div className="space-y-6">
              {/* Customer Summary Cards */}
              <div className="grid gap-5 md:grid-cols-3">
                {[
                  { label: 'Total Customers', value: customers.length, sub: 'Registered accounts', icon: Users, color: 'blue' },
                  { label: 'Active Accounts', value: customers.filter(c => c.status === 'Active').length, sub: 'Currently authorized', icon: UserCheck, color: 'emerald' },
                  { label: 'Suspended Accounts', value: customers.filter(c => c.status === 'Suspended').length, sub: 'Access revoked', icon: UserX, color: 'rose' },
                ].map(({ label, value, sub, icon: Icon, color }) => (
                  <Card key={label} className="border-slate-100 shadow-sm bg-white p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className={`p-3 bg-${color}-50 text-${color}-600 rounded-2xl`}><Icon size={22} /></div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                      <h4 className="text-2xl font-black text-slate-900 mt-0.5">{value}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{sub}</p>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="glass-panel premium-shadow premium-hover rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Customer Directory</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{customers.length} registered buyers</p>
                  </div>
                  <div className="relative">
                    <input type="text" placeholder="Search customers..."
                      value={customerSearch} onChange={e => setCustomerSearch(e.target.value)}
                      className="border border-slate-200 rounded-xl pl-3 pr-4 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 w-52"
                    />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50/50">
                        <TableHead className="font-black text-slate-700 text-xs">Customer</TableHead>
                        <TableHead className="font-black text-slate-700 text-xs">Email</TableHead>
                        <TableHead className="font-black text-slate-700 text-xs text-center">Orders</TableHead>
                        <TableHead className="font-black text-slate-700 text-xs text-right">Total Spent</TableHead>
                        <TableHead className="font-black text-slate-700 text-xs text-center">Status</TableHead>
                        <TableHead className="font-black text-slate-700 text-xs text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCustomers.map(c => (
                        <TableRow key={c.id} className="hover:bg-slate-50/40 transition-colors">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-indigo-200 text-blue-700 flex items-center justify-center text-[10px] font-black shrink-0">
                                {c.avatar}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-xs">{c.name}</p>
                                <p className="text-[9px] text-slate-400 font-semibold">ID #{c.id}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-500 text-xs">{c.email}</TableCell>
                          <TableCell className="text-center font-black text-slate-700 text-xs">{c.ordersCount}</TableCell>
                          <TableCell className="text-right font-black text-blue-600 text-xs">LKR {c.totalSpent.toLocaleString()}</TableCell>
                          <TableCell className="text-center">
                            <Badge className={`font-bold border-none text-[10px] ${c.status === 'Active' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>{c.status}</Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <Button size="sm" variant="outline"
                                onClick={() => handleToggleCustomerStatus(c.id, c.status)}
                                className={`text-[10px] font-bold rounded-lg px-2.5 h-7 ${c.status === 'Active' ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>
                                {c.status === 'Active' ? <><UserX size={11} className="mr-1" />Suspend</> : <><UserCheck size={11} className="mr-1" />Activate</>}
                              </Button>
                              <Button size="sm" onClick={() => handleSendCoupon(c)}
                                className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-lg px-2.5 h-7">
                                <Mail size={11} className="mr-1" />Voucher
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredCustomers.length === 0 && (
                        <TableRow><TableCell colSpan={6} className="text-center py-12 text-slate-400 text-sm font-medium">No customers found.</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </Card>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Ticket Form */}
              <Card className="lg:col-span-2 glass-panel premium-shadow premium-hover p-6 rounded-2xl">
                <h3 className="text-xl font-black text-slate-900 mb-1">Create Support Request</h3>
                <p className="text-xs text-slate-400 font-medium mb-6">Describe your issue below. Our staff will reply automatically.</p>
                <form onSubmit={handleTicketSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</Label>
                      <select value={newTicketCategory} onChange={e => setNewTicketCategory(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20">
                        <option value="Order Issue">Order Issue</option>
                        <option value="Return / Refund">Return & Refund</option>
                        <option value="Product Inquiry">Product Inquiry</option>
                        <option value="Delivery">Delivery Problem</option>
                        <option value="Other">Other Query</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subject</Label>
                      <Input required placeholder="e.g., Sofa delivery delayed"
                        value={newTicketSubject} onChange={e => setNewTicketSubject(e.target.value)}
                        className="rounded-xl h-10 text-xs font-bold" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Detailed Message</Label>
                    <textarea required placeholder="Describe your issue in detail..."
                      value={newTicketMessage} onChange={e => setNewTicketMessage(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl p-3 text-xs font-semibold outline-none min-h-[110px] focus:ring-2 focus:ring-blue-500/20 resize-none" />
                  </div>
                  <div className="flex justify-end pt-1">
                    <Button type="submit" disabled={isSubmittingTicket}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-xs h-10 px-6 gap-2">
                      {isSubmittingTicket ? <><Loader2 className="animate-spin h-3.5 w-3.5" />Sending...</> : <><Send size={13} />Submit Request</>}
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Ticket Inbox */}
              <Card className="glass-panel premium-shadow premium-hover p-5 rounded-2xl h-fit">
                <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <Mail size={15} className="text-blue-600" /> Support Inbox
                  <Badge className="ml-auto bg-slate-100 text-slate-600 font-bold text-[9px]">{filteredTickets.length} messages</Badge>
                </h3>
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {filteredTickets.map(t => (
                    <div key={t.id} className={`p-3 rounded-xl border space-y-1.5 ${t.sender === 'admin' ? 'bg-blue-50/50 border-blue-100' : 'bg-slate-50 border-slate-100'}`}>
                      <div className="flex justify-between items-center">
                        <span className={`text-[9px] font-black uppercase tracking-wider ${t.sender === 'admin' ? 'text-blue-600' : 'text-amber-600'}`}>
                          {t.sender === 'admin' ? '🛡️ Support Agent' : '👤 My Ticket'}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Badge className={`text-[8px] font-black border-none h-4 ${t.status === 'Open' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>{t.status}</Badge>
                          <span className="text-[9px] text-slate-400 font-semibold">{t.time}</span>
                        </div>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 line-clamp-1">{t.subject}</h4>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed line-clamp-3">{t.message}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          )}
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: REWARDS
      ══════════════════════════════════════════════════════════════ */}
      {currentTab === 'rewards' && currentRole === 'customer' && (
        <div className="space-y-6">
          {/* Rewards Header */}
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="col-span-1 md:col-span-2 glass-panel premium-shadow premium-hover rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-8 relative">
              <div className="absolute top-0 right-0 p-8 opacity-20">
                <Award size={120} />
              </div>
              <div className="relative z-10">
                <Badge className="bg-amber-500 text-white font-black border-none mb-4 uppercase tracking-widest text-[10px]">Silver Tier Member</Badge>
                <h3 className="text-3xl font-black mb-2">Furni Club Rewards</h3>
                <p className="text-indigo-200 font-medium text-sm max-w-md leading-relaxed mb-8">Earn points on every purchase and redeem them for exclusive discounts, free shipping, and early access to new collections.</p>
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-1">Available Points</p>
                    <p className="text-4xl font-black text-white">2,450</p>
                  </div>
                  <div className="mb-1">
                    <p className="text-xs font-bold text-indigo-300 flex items-center gap-1"><ChevronRight size={14} className="text-amber-400" /> Equals LKR 2,450 discount</p>
                  </div>
                </div>
              </div>
            </Card>
            <Card className="glass-panel premium-shadow premium-hover rounded-3xl p-6 flex flex-col justify-between border border-amber-200/50 bg-gradient-to-b from-amber-50 to-white">
              <div>
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                  <Star size={24} className="fill-amber-500" />
                </div>
                <h4 className="text-lg font-black text-slate-900 mb-1">Next Tier: Gold</h4>
                <p className="text-xs text-slate-500 font-semibold mb-4">Earn 550 more points by Dec 31 to unlock Gold tier benefits.</p>
              </div>
              <div>
                <div className="h-2.5 w-full bg-amber-100 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-amber-500 rounded-full w-[80%]" />
                </div>
                <p className="text-[10px] font-black text-amber-700 text-right">80% to Gold</p>
              </div>
            </Card>
          </div>

          {/* Available Rewards */}
          <h4 className="text-lg font-black text-slate-900 mt-8 mb-4">Redeem Rewards</h4>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { id: 1, title: 'LKR 1000 Off Coupon', points: 1000, icon: Percent, color: 'text-rose-500', bg: 'bg-rose-100' },
              { id: 2, title: 'Free Premium Delivery', points: 1500, icon: Truck, color: 'text-blue-500', bg: 'bg-blue-100' },
              { id: 3, title: 'Priority Support Access', points: 500, icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-100' },
            ].map((reward) => (
              <Card key={reward.id} className="p-5 rounded-2xl border-slate-100 hover:shadow-lg transition-all group flex flex-col h-full bg-white relative overflow-hidden cursor-pointer">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${reward.bg} ${reward.color}`}>
                  <reward.icon size={20} />
                </div>
                <h5 className="font-black text-slate-900 text-sm mb-1">{reward.title}</h5>
                <p className="text-[10px] font-bold text-slate-400 mb-6">{reward.points} points required</p>
                <div className="mt-auto">
                  <Button variant="outline" className="w-full h-8 text-xs font-bold border-blue-200 text-blue-600 hover:bg-blue-50">
                    Redeem
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: COLLECTIONS
      ══════════════════════════════════════════════════════════════ */}
      {currentTab === 'collections' && currentRole === 'customer' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Curated Collections</h3>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {[
              { id: 1, title: 'Nordic Minimalism', img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=800&auto=format&fit=crop', items: 5, tag: 'Living Room' },
              { id: 2, title: 'Modern Industrial', img: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?q=80&w=800&auto=format&fit=crop', items: 3, tag: 'Bedroom' },
              { id: 3, title: 'Cozy Bohemian', img: 'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?q=80&w=800&auto=format&fit=crop', items: 7, tag: 'Patio' },
              { id: 4, title: 'Executive Chic', img: 'https://images.unsplash.com/photo-1505693314120-0d443867891c?q=80&w=800&auto=format&fit=crop', items: 4, tag: 'Home Office' },
            ].map(col => (
              <Card key={col.id} onClick={() => alert('Viewing ' + col.title + '...')} className="group overflow-hidden rounded-3xl border-0 shadow-sm relative aspect-[4/3] cursor-pointer">
                <img src={col.img} alt={col.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
                  <div>
                    <Badge className="bg-white/20 text-white backdrop-blur-md border-none font-bold text-[10px] uppercase tracking-wider mb-2">{col.tag}</Badge>
                    <h4 className="text-2xl font-black text-white leading-tight">{col.title}</h4>
                    <p className="text-slate-300 text-xs font-medium mt-1">{col.items} pieces in this look</p>
                  </div>
                  <Button size="icon" className="h-10 w-10 rounded-full bg-white text-slate-900 group-hover:scale-110 transition-transform shadow-xl shrink-0">
                    <ChevronRight size={18} className="font-black" />
                  </Button>
                </div>
                <button onClick={(e) => { e.stopPropagation(); alert('Added ' + col.title + ' to favorites!') }} className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-rose-500 transition-colors shadow-lg z-10">
                  <Heart size={18} />
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TAB: SETTINGS
      ══════════════════════════════════════════════════════════════ */}
      {currentTab === 'settings' && (
        <div className="w-full flex flex-col md:flex-row gap-8">
          {currentRole === 'admin' ? (
            <>
              {/* Admin Settings Vertical Navigation */}
              <div className="w-full md:w-72 shrink-0 flex flex-col gap-2 relative">
                <div className="sticky top-24 space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Settings Menu</h3>
                  {([
                    { key: 'general', label: 'Store Configuration', desc: 'Global identity & regions', icon: Globe },
                    { key: 'billing', label: 'Billing & Payments', desc: 'Gateways & active plans', icon: CreditCard },
                    { key: 'security', label: 'Security Center', desc: 'Passwords & access control', icon: Lock },
                    { key: 'notifications', label: 'Alert Preferences', desc: 'System event notifications', icon: Bell },
                  ] as const).map(({ key, label, desc, icon: Icon }) => (
                    <button key={key} onClick={() => setActiveSettingsTab(key)}
                      className={`flex items-start gap-3.5 p-3.5 rounded-2xl transition-all duration-300 w-full text-left group border ${activeSettingsTab === key ? 'bg-white shadow-[0_4px_20px_-4px_rgba(37,99,235,0.1)] border-blue-100 translate-x-2' : 'border-transparent hover:bg-slate-100/50 hover:translate-x-1'}`}>
                      <div className={`p-2.5 rounded-xl mt-0.5 transition-colors duration-300 ${activeSettingsTab === key ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-200 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className={`text-sm font-black tracking-tight ${activeSettingsTab === key ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{label}</p>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings Content Area */}
              <div className="flex-1 min-w-0 space-y-6">

                {/* General Settings */}
                {activeSettingsTab === 'general' && (
                  <Card className="glass-panel premium-shadow premium-hover rounded-3xl overflow-hidden border-0 bg-white/70">
                    <div className="px-8 py-8 border-b border-slate-100/60 bg-white/40">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Store Configuration</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Configure global store identity, operational settings, and regional preferences.</p>
                    </div>
                    <form onSubmit={handleSaveSettings} className="p-8 space-y-8">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Store Title</Label>
                          <Input value={storeName} onChange={e => setStoreName(e.target.value)} className="rounded-2xl border-slate-200/60 bg-slate-50/50 text-sm font-bold h-12 shadow-inner focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all px-4" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Store Support Email</Label>
                          <Input type="email" value={storeEmail} onChange={e => setStoreEmail(e.target.value)} className="rounded-2xl border-slate-200/60 bg-slate-50/50 text-sm font-bold h-12 shadow-inner focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all px-4" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                        <div className="space-y-2">
                          <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Default Currency</Label>
                          <Input value={currency} onChange={e => setCurrency(e.target.value)} className="rounded-2xl border-slate-200/60 bg-slate-50/50 text-sm font-bold h-12 shadow-inner px-4" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Base Shipping (LKR)</Label>
                          <Input type="number" value={shippingFee} onChange={e => setShippingFee(e.target.value)} className="rounded-2xl border-slate-200/60 bg-slate-50/50 text-sm font-bold h-12 shadow-inner px-4" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-black text-slate-500 uppercase tracking-widest">Global Tax Rate (%)</Label>
                          <Input type="number" value={taxRate} onChange={e => setTaxRate(e.target.value)} className="rounded-2xl border-slate-200/60 bg-slate-50/50 text-sm font-bold h-12 shadow-inner px-4" />
                        </div>
                      </div>

                      <div className="pt-4">
                        <div className="border border-slate-200/60 rounded-3xl p-6 space-y-6 bg-gradient-to-br from-slate-50 to-white shadow-sm">
                          <p className="text-xs font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                            <Sparkles size={14} className="text-amber-500" /> Advanced System Toggles
                          </p>
                          <div className="grid gap-4 lg:grid-cols-2">
                            {[
                              { label: 'Maintenance Guard Mode', desc: 'Blocks customer checkout when enabled', state: maintenanceMode, toggle: () => setMaintenanceMode(!maintenanceMode) },
                              { label: 'Automatic Invoice Emails', desc: 'Auto-send PDF invoices on successful checkout', state: autoInvoice, toggle: () => setAutoInvoice(!autoInvoice) },
                              { label: 'Review Moderation', desc: 'Approve product reviews before publishing', state: reviewModeration, toggle: () => setReviewModeration(!reviewModeration) },
                              { label: 'Enable Guest Checkout', desc: 'Allow purchases without an account', state: true, toggle: () => { } },
                              { label: 'Multi-Language Support', desc: 'Enable dynamic store translations', state: false, toggle: () => { } },
                              { label: 'Analytics Telemetry', desc: 'Send anonymous usage data to server', state: true, toggle: () => { } },
                            ].map(({ label, desc, state, toggle }) => (
                              <div key={label} className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:border-blue-100 transition-colors">
                                <div className="pr-4">
                                  <p className="text-sm font-black text-slate-800 tracking-tight">{label}</p>
                                  <p className="text-[11px] text-slate-400 font-medium mt-0.5 leading-snug">{desc}</p>
                                </div>
                                <button type="button" onClick={toggle}
                                  className={`w-12 h-6 rounded-full transition-colors relative outline-none shrink-0 ${state ? 'bg-blue-600 shadow-inner' : 'bg-slate-200 shadow-inner'}`}>
                                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-transform duration-300 ${state ? 'translate-x-[26px]' : 'translate-x-[2px]'}`} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4 border-t border-slate-100">
                        <Button type="submit" disabled={isSavingSettings}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[13px] h-12 px-8 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 gap-2">
                          {isSavingSettings ? <><Loader2 className="animate-spin h-4 w-4" />Saving Configuration...</> : saveSuccess ? <><Check className="h-4 w-4" />Saved Successfully</> : <><Save className="h-4 w-4" />Commit Changes</>}
                        </Button>
                      </div>
                    </form>
                  </Card>
                )}

                {/* Billing Settings */}
                {activeSettingsTab === 'billing' && (
                  <Card className="glass-panel premium-shadow premium-hover rounded-3xl overflow-hidden border-0 bg-white/70">
                    <div className="px-8 py-8 border-b border-slate-100/60 bg-white/40">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Billing & Payments</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Manage payment gateways, subscription plans, and transaction routing.</p>
                    </div>
                    <div className="p-8 space-y-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Current Plan</p>
                          <p className="text-lg font-black text-slate-900 mt-1">Business Pro</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Renewed Jun 1, 2026</p>
                        </div>
                        <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                          <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Revenue This Month</p>
                          <p className="text-lg font-black text-slate-900 mt-1">LKR {(totalRevenue + 480000).toLocaleString()}</p>
                          <p className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-0.5"><TrendingUp size={11} />+18.5%</p>
                        </div>
                      </div>
                      <div className="border border-slate-200 rounded-xl p-4 space-y-3">
                        <p className="text-xs font-black text-slate-700">Payment Methods Configured</p>
                        {['Visa / MasterCard Gateway', 'Bank Transfer (SLIPS)', 'Cash on Delivery'].map(m => (
                          <div key={m} className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-600 flex items-center gap-2"><Check size={13} className="text-emerald-500" />{m}</p>
                            <Badge className="bg-emerald-50 text-emerald-700 text-[9px] font-bold">Active</Badge>
                          </div>
                        ))}
                      </div>
                      <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl h-10 gap-2">
                        <CreditCard size={14} /> Manage Payment Gateway
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Security Settings */}
                {activeSettingsTab === 'security' && (
                  <Card className="glass-panel premium-shadow premium-hover rounded-3xl overflow-hidden border-0 bg-white/70">
                    <div className="px-8 py-8 border-b border-slate-100/60 bg-white/40">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Security Center</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Admin account security and global access control settings.</p>
                    </div>
                    <div className="p-8 space-y-8">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                        <ShieldCheck className="text-emerald-600 shrink-0" size={22} />
                        <div>
                          <p className="text-sm font-black text-emerald-800">Security Status: Protected</p>
                          <p className="text-[10px] text-emerald-600 font-medium">SSL encrypted · 2FA available · Last login: Today 13:52</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider">Change Admin Password</h4>
                        {[
                          { label: 'Current Password', type: 'password', ph: 'Enter current password' },
                          { label: 'New Password', type: 'password', ph: 'At least 8 characters' },
                          { label: 'Confirm Password', type: 'password', ph: 'Repeat new password' },
                        ].map(({ label, type, ph }) => (
                          <div key={label} className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{label}</Label>
                            <Input type={type} placeholder={ph} className="rounded-xl text-xs font-bold h-10" />
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-xs h-10 px-6 gap-2"
                          onClick={() => alert('Admin password updated successfully.')}>
                          <Lock size={13} /> Update Password
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Notification Settings */}
                {activeSettingsTab === 'notifications' && (
                  <Card className="glass-panel premium-shadow premium-hover rounded-3xl overflow-hidden border-0 bg-white/70">
                    <div className="px-8 py-8 border-b border-slate-100/60 bg-white/40">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">System Alerts</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Control precisely which events trigger notifications to your administrative dashboard.</p>
                    </div>
                    <div className="p-8 space-y-6">
                      {[
                        { label: 'New Order Alerts', desc: 'Notify when a new order is placed', on: alertNewOrders, toggle: () => setAlertNewOrders(v => !v) },
                        { label: 'Low Stock Warnings', desc: 'Alert when product stock drops below 6 units', on: alertLowStock, toggle: () => setAlertLowStock(v => !v) },
                        { label: 'Customer Account Updates', desc: 'Notify on account suspensions or activations', on: alertCustomerUpdates, toggle: () => setAlertCustomerUpdates(v => !v) },
                        { label: 'Revenue Milestone Alerts', desc: 'Celebrate monthly revenue milestones', on: alertRevenueMilestone, toggle: () => setAlertRevenueMilestone(v => !v) },
                        { label: 'System Maintenance Emails', desc: 'Receive technical maintenance notifications', on: alertSystemMaintenance, toggle: () => setAlertSystemMaintenance(v => !v) },
                      ].map(({ label, desc, on, toggle }) => (
                        <div key={label} className="flex items-center justify-between py-1">
                          <div>
                            <p className="text-xs font-bold text-slate-800">{label}</p>
                            <p className="text-[10px] text-slate-400 font-medium">{desc}</p>
                          </div>
                          <button onClick={toggle}
                            className={`w-11 h-6 rounded-full transition-colors relative outline-none border ${on ? 'bg-blue-600 border-blue-600' : 'bg-slate-200 border-slate-300'}`}>
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
                          </button>
                        </div>
                      ))}
                      <div className="pt-6 border-t border-slate-100">
                        <Button onClick={() => { addLog('Admin notification preferences saved', 'admin'); alert('Alert preferences saved.') }}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[13px] h-12 px-8 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 gap-2">
                          <Save size={14} /> Save Preferences
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </>
          ) : (
            /* ── CUSTOMER SETTINGS ─────────────────────────────────── */
            <>
              {/* Profile Vertical Navigation */}
              <div className="w-full md:w-72 shrink-0 flex flex-col gap-2 relative">
                <div className="sticky top-24 space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Account Settings</h3>
                  {([
                    { key: 'profile', label: 'My Profile', desc: 'Personal info & address', icon: User },
                    { key: 'security', label: 'Login Security', desc: 'Password & connected apps', icon: Lock },
                    { key: 'preferences', label: 'Preferences', desc: 'Emails & push notifications', icon: Bell },
                  ] as const).map(({ key, label, desc, icon: Icon }) => (
                    <button key={key} onClick={() => setActiveProfileTab(key)}
                      className={`flex items-start gap-3.5 p-3.5 rounded-2xl transition-all duration-300 w-full text-left group border ${activeProfileTab === key ? 'bg-white shadow-[0_4px_20px_-4px_rgba(37,99,235,0.1)] border-blue-100 translate-x-2' : 'border-transparent hover:bg-slate-100/50 hover:translate-x-1'}`}>
                      <div className={`p-2.5 rounded-xl mt-0.5 transition-colors duration-300 ${activeProfileTab === key ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-200 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className={`text-sm font-black tracking-tight ${activeProfileTab === key ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{label}</p>
                        <p className="text-[11px] font-medium text-slate-400 mt-0.5">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Settings Content Area */}
              <div className="flex-1 min-w-0 space-y-6">

                {/* Profile Tab */}
                {activeProfileTab === 'profile' && (
                  <Card className="glass-panel premium-shadow premium-hover rounded-3xl overflow-hidden border-0 bg-white/70">
                    <div className="px-8 py-8 border-b border-slate-100/60 bg-white/40">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personal Information</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Update your name, contact, delivery address and bio.</p>
                    </div>
                    <form onSubmit={handleSaveProfile} className="p-8 space-y-6">
                      {/* Avatar section */}
                      <div className="flex items-center gap-5 pb-5 border-b border-slate-100">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-xl font-black shadow-lg overflow-hidden relative group">
                          {profileAvatar ? <img src={profileAvatar} alt="Avatar" className="w-full h-full object-cover" /> : profileName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          <label className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center cursor-pointer transition-all">
                            <Camera size={16} className="text-white" />
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const reader = new FileReader()
                                reader.onload = (ev) => { if (ev.target?.result) setProfileAvatar(ev.target.result as string) }
                                reader.readAsDataURL(e.target.files[0])
                              }
                            }} />
                          </label>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{profileName}</p>
                          <p className="text-xs text-slate-400 font-medium">{profileEmail}</p>
                          <label className="mt-1.5 text-[11px] font-bold text-blue-600 flex items-center gap-1 hover:underline cursor-pointer">
                            <Camera size={11} /> Change avatar
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                const reader = new FileReader()
                                reader.onload = (ev) => { if (ev.target?.result) setProfileAvatar(ev.target.result as string) }
                                reader.readAsDataURL(e.target.files[0])
                              }
                            }} />
                          </label>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</Label>
                          <Input value={profileName} onChange={e => setProfileName(e.target.value)} className="rounded-xl text-xs font-bold h-10" />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</Label>
                          <Input type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} className="rounded-xl text-xs font-bold h-10" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</Label>
                          <div className="relative">
                            <Phone size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <Input value={profilePhone} onChange={e => setProfilePhone(e.target.value)} className="rounded-xl text-xs font-bold h-10 pl-8" />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City</Label>
                          <Input value={profileCity} onChange={e => setProfileCity(e.target.value)} className="rounded-xl text-xs font-bold h-10" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Address</Label>
                        <div className="relative">
                          <MapPin size={13} className="absolute left-3 top-3 text-slate-400" />
                          <Input value={profileAddress} onChange={e => setProfileAddress(e.target.value)} className="rounded-xl text-xs font-bold h-10 pl-8" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Short Bio</Label>
                        <textarea value={profileBio} onChange={e => setProfileBio(e.target.value)} rows={2}
                          className="w-full border border-slate-200 rounded-xl p-3 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 resize-none text-slate-700" />
                      </div>
                      <div className="flex justify-end pt-4 border-t border-slate-100">
                        <Button type="submit" disabled={isSavingProfile}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[13px] h-12 px-8 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 gap-2">
                          {isSavingProfile ? <><Loader2 className="animate-spin h-4 w-4" />Saving...</> : profileSuccess ? <><Check className="h-4 w-4" />Updated Successfully</> : <><Save className="h-4 w-4" />Save Profile Changes</>}
                        </Button>
                      </div>
                    </form>
                  </Card>
                )}

                {/* Security Tab */}
                {activeProfileTab === 'security' && (
                  <Card className="glass-panel premium-shadow premium-hover rounded-3xl overflow-hidden border-0 bg-white/70">
                    <div className="px-8 py-8 border-b border-slate-100/60 bg-white/40">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Security & Password</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Keep your account safe with a strong password.</p>
                    </div>
                    <div className="p-8 space-y-6">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                        <ShieldCheck className="text-emerald-600 shrink-0" size={20} />
                        <div>
                          <p className="text-xs font-black text-emerald-800">Account Protected</p>
                          <p className="text-[10px] text-emerald-600 font-medium">SSL encrypted · Last login: Today</p>
                        </div>
                      </div>
                      <form onSubmit={handleSavePassword} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Password</Label>
                          <Input type="password" placeholder="Enter current password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="rounded-xl text-xs font-bold h-10" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</Label>
                            <Input type="password" placeholder="Min 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="rounded-xl text-xs font-bold h-10" />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</Label>
                            <Input type="password" placeholder="Repeat new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="rounded-xl text-xs font-bold h-10" />
                          </div>
                        </div>
                        {passwordError && <p className="text-xs text-rose-600 font-bold flex items-center gap-1"><AlertTriangle size={12} />{passwordError}</p>}
                        <div className="flex justify-end pt-4 border-t border-slate-100">
                          <Button type="submit" disabled={isSavingPassword}
                            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[13px] h-12 px-8 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 gap-2">
                            {isSavingPassword ? <><Loader2 className="animate-spin h-4 w-4" />Updating...</> : passwordSuccess ? <><Check className="h-4 w-4" />Password Updated</> : <><Lock className="h-4 w-4" />Update Password</>}
                          </Button>
                        </div>
                      </form>
                    </div>
                  </Card>
                )}

                {/* Preferences Tab */}
                {activeProfileTab === 'preferences' && (
                  <Card className="glass-panel premium-shadow premium-hover rounded-3xl overflow-hidden border-0 bg-white/70">
                    <div className="px-8 py-8 border-b border-slate-100/60 bg-white/40">
                      <h3 className="text-2xl font-black text-slate-900 tracking-tight">Notification Preferences</h3>
                      <p className="text-sm text-slate-500 font-medium mt-1">Control precisely what types of emails and notifications you receive.</p>
                    </div>
                    <div className="p-8 space-y-6">
                      {[
                        { label: 'Order Status Updates', desc: 'Receive email alerts when your order status changes', state: orderUpdates, toggle: () => setOrderUpdates(!orderUpdates) },
                        { label: 'Email Notifications', desc: 'General account and billing emails', state: emailNotifs, toggle: () => setEmailNotifs(!emailNotifs) },
                        { label: 'Promotions & Offers', desc: 'Seasonal sale alerts and exclusive discount codes', state: promoNotifs, toggle: () => setPromoNotifs(!promoNotifs) },
                      ].map(({ label, desc, state, toggle }) => (
                        <div key={label} className="flex items-center justify-between py-2">
                          <div>
                            <p className="text-sm font-black text-slate-800 tracking-tight">{label}</p>
                            <p className="text-[11px] text-slate-400 font-medium mt-0.5">{desc}</p>
                          </div>
                          <button onClick={toggle}
                            className={`w-12 h-6 rounded-full transition-colors relative outline-none shrink-0 ${state ? 'bg-blue-600 shadow-inner' : 'bg-slate-200 shadow-inner'}`}>
                            <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] transition-transform duration-300 ${state ? 'translate-x-[26px]' : 'translate-x-[2px]'}`} />
                          </button>
                        </div>
                      ))}
                      <div className="pt-6 border-t border-slate-100">
                        <Button onClick={() => { addLog('Customer notification preferences saved', 'customer'); alert('Preferences saved!') }}
                          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[13px] h-12 px-8 shadow-lg shadow-blue-500/20 transition-all hover:scale-105 gap-2">
                          <Save size={14} /> Save Preferences
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: ADD PRODUCT
      ══════════════════════════════════════════════════════════════ */}
      {isAddProductOpen && currentRole === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl border border-slate-100 p-8 relative animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <button onClick={() => { setIsAddProductOpen(false); resetFormFields() }}
              className="absolute right-6 top-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"><X size={18} /></button>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900">Add New Product</h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Fill out the details to publish a new furniture listing.</p>
            </div>
            <form onSubmit={handleAddProductSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Title *</Label>
                <Input id="add-product-name" placeholder="e.g., Luxury Velvet Armchair" required value={prodName} onChange={e => setProdName(e.target.value)} className="rounded-xl h-10 text-xs font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price (LKR) *</Label>
                  <Input id="add-product-price" type="number" placeholder="85000" required value={prodPrice} onChange={e => setProdPrice(e.target.value)} className="rounded-xl h-10 text-xs font-bold" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Quantity *</Label>
                  <Input id="add-product-stock" type="number" placeholder="12" required value={prodStock} onChange={e => setProdStock(e.target.value)} className="rounded-xl h-10 text-xs font-bold" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category *</Label>
                <select value={prodCategory} onChange={e => setProdCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none font-bold text-slate-700 focus:ring-2 focus:ring-blue-500/20">
                  {Object.keys(CATEGORY_EMOJIS).map(c => <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Photo</Label>
                <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                <div onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 cursor-pointer group transition-colors">
                  {prodImage ? (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden border shadow-sm">
                      <img src={prodImage} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <>
                      <Upload size={20} className="text-slate-300 group-hover:text-blue-400 transition-colors mb-2" />
                      <p className="text-xs font-bold text-slate-500">Click to upload product image</p>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">PNG, JPG up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setIsAddProductOpen(false); resetFormFields() }} className="rounded-full px-5 font-bold text-xs h-10">Cancel</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 font-bold text-xs h-10 gap-1.5">
                  <Plus size={14} /> Publish Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: EDIT PRODUCT
      ══════════════════════════════════════════════════════════════ */}
      {isEditProductOpen && currentRole === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl border border-slate-100 p-8 relative animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh]">
            <button onClick={() => { setIsEditProductOpen(false); setSelectedProductToEdit(null); resetFormFields() }}
              className="absolute right-6 top-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 transition-colors"><X size={18} /></button>
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900">Edit Product</h2>
              <p className="text-xs text-slate-400 font-medium mt-1">Update catalog details for this product listing.</p>
            </div>
            <form onSubmit={handleEditProductSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Product Title</Label>
                <Input required value={prodName} onChange={e => setProdName(e.target.value)} className="rounded-xl h-10 text-xs font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Price (LKR)</Label>
                  <Input type="number" required value={prodPrice} onChange={e => setProdPrice(e.target.value)} className="rounded-xl h-10 text-xs font-bold" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Remaining</Label>
                  <Input type="number" required value={prodStock} onChange={e => setProdStock(e.target.value)} className="rounded-xl h-10 text-xs font-bold" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</Label>
                <select value={prodCategory} onChange={e => setProdCategory(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs outline-none font-bold text-slate-700">
                  {Object.keys(CATEGORY_EMOJIS).map(c => <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Replace Product Image</Label>
                <input type="file" ref={editFileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                <div onClick={() => editFileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-50 cursor-pointer transition-colors">
                  {prodImage ? <img src={prodImage} alt="Preview" className="w-16 h-16 object-cover rounded-lg" /> : <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5"><Upload size={13} />Click to upload new photo</p>}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setIsEditProductOpen(false); setSelectedProductToEdit(null); resetFormFields() }} className="rounded-full px-5 font-bold text-xs h-10">Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-6 font-bold text-xs h-10 gap-1.5">
                  <Check size={14} /> Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          MODAL: DELETE CONFIRM
      ══════════════════════════════════════════════════════════════ */}
      {isDeleteConfirmOpen && productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200 p-4">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl border border-slate-100 p-8 relative animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-rose-100 rounded-full flex items-center justify-center mx-auto">
                <Trash2 size={24} className="text-rose-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Delete Product?</h2>
                <p className="text-sm text-slate-500 font-medium mt-2">
                  You are about to permanently remove <span className="font-black text-slate-800">"{productToDelete.name}"</span> from the catalog. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 justify-center pt-2">
                <Button variant="outline" onClick={() => { setIsDeleteConfirmOpen(false); setProductToDelete(null) }}
                  className="rounded-full px-6 font-bold text-xs h-10">Cancel</Button>
                <Button onClick={handleDeleteProduct}
                  className="bg-rose-600 hover:bg-rose-700 text-white rounded-full px-6 font-bold text-xs h-10 gap-1.5">
                  <Trash2 size={13} /> Yes, Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    }>
      <DashboardContent />
    </Suspense>
  )
}