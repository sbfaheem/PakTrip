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

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('paktrip_user');
      return savedUser ? JSON.parse(savedUser) : {
        name: 'Guest Explorer',
        email: 'explorer@paktrip.com',
        level: 'Newbie',
        bio: 'Ready to discover Pakistan!',
        avatar: '/avatar.png',
        joinedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        isAuthenticated: false
      };
    } catch (e) {
      return {
        name: 'Guest Explorer',
        email: 'explorer@paktrip.com',
        level: 'Newbie',
        bio: 'Ready to discover Pakistan!',
        avatar: '/avatar.png',
        joinedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        isAuthenticated: false
      };
    }
  });

  useEffect(() => {
    localStorage.setItem('paktrip_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('paktrip_user', JSON.stringify(user));
  }, [user]);

  const addTrip = (newTrip) => {
    setTrips(prev => [{ ...newTrip, id: Date.now().toString() }, ...prev]);
  };

  const updateTripStatus = (id, status) => {
    setTrips(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const login = (userData) => {
    setUser({
      ...userData,
      isAuthenticated: true
    });
  };

  const logout = () => {
    setUser({
      name: 'Guest Explorer',
      email: 'explorer@paktrip.com',
      level: 'Newbie',
      bio: 'Ready to discover Pakistan!',
      avatar: '/avatar.png',
      joinedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
      isAuthenticated: false,
      journeyHistory: [],
      regionsVisited: []
    });
  };

  const updateUser = (newUserData) => {
    setUser(prev => ({ ...prev, ...newUserData }));
  };

  const completeTrip = (tripData) => {
    setUser(prev => {
      const distanceNum = parseFloat(tripData.distance.replace(/[^0-9.]/g, '')) || 0;
      
      // Determine region from address
      const provinces = ['Sindh', 'Punjab', 'Khyber Pakhtunkhwa', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'Azad Kashmir'];
      const text = (tripData.destination + ' ' + tripData.summary).toLowerCase();
      const detectedRegion = provinces.find(p => text.includes(p.toLowerCase())) || 'Unknown';

      const newHistory = [...(prev.journeyHistory || []), {
        ...tripData,
        id: Date.now().toString(),
        completedAt: new Date().toISOString(),
        distanceNum,
        region: detectedRegion
      }];

      const newRegions = [...new Set([...(prev.regionsVisited || []), detectedRegion])].filter(r => r !== 'Unknown');

      return {
        ...prev,
        journeyHistory: newHistory,
        regionsVisited: newRegions
      };
    });
  };

  const getStats = () => {
    const history = user.journeyHistory || [];
    const totalDistance = history.reduce((acc, t) => acc + (t.distanceNum || 0), 0);
    const regions = (user.regionsVisited || []).length;
    
    return {
      totalDistance: totalDistance.toLocaleString(),
      regions,
      totalTrips: history.length
    };
  };

  return (
    <TripContext.Provider value={{ trips, user, addTrip, updateTripStatus, login, logout, updateUser, getStats, completeTrip }}>
      {children}
    </TripContext.Provider>
  );
};
