// frontend/src/components/layout/AppLayout.tsx
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import CommandMenu from '../CommandMenu';
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import api from '../../services/api';

export default function AppLayout() {
  const [commandOpen, setCommandOpen] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();

  // Listen for Ctrl+K / Cmd+K globally
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch fresh user profile on app load to catch updates (like Stripe Connect or Workspace creation)
  useEffect(() => {
    const fetchProfile = async () => {
      if (accessToken) {
        try {
          const response = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          if (response.data.success) {
            setAuth(response.data.data, accessToken);
            
            // MULTI-TENANCY GATE: If organizer has no workspace, force them to create one
            if (response.data.data.role === 'ORGANIZER' && !response.data.data.workspaceId) {
              navigate('/create-workspace');
            }
          }
        } catch (error) {
          console.error('Session expired or invalid', error);
          useAuthStore.getState().logout();
          navigate('/login');
        }
      }
    };
    fetchProfile();
  }, [accessToken, setAuth, navigate]);

  return (
    <div className="min-h-screen bg-zinc-900">
      <Sidebar />
      {/* Added relative and z-0 to keep main content below the sidebar's dropdowns */}
      <main className="relative z-0 pl-64">
        <div className="px-8 py-8">
          <Outlet />
        </div>
      </main>
      
      <CommandMenu open={commandOpen} setOpen={setCommandOpen} />
    </div>
  );
}