
import { apiClient } from './apiClient';

export interface B2BMission {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  budget: number;
  chef: { name: string; email: string } | null;
  createdAt: string;
}

export interface B2BProfileData {
  id: string;
  name: string;
  email: string;
  company: { name: string; siret: string; address: string; contactPerson: string };
}

export const b2bService = {
  async getProfile(): Promise<B2BProfileData> {
    const response = await apiClient.get('/b2b/profile');
    return response.data.user;
  },

  async updateProfile(profileData: Partial<B2BProfileData>): Promise<B2BProfileData> {
    const response = await apiClient.put('/b2b/profile', profileData);
    return response.data.user;
  },

  async getMissions(params?: { status?: string; page?: number; limit?: number }): Promise<{
    missions: B2BMission[];
    pagination: any;
  }> {
    const response = await apiClient.get('/b2b/missions', { params });
    return response.data;
  },

  async postMission(missionData: Partial<B2BMission>): Promise<B2BMission> {
    const response = await apiClient.post('/b2b/missions', missionData);
    return response.data.mission;
  },

  async getInvoices(params?: { status?: string; page?: number; limit?: number }): Promise<{
    invoices: any[];
    pagination: any;
  }> {
    const response = await apiClient.get('/b2b/invoices', { params });
    return response.data;
  },
};
