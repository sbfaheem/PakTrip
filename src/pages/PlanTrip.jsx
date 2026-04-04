import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Clock, TrendingUp, Plus, X, ChevronRight, Bell, Layers, Activity, Loader2, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Autocomplete, useJsApiLoader, GoogleMap, DirectionsRenderer } from '@react-google-maps/api';
import { useTrips } from '../context/TripContext';
import { useNavigate } from 'react-router-dom';

const libraries = ['places', 'geometry'];

const defaultCenter = { lat: 33.6844, lng: 73.0479 }; // Islamabad

const containerStyle = {
  width: '100%',
  height: '350px',
  borderRadius: '2.5rem',
  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
};

const PlanTrip = () => {
  const [from, setFrom] = useState('Islamabad, Capital Territory');
  const [to, setTo] = useState('Naran Valley, KP');
  const [bannerImage, setBannerImage] = useState('https://images.unsplash.com/photo-1548062005-e50d0639138c?q=80&w=2000&auto=format&fit=crop');
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [routeData, setRouteData] = useState({
    distance: '284 km',
    duration: '6h 45m',
    summary: 'Karakoram Highway',
    origin: 'ISLAMABAD',
    destination: 'NARAN'
  });
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Progress & Simulation State
  const [currentKm, setCurrentKm] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [decodedPath, setDecodedPath] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(defaultCenter);
  const [milestones, setMilestones] = useState([]);
  const [notification, setNotification] = useState({ message: '', visible: false });
  const [lastNotifiedMilestone, setLastNotifiedMilestone] = useState(null);
  
  const fromAutocompleteRef = useRef(null);
  const toAutocompleteRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useTrips();

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const calculateRoute = async () => {
    if (!from || !to || !window.google) return;
    
    setIsCalculating(true);
    const directionsService = new window.google.maps.DirectionsService();
    
    try {
      const result = await directionsService.route({
        origin: from,
        destination: to,
        travelMode: window.google.maps.TravelMode.DRIVING,
      });

      if (result.routes && result.routes[0]) {
        const route = result.routes[0].legs[0];
        
        // Decode path for tracking
        if (window.google.maps.geometry) {
           const path = window.google.maps.geometry.encoding.decodePath(result.routes[0].overview_polyline);
           setDecodedPath(path);
           setCurrentLocation({ lat: path[0].lat(), lng: path[0].lng() });
        }

        // Extract milestones (cities/towns) from directions steps
        const foundMilestones = [];
        let accumulatedDistance = 0;
        
        route.steps.forEach((step) => {
           accumulatedDistance += step.distance.value / 1000; // to km
           // Check for city names in instructions (e.g., "Pass by...", "Entering...", "Towards...")
           const match = step.instructions.match(/<b>(.*?)<\/b>/g);
           if (match && match.length > 0) {
              const cityName = match[match.length - 1].replace(/<\/?b>/g, '');
              if (cityName.length > 3 && !cityName.includes('Merge') && !cityName.includes('Exit')) {
                foundMilestones.push({ km: accumulatedDistance, name: cityName });
              }
           }
        });
        setMilestones(foundMilestones);

        setDirectionsResponse(result);
        setRouteData({
          distance: route.distance.text,
          duration: route.duration.text,
          summary: result.routes[0].summary || 'Main Route',
          origin: from.split(',')[0].toUpperCase(),
          destination: to.split(',')[0].toUpperCase()
        });
        setCurrentKm(0);
        setLastNotifiedMilestone(null);
      }
    } catch (error) {
      console.error("Directions request failed", error);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    if (isLoaded && from && to) {
      const timer = setTimeout(() => {
        calculateRoute();
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [from, to, isLoaded]);

  // Simulation Logic
  useEffect(() => {
    let interval;
    if (isSimulating && decodedPath.length > 0) {
      interval = setInterval(() => {
        const totalKm = parseFloat(routeData.distance.replace(/[^0-9.]/g, '')) || 100;
        
        setCurrentKm(prev => {
          const nextKm = prev + (totalKm / 150); // Speed: approx 150 ticks per trip
          
          if (nextKm >= totalKm) {
            setIsSimulating(false);
            return totalKm;
          }

          // Sync Map Location
          const progressRatio = nextKm / totalKm;
          const pathIndex = Math.floor(progressRatio * decodedPath.length);
          if (decodedPath[pathIndex]) {
             setCurrentLocation({ 
               lat: decodedPath[pathIndex].lat(), 
               lng: decodedPath[pathIndex].lng() 
             });
          }

          // Trigger Milestone Notifications
          const currentMilestone = milestones.find(m => 
             nextKm >= m.km && nextKm <= m.km + 10 && m.name !== lastNotifiedMilestone
          );
          if (currentMilestone) {
             setNotification({ message: `We are crossing ${currentMilestone.name}`, visible: true });
             setLastNotifiedMilestone(currentMilestone.name);
             setTimeout(() => setNotification(curr => ({ ...curr, visible: false })), 4000);
          }

          return nextKm;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isSimulating, decodedPath, routeData.distance, milestones, lastNotifiedMilestone]);

  const onFromPlaceChanged = () => {
    if (fromAutocompleteRef.current !== null) {
      const place = fromAutocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setFrom(place.formatted_address);
      }
    }
  };

  const onToPlaceChanged = () => {
    if (toAutocompleteRef.current !== null) {
      const place = toAutocompleteRef.current.getPlace();
      if (place.formatted_address) {
        setTo(place.formatted_address);
        
        // Update banner image from destination photo
        if (place.photos && place.photos.length > 0) {
          setBannerImage(place.photos[0].getUrl({ maxWidth: 2000 }));
        } else {
          setBannerImage(`https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200`);
        }
      }
    }
  };

  const currentDistanceValue = parseFloat(routeData.distance.replace(/[^0-9.]/g, '')) || 1;
  const progressPercent = Math.min((currentKm / currentDistanceValue) * 100, 100);

  if (loadError) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>Error loading maps. Check your connectivity or API key.</div>;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="app-container"
      style={{ padding: 0, background: '#f8fafc', minHeight: '100vh', position: 'relative' }}
    >
      {/* Dynamic Notification Toast */}
      <AnimatePresence>
        {notification.visible && (
          <motion.div 
            initial={{ y: -50, opacity: 0, x: '-50%' }}
            animate={{ y: 0, opacity: 1, x: '-50%' }}
            exit={{ y: -50, opacity: 0, x: '-50%' }}
            style={{ 
              position: 'fixed', top: '75px', left: '50%', zIndex: 100,
              background: 'white', padding: '0.875rem 1.25rem', borderRadius: '1.25rem',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '280px'
            }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Navigation size={16} color="#059669" />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#064e3b' }}>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

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
        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', position: 'relative' }}>
          <Bell size={20} color="#64748b" />
          <AnimatePresence>
            {notification.visible && (
              <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               exit={{ scale: 0 }}
               style={{ position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }} 
              />
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Hero Map/Photo Banner */}
      <div style={{ height: '55vh', position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.img 
            key={bannerImage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            src={bannerImage} 
            alt="Trip Destination" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        </AnimatePresence>
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
                {!isLoaded ? (
                  <div style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '1.25rem', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                    <Loader2 size={16} className="animate-spin" /> Loading Maps...
                  </div>
                ) : (
                  <Autocomplete
                    onLoad={(ref) => fromAutocompleteRef.current = ref}
                    onPlaceChanged={onFromPlaceChanged}
                  >
                    <input 
                      type="text" 
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      placeholder="Origin"
                      style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '1.25rem', background: '#f8fafc', border: '1px solid #f1f5f9', fontSize: '0.925rem', fontWeight: 600 }}
                    />
                  </Autocomplete>
                )}
                {from && <X size={16} color="#94a3b8" onClick={() => setFrom('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 10 }} />}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '22px', height: '22px', background: '#0284c7', borderRadius: '4px', zIndex: 1 }} />
              <div style={{ flex: 1, position: 'relative' }}>
                {!isLoaded ? (
                  <div style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '1.25rem', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8' }}>
                     <Loader2 size={16} className="animate-spin" /> Loading Maps...
                  </div>
                ) : (
                  <Autocomplete
                    onLoad={(ref) => toAutocompleteRef.current = ref}
                    onPlaceChanged={onToPlaceChanged}
                  >
                    <input 
                      type="text" 
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      placeholder="Destination"
                      style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '1.25rem', background: '#f8fafc', border: '1px solid #f1f5f9', fontSize: '0.925rem', fontWeight: 600 }}
                    />
                  </Autocomplete>
                )}
                {to && <X size={16} color="#94a3b8" onClick={() => setTo('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 10 }} />}
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
        <div style={{ 
          marginTop: '1.5rem', padding: '1.5rem', borderRadius: '2.5rem', 
          background: isCalculating ? 'rgba(6, 95, 70, 0.02)' : 'rgba(6, 95, 70, 0.05)', 
          border: '1px solid rgba(6, 95, 70, 0.1)', marginBottom: '1.5rem',
          transition: 'all 0.3s'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', opacity: isCalculating ? 0.5 : 1 }}>
            <div>
              <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Recommended Route</div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#064e3b', letterSpacing: '-0.02em' }}>{routeData.summary}</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              {isCalculating ? (
                <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem' }}>Calculating...</div>
              ) : (
                <>
                  <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.25rem' }}>{routeData.duration}</div>
                  <div style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 600 }}>{routeData.distance} total</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Controls */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
           <button 
           onClick={() => setIsSimulating(!isSimulating)}
           style={{ flex: 1, height: '48px', borderRadius: '1rem', background: isSimulating ? '#ef4444' : '#059669', color: 'white', border: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              {isSimulating ? <Pause size={18} /> : <Play size={18} />}
              {isSimulating ? 'Stop Trip' : 'Start Trip'}
           </button>
           <button 
           onClick={() => { setCurrentKm(0); setIsSimulating(false); setNotification({ message: '', visible: false }); }}
           style={{ width: '48px', height: '48px', borderRadius: '1rem', background: '#e2e8f0', color: '#475569', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RotateCcw size={18} />
           </button>
        </div>

        {/* Live Tracking Map Card */}
        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
          {isLoaded ? (
            <GoogleMap
               mapContainerStyle={containerStyle}
               center={currentLocation}
               zoom={16} 
               options={{
                 disableDefaultUI: true,
               }}
            >
              {directionsResponse && (
                <DirectionsRenderer 
                  directions={directionsResponse}
                  options={{
                    preserveViewport: true,
                    polylineOptions: {
                      strokeColor: "#059669",
                      strokeWeight: 6,
                      strokeOpacity: 0.8
                    },
                    markerOptions: {
                      visible: !isSimulating // Hide static markers when moving
                    }
                  }}
                />
              )}
            </GoogleMap>
          ) : (
            <div style={{ ...containerStyle, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Loader2 size={32} className="animate-spin" color="var(--primary)" />
             </div>
          )}
        </div>

        {/* Dynamic Tracking Card */}
        <div className="card" style={{ padding: '1.5rem', borderRadius: '2.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                   <div style={{ fontSize: '1rem', fontWeight: 800 }}>{isSimulating ? 72 : 0}</div>
                   <div style={{ fontSize: '0.5rem', opacity: 0.8, marginLeft: '2px' }}>KM/H</div>
                </div>
                <div>
                   <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-dark)' }}>
                      {progressPercent > 0 ? (progressPercent >= 100 ? 'Arrived!' : 'Cruising smoothly') : 'Ready to start'}
                   </div>
                   <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                      {notification.visible ? notification.message : (progressPercent > 80 && progressPercent < 100 ? `REACHING ${routeData.destination}` : 'ON HIGHWAY')}
                   </div>
                </div>
             </div>
             <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>Covered</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#065f46' }}>{currentKm.toFixed(0)} km</div>
             </div>
          </div>

          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                style={{ height: '100%', background: '#059669' }} 
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em' }}>
            <span>{routeData.origin}</span>
            <span>{routeData.destination}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PlanTrip;
