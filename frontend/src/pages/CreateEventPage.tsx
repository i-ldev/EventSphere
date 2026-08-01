// frontend/src/pages/CreateEventPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

interface Venue {
  id: string;
  name: string;
  capacity: number;
}

export default function CreateEventPage() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    venue: '', // This will hold the Venue ID
  });
  const [venues, setVenues] = useState<Venue[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    // Fetch venues for the dropdown
    const fetchVenues = async () => {
      try {
        const response = await api.get('/venues');
        setVenues(response.data.data);
        if (response.data.data.length > 0) {
          setFormData((prev) => ({ ...prev, venue: response.data.data[0].id })); // Set default
        }
      } catch (error) {
        console.error('Failed to fetch venues', error);
      }
    };
    fetchVenues();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/events', formData, {
        headers: { Authorization: `Bearer ${accessToken}` },
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
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Create a New Event
        </h1>
        <p className="mt-1 text-zinc-400">
          Fill out the details below to publish your event.
        </p>
      </div>

      <div className="max-w-2xl p-8 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl">
        {error && (
          <div className="p-3 mb-4 text-sm text-red-400 bg-red-950 border border-red-800 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 text-sm font-medium text-zinc-400">
              Event Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-zinc-400">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            ></textarea>
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-zinc-400">
              Date & Time
            </label>
            <input
              type="datetime-local"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            />
          </div>

          {/* Venue Dropdown */}
          <div>
            <label className="block mb-1 text-sm font-medium text-zinc-400">
              Select Venue
            </label>
            <select
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            >
              {venues.length === 0 ? (
                <option value="" disabled>
                  No venues available. Create one first.
                </option>
              ) : (
                venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} (Cap: {venue.capacity})
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            type="submit"
            className="flex justify-center w-full px-4 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-lg shadow-indigo-900/30 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-zinc-900 transition-colors"
          >
            Publish Event
          </button>
        </form>
      </div>
    </div>
  );
}
