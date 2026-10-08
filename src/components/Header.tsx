'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, LayoutDashboard, Compass, MapPin, Briefcase, Bookmark, Plus, LogOut, LogIn, User, Settings, CheckCheck, Sparkles, Building2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/feature/auth/auth.slice';
import { useLogoutApiMutation } from '@/redux/feature/user/user.reducer';
import { getAvatarUrl } from '@/lib/utils';
import HeaderSearch from './search/HeaderSearch';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [logoutApi] = useLogoutApiMutation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch(e) {}
    dispatch(logout());
    router.push('/');
  };

  const userProfilePath = user?.userName ? `/profile/${user.userName}` : '/profile/me';

  const NavItem = ({ icon, path, active, label }: { icon: React.ReactNode, path: string, active: boolean, label: string }) => (
    <button 
      onClick={() => router.push(path)}
      title={label}
      className={`h-12 px-3 sm:px-5 flex items-center justify-center transition-all duration-150 relative cursor-pointer ${
         active 
            ? 'text-blue-600 border-b-[3px] border-blue-600 font-bold' 
            : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 rounded-xl my-1'
      }`}
    >
      {icon}
    </button>
  );

  return (
    <header className="h-14 bg-white border-b border-slate-200/90 flex items-center justify-between px-4 sticky top-0 z-50 shadow-2xs shrink-0 select-none">
      {/* Left: Logo and Search */}
      <div className="flex items-center gap-3 w-1/3">
        <div 
           className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-xs cursor-pointer shrink-0 transition-transform hover:scale-105"
           onClick={() => router.push('/')}
        >
          D
        </div>
        <div className="hidden md:flex flex-1 max-w-[360px]">
          <HeaderSearch />
        </div>
      </div>

      {/* Middle: Navigation Icons */}
      <div className="flex items-center justify-center gap-1 flex-1">
        <NavItem icon={<LayoutDashboard size={22} />} path="/" active={pathname === '/'} label="Home" />
        <NavItem icon={<Compass size={22} />} path="/explore" active={pathname?.startsWith('/explore')} label="Explore" />
        <NavItem icon={<MapPin size={22} />} path="/nearby" active={pathname?.startsWith('/nearby')} label="Nearby" />
        <NavItem icon={<Briefcase size={22} />} path="/projects" active={pathname?.startsWith('/projects')} label="Projects" />
        <NavItem icon={<Bookmark size={22} />} path="/saved" active={pathname?.startsWith('/saved')} label="Saved" />
      </div>

      {/* Right: Actions and Profile */}
      <div className="flex items-center justify-end gap-2 w-1/4">
        <button 
           onClick={() => router.push('/create-case')}
           className="hidden sm:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-3.5 py-1.5 rounded-full text-xs transition shadow-2xs cursor-pointer"
        >
           <Plus size={15} /> 
           <span>নতুন বিষয়</span>
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center transition cursor-pointer"
            title="Notifications"
          >
            <Bell size={18} />
            <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-rose-500 text-white text-[9.5px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-2xs">
              2
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs uppercase tracking-wider">
                  <Bell size={14} className="text-blue-600" />
                  <span>নোটিফিকেশন (Notifications)</span>
                </div>
                <span className="text-[10px] bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">2 New</span>
              </div>
              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                <div className="p-3 hover:bg-slate-50 transition cursor-pointer flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    <Sparkles size={16} />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800">আপনার দাবিটি পর্যালোচনায় রয়েছে</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">নতুন প্রমাণ যুক্ত হয়েছে ২ মিনিট আগে।</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">২ মিনিট পূর্বে</span>
                  </div>
                </div>
                <div className="p-3 hover:bg-slate-50 transition cursor-pointer flex gap-3 items-start">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    <CheckCheck size={16} />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold text-slate-800">অফিসিয়াল টিম মতামত প্রদান করেছে</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">সংগঠনের পক্ষ থেকে তথ্যসূত্র সাপোর্ট করা হয়েছে।</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">১ ঘণ্টা পূর্বে</span>
                  </div>
                </div>
              </div>
              <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                <button onClick={() => { setShowNotifications(false); router.push('/notifications'); }} className="text-xs font-bold text-blue-600 hover:text-blue-700">
                  সব নোটিফিকেশন দেখুন →
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* User Profile Popover Dropdown */}
        {isAuthenticated && user ? (
           <div className="relative" ref={userMenuRef}>
              <div 
                className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs border-2 border-transparent hover:border-blue-500 transition cursor-pointer overflow-hidden shadow-2xs"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                 <img src={getAvatarUrl(user)} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              </div>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 z-50 py-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                     <p className="font-bold text-slate-900 text-sm truncate">{user.fullName || 'User'}</p>
                     <p className="text-xs text-slate-500 truncate">@{user.userName || 'citizen'}</p>
                  </div>
                  <button 
                    onClick={() => { setShowUserMenu(false); router.push(userProfilePath); }} 
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                  >
                     <User size={15} className="text-slate-400" /> 
                     <span>আমার প্রোফাইল (My Profile)</span>
                  </button>
                  <button 
                    onClick={() => { setShowUserMenu(false); router.push(`${userProfilePath}?tab=contributions`); }} 
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                  >
                     <LayoutDashboard size={15} className="text-slate-400" /> 
                     <span>আমার অবদান (Contributions)</span>
                  </button>
                  <button 
                    onClick={() => { setShowUserMenu(false); router.push('/saved'); }} 
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                  >
                     <Bookmark size={15} className="text-slate-400" /> 
                     <span>সংরক্ষিত বিষয় (Saved)</span>
                  </button>
                  <button 
                    onClick={() => { setShowUserMenu(false); router.push('/settings'); }} 
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 transition"
                  >
                     <Settings size={15} className="text-slate-400" /> 
                     <span>সেটিংস (Settings)</span>
                  </button>
                  <div className="my-1 border-t border-slate-100" />
                  <button 
                    onClick={() => { setShowUserMenu(false); handleLogout(); }} 
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition"
                  >
                     <LogOut size={15} className="text-rose-500" /> 
                     <span>লগআউট (Log Out)</span>
                  </button>
                </div>
              )}
           </div>
        ) : (
           <button 
             onClick={() => router.push('/login')} 
             className="ml-1 flex items-center gap-1.5 bg-slate-900 text-white hover:bg-slate-800 px-3.5 py-1.5 rounded-full text-xs font-bold transition shadow-2xs cursor-pointer"
           >
             <LogIn size={14} /> 
             <span className="hidden sm:inline">লগইন</span>
           </button>
        )}
      </div>
    </header>
  );
}
