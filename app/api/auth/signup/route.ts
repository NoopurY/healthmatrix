import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';
import { setSession } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists with this email' }, { status: 409 });
    }

    // Explicit hashing for Next.js 16 compatibility
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({ 
      name, 
      email, 
      password: hashedPassword 
    });

    // Auto-login after signup
    await setSession({ 
      userId: newUser._id.toString(), 
      email: newUser.email,
      name: newUser.name 
    });

    return NextResponse.json({ 
      message: 'User registered successfully',
      user: { id: newUser._id, name: newUser.name, email: newUser.email } 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
