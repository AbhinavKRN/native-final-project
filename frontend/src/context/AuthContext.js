import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');
      if (storedToken) {
        setToken(storedToken);
        api.defaults.headers.common.Authorization = `Bearer ${storedToken}`;
      }
      if (storedUser) setUser(JSON.parse(storedUser));
      setLoading(false);
    };
    bootstrap();
  }, []);

  const persistSession = async (sessionToken, sessionUser) => {
    setToken(sessionToken);
    setUser(sessionUser);
    api.defaults.headers.common.Authorization = `Bearer ${sessionToken}`;
    await AsyncStorage.multiSet([
      ['token', sessionToken],
      ['user', JSON.stringify(sessionUser)],
    ]);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    await persistSession(data.token, data.user);
  };

  const register = async (payload) => {
    const { data } = await api.post('/auth/register', payload);
    await persistSession(data.token, data.user);
  };

  const logout = async () => {
    setUser(null);
    setToken(null);
    delete api.defaults.headers.common.Authorization;
    await AsyncStorage.multiRemove(['token', 'user']);
  };

  const refreshUser = async () => {
    try {
      const { data } = await api.get('/users/profile');
      setUser(data.user);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  };

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      setUser,
      refreshUser,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
