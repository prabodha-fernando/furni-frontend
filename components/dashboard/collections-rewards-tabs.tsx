'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight, Heart, Percent, Truck, ShieldCheck, Star, Award, Loader2, CheckCircle2 } from 'lucide-react'

// ─── Props ────────────────────────────────────────────────────────────────────

import type { Product } from './types'

interface CollectionsTabProps {
  toast: { success: (msg: string) => void; error: (msg: string) => void; info: (msg: string) => void }
  wishlistItems: number[]
  topProducts: Product[]
  toggleWishlist: (id: number) => void
  handleAddToCart: (id: number) => void
  handleBuyNow: (product: Product) => void
}

interface RewardsTabProps {
  loyaltyPoints: number
}

export function CollectionsTab({
  toast, wishlistItems, topProducts, toggleWishlist, handleAddToCart, handleBuyNow
}: CollectionsTabProps) {

  const wishlistedProducts = topProducts.filter((p) => wishlistItems.includes(p.id))

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-5 gap-4">
        <div>
          <h3 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-500 tracking-tight">
            My Wishlist
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'} saved in your premium collection.
          </p>
        </div>
      </div>

      {wishlistedProducts.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {wishlistedProducts.map((product) => (
            <Card key={product.id} className="group overflow-hidden rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative bg-white flex flex-col hover:border-blue-200 transition-all duration-300">
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
                  <p className="font-black text-blue-600 text-sm">LKR {product.amount.toLocaleString()}</p>
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
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold h-10 rounded-xl active:scale-95 transition-transform shadow-lg shadow-slate-900/20"
                >
                  Add to Cart
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleBuyNow(product)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold h-10 rounded-xl active:scale-95 transition-transform shadow-lg shadow-blue-600/20"
                >
                  Buy Now
                </Button>
              </div>
            </Card>
          ))}
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

// ─── Rewards Tab ──────────────────────────────────────────────────────────────

export function RewardsTab({ loyaltyPoints }: RewardsTabProps) {
  const [redeemingId, setRedeemingId] = useState<number | null>(null)
  const [redeemed, setRedeemed] = useState<number[]>([])

  const handleRedeem = (id: number, title: string) => {
    setRedeemingId(id)
    setTimeout(() => {
      setRedeemingId(null)
      setRedeemed(prev => [...prev, id])
    }, 1500)
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="col-span-1 md:col-span-2 rounded-[2rem] overflow-hidden bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white p-10 relative shadow-2xl shadow-indigo-900/20 border border-indigo-800/50">
          <div className="absolute -top-10 -right-10 p-8 opacity-10 rotate-12 blur-sm">
            <Award size={250} />
          </div>
          <div className="absolute top-0 right-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />

          <div className="relative z-10">
            <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white font-black border-none mb-6 uppercase tracking-widest text-[10px] px-3 py-1 shadow-lg shadow-amber-500/30">
              Silver Tier Member
            </Badge>
            <h3 className="text-4xl font-black mb-3 tracking-tight">Furni Club Rewards</h3>
            <p className="text-indigo-200 font-medium text-sm max-w-md leading-relaxed mb-10">
              Earn points on every purchase and redeem them for exclusive discounts, free shipping, and early access to VIP collections.
            </p>
            <div className="flex items-end gap-6 bg-white/10 p-5 rounded-2xl border border-white/10 backdrop-blur-sm w-fit">
              <div>
                <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-1.5">Available Points</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-5xl font-black text-white bg-clip-text text-transparent bg-gradient-to-b from-white to-indigo-200">
                    {loyaltyPoints.toLocaleString()}
                  </p>
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

        <Card className="rounded-[2rem] p-8 flex flex-col justify-between border border-amber-200/50 bg-gradient-to-b from-amber-50 to-orange-50 shadow-xl shadow-amber-100/50 relative overflow-hidden">
          <div className="absolute -bottom-6 -right-6 text-amber-200/40">
            <Star size={150} />
          </div>
          <div className="relative z-10">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-amber-500/30">
              <Star size={28} className="fill-current" />
            </div>
            <h4 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Next Tier: Gold</h4>
            <p className="text-sm text-slate-600 font-semibold mb-6 leading-relaxed">
              Earn <span className="text-amber-600 font-black">550</span> more points by Dec 31 to unlock premium Gold tier benefits.
            </p>
          </div>
          <div className="relative z-10 mt-auto">
            <div className="flex justify-between text-[10px] font-black text-amber-700 mb-2 uppercase tracking-wider">
              <span>Silver</span>
              <span>80% to Gold</span>
            </div>
            <div className="h-3 w-full bg-amber-200/50 rounded-full overflow-hidden shadow-inner">
              <div className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full w-[80%] relative">
                <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="pt-4">
        <h4 className="text-2xl font-black text-slate-900 mb-6 tracking-tight">Exclusive Offers</h4>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { id: 1, title: 'LKR 1,000 Off Coupon', points: 1000, icon: Percent, color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-100' },
            { id: 2, title: 'Free Premium Delivery', points: 1500, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-100' },
            { id: 3, title: 'Priority Support Access', points: 500, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-100' },
          ].map((reward) => {
            const isRedeeming = redeemingId === reward.id
            const isRedeemed = redeemed.includes(reward.id)

            return (
              <Card key={reward.id} className={`p-6 rounded-[2rem] border ${reward.border} hover:shadow-2xl hover:shadow-${reward.color.split('-')[1]}-500/10 transition-all duration-300 group flex flex-col h-full bg-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-50 to-slate-100 rounded-bl-[100px] -z-10 transition-transform duration-500 group-hover:scale-125 opacity-50" />

                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${reward.bg} ${reward.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <reward.icon size={26} />
                </div>

                <h5 className="font-black text-slate-900 text-lg mb-2 tracking-tight">{reward.title}</h5>
                <p className="text-xs font-bold text-slate-500 mb-8 flex items-center gap-1.5">
                  <Award size={14} className={reward.color} /> {reward.points.toLocaleString()} points required
                </p>

                <div className="mt-auto">
                  {isRedeemed ? (
                    <Button disabled className="w-full h-12 text-sm font-bold bg-emerald-50 text-emerald-600 border-none rounded-xl flex items-center gap-2">
                      <CheckCircle2 size={18} /> Reward Claimed
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleRedeem(reward.id, reward.title)}
                      disabled={isRedeeming || loyaltyPoints < reward.points}
                      className={`w-full h-12 text-sm font-bold rounded-xl transition-all duration-300 ${loyaltyPoints >= reward.points
                        ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl active:scale-95'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                      {isRedeeming ? (
                        <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing...</>
                      ) : (
                        'Redeem Reward'
                      )}
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
