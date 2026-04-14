'use client';

import AuthForm from '@/components/auth/AuthForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-mesh bg-noise pt-12 pb-24 px-6 flex items-center justify-center">
      <AuthForm mode="login" />
    </main>
  );
}
