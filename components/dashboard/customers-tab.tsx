'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Users, UserCheck, UserX, Mail, Send, Loader2, MessageSquare, Ticket as TicketIcon } from 'lucide-react'
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
}

const iconBgMap: Record<string, string> = {
  blue:    'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  rose:    'bg-rose-50 text-rose-600',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CustomersTab({
  currentRole, filteredCustomers, filteredTickets, customers,
  customerSearch, setCustomerSearch,
  newTicketSubject, setNewTicketSubject,
  newTicketMessage, setNewTicketMessage,
  newTicketCategory, setNewTicketCategory,
  isSubmittingTicket, profileName,
  handleTicketSubmit, handleToggleCustomerStatus, handleSendCoupon,
}: CustomersTabProps) {
  const [subjectErr, setSubjectErr] = useState('')
  const [messageErr, setMessageErr] = useState('')

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
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <Card key={label} className="border border-slate-100 shadow-lg shadow-slate-200/30 bg-white p-6 flex flex-col justify-between hover:shadow-xl transition-all duration-300 rounded-2xl group">
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
            ))}
          </div>

          <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Customer Directory</h3>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{customers.length} registered buyers</p>
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="border border-slate-200 rounded-xl pl-4 pr-4 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 w-full sm:w-64 transition-all shadow-sm"
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
                  {filteredCustomers.map((c) => (
                    <TableRow key={c.id} className="hover:bg-slate-50/50 transition-colors border-b-slate-50">
                      <TableCell className="py-4 pl-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center text-xs font-black shrink-0 border border-blue-200/50 shadow-sm">
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
                      <TableCell className="py-4 text-right font-black text-blue-600 text-sm">LKR {c.totalSpent.toLocaleString()}</TableCell>
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
                    </TableRow>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-center py-16 text-slate-400 text-sm font-medium">No customers found.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      ) : (
        /* ── Customer: Support ticket form + inbox ── */
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Create Support Request</h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">Describe your issue below. Our staff will reply shortly.</p>
            </div>
            <form onSubmit={onTicketSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</Label>
                  <select
                    value={newTicketCategory}
                    onChange={(e) => setNewTicketCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all shadow-inner"
                  >
                    <option value="Order Issue">Order Issue</option>
                    <option value="Return / Refund">Return &amp; Refund</option>
                    <option value="Product Inquiry">Product Inquiry</option>
                    <option value="Delivery">Delivery Problem</option>
                    <option value="Other">Other Query</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject *</Label>
                  <Input
                    required
                    placeholder="e.g., Sofa delivery delayed"
                    value={newTicketSubject}
                    onChange={(e) => {
                      setNewTicketSubject(e.target.value)
                      if (subjectErr) validateSubject(e.target.value)
                    }}
                    onBlur={() => validateSubject(newTicketSubject)}
                    className={`rounded-xl h-11 text-xs font-bold bg-slate-50 border shadow-inner px-4 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all ${
                      subjectErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                    }`}
                  />
                  {subjectErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {subjectErr}</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detailed Message *</Label>
                <textarea
                  required
                  placeholder="Describe your issue in detail..."
                  value={newTicketMessage}
                  onChange={(e) => {
                    setNewTicketMessage(e.target.value)
                    if (messageErr) validateMessage(e.target.value)
                  }}
                  onBlur={() => validateMessage(newTicketMessage)}
                  className={`w-full border bg-slate-50 rounded-xl p-4 text-xs font-semibold outline-none min-h-[140px] focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 shadow-inner resize-none transition-all ${
                    messageErr ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500 bg-red-50/20' : 'border-slate-200'
                  }`}
                />
                {messageErr && <p className="text-[10px] font-bold text-red-600 mt-1 pl-1">⚠️ {messageErr}</p>}
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" disabled={isSubmittingTicket} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs h-11 px-8 gap-2 shadow-lg shadow-blue-600/20 active:scale-95 transition-transform">
                  {isSubmittingTicket ? <><Loader2 className="animate-spin h-4 w-4" />Sending...</> : <><Send size={14} />Submit Request</>}
                </Button>
              </div>
            </form>
          </Card>

          {/* Ticket inbox */}
          <Card className="rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/30 bg-white overflow-hidden h-fit">
            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-600" /> Support Inbox
              </h3>
              <Badge className="bg-white text-blue-700 font-black text-[10px] border border-blue-100 shadow-sm">{filteredTickets.length} msgs</Badge>
            </div>
            <div className="p-5 space-y-4 max-h-[440px] overflow-y-auto">
              {filteredTickets.map((t) => (
                <div key={t.id} className={`p-4 rounded-2xl border transition-all hover:shadow-md ${t.sender === 'admin' ? 'bg-blue-50/40 border-blue-100 shadow-sm' : 'bg-white border-slate-100 shadow-sm'}`}>
                  <div className="flex justify-between items-center mb-2.5">
                    <span className={`text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 ${t.sender === 'admin' ? 'text-blue-600' : 'text-amber-600'}`}>
                      {t.sender === 'admin' ? '🛡️ Agent Reply' : '👤 My Ticket'}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge className={`text-[9px] font-black border ${t.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {t.status}
                      </Badge>
                      <span className="text-[9px] text-slate-400 font-semibold">{t.time}</span>
                    </div>
                  </div>
                  <h4 className="text-xs font-black text-slate-900 mb-1 leading-snug">{t.subject}</h4>
                  <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{t.message}</p>
                </div>
              ))}
              {filteredTickets.length === 0 && (
                <div className="text-center py-10">
                  <TicketIcon size={32} className="text-slate-200 mx-auto mb-3" />
                  <p className="text-xs font-semibold text-slate-400">No support tickets found.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
