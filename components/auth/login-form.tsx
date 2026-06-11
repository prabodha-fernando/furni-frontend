'use client'

import { useState } from 'react'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { signIn, getSession, signOut } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<'customer' | 'admin'>('customer');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (val: string) => {
    if (!val.trim()) {
      setEmailError('Email address is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (val: string) => {
    if (!val) {
      setPasswordError('Password is required');
      return false;
    }
    if (val.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  // Email/Password Login Logic
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailLoading(true);

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      setIsEmailLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email: email.trim(),
        password,
        role: selectedRole,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes('RoleMismatch') || result.error === 'RoleMismatch') {
          toast.error(`Access denied. You cannot log in as ${selectedRole === 'admin' ? 'an Admin' : 'a User'} with this account.`);
        } else {
          toast.error('Invalid email or password');
        }
        setIsEmailLoading(false);
        return;
      }

      // Double check role matching client-side
      const session = await getSession();
      const actualRole = (session?.user as { role?: string })?.role || 'customer';

      if (actualRole !== selectedRole) {
        await signOut({ redirect: false });
        toast.error(`Access denied. You cannot log in as ${selectedRole === 'admin' ? 'an Admin' : 'a User'} with this account.`);
        setIsEmailLoading(false);
        return;
      }

      // Save current user to localStorage for profile display
      const mockName = email.trim().toLowerCase() === 'admin@furniture.com' ? 'Admin User' : email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' ');
      localStorage.setItem('currentUser', JSON.stringify({ email, name: mockName.charAt(0).toUpperCase() + mockName.slice(1) }));

      router.push(`/dashboard?role=${actualRole}`);
    } catch (error) {
      toast.error('An unexpected error occurred during sign in');
      console.error(error);
      setIsEmailLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn('google', { callbackUrl: `/dashboard?role=${selectedRole}` });
    } catch (error) {
      console.error("Google sign in failed:", error);
      setIsGoogleLoading(false);
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleLogin} className="space-y-5">
        {/* Role Segmented Selector */}
        <div className="space-y-2">
          <Label className="text-zinc-900 font-semibold">Select Log In Role</Label>
          <div className="grid grid-cols-2 gap-2 bg-zinc-100 p-1 rounded-full border border-zinc-200/50">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('customer');
                if (email === 'admin@furniture.com') {
                  setEmail('');
                }
              }}
              className={`rounded-full py-2.5 text-xs font-bold transition-all duration-200 ${selectedRole === 'customer'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/50'
                }`}
            >
              🛋️ User
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setEmail('admin@furniture.com');
                setPassword('admin123'); // auto prefill a sample password for convenience
              }}
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
          <Label htmlFor="email" className="text-zinc-900 font-semibold">Email Address*</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter Email Address (Use admin@furniture.com for Admin)"
            required
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) validateEmail(e.target.value);
            }}
            onBlur={() => validateEmail(email)}
            disabled={isEmailLoading || isGoogleLoading}
            className={`focus-visible:ring-blue-600 rounded-full px-4 py-6 disabled:opacity-50 text-sm transition-all ${emailError
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
          <Label htmlFor="password" className="text-zinc-900 font-semibold">Password*</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter Password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) validatePassword(e.target.value);
              }}
              onBlur={() => validatePassword(password)}
              disabled={isEmailLoading || isGoogleLoading}
              className={`focus-visible:ring-blue-600 rounded-full px-4 py-6 pr-12 disabled:opacity-50 transition-all ${passwordError
                ? 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500 bg-red-50/20'
                : 'border-zinc-200 focus-visible:ring-blue-600 focus-visible:border-blue-600'
                }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isEmailLoading || isGoogleLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors disabled:opacity-50 flex items-center justify-center"
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

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <Checkbox
              id="remember"
              disabled={isEmailLoading || isGoogleLoading}
              className="data-checked:bg-blue-600 data-checked:border-blue-600"
            />
            <Label htmlFor="remember" className="text-sm text-zinc-900 font-medium cursor-pointer">
              Remember Me
            </Label>
          </div>
          <Link href="/forgot-password" className="text-sm font-semibold text-blue-600 hover:underline">
            Forgot Password
          </Link>
        </div>

        <Button
          type="submit"
          disabled={isEmailLoading || isGoogleLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-full py-6 text-md mt-4 transition-all flex items-center justify-center"
        >
          {isEmailLoading ? (
            <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Signing in...</>
          ) : (
            "Sign In"
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isEmailLoading || isGoogleLoading}
          className="w-full rounded-full py-6 text-md font-medium mt-4 flex items-center justify-center gap-3 border-zinc-200 hover:bg-zinc-50 text-zinc-700"
        >
          {isGoogleLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
          )}
          Sign In With Google
        </Button>
      </form>

      <div className="mt-8 text-center text-sm">
        <span className="text-zinc-900 font-medium">Don't have an account? </span>
        <Link href="/signup" className="font-bold text-blue-600 hover:underline">
          Sign Up
        </Link>
      </div>
    </div>
  )
}