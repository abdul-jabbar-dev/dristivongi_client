'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Compass, MapPin, Briefcase, Building2, Bookmark, FolderOpen, History, BellRing, Settings, HelpCircle, LogOut, LogIn } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/feature/auth/auth.slice';
import { useLogoutApiMutation } from '@/redux/feature/user/user.reducer';

function NavItem({ icon, label, badge, active = false, onClick }: { icon: React.ReactNode, label: string, badge?: string, active?: boolean, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${active ? 'bg-slate-50 text-slate-700 font-medium' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
      <div className="flex items-center gap-3">
        <div className={active ? 'text-slate-600' : 'text-slate-400'}>{icon}</div>
        <span className="text-sm">{label}</span>
      </div>
      {badge && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{badge}</span>}
    </div>
  );
}

export default function Sidebar() {
  const router = useRouter();
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

  return (
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex h-full">
        {/* Drishtivongi Logo Header */}
        <div className="h-16 flex shrink-0 items-center px-5 border-b border-slate-200 cursor-pointer" onClick={() => router.push('/')}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-600 rounded-xl flex items-center justify-center text-white font-extrabold text-xl shadow-sm">
              D
            </div>
            <div>
              <div className="text-slate-900 font-extrabold text-base tracking-tight leading-tight">Drishtivongi</div>
              <div className="text-[10px] text-slate-500 font-medium leading-none">People, Evidence, Better Decisions.</div>
            </div>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="p-4 space-y-1 overflow-y-auto flex-1">
          <NavItem onClick={() => router.push('/')} icon={<LayoutDashboard size={18} />} label="Home" />
          <NavItem onClick={() => router.push('/')} icon={<Compass size={18} />} label="Explore Cases" active />
          <NavItem icon={<MapPin size={18} />} label="Nearby Cases" />
          <NavItem icon={<FolderOpen size={18} />} label="For You" />
          <NavItem icon={<Briefcase size={18} />} label="Projects" />
          <NavItem icon={<Building2 size={18} />} label="Organizations" />
          
          <div className="pt-3 pb-1">
            <div className="border-t border-slate-100" />
          </div>

          <NavItem icon={<Bookmark size={18} />} label="Saved Cases" />
          <NavItem icon={<History size={18} />} label="My Contributions" />
          <NavItem icon={<BellRing size={18} />} label="Notifications" badge="3" />
          <NavItem icon={<Settings size={18} />} label="Settings" />
        </nav>

        {/* Bottom CTA Card: Make a difference */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 mb-3 text-center">
            <div className="w-9 h-9 bg-emerald-100/80 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-2">
              <Building2 size={18} className="text-emerald-600" />
            </div>
            <h4 className="text-xs font-bold text-slate-900">Make a difference</h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-normal">
              Share information, add evidence, and join the discussion.
            </p>
            <button 
              onClick={() => router.push('/create-case')}
              className="mt-3 w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              + Create New Case
            </button>
          </div>
          
          {isAuthenticated && user ? (
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 shrink-0 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'N'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{user.fullName}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{user.type || 'Citizen'}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-slate-700 p-1">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => router.push('/login')} 
              className="w-full flex items-center justify-center gap-2 bg-slate-600 text-white hover:bg-slate-700 py-2 rounded-xl text-xs font-semibold transition shadow-sm"
            >
              <LogIn size={15} /> Login / Register
            </button>
          )}
        </div>
      </aside>
  );
}
