import { apiClient } from './apiClient';

export interface DashboardStats {
  monthlyMissions?: number;
  monthlyEarnings?: number;
  averageRating?: number;
  totalMissions?: number;
  acceptanceRate?: number;
  totalBookings?: number;
  totalSpent?: number;
  upcomingBookings?: number;
  favoriteChefs?: number;
  totalUsers?: number;
  totalChefs?: number;
  pendingChefs?: number;
  monthlyRevenue?: number;
  activeDisputes?: number;
  activeMissions?: number;
  completedMissions?: number;
  partnerChefs?: number;
}

export interface DashboardData {
  stats: DashboardStats;
  missions?: any[];
  bookings?: any[];
  recentActivity?: any[];
  upcomingEvents?: any[];
  favoriteChefs?: any[];
  recentReviews?: any[];
  earnings?: any;
  alerts?: any;
  chef?: any;
  user?: any;
  company?: any;
}

export const dashboardService = {
  // Chef Dashboard
  async getChefDashboard(): Promise<DashboardData> {
    const response = await apiClient.get('/dashboard/chef');
    return response.data.dashboard;
  },

  // Client Dashboard
  async getClientDashboard(): Promise<DashboardData> {
    const response = await apiClient.get('/dashboard/client');
    return response.data.dashboard;
  },

  // Admin Dashboard
  async getAdminDashboard(): Promise<DashboardData> {
    const response = await apiClient.get('/dashboard/admin');
    return response.data.dashboard;
  },

  // B2B Dashboard
  async getB2BDashboard(): Promise<DashboardData> {
    const response = await apiClient.get('/dashboard/b2b');
    return response.data.dashboard;
  },

  // Platform Analytics
  async getPlatformAnalytics(period?: string): Promise<any> {
    const response = await apiClient.get('/analytics/platform', { params: { period } });
    return response.data.analytics;
  },

  // Chef Analytics
  async getChefAnalytics(period?: string): Promise<any> {
    const response = await apiClient.get('/analytics/chef', { params: { period } });
    return response.data.analytics;
  }
};