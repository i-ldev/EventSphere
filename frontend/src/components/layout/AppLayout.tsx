// frontend/src/components/layout/AppLayout.tsx
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import CommandMenu from '../CommandMenu';
import { useState, useEffect } from 'react';

export default function AppLayout() {
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Listen for Ctrl+K (Windows) or Cmd+K (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900">
      <Sidebar />
      <main className="pl-64">
        <div className="px-8 py-8">
          <Outlet />
        </div>
      </main>

      {/* Global Command Menu */}
      <CommandMenu open={commandOpen} setOpen={setCommandOpen} />
    </div>
  );
}
