// frontend/src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import CreateEventPage from './pages/CreateEventPage';
import EventDetailsPage from './pages/EventDetailsPage';
import VenuesPage from './pages/VenuesPage';
import CreateVenuePage from './pages/CreateVenuePage';
import AdminUsersPage from './pages/AdminUsersPage';
import MyTicketsPage from './pages/MyTicketsPage';
import ScannerPage from './pages/ScannerPage';
import AnalyticsPage from './pages/AnalyticsPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import DiscoverPage from './pages/DiscoverPage'; 
import AppLayout from './components/layout/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import CreateWorkspacePage from './pages/CreateWorkspacePage'; 
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes (No Sidebar) */}
        <Route path="/" element={<DiscoverPage />} /> {/* Changed to / */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-workspace" element={<CreateWorkspacePage />} /> {/* <-- Add this */}

        {/* Protected Routes (Wrapped in AppLayout for Sidebar) */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/create-event" element={<CreateEventPage />} />
          <Route path="/events/:id" element={<EventDetailsPage />} />
          <Route path="/venues" element={<VenuesPage />} />
          <Route path="/create-venue" element={<CreateVenuePage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/my-tickets" element={<MyTicketsPage />} />
          <Route path="/scanner" element={<ScannerPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/payment-success" element={<PaymentSuccessPage />} />
        </Route>
        
        {/* Redirect any unknown route to the homepage */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;