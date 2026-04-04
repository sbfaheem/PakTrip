import React from 'react';
import { Award, Map, Settings, LogOut, ChevronRight, Edit2, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTrips } from '../context/TripContext';

const StatBox = ({ label, value }) => (
  <div style={{ flex: 1, textAlign: 'center' }}>
    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary)' }}>{value}</div>
    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{label}</div>
  </div>
);

const AchievementBadge = ({ icon: Icon, name, color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', minWidth: '80px' }}>
    <div style={{ 
      width: '60px', height: '60px', borderRadius: '50%', background: `${color}15`, 
      display: 'flex', alignItems: 'center', justifyContent: 'center', color: color,
      border: `2px solid ${color}30`
    }}>
      <Icon size={24} />
    </div>
    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-dark)' }}>{name}</span>
  </div>
);

const SettingItem = ({ icon: Icon, label, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 0', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}>
    <div style={{ color: color || 'var(--text-dark)' }}><Icon size={20} /></div>
    <span style={{ flex: 1, fontSize: '0.925rem', fontWeight: 500 }}>{label}</span>
    <ChevronRight size={18} color="#9ca3af" />
  </div>
);

const Profile = () => {
  const { user, getStats } = useTrips();
  const stats = getStats();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ paddingBottom: '2rem' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #fff', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <img src={user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ position: 'absolute', bottom: '0', right: '0', background: 'var(--primary)', padding: '0.4rem', borderRadius: '50%', color: 'white', border: '2px solid white' }}>
            <Edit2 size={12} />
          </div>
        </div>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{user.name}</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', padding: '0.25rem 0.75rem', borderRadius: '2rem', border: '1px solid #10b98150' }}>
            <Shield size={12} color="var(--primary)" fill="var(--primary)" />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>{user.level}</span>
        </div>
      </div>

      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', marginBottom: '2rem' }}>
        <StatBox label="Total Trips" value={stats.totalTrips} />
        <div style={{ width: '1px', background: '#f3f4f6' }} />
        <StatBox label="Distance" value={stats.totalDistance + ' km'} />
        <div style={{ width: '1px', background: '#f3f4f6' }} />
        <StatBox label="Regions" value={stats.regions} />
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Personal Badges</h3>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
            <AchievementBadge icon={Award} name="Northern Nomad" color="#3b82f6" />
            <AchievementBadge icon={Map} name="Gilgit Guru" color="#ec4899" />
            <AchievementBadge icon={Shield} name="Safety Expert" color="#10b981" />
            <AchievementBadge icon={Award} name="Kilometer King" color="#f59e0b" />
        </div>
      </section>

      <section>
        <SettingItem icon={Settings} label="Personal Details" />
        <SettingItem icon={Award} label="Travel History" />
        <SettingItem icon={Shield} label="Privacy & Security" />
        <SettingItem icon={LogOut} label="Log Out" color="#ef4444" />
      </section>
    </motion.div>
  );
};

export default Profile;
