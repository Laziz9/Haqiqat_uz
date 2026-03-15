import React from 'react';
import { Problem } from '../services/api';
import { MapPin, ThumbsUp, ChevronRight, Clock } from 'lucide-react';
import { Card, cn } from './ui/Base';
import { useTranslation } from 'react-i18next';

interface ProblemCardProps {
  problem: Problem;
  onClick: () => void;
}

const ProblemCard: React.FC<ProblemCardProps> = ({ problem, onClick }) => {
  const { t } = useTranslation();
  const getPriorityColor = (votes: number) => {
    if (votes > 20) return 'bg-red-500';
    if (votes > 10) return 'bg-orange-500';
    return 'bg-yellow-500';
  };

  const getPriorityLabel = (votes: number) => {
    if (votes > 20) return t('common.critical');
    if (votes > 10) return t('common.urgent');
    return t('common.active');
  };

  return (
    <Card 
      onClick={onClick}
      className="group overflow-hidden cursor-pointer active:scale-[0.98] lg:hover:scale-[1.02] lg:hover:shadow-xl transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row h-full">
        {/* Image Section */}
        <div className="relative w-full sm:w-32 lg:w-40 h-40 sm:h-auto overflow-hidden">
          <img 
            src={problem.image} 
            alt={problem.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent sm:hidden" />
          <div className={`absolute top-3 left-3 px-2 py-1 rounded-lg text-[8px] font-black text-white uppercase tracking-widest ${getPriorityColor(problem.votes)} shadow-lg`}>
            {getPriorityLabel(problem.votes)}
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex items-center gap-1 text-blue-600">
                <MapPin className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">{problem.district}</span>
              </div>
              <div className="w-1 h-1 bg-gray-300 rounded-full" />
              <div className="flex items-center gap-1 text-gray-400">
                <Clock className="w-3 h-3" />
                <span className="text-[10px] font-black uppercase tracking-widest">2h {t('common.ago')}</span>
              </div>
            </div>
            
            <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight mb-2 group-hover:text-blue-600 transition-colors">
              {problem.title}
            </h3>
            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4">
              {problem.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="bg-blue-50 p-1.5 rounded-lg">
                  <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
                </div>
                <span className="text-sm font-black text-gray-900">{problem.votes}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-1 text-blue-600 font-black text-[10px] uppercase tracking-widest">
              {t('common.viewDetails')}
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProblemCard;
