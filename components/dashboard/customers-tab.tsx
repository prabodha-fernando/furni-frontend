'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, UserCheck, UserX, Mail, Send, Loader2, MessageSquare, Ticket as TicketIcon, ShieldCheck, Sparkles, Clock, CheckCheck, Edit2, Trash2, X } from 'lucide-react'
import type { Customer, Ticket } from './types'

// ─── Props ────────────────────────────────────────────────────────────────────

interface CustomersTabProps {
  currentRole: 'admin' | 'customer'
  filteredCustomers: Customer[]
  filteredTickets: Ticket[]
  customers: Customer[]
  customerSearch: string
  setCustomerSearch: (v: string) => void
  newTicketSubject: string
  setNewTicketSubject: (v: string) => void
  newTicketMessage: string
  setNewTicketMessage: (v: string) => void
  newTicketCategory: string
  setNewTicketCategory: (v: string) => void
  isSubmittingTicket: boolean
  profileName: string
  handleTicketSubmit: (e: React.FormEvent) => void
  handleToggleCustomerStatus: (id: number, status: Customer['status']) => void
  handleSendCoupon: (c: Customer) => void
  onAdminReply?: (msg: string) => void
  handleEditTicket?: (id: number, msg: string) => void
  handleDeleteTicket?: (id: number) => void
}

const iconBgMap: Record<string, string> = {
  blue: 'bg-primary/10 text-primary',
  emerald: 'bg-emerald-50 text-emerald-600',
  rose: 'bg-rose-50 text-rose-600',
}

// ─── MessageBubble Component ──────────────────────────────────────────────────

function MessageBubble({
  t, index, currentRole, profileName, handleEditTicket, handleDeleteTicket
}: {
  t: Ticket, index: number, currentRole: 'admin' | 'customer', profileName: string,
  handleEditTicket?: (id: number, msg: string) => void,
  handleDeleteTicket?: (id: number) => void
}) {
  const isAgent = t.sender === 'admin'

  // A message belongs to the user if the sender matches their current role.
  const isOwnMessage = t.sender === currentRole

  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(t.message)
  const [editErr, setEditErr] = useState('')

  const handleSaveEdit = () => {
    if (!editValue.trim()) { setEditErr('Message cannot be empty'); return }
    if (editValue.trim() === t.message) { setIsEditing(false); return }
    if (handleEditTicket) {
      handleEditTicket(t.id, editValue)
      setIsEditing(false)
      setEditErr('')
    }
  }

  // Reverse the layout if the viewer is the sender
  const isRightSide = isOwnMessage

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className={`flex gap-3 group ${isRightSide ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div className="shrink-0">
        {isAgent ? (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-md">
            <ShieldCheck size={15} className="text-white" />
          </div>
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md">
            <span className="text-white text-[11px] font-black">{profileName.charAt(0) || 'C'}</span>
          </div>
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] flex flex-col ${isRightSide ? 'items-end' : 'items-start'}`}>
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-[10px] font-black text-slate-400">{isAgent ? 'Support Team' : 'Customer'}</span>
          <span className="text-[9px] font-bold text-slate-300">{t.time}</span>
        </div>

        <div className={`px-4 py-3 shadow-sm text-sm font-semibold leading-relaxed relative ${isRightSide
          ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-sm'
          : 'bg-white border border-slate-100 text-slate-700 rounded-2xl rounded-tl-sm'
          }`}>

          {!isAgent && t.subject && (
            <p className="text-[10px] font-black uppercase tracking-wider mb-1 opacity-60 border-b border-current pb-1 mb-2">
              {t.subject}
            </p>
          )}

          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col gap-2 min-w-[200px]"
              >
                <label htmlFor={`editMessage-${t.id}`} className="sr-only">Edit Message</label>
                <textarea
                  id={`editMessage-${t.id}`}
                  name={`editMessage-${t.id}`}
                  autoFocus
                  value={editValue}
                  onChange={(e) => { setEditValue(e.target.value); setEditErr('') }}
                  className={`w-full p-2 text-xs text-slate-800 rounded bg-white/90 border ${editErr ? 'border-red-500 focus:ring-red-500/20' : 'border-transparent focus:ring-black/10'} outline-none focus:ring-2 resize-none`}
                  rows={3}
                />
                {editErr && <span className="text-[9px] font-bold text-red-500">{editErr}</span>}
                <div className="flex justify-end gap-2 mt-1">
                  <Button size="sm" variant="ghost" onClick={() => { setIsEditing(false); setEditValue(t.message); setEditErr('') }} className="h-6 text-[10px] px-2 text-slate-500 hover:bg-slate-200/50">Cancel</Button>
                  <Button size="sm" onClick={handleSaveEdit} className="h-6 text-[10px] px-3 bg-slate-900 text-white hover:bg-slate-800 rounded">Save</Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <p>{t.message}</p>

                {/* Actions (only visible on hover for own messages) */}
                {isOwnMessage && (
                  <div className={`absolute top-2 -mt-6 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isRightSide ? '-left-14' : '-right-14'}`}>
                    <button onClick={() => setIsEditing(true)} className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-blue-600 rounded-full shadow-sm hover:scale-110 transition-all">
                      <Edit2 size={12} />
                    </button>
                    <button onClick={() => handleDeleteTicket && handleDeleteTicket(t.id)} className="p-1.5 bg-white border border-slate-200 text-slate-500 hover:text-red-600 rounded-full shadow-sm hover:scale-110 transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isAgent && !isEditing && (
          <div className="flex items-center gap-1 mt-1 pr-1 opacity-70">
            <CheckCheck size={10} className="text-primary" />
            <span className="text-[9px] font-bold text-primary">Sent</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CustomersTab({
  currentRole, filteredCustomers, filteredTickets, customers,
  customerSearch, setCustomerSearch,
  newTicketSubject, setNewTicketSubject,
  newTicketMessage, setNewTicketMessage,
  newTicketCategory, setNewTicketCategory,
  isSubmittingTicket, profileName,
  handleTicketSubmit, handleToggleCustomerStatus, handleSendCoupon, onAdminReply,
  handleEditTicket, handleDeleteTicket
}: CustomersTabProps) {
  const [subjectErr, setSubjectErr] = useState('')
  const [messageErr, setMessageErr] = useState('')
  const [adminReplyMsg, setAdminReplyMsg] = useState('')

  const validateSubject = (val: string) => {
    if (!val.trim()) { setSubjectErr('Subject is required'); return false }
    if (val.trim().length < 5) { setSubjectErr('Subject must be at least 5 characters'); return false }
    setSubjectErr(''); return true
  }

  const validateMessage = (val: string) => {
    if (!val.trim()) { setMessageErr('Detailed message is required'); return false }
    if (val.trim().length < 10) { setMessageErr('Detailed message must be at least 10 characters'); return false }
    setMessageErr(''); return true
  }

  const onTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const isSubjectValid = validateSubject(newTicketSubject)
    const isMessageValid = validateMessage(newTicketMessage)
    if (isSubjectValid && isMessageValid) {
      handleTicketSubmit(e)
    }
  }
  return (
    <div className="animate-in fade-in duration-500">
      {currentRole === 'admin' ? (
        /* ── Admin: Customer directory ── */
        <div className="space-y-6">
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { label: 'Total Customers', value: customers.length, sub: 'Registered accounts', icon: Users, color: 'blue' },
              { label: 'Active Accounts', value: customers.filter((c) => c.status === 'Active').length, sub: 'Currently authorized', icon: UserCheck, color: 'emerald' },
              { label: 'Suspended Accounts', value: customers.filter((c) => c.status === 'Suspended').length, sub: 'Access revoked', icon: UserX, color: 'rose' },
            ].map(({ label, value, sub, icon: Icon, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <Card className="border border-slate-100 shadow-lg shadow-slate-200/30 bg-white p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 rounded-2xl group">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                    <div className={`p-2.5 rounded-xl ${iconBgMap[color]} group-hover:scale-110 transition-transform`}>
                      <Icon size={18} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-slate-900">{value}</h4>
                    <p className="text-[10px] text-slate-400 font-semibold mt-1">{sub}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Customer Directory</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{customers.length} registered buyers</p>
              </div>
              <div className="relative">
                <label htmlFor="customerSearch" className="sr-only">Search customers</label>
                <input
                  id="customerSearch"
                  name="customerSearch"
                  type="text"
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="border border-slate-200 rounded-xl pl-4 pr-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-primary/30 w-full sm:w-64 transition-all shadow-sm"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b-slate-100">
                    <TableHead className="font-black text-slate-700 text-xs py-4 pl-6">Customer</TableHead>
                    <TableHead className="font-black text-slate-700 text-xs py-4">Email</TableHead>
                    <TableHead className="font-black text-slate-700 text-xs text-center py-4">Orders</TableHead>
                    <TableHead className="font-black text-slate-700 text-xs text-right py-4">Total Spent</TableHead>
                    <TableHead className="font-black text-slate-700 text-xs text-center py-4">Status</TableHead>
                    <TableHead className="font-black text-slate-700 text-xs text-center py-4 pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((c, rowIndex) => (
                    <motion.tr
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: rowIndex * 0.05 }}
                      className="hover:bg-slate-50/50 transition-colors border-b border-b-slate-50"
                    >
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center text-xs font-black shrink-0 border border-primary/20/50 shadow-sm">
                            {c.avatar}
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-sm">{c.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">ID #{c.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 font-semibold text-slate-500 text-xs">{c.email}</TableCell>
                      <TableCell className="py-4 text-center font-black text-slate-700 text-xs">{c.ordersCount}</TableCell>
                      <TableCell className="py-4 text-right font-black text-primary text-sm">LKR {c.totalSpent.toLocaleString()}</TableCell>
                      <TableCell className="py-4 text-center">
                        <Badge className={`font-bold border border-transparent text-[10px] px-2 py-0.5 ${c.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{c.status}</Badge>
                      </TableCell>
                      <TableCell className="py-4 text-center pr-6">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleCustomerStatus(c.id, c.status)}
                            className={`text-[10px] font-bold rounded-xl px-3 h-8 shadow-sm transition-all ${c.status === 'Active' ? 'text-rose-600 border-rose-200 hover:bg-rose-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
                          >
                            {c.status === 'Active'
                              ? <><UserX size={12} className="mr-1.5" />Suspend</>
                              : <><UserCheck size={12} className="mr-1.5" />Activate</>}
                          </Button>
                          <Button size="sm" onClick={() => handleSendCoupon(c)} className="bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold rounded-xl px-3 h-8 shadow-sm active:scale-95 transition-transform">
                            <Mail size={12} className="mr-1.5 text-amber-400" />Voucher
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-16 text-slate-400 text-sm font-medium">No customers found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* ── Admin: Support Requests Inbox ── */}
          <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden flex flex-col">
            {/* Inbox header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-between shrink-0 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shadow-md backdrop-blur-sm">
                  <MessageSquare size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="font-black text-sm tracking-tight">Support Desk Inbox</h3>
                  <p className="text-[10px] text-blue-100 font-bold flex items-center gap-1">
                    Manage customer inquiries
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/10 text-white font-black text-[10px] border border-white/20">
                  {filteredTickets.length} messages
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="overflow-y-auto p-6 space-y-4 max-h-[400px] bg-slate-50/30">
              <AnimatePresence>
                {filteredTickets.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full py-10 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <TicketIcon size={28} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">No support requests.</p>
                  </motion.div>
                ) : (
                  filteredTickets.map((t, i) => (
                    <MessageBubble
                      key={t.id} t={t} index={i} currentRole={currentRole} profileName={profileName}
                      handleEditTicket={handleEditTicket} handleDeleteTicket={handleDeleteTicket}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Reply Input */}
            <div className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0">
              <label htmlFor="adminReplyMsg" className="sr-only">Admin Reply Message</label>
              <Input
                id="adminReplyMsg"
                name="adminReplyMsg"
                placeholder="Type your reply to the customer..."
                className="flex-1 rounded-xl bg-slate-50 border-slate-200 h-11 text-xs font-semibold focus:ring-primary/20 shadow-inner"
                value={adminReplyMsg}
                onChange={(e) => setAdminReplyMsg(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && adminReplyMsg.trim() && onAdminReply) {
                    onAdminReply(adminReplyMsg)
                    setAdminReplyMsg('')
                  }
                }}
              />
              <Button
                disabled={!adminReplyMsg.trim()}
                onClick={() => {
                  if (onAdminReply) onAdminReply(adminReplyMsg)
                  setAdminReplyMsg('')
                }}
                className="h-11 px-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 active:scale-95 transition-transform"
              >
                <Send size={16} />
              </Button>
            </div>
          </Card>
        </div>
      ) : (
        /* ── Customer: Premium Support Centre ── */
        <div className="grid gap-6 lg:grid-cols-5">

          {/* Compose Form */}
          <Card className="lg:col-span-2 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-700 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 opacity-10"><MessageSquare size={120} /></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <MessageSquare size={16} className="text-white" />
                  </div>
                  <h3 className="text-lg font-black text-white tracking-tight">New Support Request</h3>
                </div>
                <p className="text-blue-200 text-xs font-semibold">Our team responds within 2–24 hours</p>
              </div>
            </div>

            <form onSubmit={onTicketSubmit} className="p-6 space-y-5 flex-1 flex flex-col">
              {/* Category pills */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'Order Issue', emoji: '📦' },
                    { value: 'Return / Refund', emoji: '🔄' },
                    { value: 'Product Inquiry', emoji: '🛎️' },
                    { value: 'Delivery', emoji: '🚚' },
                    { value: 'Other', emoji: '❓' },
                  ].map(({ value, emoji }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setNewTicketCategory(value)}
                      className={`text-left text-[11px] font-bold px-3 py-2 rounded-xl border transition-all ${newTicketCategory === value
                        ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-primary/30 hover:bg-primary/10'
                        }`}
                    >
                      {emoji} {value}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label htmlFor="ticketSubject" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject *</Label>
                <Input
                  id="ticketSubject"
                  name="ticketSubject"
                  required
                  placeholder="e.g., Sofa delivery delayed"
                  value={newTicketSubject}
                  onChange={(e) => {
                    setNewTicketSubject(e.target.value)
                    if (subjectErr) validateSubject(e.target.value)
                  }}
                  onBlur={() => validateSubject(newTicketSubject)}
                  className={`rounded-xl h-11 text-xs font-bold bg-slate-50 border shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${subjectErr ? 'border-red-500 focus:ring-red-500/20 bg-red-50/20' : 'border-slate-200'
                    }`}
                />
                {subjectErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {subjectErr}</p>}
              </div>

              {/* Message */}
              <div className="space-y-1.5 flex-1 flex flex-col">
                <Label htmlFor="ticketMessage" className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detailed Message *</Label>
                <textarea
                  id="ticketMessage"
                  name="ticketMessage"
                  required
                  placeholder="Describe your issue in detail..."
                  value={newTicketMessage}
                  onChange={(e) => {
                    setNewTicketMessage(e.target.value)
                    if (messageErr) validateMessage(e.target.value)
                  }}
                  onBlur={() => validateMessage(newTicketMessage)}
                  className={`flex-1 w-full border bg-slate-50 rounded-xl p-4 text-xs font-semibold outline-none min-h-[120px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-inner resize-none transition-all ${messageErr ? 'border-red-500 focus:ring-red-500/20 bg-red-50/20' : 'border-slate-200'
                    }`}
                />
                {messageErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {messageErr}</p>}
              </div>

              <Button
                type="submit"
                disabled={isSubmittingTicket}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white rounded-xl font-bold text-sm gap-2 shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {isSubmittingTicket
                  ? <><Loader2 className="animate-spin h-4 w-4" />Sending...</>
                  : <><Send size={16} />Send Message</>}
              </Button>
            </form>
          </Card>

          {/* Premium Chat Inbox */}
          <Card className="lg:col-span-3 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden flex flex-col">
            {/* Inbox header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center shadow-md">
                    <ShieldCheck size={18} className="text-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div>
                  <p className="font-black text-slate-900 text-sm">Furni Support Team</p>
                  <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                    Online — typically replies within 2 hrs
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-blue-700 font-black text-[10px] border border-blue-100">
                  {filteredTickets.length} messages
                </Badge>
                <Badge className={`font-black text-[10px] border ${filteredTickets.some(t => t.status === 'Open')
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}>
                  {filteredTickets.some(t => t.status === 'Open') ? '🟡 1 Open' : '✅ All Resolved'}
                </Badge>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[480px] bg-gradient-to-b from-slate-50/30 to-white">
              <AnimatePresence>
                {filteredTickets.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center h-full py-20 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <TicketIcon size={28} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-bold text-slate-400">No messages yet</p>
                    <p className="text-xs text-slate-300 font-medium mt-1">Send your first support request!</p>
                  </motion.div>
                ) : (
                  filteredTickets.map((t, i) => (
                    <MessageBubble
                      key={t.id} t={t} index={i} currentRole={currentRole} profileName={profileName}
                      handleEditTicket={handleEditTicket} handleDeleteTicket={handleDeleteTicket}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer hint */}
            <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2">
              <Sparkles size={14} className="text-blue-400" />
              <p className="text-[10px] text-slate-400 font-semibold">
                Messages are encrypted and handled by our certified support staff.
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
