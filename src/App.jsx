import React, { useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Home as HomeIcon, Compass, Backpack, User as UserIcon, Activity, Plus, Search, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Trips from './pages/Trips';
import Profile from './pages/Profile';
import LiveTracking from './pages/LiveTracking';
import PlanTrip from './pages/PlanTrip';
import Login from './pages/Login';
import Splash from './pages/Splash';
import { useTrips } from './context/TripContext';

function PrivateRoute({ children }) {
  const { user } = useTrips();
  return user.isAuthenticated ? children : <Navigate to="/login" />;
}

function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { trips, user } = useTrips() || { trips: [], user: {} };
  const hasInProgress = trips.some(t => t.status === 'In Progress');

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navItems = [
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/trips', icon: Backpack, label: 'Trips' },
    { path: '/plan', icon: Plus, label: 'Plan My Trip', isAction: true },
    { path: '/profile', icon: UserIcon, label: 'Profile' },
  ];

  const hideNav = location.pathname === '/login' || location.pathname === '/splash';

  return (
    <div className="app-container" style={{ paddingBottom: hideNav ? 0 : 'var(--nav-height)' }}>
      <AnimatePresence>
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className="content"
          style={{ padding: hideNav ? 0 : '0 1rem' }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      {!hideNav && (
        <nav className="bottom-nav" style={{ 
          paddingBottom: 'env(safe-area-inset-bottom)', 
          height: '80px', 
          borderRadius: '2.5rem 2.5rem 0 0',
          background: 'white',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.05)',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          borderTop: 'none'
        }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            if (item.isAction) {
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    gap: '4px', textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    flex: 1, height: '100%', position: 'relative', zIndex: 10
                  }}
                >
                  <div style={{
                    width: '56px', height: '56px', borderRadius: '50%',
                    background: '#dcfce7',
                    color: 'var(--primary)',
                    boxShadow: '0 0 0 4px white, 0 12px 24px -4px rgba(6, 95, 70, 0.3)',
                    border: '2.5px solid #059669',
                    marginTop: '-32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none'
                  }}>
                    <Plus size={28} />
                  </div>
                  <span style={{ 
                    fontSize: '0.625rem', 
                    fontWeight: 900, 
                    color: 'var(--primary)', 
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    width: 'max-content',
                    pointerEvents: 'none'
                  }}>{item.label}</span>
                </Link>
              );
            }
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{ 
                  position: 'relative', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '6px',
                  textDecoration: 'none',
                  flex: 1,
                  height: '100%',
                  zIndex: 10
                }}
              >
                <item.icon 
                  size={24} 
                  color={isActive ? 'var(--primary)' : '#94a3b8'} 
                  fill={isActive ? '#f0fdf4' : 'none'}
                  style={{ 
                    opacity: isActive ? 1 : 0.6, 
                    transition: 'all 0.3s',
                    pointerEvents: 'none'
                  }} 
                />
                <span style={{ 
                  fontSize: '0.625rem', 
                  fontWeight: 800, 
                  color: isActive ? 'var(--primary)' : '#94a3b8', 
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  pointerEvents: 'none'
                }}>{item.label}</span>
                {item.label === 'Trips' && hasInProgress && (
                  <div style={{
                    position: 'absolute', top: '15px', right: '30%',
                    width: '8px', height: '8px', background: '#ef4444',
                    borderRadius: '50%', border: '2px solid white',
                    pointerEvents: 'none'
                  }} />
                )}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/splash" element={<PrivateRoute><Splash /></PrivateRoute>} />
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/explore" element={<PrivateRoute><Explore /></PrivateRoute>} />
        <Route path="/plan" element={<PrivateRoute><PlanTrip /></PrivateRoute>} />
        <Route path="/trips" element={<PrivateRoute><Trips /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/tracking" element={<PrivateRoute><LiveTracking /></PrivateRoute>} />
      </Routes>
    </Layout>
  );
}
