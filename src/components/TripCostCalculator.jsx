import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useTrips } from '../context/TripContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Autocomplete } from '@react-google-maps/api';
import {
  Fuel, Receipt, ArrowLeftRight, ChevronDown, ChevronUp,
  Calculator, TrendingUp, AlertCircle, RefreshCw, Gauge,
  CircleDollarSign, Wallet, Car, Info, Scale, Hotel, Utensils,
  Users, Moon, Check, Plus, Trash2, Calendar, ArrowRight, MapPin
} from 'lucide-react';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (n) => Math.round(n).toLocaleString('en-PK');
const getToday = () => new Date().toISOString().split('T')[0];
const addDaysString = (dateStr, days) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

/* ─── Custom UI Elements ─────────────────────────────────────────────────── */
function Checkbox({ label, checked, onChange, icon: Icon, color }) {
  return (
    <div 
      onClick={() => onChange(!checked)}
      style={{ 
        display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer',
        padding: '0.6rem 0.85rem', borderRadius: '12px', border: `1px solid ${checked ? color : '#e2e8f0'}`,
        background: checked ? `${color}08` : '#fff', transition: 'all 0.2s'
      }}
    >
      <div style={{ 
        width: '20px', height: '20px', borderRadius: '6px', 
        border: `2px solid ${checked ? color : '#cbd5e1'}`,
        background: checked ? color : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all 0.2s'
      }}>
        {checked && <Check size={14} color="#fff" strokeWidth={3} />}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon size={16} color={checked ? color : '#94a3b8'} />
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: checked ? 'var(--text-dark)' : '#64748b' }}>{label}</span>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, unit, onChange, color = 'var(--primary)', disabled }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: '1.25rem', opacity: disabled ? 0.4 : 1, transition: 'opacity 0.2s' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '1rem', fontWeight: 700, color }}>{value.toLocaleString()} <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>{unit}</span></span>
      </div>
      <div style={{ position: 'relative', height: '6px', background: '#e5e7eb', borderRadius: '3px' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${pct}%`, background: color, borderRadius: '3px', transition: 'width 0.1s' }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => !disabled && onChange(Number(e.target.value))}
          disabled={disabled}
          style={{
            position: 'absolute', inset: 0, width: '100%', opacity: 0,
            cursor: disabled ? 'default' : 'pointer', height: '100%', margin: 0
          }}
        />
        <div style={{
          position: 'absolute', top: '50%', left: `${pct}%`,
          transform: 'translate(-50%, -50%)',
          width: '18px', height: '18px', borderRadius: '50%',
          background: '#fff', border: `3px solid ${color}`,
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          pointerEvents: 'none', transition: 'left 0.1s'
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.7rem', color: '#9ca3af' }}>
        <span>{min.toLocaleString()}</span><span>{max.toLocaleString()}</span>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, sub, color, large, disabled }) {
  return (
    <div style={{
      background: '#fff', borderRadius: '14px', padding: large ? '1.25rem' : '1rem',
      border: '1px solid #e5e7eb', boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
      opacity: disabled ? 0.3 : 1, filter: disabled ? 'grayscale(1)' : 'none',
      transition: 'all 0.3s'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ padding: '0.4rem', background: `${color}18`, borderRadius: '8px' }}>
          <Icon size={16} color={color} />
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</span>
      </div>
      <div style={{ fontSize: large ? '1.5rem' : '1.125rem', fontWeight: 700, color: 'var(--text-dark)', lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  );
}

const initialMealDay = (id, date = getToday()) => ({
  id,
  date,
  breakfast: { included: false, price: 0 },
  lunch: { included: false, price: 0 },
  dinner: { included: false, price: 0 }
});

const initialHotelBooking = (id, checkIn = getToday()) => ({
  id,
  location: '',
  checkIn,
  nights: 1,
  price: 0
});

const initialTollLog = (id) => ({
  id,
  title: '',
  price: 0
});

const initialExtraExpense = (id) => ({
  id,
  title: '',
  price: 0
});

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function TripCostCalculator({ distanceKm = 0, isLoaded, roundTrip, setRoundTrip, onUpdate }) {
  const { notifSettings, updateNotifSettings } = useTrips();
  // 1. Tolls (Manual Input)
  const [tollLogs, setTollLogs] = useState(() => {
    const saved = localStorage.getItem('paktrip_toll_logs');
    return saved ? JSON.parse(saved) : [initialTollLog(Date.now())];
  });

  const [extraExpenses, setExtraExpenses] = useState(() => {
    const saved = localStorage.getItem('paktrip_extra_expenses');
    return saved ? JSON.parse(saved) : [];
  });
  
  // 2. Intercity Trip Flow / Hotel (Enhanced Multi-Stay)
  const [isIntercity, setIsIntercity] = useState(distanceKm > 100);
  const [includeStay, setIncludeStay] = useState(false);
  const [hotelLogs, setHotelLogs] = useState(() => {
    const saved = localStorage.getItem('paktrip_hotel_logs');
    return saved ? JSON.parse(saved) : [initialHotelBooking(Date.now())];
  });

  // Autocomplete Refs Map
  const autocompleteRefs = useRef({});

  // 3. Food Cost Section (Daily Tracking)
  const [includeFood, setIncludeFood] = useState(false);
  const [mealLogs, setMealLogs] = useState(() => {
    const saved = localStorage.getItem('paktrip_food_logs');
    return saved ? JSON.parse(saved) : [initialMealDay(Date.now())];
  });

  // 4. Number of People
  const [numPersons, setNumPersons] = useState(1);
  
  // Fuel
  const [fuelAvg, setFuelAvg] = useState(12);
  const [petrolPrice, setPetrolPrice] = useState(378.41);

  const [showParams, setShowParams] = useState(true);
  
  const multiplier = roundTrip ? 2 : 1;
  const dist = distanceKm * multiplier;

  // Auto-detect intercity
  useEffect(() => {
    setIsIntercity(distanceKm > 100);
  }, [distanceKm]);

  // Persist logs
  useEffect(() => {
    localStorage.setItem('paktrip_food_logs', JSON.stringify(mealLogs));
  }, [mealLogs]);
  useEffect(() => {
    localStorage.setItem('paktrip_hotel_logs', JSON.stringify(hotelLogs));
  }, [hotelLogs]);
  useEffect(() => {
    localStorage.setItem('paktrip_toll_logs', JSON.stringify(tollLogs));
  }, [tollLogs]);
  useEffect(() => {
    localStorage.setItem('paktrip_extra_expenses', JSON.stringify(extraExpenses));
  }, [extraExpenses]);

  const calc = useMemo(() => {
    if (distanceKm === 0) return {
        fuelCost: 0, totalTolls: 0, totalHotels: 0, totalFood: 0, grandTotal: 0, perPerson: 0, liters: 0, totalNights: 0, totalExtra: 0, fuelEntries: [], nonFuelEntries: []
    };
    
    // Categorize Manual Expenses
    const fuelEntries = extraExpenses.filter(e => e.title.toLowerCase().includes('fuel') || e.title.toLowerCase().includes('petrol'));
    const nonFuelEntries = extraExpenses.filter(e => !e.title.toLowerCase().includes('fuel') && !e.title.toLowerCase().includes('petrol'));

    // Transport Costs (Calculated Fuel)
    const estimatedLiters = dist / fuelAvg;
    const estimatedFuelCost = estimatedLiters * petrolPrice;
    
    // Manual fuel entries detection
    const manualFuelCost = fuelEntries.reduce((sum, e) => sum + (Number(e.price) || 0), 0);
    const totalFuelCost = estimatedFuelCost + manualFuelCost;
    const totalLiters = totalFuelCost / petrolPrice;

    const totalTolls = tollLogs.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
    
    // Accommodation Costs (Multi-stay summation)
    let totalHotels = 0;
    let totalNights = 0;
    if (includeStay) {
      hotelLogs.forEach(h => {
        totalHotels += (Number(h.nights) * Number(h.price));
        totalNights += Number(h.nights);
      });
    }
    
    // Food Costs (Daily logs summation)
    let totalFood = 0;
    if (includeFood) {
      mealLogs.forEach(day => {
        if (day.breakfast.included) totalFood += Number(day.breakfast.price);
        if (day.lunch.included) totalFood += Number(day.lunch.price);
        if (day.dinner.included) totalFood += Number(day.dinner.price);
      });
    }

    // Extra logs cost (non-fuel only)
    const totalExtra = nonFuelEntries.reduce((sum, e) => sum + (Number(e.price) || 0), 0);
    
    const grandTotal = totalFuelCost + totalTolls + totalHotels + totalFood + totalExtra;
    const perPerson = numPersons > 0 ? grandTotal / numPersons : grandTotal;
    
    return {
      fuelCost: totalFuelCost,
      manualFuelCost,
      totalTolls,
      totalHotels,
      totalFood,
      totalExtra,
      grandTotal,
      perPerson,
      liters: totalLiters,
      totalNights,
      fuelEntries,
      nonFuelEntries
    };
  }, [dist, fuelAvg, petrolPrice, tollLogs, includeStay, hotelLogs, includeFood, mealLogs, numPersons, distanceKm, extraExpenses]);

  // Sync to parent for notifications
  useEffect(() => {
    if (onUpdate) {
      // Create a rounded version of the budget for the email reports
      const roundedCalc = {
        ...calc,
        fuelCost: Math.round(calc.fuelCost || 0),
        totalTolls: Math.round(calc.totalTolls || 0),
        totalHotels: Math.round(calc.totalHotels || 0),
        totalFood: Math.round(calc.totalFood || 0),
        totalExtra: Math.round(calc.totalExtra || 0),
        grandTotal: Math.round(calc.grandTotal || 0),
        perPerson: Math.round(calc.perPerson || 0)
      };

      onUpdate({
        ...roundedCalc,
        numPersons,
        fuelAvg,
        petrolPrice
      });
    }
  }, [calc, numPersons, fuelAvg, petrolPrice, onUpdate]);

  // Hotel Actions
  const addHotel = () => {
    const last = hotelLogs[hotelLogs.length - 1];
    const nextIn = addDaysString(last.checkIn, Number(last.nights));
    setHotelLogs([...hotelLogs, initialHotelBooking(Date.now(), nextIn)]);
  };
  const removeHotel = (id) => {
    setHotelLogs(hotelLogs.filter(h => h.id !== id));
    delete autocompleteRefs.current[id];
  };
  const updateHotel = (id, field, value) => {
    setHotelLogs(hotelLogs.map(h => {
        if (h.id === id) {
            let val = value;
            if (field === 'price' || field === 'nights') val = Math.max(0, Number(value));
            return { ...h, [field]: val };
        }
        return h;
    }));
  };

  const onPlaceChanged = (id) => {
    const autocomplete = autocompleteRefs.current[id];
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place && place.name) {
        updateHotel(id, 'location', place.name + (place.formatted_address ? ', ' + place.formatted_address : ''));
      }
    }
  };

  // Toll Actions
  const addTollLine = () => setTollLogs([...tollLogs, initialTollLog(Date.now())]);
  const removeTollLine = (id) => setTollLogs(tollLogs.filter(t => t.id !== id));
  const updateTollLine = (id, field, value) => {
    setTollLogs(tollLogs.map(t => {
      if (t.id === id) {
        let val = value;
        if (field === 'price') val = value.replace(/[^0-9]/g, '') === '' ? 0 : Number(value.replace(/[^0-9]/g, ''));
        return { ...t, [field]: val };
      }
      return t;
    }));
  };

  // Extra Expense Actions
  const addExtraLine = () => setExtraExpenses([...extraExpenses, initialExtraExpense(Date.now())]);
  const removeExtraLine = (id) => setExtraExpenses(extraExpenses.filter(e => e.id !== id));
  const updateExtraLine = (id, field, value) => {
    setExtraExpenses(extraExpenses.map(e => {
      if (e.id === id) {
        let val = value;
        if (field === 'price') val = value.replace(/[^0-9]/g, '') === '' ? 0 : Number(value.replace(/[^0-9]/g, ''));
        return { ...e, [field]: val };
      }
      return e;
    }));
  };

  // Food Actions
  const addMealDay = () => {
    const lastDay = mealLogs[mealLogs.length - 1];
    const nextDate = addDaysString(lastDay.date, 1);
    setMealLogs([...mealLogs, initialMealDay(Date.now(), nextDate)]);
  };
  const removeMealDay = (id) => setMealLogs(mealLogs.filter(d => d.id !== id));
  const updateMealDay = (id, field, value) => {
    setMealLogs(mealLogs.map(day => day.id === id ? { ...day, [field]: value } : day));
  };
  const updateMealType = (dayId, type, field, value) => {
    setMealLogs(mealLogs.map(day => {
      if (day.id === dayId) {
        const updatedType = { ...day[type], [field]: value };
        if (field === 'included' && !value) updatedType.price = 0;
        if (field === 'price') updatedType.price = Math.max(0, Math.floor(Number(value)));
        return { ...day, [type]: updatedType };
      }
      return day;
    }));
  };

  const getDailySum = (day) => {
    let sum = 0;
    if (day.breakfast.included) sum += Number(day.breakfast.price);
    if (day.lunch.included) sum += Number(day.lunch.price);
    if (day.dinner.included) sum += Number(day.dinner.price);
    return sum;
  };

  if (distanceKm === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ marginTop: '2rem' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ padding: '0.5rem', background: '#ecfdf5', borderRadius: '10px' }}>
            <Calculator size={20} color="var(--primary)" />
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '2px' }}>Estimate Your Budget</h3>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {roundTrip ? 'Round trip travel' : 'One-way travel'} · {Math.round(dist).toLocaleString()} km
            </p>
          </div>
        </div>

        <button
          onClick={() => setRoundTrip(r => !r)}
          style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            padding: '0.5rem 0.875rem', borderRadius: '2rem',
            border: `2px solid ${roundTrip ? 'var(--primary)' : '#e5e7eb'}`,
            background: roundTrip ? '#ecfdf5' : '#fff',
            color: roundTrip ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <ArrowLeftRight size={14} />
          {roundTrip ? 'Round Trip' : 'Add Return'}
        </button>
      </div>

      {/* Main Stats Summary */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary) 0%, #064e3b 100%)',
        borderRadius: '24px', padding: '1.75rem 1.5rem', color: 'white',
        boxShadow: '0 12px 32px rgba(6, 95, 70, 0.25)', marginBottom: '1.5rem',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', opacity: 0.8 }}>
              <Wallet size={16} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Estimated Trip Budget</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {fmt(calc.grandTotal)}
            </div>
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', opacity: 0.9 }}>
              <p style={{ fontSize: '0.85rem' }}>
                Est. Fuel: <span style={{ fontWeight: 800 }}>{fmt(calc.fuelCost)} PKR</span>
              </p>
              <p style={{ fontSize: '0.85rem' }}>
                <span style={{ fontWeight: 800 }}>{calc.liters.toFixed(1)}</span> Liters Required
              </p>
            </div>
            <p style={{ fontSize: '0.75rem', opacity: 0.7, marginTop: '0.5rem' }}>
              Cost per person: <span style={{ fontWeight: 700 }}>{fmt(calc.perPerson)}</span> (for {numPersons})
            </p>
          </div>
          {includeStay && (
             <div style={{ textAlign: 'right' }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '12px', backdropFilter: 'blur(8px)' }}>
                   <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, opacity: 0.8, marginBottom: '2px' }}>Total Stay</div>
                   <div style={{ fontSize: '1rem', fontWeight: 800 }}>{calc.totalNights} Nights</div>
                </div>
             </div>
          )}
        </div>

        {/* Breakdown Pips */}
        <div style={{ marginTop: '1.75rem', display: 'flex', gap: '1.5rem', opacity: 0.9, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />
              Fuel {calc.grandTotal > 0 ? Math.round((calc.fuelCost / calc.grandTotal) * 100) : 0}%
           </div>
           {includeStay && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
                Stays {calc.grandTotal > 0 ? Math.round((calc.totalHotels / calc.grandTotal) * 100) : 0}%
             </div>
           )}
           {includeFood && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                Food {calc.grandTotal > 0 ? Math.round((calc.totalFood / calc.grandTotal) * 100) : 0}%
             </div>
           )}
           {calc.totalTolls > 0 && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                Tolls {calc.grandTotal > 0 ? Math.round((calc.totalTolls / calc.grandTotal) * 100) : 0}%
             </div>
           )}
           {calc.totalExtra > 0 && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                Misc {calc.grandTotal > 0 ? Math.round((calc.totalExtra / calc.grandTotal) * 100) : 0}%
             </div>
           )}
        </div>

        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }}>
          <TrendingUp size={160} />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1.5rem' }}>
        <MetricCard icon={Hotel} label="Accommodation" value={`${fmt(calc.totalHotels)}`} sub={`${calc.totalNights} nights total`} color="#8b5cf6" disabled={!includeStay} />
        <MetricCard icon={Utensils} label="Food Cost" value={`${fmt(calc.totalFood)}`} sub={`${mealLogs.length} days logged`} color="#ec4899" disabled={!includeFood} />
        <MetricCard icon={Fuel} label="Total Fuel" value={`${fmt(calc.fuelCost)}`} sub={`${calc.liters.toFixed(1)} Liters Total`} color="#10b981" />
        <MetricCard icon={Receipt} label="Total Tolls" value={`${fmt(calc.totalTolls)}`} sub="Manual price" color="#3b82f6" />
      </div>

      {/* Control Panel Toggle */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
        <button
          onClick={() => setShowParams(!showParams)}
          style={{
            flex: 1, padding: '1rem', borderRadius: '14px', border: '1px solid #e5e7eb',
            background: showParams ? '#f9fafb' : '#fff', color: 'var(--text-dark)',
            fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Gauge size={18} color="var(--primary)" />
             <span>Edit Trip Parameters</span>
          </div>
          {showParams ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Expandable Parameters */}
      <AnimatePresence>
        {showParams && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="card" style={{ marginBottom: '1.5rem', background: '#fff' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* 1. Group Section */}
                <div>
                   <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem', fontWeight: 700, textTransform: 'uppercase' }}>👥 Group Configuration</p>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <label style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Number of People</span>
                        <input 
                          type="text" 
                          inputMode="numeric"
                          value={numPersons} 
                          onChange={e => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            setNumPersons(val === '' ? '' : Math.max(1, Number(val)));
                          }}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
                        />
                      </label>
                   </div>
                </div>

                <div style={{ height: '1px', background: '#f1f5f9' }} />

                {/* 2. Hotel Section (Multi-Booking) */}
                <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>🏨 Multiple Hotel Stays</p>
                        {isIntercity && (
                           <span style={{ fontSize: '0.65rem', color: 'var(--primary)', fontWeight: 600 }}>Intercity Journey - Tracking Hotel Stays</span>
                        )}
                      </div>
                      <Checkbox label={includeStay ? "Tracking" : "Add Stays?"} checked={includeStay} onChange={setIncludeStay} icon={Hotel} color="#8b5cf6" />
                   </div>
                   <AnimatePresence>
                      {includeStay && (
                         <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {hotelLogs.map((h, hIdx) => (
                               <div key={h.id} style={{ padding: '1.25rem 1rem', background: '#f5f3ff', borderRadius: '16px', border: '1px solid #ddd6fe' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', position: 'relative' }}>
                                     <div style={{ position: 'relative', flex: 1 }}>
                                        {isLoaded ? (
                                           <Autocomplete 
                                             onLoad={(autocomplete) => { autocompleteRefs.current[h.id] = autocomplete; }}
                                             onPlaceChanged={() => onPlaceChanged(h.id)}
                                           >
                                              <input 
                                                type="text" placeholder="Search for hotel or location"
                                                value={h.location} onChange={e => updateHotel(h.id, 'location', e.target.value)}
                                                style={{ width: '100%', padding: '0.55rem 0.5rem', paddingLeft: '2.4rem', borderRadius: '8px', border: '1px solid #c4b5fd', fontSize: '0.85rem', fontWeight: 700, background: '#fff' }}
                                              />
                                           </Autocomplete>
                                        ) : (
                                           <input 
                                             type="text" placeholder="Where are you staying?"
                                             value={h.location} onChange={e => updateHotel(h.id, 'location', e.target.value)}
                                             style={{ width: '100%', padding: '0.55rem 0.5rem', paddingLeft: '2.4rem', borderRadius: '8px', border: '1px solid #c4b5fd', fontSize: '0.85rem', fontWeight: 700, background: '#fff' }}
                                           />
                                        )}
                                        <MapPin size={16} color="#8b5cf6" style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', zIndex: 1, pointerEvents: 'none' }} />
                                     </div>
                                     {hotelLogs.length > 1 && (
                                       <button onClick={() => removeHotel(h.id)} style={{ marginLeft: '0.75rem', padding: '0.45rem', color: '#ef4444', background: '#fee2e2', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex' }}>
                                          <Trash2 size={16} />
                                       </button>
                                     )}
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                     <label>
                                        <span style={{ fontSize: '0.65rem', color: '#6d65be', display: 'block', marginBottom: '2px', fontWeight: 700 }}>Check-in Date</span>
                                        <div style={{ position: 'relative' }}>
                                           <input 
                                             type="date" value={h.checkIn} onChange={e => updateHotel(h.id, 'checkIn', e.target.value)}
                                             style={{ width: '100%', padding: '0.55rem', paddingLeft: '2.1rem', borderRadius: '8px', border: '1px solid #ddd6fe', fontSize: '0.8rem', fontWeight: 600 }}
                                           />
                                           <Calendar size={14} color="#a78bfa" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
                                        </div>
                                     </label>
                                     <label>
                                        <span style={{ fontSize: '0.65rem', color: '#6d65be', display: 'block', marginBottom: '2px', fontWeight: 700 }}>Nights</span>
                                        <input 
                                          type="number" min="1" value={h.nights} onChange={e => updateHotel(h.id, 'nights', e.target.value)}
                                          style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #ddd6fe', fontSize: '0.85rem' }}
                                        />
                                     </label>
                                  </div>

                                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '0.75rem' }}>
                                     <label>
                                        <span style={{ fontSize: '0.65rem', color: '#6d65be', display: 'block', marginBottom: '2px', fontWeight: 700 }}>Room Rate (per night)</span>
                                        <input 
                                          type="number" min="0" value={h.price} onChange={e => updateHotel(h.id, 'price', e.target.value)}
                                          style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #ddd6fe', fontSize: '0.85rem' }}
                                        />
                                     </label>
                                     <div style={{ padding: '0.4rem 0.75rem', background: '#fff', borderRadius: '8px', border: '1px solid #ddd6fe', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                        <span style={{ fontSize: '0.6rem', color: '#8b5cf6', textTransform: 'uppercase', fontWeight: 700 }}>Check-out</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1px' }}>
                                           <ArrowRight size={12} color="#8b5cf6" />
                                           <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4c1d95' }}>{addDaysString(h.checkIn, Number(h.nights))}</span>
                                        </div>
                                     </div>
                                  </div>
                                  
                                  <div style={{ marginTop: '0.75rem', textAlign: 'right' }}>
                                     <span style={{ fontSize: '0.7rem', color: '#8b5cf6', fontWeight: 700 }}>Booking Total: </span>
                                     <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4c1d95' }}>Rs. {fmt(h.nights * h.price)}</span>
                                  </div>
                               </div>
                            ))}
                            
                            <button 
                             onClick={addHotel}
                             style={{
                               width: '100%', padding: '0.85rem', borderRadius: '14px', border: '2px dashed #c4b5fd',
                               background: '#fdfcfe', color: '#7c3aed', fontSize: '0.82rem', fontWeight: 800,
                               cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem'
                             }}
                            >
                             <Plus size={18} /> Add Entry for Next Booking
                            </button>
                         </motion.div>
                      )}
                   </AnimatePresence>
                </div>
                
                <div style={{ height: '1px', background: '#f1f5f9' }} />

                {/* 3. Food Section (Enhanced Daily Logs) */}
                <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>🍎 Daily Food Logs</p>
                      <Checkbox label={includeFood ? "Shared" : "Track Daily?"} checked={includeFood} onChange={setIncludeFood} icon={Utensils} color="#ec4899" />
                   </div>
                   <AnimatePresence>
                      {includeFood && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                           {mealLogs.map((day, dIdx) => (
                             <div key={day.id} style={{ padding: '1.25rem 1rem', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                   <div style={{ position: 'relative', flex: 1, maxWidth: '160px' }}>
                                      <input 
                                        type="date" value={day.date} onChange={e => updateMealDay(day.id, 'date', e.target.value)}
                                        style={{ width: '100%', padding: '0.4rem 0.5rem', paddingLeft: '2rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.75rem', fontWeight: 700, background: '#fff' }}
                                      />
                                      <Calendar size={14} color="var(--primary)" style={{ position: 'absolute', left: '0.6rem', top: '50%', transform: 'translateY(-50%)' }} />
                                   </div>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                      <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#94a3b8' }}>Day {dIdx + 1}</span>
                                      {mealLogs.length > 1 && (
                                        <button onClick={() => removeMealDay(day.id)} style={{ padding: '0.4rem', color: '#ef4444', background: '#fee2e2', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex' }}>
                                           <Trash2 size={14} />
                                        </button>
                                      )}
                                   </div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                   {['breakfast', 'lunch', 'dinner'].map((mealType) => (
                                     <div key={mealType} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ minWidth: '95px' }}>
                                           <select 
                                              value={day[mealType].included ? 'Yes' : 'No'}
                                              onChange={(e) => updateMealType(day.id, mealType, 'included', e.target.value === 'Yes')}
                                              style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.72rem', fontWeight: 700, background: day[mealType].included ? '#fdf2f8' : '#fff' }}
                                           >
                                              <option value="No">No</option>
                                              <option value="Yes">Yes</option>
                                           </select>
                                           <span style={{ fontSize: '0.6rem', textTransform: 'capitalize', color: '#94a3b8', display: 'block', marginTop: '3px', fontWeight: 700 }}>{mealType}</span>
                                        </div>
                                        <div style={{ position: 'relative', flex: 1 }}>
                                           <input 
                                              type="number" min="0" placeholder={`${mealType}`}
                                              value={day[mealType].price}
                                              onChange={e => updateMealType(day.id, mealType, 'price', e.target.value)}
                                              disabled={!day[mealType].included}
                                              style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', opacity: day[mealType].included ? 1 : 0.4 }}
                                           />
                                        </div>
                                     </div>
                                   ))}
                                </div>

                                <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                   <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Daily Total:</span>
                                   <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--primary)' }}>Rs. {fmt(getDailySum(day))}</span>
                                </div>
                             </div>
                           ))}
                           
                           <button 
                             onClick={addMealDay}
                             style={{
                               width: '100%', padding: '0.85rem', borderRadius: '14px', border: '2px dashed #cbd5e1',
                               background: 'rgba(255,255,255,0.5)', color: '#64748b', fontSize: '0.82rem', fontWeight: 800,
                               cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem'
                             }}
                           >
                             <Plus size={18} /> Add Entry for Next Day
                           </button>
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>

                <div style={{ height: '1px', background: '#f1f5f9' }} />

                {/* 4. Vehicle & Toll Section */}
                <div>
                   <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem', fontWeight: 700, textTransform: 'uppercase' }}>⛽ Vehicle & Tolls</p>
                   
                   <div style={{ marginBottom: '1.5rem' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.75rem' }}>Toll Entries</span>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                         {tollLogs.map((toll) => (
                            <div key={toll.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 40px', gap: '0.5rem', alignItems: 'center' }}>
                               <input 
                                 type="text" placeholder="e.g. M2 Toll"
                                 value={toll.title} onChange={e => updateTollLine(toll.id, 'title', e.target.value)}
                                 style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', fontWeight: 600 }}
                               />
                               <input 
                                 type="text" inputMode="numeric" placeholder="Price"
                                 value={toll.price || ''} onChange={e => updateTollLine(toll.id, 'price', e.target.value)}
                                 style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', fontWeight: 700, textAlign: 'right' }}
                               />
                               <button 
                                 onClick={() => removeTollLine(toll.id)}
                                 disabled={tollLogs.length === 1}
                                 style={{ padding: '0.65rem', border: 'none', background: 'none', color: '#ef4444', cursor: tollLogs.length === 1 ? 'default' : 'pointer', opacity: tollLogs.length === 1 ? 0.3 : 1 }}
                               >
                                 <Trash2 size={16} />
                               </button>
                            </div>
                         ))}
                         <button 
                           onClick={addTollLine}
                           style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', border: 'none', padding: '0.6rem 1rem', borderRadius: '10px', color: '#475569', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
                         >
                            <Plus size={14} /> Add Toll
                         </button>
                      </div>
                   </div>

                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     <Slider label="Avg Fuel Economy" value={fuelAvg} min={5} max={25} step={0.5} unit="km/L" onChange={setFuelAvg} color="#10b981" />
                     <Slider label="Petrol Price" value={petrolPrice} min={250} max={450} step={0.01} unit="PKR/L" onChange={setPetrolPrice} color="#3b82f6" />
                   </div>
                </div>

                <div style={{ height: '1px', background: '#f1f5f9' }} />

                {/* 5. Trip Expense Log Section */}
                <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>📝 Trip Expense Log</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                         <span style={{ fontSize: '0.65rem', color: '#64748b', fontWeight: 600 }}>Total Extra:</span>
                         <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--primary)', background: '#ecfdf5', padding: '0.2rem 0.6rem', borderRadius: '6px' }}>
                            Rs. {fmt(calc.totalExtra)}
                         </span>
                      </div>
                   </div>
                   
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      {extraExpenses.map((expense) => (
                         <div key={expense.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 40px', gap: '0.5rem', alignItems: 'center' }}>
                            <input 
                              type="text" placeholder="e.g. Fuel Refill, Snacks"
                              value={expense.title} onChange={e => updateExtraLine(expense.id, 'title', e.target.value)}
                              style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', fontWeight: 600 }}
                            />
                            <input 
                              type="text" inputMode="numeric" placeholder="Cost"
                              value={expense.price || ''} onChange={e => updateExtraLine(expense.id, 'price', e.target.value)}
                              style={{ width: '100%', padding: '0.65rem 0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem', outline: 'none', fontWeight: 700, textAlign: 'right' }}
                            />
                            <button 
                              onClick={() => removeExtraLine(expense.id)}
                              style={{ padding: '0.65rem', border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}
                            >
                              <Trash2 size={16} />
                            </button>
                         </div>
                      ))}
                      
                      {extraExpenses.length === 0 && (
                         <div style={{ padding: '1.25rem', border: '2px dashed #f1f5f9', borderRadius: '12px', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem' }}>
                            No manual expenses logged yet.
                         </div>
                      )}

                      <button 
                        onClick={addExtraLine}
                        style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f1f5f9', border: 'none', padding: '0.6rem 1rem', borderRadius: '10px', color: '#475569', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                         <Plus size={14} /> Add Actual Expense
                      </button>
                   </div>
                </div>

                <div style={{ height: '1px', background: '#f1f5f9' }} />

                {/* 6. Notification & Monitoring Section */}
                <div>
                   <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem', fontWeight: 700, textTransform: 'uppercase' }}>🔔 Monitoring & Alerts</p>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                      <label>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '0.25rem' }}>Notification Email</span>
                        <input 
                          type="email" placeholder="your@email.com"
                          value={notifSettings.email} 
                          onChange={e => updateNotifSettings({ email: e.target.value })}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.9rem', outline: 'none' }}
                        />
                      </label>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={notifSettings.enableRouteAlerts}
                            onChange={e => updateNotifSettings({ enableRouteAlerts: e.target.checked })}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                          />
                          <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Email update on Route Change</span>
                        </label>

                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                          <input 
                            type="checkbox" 
                            checked={notifSettings.enablePeriodicUpdates}
                            onChange={e => updateNotifSettings({ enablePeriodicUpdates: e.target.checked })}
                            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
                          />
                          <span style={{ fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>Periodic updates (Every 6h)</span>
                        </label>
                      </div>
                      
                      <p style={{ fontSize: '0.65rem', color: '#94a3b8', lineHeight: 1.4 }}>
                        * Emails are sent via EmailJS. Note that periodic updates require the app to be open in your browser.
                      </p>
                   </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Detailed Cost Math Breakdown */}
      <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--text-dark)', fontWeight: 700 }}>
          <TrendingUp size={18} color="var(--primary)" />
          Trip Cost Breakdown
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
          {(calc.fuelCost > 0) && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Fuel Cost:</span>
                <span style={{ fontWeight: 600 }}>{fmt(calc.fuelCost)} PKR</span>
              </div>
              {calc.fuelEntries.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingLeft: '0.75rem', borderLeft: '2px solid #e2e8f0', marginTop: '0.4rem' }}>
                  {calc.fuelEntries.map((exp) => (
                    <motion.div 
                      initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                      key={exp.id} 
                      style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}
                    >
                      <span style={{ fontStyle: 'italic' }}>{exp.title || 'Untitled'} Amount</span>
                      <span style={{ fontWeight: 600 }}>{fmt(exp.price)} PKR</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {calc.totalTolls > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Toll Price:</span>
              <span style={{ fontWeight: 600 }}>{fmt(calc.totalTolls)} PKR</span>
            </div>
          )}
          {calc.totalHotels > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Hotel Cost:</span>
              <span style={{ fontWeight: 600 }}>{fmt(calc.totalHotels)} PKR</span>
            </div>
          )}
          {calc.totalFood > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b' }}>Food Cost:</span>
              <span style={{ fontWeight: 600 }}>{fmt(calc.totalFood)} PKR</span>
            </div>
          )}
          
          <div style={{ paddingTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ color: '#64748b', fontWeight: 700 }}>Extra Log Cost:</span>
              <span style={{ fontWeight: 800, color: 'var(--text-dark)' }}>{fmt(calc.totalExtra)} PKR</span>
            </div>
            
            {calc.nonFuelEntries.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', paddingLeft: '0.75rem', borderLeft: '2px solid #e2e8f0', marginTop: '0.25rem' }}>
                {calc.nonFuelEntries.map((exp) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                    key={exp.id} 
                    style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}
                  >
                    <span>{exp.title || 'Untitled'} Amount</span>
                    <span style={{ fontWeight: 600 }}>{fmt(exp.price)} PKR</span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', marginTop: '0.25rem', borderTop: '2px solid #e2e8f0' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem' }}>Total Trip Cost:</span>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--primary)' }}>{fmt(calc.grandTotal)} PKR</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f0fdf4', borderRadius: '10px' }}>
            <span style={{ fontWeight: 700, color: '#065f46' }}>Total Cost Per Person:</span>
            <span style={{ fontWeight: 800, color: '#065f46' }}>{fmt(calc.perPerson)} PKR</span>
          </div>
        </div>

        <div style={{ marginTop: '1.25rem', padding: '0.75rem', background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: '10px', display: 'flex', gap: '0.75rem' }}>
          <AlertCircle size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={{ fontSize: '0.72rem', color: '#92400e', lineHeight: 1.5 }}>
            Estimate based on your inputs and current mileage averages. Always carry extra for emergencies!
          </p>
        </div>
      </div>
    </motion.div>
  );
}
