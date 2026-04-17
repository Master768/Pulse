/**
 * NAVBAR COMPONENT
 * 
 * This is the global navigation bar. It provides:
 * 1. PERSISTENT NAV: Links to core pages like Dashboard and Focus.
 * 2. AUTHENTICATION: Profile and Logout controls.
 * 3. REAL-TIME MONITOR: Shows an indicator if a Focus Session is currently active.
 * 4. RESPONSIVE DESIGN: Includes a mobile-friendly hamburger menu.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTimer } from '../../context/TimerContext';
import { LogOut, LayoutDashboard, Calendar, Settings, PlusCircle, Zap, User, Menu, X, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const { isActive, isPaused } = useTimer(); // Context hooks for checking active focus sessions
  const navigate = useNavigate();
  const location = useLocation();
  
  // UI States
  const [scrolled, setScrolled] = useState(false); // Changes appearance on scroll
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * SCROLL EFFECT
   * Adds a glassmorphism/shadow effect when the user scrolls down.
   */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  /**
   * NAVIGATION SCHEMA
   * Defined centrally to make it easy to add new links.
   */
  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Focus', path: '/focus', icon: <Clock size={18} /> },
    { name: 'Log Daily', path: '/log', icon: <PlusCircle size={18} /> },
    { name: 'History', path: '/reports', icon: <Calendar size={18} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={18} /> },
  ];

  const Brand = () => (
    <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group">
      <div className="p-2 bg-primary text-white rounded-xl shadow-md group-hover:bg-accent transition-all duration-300 transform group-hover:scale-110">
        <Zap size={22} fill="white" />
      </div>
      <span className="text-2xl font-extrabold tracking-tight text-[#111827] font-display">
        PULSE
      </span>
    </Link>
  );

  // Don't show navbar on login/signup pages to maintain focus
  if (['/login', '/signup'].includes(location.pathname)) return null;

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md py-3 border-b border-slate-100 shadow-sm' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center">
          <Brand />

          {/* DESKTOP NAVIGATION (Hidden on mobile) */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.path}
                  to={link.path} 
                  className={`text-sm font-semibold transition-all flex items-center gap-2 ${location.pathname === link.path ? 'text-primary' : 'text-slate-500 hover:text-slate-900'}`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}

              {/* ACTIVE SESSION INDICATOR: Shows a pulsing badge if the timer is running */}
              {(isActive || isPaused) && location.pathname !== '/focus' && (
                <Link to="/focus" className="flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-100 text-teal-600 font-bold text-[10px] uppercase tracking-widest rounded-full shadow-sm animate-pulse cursor-pointer hover:bg-teal-100 transition-colors">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping absolute" />
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500 relative" />
                  Session Running
                </Link>
              )}
              
              <div className="h-4 w-px bg-slate-200" />
              <button 
                onClick={handleLogout}
                className="text-sm font-semibold text-slate-400 hover:text-error transition-colors flex items-center gap-2"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>
          ) : (
            /* GUEST NAVIGATION */
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                Log In
              </Link>
              <Link to="/signup" className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-800 transition-all">
                Get Started
              </Link>
            </div>
          )}

          {/* MOBILE TOGGLE (Hidden on desktop) */}
          <div className="md:hidden">
             <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
             </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY (Dropdown) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-100 p-6 shadow-lg"
          >
             <div className="space-y-4">
                {isAuthenticated ? navLinks.map(link => (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-base font-semibold text-slate-900 bg-slate-50 rounded-xl"
                  >
                    {link.icon}
                    {link.name}
                  </Link>
                )) : (
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-base font-semibold text-slate-900 bg-slate-50 rounded-xl">Login</Link>
                )}
                {/* Mobile Active Indicator */}
                {isAuthenticated && (isActive || isPaused) && location.pathname !== '/focus' && (
                  <Link 
                    to="/focus" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-base font-bold text-teal-600 bg-teal-50 border border-teal-100 rounded-xl animate-pulse"
                  >
                    <Clock size={18} className="text-teal-500" />
                    Session Running
                  </Link>
                )}
                {isAuthenticated && (
                  <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-error font-semibold text-base">Logout</button>
                )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;


