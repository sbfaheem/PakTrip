import React, { useEffect, useState } from 'react';
import { Compass, Fuel, Map, Navigation, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Splash = () => {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => navigate('/plan'), 500);
          return 100;
        }
        return prev + 2;
      });
    }, 40);
    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className="app-container" style={{ 
      height: '100vh', background: '#f8fafc', overflow: 'hidden', 
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      textAlign: 'center', padding: '2rem',
      background: 'linear-gradient(to bottom, #f1f5f9, #e2e8f0)'
    }}>
      <div style={{ position: 'absolute', top: '2rem', left: '2rem', fontSize: '0.75rem', fontWeight: 800, color: '#4b5563', letterSpacing: '0.1em' }}>
        <span style={{ color: 'var(--primary)', marginRight: '0.5rem' }}>●</span> BETA V2.0
      </div>
      <div style={{ position: 'absolute', top: '2rem', right: '2rem', fontSize: '0.75rem', fontWeight: 800, color: '#4b5563', letterSpacing: '0.1em' }}>
        EST. 2024
      </div>

      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{ 
          width: '120px', height: '120px', borderRadius: '50%', background: 'white', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '2.5rem',
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)', position: 'relative'
        }}
      >
        <div style={{ color: 'var(--primary)', transform: 'rotate(-10deg)' }}>
           <Map size={48} fill="var(--primary)" />
        </div>
        <div style={{ 
          position: 'absolute', bottom: '15px', right: '15px', 
          width: '32px', height: '32px', borderRadius: '50%', background: '#0284c7', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
          border: '3px solid white'
        }}>
          <Navigation size={14} fill="white" />
        </div>
      </motion.div>

      <div style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>PakTrip Planner</h1>
        <p style={{ color: '#64748b', fontSize: '1.25rem', fontWeight: 500 }}>Plan Your Pakistan Tour Smartly</p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '8rem' }}>
         <div className="card" style={{ padding: '1.25rem', borderRadius: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ color: 'var(--primary)' }}><Fuel size={24} /></div>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569' }}>Fuel Estimate</span>
         </div>
         <div className="card" style={{ padding: '1.25rem', borderRadius: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ color: '#0369a1' }}><Navigation size={24} /></div>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569' }}>Route Plan</span>
         </div>
      </div>

      <div style={{ width: '100%', maxWidth: '240px', position: 'relative' }}>
         <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
            <motion.div 
              style={{ width: `${progress}%`, height: '100%', background: 'var(--primary)' }}
            />
         </div>
         <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#64748b', fontWeight: 700, fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            <Activity size={14} /> INITIALIZING MAPS
         </div>
      </div>

      <div style={{ position: 'absolute', bottom: '2.5rem', width: '100%', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.2em' }}>
        THE FLUID EXPLORER EXPERIENCE
      </div>
    </div>
  );
};

export default Splash;
