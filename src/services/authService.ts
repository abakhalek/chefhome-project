import { apiClient } from './apiClient';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: 'admin' | 'chef' | 'b2b' | 'client';
  };
}

const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    console.log('[AUTH_SERVICE] Attempting login via API for:', email);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      console.log('[AUTH_SERVICE] Login API success for:', email, response.data);
      return response.data;
    } catch (error) {
      console.error('[AUTH_SERVICE] Login API error for:', email, error);
      throw error;
    }
  },

  register: async (userData: { name: string, email: string, password: string, role: 'client' | 'chef', phone: string }): Promise<AuthResponse> => {
    console.log('[AUTH_SERVICE] Attempting registration via API for:', userData.email);
    try {
      const response = await apiClient.post('/auth/register', userData);
      console.log('[AUTH_SERVICE] Registration API success for:', userData.email, response.data);
      return response.data;
    } catch (error) {
      console.error('[AUTH_SERVICE] Registration API error for:', userData.email, error);
      throw error;
    }
  },

  googleLogin: async (): Promise<AuthResponse> => {
    console.log('[AUTH_SERVICE] Initiating Google login process');
    // In a real application, this would redirect to Google OAuth endpoint
    // and then handle the callback.

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'fake-google-token',
          user: { id: '6', email: 'googleuser@example.com', role: 'client' }, // Default to client role for Google login
        });
      }, 1500);
    });
  },

  facebookLogin: async (): Promise<AuthResponse> => {
    console.log('[AUTH_SERVICE] Initiating Facebook login process');
    // In a real application, this would use the Facebook SDK for login

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          token: 'fake-facebook-token',
          user: { id: '7', email: 'facebookuser@example.com', role: 'client' }, // Default to client role for Facebook login
        });
      }, 1500);
    });
  },

  logout: async (): Promise<void> => {
    console.log('[AUTH_SERVICE] Initiating logout');
    // In a real application, this might invalidate a token on the server
    return Promise.resolve();
  },

  async getCurrentUser(): Promise<AuthResponse['user']> {
    const response = await apiClient.get('/auth/me');
    return response.data.user;
  },
};

export default authService;
