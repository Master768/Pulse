import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const TimerContext = createContext(null);

export const TimerProvider = ({ children }) => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeSeconds, setActiveSeconds] = useState(0); 
  const [pauses, setPauses] = useState(0);
  const [targetMinutes, setTargetMinutes] = useState(25);
  const [isFinished, setIsFinished] = useState(false);
  
  const timerRef = useRef(null);

  useEffect(() => {
    // If the timer is active AND not paused, tick every second
    if (isActive && !isPaused) {
      timerRef.current = setInterval(() => {
        setActiveSeconds(prev => {
           const next = prev + 1;
           if (next >= targetMinutes * 60) {
              clearInterval(timerRef.current);
              setIsActive(false);
              setIsFinished(true); // Signal to UI that it finished naturally
              return targetMinutes * 60;
           }
           return next;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, isPaused, targetMinutes]);

  const startTimer = () => {
    if (!isActive) {
      setIsActive(true);
      setIsPaused(false);
      setActiveSeconds(0);
      setPauses(0);
      setIsFinished(false);
    } else if (isPaused) {
      setIsPaused(false);
    }
  };

  const pauseTimer = () => {
    if (isActive && !isPaused) {
      setIsPaused(true);
      setPauses(p => p + 1);
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

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};
