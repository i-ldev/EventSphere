// frontend/src/pages/EventDetailsPage.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { CalendarDays, MapPin, ArrowLeft, PlusCircle, Star, CheckCircle2, Clock, DollarSign, Ticket as TicketIcon, TrendingUp, Video } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: { name: string; address: string } | null;
  status: string;
  organizerId: string;
  isVirtual?: boolean;
  meetingUrl?: string | null;
}

interface Ticket {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId: {
    firstName: string;
    lastName: string;
  };
}

interface EventStats {
  totalTicketsSold: number;
  totalRevenue: number;
}

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState<string | null>(null);
  
  const [ticketForm, setTicketForm] = useState({ name: '', price: 0, quantity: 100 });
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

  const fetchData = async () => {
    if (!id) return;
    try {
      const eventRes = await api.get(`/events`);
      const foundEvent = eventRes.data.data.find((e: Event) => e.id === id);
      setEvent(foundEvent || null);

      const ticketsRes = await api.get(`/events/${id}/tickets`);
      setTickets(ticketsRes.data.data);

      const reviewsRes = await api.get(`/events/${id}/reviews`);
      setReviews(reviewsRes.data.data);

      if (user && (user.role === 'ORGANIZER' || user.role === 'SUPER_ADMIN')) {
        try {
          const statsRes = await api.get(`/events/${id}/stats`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          setStats(statsRes.data.data);
        } catch (error) {
          console.error('Failed to fetch event stats', error);
        }
      }

    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/events/${id}/tickets`, ticketForm, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setTicketForm({ name: '', price: 0, quantity: 100 });
      fetchData();
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Failed to add ticket');
    }
  };

  const handleBuyTicket = async (ticketId: string, price: number) => {
    if (!id) return;
    setBuying(ticketId);
    try {
      // If ticket is free, bypass Stripe and register directly
      if (price === 0) {
        await api.post('/registrations', { eventId: id, ticketTypeId: ticketId }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        alert('Successfully registered for the free event!');
        navigate('/my-tickets');
      } else {
        // Paid ticket: Redirect to Stripe Checkout
        const response = await api.post('/payments/create-checkout-session', { 
          eventId: id, 
          ticketTypeId: ticketId 
        }, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        
        window.location.href = response.data.url;
      }
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Failed to initiate checkout.');
    } finally {
      setBuying(null);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/events/${id}/reviews`, reviewForm, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setReviewForm({ rating: 5, comment: '' });
      fetchData();
      alert('Review added successfully!');
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Failed to add review');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96 text-zinc-500">Loading event...</div>;
  if (!event) return <div className="flex items-center justify-center h-96 text-zinc-500">Event not found.</div>;

  const isOrganizer = event.organizerId === user?.id;
  const canViewStats = user?.role === 'ORGANIZER' || user?.role === 'SUPER_ADMIN';

  return (
    <div className="text-zinc-100">
      <Link to="/events" className="inline-flex items-center gap-2 mb-6 text-sm text-zinc-400 hover:text-white transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Events
      </Link>
      
      {/* Hero Header */}
      <div className="p-8 mb-8 bg-zinc-900 border border-zinc-800 rounded-xl">
        <div className="flex items-start justify-between mb-6">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">{event.title}</h1>
          {event.status === 'PUBLISHED' ? (
            <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-green-400 bg-green-950/50 border border-green-900/50 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" /> Live
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-yellow-400 bg-yellow-950/50 border border-yellow-900/50 rounded-md">
              <Clock className="w-3.5 h-3.5" /> Draft
            </span>
          )}
        </div>
        
        <div className="flex flex-wrap gap-6 text-sm text-zinc-400 pb-6 border-b border-zinc-800">
          <p className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-zinc-500" />
            {new Date(event.date).toLocaleString()}
          </p>
          
          {/* Conditional Virtual / Physical Location Display */}
          <div className="flex flex-col gap-2">
            <p className="flex items-center gap-2">
              {event.isVirtual ? (
                <Video className="w-5 h-5 text-indigo-400" />
              ) : (
                <MapPin className="w-5 h-5 text-zinc-500" />
              )}
              {event.isVirtual ? 'Online Event (Jitsi Meet)' : (event.venue?.name || 'TBD')}
            </p>
            
            {/* Show actual link to Organizer */}
            {event.isVirtual && isOrganizer && event.meetingUrl && (
              <div className="flex items-center gap-2 mt-2 px-4 py-2 bg-zinc-950 border border-indigo-700 rounded-lg w-fit">
                <Video className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <a href={event.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-400 font-mono hover:underline truncate">
                  {event.meetingUrl}
                </a>
              </div>
            )}

            {/* Disabled Teaser Link for Attendees */}
            {event.isVirtual && !isOrganizer && (
              <div className="flex items-center gap-2 mt-2 px-4 py-2 bg-zinc-950 border border-dashed border-zinc-700 rounded-lg w-fit">
                <Video className="w-4 h-4 text-zinc-600" />
                <span className="text-xs text-zinc-500 font-mono select-none">
                  https://meet.jit.si/EventSphere-••••••••••••
                </span>
                <span className="ml-2 text-[10px] text-indigo-400 font-medium uppercase tracking-wider">Unlock after purchase</span>
              </div>
            )}
          </div>
        </div>
        <p className="mt-6 text-lg text-zinc-300 leading-relaxed">{event.description}</p>
      </div>

      {/* Performance Overview (Organizers/Admins Only) */}
      {canViewStats && (
        <div className="mb-8">
          <h2 className="mb-4 text-xs font-semibold tracking-wider text-zinc-500 uppercase">Performance Overview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-green-900/30 rounded-lg border border-green-800/50">
                  <DollarSign className="w-5 h-5 text-green-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">${stats?.totalRevenue.toFixed(2) || '0.00'}</p>
              <p className="text-xs text-zinc-500 mt-1">Event Revenue</p>
            </div>

            <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-blue-900/30 rounded-lg border border-blue-800/50">
                  <TicketIcon className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{stats?.totalTicketsSold || 0}</p>
              <p className="text-xs text-zinc-500 mt-1">Tickets Sold</p>
            </div>

            <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 bg-indigo-900/30 rounded-lg border border-indigo-800/50">
                  <TrendingUp className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-white">{tickets.length}</p>
              <p className="text-xs text-zinc-500 mt-1">Ticket Tiers</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Column: Reviews */}
        <div className="lg:col-span-2 space-y-8">
          <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-xl">
            <h2 className="mb-6 text-xl font-bold text-white">Reviews & Ratings</h2>
            
            {reviews.length === 0 ? (
              <p className="text-sm text-zinc-500 mb-6">No reviews yet. Be the first to leave one!</p>
            ) : (
              <div className="mb-8 space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="p-5 bg-zinc-950 rounded-lg border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-indigo-400 bg-indigo-950/50 border border-indigo-900/50 rounded-full">
                          {review.userId?.firstName?.charAt(0) || 'U'}
                        </div>
                        <div className="text-sm font-semibold text-white">
                          {review.userId?.firstName} {review.userId?.lastName}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-yellow-400">
                        {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                        <span className="ml-1 text-xs text-zinc-500">({review.rating}/5)</span>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-400 mt-2">{review.comment}</p>
                    <p className="mt-3 text-xs text-zinc-600">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Review Form */}
            {user && !isOrganizer ? (
              <div className="p-6 bg-zinc-950 rounded-lg border border-zinc-800">
                <h3 className="flex items-center gap-2 mb-4 text-sm font-semibold text-white">
                  <Star className="w-4 h-4 text-indigo-400" />
                  Leave a Review
                </h3>
                <form onSubmit={handleAddReview} className="space-y-4">
                  <div>
                    <label className="block mb-1 text-xs font-medium text-zinc-500">Rating</label>
                    <select 
                      value={reviewForm.rating} 
                      onChange={(e) => setReviewForm({...reviewForm, rating: parseInt(e.target.value)})}
                      className="w-full px-3 py-2.5 text-sm text-white bg-zinc-900 border border-zinc-800 rounded-md outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
                      <option value={4}>⭐⭐⭐⭐ (4)</option>
                      <option value={3}>⭐⭐⭐ (3)</option>
                      <option value={2}>⭐⭐ (2)</option>
                      <option value={1}>⭐ (1)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block mb-1 text-xs font-medium text-zinc-500">Comment</label>
                    <textarea 
                      required 
                      value={reviewForm.comment} 
                      onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2.5 text-sm text-white bg-zinc-900 border border-zinc-800 rounded-md outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    ></textarea>
                  </div>
                  <button type="submit" className="px-4 py-2 text-sm text-white bg-indigo-600 rounded-md hover:bg-indigo-500 transition-colors">
                    Submit Review
                  </button>
                </form>
              </div>
            ) : !user ? (
              <p className="text-sm text-zinc-500">
                <Link to="/login" className="text-indigo-400 hover:underline">Login</Link> to leave a review.
              </p>
            ) : null}
          </div>
        </div>

        {/* Right Column: Sticky Ticket Widget */}
        <div className="lg:col-span-1">
          <div className="sticky p-6 bg-zinc-900 border border-zinc-800 rounded-xl top-8">
            <h2 className="mb-4 text-xl font-bold text-white">Tickets</h2>
            
            {tickets.length === 0 ? (
              <p className="text-sm text-zinc-500 mb-8">No tickets available yet.</p>
            ) : (
              <div className="mb-6 space-y-3">
                {tickets.map(ticket => (
                  <div key={ticket.id} className="p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">{ticket.name}</h3>
                      <div className="text-lg font-bold text-indigo-400">
                        {ticket.price === 0 ? 'Free' : `$${ticket.price.toFixed(2)}`}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-500 mb-3">{ticket.quantity} available</p>
                    
                    {!isOrganizer && (
                      <button 
                        onClick={() => handleBuyTicket(ticket.id, ticket.price)}
                        disabled={buying === ticket.id || ticket.quantity <= 0}
                        className="w-full px-4 py-2 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {buying === ticket.id ? 'Processing...' : ticket.quantity <= 0 ? 'Sold Out' : (ticket.price === 0 ? 'Register for Free' : 'Buy Ticket')}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Organizer Add Ticket Form */}
            {isOrganizer && (
              <div className="mt-6 pt-6 border-t border-zinc-800">
                <h3 className="flex items-center gap-2 mb-4 text-sm font-semibold text-white">
                  <PlusCircle className="w-4 h-4 text-indigo-400" />
                  Add New Ticket Type
                </h3>
                <form onSubmit={handleAddTicket} className="space-y-3">
                  <div>
                    <label className="block mb-1 text-xs font-medium text-zinc-500">Name (e.g., VIP)</label>
                    <input type="text" required value={ticketForm.name} onChange={(e) => setTicketForm({...ticketForm, name: e.target.value})} className="w-full px-3 py-2 text-sm text-white bg-zinc-950 border border-zinc-800 rounded-md outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1 text-xs font-medium text-zinc-500">Price ($)</label>
                      <input type="number" step="0.01" required value={ticketForm.price} onChange={(e) => setTicketForm({...ticketForm, price: parseFloat(e.target.value)})} className="w-full px-3 py-2 text-sm text-white bg-zinc-950 border border-zinc-800 rounded-md outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                    <div>
                      <label className="block mb-1 text-xs font-medium text-zinc-500">Qty</label>
                      <input type="number" required value={ticketForm.quantity} onChange={(e) => setTicketForm({...ticketForm, quantity: parseInt(e.target.value)})} className="w-full px-3 py-2 text-sm text-white bg-zinc-950 border border-zinc-800 rounded-md outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </div>
                  </div>
                  <button type="submit" className="w-full px-4 py-2 text-sm text-white bg-zinc-800 border border-zinc-700 rounded-md hover:bg-zinc-700 transition-colors">Add Ticket</button>
                </form>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}