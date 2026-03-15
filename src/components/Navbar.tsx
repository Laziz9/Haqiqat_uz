import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MapPin, Plus, ClipboardList, LayoutDashboard, ChevronDown, Bell, User, Languages, Menu } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Button } from './ui/Base';
import { useTranslation } from 'react-i18next';
import SearchBar from './SearchBar';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { userDistrict, setUserDistrict, isNotificationBarOpen, setIsNotificationBarOpen } = useAppContext();

  const districts = ['Tashkent', 'Samarqand', 'Ishtixon', 'Urgut', 'Bukhara'];
  const languages = [
    { code: 'uz', label: 'O\'zbek' },
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' }
  ];

  const navItems = [
    { path: '/', label: 'Notification Bar', icon: LayoutDashboard },
    { path: '/tasks', label: t('nav.tasks'), icon: ClipboardList },
    { path: '/profile', label: t('nav.profile'), icon: User },
  ];

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <nav className="fixed bottom-4 left-4 right-4 z-[2000] bg-white/40 backdrop-blur-2xl border border-white/30 rounded-full px-6 py-3 lg:top-4 lg:bottom-auto lg:left-1/2 lg:-translate-x-1/2 lg:w-max lg:max-w-[90%] lg:px-8 lg:py-3 lg:rounded-full shadow-2xl">
      <div className="flex items-center gap-8">
        <Link to="/" className="hidden lg:flex items-center gap-3 group shrink-0">
          <div className="bg-blue-600/90 backdrop-blur-md p-2 rounded-xl shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform border border-white/20">
            <MapPin className="text-white w-4 h-4" />
          </div>
          <div>
            <span className="font-black text-lg tracking-tighter text-gray-900 block leading-none">HAQIQAT UZ</span>
            <span className="text-[8px] font-bold text-gray-500 uppercase tracking-widest">Civic Transparency</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex-1 lg:flex-none flex items-center justify-around lg:justify-center gap-1 lg:bg-white/20 lg:backdrop-blur-md lg:p-1 lg:rounded-2xl lg:border lg:border-white/30">
          {navItems.map((item) => (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex flex-col lg:flex-row items-center gap-1 lg:gap-2 px-3 lg:px-5 py-1 lg:py-2 rounded-xl text-[10px] lg:text-sm font-bold transition-all ${
                location.pathname === item.path 
                  ? 'text-blue-600 lg:bg-white/80 lg:shadow-sm lg:backdrop-blur-sm' 
                  : 'text-gray-400 lg:text-gray-500 hover:text-gray-900'
              }`}
            >
              <item.icon className="w-5 h-5 lg:w-4 lg:h-4" />
              <span className="lg:inline">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <SearchBar className="w-48" />
          
          {/* Language Switcher (Desktop) */}
          <div className="relative group">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-2xl cursor-pointer hover:bg-white/30 transition-all">
              <Languages className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-bold text-gray-900 uppercase">{i18n.language.slice(0, 2)}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform" />
            </div>
            <div className="absolute top-full right-0 mt-2 w-32 bg-white/60 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-1.5 z-[2100]">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => changeLanguage(lang.code)}
                  className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    i18n.language === lang.code ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-600 hover:bg-white/50'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* District Switcher (Desktop) */}
          <div className="relative group">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-2xl cursor-pointer hover:bg-white/30 transition-all">
              <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{t('tasks.district')}</span>
              <span className="text-sm font-bold text-gray-900">{userDistrict}</span>
              <ChevronDown className="w-4 h-4 text-gray-400 group-hover:rotate-180 transition-transform" />
            </div>
            <div className="absolute top-full right-0 mt-2 w-48 bg-white/60 backdrop-blur-2xl border border-white/30 rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-1.5 z-[2100]">
              <div className="max-h-64 overflow-y-auto scrollbar-hide">
                {districts.map(d => (
                  <button
                    key={d}
                    onClick={() => setUserDistrict(d)}
                    className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                      userDistrict === d ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-gray-600 hover:bg-white/50'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsNotificationBarOpen(!isNotificationBarOpen)}
            className={`p-2.5 backdrop-blur-md rounded-2xl transition-all border border-white/30 ${
              isNotificationBarOpen ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/20 text-gray-600 hover:bg-white/30'
            }`}
          >
            <Bell className="w-5 h-5" />
          </button>

          <Button 
            onClick={() => navigate('/report')}
            className="rounded-2xl px-6 bg-blue-600/90 backdrop-blur-md hover:bg-blue-600 border border-white/10 shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('nav.report')}
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
