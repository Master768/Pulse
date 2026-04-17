/**
 * AUTHENTICATION CONTEXT
 * 
 * This file acts as the "Source of Truth" for user identity across the app.
 * It provides a global state (is the user logged in?) and helper functions 
 * (login, signup, logout) that any component can use.
 */

import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

/**
 * CUSTOM HOOK: useAuth
 * Allows any component to easily grab the user data and auth functions.
 */
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Prevents "flashing" public content while checking for a token
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * ON BOOT: Check for existing session
   * This runs when the website first loads to see if the user has a valid 
   * token saved in their browser's storage.
   */
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('pulse_token');
      if (token) {
        try {
          // Retrieve the user profile from storage
          const storedUser = JSON.parse(localStorage.getItem('pulse_user'));
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.error("Token verification failed:", err);
          logout(); // Clear invalid tokens
        }
      }
      setLoading(false); // Auth check complete
    };

    fetchUser();
  }, []);

  /**
   * SIGNUP Logic
   */
  const signup = async (name, email, password) => {
    const res = await api.post('/auth/signup', { name, email, password });
    // PERSISTENCE: Save token so they stay logged in if they refresh the page
    localStorage.setItem('pulse_token', res.data.token);
    localStorage.setItem('pulse_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    setIsAuthenticated(true);
  };

  /**
   * LOGIN Logic
   */
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('pulse_token', res.data.token);
    localStorage.setItem('pulse_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    setIsAuthenticated(true);
  };

  /**
   * LOGOUT Logic
   */
  const logout = () => {
    localStorage.removeItem('pulse_token');
    localStorage.removeItem('pulse_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    // PROVIDER: Broadcasts the session info to the entire app tree
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

