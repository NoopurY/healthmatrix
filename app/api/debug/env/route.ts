import { NextResponse } from 'next/server';

export async function GET() {
  const envStatus = {
    MONGODB_URI: !!process.env.MONGODB_URI,
    JWT_SECRET: !!process.env.JWT_SECRET,
    NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
    CWD: process.cwd(),
    ENV_PATH_ROOT: '.env.local exists in root',
  };

  return NextResponse.json({
    status: 'Environment Diagnostics',
    config: envStatus,
    timestamp: new Date().toISOString(),
  });
}
