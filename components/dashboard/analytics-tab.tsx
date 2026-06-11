'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ArrowUpRight, ArrowDownRight, TrendingUp, CheckCircle2,
  BarChart3, PieChart, Zap, Loader2, Award,
} from 'lucide-react'
import type { Product, Order } from './types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface AnalyticsTabProps {
  currentRole: 'admin' | 'customer'
  filteredProducts: Product[]
  orders: Order[]
  totalRevenue: number
  loyaltyPoints: number
  addLog: (message: string, type: 'admin' | 'customer' | 'system') => void
  toast: { success: (msg: string) => void; error: (msg: string) => void; info: (msg: string) => void }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AnalyticsTab({
  currentRole, filteredProducts, orders,
  totalRevenue, loyaltyPoints, addLog, toast,
}: AnalyticsTabProps) {
  const [claimingVoucher, setClaimingVoucher] = useState(false)
  const [voucherClaimed, setVoucherClaimed] = useState(false)

  const profitMargin    = totalRevenue * 0.25
  const avgOrderValue   = orders.length > 0 ? totalRevenue / orders.length : 0
  const conversionRatio = orders.length > 0
    ? (orders.length / (filteredProducts.length * 15) * 100).toFixed(2)
    : '0.00'

  // Category revenue breakdown
  const CATEGORY_EMOJIS: Record<string, string> = {
    'Living Room': '🛋️', 'Dining Room': '🪑', 'Bedroom': '🛏️',
    'Office': '👨‍💻', 'Outdoor': '⛱️', 'Storage': '🗄️',
  }
  const categoryRevenue = filteredProducts.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + (p.sales * p.amount)
    return acc
  }, {} as Record<string, number>)
  const totalProductRevenue = Object.values(categoryRevenue).reduce((a, b) => a + b, 0)
  const categoryData = Object.keys(CATEGORY_EMOJIS).map((cat) => ({
    label: cat,
    emoji: CATEGORY_EMOJIS[cat],
    pct: totalProductRevenue ? Math.round((categoryRevenue[cat] || 0) / totalProductRevenue * 100) : 0,
    color: ['bg-primary', 'bg-amber-500', 'bg-indigo-600', 'bg-emerald-500', 'bg-rose-400', 'bg-purple-500'][Object.keys(CATEGORY_EMOJIS).indexOf(cat) % 6],
    textColor: ['text-primary', 'text-amber-600', 'text-indigo-600', 'text-emerald-600', 'text-rose-500', 'text-purple-600'][Object.keys(CATEGORY_EMOJIS).indexOf(cat) % 6],
  })).sort((a, b) => b.pct - a.pct).filter((c) => c.pct > 0)

  const handleClaimVoucher = () => {
    setClaimingVoucher(true)
    setTimeout(() => {
      setClaimingVoucher(false)
      setVoucherClaimed(true)
      toast.success('🎟️ Coupon CRD-1000 applied! LKR 1,000 off your next order.')
      addLog('Redeemed 100 pts for LKR 1,000 store voucher', 'customer')
    }, 1200)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {currentRole === 'admin' ? (
        <>
          {/* Admin KPIs */}
          <div className="grid gap-5 md:grid-cols-4">
            {[
              { label: 'Gross Revenue', value: `LKR ${totalRevenue.toLocaleString()}`, sub: '+18.5% YoY', trend: true, icon: BarChart3, color: 'bg-primary/10 text-primary' },
              { label: 'Profit Margin', value: `LKR ${profitMargin.toLocaleString()}`, sub: '25% gross markup avg', trend: null, icon: PieChart, color: 'bg-emerald-50 text-emerald-600' },
              { label: 'Avg Order Value', value: `LKR ${Math.round(avgOrderValue).toLocaleString()}`, sub: '+4.2% cart growth', trend: true, icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
              { label: 'Conversion Ratio', value: `${conversionRatio}%`, sub: '-0.1% traffic drop', trend: false, icon: Zap, color: 'bg-rose-50 text-rose-600' },
            ].map(({ label, value, sub, trend, icon: Icon, color }) => (
              <Card key={label} className="border border-slate-100 shadow-lg shadow-slate-200/30 bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                    <div className={`p-2 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
                      <Icon size={16} />
                    </div>
                  </div>
                  <h4 className="text-2xl font-black text-slate-900">{value}</h4>
                  <p className={`text-[10px] font-bold mt-2 flex items-center gap-1 ${trend === true ? 'text-emerald-600' : trend === false ? 'text-rose-500' : 'text-slate-400'}`}>
                    {trend === true ? <ArrowUpRight size={12} /> : trend === false ? <ArrowDownRight size={12} /> : null}{sub}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Revenue chart + Category breakdown */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Monthly Revenue Trend</h3>
                    <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Gross income over 7 months — Jan to Jul 2026</p>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-black text-[10px] px-3 py-1">↑ Trending Up</Badge>
                </div>
              </div>
              <div className="p-6">
                <svg viewBox="0 0 500 180" className="w-full h-48 text-primary overflow-visible">
                  <defs>
                    <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity="0.35" />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  {[0, 50, 100, 150].map((y) => (
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
                    return (
                      <g key={cx}>
                        <circle cx={cx} cy={cy} r="6" fill="#2563eb" fillOpacity="0.15" />
                        <circle cx={cx} cy={cy} r="4" fill="#fff" stroke="#2563eb" strokeWidth="2.5" />
                      </g>
                    )
                  })}
                </svg>
              </div>
            </Card>

            <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Category Sales</h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Revenue breakdown by furniture type</p>
              </div>
              <div className="p-6 space-y-5">
                {categoryData.length > 0 ? categoryData.map(({ label, emoji, pct, color, textColor }) => (
                  <div key={label}>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span className="flex items-center gap-1.5">{emoji} {label}</span>
                      <span className={`font-black ${textColor}`}>{pct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className={`${color} h-full rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )) : (
                  <div className="text-xs text-slate-400 font-medium text-center py-8">No sales data available.</div>
                )}
              </div>
            </Card>
          </div>

          {/* Product Performance */}
          <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Product Performance</h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">Sales, revenue, and stock levels for all active products</p>
            </div>
            <div className="divide-y divide-slate-50">
              {filteredProducts.map((p) => (
                <div key={p.id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-lg shrink-0 overflow-hidden border border-slate-100">
                    {p.image
                      ? (
                          /* Base64 data URI from FileReader — intentionally using plain <img>
                             since next/image cannot optimise data URIs. */
                          <img src={p.image} alt="" className="w-full h-full object-cover" />
                        )
                      : p.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-slate-900 text-sm truncate">{p.name}</p>
                    <Badge variant="outline" className="text-[9px] font-bold text-slate-400 mt-0.5">{p.category}</Badge>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-xs font-black text-slate-900">LKR {p.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-medium">unit price</p>
                  </div>
                  <div className="text-center shrink-0 min-w-[60px]">
                    <p className="text-sm font-black text-slate-700">{p.sales}</p>
                    <p className="text-[10px] text-slate-400 font-medium">sold</p>
                  </div>
                  <div className="text-center shrink-0 min-w-[50px]">
                    <p className={`text-sm font-black ${p.stock <= 5 ? 'text-rose-600' : p.stock <= 10 ? 'text-amber-600' : 'text-emerald-600'}`}>{p.stock}</p>
                    <p className="text-[10px] text-slate-400 font-medium">stock</p>
                  </div>
                  <div className="text-right shrink-0 min-w-[100px]">
                    <p className="text-sm font-black text-primary">LKR {(p.amount * p.sales).toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-medium">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      ) : (
        /* ── Customer analytics & loyalty ── */
        <>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { label: 'Total Spent', value: `LKR ${orders.reduce((a, o) => a + o.total, 0).toLocaleString()}`, sub: `Over ${orders.length} orders`, icon: BarChart3, iconBg: 'bg-slate-100 text-slate-600' },
              { label: 'Loyalty Points', value: `${loyaltyPoints} pts`, sub: '1 pt per LKR 100 spent', icon: Award, iconBg: 'bg-emerald-50 text-emerald-600' },
              { label: 'Membership Tier', value: 'Silver Tier', sub: 'Priority privileges active', icon: Zap, iconBg: 'bg-primary/10 text-primary' },
            ].map(({ label, value, sub, icon: Icon, iconBg }) => (
              <Card key={label} className="border border-slate-100 shadow-lg shadow-slate-200/30 bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="p-6 flex items-start gap-4">
                  <div className={`p-3 rounded-2xl ${iconBg} group-hover:scale-110 transition-transform shrink-0`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                    <h4 className="text-2xl font-black text-slate-900 mt-1">{value}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">{sub}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Loyalty Reward Roadmap</h3>
                <p className="text-[11px] text-slate-400 font-semibold mt-0.5">Track your journey to Gold Tier</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 relative overflow-hidden">
                  <div className="absolute -top-4 -right-4 opacity-10">
                    <Award size={100} />
                  </div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm font-black text-slate-800">Progress to Gold Tier</p>
                        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Earn 5,000 pts to unlock 10% auto-discounts</p>
                      </div>
                      <span className="text-sm font-black text-primary bg-white px-3 py-1 rounded-full border border-blue-100 shadow-sm">
                        {loyaltyPoints} / 5,000
                      </span>
                    </div>
                    <div className="w-full bg-white/70 border border-blue-100 h-3.5 rounded-full overflow-hidden shadow-inner">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-700 relative"
                        style={{ width: `${Math.min(100, (loyaltyPoints / 5000) * 100)}%` }}
                      >
                        <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <h4 className="text-sm font-black text-slate-900">Claim LKR 1,000 Voucher</h4>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Redeem 100 points for an instant discount coupon</p>
                  </div>
                  {voucherClaimed ? (
                    <Button disabled className="bg-emerald-50 text-emerald-600 border-none rounded-xl font-bold text-xs h-10 px-5 gap-2 shrink-0">
                      <CheckCircle2 size={15} /> Voucher Claimed
                    </Button>
                  ) : (
                    <Button
                      disabled={loyaltyPoints < 100 || claimingVoucher}
                      onClick={handleClaimVoucher}
                      className="bg-primary hover:bg-primary/90 text-white text-xs font-bold rounded-xl px-6 h-10 shrink-0 shadow-lg shadow-primary/20 active:scale-95 transition-transform gap-2"
                    >
                      {claimingVoucher ? <><Loader2 className="animate-spin h-4 w-4" /> Processing...</> : 'Claim Reward'}
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden h-fit">
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
                <h3 className="font-black text-slate-900 text-sm">Silver Member Privileges</h3>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Your active benefits</p>
              </div>
              <div className="p-6 space-y-4">
                {[
                  'Free local logistics deliveries on all orders',
                  'Priority 24/7 dedicated helpdesk tickets',
                  'First-look access to new arrivals & collections',
                  'Exclusive member-only seasonal discounts',
                ].map((perk) => (
                  <div key={perk} className="flex items-start gap-3 group">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <CheckCircle2 size={14} className="text-emerald-500" />
                    </div>
                    <p className="text-xs text-slate-600 font-semibold leading-relaxed">{perk}</p>
                  </div>
                ))}
              </div>
              <div className="mx-6 mb-6 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100 rounded-2xl py-3.5 text-center">
                <p className="text-xs font-black text-indigo-700">🏅 Silver Member Club Verified</p>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
