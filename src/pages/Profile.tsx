import React from 'react';
import { User, LogOut, Award, MapPin, CheckCircle2, Globe, Map } from 'lucide-react';
import { Card, Button } from '../components/ui/Base';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';

const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { userDistrict, setUserDistrict } = useAppContext();
  
  const user = {
    name: 'Farrukh Djumayev',
    email: 'farrukhdjumayev0542@gmail.com',
    role: t('profile.eliteCitizen'),
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300'
  };

  const stats = [
    { label: t('profile.reports'), value: '12', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('profile.verified'), value: '48', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('profile.points'), value: '1,250', icon: Award, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const handleSignOut = () => {
    localStorage.clear();
    navigate('/');
    window.location.reload();
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const districts = ['Tashkent', 'Samarqand', 'Ishtixon', 'Urgut', 'Bukhara'];

  return (
    <div className="min-h-screen bg-gray-50/50 backdrop-blur-sm pb-32">
      <div className="max-w-2xl mx-auto px-4 py-8 lg:py-16">
        {/* Profile Header */}
        <div className="flex flex-col items-center text-center mb-12">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative mb-6"
          >
            <div className="w-32 h-32 rounded-[48px] overflow-hidden border-4 border-white shadow-2xl">
              <img 
                src={user.avatar}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-600/90 backdrop-blur-md p-2.5 rounded-2xl border-4 border-white shadow-lg">
              <Award className="w-5 h-5 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-1">{user.name}</h1>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">{user.role}</p>
          <p className="text-xs text-gray-400 font-medium">{user.email}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 text-center h-full flex flex-col items-center justify-center">
                <div className={`bg-white/50 backdrop-blur-md w-12 h-12 rounded-2xl flex items-center justify-center mb-3 border border-white/50 shadow-sm`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <p className="text-2xl font-black text-gray-900 leading-none mb-1">{stat.value}</p>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          {/* District Selection */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600/10 backdrop-blur-md p-2 rounded-xl border border-blue-600/20">
                <Map className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">{t('report.district')}</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {districts.map((d) => (
                <button
                  key={d}
                  onClick={() => setUserDistrict(d)}
                  className={`py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                    userDistrict === d 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'bg-white/40 border-white/50 text-gray-400 hover:border-gray-300 hover:bg-white/60'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </Card>

          {/* Language Selection */}
          <Card className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-600/10 backdrop-blur-md p-2 rounded-xl border border-emerald-600/20">
                <Globe className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest">Language / Til</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { code: 'uz', label: 'O\'zbek' },
                { code: 'ru', label: 'Русский' },
                { code: 'en', label: 'English' }
              ].map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 ${
                    i18n.language === lang.code 
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                      : 'bg-white/40 border-white/50 text-gray-400 hover:border-gray-300 hover:bg-white/60'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </Card>

          {/* Sign Out */}
          <Button 
            variant="outline" 
            size="lg" 
            onClick={handleSignOut}
            className="w-full py-6 rounded-[24px] border-red-100/50 bg-white/40 backdrop-blur-md text-red-500 hover:bg-red-50 hover:border-red-200 transition-all group"
          >
            <LogOut className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t('profile.signOut')}
          </Button>

          <div className="text-center pt-8">
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">{t('profile.version')}</p>
            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{t('profile.builtFor')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
