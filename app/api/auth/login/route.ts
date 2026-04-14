import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { User } from '@/models/User';
import { setSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    await setSession({ 
      userId: user._id.toString(), 
      email: user.email,
      name: user.name 
    });

    return NextResponse.json({ 
      message: 'Logged in successfully',
      user: { id: user._id, name: user.name, email: user.email } 
    });

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
