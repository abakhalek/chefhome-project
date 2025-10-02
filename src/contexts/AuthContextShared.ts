import { createContext } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'chef' | 'admin' | 'b2b';
  avatar?: string;
  isVerified: boolean;
}

export interface AuthContextType {
  user: User | null;
  role: 'admin' | 'chef' | 'b2b' | 'client' | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: { name: string; email: string; password: string; role: 'client' | 'chef'; phone: string }) => Promise<void>;
  googleLogin: () => Promise<void>;
  facebookLogin: () => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
