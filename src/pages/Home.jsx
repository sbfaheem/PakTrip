import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, TrendingUp, Fuel, MapPin, ChevronRight, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTrips } from '../context/TripContext';

const StatCard = ({ icon: Icon, label, value, unit, color }) => (
  <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <div style={{ padding: '0.5rem', background: `${color}15`, borderRadius: '12px', width: 'fit-content' }}>
      <Icon size={20} color={color} />
    </div>
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '1.25rem', fontWeight: 700 }}>{value} <small style={{ fontSize: '0.75rem', fontWeight: 500 }}>{unit}</small></span>
    </div>
  </div>
);

const TripItem = ({ name, date, distance, image }) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', marginBottom: '1rem' }}>
    <div style={{ width: '60px', height: '60px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
      <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    </div>
    <div style={{ flex: 1 }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{name}</h3>
      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={12} /> {distance} km</span>
        <span>{date}</span>
      </div>
    </div>
    <ChevronRight size={20} color="#9ca3af" />
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const { trips, getStats } = useTrips();
  const stats = getStats();
  
  const recentTrips = trips.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '1rem 0' }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Welcome back, Explorer! 👋</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Ready for your next adventure across Pakistan?</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <StatCard icon={TrendingUp} label="Total Distance" value={stats.totalDistance} unit="km" color="var(--primary)" />
        <StatCard icon={Fuel} label="Fuel Saved" value={stats.fuelSaved} unit="L" color="#0ea5e9" />
      </div>

      <button
        className="btn-primary"
        onClick={() => navigate('/plan')}
        style={{ width: '100%', padding: '1.25rem', fontSize: '1.125rem', marginBottom: '2.5rem', boxShadow: '0 8px 16px -4px #065f4650' }}
      >
        <Play size={20} style={{ fill: 'white' }} /> Plan New Trip
      </button>

      {recentTrips.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.125rem' }}>Recent Trips</h2>
            <span 
              onClick={() => navigate('/trips')}
              style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}
            >
              View All
            </span>
          </div>

          {recentTrips.map(trip => (
            <TripItem key={trip.id} {...trip} />
          ))}
        </div>
      )}

      <div className="card" style={{ background: '#ecfdf5', border: '1px dashed #10b981', display: 'flex', gap: '1rem' }}>
        <div style={{ padding: '0.5rem', background: '#10b981', borderRadius: '50%', color: 'white', alignSelf: 'flex-start' }}>
          <Info size={16} />
        </div>
        <div>
          <h4 style={{ color: '#065f46', fontSize: '0.875rem', marginBottom: '0.25rem' }}>Pro Tip: Northern Trips</h4>
          <p style={{ color: '#047857', fontSize: '0.75rem' }}>Always check fuel availability before heading to Hunza Valley. It's scarce in some spots!</p>
        </div>
      </div>
    </motion.div>
  );
};

export default Home;
