'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Compass, MapPin, Briefcase, Building2, Bookmark, FolderOpen, History, BellRing, Settings, HelpCircle, LogOut, LogIn, Plus } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/feature/auth/auth.slice';
import { useLogoutApiMutation } from '@/redux/feature/user/user.reducer';
import { getAvatarUrl } from '@/lib/utils';

function NavItem({ icon, label, badge, active = false, onClick }: { icon: React.ReactNode, label: string, badge?: string, active?: boolean, onClick?: () => void }) {
  return (
    <div 
      onClick={onClick} 
      className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 ${
        active 
          ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100 shadow-2xs' 
          : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 font-medium'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={active ? 'text-blue-600' : 'text-slate-400'}>{icon}</div>
        <span className="text-xs sm:text-sm truncate">{label}</span>
      </div>
      {badge && (
        <span className="bg-rose-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-xs shrink-0">
          {badge}
        </span>
      )}
    </div>
  );
}

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [logoutApi] = useLogoutApiMutation();

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch(e) {}
    dispatch(logout());
    router.push('/');
  };

  const userProfilePath = user?.userName ? `/profile/${user.userName}` : '/profile/me';

  return (
    <aside className="w-64 bg-white border-r border-slate-200/90 flex flex-col hidden md:flex h-full shrink-0 select-none">
      {/* Drishtivongi Logo Header */}
      <div 
        className="h-16 flex shrink-0 items-center px-5 border-b border-slate-100 cursor-pointer hover:bg-slate-50/50 transition-colors" 
        onClick={() => router.push('/')}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xs shrink-0">
            D
          </div>
          <div className="min-w-0">
            <div className="text-slate-900 font-black text-base tracking-tight leading-tight">Drishtivongi</div>
            <div className="text-[10px] text-slate-500 font-semibold leading-none truncate">দাবি থেকে প্রমাণ, দৃষ্টিভঙ্গি।</div>
          </div>
        </div>
      </div>
      
      {/* Dynamic Navigation Menu */}
      <nav className="p-3.5 space-y-1 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
        <NavItem 
          onClick={() => router.push('/')} 
          icon={<LayoutDashboard size={18} />} 
          label="হোম (Home)" 
          active={pathname === '/'} 
        />
        <NavItem 
          onClick={() => router.push('/explore')} 
          icon={<Compass size={18} />} 
          label="বিষয় এক্সপ্লোর (Explore)" 
          active={pathname?.startsWith('/explore')} 
        />
        <NavItem 
          onClick={() => router.push('/nearby')} 
          icon={<MapPin size={18} />} 
          label="আশেপাশের সমস্যা (Nearby)" 
          active={pathname?.startsWith('/nearby')} 
        />
        <NavItem 
          onClick={() => router.push('/projects')} 
          icon={<Briefcase size={18} />} 
          label="প্রজেক্ট ও ক্যাম্পেইন" 
          active={pathname?.startsWith('/projects')} 
        />
        <NavItem 
          onClick={() => router.push('/org')} 
          icon={<Building2 size={18} />} 
          label="সংগঠন (Organizations)" 
          active={pathname?.startsWith('/org')} 
        />
        
        <div className="py-2">
          <div className="border-t border-slate-100" />
        </div>

        <NavItem 
          onClick={() => router.push('/saved')} 
          icon={<Bookmark size={18} />} 
          label="সংরক্ষিত বিষয় (Saved)" 
          active={pathname?.startsWith('/saved')} 
        />
        {isAuthenticated && (
          <NavItem 
            onClick={() => router.push(`${userProfilePath}?tab=contributions`)} 
            icon={<History size={18} />} 
            label="আমার অবদান (Contributions)" 
            active={pathname?.includes('/profile') && pathname?.includes('tab=contributions')} 
          />
        )}
        <NavItem 
          onClick={() => router.push('/settings')} 
          icon={<Settings size={18} />} 
          label="সেটিংস (Settings)" 
          active={pathname?.startsWith('/settings')} 
        />
      </nav>

      {/* Bottom CTA Card & User Identity */}
      <div className="p-3.5 border-t border-slate-100 shrink-0 bg-slate-50/40">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3 mb-3 text-center shadow-2xs">
          <div className="w-8 h-8 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-1.5 shadow-2xs">
            <Building2 size={16} className="text-emerald-600" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">নাগরিক ভূমিকা রাখুন</h4>
          <p className="text-[10.5px] text-slate-500 mt-0.5 leading-normal">
            তথ্য প্রদান করুন, প্রমাণ যুক্ত করুন এবং আলোচনায় অংশ নিন।
          </p>
          <button 
            onClick={() => router.push('/create-case')}
            className="mt-2.5 w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-1.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Plus size={14} />
            <span>নতুন বিষয় তুলুন</span>
          </button>
        </div>
        
        {isAuthenticated && user ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/70 hover:bg-slate-50 transition cursor-pointer" onClick={() => router.push(userProfilePath)}>
            <div className="flex items-center gap-2.5 min-w-0">
              <img 
                src={getAvatarUrl(user)} 
                alt="User" 
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">{user.fullName || 'User'}</p>
                <p className="text-[10px] text-slate-500 truncate leading-tight">@{user.userName || 'citizen'}</p>
              </div>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); handleLogout(); }} 
              className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
              title="Log Out"
            >
              <LogOut size={15} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => router.push('/login')} 
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white hover:bg-blue-700 py-2 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <LogIn size={15} /> লগইন / রেজিস্ট্রেশন
          </button>
        )}
      </div>
    </aside>
  );
}
