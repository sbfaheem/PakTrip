import React, { useState } from 'react';
import { Search, MapPin, Star, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const DestinationCard = ({ name, location, rating, image, price }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="card" 
    style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem', cursor: 'pointer' }}
  >
    <div style={{ height: '180px', position: 'relative' }}>
      <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      <div style={{ 
        position: 'absolute', top: '12px', right: '12px', 
        background: 'rgba(255,255,255,0.95)', padding: '0.4rem 0.6rem', 
        borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.35rem', 
        fontSize: '0.75rem', fontWeight: 700, backdropFilter: 'blur(4px)',
        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
      }}>
        <Star size={12} fill="#fbbf24" color="#fbbf24" /> {rating}
      </div>
    </div>
    <div style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#064e3b' }}>{name}</h3>
        <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '0.9rem' }}>PKR {price}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#64748b', fontSize: '0.85rem', fontWeight: 500 }}>
        <MapPin size={14} /> {location}
      </div>
    </div>
  </motion.div>
);

const Explore = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = ['All', 'Mountains', 'Beaches', 'Culture', 'Adventure'];

  const destinations = [
    { name: "Hunza Valley", location: "Gilgit-Baltistan", rating: "4.9", price: "25,000", cat: "Mountains", image: "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?q=80&w=400&auto=format&fit=crop" },
    { name: "Skardu Desert", location: "Gilgit-Baltistan", rating: "4.8", price: "32,000", cat: "Adventure", image: "https://images.unsplash.com/photo-1548062005-e50d0639138c?q=80&w=400&auto=format&fit=crop" },
    { name: "Kund Malir", location: "Balochistan", rating: "4.7", price: "12,000", cat: "Beaches", image: "https://images.unsplash.com/photo-1599661046289-e31887846eac?q=80&w=400&auto=format&fit=crop" },
    { name: "Naran Valley", location: "KPK", rating: "4.6", price: "18,000", cat: "Mountains", image: "https://images.unsplash.com/photo-1627548633724-99bc62c93883?q=80&w=400&auto=format&fit=crop" },
    { name: "Mohenjo-daro", location: "Sindh", rating: "4.5", price: "8,500", cat: "Culture", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=400&auto=format&fit=crop" }
  ];

  const filtered = destinations.filter(d => 
    (activeCategory === 'All' || d.cat === activeCategory) &&
    (d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="explore-page"
      style={{ padding: '1rem 0' }}
    >
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={20} />
        <input 
          type="text" 
          placeholder="Where to next?" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '1.15rem 1rem 1.15rem 3rem', borderRadius: '1.25rem', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1.5rem', scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button 
            key={cat}
            className={`chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, border: 'none', borderRadius: '2rem', cursor: 'pointer', transition: 'all 0.3s', whiteSpace: 'nowrap' }}
          >
            {cat}
          </button>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#064e3b', marginBottom: '1.25rem' }}>
            {searchQuery ? `Search results for "${searchQuery}"` : 'Popular Destinations'}
          </h2>
          {filtered.length > 0 ? (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {filtered.map(dest => (
                <DestinationCard key={dest.name} {...dest} />
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
               <MapPin size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
               <p style={{ fontWeight: 600 }}>No destinations found. Try another search!</p>
            </div>
          )}
        </section>
      </AnimatePresence>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#064e3b', marginBottom: '1.25rem' }}>Upcoming Events</h2>
        <motion.div whileHover={{ scale: 1.02 }} className="card" style={{ display: 'flex', gap: '1rem', background: 'linear-gradient(135deg, #059669 0%, #064e3b 100%)', color: 'white', border: 'none', padding: '1.5rem' }}>
          <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.15)', borderRadius: '16px', height: 'fit-content', backdropFilter: 'blur(8px)' }}>
            <Calendar size={28} />
          </div>
          <div>
            <h4 style={{ color: 'white', marginBottom: '0.35rem', fontSize: '1.1rem', fontWeight: 700 }}>Shandur Polo Festival</h4>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '0.75rem', lineHeight: 1.4 }}>Experience the 'Kings' of Polo in Gilgit-Baltistan.</p>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'rgba(255,255,255,0.2)', padding: '0.4rem 0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.3)' }}>July 7 - 9, 2026</span>
          </div>
        </motion.div>
      </section>
    </motion.div>
  );
};

export default Explore;
