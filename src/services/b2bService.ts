
import { apiClient } from './apiClient';

export interface B2BMission {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled' | 'confirmed';
  budget: number;
  chef: { id?: string; name: string; email: string } | null;
  createdAt: string;
  assignedChef?: string | null;
}

export interface B2BChef {
  id: string;
  name: string;
  email: string;
  specialty?: string;
  city?: string;
  rate?: number;
  rating?: number;
  availability?: string;
}

export type B2BChefSearchFilters = Partial<{
  specialty: string;
  city: string;
  availability: string;
  minRate: number;
  maxRate: number;
  rating: number;
}> & {
  [key: string]: string | number | boolean | undefined;
};

export interface B2BAnalytics {
  missionCount: number;
  confirmedMissions: number;
  pendingMissions: number;
  averageBudget: number;
  topChefs: Array<{
    id: string;
    name: string;
    completedMissions: number;
  }>;
  revenueByMonth?: Array<{ month: string; total: number }>;
}

export interface B2BProfileData {
  id: string;
  name: string;
  email: string;
  company: { name: string; siret: string; address: string; contactPerson: string };
}

export interface B2BInvoice {
  id: string;
  missionId?: string;
  total?: number;
  status?: string;
  issuedAt?: string;
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}
type ApiObject = Record<string, unknown>;

const toObject = (value: unknown): ApiObject => (typeof value === 'object' && value !== null ? value as ApiObject : {});

const toArray = (value: unknown): ApiObject[] => (Array.isArray(value) ? value as ApiObject[] : []);

const normaliseId = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();

  const valueObj = toObject(value);
  if (typeof valueObj.id === 'string' || typeof valueObj.id === 'number') {
    return String(valueObj.id);
  }
  if (typeof valueObj._id === 'string' || typeof valueObj._id === 'number') {
    return String(valueObj._id);
  }

  return JSON.stringify(valueObj);
};

const mapB2BProfileFromApi = (user: unknown): B2BProfileData => {
  const userObj = toObject(user);
  const companyObj = toObject(userObj.company);

  return {
    id: normaliseId(userObj.id ?? userObj),
    name: typeof userObj.name === 'string' ? userObj.name : '',
    email: typeof userObj.email === 'string' ? userObj.email : '',
    company: {
      name: typeof companyObj.name === 'string' ? companyObj.name : '',
      siret: typeof companyObj.siret === 'string' ? companyObj.siret : '',
      address: typeof companyObj.address === 'string' ? companyObj.address : '',
      contactPerson: typeof companyObj.contactPerson === 'string'
        ? companyObj.contactPerson
        : (typeof userObj.name === 'string' ? userObj.name : '')
    }
  };
};

const extractMissionDetails = (communication: unknown): { title?: string; description?: string } => {
  const entries = toArray(communication);

  for (const entry of entries) {
    if (entry.type === 'system' && typeof entry.message === 'string') {
      try {
        const parsed = JSON.parse(entry.message);
        if (parsed?.type === 'mission_details') {
          return {
            title: typeof parsed.title === 'string' ? parsed.title : undefined,
            description: typeof parsed.description === 'string' ? parsed.description : undefined
          };
        }
      } catch {
        // Ignore JSON parsing errors and continue searching
      }
    }
  }

  return {};
};

const mapB2BChefFromApi = (chef: unknown): B2BChef => {
  const chefObj = toObject(chef);
  const availability = toObject(chefObj.availability || chefObj.availabilityStatus);
  const serviceAreas = toArray(chefObj.serviceAreas);
  const ratingObj = toObject(chefObj.rating);

  return {
    id: normaliseId(chefObj.id ?? chefObj),
    name: typeof chefObj.name === 'string' ? chefObj.name : '',
    email: typeof chefObj.email === 'string' ? chefObj.email : '',
    specialty: typeof chefObj.specialty === 'string'
      ? chefObj.specialty
      : Array.isArray(chefObj.cuisineTypes) && typeof chefObj.cuisineTypes[0] === 'string'
        ? chefObj.cuisineTypes[0]
        : undefined,
    city: serviceAreas.length > 0 && typeof serviceAreas[0].city === 'string'
      ? serviceAreas[0].city
      : (typeof chefObj.city === 'string' ? chefObj.city : undefined),
    rate: typeof chefObj.hourlyRate === 'number' ? chefObj.hourlyRate : undefined,
    rating: typeof ratingObj.average === 'number' ? ratingObj.average : undefined,
    availability: typeof availability.status === 'string' ? availability.status : undefined
  };
};

const mapB2BMissionFromApi = (mission: unknown): B2BMission => {
  const missionObj = toObject(mission);
  const pricing = toObject(missionObj.pricing);
  const chefData = toObject(toObject(missionObj.chef).user ?? missionObj.chef);
  const details = extractMissionDetails(missionObj.communication);

  const budgetCandidate = pricing.basePrice ?? pricing.totalAmount ?? 0;
  const budget = typeof budgetCandidate === 'number' ? budgetCandidate : Number(budgetCandidate);

  const allowedStatuses: B2BMission['status'][] = ['pending', 'accepted', 'completed', 'cancelled', 'confirmed'];
  const statusCandidate = typeof missionObj.status === 'string' ? missionObj.status : undefined;
  const status = allowedStatuses.includes(statusCandidate as B2BMission['status'])
    ? statusCandidate as B2BMission['status']
    : 'pending';

  const createdAt = typeof missionObj.createdAt === 'string'
    ? new Date(missionObj.createdAt).toISOString()
    : '';

  const assignedChefCandidate = missionObj.assignedChef ?? missionObj.chefId;

  return {
    id: normaliseId(missionObj.id ?? missionObj),
    title: typeof details.title === 'string' ? details.title : (typeof missionObj.title === 'string' ? missionObj.title : 'Mission B2B'),
    description: typeof details.description === 'string'
      ? details.description
      : (typeof missionObj.description === 'string' ? missionObj.description : ''),
    status,
    budget: Number.isFinite(budget) ? budget : 0,
    chef: Object.keys(chefData).length > 0
      ? {
          id: normaliseId(chefData.id ?? chefData),
          name: typeof chefData.name === 'string' ? chefData.name : '',
          email: typeof chefData.email === 'string' ? chefData.email : ''
        }
      : null,
    createdAt,
    assignedChef: typeof assignedChefCandidate === 'string' ? assignedChefCandidate : null
  };
};

const mapB2BAnalyticsFromApi = (analytics: unknown): B2BAnalytics => {
  const analyticsObj = toObject(analytics);
  const missionCount = Number(analyticsObj.missionCount ?? analyticsObj.missionsTotal ?? 0);
  const confirmedMissions = Number(analyticsObj.confirmedMissions ?? analyticsObj.missionsConfirmed ?? 0);
  const pendingMissions = Number(analyticsObj.pendingMissions ?? analyticsObj.missionsPending ?? 0);
  const averageBudget = Number(analyticsObj.averageBudget ?? analyticsObj.budgetAverage ?? 0);

  const topChefsSource = toArray(analyticsObj.topChefs);
  const topChefs = topChefsSource.map(entry => ({
    id: normaliseId(entry.id ?? entry),
    name: typeof entry.name === 'string' ? entry.name : '',
    completedMissions: Number(entry.completedMissions ?? entry.missions ?? 0)
  }));

  const revenueByMonthSource = toArray(analyticsObj.revenueByMonth);
  const revenueByMonth = revenueByMonthSource.length
    ? revenueByMonthSource.map(entry => ({
        month: typeof entry.month === 'string' ? entry.month : '',
        total: Number(entry.total ?? 0)
      }))
    : undefined;

  return {
    missionCount,
    confirmedMissions,
    pendingMissions,
    averageBudget,
    topChefs,
    revenueByMonth
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
    pagination: PaginationData | undefined;
  }> {
    const response = await apiClient.get('/b2b/missions', { params });
    const data = toObject(response.data);
    return {
      missions: toArray(data.missions).map(mapB2BMissionFromApi),
      pagination: data.pagination as PaginationData | undefined
    };
  },

  async postMission(missionData: Partial<B2BMission>): Promise<B2BMission> {
    const response = await apiClient.post('/b2b/missions', missionData);
    const data = toObject(response.data);
    return mapB2BMissionFromApi(data.mission);
  },

  async assignChefToMission(missionId: string, chefId: string): Promise<void> {
    await apiClient.post(`/b2b/missions/${missionId}/assign`, { chefId });
  },

  async searchChefs(filters?: B2BChefSearchFilters): Promise<{
    chefs: B2BChef[];
    pagination: PaginationData | undefined;
  }> {
    const response = await apiClient.get('/b2b/chefs', { params: filters });
    const data = toObject(response.data);
    const rawChefs = typeof data.chefs !== 'undefined' ? data.chefs : data.results;
    const source = toArray(rawChefs);

    return {
      chefs: source.map(mapB2BChefFromApi),
      pagination: data.pagination as PaginationData | undefined
    };
  },

  async getInvoices(params?: { status?: string; page?: number; limit?: number }): Promise<{
    invoices: B2BInvoice[];
    pagination: PaginationData | undefined;
  }> {
    const response = await apiClient.get('/b2b/invoices', { params });
    const data = toObject(response.data);
    return {
      invoices: toArray(data.invoices).map((invoice) => ({
        id: normaliseId(invoice.id ?? invoice),
        missionId: typeof invoice.missionId === 'string' ? invoice.missionId : undefined,
        total: Number(invoice.total ?? invoice.amount ?? 0),
        status: typeof invoice.status === 'string' ? invoice.status : undefined,
        issuedAt: typeof invoice.issuedAt === 'string'
          ? new Date(invoice.issuedAt).toISOString()
          : undefined
      })),
      pagination: data.pagination as PaginationData | undefined
    };
  },

  async getAnalytics(period?: string): Promise<B2BAnalytics> {
    const response = await apiClient.get('/b2b/analytics', { params: { period } });
    const data = toObject(response.data);
    return mapB2BAnalyticsFromApi(data.analytics ?? data);
  },

  async generateInvoice(missionId: string): Promise<Blob> {
    const response = await apiClient.get(`/b2b/missions/${missionId}/invoice`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
