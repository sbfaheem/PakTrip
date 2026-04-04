import React, { useState } from 'react';
import { Award, Map, Settings, LogOut, ChevronRight, Edit2, Shield, Save, X, Camera, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
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

const SettingItem = ({ icon: Icon, label, color, onClick }) => (
  <div 
    onClick={onClick}
    style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 0', borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}
  >
    <div style={{ color: color || 'var(--text-dark)' }}><Icon size={20} /></div>
    <span style={{ flex: 1, fontSize: '0.925rem', fontWeight: 500 }}>{label}</span>
    <ChevronRight size={18} color="#9ca3af" />
  </div>
);

const Profile = () => {
  const { user, login, logout, updateUser, getStats } = useTrips();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...user });
  const stats = getStats();

  const handleSave = () => {
    updateUser(editForm);
    setIsEditing(false);
  };

  const handleGoogleSuccess = (credentialResponse) => {
    // In a real app, you'd decode the JWT here.
    // Simulating user data extraction:
    const mockUserData = {
      name: 'Syed Bilal',
      email: 'bilal@paktrip.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      level: 'Elite Explorer',
      bio: 'Exploring the hidden gems of Pakistan from Khyber to Karachi.'
    };
    login(mockUserData);
    setEditForm(mockUserData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ paddingBottom: '2rem' }}
    >
      {/* Header / Top Info */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 1rem', position: 'relative' }}>
        
        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', border: '4px solid #fff', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
            <img src={isEditing ? editForm.avatar : user.avatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <button 
            onClick={() => setIsEditing(!isEditing)}
            style={{ 
              position: 'absolute', bottom: '0', right: '0', 
              background: isEditing ? '#ef4444' : 'var(--primary)', 
              padding: '0.5rem', borderRadius: '50%', color: 'white', border: '3px solid white',
              boxShadow: 'var(--shadow-sm)', cursor: 'pointer'
            }}
          >
            {isEditing ? <X size={14} /> : <Edit2 size={14} />}
          </button>
          
          {isEditing && (
            <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', background: 'rgba(0,0,0,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
               <Camera size={24} color="white" />
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!isEditing ? (
            <motion.div 
              key="view"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              style={{ textAlign: 'center' }}
            >
              <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{user.name}</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '0.75rem', maxWidth: '250px' }}>{user.bio}</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ecfdf5', padding: '0.25rem 0.75rem', borderRadius: '2rem', border: '1px solid #10b98150' }}>
                  <Shield size={12} color="var(--primary)" fill="var(--primary)" />
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>{user.level}</span>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="edit"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              style={{ width: '100%', maxWidth: '400px' }}
            >
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem', paddingLeft: '0.25rem' }}>Full Name</label>
                <input 
                  type="text" 
                  value={editForm.name} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '0.925rem' }}
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#6b7280', marginBottom: '0.25rem', paddingLeft: '0.25rem' }}>Travel Bio</label>
                <textarea 
                  value={editForm.bio} 
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '0.925rem', minHeight: '80px', resize: 'none' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  onClick={handleSave}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--primary)', color: 'white', padding: '0.75rem', borderRadius: '12px', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                >
                  <Save size={18} /> Save Profile
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!user.isAuthenticated && !isEditing && (
        <div style={{ padding: '0 1rem', marginBottom: '2rem' }}>
          <div className="card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, #065f46, #064e3b)', color: 'white', position: 'relative', overflow: 'hidden' }}>
            <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem' }}>Sign in with Google</h3>
            <p style={{ fontSize: '0.825rem', opacity: 0.9, marginBottom: '1.25rem' }}>Connect your account to save your trips and unlock pro badges.</p>
            <GoogleLogin 
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Login Failed')}
              useOneTap
              theme="filled_blue"
              shape="pill"
            />
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', padding: '1.5rem', margin: '0 1rem 2rem 1rem' }}>
        <StatBox label="Total Trips" value={stats.totalTrips} />
        <div style={{ width: '1px', background: '#f3f4f6' }} />
        <StatBox label="Distance" value={stats.totalDistance + ' km'} />
        <div style={{ width: '1px', background: '#f3f4f6' }} />
        <StatBox label="Regions" value={stats.regions} />
      </div>

      {/* Badges section remains similar */}
      <section style={{ marginBottom: '2.5rem', padding: '0 1rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-dark)' }}>Personal Badges</h3>
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', scrollbarWidth: 'none' }}>
            <AchievementBadge icon={Award} name="Northern Nomad" color="#3b82f6" />
            <AchievementBadge icon={Map} name="Gilgit Guru" color="#ec4899" />
            <AchievementBadge icon={Shield} name="Safety Expert" color="#10b981" />
            <AchievementBadge icon={Award} name="Kilometer King" color="#f59e0b" />
        </div>
      </section>

      {/* Settings Section */}
      <section style={{ padding: '0 1rem' }}>
        <SettingItem icon={Mail} label="Email Address" />
        <SettingItem icon={Settings} label="Preferences" />
        <SettingItem icon={Shield} label="Account Security" />
        {user.isAuthenticated && (
          <SettingItem 
            icon={LogOut} 
            label="Log Out" 
            color="#ef4444" 
            onClick={logout}
          />
        )}
      </section>
    </motion.div>
  );
};

export default Profile;
