'use client'

import { createContext, useContext } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  message: string
  variant: ToastVariant
}

export interface ToastContextValue {
  addToast: (message: string, variant?: ToastVariant) => void
}

export const ToastContext = createContext<ToastContextValue>({
  addToast: () => {},
})

export function useToast() {
  const { addToast } = useContext(ToastContext)

  return {
    toast: {
      success: (message: string) => addToast(message, 'success'),
      error: (message: string) => addToast(message, 'error'),
      info: (message: string) => addToast(message, 'info'),
    },
  }
}
