import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-mesh bg-noise pt-12 pb-24 px-6 flex items-center justify-center">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <AuthForm mode="login" />
      </Suspense>
    </main>
  );
}
