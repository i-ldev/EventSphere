// frontend/src/components/layout/Sidebar.tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, type AuthState } from '../../store/authStore';
import { cn } from '../../lib/utils';
import CommandMenu from '../CommandMenu';
import { useState, useEffect } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  LayoutDashboard,
  Ticket,
  MapPin,
  QrCode,
  Settings,
  LogOut,
  Search,
  Sparkles,
  ChevronDown,
  Plus,
  BarChart3,
  UserCog,
  Bell,
  CheckCircle2,
  Star,
  Rocket,
  CalendarCheck,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
}

const navConfig: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['ORGANIZER', 'ATTENDEE', 'SUPER_ADMIN'] },
  { name: 'Events', href: '/events', icon: Ticket, roles: ['ORGANIZER', 'ATTENDEE', 'SUPER_ADMIN'] },
  { name: 'Venues', href: '/venues', icon: MapPin, roles: ['ORGANIZER', 'SUPER_ADMIN'] },
  { name: 'Scanner', href: '/scanner', icon: QrCode, roles: ['ORGANIZER', 'STAFF'] },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, roles: ['ORGANIZER', 'SUPER_ADMIN'] },
  { name: 'My Tickets', href: '/my-tickets', icon: Ticket, roles: ['ATTENDEE'] },
  { name: 'User Management', href: '/admin/users', icon: UserCog, roles: ['SUPER_ADMIN'] },
];

const mockNotifications = [
  { id: 1, title: 'New Registration', desc: 'Sarah M. bought a VIP ticket', time: '2m ago', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
  { id: 2, title: 'New 5-Star Review', desc: 'John D. reviewed Tech Workshop', time: '15m ago', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { id: 3, title: 'Event Published', desc: 'Startup Meetup is now live', time: '1h ago', icon: Rocket, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { id: 4, title: 'Venue Booked', desc: 'Conference Hall A booked for Friday', time: '3h ago', icon: CalendarCheck, color: 'text-blue-400', bg: 'bg-blue-500/10' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state: AuthState) => state.user);
  const logout = useAuthStore((state: AuthState) => state.logout);

  const [commandOpen, setCommandOpen] = useState(false);
  const [isUnread, setIsUnread] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleLinks = navConfig.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className="flex flex-col w-64 h-screen bg-zinc-950 border-r border-zinc-800/80 fixed overflow-visible z-50">
      {/* Top Bar: Switcher & Notifications */}
      <div className="p-3 border-b border-zinc-800/80 flex items-center justify-between">
        <button className="flex items-center justify-between flex-1 px-3 py-2.5 text-left rounded-lg hover:bg-zinc-900 transition-colors group">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              {/* Dynamic Workspace Name */}
              <p className="text-sm font-semibold text-white truncate">{user?.firstName}'s Workspace</p>
              <p className="text-xs text-zinc-500 truncate">Workspace</p>
            </div>
          </div>
          <ChevronDown className="flex-shrink-0 w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <Popover>
            {({ open, close }) => (
              <>
                <Popover.Button className="p-2 text-zinc-400 rounded-md hover:bg-zinc-900 hover:text-white transition-colors focus:outline-none relative z-[101]">
                  <Bell className="w-5 h-5" />
                  {isUnread && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-zinc-950"></span>
                  )}
                </Popover.Button>
                
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-150"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-100"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Popover.Panel className="fixed left-[17rem] top-12 w-[400px] bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl shadow-black/50 z-[100] overflow-hidden">
                    <div className="flex items-center justify-between p-4 border-b border-zinc-700">
                      <h3 className="text-sm font-semibold text-white">Notifications</h3>
                      <button 
                        onClick={() => setIsUnread(false)} 
                        className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                      {mockNotifications.map((notif) => (
                        <div key={notif.id} className="flex items-start gap-3 p-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors cursor-pointer">
                          <div className={`flex-shrink-0 p-2 rounded-lg ${notif.bg} ${!isUnread ? 'opacity-50' : ''}`}>
                            <notif.icon className={`w-4 h-4 ${notif.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-zinc-100">{notif.title}</p>
                              <span className="text-[10px] text-zinc-400 ml-2 flex-shrink-0">{notif.time}</span>
                            </div>
                            <p className="text-xs text-zinc-300 mt-0.5">{notif.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        close();
                        navigate('/dashboard#recent-activity');
                      }}
                      className="w-full p-3 text-xs font-medium text-indigo-400 hover:bg-zinc-800/50 transition-colors border-t border-zinc-700"
                    >
                      View all activity
                    </button>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
      </div>

      {/* Search & Quick Create */}
      <div className="p-3 space-y-2 border-b border-zinc-800/80">
        <button 
          onClick={() => setCommandOpen(true)}
          className="flex items-center w-full gap-2 px-3 py-2 text-sm text-zinc-500 bg-zinc-900 rounded-md border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Search...</span>
          <kbd className="ml-auto px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 rounded text-zinc-400">⌘K</kbd>
        </button>
        <button 
          onClick={() => setCommandOpen(true)}
          className="flex items-center justify-center w-full gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Quick Create
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-zinc-600 uppercase">Workspace</p>
        {visibleLinks.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive 
                  ? 'bg-zinc-800 text-white' 
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-3 border-t border-zinc-800/80">
        <div className="flex items-center gap-3 p-2 mb-1 rounded-md hover:bg-zinc-900 transition-colors cursor-pointer">
          <div className="flex items-center justify-center w-9 h-9 bg-zinc-800 rounded-full">
            <span className="text-sm font-bold text-white">
              {user?.firstName?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
          <Settings className="w-4 h-4 text-zinc-500" />
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-2 py-2 text-sm font-medium text-zinc-400 rounded-md hover:text-white hover:bg-zinc-900 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>

      <CommandMenu open={commandOpen} setOpen={setCommandOpen} />
    </aside>
  );
}