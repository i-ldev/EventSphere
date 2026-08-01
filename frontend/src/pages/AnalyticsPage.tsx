// frontend/src/pages/AnalyticsPage.tsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { DollarSign, Ticket, TrendingUp, Users } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

interface OrganizerStats {
  totalTicketsSold: number;
  totalRevenue: number;
  totalEvents: number;
}

// Mock Data for Charts
const revenueData = [
  { month: 'Jan', revenue: 1200, tickets: 12 },
  { month: 'Feb', revenue: 1800, tickets: 18 },
  { month: 'Mar', revenue: 1500, tickets: 15 },
  { month: 'Apr', revenue: 2400, tickets: 24 },
  { month: 'May', revenue: 3200, tickets: 32 },
  { month: 'Jun', revenue: 2800, tickets: 28 },
];

const ticketTierData = [
  { name: 'VIP', value: 45, color: '#6366f1' }, // Indigo
  { name: 'General', value: 120, color: '#22c55e' }, // Green
  { name: 'Early Bird', value: 60, color: '#eab308' }, // Yellow
];

const eventAttendanceData = [
  { name: 'AI Conf', attendance: 145 },
  { name: 'Tech Workshop', attendance: 45 },
  { name: 'Startup Meet', attendance: 85 },
];

export default function AnalyticsPage() {
  const [stats, setStats] = useState<OrganizerStats | null>(null);
  const [setLoading] = useState(true);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
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
  }, [accessToken]);

  return (
    <div className="text-zinc-100">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Analytics
        </h1>
        <p className="mt-1 text-zinc-400">
          Deep dive into your event performance and revenue.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4">
        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-green-900/30 rounded-lg border border-green-800/50">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            ${stats?.totalRevenue.toFixed(2) || '0.00'}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Total Revenue</p>
        </div>

        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-blue-900/30 rounded-lg border border-blue-800/50">
              <Ticket className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats?.totalTicketsSold || 0}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Tickets Sold</p>
        </div>

        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-indigo-900/30 rounded-lg border border-indigo-800/50">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">
            {stats?.totalEvents || 0}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Events Hosted</p>
        </div>

        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-purple-900/30 rounded-lg border border-purple-800/50">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-2xl font-bold text-white">4.8 / 5</p>
          <p className="text-xs text-zinc-500 mt-1">Avg. Rating</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        {/* Revenue Line Chart */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <h3 className="mb-6 text-lg font-semibold text-white">
            Revenue Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis
                dataKey="month"
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#71717a"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ fill: '#6366f1', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Ticket Tier Pie Chart */}
        <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
          <h3 className="mb-6 text-lg font-semibold text-white">
            Ticket Tier Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={ticketTierData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {ticketTierData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#09090b',
                  border: '1px solid #27272a',
                  borderRadius: '0.5rem',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Event Attendance Bar Chart */}
      <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl mb-6">
        <h3 className="mb-6 text-lg font-semibold text-white">
          Event Attendance Comparison
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={eventAttendanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
            <XAxis
              dataKey="name"
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#71717a"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              cursor={{ fill: '#18181b' }}
              contentStyle={{
                backgroundColor: '#09090b',
                border: '1px solid #27272a',
                borderRadius: '0.5rem',
                color: '#fff',
              }}
            />
            <Bar dataKey="attendance" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
