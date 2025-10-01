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

export interface PendingChef {
  id: string;
  name: string;
  email: string;
  phone: string;
  specialty: string;
  experience: string;
  location: string;
  submittedAt: string;
  documents: string[];
  status: 'pending' | 'approved' | 'rejected';
}

export interface Dispute {
  id: string;
  client: string;
  chef: string;
  issue: string;
  description: string;
  date: string;
  status: 'open' | 'investigating' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  amount: string;
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

const mapAdminUser = (user: any): AdminUser => ({
  id: user.id || user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  status: user.status || (user.isActive ? 'active' : 'suspended'),
  isActive: user.isActive,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  lastLogin: user.lastLogin,
  company: user.company,
  chefStats: user.chefStats,
  bookingStats: user.bookingStats
});


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
    const response = await apiClient.get('/admin/chefs/pending');
    return response.data.chefs;
  },

  async verifyChef(chefId: string, status: 'approved' | 'rejected', reason?: string): Promise<void> {
    await apiClient.put(`/admin/chefs/${chefId}/verify`, { status, rejectionReason: reason });
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
      users: response.data.users.map(mapAdminUser),
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
    password: string;
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
    disputes: Dispute[];
    pagination: any;
  }> {
    const response = await apiClient.get('/admin/disputes', { params });
    return response.data;
  },

  async resolveDispute(disputeId: string, resolution: string, refundAmount?: number): Promise<void> {
    await apiClient.put(`/admin/disputes/${disputeId}/resolve`, { resolution, refundAmount });
  },

  // Booking Management
  async getBookings(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<{ bookings: any[]; pagination: any; }> {
    const response = await apiClient.get('/admin/bookings', { params });
    return response.data;
  }
};