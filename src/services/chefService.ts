import { apiClient } from './apiClient';
import { API_CONFIG } from '../utils/constants';
import { Chef, SearchFilters, ApiResponse, Review, Booking, Menu, Notification, DashboardStats } from '../types';

const API_SERVER_BASE = API_CONFIG.BASE_URL.replace(/\/api\/?$/, '');

const toAbsoluteUrl = (path?: string | null): string | null => {
  if (!path) {
    return null;
  }
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  const normalisedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_SERVER_BASE}${normalisedPath}`;
};

const normaliseDateString = (value?: string | Date | null): string | null => {
  if (!value) {
    return null;
  }
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

export interface ChefDocumentStatus {
  uploaded: boolean;
  url: string | null;
  uploadedAt: string | null;
}

export interface UploadedChefDocument {
  type: string;
  url: string | null;
  uploadedAt: string | null;
}

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
    id?: string;
    city: string;
    zipCodes: string[];
    maxDistance: number;
  }>;
  certifications: Array<{
    id?: string;
    name: string;
    issuer: string;
    dateObtained: string | null;
    expiryDate: string | null;
    documentUrl?: string | null;
  }>;
  documents: Record<string, ChefDocumentStatus>;
  profilePicture: string | null;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string | null;
  };
}

const DEFAULT_DOCUMENT_KEYS = ['cv', 'insurance', 'healthCertificate', 'businessLicense'] as const;

const toDocumentStatus = (document?: { url?: string | null; uploadedAt?: string | Date | null }): ChefDocumentStatus => ({
  uploaded: Boolean(document?.url),
  url: document?.url ? toAbsoluteUrl(document.url) : null,
  uploadedAt: normaliseDateString(document?.uploadedAt ?? null),
});

const normaliseDocuments = (documents?: Record<string, { url?: string | null; uploadedAt?: string | Date | null }> | null): Record<string, ChefDocumentStatus> => {
  const result: Record<string, ChefDocumentStatus> = {};

  DEFAULT_DOCUMENT_KEYS.forEach((key) => {
    result[key] = toDocumentStatus(documents?.[key]);
  });

  if (documents) {
    Object.keys(documents).forEach((key) => {
      if (!result[key]) {
        result[key] = toDocumentStatus(documents[key]);
      }
    });
  }

  return result;
};

const transformChefProfileResponse = (rawProfile: any): ChefProfile => {
  if (!rawProfile) {
    throw new Error('Profil chef invalide.');
  }

  const user = rawProfile.user ?? {};
  const userAddress = user.address ?? {};

  const serviceAreas = Array.isArray(rawProfile.serviceAreas)
    ? rawProfile.serviceAreas.map((area: any) => ({
        id: area?.id ?? area?._id,
        city: area?.city ?? '',
        zipCodes: Array.isArray(area?.zipCodes) ? area.zipCodes : [],
        maxDistance: typeof area?.maxDistance === 'number' ? area.maxDistance : Number(area?.maxDistance ?? 0),
      }))
    : [];

  const certifications = Array.isArray(rawProfile.certifications)
    ? rawProfile.certifications.map((cert: any) => ({
        id: cert?.id ?? cert?._id,
        name: cert?.name ?? '',
        issuer: cert?.issuer ?? '',
        dateObtained: normaliseDateString(cert?.dateObtained ?? null),
        expiryDate: normaliseDateString(cert?.expiryDate ?? null),
        documentUrl: cert?.documentUrl ? toAbsoluteUrl(cert.documentUrl) : null,
      }))
    : [];

  return {
    id: rawProfile.id ?? rawProfile._id ?? '',
    name: rawProfile.name ?? user.name ?? '',
    email: rawProfile.email ?? user.email ?? '',
    phone: rawProfile.phone ?? user.phone ?? '',
    address: rawProfile.address ?? userAddress.street ?? '',
    city: rawProfile.city ?? userAddress.city ?? '',
    zipCode: rawProfile.zipCode ?? userAddress.zipCode ?? '',
    specialty: rawProfile.specialty ?? '',
    experience: typeof rawProfile.experience === 'number' ? rawProfile.experience : Number(rawProfile.experience ?? 0),
    hourlyRate: typeof rawProfile.hourlyRate === 'number' ? rawProfile.hourlyRate : Number(rawProfile.hourlyRate ?? 0),
    description: rawProfile.description ?? '',
    cuisineTypes: Array.isArray(rawProfile.cuisineTypes) ? rawProfile.cuisineTypes : [],
    serviceTypes: Array.isArray(rawProfile.serviceTypes) ? rawProfile.serviceTypes : [],
    serviceAreas,
    certifications,
    documents: normaliseDocuments(rawProfile.documents),
    profilePicture: toAbsoluteUrl(rawProfile.profilePicture),
    createdAt: rawProfile.createdAt ?? undefined,
    updatedAt: rawProfile.updatedAt ?? undefined,
    user: user?.id || user?._id
      ? {
          id: user.id ?? user._id,
          name: user.name ?? '',
          email: user.email ?? '',
          phone: user.phone ?? '',
          avatar: toAbsoluteUrl(user.avatar),
        }
      : undefined,
  };
};

const buildChefProfilePayload = (profile: Partial<ChefProfile>): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};

  if (profile.name !== undefined) payload.name = profile.name;
  if (profile.email !== undefined) payload.email = profile.email;
  if (profile.phone !== undefined) payload.phone = profile.phone;
  if (profile.address !== undefined) payload.address = profile.address;
  if (profile.city !== undefined) payload.city = profile.city;
  if (profile.zipCode !== undefined) payload.zipCode = profile.zipCode;
  if (profile.specialty !== undefined) payload.specialty = profile.specialty;
  if (profile.experience !== undefined) payload.experience = Number(profile.experience);
  if (profile.hourlyRate !== undefined) payload.hourlyRate = Number(profile.hourlyRate);
  if (profile.description !== undefined) payload.description = profile.description;
  if (profile.cuisineTypes !== undefined) payload.cuisineTypes = profile.cuisineTypes;
  if (profile.serviceTypes !== undefined) payload.serviceTypes = profile.serviceTypes;

  if (profile.serviceAreas !== undefined) {
    payload.serviceAreas = profile.serviceAreas.map((area) => ({
      city: area.city,
      zipCodes: Array.isArray(area.zipCodes) ? area.zipCodes : [],
      maxDistance: Number(area.maxDistance ?? 0),
    }));
  }

  if (profile.certifications !== undefined) {
    payload.certifications = profile.certifications.map((cert) => ({
      name: cert.name,
      issuer: cert.issuer,
      dateObtained: cert.dateObtained ? new Date(cert.dateObtained).toISOString() : null,
      expiryDate: cert.expiryDate ? new Date(cert.expiryDate).toISOString() : null,
      documentUrl: cert.documentUrl ?? null,
    }));
  }

  return payload;
};

export const chefService = {
  async getChefs(params: SearchFilters): Promise<ApiResponse<Chef[]>> {
    const response = await apiClient.get('/chefs', { params });
    return response.data;
  },

  async getChefProfile(chefId: string): Promise<{ success: boolean; chef: Chef }> {
    const response = await apiClient.get(`/chefs/${chefId}`);
    return response.data;
  },

  async updateChefProfile(chefId: string, chefData: Partial<Chef>): Promise<ApiResponse<Chef>> {
    const response = await apiClient.put(`/chefs/${chefId}`, chefData);
    return response.data;
  },

  async updateChefPortfolio(chefId: string, portfolioData: Partial<Chef['portfolio']>): Promise<ApiResponse<Chef>> {
    const response = await apiClient.put(`/chefs/${chefId}/portfolio`, portfolioData);
    return response.data;
  },

  async updateChefAvailability(chefId: string, availabilityData: Partial<Chef['availability']>): Promise<ApiResponse<Chef>> {
    const response = await apiClient.put(`/chefs/${chefId}/availability`, availabilityData);
    return response.data;
  },

  async addChefCertification(chefId: string, certificationData: Partial<Chef['certifications'][0]>): Promise<ApiResponse<Chef>> {
    const response = await apiClient.post(`/chefs/${chefId}/certifications`, certificationData);
    return response.data;
  },

  async updateChefCertification(chefId: string, certificationId: string, certificationData: Partial<Chef['certifications'][0]>): Promise<ApiResponse<Chef>> {
    const response = await apiClient.put(`/chefs/${chefId}/certifications/${certificationId}`, certificationData);
    return response.data;
  },

  async deleteChefCertification(chefId: string, certificationId: string): Promise<ApiResponse<unknown>> {
    const response = await apiClient.delete(`/chefs/${chefId}/certifications/${certificationId}`);
    return response.data;
  },

  async addChefDocument(chefId: string, documentData: Partial<Chef['documents']>): Promise<ApiResponse<Chef>> {
    const response = await apiClient.post(`/chefs/${chefId}/documents`, documentData);
    return response.data;
  },

  async deleteChefDocument(chefId: string, documentId: string): Promise<ApiResponse<unknown>> {
    const response = await apiClient.delete(`/chefs/${chefId}/documents/${documentId}`);
    return response.data;
  },

  async getChefReviews(chefId: string): Promise<ApiResponse<Review[]>> {
    const response = await apiClient.get(`/chefs/${chefId}/reviews`);
    return response.data;
  },

  async getChefBookings(chefId: string, filters: SearchFilters): Promise<ApiResponse<Booking[]>> {
    const response = await apiClient.get(`/chefs/${chefId}/bookings`, { params: filters });
    return response.data;
  },

  async getChefMenus(chefId: string): Promise<{ success: boolean; chef: Partial<Chef>; menus: Menu[] }> {
    const response = await apiClient.get(`/chefs/${chefId}/menus`);
    return response.data;
  },

  async getChefMenu(chefId: string, menuId: string): Promise<ApiResponse<Menu>> {
    const response = await apiClient.get(`/chefs/${chefId}/menus/${menuId}`);
    return response.data;
  },

  async createChefMenu(chefId: string, menuData: Partial<Menu>): Promise<ApiResponse<Menu>> {
    const response = await apiClient.post(`/chefs/${chefId}/menus`, menuData);
    return response.data;
  },

  async updateChefMenu(chefId: string, menuId: string, menuData: Partial<Menu>): Promise<ApiResponse<Menu>> {
    const response = await apiClient.put(`/chefs/${chefId}/menus/${menuId}`, menuData);
    return response.data;
  },

  async deleteChefMenu(chefId: string, menuId: string): Promise<ApiResponse<unknown>> {
    const response = await apiClient.delete(`/chefs/${chefId}/menus/${menuId}`);
    return response.data;
  },

  async getChefNotifications(chefId: string): Promise<ApiResponse<Notification[]>> {
    const response = await apiClient.get(`/chefs/${chefId}/notifications`);
    return response.data;
  },

  async markChefNotificationAsRead(chefId: string, notificationId: string): Promise<ApiResponse<unknown>> {
    const response = await apiClient.put(`/chefs/${chefId}/notifications/${notificationId}/read`);
    return response.data;
  },

  async updateBookingStatus(bookingId: string, status: string): Promise<ApiResponse<Booking>> {
    const response = await apiClient.put(`/bookings/${bookingId}/status`, { status });
    return response.data;
  },

  async getChefDashboardStats(chefId: string): Promise<ApiResponse<DashboardStats>> {
    const response = await apiClient.get(`/chefs/${chefId}/dashboard/stats`);
    return response.data;
  },

  async getChefEarnings(chefId: string, filters: SearchFilters): Promise<ApiResponse<unknown>> {
    const response = await apiClient.get(`/chefs/${chefId}/earnings`, { params: filters });
    return response.data;
  },

  async requestPayout(chefId: string, amount: number): Promise<ApiResponse<unknown>> {
    const response = await apiClient.post(`/chefs/${chefId}/payouts`, { amount });
    return response.data;
  },

  async updateChefServiceAreas(chefId: string, serviceAreas: Chef['serviceAreas']): Promise<ApiResponse<Chef>> {
    const response = await apiClient.put(`/chefs/${chefId}/service-areas`, { serviceAreas });
    return response.data;
  },

  async updateChefSpecialties(chefId: string, specialties: Chef['cuisineTypes']): Promise<ApiResponse<Chef>> {
    const response = await apiClient.put(`/chefs/${chefId}/specialties`, { specialties });
    return response.data;
  },

  async uploadChefDocument(chefId: string, file: File, documentType: string): Promise<ApiResponse<unknown>> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('documentType', documentType);
    const response = await apiClient.post(`/chefs/${chefId}/documents/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async uploadChefImage(chefId: string, file: File): Promise<ApiResponse<unknown>> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post(`/chefs/${chefId}/images/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async deleteChefImage(chefId: string, imageUrl: string): Promise<ApiResponse<unknown>> {
    const response = await apiClient.delete(`/chefs/${chefId}/images`, { data: { imageUrl } });
    return response.data;
  },

  async getProfile(): Promise<ChefProfile> {
    const response = await apiClient.get('/chefs/me/profile');
    if (!response.data?.chef) {
      throw new Error('Impossible de récupérer le profil du chef.');
    }
    return transformChefProfileResponse(response.data.chef);
  },

  async updateProfile(profileData: Partial<ChefProfile>): Promise<ChefProfile> {
    const payload = buildChefProfilePayload(profileData);
    const response = await apiClient.put('/chefs/me/profile', payload);
    if (!response.data?.chef) {
      throw new Error('La mise à jour du profil a échoué.');
    }
    return transformChefProfileResponse(response.data.chef);
  },

  async uploadProfilePicture(file: File): Promise<{ profilePicture: string | null }> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await apiClient.post('/chefs/me/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      profilePicture: toAbsoluteUrl(response.data?.profilePicture) ?? null,
    };
  },

  async uploadDocument(documentType: string, file: File): Promise<UploadedChefDocument> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', documentType);

    const response = await apiClient.post('/chefs/me/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const document = response.data?.document ?? {};
    return {
      type: document.type ?? documentType,
      url: document.url ? toAbsoluteUrl(document.url) : null,
      uploadedAt: normaliseDateString(document.uploadedAt ?? null),
    };
  },

  async deleteDocument(documentType: string): Promise<UploadedChefDocument> {
    const response = await apiClient.delete(`/chefs/me/documents/${documentType}`);
    const document = response.data?.document ?? {};
    return {
      type: document.type ?? documentType,
      url: document.url ? toAbsoluteUrl(document.url) : null,
      uploadedAt: normaliseDateString(document.uploadedAt ?? null),
    };
  },
};
