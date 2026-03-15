import axios from 'axios';

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || '/api/').replace(/\/$/, '') + '/';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor for auth if needed
api.interceptors.request.use((config) => {
  const token = import.meta.env.VITE_API_TOKEN;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor for retries on 429
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    
    // If it's a 429 and we haven't retried too many times
    if (response?.status === 429 && (!config._retryCount || config._retryCount < 3)) {
      config._retryCount = (config._retryCount || 0) + 1;
      
      // Exponential backoff
      const delay = Math.pow(2, config._retryCount) * 1000;
      console.warn(`Rate limited (429). Retrying in ${delay}ms... (Attempt ${config._retryCount})`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      return api(config);
    }
    
    return Promise.reject(error);
  }
);

export interface Problem {
  id: string;
  title: string;
  description: string;
  image: string;
  latitude: number;
  longitude: number;
  district: string;
  votes: number;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  expected_length: number;
  latitude: number;
  longitude: number;
  district: string;
  status: string;
  verifications: Verification[];
}

export interface Verification {
  status: 'Done' | 'Partial' | 'Not Done';
  reported_length?: number;
  comment?: string;
}

export interface SchoolFacility {
  _uid_: number;
  viloyat: string;
  tuman: string;
  obekt_nomi: string;
  inn: string;
  smena: string;
  material_sten: string;
  sport_zal_holati: string;
  aktiv_zal_holati: string;
  oshhona_holati: string;
  elektr_kun_davomida: string;
  ichimlik_suvi_manbaa: string;
  internetga_ulanish_turi: string;
  updated: string;
  sigimi: string;
  umumiy_uquvchi: string;
  qurilish_yili: string;
  parent_code: number;
  code: number;
  mahalla_id: number | null;
  kapital_tamir: string;
  id: number;
  obekt_nomi_ru: string;
  obekt_nomi_en: string;
  color: string | null;
}

export interface TaskStats {
  done: number;
  partial: number;
  not_done: number;
  average_meters: number;
}

export const problemService = {
  getAll: () => api.get<Problem[]>('problems'),
  create: (data: Partial<Problem>) => api.post<Problem>('problems', data),
  vote: (id: string) => api.post<Problem>(`problems/${id}/vote`),
};

export const schoolService = {
  getAll: () => api.get<SchoolFacility[]>('geoasr/schools'), 
};

export const taskService = {
  getByDistrict: (district: string, signal?: AbortSignal) => api.get<Task[]>(`tasks?district=${district}`, { signal }),
  verify: (id: string, data: Verification) => api.post(`tasks/${id}/verify`, data),
  getStats: (id: string) => api.get<TaskStats>(`tasks/${id}/stats`),
};

export default api;
