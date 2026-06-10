'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DollarSign, Package, ShoppingCart, Download, Loader2, Check, Pencil,
  ShoppingBag, Award, Truck, TrendingUp, AlertTriangle, Trash2, Filter,
  Activity, ShieldCheck, Sparkles, Clock, ChevronRight, X, Heart,
} from 'lucide-react'
import type { Product, CartItem, SystemLog, Order } from './types'

// ─── Category / status constants ──────────────────────────────────────────────

const CATEGORY_EMOJIS: Record<string, string> = {
  'Living Room': '🛋️',
  'Dining Room': '🪑',
  'Bedroom': '🛏️',
  'Office': '👨‍💻',
  'Outdoor': '⛱️',
  'Storage': '🗄️',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface OverviewTabProps {
  currentRole: 'admin' | 'customer'
  filteredProducts: Product[]
  filteredLogs: SystemLog[]
  selectedCategory: string
  setSelectedCategory: (c: string) => void
  totalRevenue: number
  totalCartItems: number
  totalCartAmount: number
  loyaltyPoints: number
  activeListingsCount: number
  topProducts: Product[]
  orders: Order[]
  cartItems: CartItem[]
  isExporting: boolean
  exportSuccess: boolean
  isCartOpen: boolean
  setIsCartOpen: (v: boolean) => void
  handleExportReport: () => void
  setIsAddProductOpen: (v: boolean) => void
  handleAddToCart: (id: number) => void
  handleBuyNow: (p: Product) => void
  handleRemoveFromCart: (id: number, qty: number) => void
  handleCartCheckout: () => void
  openEditModal: (p: Product) => void
  openDeleteConfirm: (product: Product) => void
  wishlistItems: number[]
  toggleWishlist: (productId: number) => void
}

// ─── KPI icon background helpers (fully spelled out for Tailwind JIT) ─────────

const iconBgMap: Record<string, string> = {
  blue: 'bg-blue-50 text-blue-600',
  amber: 'bg-amber-50 text-amber-600',
  indigo: 'bg-indigo-50 text-indigo-600',
  rose: 'bg-rose-50 text-rose-600',
  emerald: 'bg-emerald-50 text-emerald-600',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OverviewTab({
  currentRole, filteredProducts, filteredLogs, selectedCategory, setSelectedCategory,
  totalRevenue, totalCartItems, totalCartAmount, loyaltyPoints, activeListingsCount,
  topProducts, orders, cartItems,
  isExporting, exportSuccess, isCartOpen, setIsCartOpen,
  handleExportReport, setIsAddProductOpen,
  handleAddToCart, handleBuyNow, handleRemoveFromCart, handleCartCheckout,
  openEditModal, openDeleteConfirm,
  wishlistItems, toggleWishlist,
}: OverviewTabProps) {
  return (
    <>
      {/* ── Hero Banner ────────────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden border-none shadow-2xl shadow-blue-900/20 bg-gradient-to-br from-blue-800 to-indigo-950 text-white relative group min-h-[260px] rounded-[2rem]">
          {/* Static hero image — using Next.js Image for optimised loading */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src="/blue-chairs.jpg"
              alt="Premium Furniture Collection"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
              priority
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-950/95 via-blue-900/70 to-transparent" />
          <CardContent className="relative p-10 h-full flex flex-col justify-center space-y-5 z-10">
            <Badge className="w-fit bg-blue-400/20 text-blue-100 border-blue-300/20 backdrop-blur-sm font-semibold text-[11px] px-3 py-1 shadow-lg">
              <Sparkles size={12} className="mr-1.5" /> Premium Collection Live
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight max-w-md leading-[1.15] drop-shadow-md">
              {currentRole === 'admin' ? 'Admin Control Center Active.' : 'Upgrade your living space today.'}
            </h2>
            <p className="text-blue-100/80 max-w-sm text-sm font-medium leading-relaxed">
              {currentRole === 'admin'
                ? `${topProducts.length} products live. ${orders.filter((o) => o.status !== 'Delivered').length} active shipments in transit.`
                : 'New arrivals in premium furniture. Shop the Nordic Blue armchair series.'}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/30 rounded-[2rem] bg-white">
          <CardHeader className="pb-2 px-6 pt-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {currentRole === 'admin' ? 'Monthly Revenue' : 'Loyalty Status'}
              </CardTitle>
              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 font-black rounded-lg text-[10px] px-2 py-0.5">+24.8%</Badge>
            </div>
            <div className="text-3xl font-black text-slate-900 mt-2">
              {currentRole === 'admin'
                ? `LKR ${(topProducts.reduce((a, p) => a + (p.amount * p.sales / 1000), 0) / 1000).toFixed(1)}M`
                : 'Silver Tier'}
            </div>
          </CardHeader>
          <div className="px-3 pt-4">
            <svg viewBox="0 0 400 100" className="w-full h-20 text-blue-600 drop-shadow-md">
              <defs>
                <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,90 C40,75 80,80 120,50 C165,15 210,40 255,25 C300,8 350,12 400,4 L400,100 L0,100 Z" fill="url(#cg)" />
              <path d="M0,90 C40,75 80,80 120,50 C165,15 210,40 255,25 C300,8 350,12 400,4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
          <CardContent className="pb-5 pt-1 px-6">
            <p className="text-[11px] text-slate-400 font-semibold flex items-center gap-1.5">
              <Clock size={13} className="text-blue-500 animate-spin [animation-duration:4s]" /> Real-time data synced
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────────────────── */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {currentRole === 'admin' ? (
          <>
            {[
              { label: 'Total Revenue', value: `LKR ${(totalRevenue + 1245000).toLocaleString()}`, sub: '+12.5% from last month', icon: DollarSign, color: 'blue', trend: 'up' as const },
              { label: 'Sales Orders', value: `${orders.length} Orders`, sub: '+8.2% since last week', icon: ShoppingCart, color: 'amber', trend: 'up' as const },
              { label: 'Active Listings', value: `${activeListingsCount}`, sub: `${topProducts.length} products visible`, icon: Package, color: 'indigo', trend: 'up' as const },
              { label: 'Low Stock Alerts', value: `${topProducts.filter((p) => p.stock <= 6).length} Items`, sub: 'Need restocking soon', icon: AlertTriangle, color: 'rose', trend: 'warn' as const },
            ].map(({ label, value, sub, icon: Icon, color, trend }) => (
              <Card key={label} className="border border-slate-100 shadow-lg shadow-slate-200/30 bg-white hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-5 pt-5">
                  <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</CardTitle>
                  <div className={`p-2.5 rounded-xl ${iconBgMap[color]} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={18} />
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
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
              { label: 'Active Deliveries', value: `${orders.filter((o) => o.status !== 'Delivered').length} Packages`, sub: 'In transit via Colombo Hub', icon: Truck, color: 'indigo' },
              { label: 'Loyalty Points', value: `${loyaltyPoints} pts`, sub: 'Silver Tier Active', icon: Award, color: 'emerald' },
              { label: 'Security Status', value: 'Protected', sub: 'SSL encrypted session', icon: ShieldCheck, color: 'blue' },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <Card key={label} className="border border-slate-100 shadow-lg shadow-slate-200/30 bg-white hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group">
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 px-5 pt-5">
                  <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</CardTitle>
                  <div className={`p-2.5 rounded-xl ${iconBgMap[color]} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={18} />
                  </div>
                </CardHeader>
                <CardContent className="px-5 pb-5">
                  <div className="text-2xl font-black text-slate-900">{value}</div>
                  <p className="text-xs text-slate-400 mt-2 font-semibold">{sub}</p>
                </CardContent>
              </Card>
            ))}
          </>
        )}
      </div>

      {/* ── Showroom + Activity ─────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden">
          <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Collection Showroom</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">
                  {currentRole === 'admin'
                    ? `${topProducts.length} products — click Edit Catalog to modify.`
                    : 'Browse and add to cart or buy directly.'}
                </p>
              </div>
              <div className="flex items-center bg-white border border-slate-200 rounded-xl px-3 py-2 gap-2 shadow-sm">
                <Filter size={13} className="text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-600 outline-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  {Object.keys(CATEGORY_EMOJIS).map((c) => <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 grid gap-4 sm:grid-cols-2">
            {filteredProducts.length > 0 ? filteredProducts.map((product) => (
              <div key={product.id} className="border border-slate-100 rounded-2xl overflow-hidden flex flex-col group hover:border-blue-200 hover:shadow-lg transition-all duration-300 bg-white">
                <div className="p-4 flex gap-4 items-start">
                  <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center shrink-0 text-2xl overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                    {product.image
                      ? (
                        /* Product images are base64 data URIs from FileReader — next/image
                           requires a known domain or unoptimised flag for data URIs, so we
                           intentionally keep a plain <img> here. */
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      )
                      : <span>{product.emoji}</span>}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <Badge variant="outline" className="text-[9px] text-slate-400 font-bold px-2 py-0 rounded-md">{product.category}</Badge>
                    <h4 className="font-black text-slate-900 text-sm truncate">{product.name}</h4>
                    <p className="font-black text-blue-600 text-sm">LKR {product.amount.toLocaleString()}</p>
                    <p className={`text-[10px] font-bold ${product.stock <= 5 ? 'text-rose-500' : 'text-slate-400'}`}>
                      {product.stock <= 5 ? `⚠️ Only ${product.stock} left!` : `Stock: ${product.stock} units`}
                    </p>
                  </div>
                  {currentRole === 'customer' && (
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="shrink-0 p-2 text-slate-300 hover:text-rose-500 transition-colors duration-300 outline-none"
                    >
                      <Heart size={20} className={wishlistItems.includes(product.id) ? "fill-rose-500 text-rose-500" : ""} />
                    </button>
                  )}
                </div>
                <div className="bg-gradient-to-r from-slate-50 to-white px-4 py-3 flex items-center justify-between border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-bold">{product.sales} sold</span>
                  {currentRole === 'admin' ? (
                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="ghost" onClick={() => openEditModal(product)} className="text-blue-600 hover:bg-blue-50 text-[11px] font-bold gap-1 rounded-xl h-8 px-3">
                        <Pencil size={12} /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openDeleteConfirm(product)} className="text-rose-500 hover:bg-rose-50 text-[11px] font-bold gap-1 rounded-xl h-8 px-3">
                        <Trash2 size={12} /> Delete
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAddToCart(product.id)} className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold h-8 rounded-xl px-3 active:scale-95 transition-transform shadow-sm">
                        + Cart
                      </Button>
                      <Button size="sm" onClick={() => handleBuyNow(product)} className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold h-8 rounded-xl px-3 active:scale-95 transition-transform shadow-sm">
                        Buy Now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="col-span-2 text-center py-20">
                <Package size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 font-semibold text-sm">No products match the current filters.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Live Activity Feed */}
        <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden h-fit">
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
            <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                <Activity className="text-emerald-500" size={14} />
              </div>
              Live Activity
            </h3>
            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 rounded-full px-2.5 py-1 flex items-center gap-1.5 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />LIVE
            </span>
          </div>
          <div className="p-5 space-y-4 max-h-[400px] overflow-y-auto">
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

      {/* ── Cart dropdown — customer only ──────────────────────────────────── */}
      {currentRole === 'customer' && (
        <div className="fixed bottom-24 right-6 z-40">
          <div className="relative">
            <button
              id="cart-toggle-btn"
              onClick={() => setIsCartOpen(!isCartOpen)}
              className="relative bg-slate-950 hover:bg-slate-800 text-white font-bold p-3 rounded-2xl px-5 flex items-center gap-2 text-xs shadow-2xl shadow-slate-900/30 transition-all active:scale-95 border border-slate-700"
            >
              <ShoppingBag size={16} className="text-amber-400" />
              My Cart
              {totalCartItems > 0 && (
                <span className="ml-1 bg-amber-400 text-slate-950 rounded-full px-2 py-0.5 text-[10px] font-black">{totalCartItems}</span>
              )}
            </button>

            {isCartOpen && (
              <div className="absolute right-0 bottom-full mb-3 w-80 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 z-50">
                <div className="flex items-center justify-between px-5 py-4 border-b bg-gradient-to-r from-slate-50 to-white">
                  <h4 className="font-black text-slate-900 text-sm">Shopping Cart</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-bold text-amber-700 bg-amber-50 border-amber-200">{totalCartItems} items</Badge>
                    <button onClick={() => setIsCartOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                      <X size={14} />
                    </button>
                  </div>
                </div>
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-50">
                  {cartItems.length > 0 ? cartItems.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-lg shrink-0 overflow-hidden">
                        {item.product.image
                          ? (
                            /* User-uploaded product images are base64 data URIs from FileReader.
                               next/image cannot optimise arbitrary data URIs, so a plain <img> is used. */
                            <img src={item.product.image} alt="" className="w-full h-full object-cover" />
                          )
                          : item.product.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-xs truncate">{item.product.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold">LKR {item.product.amount.toLocaleString()} × {item.quantity}</p>
                      </div>
                      <button onClick={() => handleRemoveFromCart(item.product.id, item.quantity)} className="p-1.5 text-slate-300 hover:text-rose-500 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )) : (
                    <div className="text-center py-12">
                      <ShoppingBag size={32} className="text-slate-200 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-400">Your cart is empty.</p>
                    </div>
                  )}
                </div>
                {cartItems.length > 0 && (
                  <div className="px-5 py-4 border-t bg-gradient-to-r from-slate-50 to-white space-y-3">
                    <div className="flex justify-between text-xs font-black text-slate-900">
                      <span>Total Payable</span>
                      <span className="text-blue-600 text-sm">LKR {totalCartAmount.toLocaleString()}</span>
                    </div>
                    <Button onClick={handleCartCheckout} className="w-full bg-blue-600 hover:bg-blue-700 font-bold text-xs rounded-xl h-10 shadow-lg shadow-blue-600/20 active:scale-[0.98] transition-transform">
                      Proceed to Checkout
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Admin floating actions ─────────────────────────────────────────── */}
      {currentRole === 'admin' && (
        <div className="fixed bottom-24 right-6 z-40 flex flex-col gap-2">
          <Button
            variant="outline"
            onClick={handleExportReport}
            disabled={isExporting}
            className={`rounded-2xl px-5 border-slate-200 text-slate-700 font-bold h-10 text-xs transition-all shadow-lg shadow-slate-200/30 ${exportSuccess ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'hover:bg-white bg-white'}`}
          >
            {isExporting
              ? <><Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />Generating...</>
              : exportSuccess
                ? <><Check className="mr-2 h-3.5 w-3.5" />Downloaded!</>
                : <><Download className="mr-2 h-3.5 w-3.5" />Export CSV</>}
          </Button>
          <Button
            id="add-product-btn"
            onClick={() => setIsAddProductOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl px-5 gap-2 text-xs shadow-xl shadow-blue-600/20 font-bold h-10 active:scale-95 transition-transform"
          >
            + Add Product
          </Button>
        </div>
      )}
    </>
  )
}
