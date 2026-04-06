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
      return savedTrips ? JSON.parse(savedTrips) : [];
    } catch (e) {
      console.error("Failed to parse trips from localStorage", e);
      return [];
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('paktrip_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        // Schema Migration: Ensure new fields exist for existing users
        if (!parsed.journeyHistory || !parsed.regionsVisited || parsed.avatar?.includes('unsplash')) {
          return {
            ...parsed,
            avatar: parsed.avatar?.includes('unsplash') ? '/avatar.png' : parsed.avatar,
            journeyHistory: parsed.journeyHistory || [],
            regionsVisited: parsed.regionsVisited || []
          };
        }
        return parsed;
      }
      return {
        name: 'Guest Explorer',
        email: 'explorer@paktrip.com',
        level: 'Newbie',
        bio: 'Ready to discover Pakistan!',
        avatar: '/avatar.png',
        joinedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        isAuthenticated: false,
        journeyHistory: [],
        regionsVisited: []
      };
    } catch (e) {
      return {
        name: 'Guest Explorer',
        email: 'explorer@paktrip.com',
        level: 'Newbie',
        bio: 'Ready to discover Pakistan!',
        avatar: '/avatar.png',
        joinedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
        isAuthenticated: false,
        journeyHistory: [],
        regionsVisited: []
      };
    }
  });

  const [isNavHidden, setIsNavHidden] = useState(false);
  const [notifSettings, setNotifSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('paktrip_notifications');
      return saved ? JSON.parse(saved) : {
        email: '',
        enableRouteAlerts: true,
        enablePeriodicUpdates: false,
        periodicIntervalHours: 6,
        lastSentAt: null
      };
    } catch (e) {
      return {
        email: '',
        enableRouteAlerts: true,
        enablePeriodicUpdates: false,
        periodicIntervalHours: 6,
        lastSentAt: null
      };
    }
  });

  useEffect(() => {
    localStorage.setItem('paktrip_trips', JSON.stringify(trips));
  }, [trips]);

  useEffect(() => {
    localStorage.setItem('paktrip_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('paktrip_notifications', JSON.stringify(notifSettings));
  }, [notifSettings]);

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

  const updateNotifSettings = (newSettings) => {
    setNotifSettings(prev => ({ ...prev, ...newSettings }));
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
    <TripContext.Provider value={{ 
      trips, user, addTrip, updateTripStatus, login, logout, updateUser, 
      getStats, completeTrip, isNavHidden, setIsNavHidden, 
      notifSettings, updateNotifSettings 
    }}>
      {children}
    </TripContext.Provider>
  );
};
