import React from 'react';
import { Calendar, MapPin, Navigation, TrendingUp, Bell, Fuel, Activity, ChevronRight, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTrips } from '../context/TripContext';
import { Link, useNavigate } from 'react-router-dom';

const QuickAction = ({ icon: Icon, label, subtext, color }) => (
  <div className="card" style={{ flex: 1, padding: '1.5rem', borderRadius: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'white' }}>
    <div style={{ 
      width: '42px', height: '42px', borderRadius: '12px', background: `${color}15`, 
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: color 
    }}>
      <Icon size={24} />
    </div>
    <div>
      <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)' }}>{label}</div>
      <div style={{ fontSize: '0.825rem', color: '#94a3b8' }}>{subtext}</div>
    </div>
  </div>
);

const Home = () => {
  const { trips, user, getStats } = useTrips();
  const stats = getStats();
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ paddingBottom: '2rem' }}
    >
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '12px', overflow: 'hidden', border: '3px solid white', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div>
            <div style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 500 }}>Welcome back,</div>
            <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '-0.02em' }}>{user.name}</div>
          </div>
        </div>
        <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', border: '1px solid #e2e8f0', position: 'relative' }}>
          <Bell size={20} />
          <div style={{ position: 'absolute', top: '10px', right: '12px', width: '8px', height: '8px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }} />
        </div>
      </header>

      <div style={{ marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>Hi, {user.name.split(' ')[0]}!</h1>
        <p style={{ fontSize: '1rem', color: '#64748b', fontWeight: 500 }}>Where shall we venture today?</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ flex: 1, padding: '1.5rem', borderRadius: '2.5rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <MapPin size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)' }}>{stats.totalDistance} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8' }}>km</span></div>
            <div style={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Traveled</div>
          </div>
        </div>
        <div className="card" style={{ flex: 1, padding: '1.5rem', borderRadius: '2.5rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f0f9ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0ea5e9' }}>
            <Fuel size={20} />
          </div>
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)' }}>{Math.round(parseFloat(stats.totalDistance.replace(/,/g, '')) * 0.083)} <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#94a3b8' }}>L</span></div>
            <div style={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fuel Burned</div>
          </div>
        </div>
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <motion.div 
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/plan')}
          style={{ 
            padding: '2rem', 
            borderRadius: '2.5rem', 
            background: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)', 
            color: 'white', 
            boxShadow: '0 20px 40px -10px rgba(6, 95, 70, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer',
            border: '2px dashed rgba(255,255,255,0.3)'
          }}
        >
          <div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Start New Trip</div>
            <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Design your next adventure</p>
          </div>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={28} />
          </div>
        </motion.div>
      </section>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2.5rem' }}>
        <div onClick={() => navigate('/plan')} className="card" style={{ flex: 1, padding: '1.25rem', borderRadius: '2rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '0.75rem', cursor: 'pointer' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
            <Compass size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.925rem', fontWeight: 800, color: 'var(--text-dark)' }}>Fuel Calculator</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Estimate costs</div>
          </div>
        </div>
        <div onClick={() => navigate('/plan')} className="card" style={{ flex: 1, padding: '1.25rem', borderRadius: '2rem', background: 'white', display: 'flex', flexDirection: 'column', gap: '0.75rem', cursor: 'pointer' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8b5cf6' }}>
            <Activity size={20} />
          </div>
          <div>
            <div style={{ fontSize: '0.925rem', fontWeight: 800, color: 'var(--text-dark)' }}>Live Tracking</div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Real-time stats</div>
          </div>
        </div>
      </div>

      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-dark)', letterSpacing: '-0.03em' }}>Recent Trips</h2>
          <Link to="/trips" style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--primary)', textDecoration: 'none' }}>View All</Link>
        </div>

        <div style={{ display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
          {trips.length > 0 ? trips.slice(0, 3).map((trip) => (
            <div key={trip.id} className="card" style={{ minWidth: '280px', flex: 1, padding: 0, overflow: 'hidden', borderRadius: '2rem' }}>
              <div style={{ height: '160px', overflow: 'hidden', position: 'relative' }}>
                <img src={trip.image} alt={trip.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.95)', padding: '0.35rem 0.75rem', borderRadius: '2rem', fontSize: '0.625rem', fontWeight: 800, color: trip.status === 'Completed' ? '#065f46' : 'var(--primary)', letterSpacing: '0.05em' }}>
                  {trip.status.toUpperCase()}
                </div>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>{trip.name}</h3>
                <div style={{ fontSize: '0.825rem', color: '#94a3b8', marginBottom: '1rem' }}>{trip.date}</div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
                    <TrendingUp size={14} color="var(--primary)" /> {trip.distance} km
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.875rem', fontWeight: 600, color: '#475569' }}>
                    <Calendar size={14} color="var(--primary)" /> 6 Days
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div style={{ width: '100%', padding: '3rem 1rem', textAlign: 'center', color: '#64748b' }}>
               No recent trips yet.
            </div>
          )}
        </div>
      </section>

      <section style={{ marginBottom: '2.5rem' }}>
        <motion.div 
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/plan')}
          style={{ 
            padding: '2rem', 
            borderRadius: '2.5rem', 
            background: 'linear-gradient(135deg, #065f46 0%, #064e3b 100%)', 
            color: 'white', 
            boxShadow: '0 20px 40px -1px rgba(6, 95, 70, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '150px', height: '150px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
          <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>Start Your Next Adventure</div>
          <p style={{ fontSize: '0.875rem', opacity: 0.9, lineHeight: 1.5, maxWidth: '200px' }}>Plan your route, add stops, and track your metrics in real-time.</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.875rem' }}>
             Let's Go <ChevronRight size={18} />
          </div>
        </motion.div>
      </section>

      <section className="card" style={{ padding: '1.5rem', borderRadius: '2rem', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Pro Explorer Tip</div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>Plan for High Altitudes</h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: 1.5 }}>Going north? Remember to check your tire pressure for every 1,000m gain.</p>
        </div>
        <div style={{ color: 'var(--primary)', opacity: 0.2 }}>
           <MapPin size={48} fill="var(--primary)" />
        </div>
      </section>
    </motion.div>
  );
};

export default Home;
