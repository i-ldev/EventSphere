// frontend/src/pages/VenuesPage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { 
  MapPin, Users, PlusCircle, Projector, Mic, Video, CheckCircle2, Clock, Search, 
  MoreVertical, Pencil, Trash2, X, Wifi, Speaker, Radio 
} from 'lucide-react';

interface Venue {
  id: string;
  name: string;
  address: string;
  capacity: number;
  description?: string;
  equipment: string[];
}

// Available equipment options for the Edit Modal
const equipmentOptions = [
  { name: 'Projector', icon: Projector },
  { name: 'Microphones', icon: Mic },
  { name: 'Recording', icon: Video },
  { name: 'High-Speed WiFi', icon: Wifi },
  { name: 'Sound System', icon: Speaker },
  { name: 'Stage Lighting', icon: Radio },
];

export default function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null);
  const [editFormData, setEditFormData] = useState({ name: '', address: '', capacity: 0, description: '', equipment: [] as string[] });
  
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);

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

  useEffect(() => {
    fetchVenues();
  }, []);

  const filteredVenues = venues.filter(venue => 
    venue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    venue.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getIcon = (equipName: string) => {
    if (equipName === 'Projector') return Projector;
    if (equipName === 'Microphones') return Mic;
    return Video;
  };

  // --- Edit & Delete Handlers ---
  const handleEditClick = (venue: Venue) => {
    setEditingVenue(venue);
    setEditFormData({
      name: venue.name,
      address: venue.address,
      capacity: venue.capacity,
      description: venue.description || '',
      equipment: venue.equipment || []
    });
    setOpenMenuId(null);
    setIsEditModalOpen(true);
  };

  const toggleEditEquipment = (equip: string) => {
    setEditFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equip) 
        ? prev.equipment.filter(e => e !== equip) 
        : [...prev.equipment, equip]
    }));
  };

  const handleUpdateVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVenue) return;
    try {
      await api.put(`/venues/${editingVenue.id}`, editFormData, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setIsEditModalOpen(false);
      fetchVenues();
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      alert(axiosError.response?.data?.message || 'Failed to update venue.');
    }
  };

  const handleDeleteVenue = async (venueId: string) => {
    if (window.confirm('Are you sure you want to delete this venue? This action cannot be undone.')) {
      try {
        await api.delete(`/venues/${venueId}`, {
          headers: { Authorization: `Bearer ${accessToken}` }
        });
        fetchVenues();
      } catch (err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        alert(axiosError.response?.data?.message || 'Failed to delete venue.');
      }
    }
    setOpenMenuId(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96 text-zinc-500">Loading venues...</div>;
  }

  return (
    <div className="text-zinc-100">
      {/* Page Header */}
      <div className="flex flex-col gap-4 mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Venues</h1>
          <p className="mt-1 text-zinc-400">Manage physical locations, equipment, and availability.</p>
        </div>
        
        <div className="flex items-center gap-4">
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
            <Link to="/create-venue" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-900/30 flex-shrink-0">
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Create Venue</span>
            </Link>
          )}
        </div>
      </div>

      {filteredVenues.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-zinc-800 rounded-xl">
          <MapPin className="w-10 h-10 mb-4 text-zinc-700" />
          <p className="text-zinc-500">No venues found. Try a different search!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {filteredVenues.map((venue) => {
            const isBookedToday = venue.capacity > 150; 

            return (
              <div key={venue.id} className="relative flex flex-col p-6 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-all duration-200">
                
                {/* Three Dots Menu */}
                {(user?.role === 'ORGANIZER' || user?.role === 'SUPER_ADMIN') && (
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={() => setOpenMenuId(openMenuId === venue.id ? null : venue.id)}
                      className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    
                    {openMenuId === venue.id && (
                      <div className="absolute right-0 mt-2 w-36 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-10">
                        <button 
                          onClick={() => handleEditClick(venue)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-t-lg transition-colors"
                        >
                          <Pencil className="w-4 h-4" /> Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteVenue(venue.id)}
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-left text-red-400 hover:bg-zinc-800 rounded-b-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-start justify-between mb-2 pr-8">
                  <h2 className="text-lg font-semibold text-white">{venue.name}</h2>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  {isBookedToday ? (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-400 bg-red-950/50 border border-red-900/50 rounded-md">
                      <Clock className="w-3 h-3" /> Booked Today
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-400 bg-green-950/50 border border-green-900/50 rounded-md">
                      <CheckCircle2 className="w-3 h-3" /> Available Today
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

                <div className="mb-4 p-3 bg-zinc-950 rounded-lg border border-zinc-800">
                  <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase mb-1">Today's Schedule</p>
                  {isBookedToday ? (
                    <p className="text-sm text-white">
                      <span className="font-medium text-indigo-400">09:00 - 17:00</span> - AI Summit 2024
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-500">No bookings for today.</p>
                  )}
                </div>

                <div className="mt-auto pt-4 border-t border-zinc-800">
                  <p className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase mb-2">Equipment Available</p>
                  <div className="flex flex-wrap gap-3">
                    {venue.equipment && venue.equipment.length > 0 ? (
                      venue.equipment.map((equipName) => {
                        const Icon = getIcon(equipName);
                        return (
                          <span key={equipName} className="flex items-center gap-1 text-xs text-zinc-400">
                            <Icon className="w-3.5 h-3.5 text-zinc-500" /> {equipName}
                          </span>
                        );
                      })
                    ) : (
                      <span className="text-xs text-zinc-600">No specific equipment listed.</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- EDIT VENUE MODAL --- */}
      {isEditModalOpen && editingVenue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-lg p-8 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Edit Venue</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="p-1 text-zinc-500 hover:text-white rounded-md">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateVenue} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="block mb-1 text-sm font-medium text-zinc-400">Venue Name</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={editFormData.name} 
                    onChange={(e) => setEditFormData({...editFormData, name: e.target.value})} 
                    required 
                    className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors" 
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium text-zinc-400">Capacity (Pax)</label>
                  <input 
                    type="number" 
                    name="capacity" 
                    value={editFormData.capacity} 
                    onChange={(e) => setEditFormData({...editFormData, capacity: parseInt(e.target.value)})} 
                    required 
                    className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors" 
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium text-zinc-400">Address</label>
                <input 
                  type="text" 
                  name="address" 
                  value={editFormData.address} 
                  onChange={(e) => setEditFormData({...editFormData, address: e.target.value})} 
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
                  rows={3}
                  className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                ></textarea>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-zinc-400">Available Equipment</label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {equipmentOptions.map((equip) => {
                    const isSelected = editFormData.equipment.includes(equip.name);
                    return (
                      <button
                        type="button"
                        key={equip.name}
                        onClick={() => toggleEditEquipment(equip.name)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border rounded-lg transition-all ${
                          isSelected 
                            ? 'bg-indigo-600/20 border-indigo-600 text-white' 
                            : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                        }`}
                      >
                        <equip.icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-zinc-500'}`} />
                        {equip.name}
                      </button>
                    );
                  })}
                </div>
              </div>

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