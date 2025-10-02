import { apiClient } from './apiClient';

export interface AdminStats {
  totalUsers: number;
  totalChefs: number;
  pendingChefs: number;
  totalBookings: number;
  monthlyBookings: number;
  monthlyRevenue: number;
  activeDisputes: number;
  userGrowth: Array<{ month: string; count: number }>;
}

export interface AdminBookingTrend {
  _id: string;
  count: number;
  revenue: number;
}

export interface AdminRevenueTrend {
  _id: string;
  revenue: number;
  count: number;
}

export interface AdminUserGrowthEntry {
  _id: string;
  count: number;
}

export interface AdminAnalytics {
  bookingTrends: AdminBookingTrend[];
  revenueTrends: AdminRevenueTrend[];
  userGrowth: AdminUserGrowthEntry[];
}

export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

type ApiRecord = Record<string, unknown>;

const toObject = (value: unknown): ApiRecord => (typeof value === 'object' && value !== null ? value as ApiRecord : {});
const toArray = (value: unknown): ApiRecord[] => (Array.isArray(value) ? value as ApiRecord[] : []);

const toISOStringOrNull = (value: unknown): string | null => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }
  return null;
};

const normaliseId = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  const valueObj = toObject(value);
  if (typeof valueObj.id === 'string' || typeof valueObj.id === 'number') {
    return String(valueObj.id);
  }
  if (typeof valueObj._id === 'string' || typeof valueObj._id === 'number') {
    return String(valueObj._id);
  }
  return JSON.stringify(valueObj);
};

export interface ChefDocumentSummary {
  type: string;
  url: string | null;
  uploadedAt: string | null;
}

export interface ChefMenuSummary {
  id: string;
  name: string;
  description: string;
  price: number;
  type: string;
  category: string;
  minGuests: number;
  maxGuests: number;
  image?: string | null;
  isActive: boolean;
}

export interface PendingChefCertification {
  name: string;
  issuer: string;
  dateObtained: string | null;
  expiryDate: string | null;
  documentUrl: string | null;
}

export interface PendingChef {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialty: string;
  experience: string;
  hourlyRate: number;
  location: { city: string; zipCode: string };
  submittedAt: string;
  documents: ChefDocumentSummary[];
  certifications: PendingChefCertification[];
  menus: ChefMenuSummary[];
  verification: { status: string; rejectionReason?: string | null };
}

export interface AdminChefListOptions {
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  page?: number;
  limit?: number;
}

export interface AdminUserCompany {
  name?: string;
  siret?: string;
  address?: string;
  contactPerson?: string;
}

export interface AdminUserStats {
  totalBookings: number;
  totalSpent?: number;
  rating?: number;
  verificationStatus?: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'chef' | 'admin' | 'b2b';
  phone?: string;
  status: 'active' | 'suspended' | 'pending';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  company?: AdminUserCompany;
  chefStats?: {
    verificationStatus?: string;
    rating?: number;
    totalBookings?: number;
  };
  bookingStats?: {
    totalBookings: number;
    totalSpent: number;
  };
}

export interface AdminBookingContact {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface AdminBookingTimelineEntry {
  status: string;
  note?: string;
  timestamp: string;
}

export interface AdminBooking {
  id: string;
  client: AdminBookingContact;
  chef: AdminBookingContact;
  serviceType: string;
  status: string;
  createdAt: string;
  eventDetails: {
    date: string;
    startTime: string;
    duration: number;
    guests: number;
    eventType?: string;
  };
  location: {
    address: string;
    city: string;
    zipCode: string;
    country?: string;
    accessInstructions?: string;
  };
  pricing: {
    basePrice: number;
    serviceFee: number;
    totalAmount: number;
    depositAmount?: number;
    remainingBalance: number;
  };
  payment: {
    status: string;
    depositAmount?: number;
    depositPaidAt?: string | null;
    refundAmount?: number;
    refundedAt?: string | null;
    stripePaymentIntentId?: string;
  };
  menu: {
    selectedMenu?: string;
    name?: string;
    type?: 'forfait' | 'horaire' | 'custom';
    price?: number;
    minGuests?: number;
    maxGuests?: number;
    dietaryRestrictions: string[];
    allergies: string[];
    customRequests?: string | null;
  };
  timeline: AdminBookingTimelineEntry[];
}

const mapAdminUser = (user: unknown): AdminUser => {
  const userObj = toObject(user);
  const companyObj = toObject(userObj.company);
  const chefStatsObj = toObject(userObj.chefStats);
  const bookingStatsObj = toObject(userObj.bookingStats);

  return {
    id: normaliseId(userObj.id ?? userObj),
    name: typeof userObj.name === 'string' ? userObj.name : '',
    email: typeof userObj.email === 'string' ? userObj.email : '',
    role: (typeof userObj.role === 'string' ? userObj.role : 'client') as AdminUser['role'],
    phone: typeof userObj.phone === 'string' ? userObj.phone : undefined,
    status: typeof userObj.status === 'string'
      ? userObj.status as AdminUser['status']
      : (userObj.isActive ? 'active' : 'suspended'),
    isActive: Boolean(userObj.isActive),
    isVerified: Boolean(userObj.isVerified),
    createdAt: toISOStringOrNull(userObj.createdAt) || '',
    updatedAt: toISOStringOrNull(userObj.updatedAt) || '',
    lastLogin: toISOStringOrNull(userObj.lastLogin) || undefined,
    company: Object.keys(companyObj).length ? companyObj as AdminUserCompany : undefined,
    chefStats: Object.keys(chefStatsObj).length ? chefStatsObj : undefined,
    bookingStats: Object.keys(bookingStatsObj).length ? bookingStatsObj : undefined
  };
};

const mapPendingChefFromApi = (chef: unknown): PendingChef => {
  const chefObj = toObject(chef);
  const userObj = toObject(chefObj.user);
  const documentsArray = Array.isArray(chefObj.documents)
    ? chefObj.documents as unknown[]
    : Object.entries(toObject(chefObj.documents)).map(([type, doc]) => ({ type, ...toObject(doc) }));

  const documents: ChefDocumentSummary[] = documentsArray.map((entry, index) => {
    const docObj = toObject(entry);
    return {
      type: typeof docObj.type === 'string' ? docObj.type : `document-${index}`,
      url: typeof docObj.url === 'string' ? docObj.url : null,
      uploadedAt: toISOStringOrNull(docObj.uploadedAt)
    };
  });

  const menus: ChefMenuSummary[] = toArray(chefObj.menus).map((entry) => {
    const menuObj = toObject(entry);
    return {
      id: normaliseId(menuObj.id ?? menuObj._id ?? menuObj),
      name: typeof menuObj.name === 'string' ? menuObj.name : '',
      description: typeof menuObj.description === 'string' ? menuObj.description : '',
      price: Number(menuObj.price ?? 0),
      type: (menuObj.type === 'horaire' ? 'horaire' : 'forfait'),
      category: typeof menuObj.category === 'string' ? menuObj.category : '',
      minGuests: Number(menuObj.minGuests ?? 1),
      maxGuests: Number(menuObj.maxGuests ?? 1),
      image: typeof menuObj.image === 'string' ? menuObj.image : null,
      isActive: menuObj.isActive === undefined ? true : Boolean(menuObj.isActive)
    };
  });

  const certifications: PendingChefCertification[] = toArray(chefObj.certifications).map((entry) => {
    const certObj = toObject(entry);
    return {
      name: typeof certObj.name === 'string' ? certObj.name : '',
      issuer: typeof certObj.issuer === 'string' ? certObj.issuer : '',
      dateObtained: toISOStringOrNull(certObj.dateObtained),
      expiryDate: toISOStringOrNull(certObj.expiryDate),
      documentUrl: typeof certObj.documentUrl === 'string' ? certObj.documentUrl : null
    };
  });

  const locationObj = toObject(chefObj.location || userObj.address);
  const verificationObj = toObject(chefObj.verification);
  const verificationStatus = typeof verificationObj.status === 'string'
    ? verificationObj.status
    : 'pending';

  return {
    id: normaliseId(chefObj.id ?? chefObj),
    name: typeof chefObj.name === 'string' ? chefObj.name : (typeof userObj.name === 'string' ? userObj.name : ''),
    email: typeof chefObj.email === 'string' ? chefObj.email : (typeof userObj.email === 'string' ? userObj.email : ''),
    phone: typeof chefObj.phone === 'string' ? chefObj.phone : (typeof userObj.phone === 'string' ? userObj.phone : undefined),
    specialty: typeof chefObj.specialty === 'string' ? chefObj.specialty : '',
    experience: chefObj.experience !== undefined ? String(chefObj.experience) : '0',
    hourlyRate: Number(chefObj.hourlyRate ?? 0),
    location: {
      city: typeof locationObj.city === 'string' ? locationObj.city : '',
      zipCode: typeof locationObj.zipCode === 'string' ? locationObj.zipCode : ''
    },
    submittedAt: toISOStringOrNull(chefObj.submittedAt) || new Date().toISOString(),
    documents,
    certifications,
    menus,
    verification: {
      status: verificationStatus,
      rejectionReason: typeof verificationObj.rejectionReason === 'string'
        ? verificationObj.rejectionReason
        : null
    }
  };
};

const fetchChefsFromApi = async (options?: AdminChefListOptions): Promise<{
  chefs: PendingChef[];
  pagination: PaginationData | undefined;
}> => {
  const response = await apiClient.get('/admin/chefs', {
    params: {
      status: options?.status && options.status !== 'all' ? options.status : undefined,
      page: options?.page,
      limit: options?.limit
    }
  });

  const data = toObject(response.data);

  return {
    chefs: toArray(data.chefs).map(mapPendingChefFromApi),
    pagination: data.pagination as PaginationData | undefined
  };
};

const mapAdminBookingFromApi = (booking: unknown): AdminBooking => {
  const bookingObj = toObject(booking);
  const clientObj = toObject(bookingObj.client);
  const chefProfile = toObject(bookingObj.chef);
  const chefUser = toObject(chefProfile.user ?? chefProfile);
  const eventDetails = toObject(bookingObj.eventDetails);
  const locationObj = toObject(bookingObj.location);
  const pricingObj = toObject(bookingObj.pricing);
  const paymentObj = toObject(bookingObj.payment);
  const menuObj = toObject(bookingObj.menu);

  const depositAmount = Number(paymentObj.depositAmount ?? pricingObj.depositAmount ?? 0);
  const totalAmount = Number(pricingObj.totalAmount ?? 0);

  return {
    id: normaliseId(bookingObj.id ?? bookingObj),
    client: {
      id: normaliseId(clientObj.id ?? clientObj),
      name: typeof clientObj.name === 'string' ? clientObj.name : '',
      email: typeof clientObj.email === 'string' ? clientObj.email : '',
      phone: typeof clientObj.phone === 'string' ? clientObj.phone : undefined
    },
    chef: {
      id: normaliseId(chefUser.id ?? chefUser),
      name: typeof chefUser.name === 'string' ? chefUser.name : '',
      email: typeof chefUser.email === 'string' ? chefUser.email : '',
      phone: typeof chefUser.phone === 'string' ? chefUser.phone : undefined
    },
    serviceType: typeof bookingObj.serviceType === 'string' ? bookingObj.serviceType : '',
    status: typeof bookingObj.status === 'string' ? bookingObj.status : '',
    createdAt: toISOStringOrNull(bookingObj.createdAt) || new Date().toISOString(),
    eventDetails: {
      date: toISOStringOrNull(eventDetails.date) || '',
      startTime: typeof eventDetails.startTime === 'string' ? eventDetails.startTime : '',
      duration: Number(eventDetails.duration ?? 0),
      guests: Number(eventDetails.guests ?? 0),
      eventType: typeof eventDetails.eventType === 'string' ? eventDetails.eventType : undefined
    },
    location: {
      address: typeof locationObj.address === 'string' ? locationObj.address : '',
      city: typeof locationObj.city === 'string' ? locationObj.city : '',
      zipCode: typeof locationObj.zipCode === 'string' ? locationObj.zipCode : '',
      country: typeof locationObj.country === 'string' ? locationObj.country : 'France',
      accessInstructions: typeof locationObj.accessInstructions === 'string' ? locationObj.accessInstructions : undefined
    },
    pricing: {
      basePrice: Number(pricingObj.basePrice ?? 0),
      serviceFee: Number(pricingObj.serviceFee ?? 0),
      totalAmount,
      depositAmount: Number.isFinite(depositAmount) && depositAmount > 0 ? depositAmount : undefined,
      remainingBalance: Math.max(totalAmount - depositAmount, 0)
    },
    payment: {
      status: typeof paymentObj.status === 'string' ? paymentObj.status : 'pending',
      depositAmount: Number.isFinite(depositAmount) && depositAmount > 0 ? depositAmount : undefined,
      depositPaidAt: toISOStringOrNull(paymentObj.depositPaidAt),
      refundAmount: paymentObj.refundAmount !== undefined ? Number(paymentObj.refundAmount) : undefined,
      refundedAt: toISOStringOrNull(paymentObj.refundedAt),
      stripePaymentIntentId: typeof paymentObj.stripePaymentIntentId === 'string' ? paymentObj.stripePaymentIntentId : undefined
    },
    menu: {
      selectedMenu: menuObj.selectedMenu ? normaliseId(menuObj.selectedMenu) : undefined,
      name: typeof menuObj.name === 'string' ? menuObj.name : (menuObj.type === 'custom' ? 'Menu personnalisé' : undefined),
      type: (menuObj.type as AdminBooking['menu']['type']) || (menuObj.selectedMenu ? 'forfait' : 'custom'),
      price: typeof menuObj.price === 'number' ? menuObj.price : undefined,
      minGuests: typeof menuObj.minGuests === 'number' ? menuObj.minGuests : undefined,
      maxGuests: typeof menuObj.maxGuests === 'number' ? menuObj.maxGuests : undefined,
      dietaryRestrictions: Array.isArray(menuObj.dietaryRestrictions) ? menuObj.dietaryRestrictions as string[] : [],
      allergies: Array.isArray(menuObj.allergies) ? menuObj.allergies as string[] : [],
      customRequests: typeof menuObj.customRequests === 'string' ? menuObj.customRequests : null
    },
    timeline: toArray(bookingObj.timeline).map((entry) => {
      const entryObj = toObject(entry);
      return {
        status: typeof entryObj.status === 'string' ? entryObj.status : '',
        note: typeof entryObj.note === 'string' ? entryObj.note : undefined,
        timestamp: toISOStringOrNull(entryObj.timestamp) || new Date().toISOString()
      };
    })
  };
};

export const adminService = {
  // Dashboard & Analytics
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get('/admin/stats');
    return response.data.stats;
  },

  async getAnalytics(period?: string): Promise<AdminAnalytics> {
    const response = await apiClient.get('/admin/analytics', { params: { period } });
    const data = toObject(response.data.analytics ?? response.data);

    return {
      bookingTrends: toArray(data.bookingTrends).map((entry) => ({
        _id: typeof entry._id === 'string' ? entry._id : '',
        count: Number(entry.count ?? 0),
        revenue: Number(entry.revenue ?? 0)
      })),
      revenueTrends: toArray(data.revenueTrends).map((entry) => ({
        _id: typeof entry._id === 'string' ? entry._id : '',
        revenue: Number(entry.revenue ?? 0),
        count: Number(entry.count ?? 0)
      })),
      userGrowth: toArray(data.userGrowth).map((entry) => ({
        _id: typeof entry._id === 'string' ? entry._id : '',
        count: Number(entry.count ?? 0)
      }))
    };
  },

  async exportData(type: string, format: 'csv' | 'pdf'): Promise<Blob> {
    const response = await apiClient.get(`/admin/export/${type}`, {
      params: { format },
      responseType: 'blob'
    });
    return response.data;
  },

  // Chef Management
  async getPendingChefs(): Promise<PendingChef[]> {
    const response = await apiClient.get('/admin/chefs/pending');
    const data = toObject(response.data);
    return toArray(data.chefs).map(mapPendingChefFromApi);
  },

  async getChefs(options?: AdminChefListOptions): Promise<{
    chefs: PendingChef[];
    pagination: PaginationData | undefined;
  }> {
    return fetchChefsFromApi(options);
  },

  async verifyChef(chefId: string, status: 'approved' | 'rejected', reason?: string): Promise<void> {
    await apiClient.put(`/admin/chefs/${chefId}/verify`, { status, rejectionReason: reason });
  },

  async updateChefMenuStatus(chefId: string, menuId: string, isActive: boolean): Promise<ChefMenuSummary> {
    const response = await apiClient.put(`/admin/chefs/${chefId}/menus/${menuId}/status`, { isActive });
    const menu = response.data?.menu || {};
    return {
      id: normaliseId(menu?.id || menu?._id || menuId),
      name: menu?.name || '',
      description: menu?.description || '',
      price: Number(menu?.price ?? 0),
      type: menu?.type || 'forfait',
      category: menu?.category || '',
      minGuests: Number(menu?.minGuests ?? 1),
      maxGuests: Number(menu?.maxGuests ?? 1),
      image: menu?.image || null,
      isActive: Boolean(menu?.isActive)
    };
  },

  // User Management
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }): Promise<{
    users: AdminUser[];
    pagination: PaginationData | undefined;
  }> {
    const response = await apiClient.get('/admin/users', { params });
    const data = toObject(response.data);
    return {
      users: toArray(data.users).map(mapAdminUser),
      pagination: data.pagination as PaginationData | undefined
    };
  },

  async getUser(userId: string): Promise<AdminUser> {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return mapAdminUser(response.data.user);
  },

  async createUser(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    role?: string;
    isActive?: boolean;
    isVerified?: boolean;
    company?: AdminUserCompany;
  }): Promise<AdminUser> {
    const response = await apiClient.post('/admin/users', data);
    return mapAdminUser(response.data.user);
  },

  async updateUser(userId: string, data: Partial<{
    name: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
    isVerified: boolean;
    company: AdminUserCompany;
  }>): Promise<AdminUser> {
    const response = await apiClient.put(`/admin/users/${userId}`, data);
    return mapAdminUser(response.data.user);
  },

  async deleteUser(userId: string, options?: { hardDelete?: boolean }): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}`, {
      params: options?.hardDelete ? { hardDelete: options.hardDelete } : undefined
    });
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended', reason?: string): Promise<AdminUser> {
    const response = await apiClient.put(`/admin/users/${userId}/status`, { status, reason });
    return mapAdminUser(response.data.user);
  },

  async sendMessageToUser(userId: string, subject: string, message: string): Promise<void> {
    await apiClient.post(`/admin/users/${userId}/message`, { subject, message });
  },

  // Dispute Management
  async getDisputes(params?: {
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    disputes: AdminBooking[];
    pagination: PaginationData | undefined;
  }> {
    const response = await apiClient.get('/admin/disputes', { params });
    const data = toObject(response.data);
    return {
      disputes: toArray(data.disputes).map(mapAdminBookingFromApi),
      pagination: data.pagination as PaginationData | undefined
    };
  },

  async resolveDispute(bookingId: string, resolution: string, refundAmount?: number): Promise<void> {
    await apiClient.put(`/admin/bookings/${bookingId}/dispute`, { resolution, refundAmount });
  },

  // Booking Management
  async getBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ bookings: AdminBooking[]; pagination: PaginationData | undefined; }> {
    const response = await apiClient.get('/admin/bookings', { params });
    const data = toObject(response.data);
    return {
      bookings: toArray(data.bookings).map(mapAdminBookingFromApi),
      pagination: data.pagination as PaginationData | undefined
    };
  }
};
