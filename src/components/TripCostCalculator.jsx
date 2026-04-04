import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Fuel, Receipt, ArrowLeftRight, ChevronDown, ChevronUp,
  Calculator, TrendingUp, AlertCircle, RefreshCw, Gauge,
  CircleDollarSign, Wallet, Car, Info, Scale, Hotel, Utensils,
  Users, Moon, Check
} from 'lucide-react';

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
const fmt = (n) => Math.round(n).toLocaleString('en-PK');

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

/* ─── Main Component ──────────────────────────────────────────────────────── */
export default function TripCostCalculator({ distanceKm = 0 }) {
  const [includeStay, setIncludeStay] = useState(false);
  const [includeFood, setIncludeFood] = useState(false);

  // Fuel/Tolls
  const [fuelAvgMin, setFuelAvgMin] = useState(10);
  const [fuelAvgMax, setFuelAvgMax] = useState(12);
  const [petrolPrice, setPetrolPrice] = useState(378);
  const [tollTax, setTollTax] = useState(2000);
  const [roundTrip, setRoundTrip] = useState(false);
  
  // Hotels/Food
  const [hotelNights, setHotelNights] = useState(3);
  const [hotelPrice, setHotelPrice] = useState(8000);
  const [numPersons, setNumPersons] = useState(2);
  const [foodBudget, setFoodBudget] = useState(2000);

  const [showParams, setShowParams] = useState(true);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const multiplier = roundTrip ? 2 : 1;
  const dist = distanceKm * multiplier;

  const calc = useMemo(() => {
    if (dist === 0) return null;
    
    // Transport Costs
    const litersLow  = dist / fuelAvgMax;
    const litersHigh = dist / fuelAvgMin;
    const costLow    = litersLow  * petrolPrice;
    const costHigh   = litersHigh * petrolPrice;
    const totalTolls = tollTax * multiplier;
    
    // Accomodation Costs
    const totalHotels = includeStay ? (hotelNights * hotelPrice) : 0;
    
    // Food Costs (days = nights + 1)
    const totalFood = includeFood ? ((hotelNights + 1) * numPersons * foodBudget) : 0;
    
    return {
      litersLow, litersHigh,
      costLow, costHigh,
      totalTolls,
      totalHotels,
      totalFood,
      grandTotalLow:  costLow  + totalTolls + totalHotels + totalFood,
      grandTotalHigh: costHigh + totalTolls + totalHotels + totalFood,
    };
  }, [dist, fuelAvgMin, fuelAvgMax, petrolPrice, tollTax, hotelNights, hotelPrice, numPersons, foodBudget, roundTrip, multiplier, includeStay, includeFood]);

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
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Trip Budget (PKR)</span>
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1 }}>
              {fmt(calc.grandTotalLow)} – {fmt(calc.grandTotalHigh)}
            </div>
            <p style={{ fontSize: '0.85rem', opacity: 0.8, marginTop: '0.75rem' }}>
              Includes {includeStay ? 'Stays, ' : ''} {includeFood ? 'Meals & ' : ''} Fuel for {numPersons} {numPersons === 1 ? 'Person' : 'People'}
            </p>
          </div>
          {includeStay && (
             <div style={{ textAlign: 'right' }}>
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '0.5rem 1rem', borderRadius: '12px', backdropFilter: 'blur(8px)' }}>
                   <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 700, opacity: 0.8, marginBottom: '2px' }}>Stay Duration</div>
                   <div style={{ fontSize: '1rem', fontWeight: 800 }}>{hotelNights} Nights</div>
                </div>
             </div>
          )}
        </div>

        {/* Breakdown Pips */}
        <div style={{ marginTop: '1.75rem', display: 'flex', gap: '1.5rem', opacity: 0.9, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
           <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#fff' }} />
              Fuel {Math.round((calc.costHigh / calc.grandTotalHigh) * 100)}%
           </div>
           {includeStay && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.5)' }} />
                Stays {Math.round((calc.totalHotels / calc.grandTotalHigh) * 100)}%
             </div>
           )}
           {includeFood && (
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
                Food {Math.round((calc.totalFood / calc.grandTotalHigh) * 100)}%
             </div>
           )}
        </div>

        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }}>
          <TrendingUp size={160} />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', marginBottom: '1.5rem' }}>
        <MetricCard icon={Hotel} label="Accommodation" value={`${fmt(calc.totalHotels)}`} sub={`${hotelNights} nights`} color="#8b5cf6" disabled={!includeStay} />
        <MetricCard icon={Utensils} label="Meals & Snacks" value={`${fmt(calc.totalFood)}`} sub={`${hotelNights + 1} days`} color="#ec4899" disabled={!includeFood} />
        <MetricCard icon={Fuel} label="Total Fuel" value={`${fmt(calc.costLow)}–${fmt(calc.costHigh)}`} sub={`${calc.litersLow.toFixed(1)}L+`} color="#10b981" />
        <MetricCard icon={Receipt} label="Total Tolls" value={`${fmt(calc.totalTolls)}`} sub={roundTrip ? 'Round trip' : 'One-way'} color="#3b82f6" />
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
             <span>Refine Budget Details</span>
          </div>
          {showParams ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          style={{
            padding: '1rem', borderRadius: '14px', border: '1px solid #e5e7eb',
            background: showBreakdown ? '#f0fdf4' : '#fff', color: showBreakdown ? 'var(--primary)' : 'var(--text-dark)',
            fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer'
          }}
        >
          <Info size={20} />
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
                {/* Stay Section */}
                <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>🏨 Accomodation & Stay</p>
                      <Checkbox label={includeStay ? "Included" : "Include?"} checked={includeStay} onChange={setIncludeStay} icon={Hotel} color="#8b5cf6" />
                   </div>
                   <AnimatePresence>
                      {includeStay && (
                         <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                            <Slider label="Total Nights" value={hotelNights} min={1} max={15} step={1} unit="Nights" onChange={setHotelNights} color="#8b5cf6" />
                            <Slider label="Avg Room Rate" value={hotelPrice} min={2000} max={50000} step={500} unit="PKR/Night" onChange={setHotelPrice} color="#8b5cf6" />
                         </motion.div>
                      )}
                   </AnimatePresence>
                </div>
                
                <div style={{ height: '1px', background: '#f1f5f9' }} />

                {/* Food Section */}
                <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>🍎 Group & Food</p>
                      <Checkbox label={includeFood ? "Included" : "Include?"} checked={includeFood} onChange={setIncludeFood} icon={Utensils} color="#ec4899" />
                   </div>
                   <AnimatePresence>
                      {includeFood && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                           <Slider label="Number of People" value={numPersons} min={1} max={12} step={1} unit="Persons" onChange={setNumPersons} color="#ec4899" />
                           <Slider label="Daily Food per Person" value={foodBudget} min={500} max={10000} step={250} unit="PKR/Day" onChange={setFoodBudget} color="#ec4899" />
                        </motion.div>
                      )}
                   </AnimatePresence>
                </div>

                <div style={{ height: '1px', background: '#f1f5f9' }} />

                {/* Fuel & Tolls Section */}
                <div>
                   <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem', fontWeight: 700, textTransform: 'uppercase' }}>⛽ Vehicle & Fuel</p>
                   <Slider label="Fuel Avg (Lower Range)" value={fuelAvgMin} min={5} max={20} step={0.5} unit="km/L" onChange={setFuelAvgMin} color="#10b981" />
                   <Slider label="Petrol Price" value={petrolPrice} min={200} max={500} step={1} unit="PKR/L" onChange={setPetrolPrice} color="#3b82f6" />
                   <Slider label="Est. Tolls (Per Way)" value={tollTax} min={0} max={10000} step={100} unit="PKR" onChange={setTollTax} color="#3b82f6" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Calculation Breakdown Section */}
      <AnimatePresence>
        {showBreakdown && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', color: 'var(--text-dark)', fontWeight: 700 }}>
                <TrendingUp size={18} color="var(--primary)" />
                Detailed Cost Math
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.85rem' }}>
                {/* Fuel Row */}
                <div>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                      <span>Transport (Fuel + Tolls)</span>
                      <span>{fmt(calc.costHigh + calc.totalTolls)} PKR</span>
                   </div>
                   <div style={{ fontSize: '0.72rem', opacity: 0.7, fontStyle: 'italic', marginTop: '2px' }}>
                      ({fmt(dist)} km / {fuelAvgMin} km/L) × {petrolPrice} PKR + {calc.totalTolls} PKR
                   </div>
                </div>

                {/* Hotel Row */}
                {includeStay && (
                   <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                         <span>Accommodation</span>
                         <span>{fmt(calc.totalHotels)} PKR</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.7, fontStyle: 'italic', marginTop: '2px' }}>
                         {hotelNights} nights × {fmt(hotelPrice)} PKR per night
                      </div>
                   </div>
                )}

                {/* Food Row */}
                {includeFood && (
                   <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
                         <span>Food & Meals</span>
                         <span>{fmt(calc.totalFood)} PKR</span>
                      </div>
                      <div style={{ fontSize: '0.72rem', opacity: 0.7, fontStyle: 'italic', marginTop: '2px' }}>
                         {numPersons} persons × {hotelNights + 1} days × {fmt(foodBudget)} PKR/day
                      </div>
                   </div>
                )}

                {/* Total Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', marginTop: '0.25rem', borderTop: '2px solid #e2e8f0' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>Total Travel Budget</span>
                  <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--primary)' }}>{fmt(calc.grandTotalHigh)} PKR</span>
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: '#ecfdf5', borderRadius: '10px', display: 'flex', gap: '0.75rem' }}>
                <AlertCircle size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '0.72rem', color: 'var(--text-dark)', lineHeight: 1.5 }}>
                  This estimate is for planning purposes. We recommend carrying a 15-20% cash buffer for emergencies, unpredictable tolls, or extra excursions.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
