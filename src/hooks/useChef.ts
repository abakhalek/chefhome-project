import { useState, useEffect } from 'react';
import { chefService, ChefProfile, ChefMenu, Mission, Earnings } from '../services/chefService';

export const useChef = () => {
  const [profile, setProfile] = useState<ChefProfile | null>(null);
  const [menus, setMenus] = useState<ChefMenu[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [earnings, setEarnings] = useState<Earnings[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Profile Management
  const loadProfile = async () => {
    try {
      setLoading(true);
      const profileData = await chefService.getProfile();
      setProfile(profileData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<ChefProfile>) => {
    try {
      setLoading(true);
      const updatedProfile = await chefService.updateProfile(profileData);
      setProfile(updatedProfile);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (documentType: string, file: File) => {
    try {
      setLoading(true);
      const result = await chefService.uploadDocument(documentType, file);
      
      if (profile) {
        setProfile({
          ...profile,
          documents: {
            ...profile.documents,
            [documentType]: {
              uploaded: true,
              url: result.url,
              uploadedAt: new Date().toISOString()
            }
          }
        });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Menu Management
  const loadMenus = async () => {
    try {
      const menusData = await chefService.getMenus();
      setMenus(menusData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createMenu = async (menuData: Partial<ChefMenu>) => {
    try {
      setLoading(true);
      const newMenu = await chefService.createMenu(menuData);
      setMenus(prev => [...prev, newMenu]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateMenu = async (menuId: string, menuData: Partial<ChefMenu>) => {
    try {
      setLoading(true);
      const updatedMenu = await chefService.updateMenu(menuId, menuData);
      setMenus(prev => prev.map(menu => menu.id === menuId ? updatedMenu : menu));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteMenu = async (menuId: string) => {
    try {
      await chefService.deleteMenu(menuId);
      setMenus(prev => prev.filter(menu => menu.id !== menuId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Mission Management
  const loadMissions = async (params?: any) => {
    try {
      const { missions: missionData } = await chefService.getMissions(params);
      setMissions(missionData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const acceptMission = async (missionId: string) => {
    try {
      await chefService.acceptMission(missionId);
      setMissions(prev => prev.map(mission => 
        mission.id === missionId 
          ? { ...mission, status: 'confirmed' as const }
          : mission
      ));
    } catch (err: any) {
      setError(err.message);
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
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Earnings Management
  const loadEarnings = async (params?: any) => {
    try {
      const { earnings: earningsData } = await chefService.getEarnings(params);
      setEarnings(earningsData);
    } catch (err: any) {
      setError(err.message);
    }
  };

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
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadProfile();
    loadMenus();
    loadMissions();
    loadEarnings();
  }, []);

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