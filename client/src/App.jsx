import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TimerProvider } from './context/TimerContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Navbar from './components/common/Navbar';
import { motion } from 'framer-motion';

// Lazy load pages for performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DailyLog = lazy(() => import('./pages/DailyLog'));
const Reports = lazy(() => import('./pages/Reports'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Settings = lazy(() => import('./pages/Settings'));
const FocusTimerPage = lazy(() => import('./pages/FocusTimerPage'));

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
    <AuthProvider>
      <TimerProvider>
        <Router>
          <div className="min-h-screen bg-[#F8FBFB] font-body">
          <Navbar />
          <main>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/log" element={<DailyLog />} />
                  <Route path="/reports" element={<Reports />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/focus" element={<FocusTimerPage />} />
                </Route>

                {/* Catch all */}
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
