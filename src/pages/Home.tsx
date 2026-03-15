import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import MapComponent from '../components/MapComponent';
import ProblemCard from '../components/ProblemCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, TrendingUp } from 'lucide-react';
import { Button, Card, cn } from '../components/ui/Base';
import { useTranslation } from 'react-i18next';
import { Problem, SchoolFacility } from '../services/api';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const { problems, schools } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = React.useState<'problems' | 'schools'>('problems');
  const [search, setSearch] = React.useState('');

  const filteredData = activeTab === 'problems' 
    ? problems.filter(p => p.title.toLowerCase().includes(search.toLowerCase()))
    : (Array.isArray(schools) ? schools.filter(s => s.obekt_nomi.toLowerCase().includes(search.toLowerCase())) : []);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Map View - Full Screen */}
        <div className="absolute inset-0 z-0">
          <MapComponent problems={problems} />
        </div>
        
        {/* Floating Action Button (Mobile & Desktop) */}
        <div className="absolute bottom-24 right-6 z-[1000]">
          <Button 
            size="lg"
            onClick={() => navigate('/report')}
            className="rounded-full w-14 h-14 p-0 shadow-xl shadow-blue-600/30 flex items-center justify-center bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-6 h-6 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
