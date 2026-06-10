'use client'

import { useEffect } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'
import type { ToastItem } from '@/hooks/use-toast'

interface ToastProps {
  item: ToastItem
  onDismiss: (id: number) => void
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
}

const STYLES = {
  success: 'bg-emerald-600 text-white',
  error: 'bg-rose-600 text-white',
  info: 'bg-slate-900 text-white',
}

export function Toast({ item, onDismiss }: ToastProps) {
  const Icon = ICONS[item.variant]

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(item.id), 4000)
    return () => clearTimeout(timer)
  }, [item.id, onDismiss])

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-2xl shadow-2xl min-w-[280px] max-w-sm pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300 ${STYLES[item.variant]}`}
    >
      <Icon size={18} className="shrink-0 mt-0.5 opacity-90" />
      <p className="text-sm font-semibold leading-snug flex-1">{item.message}</p>
      <button
        onClick={() => onDismiss(item.id)}
        className="p-0.5 rounded-lg opacity-70 hover:opacity-100 transition-opacity shrink-0"
        aria-label="Dismiss notification"
      >
        <X size={14} />
      </button>
    </div>
  )
}
