import { NextResponse } from 'next/server'
import { USERS } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const { name, email, password, role } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    // Check if user already exists
    if (USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409 })
    }

    const newUser = {
      id: String(USERS.length + 1),
      name,
      email,
      password,
      role: (role as 'customer' | 'admin') || 'customer',
    }

    // Mutate the in-memory store so NextAuth can find the user when logging in
    USERS.push(newUser)

    return NextResponse.json({
      success: true,
      user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
