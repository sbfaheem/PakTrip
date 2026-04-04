import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { useTrips } from '../context/TripContext';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('explorer@paktrip.com');
  const [password, setPassword] = useState('password123');
  const navigate = useNavigate();
  const { login } = useTrips();

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, you'd validate credentials here.
    login({
      name: 'Syed Bilal',
      email: email,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      level: 'Elite Explorer',
      bio: 'Exploring the hidden gems of Pakistan from Khyber to Karachi.'
    });
    navigate('/');
  };

  const handleGoogleSuccess = (response) => {
    login({
      name: 'Syed Bilal',
      email: 'bilal@paktrip.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      level: 'Elite Explorer',
      bio: 'Exploring the hidden gems of Pakistan from Khyber to Karachi.'
    });
    navigate('/');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="app-container"
      style={{ padding: '2rem 1.5rem', minHeight: '100vh', background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <header style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '3rem' }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>PakTrip</h1>
      </header>

      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>Welcome back</h2>
        <p style={{ color: '#6b7280', fontSize: '1rem', maxWidth: '280px', margin: '0 auto' }}>Please enter your details to continue your journey.</p>
      </div>

      <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.75rem' }}>Email Address</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
              <Mail size={20} />
            </div>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="explorer@paktrip.com"
              style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: 'none', background: '#f3f4f6', fontSize: '1rem' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-dark)' }}>Password</label>
            <button type="button" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.825rem', fontWeight: 600 }}>Forgot password?</button>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}>
              <Lock size={20} />
            </div>
            <input 
              type={showPassword ? "text" : "password"} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '1rem 3.5rem 1rem 3.3rem', borderRadius: '12px', border: 'none', background: '#f3f4f6', fontSize: '1rem' }}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#9ca3af' }}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button 
          type="submit"
          style={{ 
            width: '100%', padding: '1.125rem', borderRadius: '2.5rem', background: 'var(--primary)', 
            color: 'white', border: 'none', fontSize: '1.125rem', fontWeight: 700, marginTop: '2.5rem',
            boxShadow: '0 10px 25px -5px rgba(6, 95, 70, 0.4)', cursor: 'pointer'
          }}
        >
          Login
        </button>
      </form>

      <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '400px', margin: '2.5rem 0' }}>
         <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
         <span style={{ padding: '0 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Or Continue With</span>
         <div style={{ flex: 1, height: '1px', background: '#e5e7eb' }} />
      </div>

      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
           <GoogleLogin 
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Login Failed')}
              theme="outline"
              shape="pill"
              width="400"
              text="signup_with"
           />
        </div>
      </div>

      <p style={{ marginTop: 'auto', paddingBottom: '1rem', fontSize: '1rem', color: '#4b5563' }}>
        Don't have an account? <span style={{ color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>Signup</span>
      </p>
    </motion.div>
  );
};

export default Login;
