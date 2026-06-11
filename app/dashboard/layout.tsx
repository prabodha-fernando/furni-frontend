'use client'

import { useState, Suspense, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Search, Bell, LayoutDashboard, ShoppingBag, Users, Settings,
  BarChart3, Loader2, X, ShieldCheck, User, LogOut, ChevronRight,
  Package, Truck, Star, AlertTriangle, CheckCircle, Info, Zap,
  Menu, Mail, Award, Heart,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Notification {
  id: number
  title: string
  message: string
  type: 'order' | 'stock' | 'system' | 'success' | 'warning'
  time: string
  read: boolean
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 1, title: 'New Order Received', message: 'ORD-4929 for Premium Ergo Office Chair has been placed by Shan Diaz.', type: 'order', time: '5 min ago', read: false },
  { id: 2, title: 'Low Stock Alert', message: 'King Size Walnut Bed is running critically low — only 5 units remaining.', type: 'stock', time: '1 hr ago', read: false },
  { id: 3, title: 'Order Delivered', message: 'ORD-4927 has been successfully delivered to Prabodha Fernando.', type: 'success', time: '3 hrs ago', read: false },
  { id: 4, title: 'System Update', message: 'Dashboard analytics module synchronized with live data feed successfully.', type: 'system', time: 'Yesterday', read: true },
  { id: 5, title: 'Payment Received', message: 'Payment of LKR 275,000 confirmed for order ORD-4928 (Velvet Luxury Sofa).', type: 'success', time: 'Yesterday', read: true },
]

// ─── Notification helpers ─────────────────────────────────────────────────────

function NotificationIcon({ type }: { type: Notification['type'] }) {
  switch (type) {
    case 'order':   return <ShoppingBag size={15} className="text-blue-600" />
    case 'stock':   return <AlertTriangle size={15} className="text-amber-500" />
    case 'success': return <CheckCircle size={15} className="text-emerald-600" />
    case 'warning': return <AlertTriangle size={15} className="text-rose-500" />
    case 'system':  return <Settings size={15} className="text-slate-500" />
    default:        return <Info size={15} className="text-slate-500" />
  }
}

function notificationIconBg(type: Notification['type']): string {
  switch (type) {
    case 'order':   return 'bg-blue-50'
    case 'stock':   return 'bg-amber-50'
    case 'success': return 'bg-emerald-50'
    case 'warning': return 'bg-rose-50'
    case 'system':  return 'bg-slate-50'
    default:        return 'bg-slate-50'
  }
}

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

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(error)
    }
  }, [key, storedValue])

  return [mounted ? storedValue : initialValue, setValue] as const
}

// ─── Layout content ───────────────────────────────────────────────────────────

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  const searchQuery = searchParams.get('search') || ''
  const urlTab      = searchParams.get('tab') || 'overview'

  const [activeTab, setActiveTab] = useState(urlTab)

  useEffect(() => {
    setActiveTab(urlTab)
  }, [urlTab])

  // Derive role from the session JWT (set by the NextAuth callbacks in lib/auth.ts)
  const currentRole = ((session?.user as { role?: string })?.role ?? 'customer') as 'admin' | 'customer'

  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [notifications, setNotifications] = useLocalStorage<Notification[]>('globalNotifications', INITIAL_NOTIFICATIONS)
  const [sidebarOpen, setSidebarOpen] = useState(false) // collapsed by default on all screen sizes

  // Read profile overrides stored by the profile settings form
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; avatar?: string } | null>(null)

  useEffect(() => {
    const fetchUser = () => {
      const raw = localStorage.getItem('currentUser')
      if (raw) {
        try { setCurrentUser(JSON.parse(raw)) } catch { /* ignore malformed data */ }
      }
    }
    fetchUser()
    window.addEventListener('userUpdated', fetchUser)

    const handleNewNotification = (e: Event) => {
      const customEvent = e as CustomEvent<Omit<Notification, 'id' | 'time' | 'read'>>;
      setNotifications(prev => [{
        id: Date.now(),
        ...customEvent.detail,
        time: 'Just now',
        read: false
      }, ...prev]);
    };
    window.addEventListener('newNotification', handleNewNotification);

    return () => {
      window.removeEventListener('userUpdated', fetchUser)
      window.removeEventListener('newNotification', handleNewNotification)
    }
  }, [])

  // Redirect unauthenticated users to the login page
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  // Show a spinner while the session is resolving
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#f8fafc]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  // Render nothing while redirecting
  if (status === 'unauthenticated') return null

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMainSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set('search', value)
    } else {
      params.delete('search')
    }
    router.push(`/dashboard?${params.toString()}`)
  }

  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  const markRead    = (id: number) => setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))

  const handleTabNav = (tab: string) => {
    setActiveTab(tab)
    router.push(`/dashboard?tab=${tab}`)
    setSidebarOpen(false)
  }

  // Display name / email: prefer local profile overrides, fall back to session data
  const displayName  = currentUser?.name  ?? session?.user?.name  ?? (currentRole === 'admin' ? 'Admin User' : 'Guest')
  const displayEmail = currentUser?.email ?? session?.user?.email ?? ''
  const displayAvatar = currentUser?.avatar ?? session?.user?.image ?? undefined

  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const navItems = [
    { tab: 'overview',     icon: LayoutDashboard, label: 'Overview' },
    { tab: 'orders',       icon: ShoppingBag,     label: currentRole === 'admin' ? 'Orders' : 'My Orders' },
    { tab: 'analytics',    icon: BarChart3,        label: 'Analytics' },
    { tab: 'collections',  icon: Heart,            label: 'Wishlist' },
    { tab: 'rewards',      icon: Award,            label: 'Rewards' },
    { tab: 'customers',    icon: currentRole === 'admin' ? Users : Mail, label: currentRole === 'admin' ? 'Customers' : 'Support Inbox' },
  ]

  const activeNavItems =
    currentRole === 'admin'
      ? navItems.filter((item) => item.tab !== 'collections' && item.tab !== 'rewards')
      : navItems.filter((item) => item.tab !== 'analytics')

  return (
    <div className="flex min-h-screen w-full bg-[#f8fafc]">

      {/* Overlay — closes sidebar on click, shown on ALL sizes when open */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — slide-in drawer on all screen sizes */}
      <aside className={`fixed inset-y-0 left-4 top-4 bottom-4 z-40 w-64 flex flex-col rounded-3xl glass-panel shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+2rem)]'} overflow-hidden border border-white/80 bg-white/60`}>

        {/* Logo */}
        <div className="flex h-[72px] items-center justify-between px-6 border-b border-slate-200/50 bg-white/40">
          <button onClick={() => handleTabNav('overview')} className="flex items-center gap-2 font-black text-2xl tracking-tighter text-blue-600 outline-none hover:scale-105 transition-transform duration-300">
            🛋️ <span className="text-slate-900 drop-shadow-sm">Furni.</span>
          </button>
          {/* Close button — visible at all screen sizes */}
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-full bg-white shadow-sm text-slate-400 hover:text-slate-900 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Role badge */}
        <div className="px-5 pt-6 pb-2">
          <div className={`flex items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs font-black shadow-inner border ${currentRole === 'admin' ? 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 border-blue-200/50' : 'bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-700 border-amber-200/50'}`}>
            <ShieldCheck size={16} className={currentRole === 'admin' ? 'text-blue-500' : 'text-amber-500'} />
            {currentRole === 'admin' ? 'Admin Portal' : 'Customer Portal'}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1.5 py-4 px-5 flex flex-col overflow-y-auto">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400/80 px-2 py-2">Navigation</p>
          {activeNavItems.map(({ tab, icon: Icon, label }) => (
            <button
              key={tab}
              onClick={() => handleTabNav(tab)}
              className={`w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 font-bold transition-all duration-300 text-[13px] text-left relative overflow-hidden group ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-x-1'
                  : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 hover:translate-x-1'
              }`}
            >
              {activeTab === tab && <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] animate-[shimmer_2s_infinite]" />}
              <Icon size={18} className={activeTab === tab ? 'text-blue-100' : 'text-slate-400 group-hover:text-blue-500 transition-colors'} />
              <span className="relative z-10">{label}</span>
              {activeTab === tab && <ChevronRight size={14} className="ml-auto text-blue-200 relative z-10" />}
            </button>
          ))}

          {/* Settings at bottom */}
          <div className="flex-1" />
          <div className="border-t border-slate-200/50 pt-4 mt-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400/80 px-2 py-2">Account</p>
            <button
              onClick={() => handleTabNav('settings')}
              className={`w-full flex items-center gap-3 rounded-2xl px-3.5 py-3 font-bold transition-all duration-300 text-[13px] text-left group ${
                activeTab === 'settings'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 translate-x-1'
                  : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 hover:translate-x-1'
              }`}
            >
              <Settings size={18} className={activeTab === 'settings' ? 'text-blue-100' : 'text-slate-400 group-hover:text-blue-500 transition-colors'} />
              <span className="relative z-10">{currentRole === 'admin' ? 'Store Settings' : 'My Settings'}</span>
            </button>
          </div>
        </nav>

        {/* User card */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
            <Avatar className="h-8 w-8 border border-slate-200">
              <AvatarImage src={displayAvatar} className="object-cover" />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
              <p className="text-[10px] text-slate-400 font-medium truncate">{displayEmail}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main area — always full-width since sidebar is an overlay */}
      <div className="flex flex-col w-full">

        {/* Header */}
        <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-white/40 bg-white/60 px-4 backdrop-blur-2xl sm:px-8 gap-4 shadow-[0_4px_30px_rgb(0,0,0,0.02)]">

          {/* Hamburger — visible on ALL screen sizes to toggle the sidebar */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-500 hover:bg-slate-100/50 rounded-xl transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md hidden sm:block group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
            <input
              type="text"
              id="global-search-input"
              value={searchQuery}
              onChange={(e) => handleMainSearch(e.target.value)}
              placeholder="Search furniture, orders, customers..."
              className="w-full rounded-2xl border border-white/60 bg-white/40 shadow-inner py-2.5 pl-10 pr-4 text-[13px] outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-300 transition-all font-bold text-slate-700 placeholder:text-slate-400/80 backdrop-blur-sm"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">

            {/* Notification bell */}
            <div className="relative">
              <button
                id="notification-bell-btn"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`relative p-2.5 rounded-xl transition-all ${notificationsOpen ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                <Bell size={19} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-[18px] w-[18px] rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[9px] font-black text-white leading-none">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications panel */}
              {notificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                      <div>
                        <h3 className="text-sm font-black text-slate-900">Notifications</h3>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{unreadCount} unread alerts</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:underline">
                            Mark all read
                          </button>
                        )}
                        <button onClick={() => setNotificationsOpen(false)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                          <X size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-50">
                      {notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => markRead(n.id)}
                          className={`flex gap-3 px-5 py-3.5 cursor-pointer transition-colors ${n.read ? 'bg-white hover:bg-slate-50/50' : 'bg-blue-50/30 hover:bg-blue-50/60'}`}
                        >
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${notificationIconBg(n.type)}`}>
                            <NotificationIcon type={n.type} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-xs font-bold truncate ${n.read ? 'text-slate-700' : 'text-slate-900'}`}>{n.title}</p>
                              {!n.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                            </div>
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-0.5 line-clamp-2">{n.message}</p>
                            <p className="text-[10px] text-slate-400 font-semibold mt-1">{n.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                      <button
                        onClick={() => { setNotificationsOpen(false); handleTabNav('overview') }}
                        className="w-full text-center text-xs font-bold text-blue-600 hover:text-blue-700 py-1"
                      >
                        View all activity in Dashboard →
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button id="profile-avatar-btn" className="rounded-full outline-none ring-offset-2 focus:ring-2 focus:ring-blue-500 flex items-center gap-2">
                  <Avatar className="h-9 w-9 border-2 border-slate-200 shadow-sm">
                    <AvatarImage src={displayAvatar} className="object-cover" />
                    <AvatarFallback className="bg-blue-100 text-blue-700 font-black text-xs">{initials}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 rounded-2xl p-2 shadow-2xl border-slate-100 mt-1">
                <div className="px-3 py-3 mb-1 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
                      <AvatarImage src={displayAvatar} className="object-cover" />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-black text-sm">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-slate-900 truncate">{displayName}</p>
                      <p className="text-[10px] text-slate-400 font-semibold truncate">{displayEmail}</p>
                      <Badge className={`text-[9px] font-black mt-0.5 border-none h-4 ${currentRole === 'admin' ? 'bg-blue-600 text-white' : 'bg-amber-500 text-white'}`}>
                        {currentRole === 'admin' ? 'Administrator' : 'Customer'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  id="profile-settings-menu-item"
                  className="rounded-xl cursor-pointer font-semibold text-slate-700 gap-2 py-2.5"
                  onClick={() => handleTabNav('settings')}
                >
                  <User size={15} className="text-slate-400" />
                  {currentRole === 'admin' ? 'Store Settings' : 'Profile Settings'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="rounded-xl cursor-pointer font-semibold text-slate-700 gap-2 py-2.5"
                  onClick={() => handleTabNav('overview')}
                >
                  <Zap size={15} className="text-slate-400" />
                  Dashboard Overview
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  id="logout-menu-item"
                  className="text-rose-600 font-bold rounded-xl cursor-pointer gap-2 py-2.5"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                >
                  <LogOut size={15} />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  )
}

// ─── Public export ─────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen w-full items-center justify-center bg-[#f8fafc]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  )
}