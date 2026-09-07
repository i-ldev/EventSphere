// frontend/src/pages/DiscoverPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { MapPin, Search, Ticket, Sparkles, ArrowRight } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: { name: string; address: string } | null;
  category?: string;
}

interface Category {
  id: string;
  name: string;
}

export default function DiscoverPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, categoriesRes] = await Promise.all([
          api.get('/events', { params: { status: 'PUBLISHED' } }),
          api.get('/categories')
        ]);
        setEvents(eventsRes.data.data);
        setCategories(categoriesRes.data.data);
      } catch (error) {
        console.error('Failed to fetch public events', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === 'All' || event.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-zinc-800">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 via-zinc-950 to-zinc-950"></div>
        <div className="relative px-4 py-24 mx-auto max-w-7xl sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-900/50">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white mb-4">
            Find Your Next Event
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-zinc-400 mb-8">
            Explore and register for the best tech, business, and music events happening near you.
          </p>
          
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Search events by name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-4 pl-12 pr-4 text-white placeholder-zinc-500 bg-zinc-900 border border-zinc-800 rounded-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-lg"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 mb-10 justify-center">
          <button 
            onClick={() => setActiveCategory('All')}
            className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
              activeCategory === 'All' ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button 
              key={cat.id}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-colors ${
                activeCategory === cat.name ? 'bg-indigo-600 text-white' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-zinc-700 border-t-indigo-500 rounded-full animate-spin"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-20">
            <Ticket className="w-12 h-12 mx-auto mb-4 text-zinc-700" />
            <p className="text-zinc-500">No events found. Try a different search or filter!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <div key={event.id} className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300">
                
                {/* AI Generated Event Image */}
                <div className="h-44 w-full overflow-hidden bg-zinc-800 relative">
                  <img 
                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(event.title + ' event poster, digital art, dark theme, high quality')}`} 
                    alt={event.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent"></div>
                </div>

                <div className="p-6 flex flex-col flex-grow -mt-4 relative">
                  <div className="flex items-center gap-2 mb-3">
                    {event.category && (
                      <span className="px-2.5 py-1 text-[10px] font-semibold text-indigo-300 bg-indigo-950/50 border border-indigo-900/50 rounded-full">
                        {event.category}
                      </span>
                    )}
                    <span className="text-xs text-zinc-500">
                      {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                    {event.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mb-4 line-clamp-2 flex-grow">{event.description}</p>
                  
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4">
                    <MapPin className="w-3.5 h-3.5" />
                    {event.venue?.name || 'Online / TBD'}
                  </div>

                  <Link to="/login" className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-white bg-zinc-800 border border-zinc-700 rounded-lg hover:bg-indigo-600 hover:border-indigo-500 transition-colors">
                    Get Tickets <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="border-t border-zinc-800 py-8 text-center">
        <p className="text-sm text-zinc-500">
          Want to host your own events? <Link to="/login" className="font-medium text-indigo-400 hover:text-indigo-300">Sign in</Link>
        </p>
      </footer>
    </div>
  );
}