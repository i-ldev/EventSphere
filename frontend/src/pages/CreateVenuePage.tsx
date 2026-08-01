// frontend/src/pages/CreateVenuePage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import {
  Projector,
  Mic,
  Video,
  Wifi,
  Speaker,
  Radio,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react';

// Available equipment options
const equipmentOptions = [
  { name: 'Projector', icon: Projector },
  { name: 'Microphones', icon: Mic },
  { name: 'Recording', icon: Video },
  { name: 'High-Speed WiFi', icon: Wifi },
  { name: 'Sound System', icon: Speaker },
  { name: 'Stage Lighting', icon: Radio },
];

export default function CreateVenuePage() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    capacity: 100,
    description: '',
  });
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Toggle equipment selection
  const toggleEquipment = (equip: string) => {
    if (selectedEquipment.includes(equip)) {
      setSelectedEquipment(selectedEquipment.filter((e) => e !== equip));
    } else {
      setSelectedEquipment([...selectedEquipment, equip]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await api.post(
        '/venues',
        { ...formData, equipment: selectedEquipment },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );
      navigate('/venues');
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to create venue.');
    }
  };

  return (
    <div className="text-zinc-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Create a New Venue
        </h1>
        <p className="mt-1 text-zinc-400">
          Add a physical location and specify its resources.
        </p>
      </div>

      <div className="max-w-3xl p-8 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl">
        {error && (
          <div className="p-3 mb-4 text-sm text-red-400 bg-red-950 border border-red-800 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block mb-1 text-sm font-medium text-zinc-400">
                Venue Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block mb-1 text-sm font-medium text-zinc-400">
                Capacity (Pax)
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                required
                className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-zinc-400">
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
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
              rows={3}
              placeholder="Describe the venue layout, parking, accessibility, etc."
              className="w-full px-3 py-2.5 text-white placeholder-zinc-600 bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            ></textarea>
          </div>

          {/* Equipment Selection */}
          <div>
            <label className="block mb-2 text-sm font-medium text-zinc-400">
              Available Equipment
            </label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {equipmentOptions.map((equip) => {
                const isSelected = selectedEquipment.includes(equip.name);
                return (
                  <button
                    type="button"
                    key={equip.name}
                    onClick={() => toggleEquipment(equip.name)}
                    className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border rounded-lg transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-600 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <equip.icon
                      className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-zinc-500'}`}
                    />
                    {equip.name}
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 ml-auto text-indigo-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-zinc-800">
            <button
              type="submit"
              className="flex items-center justify-center w-full gap-2 px-4 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg shadow-lg shadow-indigo-900/30 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-zinc-900 transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Save Venue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
