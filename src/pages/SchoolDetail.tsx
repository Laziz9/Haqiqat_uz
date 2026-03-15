import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  School, 
  Users, 
  Calendar, 
  Zap, 
  Wifi, 
  Droplets, 
  Construction, 
  Utensils, 
  Trophy,
  Info,
  MapPin,
  Clock
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui/Base';
import { SchoolFacility } from '../services/api';
import { useAppContext } from '../context/AppContext';

const SchoolDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { schools, isLoadingGeo } = useAppContext();
  const [school, setSchool] = useState<SchoolFacility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoadingGeo) {
      const found = schools.find((s: any) => s.id.toString() === id);
      if (found) {
        setSchool(found);
      }
      setLoading(false);
    }
  }, [id, schools, isLoadingGeo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!school) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-black mb-4">Maktab topilmadi</h2>
        <Button onClick={() => navigate('/app')}>Orqaga qaytish</Button>
      </div>
    );
  }

  const stats = [
    { label: 'Sig\'imi', value: school.sigimi, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'O\'quvchilar', value: school.umumiy_uquvchi, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Qurilgan yili', value: school.qurilish_yili, icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' },
    { label: 'Smena', value: school.smena, icon: Clock, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const details = [
    { label: 'Sten materiali', value: school.material_sten, icon: Construction },
    { label: 'Elektr ta\'minoti', value: school.elektr_kun_davomida.replace(/_/g, ' '), icon: Zap },
    { label: 'Suv manbai', value: school.ichimlik_suvi_manbaa.replace(/_/g, ' '), icon: Droplets },
    { label: 'Internet', value: school.internetga_ulanish_turi.replace(/_/g, ' '), icon: Wifi },
  ];

  const facilities = [
    { label: 'Sport zal', status: school.sport_zal_holati, icon: Trophy },
    { label: 'Aktiv zal', status: school.aktiv_zal_holati, icon: Info },
    { label: 'Oshxona', status: school.oshhona_holati, icon: Utensils },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20">
      {/* Header */}
      <div className="bg-white/40 backdrop-blur-xl border-b border-white/50 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={() => navigate('/app')}
            className="p-2 hover:bg-white/50 rounded-xl transition-colors group"
          >
            <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
          </button>
          <h1 className="text-lg font-black tracking-tight uppercase truncate max-w-[200px] sm:max-w-none">
            {school.obekt_nomi}
          </h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-8 bg-white/60 backdrop-blur-2xl border-white/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <School className="w-32 h-32" />
                </div>
                
                <div className="relative z-10">
                  <Badge variant="secondary" className="mb-4 bg-blue-600/10 text-blue-600 border-blue-600/20">
                    ID: {school.id}
                  </Badge>
                  <h2 className="text-3xl font-black mb-2 tracking-tighter uppercase">{school.obekt_nomi}</h2>
                  <div className="flex items-center gap-2 text-gray-500 font-bold text-sm uppercase tracking-widest">
                    <MapPin className="w-4 h-4" />
                    {school.viloyat}, {school.tuman}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
                  {stats.map((stat, i) => (
                    <div key={i} className="p-4 rounded-3xl bg-white/50 border border-white/50">
                      <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                      <p className="text-lg font-black">{stat.value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>

            {/* Infrastructure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-2">Infratuzilma</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {details.map((detail, i) => (
                  <Card key={i} className="p-6 bg-white/40 backdrop-blur-xl border-white/50 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center border border-white/50">
                      <detail.icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{detail.label}</p>
                      <p className="text-sm font-black uppercase">{detail.value}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Facilities Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-2">Holati</h3>
              <div className="grid gap-4">
                {facilities.map((fac, i) => {
                  const isGood = !fac.status.includes('yuq') && !fac.status.includes('yomon');
                  return (
                    <Card key={i} className="p-6 bg-white/40 backdrop-blur-xl border-white/50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/60 flex items-center justify-center border border-white/50">
                          <fac.icon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase">{fac.label}</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                            {fac.status.replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>
                      <Badge className={isGood ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}>
                        {isGood ? 'MAVJUD' : 'MAVJUD EMAS'}
                      </Badge>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6 bg-blue-600 text-white border-none shadow-xl shadow-blue-600/20">
                <h3 className="text-lg font-black mb-4 uppercase tracking-tight">Ma'lumotlar</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">INN</p>
                    <p className="text-xl font-black">{school.inn}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Oxirgi yangilanish</p>
                    <p className="text-sm font-bold">{new Date(school.updated).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest">Kapital ta'mir</p>
                    <p className="text-sm font-bold">{school.kapital_tamir}</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <Card className="p-6 bg-white/40 backdrop-blur-xl border-white/50">
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Boshqa tillarda</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">RU</p>
                  <p className="text-sm font-bold">{school.obekt_nomi_ru}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">EN</p>
                  <p className="text-sm font-bold">{school.obekt_nomi_en}</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchoolDetail;
