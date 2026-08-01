// frontend/src/components/layout/Sidebar.tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore, type AuthState } from '../../store/authStore';
import { cn } from '../../lib/utils';
import CommandMenu from '../CommandMenu';
import { useState, useEffect } from 'react';
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
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  roles: string[];
}

// Define role-based navigation
const navConfig: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ORGANIZER', 'ATTENDEE', 'SUPER_ADMIN'],
  },
  {
    name: 'Events',
    href: '/events',
    icon: Ticket,
    roles: ['ORGANIZER', 'ATTENDEE', 'SUPER_ADMIN'],
  },
  {
    name: 'Venues',
    href: '/venues',
    icon: MapPin,
    roles: ['ORGANIZER', 'SUPER_ADMIN'],
  },
  {
    name: 'Scanner',
    href: '/scanner',
    icon: QrCode,
    roles: ['ORGANIZER', 'STAFF'],
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    roles: ['ORGANIZER', 'SUPER_ADMIN'],
  },
  {
    name: 'My Tickets',
    href: '/my-tickets',
    icon: Ticket,
    roles: ['ATTENDEE'],
  },
  {
    name: 'User Management',
    href: '/admin/users',
    icon: UserCog,
    roles: ['SUPER_ADMIN'],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state: AuthState) => state.user);
  const logout = useAuthStore((state: AuthState) => state.logout);

  const [commandOpen, setCommandOpen] = useState(false);

  // Listen for Ctrl+K / Cmd+K globally
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

  // Filter links based on user role
  const visibleLinks = navConfig.filter(
    (item) => user && item.roles.includes(user.role),
  );

  return (
    <aside className="flex flex-col w-64 h-screen bg-zinc-950 border-r border-zinc-800/80 fixed">
      {/* Workspace Switcher */}
      <div className="p-3 border-b border-zinc-800/80">
        <button className="flex items-center justify-between w-full px-3 py-2.5 text-left rounded-lg hover:bg-zinc-900 transition-colors group">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 bg-indigo-600 rounded-md">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                City University
              </p>
              <p className="text-xs text-zinc-500 truncate">Workspace</p>
            </div>
          </div>
          <ChevronDown className="flex-shrink-0 w-4 h-4 text-zinc-500 group-hover:text-zinc-300" />
        </button>
      </div>

      {/* Search & Quick Create */}
      <div className="p-3 space-y-2 border-b border-zinc-800/80">
        <button
          onClick={() => setCommandOpen(true)}
          className="flex items-center w-full gap-2 px-3 py-2 text-sm text-zinc-500 bg-zinc-900 rounded-md border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <Search className="w-4 h-4" />
          <span>Search...</span>
          <kbd className="ml-auto px-1.5 py-0.5 text-[10px] font-mono bg-zinc-800 rounded text-zinc-400">
            ⌘K
          </kbd>
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
        <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-zinc-600 uppercase">
          Workspace
        </p>
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
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900',
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
            <p className="text-sm font-medium text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
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

      {/* Render the Command Menu */}
      <CommandMenu open={commandOpen} setOpen={setCommandOpen} />
    </aside>
  );
}
