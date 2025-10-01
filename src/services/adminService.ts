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
    dietaryRestrictions: string[];
    allergies: string[];
    customRequests?: string | null;
  };
  timeline: AdminBookingTimelineEntry[];
}

const toISOStringOrNull = (value: any): string | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const normaliseId = (value: any): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value.id) return String(value.id);
  if (value._id) return String(value._id);
  return String(value);
};

const mapAdminUser = (user: any): AdminUser => ({
  id: normaliseId(user),
  name: user?.name || '',
  email: user?.email || '',
  role: user?.role || 'client',
  phone: user?.phone,
  status: user?.status || (user?.isActive ? 'active' : 'suspended'),
  isActive: Boolean(user?.isActive),
  isVerified: Boolean(user?.isVerified),
  createdAt: toISOStringOrNull(user?.createdAt) || '',
  updatedAt: toISOStringOrNull(user?.updatedAt) || '',
  lastLogin: toISOStringOrNull(user?.lastLogin) || undefined,
  company: user?.company,
  chefStats: user?.chefStats,
  bookingStats: user?.bookingStats
});

const mapPendingChefFromApi = (chef: any): PendingChef => {
  const documentsSource = Array.isArray(chef?.documents)
    ? chef.documents
    : Object.entries(chef?.documents || {}).map(([type, doc]) => ({
        type,
        ...(doc as any)
      }));

  const documents: ChefDocumentSummary[] = documentsSource.map((doc: any, index: number) => ({
    type: doc?.type || documentsSource[index]?.type || `document-${index}`,
    url: doc?.url || null,
    uploadedAt: toISOStringOrNull(doc?.uploadedAt)
  }));

  const menus: ChefMenuSummary[] = Array.isArray(chef?.menus)
    ? chef.menus.map((menu: any) => ({
        id: normaliseId(menu?.id || menu?._id),
        name: menu?.name || '',
        description: menu?.description || '',
        price: Number(menu?.price ?? 0),
        type: menu?.type || 'forfait',
        category: menu?.category || '',
        minGuests: Number(menu?.minGuests ?? 1),
        maxGuests: Number(menu?.maxGuests ?? 1),
        image: menu?.image || null,
        isActive: Boolean(menu?.isActive)
      }))
    : [];

  const certifications: PendingChefCertification[] = Array.isArray(chef?.certifications)
    ? chef.certifications.map((cert: any) => ({
        name: cert?.name || '',
        issuer: cert?.issuer || '',
        dateObtained: toISOStringOrNull(cert?.dateObtained),
        expiryDate: toISOStringOrNull(cert?.expiryDate),
        documentUrl: cert?.documentUrl || null
      }))
    : [];

  const location = chef?.location || chef?.user?.address || {};

  const name = chef?.name || chef?.user?.name || '';
  const email = chef?.email || chef?.user?.email || '';
  const phone = chef?.phone || chef?.user?.phone || undefined;

  return {
    id: normaliseId(chef),
    name,
    email,
    phone,
    specialty: chef?.specialty || '',
    experience: chef?.experience?.toString() || '0',
    hourlyRate: Number(chef?.hourlyRate ?? 0),
    location: {
      city: location?.city || '',
      zipCode: location?.zipCode || ''
    },
    submittedAt: toISOStringOrNull(chef?.submittedAt) || new Date().toISOString(),
    documents,
    certifications,
    menus,
    verification: chef?.verification || { status: 'pending' }
  };
};

const fetchChefsFromApi = async (options?: AdminChefListOptions): Promise<{
  chefs: PendingChef[];
  pagination: any;
}> => {
  const response = await apiClient.get('/admin/chefs', {
    params: {
      status: options?.status && options.status !== 'all' ? options.status : undefined,
      page: options?.page,
      limit: options?.limit
    }
  });

  return {
    chefs: Array.isArray(response.data.chefs)
      ? response.data.chefs.map(mapPendingChefFromApi)
      : [],
    pagination: response.data.pagination
  };
};

const mapAdminBookingFromApi = (booking: any): AdminBooking => {
  const client = booking?.client || {};
  const chefProfile = booking?.chef || {};
  const chefUser = chefProfile?.user || chefProfile || {};
  const eventDetails = booking?.eventDetails || {};
  const location = booking?.location || {};
  const pricing = booking?.pricing || {};
  const payment = booking?.payment || {};
  const menu = booking?.menu || {};

  const depositAmount = Number(payment?.depositAmount ?? pricing?.depositAmount ?? 0);
  const totalAmount = Number(pricing?.totalAmount ?? 0);

  return {
    id: normaliseId(booking),
    client: {
      id: normaliseId(client),
      name: client?.name || '',
      email: client?.email || '',
      phone: client?.phone || undefined
    },
    chef: {
      id: normaliseId(chefUser),
      name: chefUser?.name || '',
      email: chefUser?.email || '',
      phone: chefUser?.phone || undefined
    },
    serviceType: booking?.serviceType || '',
    status: booking?.status || '',
    createdAt: toISOStringOrNull(booking?.createdAt) || new Date().toISOString(),
    eventDetails: {
      date: toISOStringOrNull(eventDetails?.date) || '',
      startTime: eventDetails?.startTime || '',
      duration: Number(eventDetails?.duration ?? 0),
      guests: Number(eventDetails?.guests ?? 0),
      eventType: eventDetails?.eventType || undefined
    },
    location: {
      address: location?.address || '',
      city: location?.city || '',
      zipCode: location?.zipCode || '',
      country: location?.country || 'France',
      accessInstructions: location?.accessInstructions || undefined
    },
    pricing: {
      basePrice: Number(pricing?.basePrice ?? 0),
      serviceFee: Number(pricing?.serviceFee ?? 0),
      totalAmount,
      depositAmount: depositAmount || undefined,
      remainingBalance: Math.max(totalAmount - depositAmount, 0)
    },
    payment: {
      status: payment?.status || 'pending',
      depositAmount: depositAmount || undefined,
      depositPaidAt: toISOStringOrNull(payment?.depositPaidAt),
      refundAmount: payment?.refundAmount ? Number(payment?.refundAmount) : undefined,
      refundedAt: toISOStringOrNull(payment?.refundedAt),
      stripePaymentIntentId: payment?.stripePaymentIntentId || undefined
    },
    menu: {
      selectedMenu: normaliseId(menu?.selectedMenu) || undefined,
      dietaryRestrictions: Array.isArray(menu?.dietaryRestrictions) ? menu.dietaryRestrictions : [],
      allergies: Array.isArray(menu?.allergies) ? menu.allergies : [],
      customRequests: menu?.customRequests || null
    },
    timeline: Array.isArray(booking?.timeline)
      ? booking.timeline.map((entry: any) => ({
          status: entry?.status || '',
          note: entry?.note || undefined,
          timestamp: toISOStringOrNull(entry?.timestamp) || new Date().toISOString()
        }))
      : []
  };
};

export const adminService = {
  // Dashboard & Analytics
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get('/admin/stats');
    return response.data.stats;
  },

  async getAnalytics(period?: string): Promise<any> {
    const response = await apiClient.get('/admin/analytics', { params: { period } });
    return response.data.analytics;
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
    const { chefs } = await fetchChefsFromApi({ status: 'pending' });
    return chefs;
  },

  async getChefs(options?: AdminChefListOptions): Promise<{
    chefs: PendingChef[];
    pagination: any;
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
    pagination: any;
  }> {
    const response = await apiClient.get('/admin/users', { params });
    return {
      users: Array.isArray(response.data.users)
        ? response.data.users.map(mapAdminUser)
        : [],
      pagination: response.data.pagination
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
    pagination: any;
  }> {
    const response = await apiClient.get('/admin/disputes', { params });
    return {
      disputes: Array.isArray(response.data.disputes)
        ? response.data.disputes.map(mapAdminBookingFromApi)
        : [],
      pagination: response.data.pagination
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
  }): Promise<{ bookings: AdminBooking[]; pagination: any; }> {
    const response = await apiClient.get('/admin/bookings', { params });
    return {
      bookings: Array.isArray(response.data.bookings)
        ? response.data.bookings.map(mapAdminBookingFromApi)
        : [],
      pagination: response.data.pagination
    };
  }
};
