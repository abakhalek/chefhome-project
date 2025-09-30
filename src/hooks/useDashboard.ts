import { useState, useEffect } from 'react';
import { dashboardService, DashboardData } from '../services/dashboardService';

export const useDashboard = (userRole: 'chef' | 'client' | 'admin' | 'b2b') => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      let data: DashboardData;
      switch (userRole) {
        case 'chef':
          data = await dashboardService.getChefDashboard();
          break;
        case 'client':
          data = await dashboardService.getClientDashboard();
          break;
        case 'admin':
          data = await dashboardService.getAdminDashboard();
          break;
        case 'b2b':
          data = await dashboardService.getB2BDashboard();
          break;
        default:
          throw new Error('Invalid user role');
      }

      setDashboardData(data);
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard');
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async (period?: string) => {
    try {
      setLoading(true);
      
      let analyticsData;
      if (userRole === 'admin') {
        analyticsData = await dashboardService.getPlatformAnalytics(period);
      } else if (userRole === 'chef') {
        analyticsData = await dashboardService.getChefAnalytics(period);
      }
      
      setAnalytics(analyticsData);
    } catch (err: any) {
      setError(err.message || 'Error loading analytics');
    } finally {
      setLoading(false);
    }
  };

  const refreshDashboard = () => {
    loadDashboard();
  };

  useEffect(() => {
    if (userRole) {
      loadDashboard();
    }
  }, [userRole]);

  return {
    dashboardData,
    analytics,
    loading,
    error,
    loadDashboard,
    loadAnalytics,
    refreshDashboard
  };
};