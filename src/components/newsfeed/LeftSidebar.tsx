import React from 'react';
import Link from 'next/link';
import { Home, Search, MapPin, UserPlus, FileEdit, Users, Bookmark } from 'lucide-react';

export default function LeftSidebar() {
  const navItems = [
    { icon: Home, label: 'নীড়', active: true, href: '/' },
    { icon: Search, label: 'কেস অনুসন্ধান', active: false, href: '/explore' },
    { icon: MapPin, label: 'কাছাকাছি', active: false, href: '/nearby' },
    { icon: UserPlus, label: 'অনুসরণ করা হচ্ছে', active: false, href: '/following' },
    { icon: FileEdit, label: 'আমার অবদান', active: false, href: '/contributions' },
    { icon: Users, label: 'সংগঠন', active: false, href: '/organizations' },
    { icon: Bookmark, label: 'সংরক্ষিত', active: false, href: '/saved' },
  ];

  return (
    <div className="w-full flex flex-col gap-1 sticky top-20">
      {navItems.map((item, idx) => {
        const Icon = item.icon;
        return (
          <Link
            key={idx}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium text-sm
              ${item.active 
                ? 'bg-slate-200/70 text-slate-900 font-bold' 
                : 'text-slate-700 hover:bg-slate-100'
              }
            `}
          >
            <Icon size={20} className={item.active ? 'text-slate-900' : 'text-slate-500'} />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
