import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'chef' | 'admin' | 'b2b';
  avatar?: string;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  role: 'admin' | 'chef' | 'b2b' | 'client' | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string, email: string, password: string, role: 'client' | 'chef', phone: string }) => Promise<void>;
  googleLogin: () => Promise<void>;
  facebookLogin: () => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Derived states
  const isAuthenticated = !!user;
  const role = user?.role || null;

  useEffect(() => {
    const initAuth = async () => {
      console.log('[AUTH_CONTEXT] Initializing authentication...');
      try {
        const token = localStorage.getItem('token');
        if (token) {
          console.log('[AUTH_CONTEXT] Token found, attempting to fetch user data.');
          // In a real app, you'd verify the token and fetch user data
          // For now, we'll assume the token implies authentication and fetch user data
          const userData = await authService.getCurrentUser(); // Assuming this fetches user details
          setUser(userData);
          console.log('[AUTH_CONTEXT] User data fetched and set.', userData.email);
        }
      } catch (error) {
        console.error('[AUTH_CONTEXT] Auth initialization error:', error);
        localStorage.removeItem('token');
        setUser(null);
        console.log('[AUTH_CONTEXT] Token removed, user cleared due to error.');
      } finally {
        setLoading(false);
        console.log('[AUTH_CONTEXT] Authentication initialization finished.');
      }
    };

    initAuth();
  }, []);

  const handleAuthSuccess = (token: string, userData: User) => {
    console.log('[AUTH_CONTEXT] Handling authentication success for user:', userData.email);
    localStorage.setItem('token', token);
    setUser(userData);
    console.log(userData.role);
    switch (userData.role) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'chef':
        navigate('/chef-dashboard');
        break;
      case 'client':
        navigate('/client-dashboard');
        break;
      case 'b2b':
        navigate('/b2b-dashboard');
        break;
      default:
        navigate('/');
        break;
    }
  };

  const login = async (email: string, password: string) => {
    console.log('[AUTH_CONTEXT] Login action initiated for:', email);
    try {
      const response = await authService.login(email, password);
      handleAuthSuccess(response.token, response.user);
      console.log('[AUTH_CONTEXT] Login action successful for:', email);
    } catch (error) {
      console.error('[AUTH_CONTEXT] Login action failed for:', email, error);
      throw error;
    }
  };

  const register = async (userData: { name: string, email: string, password: string, role: 'client' | 'chef', phone: string }) => {
    console.log('[AUTH_CONTEXT] Register action initiated for:', userData.email);
    try {
      const response = await authService.register(userData);
      handleAuthSuccess(response.token, response.user);
      console.log('[AUTH_CONTEXT] Register action successful for:', userData.email);
    } catch (error) {
      console.error('[AUTH_CONTEXT] Register action failed for:', userData.email, error);
      throw error;
    }
  };

  const googleLogin = async () => {
    console.log('[AUTH_CONTEXT] Google Login action initiated');
    try {
      const response = await authService.googleLogin();
      handleAuthSuccess(response.token, response.user);
      console.log('[AUTH_CONTEXT] Google Login action successful');
    } catch (error) {
      console.error('[AUTH_CONTEXT] Google Login action failed:', error);
      throw error;
    }
  };

  const facebookLogin = async () => {
    console.log('[AUTH_CONTEXT] Facebook Login action initiated');
    try {
      const response = await authService.facebookLogin();
      handleAuthSuccess(response.token, response.user);
      console.log('[AUTH_CONTEXT] Facebook Login action successful');
    } catch (error) {
      console.error('[AUTH_CONTEXT] Facebook Login action failed:', error);
      throw error;
    }
  };
  const logout = () => {
    console.log('[AUTH_CONTEXT] Logout action initiated');
    localStorage.removeItem('token');
    setUser(null);
    console.log('[AUTH_CONTEXT] User logged out.');
  };

  const updateUser = (userData: Partial<User>) => {
    console.log('[AUTH_CONTEXT] Update user action initiated with data:', userData);
    setUser(prev => prev ? { ...prev, ...userData } : null);
    console.log('[AUTH_CONTEXT] User data updated.');
  };

  const value = {
    user,
    role,
    isAuthenticated,
    loading,
    login,
    register,
    googleLogin,
    facebookLogin,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};