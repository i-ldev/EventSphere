// frontend/src/pages/CalendarPage.tsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  date: string;
  status: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
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
    fetchEvents();
  }, []);

  const changeMonth = (direction: number) => {
    setCurrentDate(
      new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() + direction,
        1,
      ),
    );
  };

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
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(
      new Date(currentDate.getFullYear(), currentDate.getMonth(), day),
    );
  }

  // Fill the remaining grid to make a perfect 6x7 grid (42 days) so the bottom border doesn't break
  const totalCells = 42;
  while (calendarDays.length < totalCells) {
    calendarDays.push(null);
  }

  const getEventsForDay = (date: Date) => {
    if (!date) return [];
    return events.filter((event) => {
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
      <div className="flex items-center justify-center h-[calc(100vh-100px)] text-zinc-500">
        Loading calendar...
      </div>
    );
  }

  const today = new Date();

  return (
    // Fixed height container to prevent page scroll (adjusts for sidebar padding)
    <div className="flex flex-col h-[calc(100vh-100px)] text-zinc-100">
      {/* Calendar Header (Month Navigation) - Fixed at top */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            {currentDate.toLocaleString('default', {
              month: 'long',
              year: 'numeric',
            })}
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            View and manage your upcoming events.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2.5 text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 border border-indigo-500 rounded-lg hover:bg-indigo-500 transition-colors"
          >
            Today
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="p-2.5 text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Day Names Header */}
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

      {/* Calendar Grid Container - Fills remaining height */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-px bg-zinc-800 border border-zinc-800 rounded-lg overflow-hidden">
        {calendarDays.map((date, index) => {
          const dayEvents = date ? getEventsForDay(date) : [];
          const isToday = date && date.toDateString() === today.toDateString();

          return (
            <div
              key={index}
              className={`flex flex-col p-2 overflow-hidden transition-colors group ${
                date ? 'bg-zinc-950 hover:bg-zinc-900/80' : 'bg-zinc-900/50'
              }`}
            >
              {date && (
                <>
                  <div className="flex justify-end mb-1">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full transition-colors ${
                        isToday
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'text-zinc-500 group-hover:text-zinc-300'
                      }`}
                    >
                      {date.getDate()}
                    </span>
                  </div>

                  {/* Scrollable Event List for the Day */}
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
      </div>
    </div>
  );
}
