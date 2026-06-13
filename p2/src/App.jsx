import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Intro from './pages/Intro';
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import Analytics from './pages/Analytics';
import Dashboard from './pages/Dashboard';
import Management from './pages/Management';
import Booking from './pages/Booking';

const ProtectedRoute = ({ children, excludedRoles = [], allowedRoles = null, redirectTo = '/home' }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-whiteSmoke">
      <div className="w-12 h-12 border-4 border-royalPurple border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  if (excludedRoles.includes(user.role)) return <Navigate to={redirectTo} />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to={redirectTo} />;

  return children;
};

const AppContent = () => {
  const location = useLocation();
  const showNavAndFooter = location.pathname !== '/';

  return (
    <div className="flex flex-col min-h-screen selection:bg-softGold selection:text-white">
      {showNavAndFooter && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Intro />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/management"
            element={
              <ProtectedRoute allowedRoles={['ROLE_MANAGER']}>
                <Management />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute excludedRoles={['ROLE_MANAGER']} redirectTo="/management">
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <ProtectedRoute excludedRoles={['ROLE_MANAGER']} redirectTo="/management">
                <Booking />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {showNavAndFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
