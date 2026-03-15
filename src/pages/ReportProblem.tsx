import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Camera, CheckCircle2, Loader2, ArrowLeft, Info, Navigation, ChevronRight, ChevronLeft } from 'lucide-react';
import { Viewer, Entity, CameraFlyTo, PointGraphics, ScreenSpaceEventHandler, ScreenSpaceEvent, ImageryLayer } from 'resium';
import * as Cesium from 'cesium';

import { useAppContext } from '../context/AppContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, cn } from '../components/ui/Base';
import { useTranslation } from 'react-i18next';

const ReportProblem: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { refreshProblems } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState<[number, number] | null>(null);
  const [detecting, setDetecting] = useState(false);
  const viewerRef = useRef<any>(null);

  const [viewState, setViewState] = useState({
    longitude: 69.2401,
    latitude: 41.2995,
    zoom: 13
  });

  const [formData, setFormData] = useState(() => {
    const saved = localStorage.getItem('report_draft');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.location) setLocation(parsed.location);
        return parsed;
      } catch (e) {
        console.error('Failed to parse draft', e);
      }
    }
    return {
      title: '',
      description: '',
      district: 'Tashkent',
      imageUrl: 'https://picsum.photos/seed/problem/800/600'
    };
  });

  useEffect(() => {
    localStorage.setItem('report_draft', JSON.stringify({ ...formData, location }));
  }, [formData, location]);

  const detectLocation = () => {
    setDetecting(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLoc: [number, number] = [position.coords.longitude, position.coords.latitude];
          setLocation(newLoc);
          setViewState({
            longitude: position.coords.longitude,
            latitude: position.coords.latitude,
            zoom: 15
          });
          setDetecting(false);
        },
        () => setDetecting(false)
      );
    } else {
      setDetecting(false);
    }
  };

  const handleSubmit = async () => {
    if (!location) return alert(t('report.selectLocationError'));
    
    setLoading(true);
    try {
      await api.post('problems', {
        ...formData,
        latitude: location[1],
        longitude: location[0]
      });
      localStorage.removeItem('report_draft');
      setSuccess(true);
      refreshProblems();
      setTimeout(() => navigate('/'), 2000);
    } catch (error) {
      console.error(error);
      alert(t('report.submitError'));
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = useCallback((e: any) => {
    if (viewerRef.current && viewerRef.current.cesiumElement) {
      const viewer = viewerRef.current.cesiumElement;
      const cartesian = viewer.camera.pickEllipsoid(e.position, viewer.scene.globe.ellipsoid);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        setLocation([longitude, latitude]);
      }
    }
  }, []);

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">{t('report.successTitle')}</h2>
          <p className="text-gray-500 font-medium">{t('report.successDesc')}</p>
        </motion.div>
      </div>
    );
  }

  const steps = [
    { id: 1, title: t('report.location'), icon: MapPin },
    { id: 2, title: t('report.details'), icon: Info },
    { id: 3, title: t('report.photo'), icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-gray-50/50 backdrop-blur-sm pt-6 pb-32">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
            className="p-3 bg-white/40 backdrop-blur-md border border-white/30 rounded-2xl shadow-sm hover:bg-white/60 transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-900" />
          </button>
          <div className="flex gap-2">
            {steps.map((s) => (
              <div 
                key={s.id}
                className={cn(
                  "h-1.5 w-8 rounded-full transition-all duration-500",
                  step >= s.id ? "bg-blue-600" : "bg-gray-200"
                )}
              />
            ))}
          </div>
          <div className="w-11" /> {/* Spacer */}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{t('report.location')}</h1>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('report.tapToSetLocation')}</p>
              </div>

              <Card className="p-2 h-[450px] relative overflow-hidden">
                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <button 
                    type="button"
                    onClick={detectLocation}
                    className="bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-lg text-blue-600 hover:bg-white transition-all"
                  >
                    {detecting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className="w-5 h-5" />}
                  </button>
                </div>

                <Viewer
                  ref={viewerRef}
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
                  className="w-full h-full rounded-[28px]"
                >
                  <ImageryLayer imageryProvider={new Cesium.OpenStreetMapImageryProvider({ url: 'https://a.tile.openstreetmap.org/' })} />
                  <CameraFlyTo
                    destination={Cesium.Cartesian3.fromDegrees(viewState.longitude, viewState.latitude, 15000)}
                    duration={1}
                  />
                  <ScreenSpaceEventHandler>
                    <ScreenSpaceEvent action={handleMapClick} type={Cesium.ScreenSpaceEventType.LEFT_CLICK} />
                  </ScreenSpaceEventHandler>
                  
                  {location && (
                    <Entity position={Cesium.Cartesian3.fromDegrees(location[0], location[1])}>
                      <PointGraphics
                        pixelSize={20}
                        color={Cesium.Color.fromCssColorString('#3B82F6')}
                        outlineColor={Cesium.Color.WHITE}
                        outlineWidth={4}
                      />
                    </Entity>
                  )}
                </Viewer>

                {!location && (
                  <div className="absolute inset-0 bg-black/5 backdrop-blur-[2px] z-[5] flex items-center justify-center pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-[32px] shadow-2xl border border-white/50">
                      <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-xs font-black uppercase tracking-widest text-gray-900">{t('report.pinLocation')}</p>
                    </div>
                  </div>
                )}
              </Card>

              <Button 
                disabled={!location}
                onClick={() => setStep(2)}
                className="w-full py-6 rounded-[24px] shadow-xl shadow-blue-600/20"
              >
                {t('common.viewDetails')} <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{t('report.details')}</h1>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('report.subtitle')}</p>
              </div>

              <Card className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('report.problemTitle')}</label>
                  <input 
                    type="text" 
                    autoFocus
                    placeholder={t('report.titlePlaceholder')}
                    className="w-full bg-white/50 border border-white/30 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('report.description')}</label>
                  <textarea 
                    rows={4}
                    placeholder={t('report.descPlaceholder')}
                    className="w-full bg-white/50 border border-white/30 rounded-2xl py-4 px-5 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all resize-none"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">{t('report.district')}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Tashkent', 'Samarqand', 'Ishtixon', 'Urgut', 'Bukhara'].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setFormData({...formData, district: d})}
                        className={cn(
                          "py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                          formData.district === d 
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20" 
                            : "bg-white/50 border-white/30 text-gray-400 hover:border-gray-300"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
              </Card>

              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1 py-6 rounded-[24px]"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" /> {t('tasks.backToList')}
                </Button>
                <Button 
                  disabled={!formData.title || !formData.description}
                  onClick={() => setStep(3)}
                  className="flex-[2] py-6 rounded-[24px] shadow-xl shadow-blue-600/20"
                >
                  {t('report.photo')} <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">{t('report.photo')}</h1>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('report.uploadEvidence')}</p>
              </div>

              <Card className="p-8 text-center">
                <div className="relative aspect-video rounded-[32px] overflow-hidden bg-gray-100 mb-6 group cursor-pointer border-4 border-white shadow-xl">
                  <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" />
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl">
                      <Camera className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-3xl flex items-start gap-4 text-left">
                  <Info className="w-6 h-6 text-blue-600 shrink-0" />
                  <div>
                    <p className="text-xs font-black text-blue-900 uppercase tracking-widest mb-1">{t('report.uploadTitle')}</p>
                    <p className="text-[10px] text-blue-700 font-bold leading-relaxed">{t('report.locationHint')}</p>
                  </div>
                </div>
              </Card>

              <div className="flex gap-4">
                <Button 
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1 py-6 rounded-[24px]"
                >
                  <ChevronLeft className="w-5 h-5 mr-2" /> {t('report.details')}
                </Button>
                <Button 
                  isLoading={loading}
                  onClick={handleSubmit}
                  className="flex-[2] py-6 rounded-[24px] shadow-xl shadow-blue-600/20"
                >
                  {t('report.submitButton')} <CheckCircle2 className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ReportProblem;
