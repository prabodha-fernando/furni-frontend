'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Globe, CreditCard, Lock, Bell, TrendingUp, Check, Loader2,
  Save, User, ShieldCheck, Camera, Phone, MapPin, AlertTriangle,
  Sparkles,
} from 'lucide-react'

// ─── Props ────────────────────────────────────────────────────────────────────

interface SettingsTabProps {
  currentRole: 'admin' | 'customer'

  // Admin store settings
  storeName: string; setStoreName: (v: string) => void
  storeEmail: string; setStoreEmail: (v: string) => void
  currency: string; setCurrency: (v: string) => void
  shippingFee: string; setShippingFee: (v: string) => void
  taxRate: string; setTaxRate: (v: string) => void
  maintenanceMode: boolean; setMaintenanceMode: (v: boolean) => void
  autoInvoice: boolean; setAutoInvoice: (v: boolean) => void
  reviewModeration: boolean; setReviewModeration: (v: boolean) => void
  isSavingSettings: boolean
  saveSuccess: boolean
  activeSettingsTab: 'general' | 'billing' | 'security'| 'notifications'
  setActiveSettingsTab: (v: 'general' | 'billing' | 'security' | 'notifications') => void
  handleSaveSettings: (e: React.FormEvent) => void
  alertNewOrders: boolean; setAlertNewOrders: (v: (prev: boolean) => boolean) => void
  alertLowStock: boolean; setAlertLowStock: (v: (prev: boolean) => boolean) => void
  alertCustomerUpdates: boolean; setAlertCustomerUpdates: (v: (prev: boolean) => boolean) => void
  alertRevenueMilestone: boolean; setAlertRevenueMilestone: (v: (prev: boolean) => boolean) => void
  alertSystemMaintenance: boolean; setAlertSystemMaintenance: (v: (prev: boolean) => boolean) => void
  totalRevenue: number
  addLog: (msg: string, type: 'admin' | 'customer' | 'system') => void
  toast: { success: (msg: string) => void; error: (msg: string) => void; info: (msg: string) => void }

  // Customer profile settings
  profileName: string; setProfileName: (v: string) => void
  profileEmail: string; setProfileEmail: (v: string) => void
  profileAvatar: string | null; setProfileAvatar: (v: string | null) => void
  profilePhone: string; setProfilePhone: (v: string) => void
  profileAddress: string; setProfileAddress: (v: string) => void
  profileCity: string; setProfileCity: (v: string) => void
  profileBio: string; setProfileBio: (v: string) => void
  isSavingProfile: boolean
  profileSuccess: boolean
  currentPassword: string; setCurrentPassword: (v: string) => void
  newPassword: string; setNewPassword: (v: string) => void
  confirmPassword: string; setConfirmPassword: (v: string) => void
  isSavingPassword: boolean
  passwordSuccess: boolean
  passwordError: string
  activeProfileTab: 'profile' | 'security' | 'preferences'
  setActiveProfileTab: (v: 'profile' | 'security' | 'preferences') => void
  emailNotifs: boolean; setEmailNotifs: (v: boolean) => void
  orderUpdates: boolean; setOrderUpdates: (v: boolean) => void
  promoNotifs: boolean; setPromoNotifs: (v: boolean) => void
  handleSaveProfile: (e: React.FormEvent) => void
  handleSavePassword: (e: React.FormEvent) => void
}

// ─── Toggle switch helper ──────────────────────────────────────────────────────

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-12 h-6 rounded-full transition-colors duration-300 relative outline-none shrink-0 border border-transparent hover:border-slate-300 ${on ? 'bg-blue-600 hover:border-blue-500' : 'bg-slate-200'}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all duration-300 ${on ? 'translate-x-[26px]' : 'translate-x-[2px]'}`} />
    </button>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SettingsTab({
  currentRole,
  storeName, setStoreName, storeEmail, setStoreEmail,
  currency, setCurrency, shippingFee, setShippingFee, taxRate, setTaxRate,
  maintenanceMode, setMaintenanceMode, autoInvoice, setAutoInvoice,
  reviewModeration, setReviewModeration,
  isSavingSettings, saveSuccess, activeSettingsTab, setActiveSettingsTab,
  handleSaveSettings,
  alertNewOrders, setAlertNewOrders, alertLowStock, setAlertLowStock,
  alertCustomerUpdates, setAlertCustomerUpdates,
  alertRevenueMilestone, setAlertRevenueMilestone,
  alertSystemMaintenance, setAlertSystemMaintenance,
  totalRevenue, addLog, toast,
  profileName, setProfileName, profileEmail, setProfileEmail,
  profileAvatar, setProfileAvatar, profilePhone, setProfilePhone,
  profileAddress, setProfileAddress, profileCity, setProfileCity,
  profileBio, setProfileBio,
  isSavingProfile, profileSuccess,
  currentPassword, setCurrentPassword, newPassword, setNewPassword,
  confirmPassword, setConfirmPassword, isSavingPassword, passwordSuccess, passwordError,
  activeProfileTab, setActiveProfileTab,
  emailNotifs, setEmailNotifs, orderUpdates, setOrderUpdates, promoNotifs, setPromoNotifs,
  handleSaveProfile, handleSavePassword,
}: SettingsTabProps) {
  // Store Config Errors
  const [storeNameErr, setStoreNameErr] = useState('')
  const [storeEmailErr, setStoreEmailErr] = useState('')
  const [currencyErr, setCurrencyErr] = useState('')
  const [shippingFeeErr, setShippingFeeErr] = useState('')
  const [taxRateErr, setTaxRateErr] = useState('')

  // Customer Profile Errors
  const [profileNameErr, setProfileNameErr] = useState('')
  const [profileEmailErr, setProfileEmailErr] = useState('')
  const [profilePhoneErr, setProfilePhoneErr] = useState('')
  const [profileCityErr, setProfileCityErr] = useState('')
  const [profileAddressErr, setProfileAddressErr] = useState('')

  // Security Errors
  const [currPassErr, setCurrPassErr] = useState('')
  const [newPassErr, setNewPassErr] = useState('')
  const [confPassErr, setConfPassErr] = useState('')

  // Admin Change Password local states
  const [adminCurrPass, setAdminCurrPass] = useState('')
  const [adminNewPass, setAdminNewPass] = useState('')
  const [adminConfPass, setAdminConfPass] = useState('')
  const [adminPassSuccess, setAdminPassSuccess] = useState(false)
  const [adminPassSaving, setAdminPassSaving] = useState(false)

  // Store Config Validators
  const validateStoreName = (val: string) => {
    if (!val.trim()) { setStoreNameErr('Store title is required'); return false }
    if (val.trim().length < 3) { setStoreNameErr('Store title must be at least 3 characters'); return false }
    setStoreNameErr(''); return true
  }
  const validateStoreEmail = (val: string) => {
    if (!val.trim()) { setStoreEmailErr('Support email is required'); return false }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(val.trim())) { setStoreEmailErr('Please enter a valid email address'); return false }
    setStoreEmailErr(''); return true
  }
  const validateCurrency = (val: string) => {
    if (!val.trim()) { setCurrencyErr('Currency is required'); return false }
    if (val.trim().length !== 3) { setCurrencyErr('Must be a 3-letter currency code (e.g. LKR)'); return false }
    setCurrencyErr(''); return true
  }
  const validateShippingFee = (val: string) => {
    if (val === '') { setShippingFeeErr('Shipping fee is required'); return false }
    if (Number(val) < 0) { setShippingFeeErr('Shipping fee must be >= 0'); return false }
    setShippingFeeErr(''); return true
  }
  const validateTaxRate = (val: string) => {
    if (val === '') { setTaxRateErr('Tax rate is required'); return false }
    const num = Number(val)
    if (num < 0 || num > 100) { setTaxRateErr('Tax rate must be between 0 and 100%'); return false }
    setTaxRateErr(''); return true
  }

  // Profile Validators
  const validateProfileName = (val: string) => {
    if (!val.trim()) { setProfileNameErr('Full name is required'); return false }
    if (val.trim().length < 2) { setProfileNameErr('Name must be at least 2 characters'); return false }
    setProfileNameErr(''); return true
  }
  const validateProfileEmail = (val: string) => {
    if (!val.trim()) { setProfileEmailErr('Email is required'); return false }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(val.trim())) { setProfileEmailErr('Please enter a valid email'); return false }
    setProfileEmailErr(''); return true
  }
  const validateProfilePhone = (val: string) => {
    if (!val.trim()) { setProfilePhoneErr('Phone number is required'); return false }
    const phoneRegex = /^\+?[0-9\s\-]{9,}$/
    if (!phoneRegex.test(val.trim())) { setProfilePhoneErr('Please enter a valid phone number (min 9 digits)'); return false }
    setProfilePhoneErr(''); return true
  }
  const validateProfileCity = (val: string) => {
    if (!val.trim()) { setProfileCityErr('City is required'); return false }
    setProfileCityErr(''); return true
  }
  const validateProfileAddress = (val: string) => {
    if (!val.trim()) { setProfileAddressErr('Delivery address is required'); return false }
    if (val.trim().length < 5) { setProfileAddressErr('Address must be at least 5 characters'); return false }
    setProfileAddressErr(''); return true
  }

  // Submits
  const onSaveSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const isNameValid = validateStoreName(storeName)
    const isEmailValid = validateStoreEmail(storeEmail)
    const isCurrencyValid = validateCurrency(currency)
    const isShippingValid = validateShippingFee(shippingFee)
    const isTaxValid = validateTaxRate(taxRate)

    if (isNameValid && isEmailValid && isCurrencyValid && isShippingValid && isTaxValid) {
      handleSaveSettings(e)
    } else {
      toast.error('Please fix validation errors in Store Configuration.')
    }
  }

  const onSaveProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const isNameValid = validateProfileName(profileName)
    const isEmailValid = validateProfileEmail(profileEmail)
    const isPhoneValid = validateProfilePhone(profilePhone)
    const isCityValid = validateProfileCity(profileCity)
    const isAddressValid = validateProfileAddress(profileAddress)

    if (isNameValid && isEmailValid && isPhoneValid && isCityValid && isAddressValid) {
      handleSaveProfile(e)
    } else {
      toast.error('Please fix validation errors in your Profile.')
    }
  }

  const validateAdminPassword = () => {
    let valid = true
    if (!adminCurrPass) { setCurrPassErr('Current password is required'); valid = false } else { setCurrPassErr('') }
    if (!adminNewPass) { setNewPassErr('New password is required'); valid = false }
    else if (adminNewPass.length < 6) { setNewPassErr('Password must be at least 6 characters'); valid = false }
    else { setNewPassErr('') }
    if (adminNewPass !== adminConfPass) { setConfPassErr('Passwords do not match'); valid = false } else { setConfPassErr('') }
    return valid
  }

  const handleAdminPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateAdminPassword()) return
    setAdminPassSaving(true)
    setTimeout(() => {
      setAdminPassSaving(false)
      setAdminPassSuccess(true)
      setAdminCurrPass('')
      setAdminNewPass('')
      setAdminConfPass('')
      toast.success('Admin password updated successfully.')
      addLog('Admin password updated successfully', 'admin')
      setTimeout(() => setAdminPassSuccess(false), 2500)
    }, 1200)
  }

  const onSavePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let valid = true
    if (!currentPassword) { setCurrPassErr('Current password is required'); valid = false } else { setCurrPassErr('') }
    if (!newPassword) { setNewPassErr('New password is required'); valid = false }
    else if (newPassword.length < 6) { setNewPassErr('Password must be at least 6 characters'); valid = false }
    else { setNewPassErr('') }
    if (newPassword !== confirmPassword) { setConfPassErr('Passwords do not match'); valid = false } else { setConfPassErr('') }

    if (valid) {
      handleSavePassword(e)
    } else {
      toast.error('Please fix validation errors in Security.')
    }
  }
  return (
    <div className="w-full flex flex-col md:flex-row gap-8 animate-in fade-in duration-500">
      {currentRole === 'admin' ? (
        <>
          {/* ── Admin Settings vertical nav ── */}
          <div className="w-full md:w-72 shrink-0 flex flex-col gap-2 relative">
            <div className="sticky top-24 space-y-1">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Settings Menu</h3>
              {([
                { key: 'general',       label: 'Store Configuration', desc: 'Global identity & regions',    icon: Globe },
                { key: 'billing',       label: 'Billing & Payments',  desc: 'Gateways & active plans',      icon: CreditCard },
                { key: 'security',      label: 'Security Center',     desc: 'Passwords & access control',   icon: Lock },
                { key: 'notifications', label: 'Alert Preferences',   desc: 'System event notifications',   icon: Bell },
              ] as const).map(({ key, label, desc, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveSettingsTab(key)}
                  className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 w-full text-left group border ${activeSettingsTab === key ? 'bg-white shadow-lg shadow-slate-200/50 border-blue-100 translate-x-1' : 'border-transparent hover:bg-white/50 hover:shadow-sm'}`}
                >
                  <div className={`p-2.5 rounded-xl mt-0.5 transition-all duration-300 ${activeSettingsTab === key ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-200 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 group-hover:scale-110'}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className={`text-sm font-black tracking-tight ${activeSettingsTab === key ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{label}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Admin Settings content area ── */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* General */}
            {activeSettingsTab === 'general' && (
              <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden">
                <div className="px-8 py-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Store Configuration</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Configure global store identity, operational settings, and regional preferences.</p>
                </div>
                <form onSubmit={onSaveSettingsSubmit} className="p-8 space-y-8 bg-white">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Title *</Label>
                      <Input
                        value={storeName}
                        onChange={(e) => {
                          setStoreName(e.target.value)
                          if (storeNameErr) validateStoreName(e.target.value)
                        }}
                        onBlur={() => validateStoreName(storeName)}
                        className={`rounded-xl bg-slate-50 text-sm font-bold h-12 shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                          storeNameErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      {storeNameErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {storeNameErr}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Store Support Email *</Label>
                      <Input
                        type="email"
                        value={storeEmail}
                        onChange={(e) => {
                          setStoreEmail(e.target.value)
                          if (storeEmailErr) validateStoreEmail(e.target.value)
                        }}
                        onBlur={() => validateStoreEmail(storeEmail)}
                        className={`rounded-xl bg-slate-50 text-sm font-bold h-12 shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                          storeEmailErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      {storeEmailErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {storeEmailErr}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Default Currency *</Label>
                      <Input
                        value={currency}
                        onChange={(e) => {
                          setCurrency(e.target.value)
                          if (currencyErr) validateCurrency(e.target.value)
                        }}
                        onBlur={() => validateCurrency(currency)}
                        className={`rounded-xl bg-slate-50 text-sm font-bold h-12 shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                          currencyErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      {currencyErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {currencyErr}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Shipping (LKR) *</Label>
                      <Input
                        type="number"
                        value={shippingFee}
                        onChange={(e) => {
                          setShippingFee(e.target.value)
                          if (shippingFeeErr) validateShippingFee(e.target.value)
                        }}
                        onBlur={() => validateShippingFee(shippingFee)}
                        className={`rounded-xl bg-slate-50 text-sm font-bold h-12 shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                          shippingFeeErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      {shippingFeeErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {shippingFeeErr}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Tax Rate (%) *</Label>
                      <Input
                        type="number"
                        value={taxRate}
                        onChange={(e) => {
                          setTaxRate(e.target.value)
                          if (taxRateErr) validateTaxRate(e.target.value)
                        }}
                        onBlur={() => validateTaxRate(taxRate)}
                        className={`rounded-xl bg-slate-50 text-sm font-bold h-12 shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                          taxRateErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      {taxRateErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {taxRateErr}</p>}
                    </div>
                  </div>
                  <div className="pt-4">
                    <div className="border border-slate-200 rounded-2xl p-6 space-y-6 bg-gradient-to-br from-slate-50 to-white shadow-sm">
                      <p className="text-xs font-black text-slate-800 flex items-center gap-2">
                        <Sparkles size={16} className="text-blue-500" /> Advanced System Toggles
                      </p>
                      <div className="grid gap-4 lg:grid-cols-2">
                        {[
                          { label: 'Maintenance Guard Mode',    desc: 'Blocks customer checkout when enabled',               state: maintenanceMode,  toggle: () => setMaintenanceMode(!maintenanceMode) },
                          { label: 'Automatic Invoice Emails',  desc: 'Auto-send PDF invoices on checkout',                  state: autoInvoice,      toggle: () => setAutoInvoice(!autoInvoice) },
                          { label: 'Review Moderation',         desc: 'Approve product reviews manually',                    state: reviewModeration, toggle: () => setReviewModeration(!reviewModeration) },
                          { label: 'Enable Guest Checkout',     desc: 'Allow purchases without an account',                  state: true,             toggle: () => {} },
                          { label: 'Multi-Language Support',    desc: 'Enable dynamic store translations',                   state: false,            toggle: () => {} },
                          { label: 'Analytics Telemetry',       desc: 'Send anonymous usage data to server',                 state: true,             toggle: () => {} },
                        ].map(({ label, desc, state, toggle }) => (
                          <div key={label} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-md transition-all group">
                            <div className="pr-4">
                              <p className="text-sm font-black text-slate-800 tracking-tight group-hover:text-blue-700 transition-colors">{label}</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-0.5 leading-snug">{desc}</p>
                            </div>
                            <Toggle on={state} onClick={toggle} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-6 border-t border-slate-100">
                    <Button type="submit" disabled={isSavingSettings} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[13px] h-12 px-8 shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 gap-2">
                      {isSavingSettings ? <><Loader2 className="animate-spin h-4 w-4" />Saving Configuration...</> : saveSuccess ? <><Check className="h-4 w-4" />Saved Successfully</> : <><Save className="h-4 w-4" />Commit Changes</>}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Billing */}
            {activeSettingsTab === 'billing' && (
              <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden">
                <div className="px-8 py-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Billing &amp; Payments</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Manage payment gateways, subscription plans, and transaction routing.</p>
                </div>
                <div className="p-8 space-y-8 bg-white">
                  <div className="grid grid-cols-2 gap-5">
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
                      <p className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Current Plan</p>
                      <p className="text-xl font-black text-slate-900 mt-1">Business Pro</p>
                      <p className="text-[10px] text-slate-400 font-bold mt-1">Renewed Jun 1, 2026</p>
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
                      <p className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">Revenue This Month</p>
                      <p className="text-xl font-black text-slate-900 mt-1">LKR {(totalRevenue + 480000).toLocaleString()}</p>
                      <p className="text-[10px] text-emerald-600 font-black mt-1 flex items-center gap-1"><TrendingUp size={12} />+18.5%</p>
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
                    <p className="text-xs font-black text-slate-800 uppercase tracking-widest">Payment Gateways Configured</p>
                    {['Visa / MasterCard Gateway', 'Bank Transfer (SLIPS)', 'Cash on Delivery'].map((m) => (
                      <div key={m} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <p className="text-xs font-bold text-slate-700 flex items-center gap-3"><Check size={14} className="text-emerald-500" />{m}</p>
                        <Badge className="bg-emerald-100 text-emerald-700 text-[9px] font-black border-none px-2 py-0.5">Active</Badge>
                      </div>
                    ))}
                  </div>
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl h-11 gap-2 shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-transform">
                    <CreditCard size={15} /> Manage Payment Providers
                  </Button>
                </div>
              </Card>
            )}

            {/* Security */}
            {activeSettingsTab === 'security' && (
              <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden">
                <div className="px-8 py-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Security Center</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Admin account security and global access control settings.</p>
                </div>
                <form onSubmit={handleAdminPasswordSubmit} className="p-8 space-y-8 bg-white">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <ShieldCheck className="text-emerald-600 shrink-0" size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-emerald-800">Security Status: Protected</p>
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5">SSL encrypted · 2FA available · Last login: Today 13:52</p>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest border-b border-slate-100 pb-2">Change Admin Password</h4>
                    
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password *</Label>
                      <Input
                        type="password"
                        placeholder="Enter current password"
                        value={adminCurrPass}
                        onChange={(e) => {
                          setAdminCurrPass(e.target.value)
                          if (currPassErr) setCurrPassErr('')
                        }}
                        className={`rounded-xl text-xs font-bold h-11 bg-slate-50 border shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                          currPassErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      {currPassErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {currPassErr}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password *</Label>
                      <Input
                        type="password"
                        placeholder="At least 6 characters"
                        value={adminNewPass}
                        onChange={(e) => {
                          setAdminNewPass(e.target.value)
                          if (newPassErr) setNewPassErr('')
                        }}
                        className={`rounded-xl text-xs font-bold h-11 bg-slate-50 border shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                          newPassErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      {newPassErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {newPassErr}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm Password *</Label>
                      <Input
                        type="password"
                        placeholder="Repeat new password"
                        value={adminConfPass}
                        onChange={(e) => {
                          setAdminConfPass(e.target.value)
                          if (confPassErr) setConfPassErr('')
                        }}
                        className={`rounded-xl text-xs font-bold h-11 bg-slate-50 border shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                          confPassErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      {confPassErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {confPassErr}</p>}
                    </div>
                  </div>
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button
                      type="submit"
                      disabled={adminPassSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs h-11 px-8 gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-transform"
                    >
                      {adminPassSaving ? <><Loader2 className="animate-spin h-4 w-4" />Updating...</> : adminPassSuccess ? <><Check className="h-4 w-4" />Updated</> : <><Lock size={14} /> Update Password</>}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Notifications */}
            {activeSettingsTab === 'notifications' && (
              <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden">
                <div className="px-8 py-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">System Alerts</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Control precisely which events trigger notifications to your administrative dashboard.</p>
                </div>
                <div className="p-8 space-y-4 bg-white">
                  {[
                    { label: 'New Order Alerts',           desc: 'Notify when a new order is placed',                  on: alertNewOrders,         toggle: () => setAlertNewOrders((v) => !v) },
                    { label: 'Low Stock Warnings',         desc: 'Alert when product stock drops below 6 units',       on: alertLowStock,          toggle: () => setAlertLowStock((v) => !v) },
                    { label: 'Customer Account Updates',   desc: 'Notify on account suspensions or activations',       on: alertCustomerUpdates,   toggle: () => setAlertCustomerUpdates((v) => !v) },
                    { label: 'Revenue Milestone Alerts',   desc: 'Celebrate monthly revenue milestones',               on: alertRevenueMilestone,  toggle: () => setAlertRevenueMilestone((v) => !v) },
                    { label: 'System Maintenance Emails',  desc: 'Receive technical maintenance notifications',         on: alertSystemMaintenance, toggle: () => setAlertSystemMaintenance((v) => !v) },
                  ].map(({ label, desc, on, toggle }) => (
                    <div key={label} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md bg-slate-50/50 hover:bg-white transition-all group">
                      <div>
                        <p className="text-xs font-black text-slate-800 group-hover:text-blue-700 transition-colors">{label}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{desc}</p>
                      </div>
                      <Toggle on={on} onClick={toggle} />
                    </div>
                  ))}
                  <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end">
                    <Button
                      onClick={() => { addLog('Admin notification preferences saved', 'admin'); toast.success('Alert preferences saved.') }}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[13px] h-11 px-8 shadow-lg shadow-blue-600/20 active:scale-95 transition-transform gap-2"
                    >
                      <Save size={14} /> Save Preferences
                    </Button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </>
      ) : (
        <>
          {/* ── Customer profile vertical nav ── */}
          <div className="w-full md:w-72 shrink-0 flex flex-col gap-2 relative">
            <div className="sticky top-24 space-y-1">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 px-2">Account Settings</h3>
              {([
                { key: 'profile',     label: 'My Profile',     desc: 'Personal info & address',          icon: User },
                { key: 'security',    label: 'Login Security', desc: 'Password & connected apps',        icon: Lock },
                { key: 'preferences', label: 'Preferences',    desc: 'Emails & push notifications',      icon: Bell },
              ] as const).map(({ key, label, desc, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveProfileTab(key)}
                  className={`flex items-start gap-4 p-4 rounded-2xl transition-all duration-300 w-full text-left group border ${activeProfileTab === key ? 'bg-white shadow-lg shadow-slate-200/50 border-blue-100 translate-x-1' : 'border-transparent hover:bg-white/50 hover:shadow-sm'}`}
                >
                  <div className={`p-2.5 rounded-xl mt-0.5 transition-all duration-300 ${activeProfileTab === key ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-slate-200 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600 group-hover:scale-110'}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className={`text-sm font-black tracking-tight ${activeProfileTab === key ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-900'}`}>{label}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ── Customer settings content area ── */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Profile tab */}
            {activeProfileTab === 'profile' && (
              <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden">
                <div className="px-8 py-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Personal Information</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Update your name, contact, delivery address and bio.</p>
                </div>
                <form onSubmit={onSaveProfileSubmit} className="p-8 space-y-8 bg-white">
                  {/* Avatar */}
                  <div className="flex items-center gap-6 pb-6 border-b border-slate-100">
                    <div className="w-20 h-20 rounded-[1.25rem] bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-xl overflow-hidden relative group border-2 border-white">
                      {profileAvatar
                        ? (
                            /* User-uploaded avatar is a base64 data URI from FileReader.
                               next/image cannot optimise data URIs, so a plain <img> is used. */
                            <img src={profileAvatar} alt="Avatar" className="w-full h-full object-cover" />
                          )
                        : profileName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      <label className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all backdrop-blur-sm">
                        <Camera size={20} className="text-white" />
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          if (e.target.files?.[0]) {
                            const reader = new FileReader()
                            reader.onload = (ev) => { if (ev.target?.result) setProfileAvatar(ev.target.result as string) }
                            reader.readAsDataURL(e.target.files[0])
                          }
                        }} />
                      </label>
                    </div>
                    <div>
                      <p className="text-lg font-black text-slate-900">{profileName}</p>
                      <p className="text-xs text-slate-400 font-semibold mt-0.5">{profileEmail}</p>
                      <label className="mt-2 text-[11px] font-black text-blue-600 flex items-center gap-1.5 hover:text-blue-700 cursor-pointer w-fit bg-blue-50 px-2 py-1 rounded-md transition-colors">
                        <Camera size={12} /> Upload New Photo
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          if (e.target.files?.[0]) {
                            const reader = new FileReader()
                            reader.onload = (ev) => { if (ev.target?.result) setProfileAvatar(ev.target.result as string) }
                            reader.readAsDataURL(e.target.files[0])
                          }
                        }} />
                      </label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name *</Label>
                      <Input
                        value={profileName}
                        onChange={(e) => {
                          setProfileName(e.target.value)
                          if (profileNameErr) validateProfileName(e.target.value)
                        }}
                        onBlur={() => validateProfileName(profileName)}
                        className={`rounded-xl text-xs font-bold h-11 bg-slate-50 border shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                          profileNameErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      {profileNameErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {profileNameErr}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address *</Label>
                      <Input
                        type="email"
                        value={profileEmail}
                        onChange={(e) => {
                          setProfileEmail(e.target.value)
                          if (profileEmailErr) validateProfileEmail(e.target.value)
                        }}
                        onBlur={() => validateProfileEmail(profileEmail)}
                        className={`rounded-xl text-xs font-bold h-11 bg-slate-50 border shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                          profileEmailErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      {profileEmailErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {profileEmailErr}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number *</Label>
                      <div className="relative">
                        <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold" />
                        <Input
                          value={profilePhone}
                          onChange={(e) => {
                            setProfilePhone(e.target.value)
                            if (profilePhoneErr) validateProfilePhone(e.target.value)
                          }}
                          onBlur={() => validateProfilePhone(profilePhone)}
                          className={`rounded-xl text-xs font-bold h-11 bg-slate-50 border shadow-inner pl-10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                            profilePhoneErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                          }`}
                        />
                      </div>
                      {profilePhoneErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {profilePhoneErr}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">City *</Label>
                      <Input
                        value={profileCity}
                        onChange={(e) => {
                          setProfileCity(e.target.value)
                          if (profileCityErr) validateProfileCity(e.target.value)
                        }}
                        onBlur={() => validateProfileCity(profileCity)}
                        className={`rounded-xl text-xs font-bold h-11 bg-slate-50 border shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                          profileCityErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      {profileCityErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {profileCityErr}</p>}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Delivery Address *</Label>
                    <div className="relative">
                      <MapPin size={14} className="absolute left-4 top-3.5 text-slate-400" />
                      <Input
                        value={profileAddress}
                        onChange={(e) => {
                          setProfileAddress(e.target.value)
                          if (profileAddressErr) validateProfileAddress(e.target.value)
                        }}
                        onBlur={() => validateProfileAddress(profileAddress)}
                        className={`rounded-xl text-xs font-bold h-11 bg-slate-50 border shadow-inner pl-10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                          profileAddressErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                    </div>
                    {profileAddressErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {profileAddressErr}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Short Bio</Label>
                    <textarea value={profileBio} onChange={(e) => setProfileBio(e.target.value)} rows={3}
                      className="w-full border border-slate-200 bg-slate-50 rounded-xl p-4 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-inner resize-none transition-all" />
                  </div>
                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <Button type="submit" disabled={isSavingProfile} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[13px] h-12 px-8 shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 gap-2">
                      {isSavingProfile ? <><Loader2 className="animate-spin h-4 w-4" />Saving...</> : profileSuccess ? <><Check className="h-4 w-4" />Updated Successfully</> : <><Save className="h-4 w-4" />Save Profile Changes</>}
                    </Button>
                  </div>
                </form>
              </Card>
            )}

            {/* Security tab */}
            {activeProfileTab === 'security' && (
              <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden">
                <div className="px-8 py-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Security &amp; Password</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Keep your account safe with a strong password.</p>
                </div>
                <div className="p-8 space-y-8 bg-white">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
                    <div className="p-3 bg-emerald-100 rounded-xl">
                      <ShieldCheck className="text-emerald-600 shrink-0" size={24} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-emerald-800">Account Protected</p>
                      <p className="text-xs text-emerald-600 font-semibold mt-0.5">SSL encrypted · Last login: Today</p>
                    </div>
                  </div>
                  <form onSubmit={onSavePasswordSubmit} className="space-y-6">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Password *</Label>
                      <Input
                        type="password"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value)
                          if (currPassErr) setCurrPassErr('')
                        }}
                        className={`rounded-xl text-xs font-bold h-11 bg-slate-50 border shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                          currPassErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                        }`}
                      />
                      {currPassErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {currPassErr}</p>}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Password *</Label>
                        <Input
                          type="password"
                          placeholder="Min 6 characters"
                          value={newPassword}
                          onChange={(e) => {
                            setNewPassword(e.target.value)
                            if (newPassErr) setNewPassErr('')
                          }}
                          className={`rounded-xl text-xs font-bold h-11 bg-slate-50 border shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                            newPassErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                          }`}
                        />
                        {newPassErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {newPassErr}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confirm Password *</Label>
                        <Input
                          type="password"
                          placeholder="Repeat new password"
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value)
                            if (confPassErr) setConfPassErr('')
                          }}
                          className={`rounded-xl text-xs font-bold h-11 bg-slate-50 border shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                            confPassErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                          }`}
                        />
                        {confPassErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {confPassErr}</p>}
                      </div>
                    </div>
                    {passwordError && <p className="text-xs text-rose-600 font-black flex items-center gap-1.5 bg-rose-50 p-3 rounded-lg"><AlertTriangle size={14} />{passwordError}</p>}
                    <div className="flex justify-end pt-4 border-t border-slate-100">
                      <Button type="submit" disabled={isSavingPassword} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[13px] h-12 px-8 shadow-xl shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 gap-2">
                        {isSavingPassword ? <><Loader2 className="animate-spin h-4 w-4" />Updating...</> : passwordSuccess ? <><Check className="h-4 w-4" />Password Updated</> : <><Lock className="h-4 w-4" />Update Password</>}
                      </Button>
                    </div>
                  </form>
                </div>
              </Card>
            )}

            {/* Preferences tab */}
            {activeProfileTab === 'preferences' && (
              <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden">
                <div className="px-8 py-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Notification Preferences</h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">Control precisely what types of emails and notifications you receive.</p>
                </div>
                <div className="p-8 space-y-4 bg-white">
                  {[
                    { label: 'Order Status Updates', desc: 'Receive email alerts when your order status changes', state: orderUpdates, toggle: () => setOrderUpdates(!orderUpdates) },
                    { label: 'Email Notifications',  desc: 'General account and billing emails',                 state: emailNotifs,  toggle: () => setEmailNotifs(!emailNotifs) },
                    { label: 'Promotions & Offers',  desc: 'Seasonal sale alerts and exclusive discount codes',  state: promoNotifs,  toggle: () => setPromoNotifs(!promoNotifs) },
                  ].map(({ label, desc, state, toggle }) => (
                    <div key={label} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-md bg-slate-50/50 hover:bg-white transition-all group">
                      <div>
                        <p className="text-xs font-black text-slate-800 group-hover:text-blue-700 transition-colors">{label}</p>
                        <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{desc}</p>
                      </div>
                      <Toggle on={state} onClick={toggle} />
                    </div>
                  ))}
                  <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end">
                    <Button
                      onClick={() => { addLog('Customer notification preferences saved', 'customer'); toast.success('Preferences saved!') }}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[13px] h-11 px-8 shadow-lg shadow-blue-600/20 active:scale-95 transition-transform gap-2"
                    >
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
  )
}
