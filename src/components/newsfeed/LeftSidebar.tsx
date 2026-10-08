'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, MapPin, UserPlus, FileEdit, Users, Bookmark } from 'lucide-react';

export default function LeftSidebar() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: 'নীড়', href: '/' },
    { icon: Search, label: 'কেস অনুসন্ধান', href: '/explore' },
    { icon: Users, label: 'সংগঠন', href: '/organizations' },
    { icon: Bookmark, label: 'সংরক্ষিত', href: '/saved' },
  ];

  return (
    <div className="w-full flex flex-col gap-1 sticky top-20">
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        const isActive = item.href === '/' ? pathname === '/' : pathname?.startsWith(item.href);
        return (
          <Link
            key={idx}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm
              ${isActive 
                ? 'bg-slate-200/70 text-slate-900 font-bold' 
                : 'text-slate-700 hover:bg-slate-100'
              }
            `}
          >
            <Icon size={20} className={isActive ? 'text-slate-900' : 'text-slate-500'} />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
