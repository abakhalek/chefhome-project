import { apiClient } from './apiClient';
import { API_CONFIG } from '../utils/constants';
import { Chef, SearchFilters, ApiResponse, Review, Booking, Menu, DashboardStats, ChefEarningsResponse } from '../types';

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

const mapMenuCourse = (course: unknown, index: number) => {
  if (course && typeof course === 'object') {
    const asObject = course as { name?: unknown; description?: unknown; order?: unknown };
    const name = typeof asObject.name === 'string' && asObject.name.trim()
      ? asObject.name.trim()
      : typeof course === 'string'
        ? course
        : `Plat ${index + 1}`;
    return {
      name,
      description: typeof asObject.description === 'string' ? asObject.description : '',
      order: typeof asObject.order === 'number' ? asObject.order : index + 1,
    };
  }

  if (typeof course === 'string' && course.trim()) {
    return {
      name: course.trim(),
      description: '',
      order: index + 1,
    };
  }

  return {
    name: `Plat ${index + 1}`,
    description: '',
    order: index + 1,
  };
};

const mapMenuFromApi = (rawMenu: unknown): Menu => {
  const menu = (rawMenu ?? {}) as Record<string, unknown>;

  const toNumber = (value: unknown): number => {
    const parsed = typeof value === 'string' ? Number.parseFloat(value) : Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  };

  const toGuestNumber = (value: unknown, fallback: number): number => {
    const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  const courses = Array.isArray(menu.courses)
    ? (menu.courses as unknown[]).map((course, index) => mapMenuCourse(course, index))
    : [];

  const normaliseStringArray = (value: unknown): string[] =>
    Array.isArray(value)
      ? value
          .map((item) => (typeof item === 'string' ? item.trim() : ''))
          .filter(Boolean)
      : [];

  return {
    id: typeof menu.id === 'string' && menu.id ? menu.id : (typeof menu._id === 'string' ? menu._id : ''),
    chef: typeof menu.chef === 'string' ? menu.chef : undefined,
    name: typeof menu.name === 'string' ? menu.name : '',
    description: typeof menu.description === 'string' ? menu.description : '',
    category: typeof menu.category === 'string' ? menu.category : 'Gastronomique',
    type: menu.type === 'horaire' ? 'horaire' : 'forfait',
    price: toNumber(menu.price ?? 0),
    duration: typeof menu.duration === 'string' ? menu.duration : '',
    minGuests: toGuestNumber(menu.minGuests, 1),
    maxGuests: toGuestNumber(menu.maxGuests, toGuestNumber(menu.minGuests, 1)),
    courses,
    ingredients: normaliseStringArray(menu.ingredients),
    allergens: normaliseStringArray(menu.allergens),
    dietaryOptions: normaliseStringArray(menu.dietaryOptions),
    image: toAbsoluteUrl(typeof menu.image === 'string' ? menu.image : null),
    images: Array.isArray(menu.images)
      ? (menu.images as unknown[])
          .map((img) => toAbsoluteUrl(typeof img === 'string' ? img : null))
          .filter((img): img is string => Boolean(img))
      : [],
    isActive: menu.isActive !== false,
    bookingCount: typeof menu.bookingCount === 'number' ? menu.bookingCount : undefined,
    averageRating: typeof menu.averageRating === 'number' ? menu.averageRating : undefined,
    tags: normaliseStringArray(menu.tags),
    createdAt: typeof menu.createdAt === 'string' ? menu.createdAt : undefined,
    updatedAt: typeof menu.updatedAt === 'string' ? menu.updatedAt : undefined,
  };
};

const buildMenuPayload = (menu: Partial<ChefMenuFormData>): Record<string, unknown> => {
  const payload: Record<string, unknown> = {};

  if (menu.name !== undefined) payload.name = menu.name;
  if (menu.description !== undefined) payload.description = menu.description;
  if (menu.price !== undefined) payload.price = Number(menu.price);
  if (menu.type) payload.type = menu.type;
  if (menu.category !== undefined) payload.category = menu.category;
  if (menu.duration !== undefined) payload.duration = menu.duration;
  if (menu.minGuests !== undefined) payload.minGuests = Number(menu.minGuests);
  if (menu.maxGuests !== undefined) payload.maxGuests = Number(menu.maxGuests);
  if (menu.isActive !== undefined) payload.isActive = menu.isActive;

  const toCleanArray = (value: unknown): string[] | undefined => {
    if (!Array.isArray(value)) {
      return undefined;
    }
    const cleaned = value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
    return cleaned.length ? cleaned : [];
  };

  const courseObjects = Array.isArray(menu.courses)
    ? menu.courses
        .map((course, index) => {
          if (typeof course !== 'string' || !course.trim()) {
            return null;
          }
          return {
            name: course.trim(),
            order: index + 1,
          };
        })
        .filter((course): course is { name: string; order: number } => Boolean(course))
    : undefined;

  if (courseObjects) payload.courses = courseObjects;

  const ingredients = toCleanArray(menu.ingredients);
  if (ingredients) payload.ingredients = ingredients;

  const dietaryOptions = toCleanArray(menu.dietaryOptions);
  if (dietaryOptions) payload.dietaryOptions = dietaryOptions;

  const allergens = toCleanArray(menu.allergens);
  if (allergens) payload.allergens = allergens;

  return payload;
};

export interface ChefMenuFormData {
  name: string;
  description: string;
  price: number;
  type: 'forfait' | 'horaire';
  category: string;
  courses: string[];
  ingredients: string[];
  dietaryOptions: string[];
  allergens: string[];
  duration: string;
  minGuests: number;
  maxGuests: number;
  isActive: boolean;
  image?: string;
}

export type ChefMenu = Menu;

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

  async getMyMenus(): Promise<Menu[]> {
    const response = await apiClient.get('/chefs/me/menus');
    const menus = Array.isArray(response.data?.menus) ? response.data.menus : [];
    return menus.map(mapMenuFromApi);
  },

  async getMenus(): Promise<Menu[]> {
    return this.getMyMenus();
  },

  async createMyMenu(menuData: ChefMenuFormData): Promise<Menu> {
    const payload = buildMenuPayload(menuData);
    const response = await apiClient.post('/chefs/me/menus', payload);
    return mapMenuFromApi(response.data?.menu);
  },

  async createMenu(menuData: Partial<ChefMenuFormData>): Promise<Menu> {
    const payload = buildMenuPayload(menuData);
    const response = await apiClient.post('/chefs/me/menus', payload);
    return mapMenuFromApi(response.data?.menu);
  },

  async updateMyMenu(menuId: string, menuData: Partial<ChefMenuFormData>): Promise<Menu> {
    const payload = buildMenuPayload(menuData);
    const response = await apiClient.put(`/chefs/me/menus/${menuId}`, payload);
    return mapMenuFromApi(response.data?.menu);
  },

  async updateMenu(menuId: string, menuData: Partial<ChefMenuFormData>): Promise<Menu> {
    return this.updateMyMenu(menuId, menuData);
  },

  async deleteMyMenu(menuId: string): Promise<void> {
    await apiClient.delete(`/chefs/me/menus/${menuId}`);
  },

  async deleteMenu(menuId: string): Promise<void> {
    await this.deleteMyMenu(menuId);
  },

  async uploadMyMenuImage(menuId: string, file: File): Promise<{ url: string | null }> {
    const formData = new FormData();
    formData.append('image', file);
    const response = await apiClient.post(`/chefs/me/menus/${menuId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      url: toAbsoluteUrl(response.data?.url ?? null),
    };
  },

  async uploadMenuImage(menuId: string, file: File): Promise<{ url: string | null }> {
    return this.uploadMyMenuImage(menuId, file);
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

  async updateBookingStatus(bookingId: string, status: string): Promise<ApiResponse<Booking>> {
    const response = await apiClient.put(`/bookings/${bookingId}/status`, { status });
    return response.data;
  },

  async getChefDashboardStats(chefId: string): Promise<ApiResponse<DashboardStats>> {
    const response = await apiClient.get(`/chefs/${chefId}/dashboard/stats`);
    return response.data;
  },

  async getChefEarnings(chefId: string, filters: SearchFilters): Promise<ChefEarningsResponse> {
    const response = await apiClient.get(`/chefs/${chefId}/earnings`, { params: filters });
    return response.data.earnings;
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
