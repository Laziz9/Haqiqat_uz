import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, ThumbsUp, ArrowLeft, Clock, ShieldCheck, Share2, AlertTriangle, ChevronRight } from 'lucide-react';
import { Viewer, Entity, CameraFlyTo, PointGraphics, ImageryLayer } from 'resium';
import * as Cesium from 'cesium';

import api from '../services/api';
import { Problem } from '../services/api';
import { motion } from 'framer-motion';
import { Button, Card } from '../components/ui/Base';
import { useTranslation } from 'react-i18next';

const ProblemDetail: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [voted, setVoted] = useState(() => {
    const saved = localStorage.getItem(`voted_${id}`);
    return saved === 'true';
  });

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await api.get(`problems`);
        const found = res.data.find((p: Problem) => p.id === id);
        setProblem(found);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  const handleVote = async () => {
    if (voted) return;
    try {
      await api.post(`problems/${id}/vote`);
      setVoted(true);
      localStorage.setItem(`voted_${id}`, 'true');
      if (problem) setProblem({ ...problem, votes: problem.votes + 1 });
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
    </div>
  );

  if (!problem) return (
    <div className="h-screen flex flex-col items-center justify-center p-8 text-center">
      <AlertTriangle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-black text-gray-900 mb-2">{t('problemDetail.notFound')}</h2>
      <p className="text-gray-500 mb-8">{t('problemDetail.notFoundDesc')}</p>
      <Button onClick={() => navigate('/')}>{t('problemDetail.backToDashboard')}</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 backdrop-blur-sm pb-32">
      {/* Mobile Sticky Header */}
      <div className="lg:hidden sticky top-0 z-[1000] bg-white/40 backdrop-blur-2xl border-b border-white/30 p-4 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 bg-white/50 rounded-xl border border-white/30">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="font-black text-sm tracking-tight uppercase">{t('problemDetail.title')}</span>
        <button className="p-2 bg-white/50 rounded-xl border border-white/30">
          <Share2 className="w-5 h-5" />
        </button>
      </div>

      <div className="max-w-6xl mx-auto lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative h-[300px] lg:h-[500px] lg:rounded-[48px] overflow-hidden shadow-2xl border-4 border-white">
              <img 
                src={problem.image} 
                alt={problem.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 right-8">
                <div className="flex items-center gap-2 mb-3">
                  <div className="bg-blue-600 px-3 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-widest">
                    {problem.district}
                  </div>
                  <div className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-widest">
                    {t('problemDetail.reported')} 2h {t('common.ago')}
                  </div>
                </div>
                <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tighter leading-none">
                  {problem.title}
                </h1>
              </div>
            </div>

            <Card className="p-8 lg:p-12">
              <div className="flex items-center gap-6 mb-8 pb-8 border-b border-white/30">
                <div className="flex flex-col items-center">
                  <div className="bg-blue-600/10 backdrop-blur-md w-16 h-16 rounded-[24px] flex items-center justify-center mb-2 border border-blue-600/20">
                    <ThumbsUp className="w-8 h-8 text-blue-600" />
                  </div>
                  <span className="text-xl font-black text-gray-900">{problem.votes}</span>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('problemDetail.confirmations')}</span>
                </div>
                <div className="h-12 w-px bg-white/30" />
                <div className="flex-1">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{t('problemDetail.status')}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse" />
                    <span className="text-lg font-black text-gray-900">{t('problemDetail.awaitingAction')}</span>
                  </div>
                </div>
              </div>

              <div className="prose prose-blue max-w-none">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">{t('problemDetail.description')}</h3>
                <p className="text-lg text-gray-600 leading-relaxed font-medium">
                  {problem.description}
                </p>
              </div>

              <div className="mt-12 p-6 bg-white/30 backdrop-blur-md rounded-[32px] border border-white/50 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-white/50 p-3 rounded-2xl shadow-sm border border-white/50">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">{t('problemDetail.verifiedByCommunity')}</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{t('problemDetail.citizenAuditPassed')}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300" />
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="px-4 lg:px-0 space-y-6">
            <Card className="p-6 lg:p-8 sticky top-32">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6">{t('problemDetail.locationDetails')}</h3>
              <div className="h-[250px] rounded-[32px] overflow-hidden border border-white/50 mb-6 relative shadow-inner">
                <Viewer
                  full
                  animation={false}
                  timeline={false}
                  baseLayerPicker={false}
                  geocoder={false}
                  homeButton={false}
                  infoBox={false}
                  sceneModePicker={false}
                  selectionIndicator={false}
                  navigationHelpButton={false}
                  baseLayer={false}
                  className="w-full h-full"
                >
                  <ImageryLayer imageryProvider={new Cesium.OpenStreetMapImageryProvider({ url: 'https://a.tile.openstreetmap.org/' })} />
                  <CameraFlyTo
                    destination={Cesium.Cartesian3.fromDegrees(problem.longitude, problem.latitude, 1000)}
                    duration={0}
                  />
                  <Entity position={Cesium.Cartesian3.fromDegrees(problem.longitude, problem.latitude)}>
                    <PointGraphics
                      pixelSize={20}
                      color={Cesium.Color.fromCssColorString('#3B82F6')}
                      outlineColor={Cesium.Color.WHITE}
                      outlineWidth={4}
                    />
                  </Entity>
                </Viewer>
              </div>
              
              <div className="flex items-start gap-3 mb-8">
                <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                <div>
                  <p className="text-sm font-black text-gray-900">{problem.district}</p>
                  <p className="text-xs text-gray-400 font-medium">{t('problemDetail.coordinates')}: {problem.latitude.toFixed(4)}, {problem.longitude.toFixed(4)}</p>
                </div>
              </div>

              <Button 
                onClick={handleVote}
                disabled={voted}
                size="lg"
                className={`w-full rounded-[24px] py-6 shadow-xl transition-all ${
                  voted ? 'bg-emerald-500 shadow-emerald-500/20' : 'shadow-blue-600/20'
                }`}
              >
                {voted ? (
                  <>
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    {t('problemDetail.confirmed')}
                  </>
                ) : (
                  <>
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    {t('problemDetail.confirmProblem')}
                  </>
                )}
              </Button>
              <p className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">
                {voted ? t('problemDetail.thanksForVerifying') : t('problemDetail.helpPrioritize')}
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemDetail;
