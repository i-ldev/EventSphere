// frontend/src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const accessToken = useAuthStore((state) => state.accessToken);

  if (!accessToken) {
    // If no token, redirect to login page
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
