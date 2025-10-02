import { useState, useEffect, useCallback } from 'react';
import { adminService, AdminStats, PendingChef, Dispute, AdminUser } from '../services/adminService';

const getErrorMessage = (unknownError: unknown) => {
  if (unknownError instanceof Error) {
    return unknownError.message;
  }
  return 'Une erreur inattendue est survenue.';
};

export const useAdmin = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingChefs, setPendingChefs] = useState<PendingChef[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  type GetUsersParams = Parameters<typeof adminService.getUsers>[0];
  type GetDisputesParams = Parameters<typeof adminService.getDisputes>[0];

  // Dashboard & Analytics
  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const statsData = await adminService.getStats();
      setStats(statsData);
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    } finally {
      setLoading(false);
    }
  }, []);

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
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    }
  };

  // Chef Management
  const loadPendingChefs = useCallback(async () => {
    try {
      const chefsData = await adminService.getPendingChefs();
      setPendingChefs(chefsData);
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    }
  }, []);

  const verifyChef = async (chefId: string, status: 'approved' | 'rejected', reason?: string) => {
    try {
      await adminService.verifyChef(chefId, status, reason);
      setPendingChefs(prev => prev.filter(chef => chef.id !== chefId));
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    }
  };

  // User Management
  const loadUsers = useCallback(async (params?: GetUsersParams) => {
    try {
      const { users: usersData } = await adminService.getUsers(params);
      setUsers(usersData);
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    }
  }, []);

  const updateUserStatus = async (userId: string, status: 'active' | 'suspended', reason?: string) => {
    try {
      await adminService.updateUserStatus(userId, status, reason);
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, status } : user
      ));
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    }
  };

  const sendMessageToUser = async (userId: string, subject: string, message: string) => {
    try {
      await adminService.sendMessageToUser(userId, subject, message);
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    }
  };

  // Dispute Management
  const loadDisputes = useCallback(async (params?: GetDisputesParams) => {
    try {
      const { disputes: disputesData } = await adminService.getDisputes(params);
      setDisputes(disputesData);
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    }
  }, []);

  const resolveDispute = async (disputeId: string, resolution: string, refundAmount?: number) => {
    try {
      await adminService.resolveDispute(disputeId, resolution, refundAmount);
      setDisputes(prev => prev.map(dispute => 
        dispute.id === disputeId 
          ? { ...dispute, status: 'resolved' as const }
          : dispute
      ));
    } catch (unknownError) {
      setError(getErrorMessage(unknownError));
    }
  };

  useEffect(() => {
    loadStats();
    loadPendingChefs();
    loadDisputes();
    loadUsers();
  }, [loadStats, loadPendingChefs, loadDisputes, loadUsers]);

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
