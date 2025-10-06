import { apiClient } from './apiClient';
import type {
  ChefHomeAppointment,
  ChefHomeAppointmentRequestPayload,
  ChefHomeLocation,
  ChefHomeLocationPayload
} from '../types/chefHome';

const BASE_PATH = '/chef-home-sessions';

export const chefHomeService = {
  getActiveLocations: async () => {
    const response = await apiClient.get<{ success: boolean; data: ChefHomeLocation[] }>(`${BASE_PATH}`);
    return response.data;
  },
  getLocationById: async (locationId: string) => {
    const response = await apiClient.get<{ success: boolean; data: ChefHomeLocation }>(`${BASE_PATH}/${locationId}`);
    return response.data;
  },
  getMyLocations: async () => {
    const response = await apiClient.get<{ success: boolean; data: ChefHomeLocation[] }>(`${BASE_PATH}/my/locations`);
    return response.data;
  },
  createLocation: async (payload: ChefHomeLocationPayload) => {
    const response = await apiClient.post<{ success: boolean; data: ChefHomeLocation }>(`${BASE_PATH}`, payload);
    return response.data;
  },
  updateLocation: async (locationId: string, payload: ChefHomeLocationPayload) => {
    const response = await apiClient.put<{ success: boolean; data: ChefHomeLocation }>(`${BASE_PATH}/${locationId}`, payload);
    return response.data;
  },
  getChefAppointments: async () => {
    const response = await apiClient.get<{ success: boolean; data: ChefHomeAppointment[] }>(`${BASE_PATH}/my/appointments`);
    return response.data;
  },
  getClientAppointments: async () => {
    const response = await apiClient.get<{ success: boolean; data: ChefHomeAppointment[] }>(`${BASE_PATH}/appointments/my`);
    return response.data;
  },
  requestAppointment: async (locationId: string, payload: ChefHomeAppointmentRequestPayload) => {
    const response = await apiClient.post<{ success: boolean; data: ChefHomeAppointment }>(
      `${BASE_PATH}/${locationId}/appointments`,
      payload
    );
    return response.data;
  },
  respondToAppointment: async (appointmentId: string, status: ChefHomeAppointment['status']) => {
    const response = await apiClient.patch<{ success: boolean; data: ChefHomeAppointment }>(
      `${BASE_PATH}/appointments/${appointmentId}/status`,
      { status }
    );
    return response.data;
  }
};

