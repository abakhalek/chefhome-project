import { useState, useEffect, useCallback } from 'react';
import { chefService, ChefProfile, ChefMenu, Mission, Earnings } from '../services/chefService';

const getErrorMessage = (unknownError: unknown) => {
  if (unknownError instanceof Error) {
    return unknownError.message;
  }
  return 'Une erreur inattendue est survenue.';
};

export const useChef = () => {
  const [profile, setProfile] = useState<ChefProfile | null>(null);
  const [menus, setMenus] = useState<ChefMenu[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [earnings, setEarnings] = useState<Earnings[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((unknownError: unknown) => {
    setError(getErrorMessage(unknownError));
  }, []);

  type GetMissionsParams = Parameters<typeof chefService.getMissions>[0];
  type GetEarningsParams = Parameters<typeof chefService.getEarnings>[0];

  // Profile Management
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const profileData = await chefService.getProfile();
      setProfile(profileData);
    } catch (unknownError) {
      handleError(unknownError);
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const updateProfile = async (profileData: Partial<ChefProfile>) => {
    try {
      setLoading(true);
      const updatedProfile = await chefService.updateProfile(profileData);
      setProfile(updatedProfile);
    } catch (unknownError) {
      handleError(unknownError);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (documentType: string, file: File) => {
    try {
      setLoading(true);
      const result = await chefService.uploadDocument(documentType, file);
      
      if (profile) {
         const documentKey = documentType as keyof ChefProfile['documents'];
        setProfile({
          ...profile,
          documents: {
            ...profile.documents,
            [documentKey]: {
              uploaded: Boolean(result.url),
              url: result.url || undefined,
              uploadedAt: result.uploadedAt || new Date().toISOString()
            }
          }
        });
      }
    } catch (unknownError) {
      handleError(unknownError);
    } finally {
      setLoading(false);
    }
  };

  // Menu Management
  const loadMenus = useCallback(async () => {
    try {
      const menusData = await chefService.getMenus();
      setMenus(menusData);
    } catch (unknownError) {
      handleError(unknownError);
    }
  }, [handleError]);

  const createMenu = async (menuData: Partial<ChefMenu>) => {
    try {
      setLoading(true);
      const newMenu = await chefService.createMenu(menuData);
      setMenus(prev => [...prev, newMenu]);
    } catch (unknownError) {
      handleError(unknownError);
    } finally {
      setLoading(false);
    }
  };

  const updateMenu = async (menuId: string, menuData: Partial<ChefMenu>) => {
    try {
      setLoading(true);
      const updatedMenu = await chefService.updateMenu(menuId, menuData);
      setMenus(prev => prev.map(menu => (menu._id === menuId ? updatedMenu : menu)));
    } catch (unknownError) {
      handleError(unknownError);
    } finally {
      setLoading(false);
    }
  };

  const deleteMenu = async (menuId: string) => {
    try {
      await chefService.deleteMenu(menuId);
      setMenus(prev => prev.filter(menu => menu._id !== menuId));
    } catch (unknownError) {
      handleError(unknownError);
    }
  };

  // Mission Management
  const loadMissions = useCallback(async (params?: GetMissionsParams) => {
    try {
      const { missions: missionData } = await chefService.getMissions(params);
      setMissions(missionData);
    } catch (unknownError) {
      handleError(unknownError);
    }
  }, [handleError]);

  const acceptMission = async (missionId: string) => {
    try {
      await chefService.acceptMission(missionId);
      setMissions(prev => prev.map(mission => 
        mission.id === missionId 
          ? { ...mission, status: 'confirmed' as const }
          : mission
      ));
    } catch (unknownError) {
      handleError(unknownError);
    }
  };

  const declineMission = async (missionId: string, reason?: string) => {
    try {
      await chefService.declineMission(missionId, reason);
      setMissions(prev => prev.map(mission => 
        mission.id === missionId 
          ? { ...mission, status: 'cancelled' as const }
          : mission
      ));
    } catch (unknownError) {
      handleError(unknownError);
    }
  };

  // Earnings Management
  const loadEarnings = useCallback(async (params?: GetEarningsParams) => {
    try {
      const { earnings: earningsData } = await chefService.getEarnings(params);
      setEarnings(earningsData.daily || []);
    } catch (unknownError) {
      handleError(unknownError);
    }
  }, [handleError]);

  const exportEarnings = async (format: 'csv' | 'pdf', period?: string) => {
    try {
      const blob = await chefService.exportEarnings(format, period);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `earnings_${period || 'all'}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (unknownError) {
      handleError(unknownError);
    }
  };

  useEffect(() => {
    loadProfile();
    loadMenus();
    loadMissions();
    loadEarnings();
  }, [loadProfile, loadMenus, loadMissions, loadEarnings]);

  return {
    // State
    profile,
    menus,
    missions,
    earnings,
    loading,
    error,
    
    // Profile actions
    updateProfile,
    uploadDocument,
    
    // Menu actions
    createMenu,
    updateMenu,
    deleteMenu,
    loadMenus,
    
    // Mission actions
    loadMissions,
    acceptMission,
    declineMission,
    
    // Earnings actions
    loadEarnings,
    exportEarnings
  };
};
