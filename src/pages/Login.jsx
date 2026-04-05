import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTrips } from '../context/TripContext';

const Login = () => {
  const [isSignup, setIsSignup] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('explorer@paktrip.com');
  const [password, setPassword] = useState('password123');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useTrips();

  const from = location.state?.from?.pathname || '/';

  const handleAuth = (e) => {
    e.preventDefault();
    login({
      name: isSignup ? (name || 'New Explorer') : 'Syed Bilal',
      email: email,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      level: 'Elite Explorer',
      bio: 'Exploring the hidden gems of Pakistan from Khyber to Karachi.'
    });
    navigate(from, { replace: true });
  };

  const decodeJWT = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const handleGoogleSuccess = (credentialResponse) => {
    const payload = decodeJWT(credentialResponse.credential);
    if (payload) {
      login({
        name: payload.name,
        email: payload.email,
        avatar: payload.picture,
        level: 'Elite Explorer',
        bio: 'Exploring the hidden gems of Pakistan.',
        joinedDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
      });
      navigate(from, { replace: true });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="app-container"
      style={{ padding: '2rem 1.5rem', minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
    >
      <header style={{ textAlign: 'center', marginTop: '1rem', marginBottom: '2rem' }}>
        <h1 style={{ color: 'var(--primary)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>PakTrip</h1>
      </header>

      <div style={{ width: '100%', maxWidth: '400px', background: 'white', padding: '2.5rem 1.5rem', borderRadius: '2.5rem', boxShadow: '0 20px 50px -12px rgba(0,0,0,0.05)', marginBottom: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>
            {isSignup ? 'Start your journey across Pakistan today.' : 'Please enter your details to continue.'}
          </p>
        </div>

        <div style={{ display: 'flex', padding: '4px', background: '#f1f5f9', borderRadius: '14px', marginBottom: '2rem' }}>
          <button 
            onClick={() => setIsSignup(false)}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: !isSignup ? 'white' : 'transparent', color: !isSignup ? 'var(--primary)' : '#64748b', fontSize: '0.875rem', fontWeight: 700, boxShadow: !isSignup ? '0 4px 12px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s', cursor: 'pointer' }}
          >
            Login
          </button>
          <button 
            onClick={() => setIsSignup(true)}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '10px', border: 'none', background: isSignup ? 'white' : 'transparent', color: isSignup ? 'var(--primary)' : '#64748b', fontSize: '0.875rem', fontWeight: 700, boxShadow: isSignup ? '0 4px 12px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s', cursor: 'pointer' }}
          >
            Signup
          </button>
        </div>

        <form onSubmit={handleAuth} style={{ width: '100%' }}>
          <AnimatePresence mode="wait">
            {isSignup && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ marginBottom: '1.25rem', overflow: 'hidden' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Full Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Name"
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', fontWeight: 600 }}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="explorer@paktrip.com"
                style={{ width: '100%', padding: '1rem 1rem 1rem 3rem', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', fontWeight: 600 }}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              {!isSignup && <button type="button" style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: '0.75rem', fontWeight: 700 }}>Forgot?</button>}
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '1rem 3.5rem 1rem 3rem', borderRadius: '12px', border: '1px solid #f1f5f9', background: '#f8fafc', fontSize: '1rem', fontWeight: 600 }}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit"
            style={{ 
              width: '100%', padding: '1.125rem', borderRadius: '1.25rem', background: 'var(--primary)', 
              color: 'white', border: 'none', fontSize: '1.125rem', fontWeight: 800, marginTop: '1.5rem',
              boxShadow: '0 10px 25px -5px rgba(5, 150, 105, 0.4)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
            }}
          >
            {isSignup ? <UserPlus size={20} /> : <LogIn size={20} />}
            {isSignup ? 'Complete Signup' : 'Secure Login'}
          </button>
        </form>

        <div style={{ position: 'relative', margin: '2rem 0', textAlign: 'center' }}>
           <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#f1f5f9', zIndex: 0 }} />
           <span style={{ position: 'relative', background: 'white', padding: '0 1rem', fontSize: '0.7rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Social Authentication</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
           <GoogleLogin 
              onSuccess={handleGoogleSuccess}
              onError={() => console.log('Login Failed')}
              theme="outline"
              shape="pill"
              useOneTap
              logo_alignment="left"
              text={isSignup ? "signup_with" : "signin_with"}
              width="360"
           />
        </div>
      </div>

      <p style={{ marginTop: 'auto', paddingBottom: '1.5rem', fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>
        {isSignup ? 'Already a member?' : 'New to PakTrip?'} 
        <span 
          onClick={() => setIsSignup(!isSignup)}
          style={{ color: 'var(--primary)', fontWeight: 800, cursor: 'pointer', marginLeft: '0.5rem' }}
        >
          {isSignup ? 'Login here' : 'Sign up now'}
        </span>
      </p>
    </motion.div>
  );
};

export default Login;
