import { apiClient } from './apiClient';

export interface ChefProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  specialty: string;
  experience: number;
  hourlyRate: number;
  description: string;
  cuisineTypes: string[];
  serviceTypes: string[];
  serviceAreas: Array<{
    city: string;
    zipCodes: string[];
    maxDistance: number;
  }>;
  certifications: Array<{
    name: string;
    issuer: string;
    dateObtained: string;
    expiryDate?: string;
  }>;
  documents: {
    cv: { uploaded: boolean; url?: string; uploadedAt?: string };
    insurance: { uploaded: boolean; url?: string; uploadedAt?: string };
    healthCertificate: { uploaded: boolean; url?: string; uploadedAt?: string };
    businessLicense: { uploaded: boolean; url?: string; uploadedAt?: string };
  };
  portfolio: {
    images: string[];
    description: string;
  };
  verification: {
    status: 'pending' | 'approved' | 'rejected';
    verifiedAt?: string;
  };
  rating: {
    average: number;
    count: number;
  };
}

export interface ChefMenu {
  _id: string;
  name: string;
  description: string;
  price: number;
  type: 'forfait' | 'horaire';
  category: string;
  courses: string[];
  ingredients: string[];
  allergens: string[];
  dietaryOptions: string[];
  duration: string;
  minGuests: number;
  maxGuests: number;
  image?: string;
  isActive: boolean;
}

export interface Mission {
  id: string;
  client: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  date: string;
  time: string;
  duration: string;
  guests: number;
  type: string;
  location: string;
  price: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  specialRequests: string;
  urgency: 'normal' | 'urgent';
  submittedAt: string;
}

export interface Earnings {
  id: string;
  date: string;
  client: string;
  type: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: 'paid' | 'pending' | 'processing';
  rating?: number;
  review?: string;
}

export const chefService = {
  // Profile Management
  async getProfile(): Promise<ChefProfile> {
    const response = await apiClient.get('/chefs/me/profile');
    return response.data.chef;
  },

  async updateProfile(profileData: Partial<ChefProfile>): Promise<ChefProfile> {
    const response = await apiClient.put('/chefs/me/profile', profileData);
    return response.data.chef;
  },

  async uploadDocument(documentType: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', documentType);

    const response = await apiClient.post('/chefs/me/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async uploadPortfolioImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post('/chefs/me/portfolio/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Menu Management
  async getMenus(): Promise<ChefMenu[]> {
    const response = await apiClient.get('/chefs/me/menus');
    return response.data.menus;
  },

  async createMenu(menuData: Partial<ChefMenu>): Promise<ChefMenu> {
    const response = await apiClient.post('/chefs/me/menus', menuData);
    return response.data.menu;
  },

  async updateMenu(_id: string, menuData: Partial<ChefMenu>): Promise<ChefMenu> {
    const response = await apiClient.put(`/chefs/me/menus/${_id}`, menuData);
    return response.data.menu;
  },

  async deleteMenu(_id: string): Promise<void> {
    await apiClient.delete(`/chefs/me/menus/${_id}`);
  },

  // Planning & Missions
  async getMissions(params?: { status?: string; page?: number; limit?: number }): Promise<{ missions: any[]; pagination: any; }> {
    const response = await apiClient.get('/chefs/me/bookings', { params });
    return response.data;
  },

  async updateMissionStatus(missionId: string, status: string, note?: string): Promise<Mission> {
    const response = await apiClient.put(`/bookings/${missionId}/status`, { status, note });
    return response.data.mission;
  },

  async getAvailability(): Promise<any> {
    const response = await apiClient.get('/chefs/me/availability');
    return response.data.availability;
  },

  async updateAvailability(availability: any): Promise<any> {
    const response = await apiClient.put('/chefs/me/availability', availability);
    return response.data.availability;
  },

  async acceptMission(missionId: string): Promise<Mission> {
    const response = await apiClient.post(`/chefs/me/missions/${missionId}/accept`);
    return response.data.mission;
  },

  async declineMission(missionId: string, reason?: string): Promise<void> {
    await apiClient.post(`/chefs/me/missions/${missionId}/decline`, { reason });
  },

  // Earnings & Statistics
  async getEarnings(params?: { period?: string; page?: number; limit?: number }): Promise<{
    earnings: {
      daily: Earnings[];
      total: any;
      monthly: any;
    };
    summary: any; // This summary is from the backend's top-level response, not the nested earnings object
    pagination: any;
  }> {
    const response = await apiClient.get('/chefs/me/earnings', { params });
    return response.data;
  },

  async getStatistics(period?: string): Promise<any> {
    const response = await apiClient.get('/chefs/me/statistics', { params: { period } });
    return response.data.statistics;
  },

  async exportEarnings(format: 'csv' | 'pdf', period?: string): Promise<Blob> {
    const response = await apiClient.get('/chefs/me/earnings/export', {
      params: { format, period },
      responseType: 'blob'
    });
    return response.data;
  },

  // Public Chef Listing
  async getChefs(params?: {
    page?: number;
    limit?: number;
    city?: string;
    cuisineType?: string;
    serviceType?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<{
    chefs: any[]; // Use 'any' for now, define a proper interface later if needed
    pagination: any;
  }> {
    const response = await apiClient.get('/chefs', { params });
    return response.data;
  }
};