'use client';
import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Search, Bell, LayoutDashboard, Compass, MapPin, Briefcase, Bookmark, Plus, LogOut, LogIn } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/feature/auth/auth.slice';
import { useLogoutApiMutation, useGetUserProfileQuery } from '@/redux/feature/user/user.reducer';
import { getAvatarUrl } from '@/lib/utils';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [logoutApi] = useLogoutApiMutation();
  const { data: profileResponse } = useGetUserProfileQuery('me', { skip: !isAuthenticated });
  
  const mergedUser = user ? { ...user, userProfile: profileResponse?.data?.userProfile } : null;

  const handleLogout = async () => {
    try {
      await logoutApi().unwrap();
    } catch(e) {}
    dispatch(logout());
    router.push('/');
  };

  const username = user?.fullName || 'User';
  const initial = username.charAt(0).toUpperCase();

  const NavItem = ({ icon, path, active }: { icon: React.ReactNode, path: string, active: boolean }) => (
    <button 
      onClick={() => router.push(path)}
      className={`h-14 px-4 sm:px-6 md:px-8 flex items-center justify-center transition-all ${
         active 
            ? 'text-slate-600 border-b-[3px] border-slate-600 pt-[3px]' 
            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 rounded-lg my-1 h-12'
      }`}
    >
      {icon}
    </button>
  );

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-50 shadow-sm shrink-0">
      {/* Left: Logo and Search */}
      <div className="flex items-center gap-3 w-1/4">
        <div 
           className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center text-white font-extrabold text-xl shadow-sm cursor-pointer shrink-0"
           onClick={() => router.push('/')}
        >
          D
        </div>
        <div className="hidden lg:flex items-center gap-2 bg-slate-100 border border-transparent px-3 py-2 rounded-full text-slate-500 focus-within:border-slate-400 focus-within:bg-white transition max-w-[280px] w-full">
          <Search size={16} className="text-slate-400 shrink-0" />
          <input 
            type="text" 
            placeholder="Search Drishtivongi..." 
            className="bg-transparent border-none outline-none flex-1 text-sm text-slate-800 placeholder:text-slate-500 w-full"
          />
        </div>
      </div>

      {/* Middle: Navigation Icons */}
      <div className="flex items-center justify-center gap-1 flex-1">
        <NavItem icon={<LayoutDashboard size={24} />} path="/" active={pathname === '/'} />
        <NavItem icon={<Compass size={24} />} path="/explore" active={pathname?.startsWith('/explore')} />
        <NavItem icon={<MapPin size={24} />} path="/nearby" active={pathname?.startsWith('/nearby')} />
        <NavItem icon={<Briefcase size={24} />} path="/projects" active={pathname?.startsWith('/projects')} />
        <NavItem icon={<Bookmark size={24} />} path="/saved" active={pathname?.startsWith('/saved')} />
      </div>

      {/* Right: Actions and Profile */}
      <div className="flex items-center justify-end gap-2 w-1/4">
        <button 
           onClick={() => router.push('/create-case')}
           className="hidden sm:flex items-center gap-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-full text-sm transition"
        >
           <Plus size={16} /> <span className="hidden xl:inline">Create</span>
        </button>
        <button className="relative w-10 h-10 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center transition">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            3
          </span>
        </button>
        
        {isAuthenticated && user ? (
           <div className="relative group cursor-pointer ml-1">
              <div 
                className="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm border-2 border-transparent group-hover:border-slate-200 transition"
                onClick={() => router.push(user.userName ? `/profile/${user.userName}` : '/profile/me')}
              >
                {user ? (
                   <img src={getAvatarUrl(mergedUser)} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                ) : (
                   initial
                )}
              </div>
               <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 hidden group-hover:block z-50 py-1">
                 <div className="px-4 py-2 border-b border-slate-100">
                    <p className="font-bold text-slate-800 text-sm truncate">{user.fullName}</p>
                    <p className="text-xs text-slate-500 capitalize">{user.type === 'CITIZEN' ? 'User' : (user.type || 'User')}</p>
                 </div>
                 <button onClick={() => router.push(user.userName ? `/profile/${user.userName}` : '/profile/me')} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <LayoutDashboard size={16} className="text-slate-400" /> My Profile
                 </button>
                 <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <LogOut size={16} className="text-slate-400" /> Log Out
                 </button>
              </div>
           </div>
        ) : (
           <button 
             onClick={() => router.push('/login')} 
             className="ml-2 flex items-center gap-2 bg-slate-600 text-white hover:bg-slate-700 px-4 py-1.5 rounded-full text-sm font-semibold transition shadow-sm"
           >
             <LogIn size={16} /> <span className="hidden sm:inline">Login</span>
           </button>
        )}
      </div>
    </header>
  );
}
