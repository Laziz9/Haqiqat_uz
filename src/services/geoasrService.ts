import axios from 'axios';

// Use local proxy routes to avoid CORS issues
const SCHOOLS_URL = '/api/geoasr/schools';
const KINDERGARTENS_URL = '/api/geoasr/kindergartens';
const SSV_URL = '/api/geoasr/healthcare';

// No token needed on client side as it's handled by the server proxy
const geoApi = axios.create();

export interface GeoAsrFeature {
  id: number;
  nomi: string;
  tuman: string;
  lat: string;
  long: string;
  type?: 'school' | 'kindergarten' | 'hospital';
  address?: string;
  [key: string]: any;
}

const extractArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    // Try common keys for data arrays
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.results)) return data.results;
    if (Array.isArray(data.features)) return data.features;
    if (Array.isArray(data.items)) return data.items;
  }
  return [];
};

export const getSchools = async (): Promise<GeoAsrFeature[]> => {
  const response = await geoApi.get(SCHOOLS_URL);
  const data = extractArray(response.data);
  return data.map((item: any) => ({ ...item, type: 'school' }));
};

export const getKindergartens = async (): Promise<GeoAsrFeature[]> => {
  const response = await geoApi.get(KINDERGARTENS_URL);
  const data = extractArray(response.data);
  return data.map((item: any) => ({ ...item, type: 'kindergarten' }));
};

export const getHospitals = async (): Promise<GeoAsrFeature[]> => {
  const response = await geoApi.get(SSV_URL);
  const data = extractArray(response.data);
  return data.map((item: any) => ({ ...item, type: 'hospital' }));
};

export const geoasrService = {
  getSchools,
  getKindergartens,
  getHealthcareFacilities: getHospitals,
};
