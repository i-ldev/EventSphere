// frontend/src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import AnalyticsPage from './pages/AnalyticsPage'; // <-- Add this
import CreateEventPage from './pages/CreateEventPage';
import EventDetailsPage from './pages/EventDetailsPage';
import VenuesPage from './pages/VenuesPage';
import CreateVenuePage from './pages/CreateVenuePage';
import AdminUsersPage from './pages/AdminUsersPage';
import MyTicketsPage from './pages/MyTicketsPage';
import ScannerPage from './pages/ScannerPage';
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import CalendarPage from './pages/CalendarPage';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes (No Sidebar) */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected Routes (Wrapped in AppLayout for Sidebar) */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/create-event" element={<CreateEventPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="/create-venue" element={<CreateVenuePage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/my-tickets" element={<MyTicketsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />{' '}
          {/* <-- Add this */}
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
        </Route>

        {/* Redirect any unknown route to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
