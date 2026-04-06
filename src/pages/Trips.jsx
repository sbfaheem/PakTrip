import React, { useState } from 'react';
import { Clock, CheckCircle, Navigation, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTrips } from '../context/TripContext';

const TripCard = ({ name, status, date, region, image }) => {
  const getStatusColor = (s) => {
    switch (s) {
      case 'In Progress': return '#10b981';
      case 'Upcoming': return '#3b82f6';
      case 'Completed': return '#6b7280';
      default: return '#065f46';
    }
  };

  return (
    <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '16px', overflow: 'hidden', flexShrink: 0 }}>
        <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
          <h3 style={{ fontSize: '1rem' }}>{name}</h3>
          <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px', background: `${getStatusColor(status)}15`, color: getStatusColor(status) }}>
            {status}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
          <MapPin size={12} /> {region}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{date}</div>
      </div>
    </div>
  );
};

const Trips = () => {
  const { trips } = useTrips();
  const [activeTab, setActiveTab] = useState('All');
  const tabs = ['All', 'Upcoming', 'Completed'];

  const filteredTrips = trips.filter(trip => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Upcoming') return trip.status === 'Upcoming' || trip.status === 'In Progress';
    return trip.status === activeTab;
  });

  const currentTrips = filteredTrips.filter(t => t.status !== 'Completed');
  const pastTrips = filteredTrips.filter(t => t.status === 'Completed');

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      style={{ padding: '1.5rem 0' }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>My Adventures</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Relive your memories or plan your future journeys.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #e5e7eb' }}>
        {tabs.map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ 
              background: 'none', border: 'none', padding: '0.75rem 0', 
              fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
              color: activeTab === tab ? 'var(--primary)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'var(--transition)'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {currentTrips.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Current & Upcoming</h3>
          {currentTrips.map(trip => (
            <TripCard key={trip.id} {...trip} />
          ))}
        </div>
      )}

      {pastTrips.length > 0 && (
        <div>
          <h3 style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem' }}>Past Journeys</h3>
          {pastTrips.map(trip => (
            <TripCard key={trip.id} {...trip} />
          ))}
        </div>
      )}

      {filteredTrips.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '6rem 2rem', 
          background: 'white', 
          borderRadius: '2.5rem',
          border: '2px dashed #f1f5f9'
        }}>
          <div style={{ 
            width: '64px', height: '64px', borderRadius: '50%', background: '#f0fdf4', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem',
            color: 'var(--primary)'
          }}>
            <Navigation size={32} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
            No Adventures Yet
          </h3>
          <p style={{ color: '#94a3b8', fontSize: '0.925rem', marginBottom: '2rem', maxWidth: '240px', margin: '0 auto 2rem', lineHeight: 1.5 }}>
            {activeTab === 'All' 
              ? "Your legendary travel logs will appear here once you start your first journey." 
              : `You don't have any ${activeTab.toLowerCase()} trips at the moment.`}
          </p>
          {activeTab === 'All' && (
            <button 
              onClick={() => window.location.href = '/plan'}
              style={{ 
                padding: '0.875rem 1.75rem', borderRadius: '1rem', background: 'var(--primary)', 
                color: 'white', border: 'none', fontWeight: 700, fontSize: '0.925rem', cursor: 'pointer',
                boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.3)'
              }}
            >
              Plan Your First Trip
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default Trips;
