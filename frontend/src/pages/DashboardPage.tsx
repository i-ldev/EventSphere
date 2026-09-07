// frontend/src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import { 
  CalendarDays, 
  Users, 
  Clock, 
  MapPin, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface OrganizerStats {
  totalTicketsSold: number;
  totalRevenue: number;
  totalEvents: number;
}

const liveStats = [
  { label: "Today's Events", value: '3', icon: CalendarDays, color: 'text-indigo-400', bg: 'bg-indigo-950/50' },
  { label: 'Live Attendees', value: '145', icon: Users, color: 'text-green-400', bg: 'bg-green-950/50' },
  { label: 'Pending Approvals', value: '12', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-950/50' },
  { label: 'Available Venues', value: '6', icon: MapPin, color: 'text-blue-400', bg: 'bg-blue-950/50' },
];

const recentActivityMock = [
  { user: 'Sarah M.', action: 'purchased VIP ticket', event: 'AI Conference', time: '2m ago' },
  { user: 'John D.', action: 'left a 5-star review', event: 'Tech Workshop', time: '15m ago' },
  { user: 'System', action: 'auto-published event', event: 'Startup Meetup', time: '1h ago' },
  { user: 'Admin', action: 'approved venue booking', event: 'Conference Hall A', time: '3h ago' },
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const location = useLocation();
  
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && (user.role === 'ORGANIZER' || user.role === 'SUPER_ADMIN')) {
      const fetchStats = async () => {
        try {
          const response = await api.get('/registrations/stats', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          setStats(response.data.data);
        } catch (error) {
          console.error('Failed to fetch stats', error);
        } finally {
          setLoading(false);
        }
      };
      fetchStats();
    } else {
      setLoading(false);
    }
  }, [user, accessToken]);

  const handleConnectStripe = async () => {
    try {
      const response = await api.post('/payments/connect', {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Failed to connect Stripe', error);
      alert('Failed to connect Stripe. Make sure the backend is running.');
    }
  };

  // Robust scroll to hash logic
  useEffect(() => {
    if (location.hash === '#recent-activity' && !loading) {
      const element = document.getElementById('recent-activity');
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-2', 'ring-indigo-500');
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-indigo-500');
          }, 2000);
        }, 100);
      }
    }
  }, [location.hash, loading]);

  return (
    <div className="text-zinc-100">
      {/* Page Header & Stripe Connect Button */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Good morning, {user?.firstName} 👋
          </h1>
          <p className="mt-1 text-zinc-400">
            Here's what's happening in your workspace today.
          </p>
        </div>

        {/* Connect Stripe Button (Organizers Only) */}
        {user?.role === 'ORGANIZER' && !user?.stripeAccountId && (
          <button 
            onClick={handleConnectStripe}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/30 flex-shrink-0"
          >
            Connect Bank Account
          </button>
        )}
        {user?.role === 'ORGANIZER' && user?.stripeAccountId && (
          <span className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-green-400 bg-green-950/50 border border-green-900/50 rounded-md">
            <CheckCircle2 className="w-4 h-4" /> Bank Connected
          </span>
        )}
      </div>

      {/* Live Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        {liveStats.map((stat) => (
          <div key={stat.label} className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg border border-zinc-800 ${stat.bg}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-xs text-zinc-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        
        {/* Left Column (2/3 width) */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Upcoming Events with Progress */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Upcoming Events</h3>
              <button className="text-xs text-indigo-400 hover:text-indigo-300">View all</button>
            </div>
            {/* Clean Empty State for Events */}
            <div className="space-y-4">
              <div className="p-4 bg-zinc-950 rounded-lg border border-zinc-800 text-center">
                <CalendarDays className="w-8 h-8 mx-auto mb-2 text-zinc-700" />
                <p className="text-sm text-zinc-500">No upcoming events yet. Create one to see it here!</p>
              </div>
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div id="recent-activity" className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl transition-all duration-300">
            <h3 className="mb-4 text-lg font-semibold text-white">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivityMock.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="relative">
                    <div className="w-2 h-2 mt-1.5 bg-indigo-500 rounded-full"></div>
                    {index < recentActivityMock.length - 1 && (
                      <div className="absolute left-1/2 -translate-x-1/2 top-3 w-px h-6 bg-zinc-800"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm text-zinc-300">
                      <span className="font-medium text-white">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Event: {activity.event} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1/3 width) */}
        <div className="space-y-6">
          
          {/* Mini Calendar Widget */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">August 2024</h3>
              <CalendarDays className="w-5 h-5 text-zinc-500" />
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div key={i} className="text-[10px] font-medium text-zinc-600 pb-2">{day}</div>
              ))}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <div 
                  key={day} 
                  className={`text-xs p-1.5 rounded-md cursor-pointer ${
                    day === 11 ? 'bg-indigo-600 text-white font-bold' : 'text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-xs font-medium text-zinc-500 mb-2">Next Event</p>
              <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
                <p className="text-sm font-medium text-white">No events scheduled</p>
              </div>
            </div>
          </div>

          {/* Platform Revenue */}
          {!loading && stats && (user?.role === 'ORGANIZER' || user?.role === 'SUPER_ADMIN') && (
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Revenue</h3>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
              <p className="text-3xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-zinc-500 mt-1">All-time earnings</p>
              <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500">Tickets Sold</p>
                  <p className="text-lg font-semibold text-white">{stats.totalTicketsSold}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500">Total Events</p>
                  <p className="text-lg font-semibold text-white">{stats.totalEvents}</p>
                </div>
              </div>
            </div>
          )}

          {/* Notifications/To-Do */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Pending Tasks</h3>
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="w-4 h-4 border border-zinc-600 rounded-sm"></div>
                Approve 3 venue requests
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="w-4 h-4 border border-zinc-600 rounded-sm"></div>
                Publish 2 draft events
              </div>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="line-through text-zinc-600">Setup scanner for AI Conf</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}