import api from '../lib/axios';

export interface MissingPerson {
  id: string;
  fullName: string;
  age?: number;
  gender?: string;
  description: string;
  lastSeenDate: string;
  status: string;
  reporterName: string;
  reporterPhone: string;
  lastKnownLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  photoUrls: string[];
  createdAt: string;
}

export const getMissingPersons = async () => {
  const response = await api.get<MissingPerson[]>('/missing-persons');
  return response.data;
};

export const getMissingPersonById = async (id: string) => {
  const response = await api.get<MissingPerson>(`/missing-persons/${id}`);
  return response.data;
};

export const updateMissingPersonLocation = async (id: string, location: { latitude: number; longitude: number; address?: string }) => {
  const response = await api.patch<MissingPerson>(`/missing-persons/${id}/location`, location);
  return response.data;
};
