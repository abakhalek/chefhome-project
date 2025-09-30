import { useState, useEffect } from 'react';
import { adminService, AdminStats, PendingChef, Dispute, AdminUser } from '../services/adminService';

export const useAdmin = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingChefs, setPendingChefs] = useState<PendingChef[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dashboard & Analytics
  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await adminService.getStats();
      setStats(statsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (type: string, format: 'csv' | 'pdf') => {
    try {
      const blob = await adminService.exportData(type, format);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Chef Management
  const loadPendingChefs = async () => {
    try {
      const chefsData = await adminService.getPendingChefs();
      setPendingChefs(chefsData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const verifyChef = async (chefId: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      await adminService.verifyChef(chefId, status, reason);
      setPendingChefs(prev => prev.filter(chef => chef.id !== chefId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  // User Management
  const loadUsers = async (params?: any) => {
    try {
      const { users: usersData } = await adminService.getUsers(params);
      setUsers(usersData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateUserStatus = async (userId: string, status: 'active' | 'suspended', reason?: string) => {
    try {
      await adminService.updateUserStatus(userId, status, reason);
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status } : user
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const sendMessageToUser = async (userId: string, subject: string, message: string) => {
    try {
      await adminService.sendMessageToUser(userId, subject, message);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Dispute Management
  const loadDisputes = async (params?: any) => {
    try {
      const { disputes: disputesData } = await adminService.getDisputes(params);
      setDisputes(disputesData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resolveDispute = async (disputeId: string, resolution: string, refundAmount?: number) => {
    try {
      await adminService.resolveDispute(disputeId, resolution, refundAmount);
      setDisputes(prev => prev.map(dispute => 
        dispute.id === disputeId 
          ? { ...dispute, status: 'resolved' as const }
          : dispute
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadStats();
    loadPendingChefs();
    loadDisputes();
    loadUsers();
  }, []);

  return {
    // State
    stats,
    pendingChefs,
    disputes,
    users,
    loading,
    error,
    
    // Actions
    loadStats,
    exportData,
    verifyChef,
    loadUsers,
    updateUserStatus,
    sendMessageToUser,
    resolveDispute,
    loadDisputes
  };
};