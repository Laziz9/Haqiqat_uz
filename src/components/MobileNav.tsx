import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, Plus, MapPin, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from './ui/Base';
import { useTranslation } from 'react-i18next';

const MobileNav: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('nav.home'), icon: LayoutDashboard },
    { path: '/tasks', label: t('nav.tasks'), icon: ClipboardList },
    { path: '/report', label: t('nav.report'), icon: Plus, highlight: true },
    { path: '/profile', label: t('nav.profile'), icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[2000] lg:hidden">
      <div className="bg-white/80 backdrop-blur-2xl border-t border-gray-100 px-6 py-3 pb-8 flex items-center justify-between shadow-[0_-10px_30px_-15px_rgba(0,0,0,0.1)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          if (item.highlight) {
            return (
              <Link 
                key={item.path} 
                to={item.path}
                className="relative -top-8"
              >
                <div className="bg-blue-600 p-4 rounded-[24px] shadow-2xl shadow-blue-600/40 border-4 border-white active:scale-90 transition-transform">
                  <Plus className="w-6 h-6 text-white" />
                </div>
              </Link>
            );
          }

          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={cn(
                "flex flex-col items-center gap-1 transition-all active:scale-90",
                isActive ? "text-blue-600" : "text-gray-400"
              )}
            >
              <item.icon className={cn("w-6 h-6", isActive && "fill-blue-600/10")} />
              <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="activeTab"
                  className="w-1 h-1 bg-blue-600 rounded-full mt-0.5"
                />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNav;
