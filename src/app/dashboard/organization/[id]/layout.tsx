'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function OrgDashboardLayout({ children, params }: { children: React.ReactNode, params: Promise<{ id: string }> }) {
  const pathname = usePathname();
  const { id } = React.use(params);
  
  const navItems = [
    { label: 'Overview', href: `/dashboard/organization/${id}` },
    { label: 'Cases', href: `/dashboard/organization/${id}/cases` },
    { label: 'Official Responses', href: `/dashboard/organization/${id}/responses` },
    { label: 'Members', href: `/dashboard/organization/${id}/members` },
    { label: 'Verification', href: `/dashboard/organization/${id}/verification` },
    { label: 'Settings', href: `/dashboard/organization/${id}/settings` },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <aside className="w-full md:w-64 bg-white border-r flex-shrink-0">
        <div className="p-6 border-b">
          <h2 className="text-lg font-bold">Org Dashboard</h2>
        </div>
        <nav className="p-4 space-y-1">
          {navItems.map(item => {
             const isActive = pathname === item.href;
             return (
               <Link key={item.href} href={item.href} className={`block px-4 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'}`}>
                 {item.label}
               </Link>
             );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-6 md:p-10">
        {children}
      </main>
    </div>
  );
}
