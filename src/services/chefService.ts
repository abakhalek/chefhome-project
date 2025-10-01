import { apiClient } from './apiClient';


export interface ChefDocumentStatus {
  uploaded: boolean;
  url?: string;
  uploadedAt?: string | null;
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
  profilePicture?: string; // Add this line
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
    cv: ChefDocumentStatus;
    insurance: ChefDocumentStatus;
    healthCertificate: ChefDocumentStatus;
    businessLicense: ChefDocumentStatus;
  };
  portfolio: {
    images: string[];
    description?: string;
  };
  verification: {
    status: 'pending' | 'approved' | 'rejected' | 'suspended';
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
  image?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'disputed';
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

const normaliseId = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value.id) return String(value.id);
  if (value._id) return String(value._id);
  return String(value);
};

const mapDocumentStatus = (doc?: { url?: string; uploadedAt?: string | null }): ChefDocumentStatus => ({
  uploaded: Boolean(doc?.url),
  url: doc?.url || undefined,
  uploadedAt: doc?.uploadedAt ? new Date(doc.uploadedAt).toISOString() : null
});

const mapChefProfileFromApi = (chef: any): ChefProfile => {
  const user = chef?.user || {};
  const address = user.address || {};

  return {
    id: normaliseId(chef),
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
    address: address.street || '',
    city: address.city || '',
    zipCode: address.zipCode || '',
    profilePicture: chef.profilePicture || undefined, // Add this line
    specialty: chef.specialty || '',
    experience: chef.experience || 0,
    hourlyRate: chef.hourlyRate || 0,
    description: chef.description || '',
    cuisineTypes: Array.isArray(chef.cuisineTypes) ? chef.cuisineTypes : [],
    serviceTypes: Array.isArray(chef.serviceTypes) ? chef.serviceTypes : [],
    serviceAreas: Array.isArray(chef.serviceAreas)
      ? chef.serviceAreas.map((area: any) => ({
          city: area?.city || '',
          zipCodes: Array.isArray(area?.zipCodes) ? area.zipCodes : [],
          maxDistance: area?.maxDistance || 0
        }))
      : [],
    certifications: Array.isArray(chef.certifications)
      ? chef.certifications.map((cert: any) => ({
          name: cert?.name || '',
          issuer: cert?.issuer || '',
          dateObtained: cert?.dateObtained ? new Date(cert.dateObtained).toISOString() : '',
          expiryDate: cert?.expiryDate ? new Date(cert.expiryDate).toISOString() : undefined
        }))
      : [],
    documents: {
      cv: mapDocumentStatus(chef?.documents?.cv),
      insurance: mapDocumentStatus(chef?.documents?.insurance),
      healthCertificate: mapDocumentStatus(chef?.documents?.healthCertificate),
      businessLicense: mapDocumentStatus(chef?.documents?.businessLicense)
    },
    portfolio: {
      images: Array.isArray(chef?.portfolio?.images) ? chef.portfolio.images : [],
      description: chef?.portfolio?.description || ''
    },
    verification: {
      status: chef?.verification?.status || 'pending',
      verifiedAt: chef?.verification?.verifiedAt ? new Date(chef.verification.verifiedAt).toISOString() : undefined
    },
    rating: {
      average: chef?.rating?.average || 0,
      count: chef?.rating?.count || 0
    }
  };
};
const toStringArray = (value?: string[]) =>
  Array.isArray(value) ? value.map(item => item.trim()).filter(Boolean) : [];

const mapMenuFromApi = (menu: any): ChefMenu => ({
  _id: normaliseId(menu),
  name: menu?.name || '',
  description: menu?.description || '',
  price: Number(menu?.price) || 0,
  type: (menu?.type === 'horaire' ? 'horaire' : 'forfait'),
  category: menu?.category || '',
  courses: Array.isArray(menu?.courses)
    ? menu.courses
        .map((course: any) =>
          typeof course === 'string' ? course : course?.name || ''
        )
        .filter(Boolean)
    : [],
  ingredients: toStringArray(menu?.ingredients),
  allergens: toStringArray(menu?.allergens),
  dietaryOptions: toStringArray(menu?.dietaryOptions),
  duration: menu?.duration || '',
  minGuests: Number(menu?.minGuests) || 1,
  maxGuests: Number(menu?.maxGuests) || 1,
  image: menu?.image || null,
  isActive: menu?.isActive ?? true,
  createdAt: menu?.createdAt ? new Date(menu.createdAt).toISOString() : undefined,
  updatedAt: menu?.updatedAt ? new Date(menu.updatedAt).toISOString() : undefined
});

const prepareMenuPayload = (menuData: Partial<ChefMenu>) => ({
  name: menuData.name,
  description: menuData.description,
  price: menuData.price,
  type: menuData.type,
  category: menuData.category,
  courses: Array.isArray(menuData.courses)
    ? menuData.courses.map((course, index) => ({
        name: course,
        order: index + 1
      }))
    : [],
  ingredients: toStringArray(menuData.ingredients),
  allergens: toStringArray(menuData.allergens),
  dietaryOptions: toStringArray(menuData.dietaryOptions),
  duration: menuData.duration,
  minGuests: menuData.minGuests,
  maxGuests: menuData.maxGuests,
  image: menuData.image,
  isActive: menuData.isActive
});

const mapMissionFromBooking = (booking: any): Mission => {
  const client = booking?.client || {};
  const eventDetails = booking?.eventDetails || {};
  const location = booking?.location || {};
  const pricing = booking?.pricing || {};
  const totalAmount = Number(pricing?.totalAmount ?? 0);

  return {
    id: normaliseId(booking),
    client: {
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || '',
      avatar: client?.avatar
    },
    date: eventDetails?.date ? new Date(eventDetails.date).toISOString() : '',
    time: eventDetails?.startTime || '',
    duration: eventDetails?.duration ? `${eventDetails.duration}h` : '',
    guests: eventDetails?.guests || 0,
    type: booking?.serviceType || '',
    location: [location?.address, location?.city, location?.zipCode].filter(Boolean).join(', '),
    price: `${totalAmount.toFixed(2)}€`,
    status: booking?.status || 'pending',
    specialRequests: booking?.menu?.customRequests || '',
    urgency: 'normal',
    submittedAt: booking?.createdAt ? new Date(booking.createdAt).toISOString() : ''
  };
};

const mapEarningsResponse = (data: any) => {
  const earnings = data?.earnings || {};
  const total = earnings?.total || {
    totalEarnings: 0,
    totalCommission: 0,
    totalBookings: 0,
    averageRating: 0
  };

  const daily: Earnings[] = Array.isArray(earnings?.daily)
    ? earnings.daily.map((item: any) => {
        const totalEarnings = item?.totalEarnings || 0;
        const commission = item?.commission || 0;
        return {
          id: normaliseId(item) || String(item?._id || item?.date || Math.random()),
          date: item?._id || item?.date || new Date().toISOString(),
          client: 'Clients multiples',
          type: 'mission',
          amount: totalEarnings,
          commission,
          netAmount: totalEarnings - commission,
          status: 'paid',
          rating: undefined,
          review: undefined
        };
      })
    : [];

  const summary = {
    totalEarnings: total.totalEarnings || 0,
    totalCommission: total.totalCommission || 0,
    totalBookings: total.totalBookings || 0,
    averageRating: total.averageRating || 0,
    averagePerMission:
      total.totalBookings ? (total.totalEarnings || 0) / total.totalBookings : 0
  };

  const totalWithAverage = {
    ...total,
    averagePerMission: summary.averagePerMission
  };

  return {
    earnings: {
      daily,
      total: totalWithAverage,
      monthly: Array.isArray(earnings?.monthly) ? earnings.monthly : []
    },
    summary,
    pagination: null
  };
};

export const chefService = {
  // Profile Management
  async getProfile(): Promise<ChefProfile> {
    const response = await apiClient.get('/chefs/me/profile');
    return mapChefProfileFromApi(response.data.chef);
  },

  async updateProfile(profileData: Partial<ChefProfile>): Promise<ChefProfile> {
    const response = await apiClient.put('/chefs/me/profile', profileData);
   return mapChefProfileFromApi(response.data.chef);
  },

  async uploadProfilePicture(file: File): Promise<{ profilePicture: string }> {
    const formData = new FormData();
    formData.append('profilePicture', file);

    const response = await apiClient.post('/chefs/me/profile-picture', formData, {
      headers: {
         'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async uploadDocument(documentType: string, file: File): Promise<UploadedChefDocument> {
    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', documentType);

    const response = await apiClient.post('/chefs/me/documents', formData, {
      headers: {
         'Content-Type': 'multipart/form-data'
      }
    });
     const document = response.data?.document ?? {};
    return {
      type: document.type ?? documentType,
      url: document.url ?? null,
      uploadedAt: document.uploadedAt ?? null
    };
  },

  async deleteDocument(documentType: string): Promise<UploadedChefDocument> {
    const response = await apiClient.delete(`/chefs/me/documents/${documentType}`);
    const document = response.data?.document ?? {};
    return {
      type: document.type ?? documentType,
      url: document.url ?? null,
      uploadedAt: document.uploadedAt ?? null
    };
  },

  async uploadPortfolioImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post('/chefs/me/portfolio/images', formData, {
      headers: {
         'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  async uploadMenuImage(menuId: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await apiClient.post(`/chefs/me/menus/${menuId}/image`, formData, {
      headers: {
         'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Menu Management
  async getMenus(): Promise<ChefMenu[]> {
    const response = await apiClient.get('/chefs/me/menus');
     return Array.isArray(response.data.menus)
      ? response.data.menus.map(mapMenuFromApi)
      : [];
  },

  async createMenu(menuData: Partial<ChefMenu>): Promise<ChefMenu> {
    const response = await apiClient.post('/chefs/me/menus', prepareMenuPayload(menuData));
    return mapMenuFromApi(response.data.menu);
  },

  async updateMenu(_id: string, menuData: Partial<ChefMenu>): Promise<ChefMenu> {
    const response = await apiClient.put(`/chefs/me/menus/${_id}`, prepareMenuPayload(menuData));
    return mapMenuFromApi(response.data.menu);
  },

  async deleteMenu(_id: string): Promise<void> {
    await apiClient.delete(`/chefs/me/menus/${_id}`);
  },

  // Planning & Missions
   async getMissions(params?: { status?: string; page?: number; limit?: number }): Promise<{
    missions: Mission[];
    pagination: any;
  }> {
    const response = await apiClient.get('/chefs/me/bookings', { params });
    return {
      missions: Array.isArray(response.data.bookings)
        ? response.data.bookings.map(mapMissionFromBooking)
        : [],
      pagination: response.data.pagination
    };
  },
  async updateMissionStatus(missionId: string, status: string, note?: string): Promise<Mission> {
    const response = await apiClient.put(`/bookings/${missionId}/status`, { status, note });
    return mapMissionFromBooking(response.data.booking);
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
    return this.updateMissionStatus(missionId, 'confirmed', 'Mission acceptée par le chef');
  },

  async declineMission(missionId: string, reason?: string): Promise<void> {
    await apiClient.put(`/bookings/${missionId}/status`, {
      status: 'cancelled',
      note: reason || 'Mission déclinée par le chef'
    });
  },

  // Earnings & Statistics
  async getEarnings(params?: { period?: string; page?: number; limit?: number }) {
    const response = await apiClient.get('/chefs/me/earnings', { params });
    return mapEarningsResponse(response.data);
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