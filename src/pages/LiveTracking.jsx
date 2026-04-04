import React from 'react';
import { Navigation, Clock, Thermometer, Wind, ShieldCheck, MapPin, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const LiveTracking = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '1rem 0' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-dark)' }}>
          <ChevronLeft size={24} />
        </button>
        <h2 style={{ fontSize: '1.25rem' }}>Live Journey Tracking</h2>
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #064e3b 100%)', color: 'white', padding: '2rem', marginBottom: '2rem', border: 'none' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.75rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Current Trip</span>
            <h3 style={{ color: 'white', fontSize: '1.5rem' }}>Islamabad ➔ Naran</h3>
          </div>
          <div style={{ width: '50px', height: '50px', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Navigation size={24} />
          </div>
        </div>

        <div style={{ position: 'relative', height: '8px', background: 'rgba(255,255,255,0.2)', borderRadius: '4px', marginBottom: '1.5rem' }}>
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '68%' }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ height: '100%', background: 'white', borderRadius: '4px', position: 'relative' }}
          >
            <div style={{ position: 'absolute', right: '-10px', top: '-15px', background: 'white', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '50%' }}></div>
            </div>
          </motion.div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
          <span>120 km left</span>
          <span>ETA: 2:45 PM</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: '#3b82f6' }}><Thermometer size={20} /></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Temp in Naran</span>
          <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>12°C <small style={{ fontWeight: 400 }}>Snowy</small></span>
        </div>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: '#10b981' }}><ShieldCheck size={20} /></div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Safety Status</span>
          <span style={{ fontSize: '1.125rem', fontWeight: 700 }}>Optimal</span>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
           <MapPin size={18} color="var(--primary)" /> Next Major Stop
        </h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', color: 'var(--text-dark)', marginBottom: '0.25rem' }}>Abbottabad Bypass</h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Expected in 45 mins • 32 km away</p>
          </div>
          <button className="btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>Details</button>
        </div>
      </div>

      <button className="btn-primary" style={{ width: '100%', background: '#ef4444', marginBottom: '2rem' }}>End Journey</button>
    </motion.div>
  );
};

export default LiveTracking;
