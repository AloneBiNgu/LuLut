import api from '../lib/axios';

export interface Location {
  id: string;
  latitude: number;
  longitude: number;
  address?: string;
  locationType: string;
  description?: string;
  status: string;
  reporterName?: string;
  photoUrls?: string[];
}

export const getLocations = async () => {
  const response = await api.get<Location[]>('/locations');
  return response.data;
};
