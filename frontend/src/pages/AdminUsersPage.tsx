// frontend/src/pages/AdminUsersPage.tsx
import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

interface User {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/admin/users', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setUsers(response.data.data);
      } catch (error) {
        console.error('Failed to fetch users', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-zinc-500">
        Loading users...
      </div>
    );
  }

  return (
    <div className="text-zinc-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">
          User Management
        </h1>
        <p className="mt-1 text-zinc-400">
          View and manage all platform users.
        </p>
      </div>

      <div className="overflow-hidden bg-zinc-900 border border-zinc-800 rounded-xl">
        <table className="min-w-full divide-y divide-zinc-800">
          <thead className="bg-zinc-950/50">
            <tr>
              <th className="px-6 py-3.5 text-xs font-semibold tracking-wider text-left text-zinc-500 uppercase">
                Name
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold tracking-wider text-left text-zinc-500 uppercase">
                Email
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold tracking-wider text-left text-zinc-500 uppercase">
                Role
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold tracking-wider text-left text-zinc-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3.5 text-xs font-semibold tracking-wider text-left text-zinc-500 uppercase">
                Joined
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map((user) => (
              <tr
                key={user.id}
                className="hover:bg-zinc-800/30 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-8 h-8 mr-3 text-sm font-bold text-indigo-400 bg-indigo-950/50 border border-indigo-900/50 rounded-full">
                      {user.firstName?.charAt(0) || 'U'}
                    </div>
                    <div className="text-sm font-medium text-white">
                      {user.firstName} {user.lastName}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-zinc-400">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-bold text-indigo-400 bg-indigo-950/50 border border-indigo-900/50 rounded">
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 py-1 text-xs font-bold rounded border ${user.isEmailVerified ? 'text-green-400 bg-green-950/50 border-green-900/50' : 'text-yellow-400 bg-yellow-950/50 border-yellow-900/50'}`}
                  >
                    {user.isEmailVerified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
