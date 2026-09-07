// frontend/src/pages/CreateEventPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Loader2, Wand2, Image as ImageIcon, Video } from 'lucide-react';

interface Venue {
  id: string;
  name: string;
  capacity: number;
}

interface Category {
  id: string;
  name: string;
}

export default function CreateEventPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    category: '',
    imageUrl: '',
    maxCapacity: 50,
    isVirtual: false,
  });
  const [venues, setVenues] = useState<Venue[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [venuesRes, categoriesRes] = await Promise.all([
          api.get('/venues'),
          api.get('/categories')
        ]);
        
        setVenues(venuesRes.data.data);
        if (venuesRes.data.data.length > 0) {
          setFormData(prev => ({ ...prev, venue: venuesRes.data.data[0].id }));
        }

        setCategories(categoriesRes.data.data);
        if (categoriesRes.data.data.length > 0) {
          setFormData(prev => ({ ...prev, category: categoriesRes.data.data[0].name }));
        }
      } catch (error) {
        console.error('Failed to fetch dropdown data', error);
      }
    };
    fetchDropdownData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateImageUrl = (title: string) => {
    if (!title) return '';
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(title + ', professional photography, realistic, highly detailed, cinematic lighting, no text')}`;
  };

  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    
    setAiLoading(true);
    setError('');

    try {
      const response = await api.post('/ai/generate-event', { prompt: aiPrompt }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const newTitle = response.data.data.title;
      const newDesc = response.data.data.description;
      
      setFormData(prev => ({
        ...prev,
        title: newTitle,
        description: newDesc,
        imageUrl: generateImageUrl(newTitle)
      }));
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to generate AI content.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const finalImageUrl = formData.imageUrl || generateImageUrl(formData.title);
      
      // FIX: If the event is virtual, send `null` instead of empty string so Mongoose doesn't crash
      const finalVenue = formData.isVirtual ? null : formData.venue;

      await api.post('/events', { 
        ...formData, 
        venue: finalVenue, // Use null for virtual events
        imageUrl: finalImageUrl, 
        maxCapacity: Number(formData.maxCapacity) 
      }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      navigate('/events');
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to create event.');
    }
  };

  return (
    <div className="text-zinc-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Create a New Event</h1>
        <p className="mt-1 text-zinc-400">Fill out the details below or let AI help you brainstorm.</p>
      </div>

      <div className="max-w-2xl p-8 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl">
        {error && <div className="p-3 mb-4 text-sm text-red-400 bg-red-950 border border-red-800 rounded-md">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* AI Generation Box */}
          <div className="p-4 bg-indigo-950/20 border border-indigo-900/50 rounded-lg">
            <label className="flex items-center gap-2 mb-2 text-sm font-medium text-indigo-300">
              <Sparkles className="w-4 h-4" />
              AI Event Assistant
            </label>
            <p className="text-xs text-zinc-400 mb-3">Give a brief idea (e.g., "A 2-day AI workshop for 300 students") and let AI write the title, description, and generate a realistic event image.</p>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe your event idea..."
                className="flex-1 px-3 py-2.5 text-sm text-white placeholder-zinc-500 bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              />
              <button 
                type="button"
                onClick={handleAIGenerate}
                disabled={aiLoading || !aiPrompt.trim()}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {aiLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Wand2 className="w-4 h-4" />
                )}
                {aiLoading ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>

          {/* AI Image Preview */}
          {formData.imageUrl && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                <ImageIcon className="w-4 h-4" /> AI Generated Event Image
              </label>
              <div className="relative w-full h-48 bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden">
                <img 
                  src={formData.imageUrl} 
                  alt="Event Preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent"></div>
              </div>
              <p className="text-xs text-zinc-500">This realistic image will be displayed on the event card. It is generated based on your Event Title.</p>
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm font-medium text-zinc-400">Event Title</label>
            <input 
              type="text" 
              name="title" 
              value={formData.title} 
              onChange={(e) => setFormData({ ...formData, title: e.target.value, imageUrl: generateImageUrl(e.target.value) })} 
              required 
              className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors" 
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-zinc-400">Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleChange} 
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
                value={formData.date} 
                onChange={handleChange} 
                required 
                className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors" 
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-zinc-400">Category</label>
              <select 
                name="category" 
                value={formData.category} 
                onChange={handleChange} 
                required
                className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              >
                {categories.length === 0 ? (
                  <option value="" disabled>No categories available</option>
                ) : (
                  categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Max Capacity Input */}
          <div>
            <label className="block mb-1 text-sm font-medium text-zinc-400">Max Capacity (Tickets Available)</label>
            <input 
              type="number" 
              name="maxCapacity" 
              value={formData.maxCapacity} 
              onChange={handleChange} 
              required 
              min="1"
              className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors" 
            />
          </div>

          {/* Virtual Event Toggle */}
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
              onClick={() => setFormData(prev => ({ ...prev, isVirtual: !prev.isVirtual }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isVirtual ? 'bg-indigo-600' : 'bg-zinc-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isVirtual ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          
          {/* Conditional Venue Dropdown */}
          {!formData.isVirtual && (
            <div>
              <label className="block mb-1 text-sm font-medium text-zinc-400">Select Venue</label>
              <select 
                name="venue" 
                value={formData.venue} 
                onChange={handleChange} 
                required={!formData.isVirtual}
                className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              >
                {venues.length === 0 ? (
                  <option value="" disabled>No venues available. Create one first.</option>
                ) : (
                  venues.map(venue => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name} (Cap: {venue.capacity})
                    </option>
                  ))
                )}
              </select>
            </div>
          )}

          <button type="submit" className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-lg shadow-indigo-900/30 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-zinc-900 transition-colors">
            Publish Event
          </button>
        </form>
      </div>
    </div>
  );
}