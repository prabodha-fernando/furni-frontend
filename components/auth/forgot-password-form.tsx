'use client'

import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { Loader2, CheckCircle } from 'lucide-react'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false) 
  const [errorMsg, setErrorMsg] = useState('') // Error awoth pennanna

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('') // Kalin errors thiyenawa nam clear karanawa

    try {
      // 🌟 Methanai hariyatama backend ekata call wenne
      const response = await fetch('/api/send-reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true) // Email eka success nam vitharak success UI eka pennanawa
      } else {
        setErrorMsg(data.error || 'Failed to send reset link. Please try again.')
      }
    } catch (error) {
      console.error("Error sending email:", error)
      setErrorMsg('An error occurred. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  // Link eka successfully send unama pennana lassan UI eka
  if (isSubmitted) {
    return (
      <div className="text-center space-y-6 py-4">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500 animate-bounce" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-zinc-900">Check your email</h3>
          <p className="text-zinc-500 max-w-sm mx-auto text-sm leading-relaxed">
            We have sent a password reset link to <span className="font-semibold text-zinc-800">{email}</span>. Please check your inbox.
          </p>
        </div>
        <div className="pt-4">
          <Link href="/login">
            <Button variant="outline" className="rounded-full px-6 py-5 border-zinc-200 hover:bg-zinc-50 font-medium">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Normal Email input form eka
  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-900 font-semibold">Email Address*</Label>
          <Input 
            id="email" 
            type="email" 
            placeholder="Enter Email Address" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            className="focus-visible:ring-blue-600 rounded-full px-4 py-6 border-zinc-200 disabled:opacity-50"
          />
        </div>
        
        {/* Error message ekak awoth pennana thana */}
        {errorMsg && (
          <div className="p-3 text-sm font-medium text-red-600 bg-red-50 rounded-lg border border-red-200">
            {errorMsg}
          </div>
        )}
        
        <Button 
          type="submit" 
          disabled={isLoading || !email} 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 text-md mt-4 transition-all flex items-center justify-center"
        >
          {isLoading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Sending link...</>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm">
        <Link href="/login" className="font-bold text-blue-600 hover:underline">
          Back to Sign In
        </Link>
      </div>
    </div>
  )
}