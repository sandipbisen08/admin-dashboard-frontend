import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const logout = useCallback(() => {
    // Remove token from localStorage
    localStorage.removeItem('token');
    
    // Remove token from axios headers
    delete api.defaults.headers.common['Authorization'];
    
    // Reset state
    setToken('');
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to login
    navigate('/login');
  }, [navigate]);

  // Set auth token in axios headers and initialize user state
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          const decoded = jwtDecode(storedToken);
          const currentTime = Date.now() / 1000;
          
          if (decoded.exp < currentTime) {
            // Token expired
            logout();
            return;
          }
          
          // Set token in axios headers
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          
          // Fetch user data
          const response = await api.get('/auth/me');
          setUser(response.data);
          setIsAuthenticated(true);
        } catch (err) {
          console.error('Error initializing auth:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [logout]);

  // Login user
  const login = async (email, password) => {
    try {
      setError('');
      const response = await api.post('/auth/login', { email, password });
      
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      setError('');
      const response = await api.post('/auth/register', userData);
      
      const { token, user } = response.data;
      
      // Store token in localStorage
      localStorage.setItem('token', token);
      
      // Set token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Update state
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Check if user has required role
  const hasRole = (requiredRole) => {
    if (!user) return false;
    return user.role === requiredRole || user.role === 'admin';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        loading,
        error,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
