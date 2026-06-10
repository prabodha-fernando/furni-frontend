'use client'

import { useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff } from 'lucide-react'

import { signIn } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'

export function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()

  // Role selector is stored for future use when registration is connected to a real DB.
  // It does not grant access — the server resolves the role from the credential store.
  const [selectedRole, setSelectedRole] = useState<'customer' | 'admin'>('customer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [nameError, setNameError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const validateName = (val: string) => {
    if (!val.trim()) {
      setNameError('Full name is required')
      return false
    }
    if (val.trim().length < 2) {
      setNameError('Name must be at least 2 characters')
      return false
    }
    setNameError('')
    return true
  }

  const validateEmail = (val: string) => {
    if (!val.trim()) {
      setEmailError('Email address is required')
      return false
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(val.trim())) {
      setEmailError('Please enter a valid email address')
      return false
    }
    setEmailError('')
    return true
  }

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError('Password is required')
      return false
    }
    if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return false
    }
    setPasswordError('')
    return true
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const isNameValid = validateName(name)
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)

    if (!isNameValid || !isEmailValid || !isPasswordValid) {
      setIsLoading(false)
      return
    }

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email: email.trim(), password, role: selectedRole }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || 'Something went wrong')
        setIsLoading(false)
        return
      }

      // Persist display data so the layout header shows it before the session propagates.
      // Only non-sensitive presentation data (name, email) is stored.
      localStorage.setItem('currentUser', JSON.stringify({ name, email }))

      toast.success('Account created successfully! Please sign in.')
      router.push('/login')
    } catch (err) {
      toast.error('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleRegister} className="space-y-5">

        {/* Role selector — visual intent only, does not grant access */}
        <div className="space-y-2">
          <Label className="text-zinc-900 font-semibold">Register As</Label>
          <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-1 rounded-full border border-zinc-200/50">
            <button
              type="button"
              onClick={() => setSelectedRole('customer')}
              className={`rounded-full py-2.5 text-xs font-bold transition-all duration-200 ${selectedRole === 'customer'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
                }`}
            >
              🛋️ Customer
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('admin')}
              className={`rounded-full py-2.5 text-xs font-bold transition-all duration-200 ${selectedRole === 'admin'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
                }`}
            >
              🔑 Admin
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name" className="text-zinc-900 font-semibold">Full Name*</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (nameError) validateName(e.target.value)
            }}
            onBlur={() => validateName(name)}
            className={`focus-visible:ring-blue-600 rounded-full px-4 py-6 transition-all ${nameError
              ? 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500 bg-red-50/20'
              : 'border-zinc-200 focus-visible:ring-blue-600 focus-visible:border-blue-600'
              }`}
          />
          {nameError && (
            <p className="text-xs font-bold text-red-600 mt-1 pl-3 animate-in fade-in duration-200">
              ⚠️ {nameError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-zinc-900 font-semibold">Email Address*</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter Email Address"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (emailError) validateEmail(e.target.value)
            }}
            onBlur={() => validateEmail(email)}
            className={`focus-visible:ring-blue-600 rounded-full px-4 py-6 transition-all ${emailError
              ? 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500 bg-red-50/20'
              : 'border-zinc-200 focus-visible:ring-blue-600 focus-visible:border-blue-600'
              }`}
          />
          {emailError && (
            <p className="text-xs font-bold text-red-600 mt-1 pl-3 animate-in fade-in duration-200">
              ⚠️ {emailError}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-zinc-900 font-semibold">Create Password*</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (passwordError) validatePassword(e.target.value)
              }}
              onBlur={() => validatePassword(password)}
              className={`focus-visible:ring-blue-600 rounded-full px-4 py-6 pr-12 transition-all ${passwordError
                ? 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500 bg-red-50/20'
                : 'border-zinc-200 focus-visible:ring-blue-600 focus-visible:border-blue-600'
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {passwordError && (
            <p className="text-xs font-bold text-red-600 mt-1 pl-3 animate-in fade-in duration-200">
              ⚠️ {passwordError}
            </p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 text-md mt-6 transition-all"
        >
          {isLoading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      <div className="mt-8 text-center text-sm">
        <span className="text-zinc-900 font-medium">Already have an account? </span>
        <Link href="/login" className="font-bold text-blue-600 hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  )
}