import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home as HomeIcon, Compass, Backpack, User as UserIcon, Activity, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Trips from './pages/Trips';
import Profile from './pages/Profile';
import LiveTracking from './pages/LiveTracking';
import PlanTrip from './pages/PlanTrip';
import { useTrips } from './context/TripContext';

function Layout({ children }) {
  const location = useLocation();
  const { trips } = useTrips();
  const hasInProgress = trips.some(t => t.status === 'In Progress');

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    { path: '/explore', icon: Compass, label: 'Explore' },
    { path: '/plan', icon: Plus, label: 'Plan', isAction: true },
    { path: '/trips', icon: Backpack, label: 'Trips' },
    { path: '/profile', icon: UserIcon, label: 'Profile' },
  ];

  return (
    <div className="app-container" style={{ paddingBottom: 'var(--nav-height)' }}>
      <header className="glass" style={{
        position: 'sticky', top: 0, zIndex: 100,
        padding: '0.875rem 1.25rem', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', marginBottom: '0.5rem', borderBottom: '1px solid #f3f4f6'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            width: '38px', height: '38px', background: 'var(--primary)',
            borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
          }}>
            <Activity size={22} />
          </div>
          <h1 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>PakTrip</h1>
        </div>
        <div style={{
          width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden',
          border: '2px solid #fdba74', flexShrink: 0
        }}>
          <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=80&auto=format&fit=crop" alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="content"
          style={{ padding: '0 1rem' }}
        >
          {children}
        </motion.main>
      </AnimatePresence>

      <nav className="bottom-nav" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return item.isAction ? (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: '54px', height: '54px', borderRadius: '18px',
                background: isActive ? '#064e3b' : 'var(--primary)',
                color: 'white', boxShadow: '0 4px 14px #065f4650',
                marginTop: '-18px', textDecoration: 'none', transition: 'var(--transition)'
              }}
            >
              <Plus size={28} />
            </Link>
          ) : (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
              style={{ position: 'relative' }}
            >
              <item.icon size={22} />
              <span>{item.label}</span>
              {item.label === 'Trips' && hasInProgress && (
                <div style={{
                  position: 'absolute', top: '2px', right: '12px',
                  width: '8px', height: '8px', background: 'var(--primary-light)',
                  borderRadius: '50%', border: '2px solid white'
                }} />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/plan" element={<PlanTrip />} />
        <Route path="/trips" element={<Trips />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/tracking" element={<LiveTracking />} />
      </Routes>
    </Layout>
  );
}
