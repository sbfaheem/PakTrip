import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, X, Plus, ChevronRight, Navigation,
  Clock, Route, Trash2, GripVertical, ChevronDown, ArrowRight, Loader,
  ArrowUpDown, Dot, Image as ImageIcon, Map as MapIcon, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  useJsApiLoader, 
  GoogleMap, 
  Autocomplete, 
  DirectionsService, 
  DirectionsRenderer,
  Marker
} from '@react-google-maps/api';
import { useTrips } from '../context/TripContext';
import TripCostCalculator from '../components/TripCostCalculator';

/* ─── Premium Image Fallbacks ───────────────────────────────────────────── */
const CITY_IMAGES = {
  'Islamabad': 'file:///C:/Users/bilal/.gemini/antigravity/brain/76da3754-ca96-4225-af30-52ae64296c80/islamabad_skyline_1775309193622.png',
  'Hunza Valley': 'file:///C:/Users/bilal/.gemini/antigravity/brain/76da3754-ca96-4225-af30-52ae64296c80/hunza_attabad_lake_1775309209361.png',
  'Murree': 'file:///C:/Users/bilal/.gemini/antigravity/brain/76da3754-ca96-4225-af30-52ae64296c80/murree_hills_1775309226315.png',
  'Swat': 'file:///C:/Users/bilal/.gemini/antigravity/brain/76da3754-ca96-4225-af30-52ae64296c80/swat_valley_ushia_1775309249924.png',
  'Lahore': 'file:///C:/Users/bilal/.gemini/antigravity/brain/76da3754-ca96-4225-af30-52ae64296c80/lahore_badshahi_mosque_1775309264840.png',
  'Karachi': 'file:///C:/Users/bilal/.gemini/antigravity/brain/76da3754-ca96-4225-af30-52ae64296c80/karachi_mohatta_palace_1775309279441.png',
};

const NATURE_FALLBACK = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1200&auto=format&fit=crop';

const LIBRARIES = ['places'];
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

/* ─── Main Page ─────────────────────────────────────────────────── */
export default function PlanTrip() {
  const navigate = useNavigate();
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: LIBRARIES
  });

  // State
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [directions, setDirections] = useState(null);
  const { addTrip } = useTrips();
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState('');
  
  // Search Inputs
  const [qOrigin, setQOrigin] = useState('');
  const [qDest, setQDest] = useState('');

  const originAutocompleteRef = useRef(null);
  const destAutocompleteRef = useRef(null);
  const mapRef = useRef(null);

  // Extract Photo
  const getPlaceImage = (place) => {
    if (place.photos && place.photos.length > 0) {
      return place.photos[0].getUrl({ maxWidth: 1200 });
    }
    return CITY_IMAGES[place.name] || NATURE_FALLBACK;
  };

  // Handle Selection
  const onOriginSelect = () => {
    const place = originAutocompleteRef.current.getPlace();
    if (!place.geometry) return;
    
    setOrigin({
      name: place.name,
      formatted: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      image: getPlaceImage(place)
    });
    setQOrigin(place.formatted_address || place.name);
    setDirections(null);
  };

  const onDestSelect = () => {
    const place = destAutocompleteRef.current.getPlace();
    if (!place.geometry) return;
    
    setDestination({
      name: place.name,
      formatted: place.formatted_address,
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng(),
      image: getPlaceImage(place)
    });
    setQDest(place.formatted_address || place.name);
    setDirections(null);
  };

  // Route Directions
  const directionsCallback = useCallback((res) => {
    if (res !== null && res.status === 'OK') {
      setDirections(res);
      const leg = res.routes[0].legs[0];
      setDistance(leg.distance.value / 1000); 
      setDuration(leg.duration.text);
    }
  }, []);

  const swapLocations = () => {
    const tempO = origin;
    const tempQO = qOrigin;
    setOrigin(destination);
    setQOrigin(qDest);
    setDestination(tempO);
    setQDest(tempQO);
    setDirections(null);
  };

  if (loadError) {
    return (
      <div style={{ padding: '4rem 2rem', textAlign: 'center', background: '#fffcfc', borderRadius: '24px', border: '1px solid #fee2e2' }}>
        <AlertCircle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Maps Configuration Error</h2>
        <p style={{ color: '#991b1b', fontSize: '0.875rem' }}>Could not initialize Google Maps. Please verify your API Key in the environment settings.</p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '0.5rem 0 2rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
         <div style={{ padding: '0.6rem', background: '#ecfdf5', borderRadius: '12px' }}>
            <MapIcon size={24} color="var(--primary)" />
         </div>
         <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2px' }}>Smart Trip Planner</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Powered by Google Maps for precise routes.</p>
         </div>
      </div>

      {/* Main Route Selections Card */}
      <div className="card" style={{ padding: '1.5rem', position: 'relative', marginBottom: '1.5rem' }}>
         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            {/* Visual Indicator Trace */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem', padding: '1rem 0' }}>
               <div style={{ width: '14px', height: '14px', borderRadius: '50%', border: '2px solid var(--primary)', background: '#fff' }} />
               <div style={{ width: '2px', height: '50px', background: 'linear-gradient(to bottom, var(--primary) 0%, #e5e7eb 100%)', borderRadius: '1px' }} />
               <MapPin size={18} color="#ef4444" fill="#ef4444" />
            </div>

            {/* Inputs Container */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
               {isLoaded ? (
                  <>
                     <Autocomplete 
                        onLoad={ref => originAutocompleteRef.current = ref} 
                        onPlaceChanged={onOriginSelect}
                        options={{ componentRestrictions: { country: 'pk' } }}
                     >
                        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '12px', padding: '0.85rem 1rem', border: `2px solid ${!origin ? 'var(--primary)' : '#e5e7eb'}` }}>
                           <input
                              type="text"
                              value={qOrigin}
                              onChange={(e) => setQOrigin(e.target.value)}
                              placeholder="Choose starting point..."
                              style={{ border: 'none', outline: 'none', fontSize: '0.9375rem', width: '100%', fontWeight: 500 }}
                           />
                           {qOrigin && <X size={16} onClick={() => { setOrigin(null); setQOrigin(''); setDirections(null); }} style={{ cursor: 'pointer', color: '#9ca3af' }} />}
                        </div>
                     </Autocomplete>

                     <Autocomplete 
                        onLoad={ref => destAutocompleteRef.current = ref} 
                        onPlaceChanged={onDestSelect}
                        options={{ componentRestrictions: { country: 'pk' } }}
                     >
                        <div style={{ display: 'flex', alignItems: 'center', background: '#fff', borderRadius: '12px', padding: '0.85rem 1rem', border: `2px solid ${origin && !destination ? 'var(--primary)' : '#e5e7eb'}` }}>
                           <input
                              type="text"
                              value={qDest}
                              onChange={(e) => setQDest(e.target.value)}
                              placeholder="Choose destination..."
                              style={{ border: 'none', outline: 'none', fontSize: '0.9375rem', width: '100%', fontWeight: 500 }}
                           />
                           {qDest && <X size={16} onClick={() => { setDestination(null); setQDest(''); setDirections(null); }} style={{ cursor: 'pointer', color: '#9ca3af' }} />}
                        </div>
                     </Autocomplete>
                  </>
               ) : (
                  <div style={{ height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                     <Loader size={20} className="spin" />
                  </div>
               )}
            </div>

            {/* Swap Button */}
            <motion.button
               whileHover={{ scale: 1.1 }}
               whileTap={{ scale: 0.9 }}
               onClick={swapLocations}
               style={{
                  background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '10px',
                  padding: '0.75rem', cursor: 'pointer', color: 'var(--text-dark)'
               }}
            >
               <ArrowUpDown size={18} />
            </motion.button>
         </div>
      </div>

      {/* Visual Route Map */}
      <motion.div
         layout
         className="card"
         style={{ padding: '0', overflow: 'hidden', height: destination || origin ? '350px' : '0', marginBottom: destination || origin ? '1.5rem' : '0', opacity: destination || origin ? 1 : 0, transition: 'all 0.4s' }}
      >
         {isLoaded && (destination || origin) && (
            <GoogleMap
               onLoad={map => mapRef.current = map}
               center={origin ? { lat: origin.lat, lng: origin.lng } : (destination ? { lat: destination.lat, lng: destination.lng } : { lat: 33.6844, lng: 73.0479 })}
               zoom={12}
               mapContainerStyle={{ width: '100%', height: '100%' }}
               options={{
                  disableDefaultUI: true,
                  styles: [
                     { featureType: "all", elementType: "labels.text.fill", stylers: [{ color: "#334155" }] },
                     { featureType: "landscape", stylers: [{ color: "#f8fafc" }] },
                     { featureType: "road", stylers: [{ color: "#ffffff" }] },
                     { featureType: "water", stylers: [{ color: "#e2e8f0" }] }
                  ]
               }}
            >
               {origin && <Marker position={{ lat: origin.lat, lng: origin.lng }} label={{ text: 'A', color: '#fff', fontWeight: 'bold' }} />}
               {destination && <Marker position={{ lat: destination.lat, lng: destination.lng }} label={{ text: 'B', color: '#fff', fontWeight: 'bold' }} />}
               
               {origin && destination && !directions && (
                  <DirectionsService
                     options={{
                        origin: { lat: origin.lat, lng: origin.lng },
                        destination: { lat: destination.lat, lng: destination.lng },
                        travelMode: 'DRIVING'
                     }}
                     callback={directionsCallback}
                  />
               )}
               {directions && <DirectionsRenderer directions={directions} options={{ suppressMarkers: true, polylineOptions: { strokeColor: 'var(--primary)', strokeWeight: 5, strokeOpacity: 0.8 } }} />}
            </GoogleMap>
         )}
      </motion.div>

      {/* Destination Performance Card */}
      <AnimatePresence>
         {destination && (
            <motion.div
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               exit={{ opacity: 0, y: 20 }}
               className="card"
               style={{ padding: '0', overflow: 'hidden', marginBottom: '1.5rem' }}
            >
               <div style={{ position: 'relative', height: '220px' }}>
                  <img src={destination.image} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={destination.name} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 50%)' }} />
                  <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem', color: '#fff' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px', opacity: 0.8 }}>
                        <MapPin size={14} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Final Destination</span>
                     </div>
                     <h3 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '2px', letterSpacing: '-0.02em' }}>{destination.name}</h3>
                     <p style={{ fontSize: '0.85rem', opacity: 0.8, color: '#e2e8f0' }}>{destination.formatted}</p>
                  </div>
               </div>
               <div style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
                  <div style={{ display: 'flex', gap: '2rem' }}>
                     <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '4px' }}>
                           <Route size={14} color="var(--primary)" />
                           <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Road distance</span>
                        </div>
                        <div style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '1.125rem' }}>{Math.round(distance)} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>km</span></div>
                     </div>
                     <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '4px' }}>
                           <Clock size={14} color="var(--primary)" />
                           <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>Driving time</span>
                        </div>
                        <div style={{ fontWeight: 800, color: 'var(--text-dark)', fontSize: '1.125rem' }}>{duration || '...'}</div>
                     </div>
                  </div>
                  <button 
                    onClick={() => { setDestination(null); setQDest(''); setDirections(null); }} 
                    style={{ 
                      padding: '0.6rem 1rem', borderRadius: '10px', background: '#fee2e2', 
                      color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 700,
                      fontSize: '0.85rem'
                    }}
                  >
                     Reset
                  </button>
               </div>
            </motion.div>
         )}
      </AnimatePresence>

      {/* Cost Calculator Section */}
      {origin && destination && (
         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <TripCostCalculator distanceKm={distance} />
            <div style={{ height: '1.5rem' }} />
            <motion.button
               whileTap={{ scale: 0.98 }}
               className="btn-primary"
               onClick={() => {
                 addTrip({
                   name: destination.name,
                   status: 'In Progress',
                   region: 'Pakistan', // Default or parsed from formatted
                   date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                   distance: Math.round(distance),
                   image: destination.image
                 });
                 navigate('/tracking');
               }}
               style={{ width: '100%', padding: '1.1rem', fontSize: '1rem', boxShadow: '0 8px 32px -4px #065f4640' }}
            >
               <Navigation size={20} /> Start Trip to {destination.name}
            </motion.button>
         </motion.div>
      )}

      {/* Initial Empty State */}
      {!origin && !destination && (
         <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🕌</div>
          <h3 style={{ marginBottom: '0.5rem', color: 'var(--text-dark)', fontWeight: 800, fontSize: '1.5rem' }}>Explore Pakistan</h3>
          <p style={{ fontSize: '0.9375rem', maxWidth: '300px', margin: '0 auto', lineHeight: 1.5 }}>Search for any location in Pakistan to start mapping your journey with live route data.</p>
         </div>
      )}

      <style>{`
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </motion.div>
  );
}
