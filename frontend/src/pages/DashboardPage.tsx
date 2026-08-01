// frontend/src/pages/DashboardPage.tsx
import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import {
  CalendarDays,
  Users,
  Clock,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface OrganizerStats {
  totalTicketsSold: number;
  totalRevenue: number;
  totalEvents: number;
}

// Mock data to represent the "Command Center" feel
const liveStats = [
  {
    label: "Today's Events",
    value: '3',
    icon: CalendarDays,
    color: 'text-indigo-400',
    bg: 'bg-indigo-950/50',
  },
  {
    label: 'Live Attendees',
    value: '145',
    icon: Users,
    color: 'text-green-400',
    bg: 'bg-green-950/50',
  },
  {
    label: 'Pending Approvals',
    value: '12',
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-950/50',
  },
  {
    label: 'Available Venues',
    value: '6',
    icon: MapPin,
    color: 'text-blue-400',
    bg: 'bg-blue-950/50',
  },
];

const upcomingEventsMock = [
  {
    name: 'AI Conference 2024',
    date: 'Today, 10:00 AM',
    progress: 80,
    status: 'On Track',
  },
  {
    name: 'Tech Workshop',
    date: 'Tomorrow, 02:00 PM',
    progress: 45,
    status: 'Low Sales',
  },
  {
    name: 'Startup Meetup',
    date: 'Aug 15, 06:00 PM',
    progress: 100,
    status: 'Sold Out',
  },
];

const recentActivityMock = [
  {
    user: 'Sarah M.',
    action: 'purchased VIP ticket',
    event: 'AI Conference',
    time: '2m ago',
  },
  {
    user: 'John D.',
    action: 'left a 5-star review',
    event: 'Tech Workshop',
    time: '15m ago',
  },
  {
    user: 'System',
    action: 'auto-published event',
    event: 'Startup Meetup',
    time: '1h ago',
  },
  {
    user: 'Admin',
    action: 'approved venue booking',
    event: 'Conference Hall A',
    time: '3h ago',
  },
];

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && (user.role === 'ORGANIZER' || user.role === 'SUPER_ADMIN')) {
      const fetchStats = async () => {
        try {
          const response = await api.get('/registrations/stats', {
            headers: { Authorization: `Bearer ${accessToken}` },
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

  return (
    <div className="text-zinc-100">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Good morning, {user?.firstName} 👋
        </h1>
        <p className="mt-1 text-zinc-400">
          Here's what's happening in the{' '}
          <span className="font-semibold text-indigo-400">City University</span>{' '}
          workspace today.
        </p>
      </div>

      {/* Live Stats Row */}
      <div className="grid grid-cols-2 gap-4 mb-8 lg:grid-cols-4">
        {liveStats.map((stat) => (
          <div
            key={stat.label}
            className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`p-2 rounded-lg border border-zinc-800 ${stat.bg}`}
              >
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
              <h3 className="text-lg font-semibold text-white">
                Upcoming Events
              </h3>
              <button className="text-xs text-indigo-400 hover:text-indigo-300">
                View all
              </button>
            </div>
            <div className="space-y-4">
              {upcomingEventsMock.map((event) => (
                <div
                  key={event.name}
                  className="p-4 bg-zinc-950 rounded-lg border border-zinc-800"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-white">{event.name}</p>
                      <p className="text-xs text-zinc-500 mt-1">{event.date}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-[10px] font-semibold rounded ${
                        event.status === 'Sold Out'
                          ? 'bg-green-950/50 text-green-400 border border-green-900/50'
                          : event.status === 'Low Sales'
                            ? 'bg-red-950/50 text-red-400 border border-red-900/50'
                            : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {event.status}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between mb-1 text-xs">
                      <span className="text-zinc-500">Ticket Sales</span>
                      <span className="font-medium text-zinc-300">
                        {event.progress}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          event.status === 'Low Sales'
                            ? 'bg-red-500'
                            : event.status === 'Sold Out'
                              ? 'bg-green-500'
                              : 'bg-indigo-500'
                        }`}
                        style={{ width: `${event.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Recent Activity
            </h3>
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
                      <span className="font-medium text-white">
                        {activity.user}
                      </span>{' '}
                      {activity.action}
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
          {/* Mini Calendar Widget (Mock) */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">August 2024</h3>
              <CalendarDays className="w-5 h-5 text-zinc-500" />
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                <div
                  key={i}
                  className="text-[10px] font-medium text-zinc-600 pb-2"
                >
                  {day}
                </div>
              ))}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                <div
                  key={day}
                  className={`text-xs p-1.5 rounded-md cursor-pointer ${
                    day === 11
                      ? 'bg-indigo-600 text-white font-bold'
                      : 'text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-xs font-medium text-zinc-500 mb-2">
                Next Event
              </p>
              <div className="p-2 bg-zinc-950 rounded border border-zinc-800">
                <p className="text-sm font-medium text-white">AI Conference</p>
                <p className="text-xs text-zinc-500">Aug 11, 10:00 AM</p>
              </div>
            </div>
          </div>

          {/* Platform Revenue (Mock) */}
          {!loading &&
            stats &&
            (user?.role === 'ORGANIZER' || user?.role === 'SUPER_ADMIN') && (
              <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Revenue</h3>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-white">
                  ${stats.totalRevenue.toFixed(2)}
                </p>
                <p className="text-xs text-zinc-500 mt-1">All-time earnings</p>
                <div className="mt-4 pt-4 border-t border-zinc-800 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-zinc-500">Tickets Sold</p>
                    <p className="text-lg font-semibold text-white">
                      {stats.totalTicketsSold}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500">Total Events</p>
                    <p className="text-lg font-semibold text-white">
                      {stats.totalEvents}
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Notifications/To-Do (Mock) */}
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Pending Tasks
              </h3>
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
                <span className="line-through text-zinc-600">
                  Setup scanner for AI Conf
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
