'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OrgDashboardLayout({ children, params }: { children: React.ReactNode, params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      router.replace(`/org/${id}`);
    }
  }, [id, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-4"></div>
      <p className="text-gray-600 font-medium">Redirecting to organization view...</p>
    </div>
  );
}
