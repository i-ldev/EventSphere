// frontend/src/pages/EventsPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CalendarDays, MapPin, PlusCircle, CheckCircle2, Clock, Users, ArrowRight,
  ChevronLeft, ChevronRight, LayoutGrid, Calendar as CalendarIcon, Search,
  MoreVertical, Pencil, Trash2, X, AlertCircle, Video
} from 'lucide-react';

interface Venue {
  id: string;
  name: string;
  capacity: number;
}

interface Category {
  id: string;
  name: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: { id: string; name: string; capacity: number } | null;
  status: string;
  organizerId: string;
  category?: string;
  imageUrl?: string;
  maxCapacity?: number;
  isVirtual?: boolean;
  meetingUrl?: string | null;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [direction, setDirection] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [editFormData, setEditFormData] = useState({ 
    title: '', 
    description: '', 
    date: '', 
    venue: '', 
    category: '', 
    maxCapacity: 50,
    isVirtual: false 
  });
  
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

  const fetchVenues = async () => {
    try {
      const response = await api.get('/venues');
      setVenues(response.data.data);
    } catch (error) {
      console.error('Failed to fetch venues', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchVenues();
    fetchCategories();
  }, []);

  const handlePublish = async (eventId: string) => {
    try {
      await api.put(`/events/${eventId}/publish`, {}, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      fetchEvents();
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Failed to publish event');
    }
  };

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    const dateObj = new Date(event.date);
    const formattedDate = dateObj.toISOString().slice(0, 16);
    
    setEditFormData({
      title: event.title,
      description: event.description,
      date: formattedDate,
      venue: event.venue?.id || '',
      category: event.category || '',
      maxCapacity: event.maxCapacity || 50,
      isVirtual: event.isVirtual || false
    });
    setOpenMenuId(null);
    setIsEditModalOpen(true);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;
    try {
      // If virtual, clear the venue to prevent Mongoose BSONError
      const finalVenue = editFormData.isVirtual ? null : editFormData.venue;

      await api.put(`/events/${editingEvent.id}`, { 
        ...editFormData, 
        venue: finalVenue, 
        maxCapacity: Number(editFormData.maxCapacity) 
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setIsEditModalOpen(false);
      fetchEvents();
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Failed to update event.');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await api.delete(`/events/${eventId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        fetchEvents();
      } catch (err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        alert(axiosError.response?.data?.message || 'Failed to delete event.');
      }
    }
    setOpenMenuId(null);
  };

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

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (event.venue?.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || event.category?.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // --- Calendar Helpers ---
  const changeMonth = (dir: number) => {
    setDirection(dir);
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + dir, 1));
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

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const calendarDays: (Date | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  }
  while (calendarDays.length < 42) calendarDays.push(null);

  const getEventsForDay = (date: Date | null) => {
    if (!date) return [];
    return filteredEvents.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-zinc-500">Loading events...</div>;
  }

  const today = new Date();
  const canManage = user?.role === 'ORGANIZER' || user?.role === 'SUPER_ADMIN';

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
          <h1 className="text-3xl font-bold tracking-tight text-white">Events</h1>
          <p className="mt-1 text-zinc-400">Manage and track the performance of all your events.</p>
        </div>
        
        <div className="flex items-center gap-4">
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

          {canManage && (
            <Link to="/create-event" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/30 flex-shrink-0">
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Create Event</span>
            </Link>
          )}
        </div>
      </div>

      {/* Payment Status Banner for Organizers */}
      {user?.role === 'ORGANIZER' && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between flex-shrink-0 ${user?.stripeAccountId ? 'bg-green-950/30 border-green-800/50' : 'bg-yellow-950/30 border-yellow-800/50'}`}>
          <div className="flex items-center gap-3">
            {user?.stripeAccountId ? (
              <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0" />
            )}
            <div>
              <p className={`text-sm font-medium ${user?.stripeAccountId ? 'text-green-400' : 'text-yellow-400'}`}>
                {user?.stripeAccountId ? 'Bank Account Connected' : 'Action Required: Connect Bank Account'}
              </p>
              <p className="text-xs text-zinc-400">
                {user?.stripeAccountId ? 'You will receive payouts directly to your connected account.' : 'You must connect your bank account to receive payments for your events.'}
              </p>
            </div>
          </div>
          {!user?.stripeAccountId && (
            <button 
              onClick={handleConnectStripe}
              className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors flex-shrink-0"
            >
              Connect Now
            </button>
          )}
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6 flex-shrink-0">
        <button 
          onClick={() => setActiveCategory('All')}
          className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${
            activeCategory === 'All' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button 
            key={cat.id}
            onClick={() => setActiveCategory(cat.name)}
            className={`px-4 py-1.5 text-xs font-medium rounded-full transition-colors ${
              activeCategory === cat.name ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* --- LIST VIEW --- */}
      {view === 'list' && (
        <>
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-xl">
              <CalendarDays className="w-10 h-10 mb-4 text-zinc-700" />
              <p className="text-zinc-500">No events found. Try a different search or filter!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 overflow-y-auto pr-2">
              {filteredEvents.map((event) => {
                return (
                  <div key={event.id} className="relative flex flex-col p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all duration-200">
                    
                    {/* Three Dots Menu */}
                    {canManage && (
                      <div className="absolute top-4 right-4 z-10">
                        <button 
                          onClick={() => setOpenMenuId(openMenuId === event.id ? null : event.id)}
                          className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        
                        {openMenuId === event.id && (
                          <div className="absolute right-0 mt-2 w-36 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-20 overflow-hidden">
                            <button 
                              onClick={() => handleEditClick(event)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                            >
                              <Pencil className="w-4 h-4" /> Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteEvent(event.id)}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-red-400 hover:bg-zinc-800 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-3 pr-8">
                      <h2 className="text-lg font-semibold text-white">{event.title}</h2>
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
                        {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      {/* Updated Location/Virtual Display Logic */}
                      <span className="flex items-center gap-1.5">
                        {event.isVirtual ? (
                          <>
                            <Video className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-indigo-400">Online Event</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                            {event.venue?.name || 'TBD'}
                          </>
                        )}
                      </span>
                      {event.category && (
                        <span className="px-2 py-0.5 text-[10px] font-medium text-indigo-300 bg-indigo-950/50 border border-indigo-900/50 rounded-full">
                          {event.category}
                        </span>
                      )}
                    </div>

                    <p className="mb-6 text-sm text-zinc-400 line-clamp-2 flex-grow">{event.description}</p>
                    
                    {/* Real Max Capacity Display */}
                    <div className="pt-4 mt-auto border-t border-zinc-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                          <Users className="w-4 h-4 text-indigo-400" />
                          <span className="font-medium text-white">{event.maxCapacity || 'Unlimited'}</span> Max Capacity
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <Link to={`/events/${event.id}`} className="flex items-center justify-center flex-1 gap-1.5 px-3 py-2 text-xs font-medium text-white bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 transition-colors">
                        Manage Event <ArrowRight className="w-3 h-3" />
                      </Link>
                      {event.status === 'DRAFT' && canManage && (
                        <button onClick={() => handlePublish(event.id)} className="px-3 py-2 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors">
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
                {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h2>
              <span className="hidden text-[10px] font-medium text-zinc-500 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded-md sm:inline-block">
                Use ← → keys
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => changeMonth(-1)} className="p-2 text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={() => { setDirection(0); setCurrentDate(new Date()); }} className="px-4 py-2 text-xs font-medium text-white bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors">
                Today
              </button>
              <button onClick={() => changeMonth(1)} className="p-2 text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-lg hover:bg-zinc-800 hover:text-white transition-colors">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-px mb-px flex-shrink-0">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-2 text-xs font-semibold tracking-wider text-center text-zinc-500 uppercase border-b border-zinc-800">
                {day}
              </div>
            ))}
          </div>

          <div className="flex-1 relative overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentDate.getMonth()}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="absolute inset-0 grid grid-cols-7 grid-rows-6 gap-px bg-zinc-800 border border-zinc-800 rounded-lg overflow-hidden"
              >
                {calendarDays.map((date, index) => {
                  const dayEvents = getEventsForDay(date);
                  const isToday = date && date.toDateString() === today.toDateString();

                  return (
                    <div key={index} className={`flex flex-col p-2 overflow-hidden transition-colors group ${date ? 'bg-zinc-950 hover:bg-zinc-900/80' : 'bg-zinc-900/50'}`}>
                      {date && (
                        <>
                          <div className="flex justify-end mb-1">
                            <span className={`inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full transition-colors ${isToday ? 'bg-indigo-600 text-white font-bold' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                              {date.getDate()}
                            </span>
                          </div>
                          <div className="flex-1 space-y-1 overflow-y-auto scrollbar-thin">
                            {dayEvents.map(event => (
                              <Link key={event.id} to={`/events/${event.id}`} className="block px-2 py-1 text-[10px] font-medium text-indigo-300 bg-indigo-950/50 border border-indigo-900/50 rounded truncate hover:bg-indigo-600 hover:text-white transition-colors">
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

      {/* --- EDIT EVENT MODAL --- */}
      {isEditModalOpen && editingEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg p-8 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Event</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-zinc-500 hover:text-white rounded-md">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateEvent} className="space-y-6">
              <div>
                <label className="block mb-1 text-sm font-medium text-zinc-400">Event Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={editFormData.title} 
                  onChange={(e) => setEditFormData({...editFormData, title: e.target.value})} 
                  required 
                  className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors" 
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium text-zinc-400">Description</label>
                <textarea 
                  name="description" 
                  value={editFormData.description} 
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})} 
                  required 
                  rows={4} 
                  className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                ></textarea>
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-zinc-400">Date & Time</label>
                  <input 
                    type="datetime-local" 
                    name="date" 
                    value={editFormData.date} 
                    onChange={(e) => setEditFormData({...editFormData, date: e.target.value})} 
                    required 
                    className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors" 
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-zinc-400">Category</label>
                  <select 
                    name="category" 
                    value={editFormData.category} 
                    onChange={(e) => setEditFormData({...editFormData, category: e.target.value})} 
                    required
                    className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-zinc-400">Max Capacity</label>
                <input 
                  type="number" 
                  name="maxCapacity" 
                  value={editFormData.maxCapacity} 
                  onChange={(e) => setEditFormData({...editFormData, maxCapacity: Number(e.target.value)})} 
                  required 
                  min="1"
                  className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors" 
                />
              </div>

              {/* Virtual Event Toggle in Edit Modal */}
              <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Video className="w-5 h-5 text-indigo-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Virtual Event</p>
                    <p className="text-xs text-zinc-500">Generate a secure Jitsi Meet link for online events.</p>
                  </div>
                </div>
                <button 
                  type="button"
                  onClick={() => setEditFormData(prev => ({ ...prev, isVirtual: !prev.isVirtual }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editFormData.isVirtual ? 'bg-indigo-600' : 'bg-zinc-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editFormData.isVirtual ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              
              {/* Conditional Venue Dropdown */}
              {!editFormData.isVirtual && (
                <div>
                  <label className="block mb-1 text-sm font-medium text-zinc-400">Select Venue</label>
                  <select 
                    name="venue" 
                    value={editFormData.venue} 
                    onChange={(e) => setEditFormData({...editFormData, venue: e.target.value})} 
                    required={!editFormData.isVirtual}
                    className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  >
                    {venues.map(venue => (
                      <option key={venue.id} value={venue.id}>
                        {venue.name} (Cap: {venue.capacity})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-zinc-800 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)} 
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-300 bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/30"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}