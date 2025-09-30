import { useState, useEffect } from 'react';
import { b2bService, B2BMission, B2BChef, B2BAnalytics } from '../services/b2bService';

export const useB2B = () => {
  const [missions, setMissions] = useState<B2BMission[]>([]);
  const [chefs, setChefs] = useState<B2BChef[]>([]);
  const [analytics, setAnalytics] = useState<B2BAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mission Management
  const loadMissions = async (params?: any) => {
    try {
      setLoading(true);
      const { missions: missionData } = await b2bService.getMissions(params);
      setMissions(missionData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createMission = async (missionData: any) => {
    try {
      setLoading(true);
      const newMission = await b2bService.createMission(missionData);
      setMissions(prev => [...prev, newMission]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const assignChefToMission = async (missionId: string, chefId: string) => {
    try {
      await b2bService.assignChefToMission(missionId, chefId);
      setMissions(prev => prev.map(mission => 
        mission.id === missionId 
          ? { ...mission, status: 'in_progress' as const, assignedChef: chefId }
          : mission
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Chef Management
  const searchChefs = async (filters: any) => {
    try {
      setLoading(true);
      const { chefs: chefData } = await b2bService.searchChefs(filters);
      setChefs(chefData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Analytics
  const loadAnalytics = async (period?: string) => {
    try {
      const analyticsData = await b2bService.getAnalytics(period);
      setAnalytics(analyticsData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const generateInvoice = async (missionId: string) => {
    try {
      const invoice = await b2bService.generateInvoice(missionId);
      return invoice;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    loadMissions();
    loadAnalytics();
  }, []);

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