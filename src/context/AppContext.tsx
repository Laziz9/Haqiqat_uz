import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { SchoolFacility } from '../services/api';
import { geoasrService } from '../services/geoasrService';

interface Problem {
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

interface Task {
  id: string;
  title: string;
  description: string;
  expected_length: number;
  latitude: number;
  longitude: number;
  district: string;
  status: string;
  verifications: any[];
}

interface AppContextType {
  userDistrict: string;
  setUserDistrict: (district: string) => void;
  problems: Problem[];
  tasks: Task[];
  schools: any[];
  kindergartens: any[];
  hospitals: any[];
  refreshProblems: () => Promise<void>;
  refreshTasks: () => Promise<void>;
  refreshSchools: () => Promise<void>;
  refreshKindergartens: () => Promise<void>;
  refreshHospitals: () => Promise<void>;
  isLoadingGeo: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isNotificationBarOpen: boolean;
  setIsNotificationBarOpen: (isOpen: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userDistrict, setUserDistrict] = useState(() => {
    return localStorage.getItem('userDistrict') || 'Tashkent';
  });
  const [problems, setProblems] = useState<Problem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [kindergartens, setKindergartens] = useState<any[]>([]);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [isLoadingGeo, setIsLoadingGeo] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNotificationBarOpen, setIsNotificationBarOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('userDistrict', userDistrict);
  }, [userDistrict]);

  const refreshProblems = async () => {
    try {
      const res = await api.get('problems');
      setProblems(res.data);
    } catch (err) {
      console.error('Error fetching problems:', err);
    }
  };

  const refreshTasks = async () => {
    try {
      const res = await api.get(`tasks?district=${userDistrict}`);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const refreshSchools = async () => {
    try {
      const data = await geoasrService.getSchools();
      setSchools(data);
    } catch (err) {
      console.error('Error fetching schools:', err);
    }
  };

  const refreshKindergartens = async () => {
    try {
      const data = await geoasrService.getKindergartens();
      setKindergartens(data);
    } catch (err) {
      console.error('Error fetching kindergartens:', err);
    }
  };

  const refreshHospitals = async () => {
    try {
      const data = await geoasrService.getHealthcareFacilities();
      setHospitals(data);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingGeo(true);
      await Promise.all([
        refreshProblems(),
        refreshSchools(),
        refreshKindergartens(),
        refreshHospitals()
      ]);
      setIsLoadingGeo(false);
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    refreshTasks();
  }, [userDistrict]);

  return (
    <AppContext.Provider value={{ 
      userDistrict, 
      setUserDistrict, 
      problems, 
      tasks, 
      schools, 
      kindergartens,
      hospitals,
      refreshProblems, 
      refreshTasks, 
      refreshSchools,
      refreshKindergartens,
      refreshHospitals,
      isLoadingGeo,
      searchQuery,
      setSearchQuery,
      isNotificationBarOpen,
      setIsNotificationBarOpen
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within AppProvider');
  return context;
};
