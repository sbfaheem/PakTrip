import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Clock, TrendingUp, Plus, X, ChevronRight, Bell, Layers, Activity } from 'lucide-react';
import { useTrips } from '../context/TripContext';
import { useNavigate } from 'react-router-dom';

const PlanTrip = () => {
  const [from, setFrom] = useState('Islamabad, Capital Territory');
  const [to, setTo] = useState('Naran Valley, KP');
  const navigate = useNavigate();
  const { user } = useTrips();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="app-container"
      style={{ padding: 0, background: '#f8fafc', minHeight: '100vh', position: 'relative' }}
    >
      {/* Header Overlay */}
      <header style={{ 
        position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
        padding: '1.25rem 1.5rem', background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden', border: '2px solid white' }}>
            <img src={user.avatar} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#064e3b', letterSpacing: '-0.02em' }}>PakTrip</h1>
        </div>
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <Bell size={20} color="#64748b" />
        </div>
      </header>

      {/* Hero Map Image */}
      <div style={{ height: '55vh', position: 'relative', overflow: 'hidden' }}>
        <img 
          src="https://images.unsplash.com/photo-1548062005-e50d0639138c?q=80&w=2000&auto=format&fit=crop" 
          alt="Karakoram Highway" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ position: 'absolute', top: '90px', right: '20px', width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', backdropFilter: 'blur(8px)' }}>
          <Layers size={22} color="#475569" />
        </div>
      </div>

      {/* Floating Search Card */}
      <div style={{ padding: '0 1.25rem', marginTop: '-120px', position: 'relative', zIndex: 20 }}>
        <div className="card" style={{ padding: '1.5rem', borderRadius: '2.5rem', background: 'white', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
            {/* Visual connector */}
            <div style={{ position: 'absolute', left: '10px', top: '24px', bottom: '24px', width: '2px', background: '#e2e8f0' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '3px solid #059669', background: 'white', zIndex: 1 }} />
              <div style={{ flex: 1, position: 'relative' }}>
                <input 
                  type="text" 
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '1.25rem', background: '#f8fafc', border: '1px solid #f1f5f9', fontSize: '0.925rem', fontWeight: 600 }}
                />
                <X size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '22px', height: '22px', background: '#0284c7', borderRadius: '4px', zIndex: 1 }} />
              <div style={{ flex: 1, position: 'relative' }}>
                <input 
                  type="text" 
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '1.25rem', background: '#f8fafc', border: '1px solid #f1f5f9', fontSize: '0.925rem', fontWeight: 600 }}
                />
                <X size={16} color="#94a3b8" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              </div>
            </div>

            <button style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', padding: '0.5rem', color: '#059669', fontWeight: 700, fontSize: '0.875rem' }}>
              <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '2px solid #059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={14} />
              </div>
              Add Stop
            </button>
          </div>
        </div>

        {/* Route Details Card */}
        <div style={{ marginTop: '1.5rem', padding: '1.5rem', borderRadius: '2.5rem', background: 'rgba(6, 95, 70, 0.05)', border: '1px solid rgba(6, 95, 70, 0.1)', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Recommended Route</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#064e3b', letterSpacing: '-0.02em' }}>Karakoram Highway</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.25rem' }}>6h 45m</div>
              <div style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 600 }}>284 km total</div>
            </div>
          </div>
        </div>

        {/* Tracking Context Card */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: '2.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                   <div style={{ fontSize: '1rem', fontWeight: 800 }}>72</div>
                   <div style={{ fontSize: '0.5rem', opacity: 0.8, marginLeft: '2px' }}>KM/H</div>
                </div>
                <div>
                   <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)' }}>Cruising smoothly</div>
                   <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>ON N-15 HIGHWAY</div>
                </div>
             </div>
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Next Stop</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#065f46' }}>Abbottabad • 14km</div>
             </div>
          </div>

          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '45%', height: '100%', background: '#059669' }} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em' }}>
            <span>ISLAMABAD</span>
            <span>NARAN</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlanTrip;
