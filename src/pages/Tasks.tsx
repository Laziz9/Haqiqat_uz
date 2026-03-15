import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import TaskCard from '../components/TaskCard';
import StatsChart from '../components/StatsChart';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, XCircle, Loader2, BarChart3, ArrowLeft, ShieldCheck, Ruler, Activity, Info, MapPin } from 'lucide-react';
import { Button, Card, cn } from '../components/ui/Base';
import { useTranslation } from 'react-i18next';

const Tasks: React.FC = () => {
  const { t } = useTranslation();
  const { tasks, userDistrict, refreshTasks } = useAppContext();
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verificationData, setVerificationData] = useState({
    status: 'done',
    metersCompleted: 0,
    comment: ''
  });

  useEffect(() => {
    if (selectedTask) {
      fetchStats(selectedTask.id);
    }
  }, [selectedTask]);

  const fetchStats = async (taskId: string) => {
    setLoadingStats(true);
    try {
      const res = await api.get(`tasks/${taskId}/stats`);
      setStats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      await api.post(`tasks/${selectedTask.id}/verify`, verificationData);
      refreshTasks();
      fetchStats(selectedTask.id);
      alert(t('report.success'));
      setSelectedTask(null);
    } catch (error) {
      console.error(error);
      alert(t('report.error'));
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 backdrop-blur-sm pb-32">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="flex flex-col lg:flex-row items-start lg:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-600/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl lg:text-5xl font-black text-gray-900 tracking-tighter leading-none uppercase">{t('tasks.title')}</h1>
            </div>
            <p className="text-lg text-gray-500 font-medium max-w-2xl">
              {t('tasks.subtitle').split('in')[0]} in <span className="text-blue-600 font-black">{userDistrict}</span>. 
              {t('tasks.subtitle').split('.')[1] || ''}
            </p>
          </div>
          
          <Card className="flex items-center gap-4 p-2">
            <div className="px-6 py-3 text-center border-r border-white/30">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('tasks.activeProjects')}</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{tasks.length}</p>
            </div>
            <div className="px-6 py-3 text-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('tasks.auditScore')}</p>
              <p className="text-2xl font-black text-emerald-600 leading-none">94%</p>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">{t('tasks.projectList')}</h2>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('tasks.district')}: {userDistrict}</span>
            </div>
            {tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onVerify={() => setSelectedTask(task)} 
              />
            ))}
            {tasks.length === 0 && (
              <Card className="p-12 text-center">
                <div className="bg-white/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity className="w-10 h-10 text-gray-200" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">{t('tasks.noProjects')}</h3>
                <p className="text-gray-500">{t('tasks.noProjectsDesc')}</p>
              </Card>
            )}
          </div>

          <div className="space-y-8">
            <AnimatePresence mode="wait">
              {selectedTask ? (
                <motion.div
                  key="audit-panel"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Card className="p-8 lg:p-10 sticky top-32 border-2 border-blue-600/20 shadow-2xl shadow-blue-600/5">
                    <div className="flex items-center justify-between mb-8">
                      <button 
                        onClick={() => setSelectedTask(null)}
                        className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        {t('tasks.backToList')}
                      </button>
                      <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                        {t('tasks.auditMode')}
                      </div>
                    </div>

                    <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-4">{selectedTask.title}</h2>
                    
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-white/50 p-4 rounded-2xl border border-white/30">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('tasks.expected')}</p>
                        <p className="text-xl font-black text-gray-900">{selectedTask.expected_length}m</p>
                      </div>
                      <div className="bg-white/50 p-4 rounded-2xl border border-white/30">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('tasks.avgVerified')}</p>
                        <p className="text-xl font-black text-blue-600">
                          {stats ? Math.round(stats.average_meters) : 0}m
                        </p>
                      </div>
                    </div>

                    {loadingStats ? (
                      <div className="h-48 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                      </div>
                    ) : stats && (
                      <div className="mb-10">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">{t('tasks.communityStats')}</p>
                        <StatsChart stats={stats} />
                      </div>
                    )}

                    <div className="space-y-6 pt-8 border-t border-white/30">
                      <h3 className="text-lg font-black text-gray-900 tracking-tight">{t('tasks.yourVerification')}</h3>
                      
                      <div className="grid grid-cols-3 gap-3">
                        {['done', 'partial', 'not_done'].map((status) => (
                          <button
                            key={status}
                            onClick={() => setVerificationData({...verificationData, status})}
                            className={cn(
                              "flex flex-col items-center gap-3 p-4 rounded-[24px] border-2 transition-all",
                              verificationData.status === status 
                                ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/30" 
                                : "bg-white/50 border-white/30 text-gray-400 hover:border-gray-200"
                            )}
                          >
                            {status === 'done' && <CheckCircle2 className="w-6 h-6" />}
                            {status === 'partial' && <AlertCircle className="w-6 h-6" />}
                            {status === 'not_done' && <XCircle className="w-6 h-6" />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{t(`tasks.${status}`)}</span>
                          </button>
                        ))}
                      </div>

                      {verificationData.status === 'partial' && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                        >
                          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('tasks.metersCompleted')}</label>
                          <div className="relative">
                            <input 
                              type="number" 
                              className="w-full bg-white/50 border border-white/30 rounded-2xl py-4 px-5 text-lg font-black focus:outline-none focus:ring-4 focus:ring-blue-500/5"
                              value={verificationData.metersCompleted}
                              onChange={e => setVerificationData({...verificationData, metersCompleted: Number(e.target.value)})}
                            />
                            <span className="absolute right-5 top-1/2 -translate-y-1/2 font-black text-gray-400 uppercase tracking-widest">{t('common.meters')}</span>
                          </div>
                        </motion.div>
                      )}

                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('tasks.comments')}</label>
                        <textarea 
                          rows={3}
                          placeholder="Provide details about the work quality..."
                          className="w-full bg-white/50 border border-white/30 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 resize-none"
                          value={verificationData.comment}
                          onChange={e => setVerificationData({...verificationData, comment: e.target.value})}
                        />
                      </div>

                      <Button 
                        size="lg"
                        isLoading={verifying}
                        onClick={handleVerify}
                        className="w-full rounded-[24px] py-6 shadow-xl shadow-blue-600/30"
                      >
                        {t('tasks.submitAudit')}
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hidden lg:block h-full"
                >
                  <div className="sticky top-32 h-[600px] border-2 border-dashed border-white/50 rounded-[48px] flex flex-col items-center justify-center p-12 text-center">
                    <div className="bg-white/40 backdrop-blur-md p-8 rounded-full mb-6">
                      <BarChart3 className="w-16 h-16 text-gray-300" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">{t('tasks.selectProject')}</h3>
                    <p className="text-gray-400 font-medium max-w-xs">
                      {t('tasks.selectProjectDesc')}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tasks;
