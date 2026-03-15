import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, School, Baby, HeartPulse, TrendingUp, Search, AlertCircle, ThumbsUp } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { Card, cn } from './ui/Base';

const NotificationBar: React.FC = () => {
  const { 
    isNotificationBarOpen, 
    setIsNotificationBarOpen,
    schools,
    kindergartens,
    hospitals,
    problems,
    isLoadingGeo
  } = useAppContext();

  const [activeTab, setActiveTab] = React.useState<'schools' | 'kindergartens' | 'healthcare' | 'problems'>('problems');
  const [search, setSearch] = React.useState('');

  const getData = () => {
    switch (activeTab) {
      case 'schools': return schools;
      case 'kindergartens': return kindergartens;
      case 'healthcare': return hospitals;
      case 'problems': return problems;
      default: return [];
    }
  };

  const filteredData = getData().filter((item: any) => 
    (item.obekt_nomi || item.nomi || item.title)?.toLowerCase().includes(search.toLowerCase()) ||
    (item.tuman || item.district)?.toLowerCase().includes(search.toLowerCase())
  );

  const getIcon = () => {
    switch (activeTab) {
      case 'schools': return <School className="w-5 h-5" />;
      case 'kindergartens': return <Baby className="w-5 h-5" />;
      case 'healthcare': return <HeartPulse className="w-5 h-5" />;
      case 'problems': return <AlertCircle className="w-5 h-5" />;
    }
  };

  return (
    <AnimatePresence>
      {isNotificationBarOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsNotificationBarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[2500]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full md:w-[450px] bg-white/80 backdrop-blur-3xl border-l border-white/30 z-[2600] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-8 flex items-center justify-between border-b border-black/5">
              <div>
                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Notification Bar</h2>
                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-1">Real-time Infrastructure Data</p>
              </div>
              <button 
                onClick={() => setIsNotificationBarOpen(false)}
                className="p-2 hover:bg-black/5 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-8 py-6">
              <div className="flex gap-2 p-1.5 bg-black/5 rounded-2xl overflow-x-auto scrollbar-hide">
                {(['problems', 'schools', 'kindergartens', 'healthcare'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "flex-1 min-w-[80px] py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-1",
                      activeTab === tab 
                        ? "bg-white text-blue-600 shadow-xl shadow-blue-600/10" 
                        : "text-gray-400 hover:text-gray-900"
                    )}
                  >
                    {tab === 'problems' && <AlertCircle className="w-4 h-4" />}
                    {tab === 'schools' && <School className="w-4 h-4" />}
                    {tab === 'kindergartens' && <Baby className="w-4 h-4" />}
                    {tab === 'healthcare' && <HeartPulse className="w-4 h-4" />}
                    {tab === 'healthcare' ? 'Health' : tab.charAt(0).toUpperCase() + tab.slice(1, tab === 'problems' ? undefined : -1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="px-8 mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${activeTab}...`}
                  className="w-full bg-black/5 border border-transparent focus:border-blue-600/20 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold placeholder-gray-400 focus:outline-none focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-4 scrollbar-hide">
              {isLoadingGeo ? (
                <div className="flex flex-col items-center justify-center h-64 gap-4">
                  <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Data...</p>
                </div>
              ) : filteredData.length > 0 ? (
                filteredData.map((item: any, index: number) => (
                  <motion.div
                    key={item.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white rounded-[32px] p-6 border border-black/5 hover:border-blue-600/20 hover:shadow-2xl hover:shadow-blue-600/5 transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                        activeTab === 'problems' 
                          ? "bg-red-500/5 text-red-500 group-hover:bg-red-500 group-hover:text-white"
                          : "bg-blue-600/5 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                      )}>
                        {getIcon()}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-black text-gray-900 leading-tight mb-1">{item.obekt_nomi || item.nomi || item.title}</h3>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mb-3">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            activeTab === 'problems' ? "text-red-500" : "text-blue-600"
                          )}>{item.tuman || item.district || item.viloyat}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-300" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {item.manzil || item.address || (item.viloyat ? `${item.viloyat}, ${item.tuman}` : item.description?.slice(0, 30) + '...')}
                          </span>
                        </div>
                        
                        {/* Additional Data Points */}
                        {activeTab === 'problems' ? (
                          <div className="flex items-center gap-4">
                            <div className="bg-black/5 rounded-xl px-3 py-2 flex items-center gap-2">
                              <ThumbsUp className="w-3 h-3 text-gray-400" />
                              <span className="text-xs font-black text-gray-900">{item.votes || 0}</span>
                            </div>
                            <div className="bg-black/5 rounded-xl px-3 py-2">
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {item.sigimi && (
                              <div className="bg-black/5 rounded-xl p-2">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Capacity</p>
                                <p className="text-xs font-black text-gray-900">{item.sigimi}</p>
                              </div>
                            )}
                            {item.umumiy_uquvchi && (
                              <div className="bg-black/5 rounded-xl p-2">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Students</p>
                                <p className="text-xs font-black text-gray-900">{item.umumiy_uquvchi}</p>
                              </div>
                            )}
                            {item.qurilish_yili && (
                              <div className="bg-black/5 rounded-xl p-2">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Built</p>
                                <p className="text-xs font-black text-gray-900">{item.qurilish_yili}</p>
                              </div>
                            )}
                            {item.smena && (
                              <div className="bg-black/5 rounded-xl p-2">
                                <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Shifts</p>
                                <p className="text-xs font-black text-gray-900">{item.smena}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className={cn(
                        "px-3 py-1 rounded-full",
                        activeTab === 'problems' ? "bg-red-500/10" : "bg-green-500/10"
                      )}>
                        <span className={cn(
                          "text-[9px] font-black uppercase tracking-widest",
                          activeTab === 'problems' ? "text-red-600" : "text-green-600"
                        )}>{activeTab === 'problems' ? (item.status || 'Open') : 'Active'}</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-20">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No results found</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 bg-black/5 border-t border-black/5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Records</p>
                  <p className="text-xl font-black text-gray-900">{filteredData.length}</p>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Live Sync</span>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationBar;
