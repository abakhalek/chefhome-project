import { useState, useEffect, useCallback } from 'react';
import {
  dashboardService,
  DashboardData,
  PlatformAnalytics,
  ChefAnalytics
} from '../services/dashboardService';

export const useDashboard = (userRole: 'chef' | 'client' | 'admin' | 'b2b') => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<PlatformAnalytics | ChefAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (unknownError: unknown) => {
    if (unknownError instanceof Error) {
      return unknownError.message;
    }
    return 'Une erreur inattendue est survenue.';
  };

  const loadDashboard = useCallback(async () => {
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
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  const loadAnalytics = useCallback(async (period?: string) => {
    try {
      setLoading(true);
      if (userRole === 'admin') {
        const analyticsData = await dashboardService.getPlatformAnalytics(period);
        setAnalytics(analyticsData);
      } else if (userRole === 'chef') {
        const analyticsData = await dashboardService.getChefAnalytics(period);
        setAnalytics(analyticsData);
      }
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    } finally {
      setLoading(false);
    }
  }, [userRole]);

  const refreshDashboard = () => {
    loadDashboard();
  };

  useEffect(() => {
    if (userRole) {
      loadDashboard();
    }
  }, [userRole, loadDashboard]);

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
