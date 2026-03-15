import React from 'react';
import { Task } from '../services/api';
import { MapPin, Calendar, ChevronRight, ShieldCheck, Ruler, Activity } from 'lucide-react';
import { Card, Button } from './ui/Base';
import { useTranslation } from 'react-i18next';

interface TaskCardProps {
  task: Task;
  onVerify: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onVerify }) => {
  const { t } = useTranslation();
  return (
    <Card className="group overflow-hidden active:scale-[0.98] lg:hover:shadow-2xl transition-all duration-500 border-l-4 border-l-blue-600">
      <div className="p-6">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600/10 p-3 rounded-2xl">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md">{t('common.governmentProject')}</span>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('common.id')}: {task.id.slice(0, 8)}</span>
              </div>
              <h3 className="text-xl font-black text-gray-900 tracking-tight leading-none">{task.title}</h3>
            </div>
          </div>
          <div className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="w-3 h-3" />
            {t('common.inProgress')}
          </div>
        </div>

        <p className="text-sm text-gray-500 leading-relaxed mb-6">
          {task.description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-gray-50 p-4 rounded-[24px] border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Ruler className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('common.expectedScope')}</span>
            </div>
            <span className="text-lg font-black text-gray-900">{task.expected_length}m</span>
          </div>
          <div className="bg-gray-50 p-4 rounded-[24px] border border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('common.location')}</span>
            </div>
            <span className="text-lg font-black text-gray-900 truncate">{task.district}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Button 
            onClick={onVerify}
            className="w-full sm:flex-1 rounded-2xl py-4"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            {t('common.verifyCompletion')}
          </Button>
          <Button 
            variant="outline"
            className="w-full sm:w-auto rounded-2xl px-6"
          >
            {t('common.viewSpecs')}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;
