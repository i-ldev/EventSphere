// frontend/src/pages/LoginPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Sparkles } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await api.post('/auth/login', formData);
      if (response.data.success) {
        setAuth(
          { id: '', email: formData.email, role: '' },
          response.data.data.accessToken,
        );

        const meRes = await api.get('/auth/me', {
          headers: {
            Authorization: `Bearer ${response.data.data.accessToken}`,
          },
        });

        setAuth(meRes.data.data, response.data.data.accessToken);
        navigate('/dashboard');
      }
    } catch (err) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      console.error(
        'Login error:',
        axiosError.response?.data || axiosError.message,
      );
      setError(
        axiosError.response?.data?.message || 'Login failed. Check console.',
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950">
      <div className="w-full max-w-md p-8 space-y-6 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-xl mb-4">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-sm text-zinc-500">
            Sign in to your EventSphere workspace
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-400 bg-red-950 border border-red-800 rounded-md">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3 py-2.5 text-white bg-zinc-950 border border-zinc-800 rounded-md focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            />
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2.5 text-white bg-indigo-600 rounded-md hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-colors font-medium"
          >
            Sign in
          </button>
        </form>

        <p className="text-sm text-center text-zinc-500">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium text-indigo-400 hover:text-indigo-300"
          >
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
