'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChevronRight, Heart, Percent, Truck, ShieldCheck, Star, Award,
  Loader2, CheckCircle2, Ticket, Sparkles, Tag, Copy, Check,
  Gift, Zap, Crown,
} from 'lucide-react'
import type { Product, Coupon } from './types'

// ─── Catalogue of redeemable rewards ─────────────────────────────────────────

export const REWARD_CATALOGUE: (Omit<Coupon, 'claimedAt'> & { isActive?: boolean })[] = [
  { id: 1, code: 'FURNI1000', title: 'LKR 1,000 Off Coupon', discountType: 'fixed', discountValue: 1000, pointsCost: 1000, isActive: true },
  { id: 2, code: 'FREESHIP', title: 'Free Premium Delivery', discountType: 'shipping', discountValue: 5000, pointsCost: 1500, isActive: true },
  { id: 3, code: 'VIPTEN', title: '10% VIP Discount', discountType: 'percent', discountValue: 10, pointsCost: 2000, isActive: true },
  { id: 4, code: 'FLASH500', title: 'LKR 500 Flash Voucher', discountType: 'fixed', discountValue: 500, pointsCost: 500, isActive: true },
]

const REWARD_VISUALS: Record<number, { icon: typeof Percent; color: string; bg: string; glow: string; gradient: string }> = {
  1: { icon: Percent,      color: 'text-rose-600',    bg: 'bg-rose-50',    glow: 'shadow-rose-500/20',    gradient: 'from-rose-500 to-pink-600' },
  2: { icon: Truck,        color: 'text-primary',    bg: 'bg-primary/10',    glow: 'shadow-blue-500/20',    gradient: 'from-blue-500 to-indigo-600' },
  3: { icon: Crown,        color: 'text-violet-600',  bg: 'bg-violet-50',  glow: 'shadow-violet-500/20',  gradient: 'from-violet-500 to-purple-600' },
  4: { icon: Zap,          color: 'text-amber-600',   bg: 'bg-amber-50',   glow: 'shadow-amber-500/20',   gradient: 'from-amber-400 to-orange-500' },
}

// ─── CollectionsTab Props ─────────────────────────────────────────────────────

interface CollectionsTabProps {
  toast: { success: (msg: string) => void; error: (msg: string) => void; info: (msg: string) => void }
  wishlistItems: number[]
  topProducts: Product[]
  toggleWishlist: (id: number) => void
  handleAddToCart: (id: number) => void
  handleBuyNow: (product: Product) => void
  claimedCoupons: Coupon[]
  activeCoupon: Coupon | null
  setActiveCoupon: (c: Coupon | null) => void
}

export function CollectionsTab({
  toast, wishlistItems, topProducts, toggleWishlist, handleAddToCart, handleBuyNow,
  claimedCoupons, activeCoupon, setActiveCoupon,
}: CollectionsTabProps) {
  const wishlistedProducts = topProducts.filter((p) => wishlistItems.includes(p.id))
  const [buyProduct, setBuyProduct] = useState<Product | null>(null)
  const [showCouponPicker, setShowCouponPicker] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const availableCoupons = (claimedCoupons ?? []).filter(c => c.status !== 'used')

  const discountedPrice = (product: Product) => {
    if (!activeCoupon) return product.amount
    if (activeCoupon.discountType === 'fixed') return Math.max(0, product.amount - activeCoupon.discountValue)
    if (activeCoupon.discountType === 'percent') return Math.round(product.amount * (1 - activeCoupon.discountValue / 100))
    if (activeCoupon.discountType === 'shipping') return product.amount // shipping discount applied at checkout
    return product.amount
  }

  const handleBuyWithCoupon = (product: Product) => {
    const finalProduct = activeCoupon
      ? { ...product, amount: discountedPrice(product) }
      : product
    handleBuyNow(finalProduct)
    if (activeCoupon) {
      toast.success(`🎉 Coupon "${activeCoupon.code}" applied! Saved LKR ${(product.amount - finalProduct.amount).toLocaleString()}`)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h3 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 tracking-tight">
            My Wishlist
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'} saved in your premium collection.
          </p>
        </div>

        {/* Active coupon banner */}
        {activeCoupon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl px-4 py-3 shadow-sm"
          >
            <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Tag size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-700">{activeCoupon.code} applied</p>
              <p className="text-[10px] text-emerald-500 font-semibold">{activeCoupon.title}</p>
            </div>
            <button onClick={() => setActiveCoupon(null)} className="ml-2 text-emerald-400 hover:text-emerald-600 text-xs font-bold transition-colors">
              Remove
            </button>
          </motion.div>
        )}
      </div>

      {/* Claimed coupons strip */}
      {availableCoupons.length > 0 && !activeCoupon && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 rounded-2xl p-4 flex items-center gap-4 flex-wrap shadow-sm"
        >
          <div className="flex items-center gap-2 shrink-0">
            <Ticket size={18} className="text-amber-600" />
            <span className="text-sm font-black text-amber-800">Your Coupons:</span>
          </div>
          <div className="flex gap-2 flex-wrap flex-1">
            {availableCoupons.map((coupon, i) => (
              <button
                key={`${coupon.id}-${i}`}
                onClick={() => { setActiveCoupon(coupon); toast.success(`✅ Coupon "${coupon.code}" ready to use!`) }}
                className="flex items-center gap-1.5 bg-white border border-amber-300 text-amber-700 font-black text-xs px-3 py-1.5 rounded-full hover:bg-amber-50 hover:scale-105 transition-all shadow-sm"
              >
                <Tag size={10} />
                {coupon.code}
                <span className="text-amber-400">→ Apply</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {wishlistedProducts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wishlistedProducts.map((product, i) => {
            const finalPrice = discountedPrice(product)
            const hasSaving = activeCoupon && finalPrice < product.amount
            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.07 }}
              >
                <Card className="group overflow-hidden rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative bg-white flex flex-col hover:border-primary/30 hover:shadow-2xl transition-all duration-300">
                  {hasSaving && (
                    <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <Sparkles size={10} />
                      Save LKR {(product.amount - finalPrice).toLocaleString()}
                    </div>
                  )}
                  <div className="p-5 flex items-start gap-4">
                    <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-[1.25rem] flex items-center justify-center shrink-0 text-3xl overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{product.emoji}</span>
                      )}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <Badge variant="outline" className="text-[9px] text-slate-400 font-bold px-2 py-0 rounded-md bg-white shadow-sm">
                        {product.category}
                      </Badge>
                      <h4 className="font-black text-slate-900 text-base truncate">{product.name}</h4>
                      <div className="flex items-baseline gap-2">
                        <p className="font-black text-primary text-sm">LKR {finalPrice.toLocaleString()}</p>
                        {hasSaving && (
                          <p className="text-xs text-slate-400 line-through font-medium">LKR {product.amount.toLocaleString()}</p>
                        )}
                      </div>
                      {activeCoupon?.discountType === 'shipping' && (
                        <p className="text-[10px] text-primary font-bold flex items-center gap-1"><Truck size={10} /> Free delivery applied</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="shrink-0 p-2 bg-rose-50 rounded-full text-rose-500 hover:bg-rose-100 transition-colors shadow-sm"
                    >
                      <Heart size={18} className="fill-rose-500" />
                    </button>
                  </div>

                  <div className="mt-auto bg-gradient-to-r from-slate-50 to-white px-5 py-4 border-t border-slate-100 flex gap-3">
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(product.id)}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold h-10 rounded-xl shadow-lg shadow-slate-900/20"
                    >
                      Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleBuyWithCoupon(product)}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-[11px] font-bold h-10 rounded-xl shadow-lg"
                    >
                      {activeCoupon ? '🏷️ Buy with Offer' : 'Buy Now'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart size={32} className="text-slate-300" />
          </div>
          <h4 className="text-xl font-black text-slate-900 mb-2">Your wishlist is empty</h4>
          <p className="text-slate-400 font-semibold text-sm max-w-sm mx-auto">
            Browse the showroom to find premium furniture pieces and save them here for later.
          </p>
        </div>
      )}
    </div>
  )
}

// ─── RewardsTab ───────────────────────────────────────────────────────────────

interface RewardsTabProps {
  loyaltyPoints: number
  claimedCoupons: Coupon[]
  onClaimCoupon: (coupon: Coupon) => void
  rewardCatalogue: (Omit<Coupon, 'claimedAt'> & { isActive?: boolean })[]
}

export function RewardsTab({ loyaltyPoints, claimedCoupons, onClaimCoupon, rewardCatalogue }: RewardsTabProps) {
  const [redeemingId, setRedeemingId] = useState<number | null>(null)
  const [copiedCode, setCopiedCode]   = useState<string | null>(null)

  const safeCoupons = claimedCoupons ?? []
  const activeCoupons = safeCoupons.filter(c => c.status !== 'used')
  const claimedIds  = new Set(safeCoupons.map(c => c.id))
  const hasActiveCoupon = activeCoupons.length > 0
  const activeRewards = rewardCatalogue.filter(r => r.isActive !== false)

  const handleRedeem = (reward: Omit<Coupon, 'claimedAt'>) => {
    if (loyaltyPoints < reward.pointsCost) return
    if (claimedIds.has(reward.id)) return
    // Enforce one-coupon-at-a-time: wallet must be empty before claiming
    if (hasActiveCoupon) {
      // Signal via onClaimCoupon with a sentinel? No — just block silently.
      // The UI already shows the lock state, so just return.
      return
    }
    setRedeemingId(reward.id)
    setTimeout(() => {
      const coupon: Coupon = {
        ...reward,
        claimedAt: new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }),
      }
      onClaimCoupon(coupon)
      setRedeemingId(null)
    }, 1500)
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* ── Hero loyalty card ── */}
      <div className="grid gap-6 md:grid-cols-3">
        <motion.div
          className="col-span-1 md:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="rounded-[2rem] overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-10 relative shadow-2xl shadow-indigo-900/20 border border-indigo-800/50 h-full">
            <div className="absolute -top-10 -right-10 p-8 opacity-10 rotate-12 blur-sm"><Award size={250} /></div>
            <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
            <div className="relative z-10">
              <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white font-black border-none mb-6 uppercase tracking-widest text-[10px] px-3 py-1 shadow-lg shadow-amber-500/30">
                Silver Tier Member
              </Badge>
              <h3 className="text-4xl font-black mb-3 tracking-tight">Furni Club Rewards</h3>
              <p className="text-indigo-200 font-medium text-sm max-w-md leading-relaxed mb-10">
                Earn points on every purchase and redeem them for exclusive discounts, free shipping, and VIP access.
              </p>
              <div className="flex items-end gap-6 bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm w-fit">
                <div>
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1.5">Available Points</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-black text-white">{loyaltyPoints.toLocaleString()}</p>
                    <span className="text-indigo-300 font-bold text-sm">pts</span>
                  </div>
                </div>
                <div className="mb-2 h-full w-[1px] bg-indigo-500/30 mx-2" />
                <div className="mb-2">
                  <p className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 size={16} /> Equals LKR {loyaltyPoints.toLocaleString()} value
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="rounded-[2rem] p-8 flex flex-col justify-between border border-amber-200/50 bg-gradient-to-b from-amber-50 to-orange-50 shadow-xl shadow-amber-100/50 relative overflow-hidden h-full">
            <div className="absolute -bottom-6 -right-6 text-amber-200/40"><Star size={150} /></div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30">
                <Star size={28} className="fill-current" />
              </div>
              <h4 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Next Tier: Gold</h4>
              <p className="text-sm text-slate-600 font-semibold mb-6 leading-relaxed">
                Earn <span className="text-amber-600 font-black">550</span> more points to unlock premium Gold tier benefits.
              </p>
            </div>
            <div className="relative z-10 mt-auto">
              <div className="flex justify-between text-[10px] font-black text-amber-700 mb-2 uppercase tracking-wider">
                <span>Silver</span><span>80% to Gold</span>
              </div>
              <div className="h-3 w-full bg-amber-200/50 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full w-[80%] relative">
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* ── Claimed coupons wallet ── */}
      {hasActiveCoupon && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Ticket size={20} className="text-primary" /> My Coupon Wallet
            </h4>
            <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              1 coupon active — use it before claiming another
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeCoupons.map((coupon, i) => (
              <motion.div
                key={`${coupon.id}-${i}`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
              >
                {/* Ticket-shaped coupon card */}
                <div className="relative bg-white border border-dashed border-primary/40 rounded-2xl overflow-hidden shadow-lg">
                  {/* Left notch */}
                  <div className="absolute top-1/2 -left-3 -translate-y-1/2 w-6 h-6 bg-background rounded-full border border-slate-100" />
                  <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-6 h-6 bg-background rounded-full border border-slate-100" />

                  <div className="flex">
                    {/* Left accent strip */}
                    <div className="w-2 bg-gradient-to-b from-primary to-amber-500 rounded-l-2xl shrink-0" />

                    <div className="p-4 flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Furni Club Coupon</p>
                          <h5 className="font-black text-slate-900 text-sm leading-tight mt-0.5">{coupon.title}</h5>
                        </div>
                        <div className="text-right shrink-0 ml-2">
                          <p className="text-xs font-black text-primary">
                            {coupon.discountType === 'percent'
                              ? `${coupon.discountValue}% OFF`
                              : coupon.discountType === 'shipping'
                              ? 'FREE SHIP'
                              : `LKR ${coupon.discountValue.toLocaleString()}`}
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-dashed border-slate-200 pt-3 flex items-center justify-between">
                        <div className="bg-slate-100 rounded-lg px-3 py-1.5 flex items-center gap-2">
                          <span className="font-mono font-black text-slate-700 text-xs tracking-widest">{coupon.code}</span>
                          <button onClick={() => copyCode(coupon.code)} className="text-slate-400 hover:text-primary transition-colors">
                            {copiedCode === coupon.code ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        </div>
                        <p className="text-[9px] text-slate-400 font-semibold">{coupon.claimedAt}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-slate-400 font-semibold mt-3 flex items-center gap-1.5">
            <Sparkles size={12} className="text-primary" />
            Go to <span className="font-black text-primary">Wishlist tab</span> → tap Apply Coupon to use at checkout
          </p>
        </motion.div>
      )}

      {/* ── Redeemable offers ── */}
      <div className="pt-2">
        <h4 className="text-2xl font-black text-slate-900 mb-6 tracking-tight flex items-center gap-2">
          <Gift size={22} className="text-primary" /> Exclusive Offers
        </h4>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {activeRewards.map((reward, i) => {
            const visual      = REWARD_VISUALS[reward.id] || REWARD_VISUALS[1] // fallback visual
            const isRedeeming = redeemingId === reward.id
            const isClaimed   = claimedIds.has(reward.id)
            const canAfford   = loyaltyPoints >= reward.pointsCost

            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
              >
                <Card className="p-6 rounded-[2rem] border border-slate-100 hover:shadow-2xl transition-all duration-300 group flex flex-col h-full bg-white relative overflow-hidden">
                  {/* Background gradient blob */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${visual.gradient} opacity-5 rounded-bl-[100px] group-hover:opacity-10 transition-opacity duration-500`} />

                  {/* Points badge */}
                  {!canAfford && !isClaimed && (
                    <div className="absolute top-3 right-3 bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded-full">
                      Need {(reward.pointsCost - loyaltyPoints).toLocaleString()} more pts
                    </div>
                  )}

                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 ${visual.bg} ${visual.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <visual.icon size={26} />
                  </div>

                  <h5 className="font-black text-slate-900 text-base mb-1 tracking-tight leading-snug">{reward.title}</h5>

                  <div className="mb-1">
                    <span className={`text-lg font-black ${visual.color}`}>
                      {reward.discountType === 'percent'
                        ? `${reward.discountValue}% off`
                        : reward.discountType === 'shipping'
                        ? 'Free delivery'
                        : `LKR ${reward.discountValue.toLocaleString()} off`}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-slate-400 mb-6 flex items-center gap-1.5">
                    <Award size={13} className={visual.color} />
                    {reward.pointsCost.toLocaleString()} points required
                  </p>

                  <div className="mt-auto">
                    {isClaimed ? (
                      <Button disabled className="w-full h-12 text-sm font-bold bg-emerald-50 text-emerald-600 border-none rounded-xl flex items-center gap-2">
                        <CheckCircle2 size={18} /> Claimed ✓
                      </Button>
                    ) : hasActiveCoupon && !isClaimed ? (
                      <Button disabled className="w-full h-12 text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                        🔒 Use wallet coupon first
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleRedeem(reward)}
                        disabled={isRedeeming || !canAfford}
                        className={`w-full h-12 text-sm font-bold rounded-xl transition-all duration-300 ${
                          canAfford
                            ? `bg-gradient-to-r ${visual.gradient} text-white shadow-lg ${visual.glow} hover:shadow-xl hover:scale-[1.02] active:scale-95`
                            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        {isRedeeming ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Claiming...</>
                        ) : (
                          <>
                            <Ticket size={16} className="mr-1.5" />
                            {canAfford ? 'Claim Coupon' : 'Insufficient Points'}
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
