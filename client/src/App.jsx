/**
 * MAIN APP COMPONENT
 * 
 * This is the "Skeleton" of the Pulse frontend. It defines:
 * 1. GLOBAL STATE: Wraps the app in Auth and Timer providers.
 * 2. ROUTING: Maps browser URLs to specific page components.
 * 3. SECURITY: Uses a ProtectedRoute wrapper to guard private pages.
 */

import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import { motion } from 'framer-motion';

// --- PERFORMANCE: LAZY LOADING ---
// Only downloads the code for a page when the user actually navigates to it.
// This makes the initial website load much faster.
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DailyLog = lazy(() => import('./pages/DailyLog'));
const Reports = lazy(() => import('./pages/Reports'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Settings = lazy(() => import('./pages/Settings'));
const FocusTimerPage = lazy(() => import('./pages/FocusTimerPage'));

/**
 * LOADING FALLBACK
 * The UI shown while Lazy Loaded components are downloading.
 */
const LoadingFallback = () => (
  <div className="pt-32 flex items-center justify-center min-h-screen bg-[#F8FBFB]">
    <motion.div 
      animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="w-12 h-12 bg-primary rounded-3xl shadow-lg" 
    />
  </div>
);

function App() {
  return (
    // 1. PROVIDERS: Give the entire app access to User and Timer data
    <AuthProvider>
      <TimerProvider>
        <Router>
          <div className="min-h-screen bg-[#F8FBFB] font-body">
          <Navbar />
          <main>
            {/* 2. SUSPENSE: Handles the loading state for lazy components */}
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* PUBLIC ROUTES: Anyone can see landing and login */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* PROTECTED ROUTES: Only logged-in users can enter this section */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/log" element={<DailyLog />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/focus" element={<FocusTimerPage />} />
                </Route>

                {/* 404 CATCH-ALL: Redirects invalid URLs to the landing page */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
          </div>
        </Router>
      </TimerProvider>
    </AuthProvider>
  );
}

export default App;

