import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Clock, TrendingUp, Fuel, Plus, X, ChevronRight, Bell, Layers, Activity, Loader2, Play, Pause, RotateCcw, CheckCircle2, Trash2, LocateFixed } from 'lucide-react';
import { Autocomplete, useJsApiLoader, GoogleMap, DirectionsRenderer, Marker } from '@react-google-maps/api';
import { useTrips } from '../context/TripContext';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const [stops, setStops] = useState([]); // Array of intermediate locations
  const [bannerImage, setBannerImage] = useState('https://images.unsplash.com/photo-1548062005-e50d0639138c?q=80&w=2000&auto=format&fit=crop');
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [routeData, setRouteData] = useState({
    distance: '284 km',
    duration: '6h 45m',
    summary: 'Karakoram Highway',
    origin: 'ISLAMABAD',
    destination: 'NARAN',
    fuelNeed: 0,
    estCost: 0,
    petrolPrice: 378.41,
    tollCost: 0
  });
  const [isCalculating, setIsCalculating] = useState(false);
  
  // Progress & Tracking State
  const [isLive, setIsLive] = useState(false); // Live tracking mode
  const [decodedPath, setDecodedPath] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(defaultCenter);
  const [currentKm, setCurrentKm] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [notification, setNotification] = useState({ message: '', visible: false });
  const [lastNotifiedMilestone, setLastNotifiedMilestone] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [tripSummaryData, setTripSummaryData] = useState(null);
  
  const fromAutocompleteRef = useRef(null);
  const toAutocompleteRef = useRef(null);
  const stopRefs = useRef([]); // Ref for dynamic stop autocompletes
  const watchId = useRef(null); // Ref for geolocation watch ID

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useTrips() || { user: {} };

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries
  });

  const calculateRoute = async () => {
    if (!from || !to || !window.google) return;
    
    setIsCalculating(true);
    const directionsService = new window.google.maps.DirectionsService();
    
    // Format waypoints for Google Directions API
    const waypoints = stops
      .filter(s => s.address && s.address.trim() !== '')
      .map(s => ({
        location: s.address,
        stopover: true
      }));

    try {
      const result = await directionsService.route({
        origin: from,
        destination: to,
        waypoints: waypoints,
        optimizeWaypoints: true,
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

        // Extract milestones from all legs
        const foundMilestones = [];
        let accumulatedDistance = 0;
        
        const roadExcludeRegex = /\b(Rd|Road|Highway|Hwy|Bypass|Interchange|Exit|Merge|Turn|Lane|Way|Bridge|Flyover|Street|St|Entry|Ramp|North|South|East|West|M-\d+|N-\d+|Intersection|Motorway|Expressway)\b/i;
        
        result.routes[0].legs.forEach((leg) => {
          leg.steps.forEach((step) => {
            accumulatedDistance += step.distance.value / 1000;
            const match = step.instructions.match(/<b>(.*?)<\/b>/g);
            if (match && match.length > 0) {
              const cityName = match[match.length - 1].replace(/<\/?b>/g, '');
              
              // Filter out road names, numbers, and navigation commands
              const isExclude = roadExcludeRegex.test(cityName);
              const isNumber = /^\d+/.test(cityName); // e.g. "1st exit"
              
              if (cityName.length > 2 && !isExclude && !isNumber) {
                foundMilestones.push({ km: accumulatedDistance, name: cityName });
              }
            }
          });
        });
        setMilestones(foundMilestones);

        setDirectionsResponse(result);
        
        // Calculate total distance/duration across all legs
        const totalDistance = result.routes[0].legs.reduce((acc, leg) => acc + leg.distance.value, 0);
        const totalDuration = result.routes[0].legs.reduce((acc, leg) => acc + leg.duration.value, 0);

        const petrolPrice = 378.41; // PKR per Liter (Latest Pakistan Rate)
        const fuelLiters = (totalDistance / 1000) / 12; // 12km/L average as requested
        const tollEstimate = 500 + ((totalDistance/1000) * 1.5); // 500 base + 1.5/km

        setRouteData({
          distance: `${(totalDistance / 1000).toFixed(0)} km`,
          duration: `${Math.floor(totalDuration / 3600)}h ${Math.floor((totalDuration % 3600) / 60)}m`,
          summary: result.routes[0].summary || 'Main Route',
          origin: from.split(',')[0].toUpperCase(),
          destination: to.split(',')[0].toUpperCase(),
          fuelNeed: fuelLiters.toFixed(1),
          estCost: Math.round((fuelLiters * petrolPrice) + tollEstimate),
          petrolPrice,
          tollCost: Math.round(tollEstimate)
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
    // If arriving from Explore/Home with a pre-selected destination
    if (location.state?.destination) {
      setTo(location.state.destination);
      // Optional: auto-trigger search if you have a way to get coords from name
    }

    if (activeTrip && activeTrip.status === 'In Progress') {
      const timer = setTimeout(() => {
        calculateRoute();
      }, 500); 
      return () => clearTimeout(timer);
    }
  }, [from, to, stops, isLoaded]);

  // Live Geolocation Tracking
  const toggleLiveTracking = () => {
    if (isLive) {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      setIsLive(false);
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLive(true);
    
    watchId.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed } = position.coords;
        const newPos = { lat: latitude, lng: longitude };
        setCurrentLocation(newPos);
        
        // Update speed (convert m/s to km/h)
        if (speed !== null && speed !== undefined) {
          setCurrentSpeed(Math.round(speed * 3.6));
        } else {
          setCurrentSpeed(0);
        }
        
        // Calculate progress based on nearest point in decodedPath
        if (decodedPath.length > 0 && window.google) {
           const totalKm = parseFloat(routeData.distance.replace(/[^0-9.]/g, '')) || 100;
           
           // Find distance from origin to current point (simplified)
           const originPos = decodedPath[0];
           const distanceInMeters = window.google.maps.geometry.spherical.computeDistanceBetween(
             new window.google.maps.LatLng(originPos.lat(), originPos.lng()),
             new window.google.maps.LatLng(latitude, longitude)
           );
           
           const coveredKm = distanceInMeters / 1000;
           setCurrentKm(coveredKm);

           // Track next milestone distance
           const nextMilestone = milestones.find(m => m.km > coveredKm);
           const distToNext = nextMilestone ? Math.round(nextMilestone.km - coveredKm) : 0;

           const currentMilestone = milestones.find(
              m => coveredKm >= m.km && coveredKm <= m.km + 5 && m.name !== lastNotifiedMilestone
           );
           if (currentMilestone) {
              setNotification({ message: `We have arrived ${currentMilestone.name}`, visible: true, nextStop: nextMilestone ? { name: nextMilestone.name, dist: distToNext } : null });
              setLastNotifiedMilestone(currentMilestone.name);
              setTimeout(() => setNotification(curr => ({ ...curr, visible: false })), 4000);
           }
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsLive(false);
        alert("Unable to retrieve your location. Check your permissions.");
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
    );
  };

  // Cleanup geolocation on unmount
  useEffect(() => {
    return () => {
      if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    };
  }, []);

  const addStop = () => {
    setStops([...stops, { id: Math.random().toString(36).substr(2, 9), address: '' }]);
  };

  const removeStop = (id) => {
    setStops(stops.filter(s => s.id !== id));
  };

  const onStopChanged = (id) => {
    const index = stops.findIndex(s => s.id === id);
    if (index === -1) return;
    
    const autocomplete = stopRefs.current[id];
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.formatted_address) {
        const newStops = [...stops];
        newStops[index] = { ...newStops[index], address: place.formatted_address };
        setStops(newStops);
      }
    }
  };

  const finishTrip = () => {
    const totalDist = parseFloat(routeData.distance.replace(/[^0-9.]/g, '')) || 0;
    const summary = {
      ...routeData,
      date: new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      stops: stops.length,
      activities: [
        { name: 'Trip Started', time: 'Initial' },
        ...stops.map((s, i) => ({ name: `Stop: ${s.address.split(',')[0]}`, time: 'Visit' })),
        { name: 'Destination Arrival', time: new Date().toLocaleTimeString() }
      ]
    };
    
    // Add Meal logic
    const hour = new Date().getHours();
    if (hour >= 12 && hour <= 15) summary.activities.push({ name: 'Lunch break taken', time: '1:30 PM' });
    if (hour >= 19 && hour <= 22) summary.activities.push({ name: 'Dinner break taken', time: '8:45 PM' });
    
    setTripSummaryData(summary);
    setShowSummary(true);
    completeTrip(summary);
    setIsLive(false);
    if(watchId.current) navigator.geolocation.clearWatch(watchId.current);
  };

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="app-container" style={{ padding: 0, background: '#f8fafc', minHeight: '100vh', position: 'relative' }}>
      {/* Dynamic Notification Toast */}
      <AnimatePresence>
        {notification.visible && (
          <motion.div initial={{ y: -50, opacity: 0, x: '-50%' }} animate={{ y: 0, opacity: 1, x: '-50%' }} exit={{ y: -50, opacity: 0, x: '-50%' }}
            style={{ position: 'fixed', top: '75px', left: '50%', zIndex: 100, background: 'white', padding: '0.875rem 1.25rem', borderRadius: '1.25rem', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: '280px' }}
          >
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Navigation size={16} color="#059669" />
            </div>
            <span style={{ fontSize: '0.875rem', fontWeight: 700, color: '#064e3b' }}>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <header style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', background: 'linear-gradient(to bottom, rgba(255,255,255,0.9), transparent)' }}>
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
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} style={{ position: 'absolute', top: '8px', right: '8px', width: '10px', height: '10px', background: '#ef4444', borderRadius: '50%', border: '2px solid white' }} />
            )}
          </AnimatePresence>
        </div>
      </header>

      <div style={{ height: '55vh', position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.img key={bannerImage} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} src={bannerImage} alt="Trip Destination" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </AnimatePresence>
      </div>

      <div style={{ padding: '0 1.25rem', marginTop: '-120px', position: 'relative', zIndex: 20 }}>
        <div className="card" style={{ padding: '1.5rem', borderRadius: '2.5rem', background: 'white', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative' }}>
            <div style={{ position: 'absolute', left: '10px', top: '24px', bottom: '24px', width: '2px', background: '#e2e8f0' }} />
            
            {/* Origin */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '3px solid #059669', background: 'white', zIndex: 1 }} />
              <div style={{ flex: 1, position: 'relative' }}>
                {isLoaded && (
                  <Autocomplete onLoad={ref => fromAutocompleteRef.current = ref} onPlaceChanged={onFromPlaceChanged}>
                    <input type="text" value={from} onChange={e => setFrom(e.target.value)} placeholder="Origin"
                      style={{ width: '100%', padding: '0.875rem 2.5rem 0.875rem 1rem', borderRadius: '1.25rem', background: '#f8fafc', border: '1px solid #f1f5f9', fontSize: '0.925rem', fontWeight: 600 }}
                    />
                  </Autocomplete>
                )}
                {from && (
                  <X size={16} color="#94a3b8" onClick={() => setFrom('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 10 }} />
                )}
              </div>
            </div>

            {/* Dynamic Stops */}
            <AnimatePresence>
              {stops.map((stop) => (
                <motion.div key={stop.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.8 }} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '22px', height: '22px', border: '3px solid #94a3b8', borderRadius: '50%', background: 'white', zIndex: 1 }} />
                  <div style={{ flex: 1, position: 'relative' }}>
                    {isLoaded && (
                      <Autocomplete onLoad={ref => stopRefs.current[stop.id] = ref} onPlaceChanged={() => onStopChanged(stop.id)}>
                        <input type="text" value={stop.address} onChange={e => {
                          const newStops = [...stops];
                          const idx = newStops.findIndex(s => s.id === stop.id);
                          newStops[idx].address = e.target.value;
                          setStops(newStops);
                        }} placeholder="Intermediate Stop"
                          style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '1.25rem', background: '#fffbeb', border: '1px solid #fef3c7', fontSize: '0.925rem', fontWeight: 600 }}
                        />
                      </Autocomplete>
                    )}
                    <Trash2 size={16} color="#ef4444" onClick={() => removeStop(stop.id)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 10 }} />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Destination */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: '22px', height: '22px', background: '#0284c7', borderRadius: '4px', zIndex: 1 }} />
              <div style={{ flex: 1, position: 'relative' }}>
                {isLoaded && (
                  <Autocomplete onLoad={ref => toAutocompleteRef.current = ref} onPlaceChanged={onToPlaceChanged}>
                    <input type="text" value={to} onChange={e => setTo(e.target.value)} placeholder="Destination"
                      style={{ width: '100%', padding: '0.875rem 2.5rem 0.875rem 1rem', borderRadius: '1.25rem', background: '#f0fdf4', border: '1px solid #dcfce7', fontSize: '0.925rem', fontWeight: 600 }}
                    />
                  </Autocomplete>
                )}
                {to && (
                  <X size={16} color="#94a3b8" onClick={() => setTo('')} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', zIndex: 10 }} />
                )}
              </div>
            </div>

            <button onClick={addStop} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', padding: '1rem', color: '#059669', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer', outline: 'none', transition: 'transform 0.2s' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2.5px solid #059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={16} strokeWidth={3} />
              </div>
              Add Stop
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1.5rem', borderRadius: '2.5rem', background: isCalculating ? 'rgba(6, 95, 70, 0.02)' : 'rgba(6, 95, 70, 0.05)', border: '1px solid rgba(6, 95, 70, 0.1)', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Recommended Route</div>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#064e3b', letterSpacing: '-0.02em' }}>{routeData.summary}</h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.25rem' }}>{routeData.duration}</div>
              <div style={{ fontSize: '0.825rem', color: '#64748b', fontWeight: 600 }}>{routeData.distance} total</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="card" style={{ flex: 1, padding: '1.25rem', borderRadius: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(5, 150, 105, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#059669' }}>
               <Fuel size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Fuel Need</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-dark)' }}>{routeData.fuelNeed} Liters</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', margin: '2px 0' }}>Rs. {routeData.petrolPrice} / Liter</div>
              <div style={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 500 }}>Based on Average as 12 km/liter</div>
            </div>
          </div>
          <div className="card" style={{ flex: 1, padding: '1.25rem', borderRadius: '2rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(3, 105, 161, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0369a1' }}>
               <TrendingUp size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Est. Cost</div>
              <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text-dark)' }}>Rs. {routeData.estCost.toLocaleString()}</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0369a1', margin: '2px 0' }}>Tolls: Rs. {routeData.tollCost.toLocaleString()}</div>
              <div style={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 500 }}>Fuel + Tolls included</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
           <button 
             onClick={toggleLiveTracking}
             style={{ 
               flex: 1, 
               height: '56px', 
               borderRadius: '1.25rem', 
               background: isLive ? '#ef4444' : '#059669', 
               color: 'white', 
               border: 'none', 
               fontWeight: 800, 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'center', 
               gap: '0.75rem',
               boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.3)',
               fontSize: '1.15rem'
             }}
           >
              {isLive ? <Pause size={24} /> : <LocateFixed size={24} />}
              {isLive ? 'Stop Tracking' : 'Start Live Trip'}
           </button>
           {progressPercent >= 100 && (
             <button 
               onClick={finishTrip}
               style={{ 
                 flex: 1, 
                 height: '56px', 
                 borderRadius: '1.25rem', 
                 background: 'linear-gradient(135deg, #059669, #065f46)', 
                 color: 'white', 
                 border: 'none', 
                 fontWeight: 800, 
                 display: 'flex', 
                 alignItems: 'center', 
                 justifyContent: 'center', 
                 gap: '0.75rem',
                 boxShadow: '0 10px 15px -3px rgba(5, 150, 105, 0.4)',
                 fontSize: '1.15rem'
               }}
             >
                🏆 Finish Trip
             </button>
           )}
           <button 
             onClick={() => { 
               setCurrentKm(0); 
               setIsLive(false); 
               if(watchId.current) navigator.geolocation.clearWatch(watchId.current); 
             }}
             style={{ width: '56px', height: '56px', borderRadius: '1.25rem', background: '#f1f5f9', color: '#64748b', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
           >
              <RotateCcw size={20} />
           </button>
        </div>

        <div style={{ marginBottom: '1.5rem', position: 'relative' }}>
          {isLoaded ? (
            <GoogleMap mapContainerStyle={containerStyle} center={currentLocation} zoom={16} options={{ disableDefaultUI: true }}>
              {directionsResponse && <DirectionsRenderer directions={directionsResponse} options={{ preserveViewport: true, polylineOptions: { strokeColor: "#059669", strokeWeight: 6, strokeOpacity: 0.8 }, markerOptions: { visible: true }}} />}
              {isLive && <Marker position={currentLocation} icon={{ path: window.google.maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#3b82f6', fillOpacity: 1, strokeColor: 'white', strokeWeight: 2 }} />}
            </GoogleMap>
          ) : (
            <div style={{ ...containerStyle, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 size={32} className="animate-spin" color="var(--primary)" /></div>
          )}
        </div>

        <div className="card" style={{ padding: '1.5rem', borderRadius: '2.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                   <div style={{ fontSize: '1rem', fontWeight: 800 }}>{isLive ? currentSpeed : 0}</div>
                   <div style={{ fontSize: '0.5rem', opacity: 0.8, marginLeft: '2px' }}>KM/H</div>
                </div>
                <div>
                   <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-dark)' }}>
                      {progressPercent >= 100 ? 'You have reached your destination!' : 'Cruising smoothly'}
                   </div>
                   <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase' }}>
                      {progressPercent >= 100 ? 'TRIP COMPLETED' : `ON ${routeData.summary.toUpperCase()}`}
                   </div>
                </div>
             </div>
             
             {isLive && progressPercent < 100 && (
               <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700 }}>Next Stop</div>
                  <div style={{ fontSize: '0.825rem', fontWeight: 800, color: '#059669' }}>
                    {milestones.find(m => m.km > currentKm)?.name || routeData.destination} • {Math.max(0, Math.round((milestones.find(m => m.km > currentKm)?.km || (parseFloat(routeData.distance.replace(/[^0-9.]/g, '')))) - currentKm))}km
                  </div>
               </div>
             )}
          </div>
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} style={{ height: '100%', background: '#059669' }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', letterSpacing: '0.1em' }}>
            <span>{routeData.origin}</span>
            <span>{routeData.destination}</span>
          </div>
        </div>
      </div>

       {/* Trip Summary Modal (Email Mock) */}
       <AnimatePresence>
         {showSummary && (
           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
             style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
           >
             <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
               style={{ background: 'white', width: '100%', maxWidth: '450px', borderRadius: '2.5rem', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
             >
               <div style={{ background: 'var(--primary)', padding: '2rem 1.5rem', color: 'white', textAlign: 'center' }}>
                 <CheckCircle2 size={48} style={{ marginBottom: '1rem' }} />
                 <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Trip Summary</h2>
                 <p style={{ fontSize: '0.875rem', opacity: 0.9 }}>Report sent to {user.email}</p>
               </div>
               <div style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px dashed #e2e8f0', paddingBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Date</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{tripSummaryData?.date}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>Time</div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>{tripSummaryData?.time}</div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div style={{ flex: 1, padding: '1rem', background: '#f8fafc', borderRadius: '1.25rem' }}>
                        <div style={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 800 }}>DISTANCE</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>{tripSummaryData?.distance}</div>
                    </div>
                    <div style={{ flex: 1, padding: '1rem', background: '#f8fafc', borderRadius: '1.25rem' }}>
                        <div style={{ fontSize: '0.625rem', color: '#94a3b8', fontWeight: 800 }}>TOTAL COST</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>Rs. {tripSummaryData?.estCost}</div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#064e3b', marginBottom: '0.75rem' }}>Activity Timeline</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {tripSummaryData?.activities.map((act, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>{act.name}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>{act.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => { setShowSummary(false); navigate('/profile'); }}
                    style={{ width: '100%', padding: '1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '1.25rem', fontWeight: 800, fontSize: '1rem', cursor: 'pointer' }}
                  >
                    View Overall Profile
                  </button>
               </div>
             </motion.div>
           </motion.div>
         )}
       </AnimatePresence>
    </motion.div>
  );
};

export default PlanTrip;
