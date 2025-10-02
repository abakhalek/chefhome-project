import { apiClient } from './apiClient';

type ApiRecord = Record<string, unknown>;

const toObject = (value: unknown): ApiRecord => (typeof value === 'object' && value !== null ? value as ApiRecord : {});
const toArray = (value: unknown): ApiRecord[] => (Array.isArray(value) ? value as ApiRecord[] : []);

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
  [key: string]: number | undefined;
}

export interface DashboardData {
  stats: DashboardStats;
  missions?: ApiRecord[];
  bookings?: ApiRecord[];
  recentActivity?: ApiRecord[];
  upcomingEvents?: ApiRecord[];
  favoriteChefs?: ApiRecord[];
  recentReviews?: ApiRecord[];
  earnings?: ApiRecord;
  alerts?: ApiRecord;
  chef?: ApiRecord;
  user?: ApiRecord;
  company?: ApiRecord;
}

export interface PlatformAnalytics {
  missionCount?: number;
  revenue?: number;
  activeUsers?: number;
  [key: string]: unknown;
}

export interface ChefAnalytics {
  missionCount?: number;
  earnings?: number;
  rating?: number;
  [key: string]: unknown;
}

const mapStats = (stats: unknown): DashboardStats => {
  const statsObj = toObject(stats);
  return Object.entries(statsObj).reduce((acc, [key, value]) => {
    if (typeof value === 'number') {
      acc[key] = value;
    } else if (typeof value === 'string') {
      const numeric = Number(value);
      if (!Number.isNaN(numeric)) {
        acc[key] = numeric;
      }
    }
    return acc;
  }, {} as DashboardStats);
};

const mapDashboardData = (data: unknown): DashboardData => {
  const dashboardObj = toObject(data);
  return {
    stats: mapStats(dashboardObj.stats),
    missions: toArray(dashboardObj.missions),
    bookings: toArray(dashboardObj.bookings),
    recentActivity: toArray(dashboardObj.recentActivity),
    upcomingEvents: toArray(dashboardObj.upcomingEvents),
    favoriteChefs: toArray(dashboardObj.favoriteChefs),
    recentReviews: toArray(dashboardObj.recentReviews),
    earnings: toObject(dashboardObj.earnings),
    alerts: toObject(dashboardObj.alerts),
    chef: toObject(dashboardObj.chef),
    user: toObject(dashboardObj.user),
    company: toObject(dashboardObj.company)
  };
};

const mapAnalytics = <T extends object>(data: unknown): T => toObject(data) as T;

export const dashboardService = {
  // Chef Dashboard
  async getChefDashboard(): Promise<DashboardData> {
    const response = await apiClient.get('/dashboard/chef');
    return mapDashboardData(response.data.dashboard ?? response.data);
  },

  // Client Dashboard
  async getClientDashboard(): Promise<DashboardData> {
    const response = await apiClient.get('/dashboard/client');
    return mapDashboardData(response.data.dashboard ?? response.data);
  },

  // Admin Dashboard
  async getAdminDashboard(): Promise<DashboardData> {
    const response = await apiClient.get('/dashboard/admin');
    return mapDashboardData(response.data.dashboard ?? response.data);
  },

  // B2B Dashboard
  async getB2BDashboard(): Promise<DashboardData> {
    const response = await apiClient.get('/dashboard/b2b');
    return mapDashboardData(response.data.dashboard ?? response.data);
  },

  // Platform Analytics
  async getPlatformAnalytics(period?: string): Promise<PlatformAnalytics> {
    const response = await apiClient.get('/analytics/platform', { params: { period } });
    return mapAnalytics<PlatformAnalytics>(response.data.analytics ?? response.data);
  },

  // Chef Analytics
  async getChefAnalytics(period?: string): Promise<ChefAnalytics> {
    const response = await apiClient.get('/analytics/chef', { params: { period } });
    return mapAnalytics<ChefAnalytics>(response.data.analytics ?? response.data);
  }
};
