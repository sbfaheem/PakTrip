import React, { createContext, useContext, useState, useEffect } from 'react';

const TripContext = createContext();

export const useTrips = () => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripProvider');
  }
  return context;
};

export const TripProvider = ({ children }) => {
  const [trips, setTrips] = useState(() => {
    try {
      const savedTrips = localStorage.getItem('paktrip_trips');
      return savedTrips ? JSON.parse(savedTrips) : [
        {
          id: '1',
          name: 'Naran Valley',
          status: 'In Progress',
          region: 'KPK',
          date: 'April 1 - 7, 2026',
          distance: 520,
          image: 'https://images.unsplash.com/photo-1627548633724-99bc62c93883?q=80&w=400&auto=format&fit=crop'
        },
        {
          id: '2',
          name: 'Gwadar Shoreline',
          status: 'Upcoming',
          region: 'Balochistan',
          date: 'May 12 - 15, 2026',
          distance: 640,
          image: 'https://images.unsplash.com/photo-1599661046289-e31887846eac?q=80&w=400&auto=format&fit=crop'
        },
        {
          id: '3',
          name: 'Fairy Meadows',
          status: 'Completed',
          region: 'Gilgit-Baltistan',
          date: 'Oct 2025',
          distance: 750,
          image: 'https://images.unsplash.com/photo-1582234372722-50d7ccc30ebd?q=80&w=400&auto=format&fit=crop'
        }
      ];
    } catch (e) {
      console.error("Failed to parse trips from localStorage", e);
      return [];
    }
  });

  const [user, setUser] = useState({
    name: 'Amina Khan',
    level: 'Pro Explorer',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop'
  });

  useEffect(() => {
    localStorage.setItem('paktrip_trips_v2', JSON.stringify(trips));
  }, [trips]);

  const addTrip = (newTrip) => {
    setTrips(prev => [{ ...newTrip, id: Date.now().toString() }, ...prev]);
  };

  const updateTripStatus = (id, status) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const getStats = () => {
    const totalDistance = trips.reduce((acc, t) => acc + (t.distance || 0), 0);
    const fuelSaved = Math.round(totalDistance * 0.034); // Pseudo-calc
    const regions = new Set(trips.map(t => t.region)).size;
    
    return {
      totalDistance: totalDistance.toLocaleString(),
      fuelSaved,
      regions,
      totalTrips: trips.length
    };
  };

  return (
    <TripContext.Provider value={{ trips, user, addTrip, updateTripStatus, getStats }}>
      {children}
    </TripContext.Provider>
  );
};
