import React, { useState } from 'react';
import { Search, MapPin, Star, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const DestinationCard = ({ name, location, rating, image, price }) => (
  <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem' }}>
    <div style={{ height: '160px', position: 'relative' }}>
      <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(255,255,255,0.9)', padding: '0.25rem 0.5rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', fontWeight: 600 }}>
        <Star size={12} fill="#fbbf24" color="#fbbf24" /> {rating}
      </div>
    </div>
    <div style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.125rem' }}>{name}</h3>
        <span style={{ color: 'var(--primary)', fontWeight: 700 }}>PKR {price} <small style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/trip</small></span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <MapPin size={14} /> {location}
      </div>
    </div>
  </div>
);

const Explore = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Mountains', 'Beaches', 'Culture', 'Adventure'];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="explore-page"
      style={{ padding: '1rem 0' }}
    >
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={20} />
        <input 
          type="text" 
          placeholder="Where to next?" 
          className="glass"
          style={{ width: '100%', padding: '1rem 1rem 1rem 2.5rem', borderRadius: '14px', border: 'none', borderBottom: '2px solid #f3f4f6', fontSize: '1rem', outline: 'none' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1.5rem', scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button 
            key={cat}
            className={`chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Popular Destinations</h2>
        <DestinationCard 
          name="Hunza Valley" 
          location="Gilgit-Baltistan" 
          rating="4.9" 
          price="25,000"
          image="https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?q=80&w=400&auto=format&fit=crop" 
        />
        <DestinationCard 
          name="Shogran" 
          location="Kaghan Valley" 
          rating="4.7" 
          price="18,000"
          image="https://images.unsplash.com/photo-1627548633724-99bc62c93883?q=80&w=400&auto=format&fit=crop" 
        />
      </section>

      <section>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Upcoming Events</h2>
        <div className="card" style={{ display: 'flex', gap: '1rem', background: 'linear-gradient(135deg, var(--primary) 0%, #064e3b 100%)', color: 'white', border: 'none' }}>
          <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.2)', borderRadius: '12px', height: 'fit-content' }}>
            <Calendar size={24} />
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '0.25rem' }}>Shandur Polo Festival</h4>
            <p style={{ fontSize: '0.8125rem', opacity: 0.9, marginBottom: '0.5rem' }}>Experience the 'Kings' of Polo in Gilgit-Baltistan.</p>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, background: 'rgba(255,255,255,0.3)', padding: '0.25rem 0.5rem', borderRadius: '4px' }}>July 7 - 9, 2026</span>
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default Explore;
