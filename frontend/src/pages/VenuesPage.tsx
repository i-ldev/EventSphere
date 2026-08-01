// frontend/src/pages/VenuesPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import {
  MapPin,
  Users,
  PlusCircle,
  Projector,
  Mic,
  Video,
  CheckCircle2,
  Clock,
  Search,
} from 'lucide-react';

interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
  description?: string;
  equipment: string[];
}

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const response = await api.get('/venues');
        setVenues(response.data.data);
      } catch (error) {
        console.error('Failed to fetch venues', error);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  // --- Filtering Logic ---
  const filteredVenues = venues.filter(
    (venue) =>
      venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-zinc-500">
        Loading venues...
      </div>
    );
  }

  // Helper to map string to icon
  const getIcon = (equipName: string) => {
    if (equipName === 'Projector') return Projector;
    if (equipName === 'Microphones') return Mic;
    return Video;
  };

  return (
    <div className="text-zinc-100">
      {/* Page Header */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Venues
          </h1>
          <p className="mt-1 text-zinc-400">
            Manage physical locations, equipment, and availability.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pl-9 pr-3 text-sm text-white placeholder-zinc-500 bg-zinc-900 border border-zinc-800 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            />
          </div>

          {(user?.role === 'ORGANIZER' || user?.role === 'SUPER_ADMIN') && (
            <Link
              to="/create-venue"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/30 flex-shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Create Venue</span>
            </Link>
          )}
        </div>
      </div>

      {filteredVenues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-xl">
          <MapPin className="w-10 h-10 mb-4 text-zinc-700" />
          <p className="text-zinc-500">
            No venues found. Try a different search!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredVenues.map((venue) => {
            // Mocking a booking status for UI purposes
            const isBookedToday = venue.capacity > 150;

            return (
              <div
                key={venue.id}
                className="flex flex-col p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-lg font-semibold text-white">
                    {venue.name}
                  </h2>
                  {isBookedToday ? (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-400 bg-red-950/50 border border-red-900/50 rounded-md">
                      <Clock className="w-3 h-3" />
                      Booked Today
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-400 bg-green-950/50 border border-green-900/50 rounded-md">
                      <CheckCircle2 className="w-3 h-3" />
                      Available Today
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 mb-6 text-xs text-zinc-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                    {venue.address}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-zinc-600" />
                    Capacity: {venue.capacity} pax
                  </span>
                </div>

                {/* Today's Schedule (Mocked for now) */}
                <div className="mb-4 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase mb-1">
                    Today's Schedule
                  </p>
                  {isBookedToday ? (
                    <p className="text-sm text-white">
                      <span className="font-medium text-indigo-400">
                        09:00 - 17:00
                      </span>{' '}
                      - AI Summit 2024
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-500">
                      No bookings for today.
                    </p>
                  )}
                </div>

                {/* Dynamic Equipment List */}
                <div className="mt-auto pt-4 border-t border-zinc-800">
                  <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase mb-2">
                    Equipment Available
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {venue.equipment && venue.equipment.length > 0 ? (
                      venue.equipment.map((equipName) => {
                        const Icon = getIcon(equipName);
                        return (
                          <span
                            key={equipName}
                            className="flex items-center gap-1 text-xs text-zinc-400"
                          >
                            <Icon className="w-3.5 h-3.5 text-zinc-500" />{' '}
                            {equipName}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-zinc-600">
                        No specific equipment listed.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
