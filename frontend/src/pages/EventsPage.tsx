// frontend/src/pages/EventsPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarDays,
  MapPin,
  PlusCircle,
  CheckCircle2,
  Clock,
  Users,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Calendar as CalendarIcon,
  Search,
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: {
    id: string;
    name: string;
    address: string;
    capacity: number;
  } | null;
  status: string;
  organizerId: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data.data);
    } catch (error) {
      console.error('Failed to fetch events', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handlePublish = async (eventId: string) => {
    try {
      await api.put(
        `/events/${eventId}/publish`,
        {},
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      fetchEvents();
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Failed to publish event');
    }
  };

  // --- Filtering Logic ---
  const filteredEvents = events.filter(
    (event) =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue?.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // --- Calendar Helpers ---
  const changeMonth = (dir: number) => {
    setDirection(dir);
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + dir, 1),
    );
  };

  useEffect(() => {
    if (view !== 'calendar') return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowLeft') changeMonth(-1);
      if (e.key === 'ArrowRight') changeMonth(1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, currentDate]);

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  ).getDay();

  const calendarDays = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
    );
  }
  while (calendarDays.length < 42) calendarDays.push(null);

  const getEventsForDay = (date: Date) => {
    if (!date) return [];
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-zinc-500">
        Loading events...
      </div>
    );
  }

  const today = new Date();

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 }),
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] text-zinc-100">
      {/* Page Header & View Toggle */}
      <div className="flex flex-col gap-4 mb-6 flex-shrink-0 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Events
          </h1>
          <p className="mt-1 text-zinc-400">
            Manage and track the performance of all your events.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 md:flex-initial md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-2.5 pl-9 pr-3 text-sm text-white placeholder-zinc-500 bg-zinc-900 border border-zinc-800 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            />
          </div>

          <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'list' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> List
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${view === 'calendar' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <CalendarIcon className="w-3.5 h-3.5" /> Calendar
            </button>
          </div>

          {(user?.role === 'ORGANIZER' || user?.role === 'SUPER_ADMIN') && (
            <Link
              to="/create-event"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/30 flex-shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Create Event</span>
            </Link>
          )}
        </div>
      </div>

      {/* --- LIST VIEW --- */}
      {view === 'list' && (
        <>
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-xl">
              <CalendarDays className="w-10 h-10 mb-4 text-zinc-700" />
              <p className="text-zinc-500">
                No events found. Try a different search!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 overflow-y-auto pr-2">
              {filteredEvents.map((event) => {
                const mockRegistrations = Math.floor(Math.random() * 300) + 20;
                const venueCapacity = event.venue?.capacity || 380;
                const mockProgress = Math.min(
                  (mockRegistrations / venueCapacity) * 100,
                  100,
                );

                return (
                  <div
                    key={event.id}
                    className="flex flex-col p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h2 className="text-lg font-semibold text-white">
                        {event.title}
                      </h2>
                      {event.status === 'PUBLISHED' ? (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-400 bg-green-950/50 border border-green-900/50 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> Live
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-yellow-400 bg-yellow-950/50 border border-yellow-900/50 rounded-md">
                          <Clock className="w-3 h-3" /> Draft
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 mb-4 text-xs text-zinc-500">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5 text-zinc-600" />
                        {new Date(event.date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                        {event.venue?.name || 'TBD'}
                      </span>
                    </div>

                    <p className="mb-6 text-sm text-zinc-400 line-clamp-2 flex-grow">
                      {event.description}
                    </p>

                    {event.status === 'PUBLISHED' ? (
                      <div className="pt-4 mt-auto border-t border-zinc-800">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <Users className="w-4 h-4 text-indigo-400" />
                            <span className="font-medium text-white">
                              {mockRegistrations}
                            </span>{' '}
                            / {venueCapacity} Registrations
                          </div>
                          <span className="text-xs font-medium text-zinc-400">
                            {mockProgress.toFixed(0)}% Capacity
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full"
                            style={{ width: `${mockProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-4 mt-auto border-t border-zinc-800">
                        <p className="text-xs text-zinc-500">
                          Event is currently in draft mode.
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-3 mt-4">
                      <Link
                        to={`/events/${event.id}`}
                        className="flex items-center justify-center flex-1 gap-1.5 px-3 py-2 text-xs font-medium text-white bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 transition-colors"
                      >
                        Manage Event <ArrowRight className="w-3 h-3" />
                      </Link>
                      {event.status === 'DRAFT' &&
                        event.organizerId === user?.id && (
                          <button
                            onClick={() => handlePublish(event.id)}
                            className="px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors"
                          >
                            Publish
                          </button>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* --- CALENDAR VIEW --- */}
      {view === 'calendar' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">
                {currentDate.toLocaleString('default', {
                  month: 'long',
                  year: 'numeric',
                })}
              </h2>
              <span className="hidden text-[10px] font-medium text-zinc-500 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md sm:inline-block">
                Use ← → keys
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => changeMonth(-1)}
                className="p-2 text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setDirection(0);
                  setCurrentDate(new Date());
                }}
                className="px-4 py-2 text-xs font-medium text-white bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => changeMonth(1)}
                className="p-2 text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px mb-px flex-shrink-0">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="py-2 text-xs font-semibold tracking-wider text-center text-zinc-500 uppercase border-b border-zinc-800"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence
              initial={false}
              custom={direction}
              mode="popLayout"
            >
              <motion.div
                key={currentDate.getMonth()}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="absolute inset-0 grid grid-cols-7 grid-rows-6 gap-px bg-zinc-800 border border-zinc-800 rounded-lg overflow-hidden"
              >
                {calendarDays.map((date, index) => {
                  const dayEvents = date ? getEventsForDay(date) : [];
                  const isToday =
                    date && date.toDateString() === today.toDateString();

                  return (
                    <div
                      key={index}
                      className={`flex flex-col p-2 overflow-hidden transition-colors group ${date ? 'bg-zinc-950 hover:bg-zinc-900/80' : 'bg-zinc-900/50'}`}
                    >
                      {date && (
                        <>
                          <div className="flex justify-end mb-1">
                            <span
                              className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full transition-colors ${isToday ? 'bg-indigo-600 text-white font-bold' : 'text-zinc-500 group-hover:text-zinc-300'}`}
                            >
                              {date.getDate()}
                            </span>
                          </div>
                          <div className="flex-1 space-y-1 overflow-y-auto scrollbar-thin">
                            {dayEvents.map((event) => (
                              <Link
                                key={event.id}
                                to={`/events/${event.id}`}
                                className="block px-2 py-1 text-[10px] font-medium text-indigo-300 bg-indigo-950/50 border border-indigo-900/50 rounded truncate hover:bg-indigo-600 hover:text-white transition-colors"
                              >
                                {event.title}
                              </Link>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
