/**
 * FOCUS TIMER PAGE
 * 
 * This page provides a "Deep Work" environment for users.
 * It integrates with the global TimerContext to track time and handles the 
 * "Session Summary" logic once the user finishes.
 * 
 * Key Features:
 * 1. VISUAL TIMER: A circular progress ring (SVG) showing remaining time.
 * 2. SESSION SCORING: Automatically calculates "Focus Quality" based on duration and pauses.
 * 3. BACKEND SYNC: Saves completed focus sessions to the database to influence ML models.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Square, AlertCircle, RefreshCcw, ArrowRight, Award, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useTimer } from '../context/TimerContext';

const FocusTimerPage = () => {
  // --- TIMER CONTEXT ---
  const { 
    isActive, isPaused, activeSeconds, targetMinutes, setTargetMinutes, 
    isFinished, pauses, startTimer, pauseTimer, stopTimer, resetTimer 
  } = useTimer();

  // --- LOCAL STATE ---
  const [sessionSummary, setSessionSummary] = useState(null); // Metadata about the session just ended
  const [syncStatus, setSyncStatus] = useState('idle'); // Tracking the save-to-db process
  const [predictionResult, setPredictionResult] = useState(null); // Real-time ML feedback after saving
  const navigate = useNavigate();

  /**
   * NAVIGATION GUARD
   * Prevents accidental page exits during an active session (useful for long Pomodoros).
   */
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isActive || isPaused || (sessionSummary && syncStatus !== 'success')) {
        const message = "You have an active or unsaved focus session! Are you sure you want to leave?";
        e.returnValue = message;
        return message;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isActive, isPaused, sessionSummary, syncStatus]);

  /**
   * AUTOMATIC COMPLETION
   * Triggers the summary view once the TimerContext signals the timer hit zero.
   */
  useEffect(() => {
    if (isFinished && !sessionSummary && activeSeconds > 0) {
      // Play a classic chime/bell sound when the timer completes
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(err => console.log("Audio playback failed:", err));
      
      handleStop();
    }
  }, [isFinished, sessionSummary, activeSeconds]);

  /**
   * SESSION SCORING Logic
   * Calculates the 'Quality Score' based on how many times the user got distracted (paused).
   */
  const handleStop = () => {
    stopTimer();

    // 1. Calculate active minutes
    const durationMins = Math.max(0, Math.round(activeSeconds / 60)); 
    
    // 2. Compute Quality Score (Scale 1-5)
    // We start at 5 and deduct 0.6 for every pause.
    let quality = 5 - (pauses * 0.6);
    if (quality < 1) quality = 1;

    // 3. Determine Distraction Label
    let distraction = 'None';
    if (pauses >= 2 && pauses <= 4) distraction = 'Mild';
    else if (pauses >= 5) distraction = 'Heavy';

    setSessionSummary({
      durationMins, 
      quality: Number(quality.toFixed(1)),
      distraction,
      pauses
    });
  };

  /**
   * BACKEND SYNCHRONIZATION
   * Sends the focus session data to /logs/focus.
   * Note: Requires a daily performance log for today to exist first.
   */
  const handleSaveSession = async () => {
    setSyncStatus('syncing');
    try {
      const res = await api.post('/logs/focus', {
        focusDurationMins: sessionSummary.durationMins,
        focusQualityScore: sessionSummary.quality,
        distractionLevel: sessionSummary.distraction
      });
      // The API returns the updated ML prediction after our session is added
      setPredictionResult(res.data.data.prediction);
      setSyncStatus('success');
    } catch (err) {
      if (err.response?.status === 400) {
        setSyncStatus('missing_log'); // Error: User needs to log sleep/activity first
      } else {
        setSyncStatus('error');
      }
    }
  };

  const handleReset = () => {
    setSessionSummary(null);
    setSyncStatus('idle');
    setPredictionResult(null);
    resetTimer();
  };

  // Helper to turn seconds into MM:SS
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // --- RENDER: SESSION SUMMARY VIEW ---
  if (sessionSummary) {
    return (
      <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto animate-fade-in flex flex-col items-center justify-center min-h-[80vh]">
        <div className="pro-card rounded-3xl p-10 max-w-md w-full mx-auto relative overflow-hidden group border-teal-100 shadow-2xl shadow-teal-500/10">
          <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-teal-100/30 opacity-80" />
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-100 text-teal-600 mb-6 shadow-inner">
              <Award size={40} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Session Summary</h2>
            <p className="text-slate-500 mb-8">Ready to lock it in?</p>
            
            {/* Summary Metrics */}
            <div className="grid grid-cols-2 gap-4 mb-8 text-left">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Time</span>
                <p className="text-3xl font-bold text-slate-900">{sessionSummary.durationMins}<span className="text-sm text-slate-500 ml-1">m</span></p>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Score</span>
                <div className="flex items-end gap-1">
                  <p className="text-3xl font-bold text-slate-900">{sessionSummary.quality}</p>
                  <span className="text-sm text-slate-400 mb-1">/5</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 col-span-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Distraction</span>
                  <div className={`px-3 py-1 pb-1.5 rounded-full inline-block mt-1 font-bold text-sm ${sessionSummary.distraction === 'Heavy' ? 'bg-coral-50 text-coral-600 border border-coral-200' : sessionSummary.distraction === 'Mild' ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-teal-50 text-teal-600 border border-teal-200'}`}>
                     {sessionSummary.distraction}
                  </div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl text-center min-w-[3.5rem] border border-slate-100">
                  <span className="block text-2xl font-bold text-slate-700 leading-none">{sessionSummary.pauses}</span>
                  <span className="block text-[9px] uppercase font-bold text-slate-400 mt-1">Pauses</span>
                </div>
              </div>
            </div>
            
            {/* Sync Logic Rendering */}
            <div className="flex flex-col gap-3">
               {syncStatus === 'missing_log' ? (
                 <div className="space-y-4">
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-sm text-center font-medium shadow-sm">
                      Daily Log not found. Please log your performance for today before saving.
                    </div>
                    <button onClick={() => navigate('/log')} className="btn-primary w-full flex items-center justify-center gap-3 py-4 shadow-amber-500/20 bg-amber-500 hover:bg-amber-600">
                      Submit Daily Log <ArrowRight size={20} />
                    </button>
                 </div>
               ) : syncStatus === 'success' ? (
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 bg-slate-900 text-white rounded-3xl border border-white/10 shadow-xl"
                 >
                    <div className="flex items-center gap-3 mb-4 text-left">
                       <div className="p-2 bg-primary rounded-lg text-white"><Zap size={20} /></div>
                       <h4 className="font-bold text-lg">Focus Insight</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                       <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Score</span>
                          <span className="text-2xl font-bold text-primary">{Math.round(predictionResult?.productivity_score || 85)}%</span>
                       </div>
                       <div className="bg-white/5 p-4 rounded-2xl border border-white/5 text-left">
                          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest block mb-1">Risk</span>
                          <span className={`text-sm font-bold ${predictionResult?.burnout_risk === 'High' ? 'text-coral-400' : 'text-teal-400'}`}>{predictionResult?.burnout_risk || 'Low'}</span>
                       </div>
                    </div>
                    <button onClick={handleReset} className="w-full py-4 bg-primary hover:bg-accent text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all">
                       Finish Session <ArrowRight size={18} />
                    </button>
                 </motion.div>
               ) : (
                 <button onClick={handleSaveSession} disabled={syncStatus === 'syncing'} className="btn-primary w-full flex items-center justify-center gap-3 py-4 shadow-teal-500/20 bg-teal-500 hover:bg-teal-600 disabled:opacity-70">
                   {syncStatus === 'syncing' ? 'Saving Session...' : 'Save Session'}
                 </button>
               )}
               
               {(syncStatus === 'idle' || syncStatus === 'error') && (
                 <button onClick={handleReset} className="w-full flex items-center justify-center gap-3 py-4 text-slate-500 font-bold uppercase tracking-widest text-xs hover:text-slate-900 transition-colors mt-2">
                   <RefreshCcw size={16} /> Discard & Return
                 </button>
               )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Visual Ring computation maxed to total time
  const progress = activeSeconds / (targetMinutes * 60);
  const timeLeftSeconds = Math.max(0, targetMinutes * 60 - activeSeconds);
  
  // --- RENDER: TIMER VIEW ---
  return (
    <div className="pt-32 pb-24 px-6 max-w-7xl mx-auto animate-fade-in flex flex-col items-center justify-center min-h-[80vh]">
      <div className="pro-card rounded-3xl p-12 max-w-md w-full mx-auto text-center border-slate-100 shadow-2xl shadow-teal-500/5 relative">
        
        <div className="mb-4">
           <h2 className="text-3xl font-bold text-slate-900 mb-2">Deep Focus</h2>
           <p className="text-slate-500 text-sm max-w-[200px] mx-auto">Minimize distractions. Complete your Pomodoro interval.</p>
        </div>
        
        {/* Interval Adjuster (Only visible before starting) */}
        {!isActive && activeSeconds === 0 && (
          <div className="flex items-center justify-center gap-4 mb-4">
             <button onClick={() => setTargetMinutes(Math.max(5, targetMinutes - 5))} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-colors">-</button>
             <span className="text-sm font-bold text-slate-700 w-16 text-center">{targetMinutes} mins</span>
             <button onClick={() => setTargetMinutes(Math.min(120, targetMinutes + 5))} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-colors">+</button>
          </div>
        )}
        
        {/* TIMER RING */}
        <div className="relative w-72 h-72 mx-auto mb-12 flex items-center justify-center">
          {/* Background SVG Circle */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-sm">
            <circle 
              cx="50%" cy="50%" r="130" 
              className="stroke-slate-50" 
              strokeWidth="10" fill="none" 
            />
            {isActive && (
              <motion.circle 
                cx="50%" cy="50%" r="130" 
                className={`stroke-current ${isPaused ? 'text-amber-400' : 'text-teal-500'}`} 
                strokeWidth="10" fill="none" 
                strokeDasharray="816" 
                initial={{ strokeDashoffset: 816 }}
                animate={{ strokeDashoffset: 816 - (816 * progress) }}
                transition={{ duration: 1, ease: "linear" }}
                strokeLinecap="round" 
              />
            )}
          </svg>
          
          <div className="z-10 flex flex-col items-center">
            {/* Countdown Text */}
            <motion.div 
               key={activeSeconds}
               initial={{ scale: 0.95, opacity: 0.8 }}
               animate={{ scale: 1, opacity: 1 }}
               transition={{ duration: 0.2 }}
               className={`text-7xl font-bold tracking-tighter ${isPaused ? 'text-amber-500' : 'text-slate-900'}`}
               style={{ fontVariantNumeric: 'tabular-nums' }}
            >
               {formatTime(timeLeftSeconds)}
            </motion.div>
            
            <AnimatePresence>
               {pauses > 0 && (
                 <motion.span 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="mt-4 flex items-center gap-1.5 px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] uppercase font-bold tracking-widest rounded-full"
                 >
                    <AlertCircle size={14} /> Paused {pauses} time{pauses !== 1 && 's'}
                 </motion.span>
               )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* CONTROLS */}
        <div className="flex justify-center gap-6">
          {!isActive ? (
            <button onClick={startTimer} className="w-20 h-20 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-xl shadow-teal-500/30 transition-transform hover:scale-105 active:scale-95">
              <Play size={32} />
            </button>
          ) : (
            <AnimatePresence>
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex gap-5">
                {isPaused ? (
                  <button onClick={startTimer} className="w-16 h-16 bg-teal-500 hover:bg-teal-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-teal-500/30 transition-transform active:scale-95">
                    <Play size={24} />
                  </button>
                ) : (
                  <button onClick={pauseTimer} className="w-16 h-16 bg-amber-400 hover:bg-amber-500 text-white rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30 transition-transform active:scale-95">
                    <Pause size={24} />
                  </button>
                )}
                <button onClick={handleStop} className="w-16 h-16 bg-rose-500 hover:bg-rose-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-rose-500/30 transition-transform active:scale-95">
                  <Square size={24} />
                </button>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};

export default FocusTimerPage;

