
import { apiClient } from './apiClient';

export interface B2BMission {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled' | 'confirmed';
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
const normaliseId = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value.id) return String(value.id);
  if (value._id) return String(value._id);
  return String(value);
};

const mapB2BProfileFromApi = (user: any): B2BProfileData => ({
  id: normaliseId(user),
  name: user?.name || '',
  email: user?.email || '',
  company: {
    name: user?.company?.name || '',
    siret: user?.company?.siret || '',
    address: user?.company?.address || '',
    contactPerson: user?.company?.contactPerson || user?.name || ''
  }
});

const extractMissionDetails = (communication: any[]): { title?: string; description?: string } => {
  if (!Array.isArray(communication)) return {};

  for (const entry of communication) {
    if (entry?.type === 'system' && typeof entry?.message === 'string') {
      try {
        const parsed = JSON.parse(entry.message);
        if (parsed?.type === 'mission_details') {
          return {
            title: parsed?.title,
            description: parsed?.description
          };
        }
      } catch (error) {
        // Ignore JSON parsing errors and continue searching
      }
    }
  }

  return {};
};

const mapB2BMissionFromApi = (mission: any): B2BMission => {
  const pricing = mission?.pricing || {};
  const chef = mission?.chef?.user || mission?.chef;
  const details = extractMissionDetails(mission?.communication || []);

  const budget = Number(pricing?.basePrice ?? pricing?.totalAmount ?? 0);

  return {
    id: normaliseId(mission),
    title: details.title || 'Mission B2B',
    description: details.description || '',
    status: mission?.status || 'pending',
    budget,
    chef: chef
      ? {
          name: chef?.name || '',
          email: chef?.email || ''
        }
      : null,
    createdAt: mission?.createdAt ? new Date(mission.createdAt).toISOString() : ''
  };
};

export const b2bService = {
  async getProfile(): Promise<B2BProfileData> {
    const response = await apiClient.get('/b2b/profile');
    return mapB2BProfileFromApi(response.data.user);
  },

  async updateProfile(profileData: Partial<B2BProfileData>): Promise<B2BProfileData> {
    const response = await apiClient.put('/b2b/profile', profileData);
    return mapB2BProfileFromApi(response.data.user);
  },

  async getMissions(params?: { status?: string; page?: number; limit?: number }): Promise<{
    missions: B2BMission[];
    pagination: any;
  }> {
    const response = await apiClient.get('/b2b/missions', { params });
    return {
      missions: Array.isArray(response.data.missions)
        ? response.data.missions.map(mapB2BMissionFromApi)
        : [],
      pagination: response.data.pagination
    };
  },

  async postMission(missionData: Partial<B2BMission>): Promise<B2BMission> {
    const response = await apiClient.post('/b2b/missions', missionData);
    return mapB2BMissionFromApi(response.data.mission);
  },

  async getInvoices(params?: { status?: string; page?: number; limit?: number }): Promise<{
    invoices: any[];
    pagination: any;
  }> {
    const response = await apiClient.get('/b2b/invoices', { params });
    return response.data;
  }
};
