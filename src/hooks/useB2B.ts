import { useState, useEffect, useCallback } from 'react';
import {
  b2bService,
  B2BMission,
  B2BChef,
  B2BAnalytics,
  B2BChefSearchFilters
} from '../services/b2bService';

const getErrorMessage = (unknownError: unknown) => {
  if (unknownError instanceof Error) {
    return unknownError.message;
  }
  return 'Une erreur inattendue est survenue.';
};

export const useB2B = () => {
  const [missions, setMissions] = useState<B2BMission[]>([]);
  const [chefs, setChefs] = useState<B2BChef[]>([]);
  const [analytics, setAnalytics] = useState<B2BAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type GetMissionsParams = Parameters<typeof b2bService.getMissions>[0];
  type GetAnalyticsParam = Parameters<typeof b2bService.getAnalytics>[0];

  // Mission Management
  const loadMissions = useCallback(async (params?: GetMissionsParams) => {
    try {
      setLoading(true);
      const { missions: missionData } = await b2bService.getMissions(params);
      setMissions(missionData);
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    } finally {
      setLoading(false);
    }
  }, []);

  const createMission = useCallback(async (missionData: Partial<B2BMission>) => {
    try {
      setLoading(true);
      const newMission = await b2bService.postMission(missionData);
      setMissions(prev => [...prev, newMission]);
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    } finally {
      setLoading(false);
    }
  }, []);

  const assignChefToMission = useCallback(async (missionId: string, chefId: string) => {
    try {
      await b2bService.assignChefToMission(missionId, chefId);
      setMissions(prev => prev.map(mission => 
        mission.id === missionId 
          ? { ...mission, status: 'in_progress', assignedChef: chefId }
          : mission
      ));
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    }
  }, []);

  // Chef Management
  const searchChefs = useCallback(async (filters?: B2BChefSearchFilters) => {
    try {
      setLoading(true);
      const { chefs: chefData } = await b2bService.searchChefs(filters);
      setChefs(chefData);
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    } finally {
      setLoading(false);
    }
  }, []);

  // Analytics
  const loadAnalytics = useCallback(async (period?: GetAnalyticsParam) => {
    try {
      const analyticsData = await b2bService.getAnalytics(period);
      setAnalytics(analyticsData);
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    }
  }, []);

  const generateInvoice = useCallback(async (missionId: string) => {
    try {
      const invoice = await b2bService.generateInvoice(missionId);
      return invoice;
    } catch (unknownError) {
      const message = getErrorMessage(unknownError);
      setError(message);
      throw new Error(message);
    }
  }, []);

  useEffect(() => {
    loadMissions();
    loadAnalytics();
  }, [loadMissions, loadAnalytics]);

  return {
    // State
    missions,
    chefs,
    analytics,
    loading,
    error,
    
    // Mission actions
    loadMissions,
    createMission,
    assignChefToMission,

    // Chef actions
    searchChefs,

    // Analytics
    loadAnalytics,
    generateInvoice
  };
};
