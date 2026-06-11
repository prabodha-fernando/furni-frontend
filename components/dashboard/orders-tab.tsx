'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Mail, Truck, Check, ChevronRight, Package, Clock, MapPin,
  Search, Filter, ArrowUpRight, ShoppingBag, CheckCircle2,
  Loader2, Copy, ExternalLink, RotateCcw, FileText, Trash2,
} from 'lucide-react'
import type { Order } from './types'

// ─── Status configuration ─────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; dot: string; icon: typeof Package }> = {
  Pending:    { bg: 'bg-zinc-50',     text: 'text-zinc-700',    border: 'border-zinc-200',   dot: 'bg-zinc-400',    icon: Clock },
  Processing: { bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',  dot: 'bg-amber-500',   icon: RotateCcw },
  Shipped:    { bg: 'bg-indigo-50',   text: 'text-indigo-700',  border: 'border-indigo-200', dot: 'bg-indigo-500',  icon: Truck },
  Delivered:  { bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
}

const BADGE_STYLES: Record<string, string> = {
  Pending:    'bg-zinc-200 text-zinc-700',
  Processing: 'bg-amber-500 text-white',
  Shipped:    'bg-indigo-600 text-white',
  Delivered:  'bg-emerald-600 text-white',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface OrdersTabProps {
  currentRole: 'admin' | 'customer'
  filteredOrders: Order[]
  orders: Order[]
  orderSearch: string
  setOrderSearch: (v: string) => void
  orderStatusFilter: string
  setOrderStatusFilter: (v: string) => void
  selectedOrderToTrack: string
  setSelectedOrderToTrack: (id: string) => void
  handleStatusChange: (id: string, status: Order['status']) => void
  handleDeleteOrder: (id: string) => void
  handleNotifyClient: (order: Order) => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OrdersTab({
  currentRole, filteredOrders, orders,
  orderSearch, setOrderSearch, orderStatusFilter, setOrderStatusFilter,
  selectedOrderToTrack, setSelectedOrderToTrack,
  handleStatusChange, handleDeleteOrder, handleNotifyClient,
}: OrdersTabProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [notifyingId, setNotifyingId] = useState<string | null>(null)

  const copyOrderId = (id: string) => {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleNotifyWithFeedback = (order: Order) => {
    setNotifyingId(order.id)
    handleNotifyClient(order)
    setTimeout(() => setNotifyingId(null), 2000)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {currentRole === 'admin' ? (
        /* ── Admin: Premium Dispatch Queue ── */
        <div className="space-y-6">
          {/* Header card */}
          <Card className="rounded-[2rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/30 bg-white">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-900 text-white p-8 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-10">
                <Package size={200} />
              </div>
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <Badge className="bg-white/20 text-white font-black border-none mb-3 uppercase tracking-widest text-[10px] px-3 py-1 backdrop-blur-sm">
                    Fulfillment Center
                  </Badge>
                  <h3 className="text-3xl font-black tracking-tight">Store Dispatch Queue</h3>
                  <p className="text-indigo-200 text-sm font-medium mt-1">
                    {orders.length} total orders · {orders.filter((o) => o.status === 'Pending').length} pending action
                  </p>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary/80 transition-colors" size={14} />
                    <input
                      type="text"
                      placeholder="Search orders..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl pl-9 pr-4 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-primary/30 focus:bg-white/20 w-52 text-white placeholder:text-indigo-300 transition-all"
                    />
                  </div>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-3 py-2.5 text-xs font-bold text-white outline-none cursor-pointer focus:ring-2 focus:ring-primary/30 transition-all"
                  >
                    <option value="All" className="text-slate-900">All Statuses</option>
                    <option value="Pending" className="text-slate-900">Pending</option>
                    <option value="Processing" className="text-slate-900">Processing</option>
                    <option value="Shipped" className="text-slate-900">Shipped</option>
                    <option value="Delivered" className="text-slate-900">Delivered</option>
                  </select>
                </div>
              </div>

              {/* Status summary chips */}
              <div className="flex gap-3 mt-6 flex-wrap relative z-10">
                {(['Pending', 'Processing', 'Shipped', 'Delivered'] as const).map((s) => {
                  const count = orders.filter((o) => o.status === s).length
                  const cfg = STATUS_CONFIG[s]
                  return (
                    <button
                      key={s}
                      onClick={() => setOrderStatusFilter(orderStatusFilter === s ? 'All' : s)}
                      className={`flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-black transition-all duration-200 border ${
                        orderStatusFilter === s
                          ? 'bg-white text-slate-900 border-white shadow-lg scale-105'
                          : 'bg-white/10 text-white/90 border-white/20 hover:bg-white/20'
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${cfg.dot} ${s === 'Processing' ? 'animate-pulse' : ''}`} />
                      {count} {s}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Order rows */}
            <div className="divide-y divide-slate-100">
              {filteredOrders.map((order, rowIndex) => {
                const cfg = STATUS_CONFIG[order.status]
                const StatusIcon = cfg.icon
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: rowIndex * 0.06 }}
                    className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 hover:bg-slate-50/50 transition-colors group"
                  >
                    {/* Order info */}
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl ${cfg.bg} ${cfg.text} flex items-center justify-center shrink-0 shadow-sm border ${cfg.border}`}>
                        <StatusIcon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <button
                            onClick={() => copyOrderId(order.id)}
                            className="text-sm font-black text-slate-900 hover:text-primary transition-colors flex items-center gap-1.5"
                          >
                            {order.id}
                            {copiedId === order.id
                              ? <CheckCircle2 size={12} className="text-emerald-500" />
                              : <Copy size={12} className="text-slate-300 group-hover:text-slate-400" />}
                          </button>
                        </div>
                        <p className="text-xs font-bold text-slate-600 truncate">{order.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">{order.items}</p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="text-xs text-slate-500 font-semibold shrink-0 hidden md:block">
                      {order.date}
                    </div>

                    {/* Amount */}
                    <div className="text-sm font-black text-slate-900 shrink-0 min-w-[120px] text-right">
                      LKR {order.total.toLocaleString()}
                    </div>

                    {/* Status selector */}
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                      className={`text-[11px] font-black border rounded-xl px-3 py-2 outline-none cursor-pointer transition-all shadow-sm ${cfg.bg} ${cfg.text} ${cfg.border} hover:shadow-md focus:ring-2 focus:ring-primary/20`}
                    >
                      <option value="Pending">⏳ Pending</option>
                      <option value="Processing">🔄 Processing</option>
                      <option value="Shipped">🚚 Shipped</option>
                      <option value="Delivered">✅ Delivered</option>
                    </select>

                    {/* Notify button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleNotifyWithFeedback(order)}
                      disabled={notifyingId === order.id}
                      className={`rounded-xl text-xs font-bold gap-1.5 h-9 px-4 transition-all shrink-0 ${
                        notifyingId === order.id
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-600'
                          : 'border-slate-200 text-slate-500 hover:text-primary hover:border-primary/20 hover:bg-primary/10'
                      }`}
                    >
                      {notifyingId === order.id
                        ? <><CheckCircle2 size={14} /> Sent!</>
                        : <><Mail size={14} /> Notify</>}
                    </Button>

                    {/* Delete button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteOrder(order.id)}
                      className="rounded-xl text-xs font-bold h-9 w-9 p-0 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors shrink-0"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </motion.div>
                )
              })}
              {filteredOrders.length === 0 && (
                <div className="text-center py-16">
                  <Package size={40} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm font-semibold">No orders match your search.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      ) : (
        /* ── Customer: Premium Purchase List + Shipment Tracker ── */
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 tracking-tight">
                My Orders
              </h3>
              <p className="text-sm text-slate-500 font-medium mt-1">{filteredOrders.length} purchases tracked in real-time</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-[11px] font-black text-emerald-600 bg-emerald-50 rounded-full px-3 py-1.5 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Tracking
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Purchase list */}
            <Card className="lg:col-span-2 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 text-primary rounded-xl flex items-center justify-center shadow-sm">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">Purchase History</h4>
                      <p className="text-[11px] text-slate-400 font-semibold">{filteredOrders.length} orders total</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-50">
                {filteredOrders.length > 0 ? filteredOrders.map((order, rowIndex) => {
                  const isSelected = selectedOrderToTrack === order.id
                  const cfg = STATUS_CONFIG[order.status]
                  const StatusIcon = cfg.icon
                  const completedSteps = order.trackingSteps.filter(s => s.completed).length
                  const totalSteps = order.trackingSteps.length
                  const progress = Math.round((completedSteps / totalSteps) * 100)

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: rowIndex * 0.07 }}
                      onClick={() => setSelectedOrderToTrack(order.id)}
                      className={`p-5 transition-all duration-300 cursor-pointer group relative ${
                        isSelected
                          ? 'bg-primary/10/50 shadow-inner'
                          : 'hover:bg-slate-50/50'
                      }`}
                    >
                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary rounded-r-full" />
                      )}

                      <div className="flex items-start gap-4">
                        {/* Status icon */}
                        <div className={`w-11 h-11 rounded-2xl ${cfg.bg} ${cfg.text} flex items-center justify-center shrink-0 shadow-sm border ${cfg.border} transition-transform group-hover:scale-105`}>
                          <StatusIcon size={20} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className="text-sm font-black text-slate-900">{order.id}</span>
                                <Badge className={`text-[9px] font-black border-none h-5 px-2 ${BADGE_STYLES[order.status]}`}>
                                  {order.status}
                                </Badge>
                              </div>
                              <p className="text-xs font-bold text-slate-600 truncate">{order.items}</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-1">{order.date}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-base font-black text-slate-900">LKR {order.total.toLocaleString()}</p>
                              <div className="flex items-center justify-end gap-1 mt-1.5 text-primary">
                                <span className="text-[10px] font-black">Track</span>
                                <ChevronRight size={12} className={`transition-transform ${isSelected ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                              </div>
                            </div>
                          </div>

                          {/* Mini progress bar */}
                          <div className="mt-3">
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  order.status === 'Delivered'
                                    ? 'bg-emerald-500'
                                    : order.status === 'Shipped'
                                      ? 'bg-indigo-500'
                                      : 'bg-amber-500'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-[9px] font-bold text-slate-400 mt-1 text-right">
                              {completedSteps}/{totalSteps} steps complete
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                }) : (
                  <div className="text-center py-20">
                    <ShoppingBag size={48} className="text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 font-bold text-sm">No orders yet</p>
                    <p className="text-slate-400 text-xs font-medium mt-1">Browse the showroom to place your first order!</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Premium Shipment Tracker */}
            <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden h-fit lg:sticky lg:top-24">
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-6 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 opacity-10">
                  <Truck size={120} />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                      <MapPin size={16} />
                    </div>
                    <h3 className="font-black text-lg">Live Tracker</h3>
                  </div>
                  <p className="text-blue-200 text-xs font-semibold">Real-time shipment progress</p>
                </div>
              </div>

              {(() => {
                const tracked = orders.find((o) => o.id === selectedOrderToTrack)
                if (!tracked) {
                  return (
                    <div className="text-center py-16 px-6">
                      <Package size={40} className="text-slate-200 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-400">Select an order to track</p>
                      <p className="text-[11px] text-slate-300 font-medium mt-1">Click any order on the left</p>
                    </div>
                  )
                }

                const cfg = STATUS_CONFIG[tracked.status]
                const completedSteps = tracked.trackingSteps.filter(s => s.completed).length
                const totalSteps = tracked.trackingSteps.length

                return (
                  <div className="p-6 space-y-5">
                    {/* Tracking code card */}
                    <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-4 border border-slate-100 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Code</p>
                        <button
                          onClick={() => copyOrderId(tracked.id)}
                          className="text-[10px] font-bold text-primary hover:text-blue-700 flex items-center gap-1 transition-colors"
                        >
                          {copiedId === tracked.id ? <><CheckCircle2 size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                        </button>
                      </div>
                      <p className="text-lg font-black text-slate-900">{tracked.id}</p>
                      <p className="text-xs font-bold text-primary mt-1 truncate">{tracked.items}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge className={`text-[9px] font-black border-none ${BADGE_STYLES[tracked.status]}`}>
                          {tracked.status}
                        </Badge>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {completedSteps}/{totalSteps} milestones reached
                        </span>
                      </div>
                    </div>

                    {/* Visual timeline */}
                    <div className="relative space-y-0">
                      {tracked.trackingSteps.map((step, i) => {
                        const isLast = i === tracked.trackingSteps.length - 1
                        const isActive = step.completed && (isLast || !tracked.trackingSteps[i + 1]?.completed)
                        return (
                          <div key={i} className="flex gap-4 group">
                            {/* Timeline line + dot */}
                            <div className="flex flex-col items-center shrink-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-500 shadow-sm ${
                                step.completed
                                  ? isActive
                                    ? 'bg-primary border-primary shadow-blue-500/30 scale-110 ring-4 ring-blue-100'
                                    : 'bg-emerald-500 border-emerald-500'
                                  : 'bg-white border-slate-200'
                              }`}>
                                {step.completed
                                  ? <Check size={14} className="text-white" />
                                  : <div className="w-2 h-2 rounded-full bg-slate-200" />}
                              </div>
                              {!isLast && (
                                <div className={`w-0.5 h-10 transition-colors duration-500 ${
                                  step.completed && tracked.trackingSteps[i + 1]?.completed
                                    ? 'bg-emerald-400'
                                    : step.completed
                                      ? 'bg-gradient-to-b from-blue-400 to-slate-200'
                                      : 'bg-slate-200'
                                }`} />
                              )}
                            </div>

                            {/* Step content */}
                            <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
                              <h4 className={`text-sm font-black transition-colors ${
                                step.completed ? 'text-slate-900' : 'text-slate-400'
                              }`}>
                                {step.title}
                              </h4>
                              {step.completed && step.date && (
                                <p className="text-[11px] text-slate-500 font-semibold mt-0.5 flex items-center gap-1">
                                  <Clock size={10} /> {step.date}
                                </p>
                              )}
                              {isActive && (
                                <div className="mt-2 flex items-center gap-1.5 text-[10px] font-black text-primary bg-primary/10 rounded-full px-2.5 py-1 w-fit border border-blue-100">
                                  <span className="w-1.5 h-1.5 rounded-full bg-primary/80 animate-pulse" />
                                  Current Stage
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Action buttons */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <Button
                        variant="outline"
                        className="w-full h-10 text-xs font-bold rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 gap-2"
                        onClick={() => copyOrderId(tracked.id)}
                      >
                        <FileText size={14} />
                        {copiedId === tracked.id ? 'Copied to Clipboard!' : 'Copy Tracking ID'}
                      </Button>
                    </div>
                  </div>
                )
              })()}
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
