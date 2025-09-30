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

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'chef' | 'b2b';
  status: 'active' | 'suspended' | 'pending';
  joinDate: string;
  lastLogin: string;
  totalBookings?: number;
  totalSpent?: string;
  rating?: number;
  verificationStatus?: string;
  company?: string;
}

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
    return response.data;
  },

  async updateUserStatus(userId: string, status: 'active' | 'suspended', reason?: string): Promise<void> {
    await apiClient.put(`/admin/users/${userId}/status`, { status, reason });
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