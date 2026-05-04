/**
 * TIMER CONTEXT
 * 
 * This file manages the "Global Clock" for focus sessions. 
 * By using Context, the timer can keep running even if the user navigates 
 * to different pages (e.g., from Focus to Dashboard).
 */

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

import api from '../utils/api';
import { useAuth } from './AuthContext';

const TimerContext = createContext(null);

export const TimerProvider = ({ children }) => {
  const { user } = useAuth();
  // --- TIMER STATE ---
  const [isActive, setIsActive] = useState(false); // Is it currently counting?
  const [isPaused, setIsPaused] = useState(false); // Is it temporarily stopped?
  const [activeSeconds, setActiveSeconds] = useState(0); // Elapsed time in seconds
  const [pauses, setPauses] = useState(0); // Count of how many times they hit pause
  const [targetMinutes, setTargetMinutes] = useState(25); // Goal duration (e.g., Pomodoro 25m)
  const [isFinished, setIsFinished] = useState(false); // Signal that time is up
  
  // A 'ref' is used to store the Interval ID so we can stop it later
  const timerRef = useRef(null);

  /**
   * THE TICKER ENGINE
   * This effect runs whenever the active/paused states change.
   */
  useEffect(() => {
    // Only run if the timer is on AND not paused
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setActiveSeconds(prev => {
           const next = prev + 1;
           // 1. CHECK COMPLETION: Have we reached the goal?
           if (next >= targetMinutes * 60) {
              clearInterval(timerRef.current);
              setIsActive(false);
              setIsFinished(true); // Signal to UI that it finished naturally
              return targetMinutes * 60;
           }
           return next;
        });
      }, 1000); // 1000ms = 1 second
    } else {
      // If paused or inactive, stop the interval
      clearInterval(timerRef.current);
    }

    // Cleanup: Stop the clock if the component unmounts
    return () => clearInterval(timerRef.current);
  }, [isActive, isPaused, targetMinutes]);

  // --- CONTROL FUNCTIONS ---

  const startTimer = () => {
    // --- PERSONA RESTRICTION ENGINE ---
    // If the user is in a critical state, we enforce shorter sessions to prevent burnout.
    let effectiveMinutes = targetMinutes;
    if (user?.persona === 'Restricted Sleep' || user?.persona === 'Under Pressure') {
      if (targetMinutes > 30) {
        effectiveMinutes = 25; // Force Pomodoro standard
        setTargetMinutes(25);
        alert(`Burnout Prevention: Based on your ${user.persona} status, we've adjusted your session to 25 minutes to ensure recovery.`);
      }
    }

    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
      setActiveSeconds(0);
      setPauses(0);
      setIsFinished(false);
    } else if (isPaused) {
      setIsPaused(false); // Resume
    }
  };

  const pauseTimer = () => {
    if (isActive && !isPaused) {
      setIsPaused(true);
      setPauses(p => p + 1); // Track focus interruption
    }
  };

  const stopTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    clearInterval(timerRef.current);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setActiveSeconds(0);
    setPauses(0);
    clearInterval(timerRef.current);
  };

  return (
    <TimerContext.Provider 
      value={{
        isActive,
        isPaused,
        activeSeconds,
        targetMinutes,
        setTargetMinutes,
        isFinished,
        setIsFinished,
        pauses,
        startTimer,
        pauseTimer,
        stopTimer,
        resetTimer
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

/**
 * CUSTOM HOOK: useTimer
 * Convenient way to access timer controls and status from any page.
 */
export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

