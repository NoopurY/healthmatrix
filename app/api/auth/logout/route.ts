// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { clearSession } from '@/lib/auth';

export async function POST() {
  await clearSession();
  return NextResponse.json({ message: 'Logged out successfully' });
}

/* --- slide --- */
// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    return NextResponse.json({ user: session });
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}
