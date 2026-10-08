'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateCasePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/?focus=create-case');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] bg-slate-50 text-slate-500 text-sm font-medium">
      <div className="flex items-center gap-2">
        <span className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
        <span>Redirecting to Newsfeed...</span>
      </div>
    </div>
  );
}
