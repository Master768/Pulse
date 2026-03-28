import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('pulse_token');
      if (token) {
        try {
          // You might need an endpoint to get the current user profile
          // For now, let's assume we store the user in localStorage too
          const storedUser = JSON.parse(localStorage.getItem('pulse_user'));
          if (storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
          }
        } catch (err) {
          console.error("Token verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const signup = async (name, email, password) => {
    const res = await api.post('/auth/signup', { name, email, password });
    localStorage.setItem('pulse_token', res.data.token);
    localStorage.setItem('pulse_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    setIsAuthenticated(true);
  };

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('pulse_token', res.data.token);
    localStorage.setItem('pulse_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('pulse_token');
    localStorage.removeItem('pulse_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
