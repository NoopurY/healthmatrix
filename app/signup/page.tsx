import { Suspense } from 'react';
import AuthForm from '@/components/auth/AuthForm';

function SignupFallback() {
  return (
    <div className="w-full max-w-md mx-auto rounded-2xl border border-white/10 bg-slate-900/50 p-8 text-center text-slate-400">
      Loading signup form...
    </div>
  );
}

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-mesh bg-noise pt-12 pb-24 px-6 flex items-center justify-center">
      <Suspense fallback={<SignupFallback />}>
        <AuthForm mode="signup" />
      </Suspense>
    </main>
  );
}
