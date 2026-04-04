import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useJsApiLoader, Autocomplete } from '@react-google-maps/api';
import { Loader2 } from 'lucide-react';

const libraries = ['places'];

const DestinationCard = ({ name, location, rating, image, price, onClick }) => {
  const [imgError, setImgError] = React.useState(false);
  const fallbackImg = "https://images.unsplash.com/photo-1549127013-35304597b199?q=80&w=800&auto=format&fit=crop";

  return (
    <motion.div 
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="card" 
      style={{ padding: 0, overflow: 'hidden', marginBottom: '1.5rem', cursor: 'pointer' }}
      onClick={onClick}
    >
      <div style={{ height: '180px', position: 'relative', background: '#f1f5f9' }}>
        <img 
          src={imgError ? fallbackImg : image} 
          alt={name} 
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{ 
          position: 'absolute', top: '12px', right: '12px', 
          background: 'rgba(255,255,255,0.95)', padding: '0.4rem 0.6rem', 
          borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '0.35rem', 
          fontSize: '0.75rem', fontWeight: 700, backdropFilter: 'blur(4px)',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
          zIndex: 5
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
};

const Explore = () => {
  const navigate = useNavigate();
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [autocomplete, setAutocomplete] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [categoryResults, setCategoryResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const fetchCategoryResults = (category) => {
    if (!isLoaded || category === 'All') {
      setCategoryResults([]);
      return;
    }

    setIsSearching(true);
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    const request = {
      query: `${category} in Pakistan`,
      fields: ['name', 'formatted_address', 'rating', 'photos'],
    };

    service.textSearch(request, (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && results) {
        const parsed = results.map(place => ({
          name: place.name,
          location: place.formatted_address,
          rating: place.rating || '4.5',
          price: '5,000+',
          cat: category,
          image: place.photos ? place.photos[0].getUrl({ maxWidth: 800 }) : 'https://images.unsplash.com/photo-1549127013-35304597b199?q=80&w=800&auto=format&fit=crop'
        }));
        setCategoryResults(parsed.slice(0, 12));
      }
      setIsSearching(false);
    });
  };

  const handleCategoryClick = (cat) => {
    setActiveCategory(cat);
    setSelectedPlace(null);
    if (cat === 'All') {
      fetchCategoryResults('Famous tourist places');
    } else {
      fetchCategoryResults(cat);
    }
  };

  // Initial load
  React.useEffect(() => {
    if (isLoaded && activeCategory === 'All') {
      fetchCategoryResults('Famous tourist places');
    }
  }, [isLoaded]);

  const onPlaceChanged = () => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        setSelectedPlace({
          name: place.name || place.formatted_address,
          location: place.formatted_address,
          rating: place.rating || '4.5',
          price: '8,000+', // Estimated base
          cat: 'Explore',
          image: place.photos ? place.photos[0].getUrl({ maxWidth: 1200 }) : 'https://images.unsplash.com/photo-1549127013-35304597b199?q=80&w=800&auto=format&fit=crop'
        });
        setActiveCategory('All');
      }
    }
  };
  
  const categories = ['All', 'Mountains', 'Beaches', 'Desert', 'Culture', 'Hotels', 'Adventure'];

  const destinations = [
    { name: "Hunza Valley", location: "Gilgit-Baltistan", rating: "4.9", price: "25,000", cat: "Mountains", image: "https://images.unsplash.com/photo-1549127013-35304597b199?q=80&w=800&auto=format&fit=crop" },
    { name: "Skardu Desert", location: "Gilgit-Baltistan", rating: "4.8", price: "32,000", cat: "Adventure", image: "https://images.unsplash.com/photo-1627915570116-654cb249e755?q=80&w=800&auto=format&fit=crop" },
    { name: "Kund Malir", location: "Balochistan", rating: "4.7", price: "12,000", cat: "Beaches", image: "https://images.unsplash.com/photo-1621245084196-1ab4cd40f5a5?q=80&w=800&auto=format&fit=crop" },
    { name: "Naran Valley", location: "KPK", rating: "4.6", price: "18,000", cat: "Mountains", image: "https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?q=80&w=800&auto=format&fit=crop" },
    { name: "Mohenjo-daro", location: "Sindh", rating: "4.5", price: "8,500", cat: "Culture", image: "https://images.unsplash.com/photo-1517332219460-6cc447a1f9e2?q=80&w=800&auto=format&fit=crop" }
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
        <Search style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', zIndex: 10 }} size={20} />
        {isLoaded ? (
          <Autocomplete 
            onLoad={setAutocomplete} 
            onPlaceChanged={onPlaceChanged}
            options={{ componentRestrictions: { country: 'pk' } }}
          >
            <input 
              type="text" 
              placeholder="Where to next?" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '1.15rem 1rem 1.15rem 3rem', borderRadius: '1.25rem', border: '1px solid #e2e8f0', fontSize: '1rem', outline: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}
            />
          </Autocomplete>
        ) : (
          <div style={{ width: '100%', padding: '1.15rem 1rem 1.15rem 3rem', borderRadius: '1.25rem', border: '1px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Loader2 size={16} className="animate-spin" /> Loading Maps Search...
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '1.5rem', scrollbarWidth: 'none' }}>
        {categories.map(cat => (
          <button 
            key={cat}
            className={`chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => handleCategoryClick(cat)}
            style={{ padding: '0.6rem 1.25rem', fontSize: '0.875rem', fontWeight: 600, border: 'none', borderRadius: '2rem', cursor: 'pointer', transition: 'all 0.3s', whiteSpace: 'nowrap' }}
          >
            {cat}
          </button>
        ))}
      </div>

      <AnimatePresence mode="popLayout">
        <section style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#064e3b', marginBottom: '1.25rem' }}>
            {selectedPlace ? 'Top Match' : (activeCategory !== 'All' ? `${activeCategory} in Pakistan` : (searchQuery ? `Search results for "${searchQuery}"` : 'Discover Pakistan'))}
          </h2>
          {isSearching ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--primary)' }}>
               <Loader2 size={48} className="animate-spin" style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
               <p style={{ fontWeight: 600, fontSize: '1.1rem' }}>Sourcing Top {activeCategory} Experiences...</p>
            </div>
          ) : selectedPlace ? (
            <div style={{ marginBottom: '2rem' }}>
               <DestinationCard 
                 {...selectedPlace} 
                 onClick={() => navigate('/plan', { state: { destination: selectedPlace.name } })}
               />
               <button onClick={() => setSelectedPlace(null)} style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--primary)', border: 'none', background: 'none', padding: 0 }}>Clear Results</button>
            </div>
          ) : categoryResults.length > 0 ? (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {categoryResults.map((dest, idx) => (
                <DestinationCard 
                  key={dest.name + idx} 
                  {...dest} 
                  onClick={() => navigate('/plan', { state: { destination: dest.name } })}
                />
              ))}
            </div>
          ) : filtered.length > 0 && activeCategory === 'None' ? (
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              {filtered.map(dest => (
                <DestinationCard 
                  key={dest.name} 
                  {...dest} 
                  onClick={() => navigate('/plan', { state: { destination: dest.name } })}
                />
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
