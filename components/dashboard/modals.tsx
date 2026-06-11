'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  X, Upload, Check, Plus, Trash2, Heart, ChevronRight, Percent,
  Truck, ShieldCheck, Star, Award, Loader2, Image as ImageIcon,
  Gift
} from 'lucide-react'
import type { Product, Coupon } from './types'

// ─── Category constants ────────────────────────────────────────────────────────

const CATEGORY_EMOJIS: Record<string, string> = {
  'Living Room': '🛋️', 'Dining Room': '🪑', 'Bedroom': '🛏️',
  'Office': '👨‍💻', 'Outdoor': '⛱️', 'Storage': '🗄️',
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ModalsProps {
  currentRole: 'admin' | 'customer'
  isAddProductOpen: boolean; setIsAddProductOpen: (v: boolean) => void
  isAddRewardOpen: boolean; setIsAddRewardOpen: (v: boolean) => void
  isEditProductOpen: boolean; setIsEditProductOpen: (v: boolean) => void
  isDeleteConfirmOpen: boolean; setIsDeleteConfirmOpen: (v: boolean) => void
  productToDelete: Product | null; setProductToDelete: (v: Product | null) => void
  selectedProductToEdit: Product | null; setSelectedProductToEdit: (v: Product | null) => void
  prodName: string; setProdName: (v: string) => void
  prodPrice: string; setProdPrice: (v: string) => void
  prodCategory: string; setProdCategory: (v: string) => void
  prodStock: string; setProdStock: (v: string) => void
  prodImage: string | null; setProdImage: (v: string | null) => void
  handleAddProductSubmit: (e: React.FormEvent) => void
  handleEditProductSubmit: (e: React.FormEvent) => void
  handleDeleteProduct: () => void
  handleAddRewardSubmit: (coupon: Omit<Coupon, 'claimedAt'>) => void
  resetFormFields: () => void
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
}

// ─── Modals component ─────────────────────────────────────────────────────────

export function DashboardModals({
  currentRole,
  isAddProductOpen, setIsAddProductOpen,
  isAddRewardOpen, setIsAddRewardOpen,
  isEditProductOpen, setIsEditProductOpen,
  isDeleteConfirmOpen, setIsDeleteConfirmOpen,
  productToDelete, setProductToDelete, selectedProductToEdit, setSelectedProductToEdit,
  prodName, setProdName, prodPrice, setProdPrice,
  prodCategory, setProdCategory, prodStock, setProdStock,
  prodImage, setProdImage,
  handleAddProductSubmit, handleEditProductSubmit, handleDeleteProduct, handleAddRewardSubmit,
  resetFormFields, handleImageUpload,
}: ModalsProps) {
  const fileInputRef     = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)

  // Reward Modal State
  const [rewardTitle, setRewardTitle] = useState('')
  const [rewardCode, setRewardCode] = useState('')
  const [rewardType, setRewardType] = useState<'percent' | 'fixed' | 'shipping'>('percent')
  const [rewardValue, setRewardValue] = useState('')
  const [rewardPoints, setRewardPoints] = useState('')
  const [rewardErr, setRewardErr] = useState('')

  const [nameErr, setNameErr] = useState('')
  const [priceErr, setPriceErr] = useState('')
  const [stockErr, setStockErr] = useState('')

  const validateName = (val: string) => {
    if (!val.trim()) { setNameErr('Product title is required'); return false }
    if (val.trim().length < 3) { setNameErr('Product title must be at least 3 characters'); return false }
    setNameErr(''); return true
  }

  const validatePrice = (val: string) => {
    if (val === '') { setPriceErr('Price is required'); return false }
    const num = Number(val)
    if (isNaN(num) || num <= 0) { setPriceErr('Price must be greater than 0'); return false }
    setPriceErr(''); return true
  }

  const validateStock = (val: string) => {
    if (val === '') { setStockErr('Stock is required'); return false }
    const num = Number(val)
    if (isNaN(num) || num < 0 || !Number.isInteger(num)) { setStockErr('Stock must be a non-negative integer'); return false }
    setStockErr(''); return true
  }

  const onAddSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const isNameValid = validateName(prodName)
    const isPriceValid = validatePrice(prodPrice)
    const isStockValid = validateStock(prodStock)
    if (isNameValid && isPriceValid && isStockValid) {
      handleAddProductSubmit(e)
      setNameErr(''); setPriceErr(''); setStockErr('')
    }
  }

  const onEditSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const isNameValid = validateName(prodName)
    const isPriceValid = validatePrice(prodPrice)
    const isStockValid = validateStock(prodStock)
    if (isNameValid && isPriceValid && isStockValid) {
      handleEditProductSubmit(e)
      setNameErr(''); setPriceErr(''); setStockErr('')
    }
  }

  const handleCancelAdd = () => {
    setIsAddProductOpen(false)
    resetFormFields()
    setNameErr(''); setPriceErr(''); setStockErr('')
  }

  const handleCancelEdit = () => {
    setIsEditProductOpen(false)
    setSelectedProductToEdit(null)
    resetFormFields()
    setNameErr(''); setPriceErr(''); setStockErr('')
  }

  const onAddRewardSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rewardTitle || !rewardCode || !rewardValue || !rewardPoints) {
      setRewardErr('Please fill in all fields')
      return
    }
    const val = Number(rewardValue)
    const pts = Number(rewardPoints)
    if (isNaN(val) || isNaN(pts) || val <= 0 || pts <= 0) {
      setRewardErr('Value and Points must be positive numbers')
      return
    }

    handleAddRewardSubmit({
      id: Date.now(),
      title: rewardTitle,
      code: rewardCode,
      discountType: rewardType,
      discountValue: val,
      pointsCost: pts
    })
    
    // Reset and close
    setRewardTitle('')
    setRewardCode('')
    setRewardType('percent')
    setRewardValue('')
    setRewardPoints('')
    setRewardErr('')
    setIsAddRewardOpen(false)
  }

  return (
    <>
      {/* ── Add Product Modal ── */}
      {isAddProductOpen && currentRole === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 p-4">
          <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl border border-slate-100 p-0 relative animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-start justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add New Product</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Publish a new furniture listing to the catalog.</p>
              </div>
              <button onClick={handleCancelAdd} className="p-2 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-100 shadow-sm"><X size={16} /></button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
              <form id="add-product-form" onSubmit={onAddSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Title *</Label>
                  <Input
                    id="add-product-name"
                    placeholder="e.g., Luxury Velvet Armchair"
                    required
                    value={prodName}
                    onChange={(e) => {
                      setProdName(e.target.value)
                      if (nameErr) validateName(e.target.value)
                    }}
                    onBlur={() => validateName(prodName)}
                    className={`rounded-xl h-11 text-sm font-bold bg-slate-50 shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                      nameErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                    }`}
                  />
                  {nameErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {nameErr}</p>}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price (LKR) *</Label>
                    <Input
                      id="add-product-price"
                      type="number"
                      placeholder="85000"
                      required
                      value={prodPrice}
                      onChange={(e) => {
                        setProdPrice(e.target.value)
                        if (priceErr) validatePrice(e.target.value)
                      }}
                      onBlur={() => validatePrice(prodPrice)}
                      className={`rounded-xl h-11 text-sm font-bold bg-slate-50 shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                        priceErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                      }`}
                    />
                    {priceErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {priceErr}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Quantity *</Label>
                    <Input
                      id="add-product-stock"
                      type="number"
                      placeholder="12"
                      required
                      value={prodStock}
                      onChange={(e) => {
                        setProdStock(e.target.value)
                        if (stockErr) validateStock(e.target.value)
                      }}
                      onBlur={() => validateStock(prodStock)}
                      className={`rounded-xl h-11 text-sm font-bold bg-slate-50 shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                        stockErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                      }`}
                    />
                    {stockErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {stockErr}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category *</Label>
                  <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-inner">
                    {Object.keys(CATEGORY_EMOJIS).map((c) => <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Photo</Label>
                  <input type="file" ref={fileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-100 cursor-pointer group transition-all duration-300 hover:border-blue-400">
                    {prodImage ? (
                      <div className="relative w-32 h-32 rounded-xl overflow-hidden border shadow-md group-hover:scale-105 transition-transform">
                        <img src={prodImage} alt="Preview" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center">
                          <p className="text-white text-[10px] font-black uppercase tracking-wider">Change</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                          <ImageIcon size={20} className="text-slate-400 group-hover:text-primary/80 transition-colors" />
                        </div>
                        <p className="text-xs font-black text-slate-600">Click to upload product image</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-1">PNG, JPG up to 10MB</p>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <Button type="button" variant="outline" onClick={handleCancelAdd} className="rounded-xl px-6 font-bold text-xs h-11 bg-white hover:bg-slate-100">Cancel</Button>
              <Button form="add-product-form" type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 font-bold text-xs h-11 gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-transform">
                <Plus size={14} /> Publish Product
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Product Modal ── */}
      {isEditProductOpen && currentRole === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 p-4">
          <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-2xl border border-slate-100 p-0 relative animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-start justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Edit Product</h2>
                <p className="text-xs text-slate-500 font-medium mt-1">Update catalog details for this product listing.</p>
              </div>
              <button onClick={handleCancelEdit} className="p-2 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors bg-white border border-slate-100 shadow-sm"><X size={16} /></button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
              <form id="edit-product-form" onSubmit={onEditSubmit} className="space-y-6">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Title *</Label>
                  <Input
                    required
                    value={prodName}
                    onChange={(e) => {
                      setProdName(e.target.value)
                      if (nameErr) validateName(e.target.value)
                    }}
                    onBlur={() => validateName(prodName)}
                    className={`rounded-xl h-11 text-sm font-bold bg-slate-50 shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                      nameErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                    }`}
                  />
                  {nameErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {nameErr}</p>}
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Price (LKR) *</Label>
                    <Input
                      type="number"
                      required
                      value={prodPrice}
                      onChange={(e) => {
                        setProdPrice(e.target.value)
                        if (priceErr) validatePrice(e.target.value)
                      }}
                      onBlur={() => validatePrice(prodPrice)}
                      className={`rounded-xl h-11 text-sm font-bold bg-slate-50 shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                        priceErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                      }`}
                    />
                    {priceErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {priceErr}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock Remaining *</Label>
                    <Input
                      type="number"
                      required
                      value={prodStock}
                      onChange={(e) => {
                        setProdStock(e.target.value)
                        if (stockErr) validateStock(e.target.value)
                      }}
                      onBlur={() => validateStock(prodStock)}
                      className={`rounded-xl h-11 text-sm font-bold bg-slate-50 shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                        stockErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                      }`}
                    />
                    {stockErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {stockErr}</p>}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</Label>
                  <select value={prodCategory} onChange={(e) => setProdCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-inner">
                    {Object.keys(CATEGORY_EMOJIS).map((c) => <option key={c} value={c}>{CATEGORY_EMOJIS[c]} {c}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Photo</Label>
                  <input type="file" ref={editFileInputRef} accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <div onClick={() => editFileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center bg-slate-50/50 hover:bg-slate-100 cursor-pointer transition-all duration-300 hover:border-blue-400 group">
                    {prodImage ? (
                      <div className="flex items-center gap-6">
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden border shadow-sm group-hover:scale-105 transition-transform">
                          <img src={prodImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-600 mb-1">Current Image</p>
                          <Button type="button" variant="outline" className="h-8 text-[10px] font-bold rounded-lg px-3">Replace Photo</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300">
                          <Upload size={16} className="text-slate-400 group-hover:text-primary/80 transition-colors" />
                        </div>
                        <p className="text-xs font-black text-slate-600">Click to upload new photo</p>
                      </>
                    )}
                  </div>
                </div>
              </form>
            </div>
            
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 shrink-0">
              <Button type="button" variant="outline" onClick={handleCancelEdit} className="rounded-xl px-6 font-bold text-xs h-11 bg-white hover:bg-slate-100">Cancel</Button>
              <Button form="edit-product-form" type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-8 font-bold text-xs h-11 gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-transform">
                <Check size={14} /> Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      <AnimatePresence>
        {isDeleteConfirmOpen && productToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl border border-slate-100 p-8 relative text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-rose-50 border-4 border-white shadow-lg rounded-full flex items-center justify-center mb-6 absolute -top-10">
                <Trash2 size={32} className="text-rose-600" />
              </div>
              <div className="mt-8 space-y-3">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Delete Product?</h2>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  You are about to permanently remove <br/><span className="font-black text-slate-900">&quot;{productToDelete.name}&quot;</span><br/> from the catalog. This cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 justify-center w-full mt-8">
                <Button variant="outline" onClick={() => { setIsDeleteConfirmOpen(false); setProductToDelete(null) }} className="flex-1 rounded-xl font-bold text-xs h-11 bg-slate-50 border-transparent hover:bg-slate-100 hover:border-slate-200">Cancel</Button>
                <Button onClick={handleDeleteProduct} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-xs h-11 gap-2 shadow-lg shadow-rose-600/20 active:scale-95 transition-transform">
                  <Trash2 size={14} /> Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Add Reward Modal ── */}
      <AnimatePresence>
        {isAddRewardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddRewardOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg">
              <Card className="rounded-[2rem] border-none shadow-2xl overflow-hidden bg-white">
                <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-6 text-white flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <Gift size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl">Create Reward</h3>
                      <p className="text-amber-100 text-xs font-semibold">Add a new offer to the Loyalty Catalogue</p>
                    </div>
                  </div>
                  <button onClick={() => setIsAddRewardOpen(false)} className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                    <X size={18} />
                  </button>
                </div>
                <form onSubmit={onAddRewardSubmit} className="p-8 space-y-6">
                  {rewardErr && <div className="p-3 bg-rose-50 text-rose-600 text-xs font-bold rounded-xl border border-rose-100">{rewardErr}</div>}
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div className="col-span-2 space-y-2">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Reward Title</Label>
                      <Input value={rewardTitle} onChange={(e) => setRewardTitle(e.target.value)} placeholder="e.g. 20% Off Chairs" className="h-11 rounded-xl bg-slate-50 border-slate-200" />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Promo Code</Label>
                      <Input value={rewardCode} onChange={(e) => setRewardCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER20" className="h-11 rounded-xl bg-slate-50 border-slate-200 uppercase" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Points Cost</Label>
                      <Input type="number" value={rewardPoints} onChange={(e) => setRewardPoints(e.target.value)} placeholder="e.g. 500" className="h-11 rounded-xl bg-slate-50 border-slate-200" />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Discount Type</Label>
                      <select value={rewardType} onChange={(e) => setRewardType(e.target.value as any)} className="w-full h-11 rounded-xl bg-slate-50 border border-slate-200 px-3 text-sm font-medium outline-none focus:border-amber-400">
                        <option value="percent">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (LKR)</option>
                        <option value="shipping">Free Shipping</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Value</Label>
                      <Input type="number" value={rewardValue} onChange={(e) => setRewardValue(e.target.value)} placeholder={rewardType === 'percent' ? 'e.g. 20' : 'e.g. 1500'} className="h-11 rounded-xl bg-slate-50 border-slate-200" disabled={rewardType === 'shipping'} />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end gap-3">
                    <Button type="button" variant="ghost" onClick={() => setIsAddRewardOpen(false)} className="rounded-xl font-bold hover:bg-slate-100">Cancel</Button>
                    <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold px-6 h-11 shadow-lg shadow-amber-500/30">Add Reward</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
