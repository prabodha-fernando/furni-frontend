'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'

// ─── Sub-components ───────────────────────────────────────────────────────────
import { OverviewTab }                    from '@/components/dashboard/overview-tab'
import { OrdersTab }                      from '@/components/dashboard/orders-tab'
import { AnalyticsTab }                   from '@/components/dashboard/analytics-tab'
import { CustomersTab }                   from '@/components/dashboard/customers-tab'
import { SettingsTab }                    from '@/components/dashboard/settings-tab'
import { CollectionsTab, RewardsTab }     from '@/components/dashboard/collections-rewards-tabs'
import { DashboardModals }                from '@/components/dashboard/modals'

// ─── Types ────────────────────────────────────────────────────────────────────
import type { Order, Customer, Ticket, Product, CartItem, SystemLog } from '../../components/dashboard/types'

// ─── Static constants ─────────────────────────────────────────────────────────

const CATEGORY_EMOJIS: Record<string, string> = {
  'Living Room': '🛋️', 'Dining Room': '🪑', 'Bedroom': '🛏️',
  'Office': '👨‍💻', 'Outdoor': '⛱️', 'Storage': '🗄️',
}

// ─── Custom localStorage hook ─────────────────────────────────────────────────

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
      if (typeof window !== 'undefined') {
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
  const { data: session } = useSession()
  const { toast } = useToast()

  // Role comes from the session JWT, never from a URL param
  const currentRole = ((session?.user as { role?: string })?.role ?? 'customer') as 'admin' | 'customer'
  const globalSearchQuery = searchParams.get('search') || ''
  const currentTab        = searchParams.get('tab')    || 'overview'

  // ── Cart ──
  const [cartItems, setCartItems]       = useLocalStorage<CartItem[]>('cartItems', [])
  const [isCartOpen, setIsCartOpen]     = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')

  // ── Modal visibility ──
  const [isAddProductOpen,    setIsAddProductOpen]    = useState(false)
  const [isEditProductOpen,   setIsEditProductOpen]   = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [productToDelete,     setProductToDelete]     = useState<Product | null>(null)
  const [isExporting,         setIsExporting]         = useState(false)
  const [exportSuccess,       setExportSuccess]       = useState(false)

  // ── Activity feed ──
  const [systemLogs, setSystemLogs] = useLocalStorage<SystemLog[]>('systemLogs', [
    { id: 1, message: 'System Live Synchronization started', type: 'system', time: 'Just now' },
    { id: 2, message: 'SSL Secure Session Initialized',      type: 'system', time: '1 min ago' },
  ])

  // ── Products ──
  const [selectedProductToEdit, setSelectedProductToEdit] = useState<Product | null>(null)
  const [topProducts, setTopProducts] = useLocalStorage<Product[]>('topProducts', [
    { id: 1, name: 'Velvet Luxury Sofa',          sales: 148, category: 'Living Room', amount: 275000, emoji: '🛋️', image: null, stock: 12 },
    { id: 2, name: 'Minimalist Wooden Table',     sales: 85,  category: 'Dining Room', amount: 120000, emoji: '🪑', image: null, stock: 8 },
    { id: 3, name: 'King Size Walnut Bed',        sales: 43,  category: 'Bedroom',     amount: 450000, emoji: '🛏️', image: null, stock: 5 },
    { id: 4, name: 'Premium Ergo Office Chair',   sales: 62,  category: 'Office',      amount: 85000,  emoji: '👨‍💻', image: null, stock: 15 },
    { id: 5, name: 'Nordic Outdoor Lounger',      sales: 29,  category: 'Outdoor',     amount: 195000, emoji: '⛱️', image: null, stock: 7 },
  ])

  // ── Product form ──
  const [prodName,     setProdName]     = useState('')
  const [prodPrice,    setProdPrice]    = useState('')
  const [prodCategory, setProdCategory] = useState('Living Room')
  const [prodStock,    setProdStock]    = useState('')
  const [prodImage,    setProdImage]    = useState<string | null>(null)

  // ── Wishlist ──
  const [wishlistItems, setWishlistItems] = useLocalStorage<number[]>('wishlistItems', [])
  const toggleWishlist = (productId: number) => {
    setWishlistItems((prev) => {
      if (prev.includes(productId)) {
        toast.info('Removed from wishlist')
        return prev.filter((id) => id !== productId)
      } else {
        toast.success('✨ Added to premium wishlist!')
        return [...prev, productId]
      }
    })
  }

  // ── Orders ──
  const [orders, setOrders] = useLocalStorage<Order[]>('orders', [
    {
      id: 'ORD-4928', customerName: 'John Doe', customerEmail: 'john@example.com',
      date: '2026-06-08', total: 275000, status: 'Shipped', items: 'Velvet Luxury Sofa (x1)',
      trackingSteps: [
        { title: 'Order Placed',               completed: true,  date: 'June 8, 09:30 AM' },
        { title: 'Processing',                 completed: true,  date: 'June 8, 02:15 PM' },
        { title: 'In Transit (Colombo Hub)',   completed: true,  date: 'June 9, 08:00 AM' },
        { title: 'Out for Delivery',           completed: false },
      ],
    },
    {
      id: 'ORD-4927', customerName: 'Prabodha Fernando', customerEmail: 'prabodha@consultant.com',
      date: '2026-06-07', total: 120000, status: 'Delivered', items: 'Minimalist Wooden Table (x1)',
      trackingSteps: [
        { title: 'Order Placed',               completed: true, date: 'June 7, 10:00 AM' },
        { title: 'Processing',                 completed: true, date: 'June 7, 01:00 PM' },
        { title: 'In Transit (Colombo Hub)',   completed: true, date: 'June 8, 09:00 AM' },
        { title: 'Out for Delivery',           completed: true, date: 'June 8, 04:30 PM' },
      ],
    },
    {
      id: 'ORD-4929', customerName: 'Shan Diaz', customerEmail: 'shan@homeowner.com',
      date: '2026-06-09', total: 85000, status: 'Processing', items: 'Premium Ergo Office Chair (x1)',
      trackingSteps: [
        { title: 'Order Placed',               completed: true, date: 'June 9, 11:00 AM' },
        { title: 'Processing',                 completed: true, date: 'June 9, 11:30 AM' },
        { title: 'In Transit (Colombo Hub)',   completed: false },
        { title: 'Out for Delivery',           completed: false },
      ],
    },
  ])
  const [selectedOrderToTrack, setSelectedOrderToTrack] = useState<string>('ORD-4928')
  const [orderSearch,          setOrderSearch]          = useState('')
  const [orderStatusFilter,    setOrderStatusFilter]    = useState('All')

  // ── Customers ──
  const [customers, setCustomers] = useLocalStorage<Customer[]>('customers', [
    { id: 1, name: 'Prabodha Fernando', email: 'prabodha@consultant.com', ordersCount: 5, totalSpent: 1245000, status: 'Active',    avatar: 'PF' },
    { id: 2, name: 'John Doe',          email: 'john@example.com',        ordersCount: 3, totalSpent: 480000,  status: 'Active',    avatar: 'JD' },
    { id: 3, name: 'Shan Diaz',         email: 'shan@homeowner.com',      ordersCount: 1, totalSpent: 85000,   status: 'Active',    avatar: 'SD' },
    { id: 4, name: 'Jane Smith',        email: 'jane@example.com',        ordersCount: 0, totalSpent: 0,       status: 'Suspended', avatar: 'JS' },
  ])
  const [customerSearch, setCustomerSearch] = useState('')

  // ── Support tickets ──
  const [tickets, setTickets] = useLocalStorage<Ticket[]>('tickets', [
    { id: 1, subject: 'Delivery Time Inquiry',   message: 'Hi support, when can I expect my Luxury Sofa order to arrive in Kandy?',                                                                          sender: 'customer', time: 'Yesterday',  status: 'Open' },
    { id: 2, subject: 'Care Instructions Response', message: 'Hello! For the Velvet Luxury Sofa, use a soft fabric brush or vacuum with a soft brush attachment. Avoid harsh chemicals.',                     sender: 'admin',    time: '2 hrs ago', status: 'Resolved' },
  ])
  const [newTicketSubject,  setNewTicketSubject]  = useState('')
  const [newTicketMessage,  setNewTicketMessage]  = useState('')
  const [newTicketCategory, setNewTicketCategory] = useState('Order Issue')
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false)

  // ── Admin store settings ──
  const [storeName,        setStoreName]        = useState('Furniture Store Colombo')
  const [storeEmail,       setStoreEmail]       = useState('admin@furniture.com')
  const [currency,         setCurrency]         = useState('LKR')
  const [shippingFee,      setShippingFee]      = useState('5000')
  const [taxRate,          setTaxRate]          = useState('8')
  const [maintenanceMode,  setMaintenanceMode]  = useState(false)
  const [autoInvoice,      setAutoInvoice]      = useState(true)
  const [reviewModeration, setReviewModeration] = useState(true)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [saveSuccess,      setSaveSuccess]      = useState(false)
  const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'billing' | 'security' | 'notifications'>('general')

  // ── Admin notification toggles ──
  const [alertNewOrders,         setAlertNewOrders]         = useState(true)
  const [alertLowStock,          setAlertLowStock]          = useState(true)
  const [alertCustomerUpdates,   setAlertCustomerUpdates]   = useState(true)
  const [alertRevenueMilestone,  setAlertRevenueMilestone]  = useState(false)
  const [alertSystemMaintenance, setAlertSystemMaintenance] = useState(true)

  // ── Customer profile settings ──
  const [profileName,     setProfileName]     = useState('John Doe')
  const [profileEmail,    setProfileEmail]    = useState('john@example.com')
  const [profileAvatar,   setProfileAvatar]   = useState<string | null>(null)
  const [profilePhone,    setProfilePhone]    = useState('+94 77 123 4567')
  const [profileAddress,  setProfileAddress]  = useState('123 Galle Road, Colombo 03')
  const [profileCity,     setProfileCity]     = useState('Colombo')
  const [profileBio,      setProfileBio]      = useState('Interior design enthusiast, Furniture collector.')
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [profileSuccess,  setProfileSuccess]  = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword,     setNewPassword]     = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [passwordSuccess,  setPasswordSuccess]  = useState(false)
  const [passwordError,    setPasswordError]    = useState('')
  const [activeProfileTab, setActiveProfileTab] = useState<'profile' | 'security' | 'preferences'>('profile')
  const [emailNotifs,  setEmailNotifs]  = useState(true)
  const [orderUpdates, setOrderUpdates] = useState(true)
  const [promoNotifs,  setPromoNotifs]  = useState(false)

  // Seed profile from session on mount
  useEffect(() => {
    const raw = localStorage.getItem('currentUser')
    if (raw) {
      try {
        const user = JSON.parse(raw)
        if (user.name)   setProfileName(user.name)
        if (user.email)  setProfileEmail(user.email)
        if (user.avatar) setProfileAvatar(user.avatar)
      } catch { /* ignore malformed data */ }
    } else if (session?.user) {
      if (session.user.name)  setProfileName(session.user.name)
      if (session.user.email) setProfileEmail(session.user.email)
    }
  }, [session])

  // ── Helpers ───────────────────────────────────────────────────────────────

  const addLog = useCallback((message: string, type: 'admin' | 'customer' | 'system') => {
    const newLog: SystemLog = {
      id: Date.now(), message, type,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    }
    setSystemLogs((prev) => [newLog, ...prev].slice(0, 8))
  }, [setSystemLogs])

  const resetFormFields = () => {
    setProdName(''); setProdPrice(''); setProdStock(''); setProdImage(null); setProdCategory('Living Room')
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setProdImage(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  // ── Derived data ──────────────────────────────────────────────────────────

  const filteredProducts = topProducts.filter((p) => {
    const q = globalSearchQuery.toLowerCase()
    return (p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) &&
      (selectedCategory === 'All' || p.category === selectedCategory)
  })

  const filteredOrders = orders.filter((o) => {
    const q = (globalSearchQuery || orderSearch).toLowerCase()
    return (o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.items.toLowerCase().includes(q)) &&
      (orderStatusFilter === 'All' || o.status === orderStatusFilter)
  })

  const filteredCustomers = customers.filter((c) => {
    const q = (globalSearchQuery || customerSearch).toLowerCase()
    return c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)
  })

  const filteredTickets = tickets.filter((t) => {
    const q = globalSearchQuery.toLowerCase()
    return t.subject.toLowerCase().includes(q) || t.message.toLowerCase().includes(q)
  })

  const filteredLogs = systemLogs.filter((log) => {
    const q = globalSearchQuery.toLowerCase()
    return log.message.toLowerCase().includes(q) || log.type.toLowerCase().includes(q)
  })

  const totalRevenue      = orders.reduce((a, o) => a + o.total, 0)
  const totalCartItems    = cartItems.reduce((a, i) => a + i.quantity, 0)
  const totalCartAmount   = cartItems.reduce((a, i) => a + (i.product.amount * i.quantity), 0)
  const loyaltyPoints     = Math.round(totalRevenue / 100)
  const activeListingsCount = 1235 + topProducts.length

  // ── Cart handlers ─────────────────────────────────────────────────────────

  const handleAddToCart = (productId: number) => {
    const p = topProducts.find((x) => x.id === productId)
    if (!p || p.stock <= 0) { toast.error(`${p?.name || 'Product'} is out of stock!`); return }
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product.id === productId)
      if (existing) return prev.map((i) => i.product.id === productId ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { product: p, quantity: 1 }]
    })
    setTopProducts((prev) => prev.map((x) => x.id === productId ? { ...x, stock: x.stock - 1, sales: x.sales + 1 } : x))
    addLog(`Added "${p.name}" to cart`, 'customer')
  }

  const handleRemoveFromCart = (productId: number, qty: number) => {
    const p = topProducts.find((x) => x.id === productId)
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId))
    setTopProducts((prev) => prev.map((x) => x.id === productId ? { ...x, stock: x.stock + qty, sales: x.sales - qty } : x))
    if (p) addLog(`Removed "${p.name}" from cart`, 'customer')
  }

  const handleBuyNow = (product: Product) => {
    if (product.stock <= 0) { toast.error(`${product.name} is out of stock!`); return }
    const orderId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`
    const newOrder: Order = {
      id: orderId, customerName: profileName, customerEmail: profileEmail,
      date: new Date().toISOString().split('T')[0], total: product.amount,
      status: 'Pending', items: `${product.name} (x1)`,
      trackingSteps: [
        { title: 'Order Placed',             completed: true, date: 'Just now' },
        { title: 'Processing',               completed: false },
        { title: 'In Transit (Colombo Hub)', completed: false },
        { title: 'Out for Delivery',         completed: false },
      ],
    }
    setOrders((prev) => [newOrder, ...prev])
    setSelectedOrderToTrack(orderId)
    setTopProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, stock: p.stock - 1, sales: p.sales + 1 } : p))
    addLog(`Placed order ${orderId} for "${product.name}"`, 'customer')
    toast.success(`✅ Order ${orderId} placed! Track in the Orders tab.`)
  }

  const handleCartCheckout = () => {
    if (cartItems.length === 0) return
    const orderId   = `ORD-${Math.floor(1000 + Math.random() * 9000)}`
    const itemsText = cartItems.map((i) => `${i.product.name} (x${i.quantity})`).join(', ')
    const newOrder: Order = {
      id: orderId, customerName: profileName, customerEmail: profileEmail,
      date: new Date().toISOString().split('T')[0], total: totalCartAmount,
      status: 'Pending', items: itemsText,
      trackingSteps: [
        { title: 'Order Placed',             completed: true, date: 'Just now' },
        { title: 'Processing',               completed: false },
        { title: 'In Transit (Colombo Hub)', completed: false },
        { title: 'Out for Delivery',         completed: false },
      ],
    }
    setOrders((prev) => [newOrder, ...prev])
    setTopProducts((prev) => prev.map((product) => {
      const cartItem = cartItems.find((i) => i.product.id === product.id)
      if (cartItem) return { ...product, sales: product.sales + cartItem.quantity, stock: Math.max(0, product.stock - cartItem.quantity) }
      return product
    }))
    setSelectedOrderToTrack(orderId)
    setCartItems([])
    setIsCartOpen(false)
    addLog(`Placed cart order ${orderId} (${cartItems.length} items)`, 'customer')
    toast.success(`✅ Order ${orderId} placed successfully! Track it in Orders tab.`)
  }

  // ── Product handlers ──────────────────────────────────────────────────────

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newProduct: Product = {
      id: Date.now(), name: prodName, sales: 0, category: prodCategory,
      amount: Number(prodPrice) || 0, emoji: CATEGORY_EMOJIS[prodCategory] || '🛋️',
      image: prodImage, stock: Number(prodStock) || 0,
    }
    setTopProducts((prev) => [newProduct, ...prev])
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
    setTopProducts((prev) => prev.map((p) => p.id === selectedProductToEdit.id
      ? { ...p, name: prodName, amount: Number(prodPrice) || 0, category: prodCategory, stock: Number(prodStock) || 0, image: prodImage, emoji: CATEGORY_EMOJIS[prodCategory] || p.emoji }
      : p,
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
    setTopProducts((prev) => prev.filter((p) => p.id !== productToDelete.id))
    addLog(`Deleted product: "${productToDelete.name}"`, 'admin')
    setIsDeleteConfirmOpen(false)
    setProductToDelete(null)
  }

  // ── Order handlers ────────────────────────────────────────────────────────

  const handleStatusChange = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) => prev.map((order) => {
      if (order.id !== orderId) return order
      const steps = order.trackingSteps.map((step, idx) => {
        let completed = false
        if (newStatus === 'Pending'    && idx === 0) completed = true
        if (newStatus === 'Processing' && idx <= 1)  completed = true
        if (newStatus === 'Shipped'    && idx <= 2)  completed = true
        if (newStatus === 'Delivered')                completed = true
        return {
          ...step, completed,
          date: completed ? (step.date || `${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`) : undefined,
        }
      })
      return { ...order, status: newStatus, trackingSteps: steps }
    }))
    addLog(`Updated order ${orderId} → ${newStatus}`, 'admin')
  }

  const handleNotifyClient = (order: Order) => {
    addLog(`Dispatch notification email sent to ${order.customerEmail} for ${order.id}`, 'admin')
    toast.info(`📧 Tracking update email dispatched to ${order.customerEmail}`)
  }

  // ── Customer handlers ─────────────────────────────────────────────────────

  const handleToggleCustomerStatus = (id: number, current: Customer['status']) => {
    const next = current === 'Active' ? 'Suspended' : 'Active'
    setCustomers((prev) => prev.map((c) => c.id === id ? { ...c, status: next } : c))
    const name = customers.find((c) => c.id === id)?.name
    addLog(`Account status for "${name}" changed to ${next}`, 'admin')
  }

  const handleSendCoupon = (c: Customer) => {
    addLog(`LKR 2,000 store discount coupon emailed to ${c.email}`, 'admin')
    toast.success(`🎟️ LKR 2,000 coupon sent to ${c.email}`)
  }

  // ── Ticket handlers ───────────────────────────────────────────────────────

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTicketSubject || !newTicketMessage) return
    setIsSubmittingTicket(true)
    setTimeout(() => {
      const newTicket: Ticket = {
        id: Date.now(), subject: `${newTicketCategory}: ${newTicketSubject}`,
        message: newTicketMessage, sender: 'customer', time: 'Just now', status: 'Open',
      }
      setTickets((prev) => [newTicket, ...prev])
      addLog(`New support ticket submitted: "${newTicketSubject}"`, 'customer')
      setNewTicketSubject(''); setNewTicketMessage('')
      setIsSubmittingTicket(false)

      // Automated response after a short delay
      setTimeout(() => {
        const autoReply: Ticket = {
          id: Date.now() + 1, subject: `Re: ${newTicketSubject}`,
          message: `Hi ${profileName}, we have received your query about "${newTicketSubject}". Ticket #${Math.floor(10000 + Math.random() * 90000)} has been assigned. Our team will respond within 24 hours.`,
          sender: 'admin', time: 'Just now', status: 'Resolved',
        }
        setTickets((prev) => [autoReply, ...prev])
        addLog('Auto-response sent for new support ticket', 'system')
      }, 1500)
    }, 1000)
  }

  // ── Settings handlers ─────────────────────────────────────────────────────

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

      // Persist profile overrides to localStorage so the layout header can pick them up
      const raw = localStorage.getItem('currentUser')
      if (raw) {
        try {
          const user = JSON.parse(raw)
          user.name  = profileName
          user.email = profileEmail
          if (profileAvatar) user.avatar = profileAvatar
          localStorage.setItem('currentUser', JSON.stringify(user))
          window.dispatchEvent(new Event('userUpdated'))
        } catch { /* ignore */ }
      }

      addLog(`Profile details updated for ${profileName}`, 'customer')
      setTimeout(() => setProfileSuccess(false), 2500)
    }, 1000)
  }

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return }
    if (newPassword.length < 6)         { setPasswordError('Password must be at least 6 characters.'); return }
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
      const csv = 'ID,Product,Category,Price (LKR),Stock,Sales\n' +
        topProducts.map((p) => `${p.id},"${p.name}","${p.category}",${p.amount},${p.stock},${p.sales}`).join('\n')
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'furniture_products_report.csv'
      document.body.appendChild(link); link.click(); document.body.removeChild(link)
      setIsExporting(false); setExportSuccess(true)
      addLog('Exported product catalog to CSV', 'admin')
      setTimeout(() => setExportSuccess(false), 3000)
    }, 1500)
  }

  // ── Shared prop bundles ───────────────────────────────────────────────────

  const toastHandlers = { toast }

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">

      {/* ── Overview ─────────────────────────────────────────────────────── */}
      {currentTab === 'overview' && (
        <OverviewTab
          currentRole={currentRole}
          filteredProducts={filteredProducts}
          filteredLogs={filteredLogs}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          totalRevenue={totalRevenue}
          totalCartItems={totalCartItems}
          totalCartAmount={totalCartAmount}
          loyaltyPoints={loyaltyPoints}
          activeListingsCount={activeListingsCount}
          topProducts={topProducts}
          orders={orders}
          cartItems={cartItems}
          isExporting={isExporting}
          exportSuccess={exportSuccess}
          isCartOpen={isCartOpen}
          setIsCartOpen={setIsCartOpen}
          handleExportReport={handleExportReport}
          setIsAddProductOpen={setIsAddProductOpen}
          handleAddToCart={handleAddToCart}
          handleBuyNow={handleBuyNow}
          handleRemoveFromCart={handleRemoveFromCart}
          handleCartCheckout={handleCartCheckout}
          openEditModal={openEditModal}
          openDeleteConfirm={openDeleteConfirm}
          wishlistItems={wishlistItems}
          toggleWishlist={toggleWishlist}
        />
      )}

      {/* ── Orders ───────────────────────────────────────────────────────── */}
      {currentTab === 'orders' && (
        <OrdersTab
          currentRole={currentRole}
          filteredOrders={filteredOrders}
          orders={orders}
          orderSearch={orderSearch}
          setOrderSearch={setOrderSearch}
          orderStatusFilter={orderStatusFilter}
          setOrderStatusFilter={setOrderStatusFilter}
          selectedOrderToTrack={selectedOrderToTrack}
          setSelectedOrderToTrack={setSelectedOrderToTrack}
          handleStatusChange={handleStatusChange}
          handleNotifyClient={handleNotifyClient}
        />
      )}

      {/* ── Analytics ────────────────────────────────────────────────────── */}
      {currentTab === 'analytics' && (
        <AnalyticsTab
          currentRole={currentRole}
          filteredProducts={filteredProducts}
          orders={orders}
          totalRevenue={totalRevenue}
          loyaltyPoints={loyaltyPoints}
          addLog={addLog}
          toast={toast}
        />
      )}

      {/* ── Customers / Support ──────────────────────────────────────────── */}
      {currentTab === 'customers' && (
        <CustomersTab
          currentRole={currentRole}
          filteredCustomers={filteredCustomers}
          filteredTickets={filteredTickets}
          customers={customers}
          customerSearch={customerSearch}
          setCustomerSearch={setCustomerSearch}
          newTicketSubject={newTicketSubject}
          setNewTicketSubject={setNewTicketSubject}
          newTicketMessage={newTicketMessage}
          setNewTicketMessage={setNewTicketMessage}
          newTicketCategory={newTicketCategory}
          setNewTicketCategory={setNewTicketCategory}
          isSubmittingTicket={isSubmittingTicket}
          profileName={profileName}
          handleTicketSubmit={handleTicketSubmit}
          handleToggleCustomerStatus={handleToggleCustomerStatus}
          handleSendCoupon={handleSendCoupon}
        />
      )}

      {/* ── Collections (customer only) ──────────────────────────────────── */}
      {currentTab === 'collections' && currentRole === 'customer' && (
        <CollectionsTab 
          toast={toast} 
          wishlistItems={wishlistItems}
          topProducts={topProducts}
          toggleWishlist={toggleWishlist}
          handleAddToCart={handleAddToCart}
          handleBuyNow={handleBuyNow}
        />
      )}

      {/* ── Rewards (customer only) ──────────────────────────────────────── */}
      {currentTab === 'rewards' && currentRole === 'customer' && (
        <RewardsTab loyaltyPoints={loyaltyPoints} />
      )}

      {/* ── Settings ─────────────────────────────────────────────────────── */}
      {currentTab === 'settings' && (
        <SettingsTab
          currentRole={currentRole}
          storeName={storeName} setStoreName={setStoreName}
          storeEmail={storeEmail} setStoreEmail={setStoreEmail}
          currency={currency} setCurrency={setCurrency}
          shippingFee={shippingFee} setShippingFee={setShippingFee}
          taxRate={taxRate} setTaxRate={setTaxRate}
          maintenanceMode={maintenanceMode} setMaintenanceMode={setMaintenanceMode}
          autoInvoice={autoInvoice} setAutoInvoice={setAutoInvoice}
          reviewModeration={reviewModeration} setReviewModeration={setReviewModeration}
          isSavingSettings={isSavingSettings} saveSuccess={saveSuccess}
          activeSettingsTab={activeSettingsTab} setActiveSettingsTab={setActiveSettingsTab}
          handleSaveSettings={handleSaveSettings}
          alertNewOrders={alertNewOrders} setAlertNewOrders={setAlertNewOrders}
          alertLowStock={alertLowStock} setAlertLowStock={setAlertLowStock}
          alertCustomerUpdates={alertCustomerUpdates} setAlertCustomerUpdates={setAlertCustomerUpdates}
          alertRevenueMilestone={alertRevenueMilestone} setAlertRevenueMilestone={setAlertRevenueMilestone}
          alertSystemMaintenance={alertSystemMaintenance} setAlertSystemMaintenance={setAlertSystemMaintenance}
          totalRevenue={totalRevenue}
          addLog={addLog}
          toast={toast}
          profileName={profileName} setProfileName={setProfileName}
          profileEmail={profileEmail} setProfileEmail={setProfileEmail}
          profileAvatar={profileAvatar} setProfileAvatar={setProfileAvatar}
          profilePhone={profilePhone} setProfilePhone={setProfilePhone}
          profileAddress={profileAddress} setProfileAddress={setProfileAddress}
          profileCity={profileCity} setProfileCity={setProfileCity}
          profileBio={profileBio} setProfileBio={setProfileBio}
          isSavingProfile={isSavingProfile} profileSuccess={profileSuccess}
          currentPassword={currentPassword} setCurrentPassword={setCurrentPassword}
          newPassword={newPassword} setNewPassword={setNewPassword}
          confirmPassword={confirmPassword} setConfirmPassword={setConfirmPassword}
          isSavingPassword={isSavingPassword} passwordSuccess={passwordSuccess} passwordError={passwordError}
          activeProfileTab={activeProfileTab} setActiveProfileTab={setActiveProfileTab}
          emailNotifs={emailNotifs} setEmailNotifs={setEmailNotifs}
          orderUpdates={orderUpdates} setOrderUpdates={setOrderUpdates}
          promoNotifs={promoNotifs} setPromoNotifs={setPromoNotifs}
          handleSaveProfile={handleSaveProfile}
          handleSavePassword={handleSavePassword}
        />
      )}

      {/* ── Modals (admin only) ──────────────────────────────────────────── */}
      <DashboardModals
        currentRole={currentRole}
        isAddProductOpen={isAddProductOpen} setIsAddProductOpen={setIsAddProductOpen}
        isEditProductOpen={isEditProductOpen} setIsEditProductOpen={setIsEditProductOpen}
        isDeleteConfirmOpen={isDeleteConfirmOpen} setIsDeleteConfirmOpen={setIsDeleteConfirmOpen}
        productToDelete={productToDelete} setProductToDelete={setProductToDelete}
        selectedProductToEdit={selectedProductToEdit} setSelectedProductToEdit={setSelectedProductToEdit}
        prodName={prodName} setProdName={setProdName}
        prodPrice={prodPrice} setProdPrice={setProdPrice}
        prodCategory={prodCategory} setProdCategory={setProdCategory}
        prodStock={prodStock} setProdStock={setProdStock}
        prodImage={prodImage} setProdImage={setProdImage}
        handleAddProductSubmit={handleAddProductSubmit}
        handleEditProductSubmit={handleEditProductSubmit}
        handleDeleteProduct={handleDeleteProduct}
        resetFormFields={resetFormFields}
        handleImageUpload={handleImageUpload}
      />
    </div>
  )
}

// ─── Page export ──────────────────────────────────────────────────────────────

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