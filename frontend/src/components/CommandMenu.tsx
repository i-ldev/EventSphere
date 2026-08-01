// frontend/src/components/CommandMenu.tsx
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import {
  CalendarDays,
  MapPin,
  QrCode,
  LayoutDashboard,
  Ticket,
  Users,
  PlusCircle,
  Search,
} from 'lucide-react';

interface CommandMenuProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export default function CommandMenu({ open, setOpen }: CommandMenuProps) {
  const navigate = useNavigate();

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  if (!open) return null;

  const handleNavigate = (path: string) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <Command
        loop
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 border-b border-zinc-800">
          <Search className="w-5 h-5 text-zinc-500" />
          <Command.Input
            autoFocus
            placeholder="Search or jump to..."
            className="w-full py-4 text-sm text-white placeholder-zinc-500 bg-transparent border-0 outline-none"
          />
        </div>

        {/* Results List */}
        <Command.List className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin">
          <Command.Empty className="py-6 text-sm text-center text-zinc-500">
            No results found.
          </Command.Empty>

          {/* Quick Create Group */}
          <Command.Group
            heading="Quick Create"
            className="text-zinc-500 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
          >
            <Command.Item
              onSelect={() => handleNavigate('/create-event')}
              className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 rounded-md cursor-pointer aria-selected:bg-zinc-800 aria-selected:text-white"
            >
              <PlusCircle className="w-4 h-4 text-indigo-400" />
              Create New Event
            </Command.Item>
            <Command.Item
              onSelect={() => handleNavigate('/create-venue')}
              className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 rounded-md cursor-pointer aria-selected:bg-zinc-800 aria-selected:text-white"
            >
              <PlusCircle className="w-4 h-4 text-indigo-400" />
              Create New Venue
            </Command.Item>
          </Command.Group>

          <Command.Separator className="h-px my-2 bg-zinc-800" />

          {/* Navigation Group */}
          <Command.Group
            heading="Navigation"
            className="text-zinc-500 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider"
          >
            <Command.Item
              onSelect={() => handleNavigate('/dashboard')}
              className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 rounded-md cursor-pointer aria-selected:bg-zinc-800 aria-selected:text-white"
            >
              <LayoutDashboard className="w-4 h-4 text-zinc-500" />
              Go to Dashboard
            </Command.Item>
            <Command.Item
              onSelect={() => handleNavigate('/events')}
              className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 rounded-md cursor-pointer aria-selected:bg-zinc-800 aria-selected:text-white"
            >
              <CalendarDays className="w-4 h-4 text-zinc-500" />
              Go to Events
            </Command.Item>
            <Command.Item
              onSelect={() => handleNavigate('/venues')}
              className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 rounded-md cursor-pointer aria-selected:bg-zinc-800 aria-selected:text-white"
            >
              <MapPin className="w-4 h-4 text-zinc-500" />
              Go to Venues
            </Command.Item>
            <Command.Item
              onSelect={() => handleNavigate('/scanner')}
              className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 rounded-md cursor-pointer aria-selected:bg-zinc-800 aria-selected:text-white"
            >
              <QrCode className="w-4 h-4 text-zinc-500" />
              Open Scanner
            </Command.Item>
            <Command.Item
              onSelect={() => handleNavigate('/my-tickets')}
              className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 rounded-md cursor-pointer aria-selected:bg-zinc-800 aria-selected:text-white"
            >
              <Ticket className="w-4 h-4 text-zinc-500" />
              View My Tickets
            </Command.Item>
            <Command.Item
              onSelect={() => handleNavigate('/admin/users')}
              className="flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 rounded-md cursor-pointer aria-selected:bg-zinc-800 aria-selected:text-white"
            >
              <Users className="w-4 h-4 text-zinc-500" />
              User Management
            </Command.Item>
          </Command.Group>
        </Command.List>
      </Command>
    </div>
  );
}
