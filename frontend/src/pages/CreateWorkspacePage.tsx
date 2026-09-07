// frontend/src/pages/CreateWorkspacePage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Sparkles, Loader2 } from 'lucide-react';

export default function CreateWorkspacePage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/workspaces', { name }, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      // Fetch fresh user profile to get the new workspaceId
      const meRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setAuth(meRes.data.data, accessToken);
      
      navigate('/dashboard');
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to create workspace.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="w-full max-w-md p-8 space-y-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Your Workspace</h1>
          <p className="text-sm text-zinc-500 text-center mt-2">Give your organization or team a name to get started.</p>
        </div>
        
        {error && <div className="p-3 text-sm text-red-400 bg-red-950 border border-red-800 rounded-md">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Workspace Name</label>
            <input 
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors" 
              placeholder="e.g., Ibrahim's Tech Events"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="flex items-center justify-center w-full px-4 py-2.5 text-white bg-indigo-600 rounded-md hover:bg-indigo-500 disabled:opacity-50 transition-colors font-medium"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Workspace'}
          </button>
        </form>
      </div>
    </div>
  );
}