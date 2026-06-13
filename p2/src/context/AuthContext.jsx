import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const API_BASE = 'http://127.0.0.1:8083';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('rp_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const normalizeUserPayload = (payload) => {
    if (payload?.user && typeof payload.user === 'object') {
      return payload.user;
    }
    return payload;
  };

  const persistSession = (payload) => {
    const userData = normalizeUserPayload(payload);
    setUser(userData);
    localStorage.setItem('rp_user', JSON.stringify(userData));
    localStorage.setItem('token', payload.token);
    return userData;
  };

  const request = async (path, options = {}) => {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.error || error.message || 'Request failed');
    }

    return response.json();
  };

  const login = async (email, password) => {
    const payload = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    return persistSession(payload);
  };

  const signup = async (userData) => {
    const payload = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        username: userData.email,
        name: userData.name,
        email: userData.email,
        phoneNumber: userData.phoneNumber,
        password: userData.password,
        role: userData.role || '1'
      })
    });
    return payload.user;
  };

  const updateUser = async (updates) => {
    const token = localStorage.getItem('token');
    const response = await request('/users/me', {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    const updatedUser = normalizeUserPayload(response);
    setUser(updatedUser);
    localStorage.setItem('rp_user', JSON.stringify(updatedUser));
    return updatedUser;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('rp_user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, updateUser, logout, loading }}>
      {children}
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
