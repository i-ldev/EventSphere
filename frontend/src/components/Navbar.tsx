// frontend/src/components/Navbar.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="p-4 bg-gray-800">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex space-x-4">
          <Link
            to="/dashboard"
            className="px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
          >
            Dashboard
          </Link>
          <Link
            to="/events"
            className="px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
          >
            Events
          </Link>
          <Link
            to="/venues"
            className="px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
          >
            Venues
          </Link>
          <Link
            to="/my-tickets"
            className="px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-700 hover:text-white"
          >
            My Tickets
          </Link>

          {/* Scanner Link for Organizers and Staff */}
          {(user?.role === 'ORGANIZER' ||
            user?.role === 'STAFF' ||
            user?.role === 'SUPER_ADMIN') && (
            <Link
              to="/scanner"
              className="px-3 py-2 text-sm font-medium text-blue-300 rounded-md hover:bg-gray-700 hover:text-white"
            >
              Scanner
            </Link>
          )}

          {/* Admin Link for Super Admin */}
          {user?.role === 'SUPER_ADMIN' && (
            <Link
              to="/admin/users"
              className="px-3 py-2 text-sm font-medium text-purple-300 rounded-md hover:bg-gray-700 hover:text-white"
            >
              Admin Panel
            </Link>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
