import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Viewer, Entity, CameraFlyTo, PointGraphics, BillboardGraphics, ScreenSpaceEventHandler, ScreenSpaceEvent, Scene, Globe, ImageryLayer, Cesium3DTileset, Primitive, CustomDataSource } from 'resium';
import * as Cesium from 'cesium';
import { Problem } from '../services/api';
import { useGeoData } from '../hooks/useGeoData';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, ChevronRight, TrendingUp, AlertCircle, CheckCircle2, School, Baby, Hospital, Layers, ShieldCheck, Mountain, Building2, Globe as GlobeIcon, Locate } from 'lucide-react';
import { Card, cn } from './ui/Base';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface MapComponentProps {
  problems: Problem[];
}

const MapComponent: React.FC<MapComponentProps> = ({ problems }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const viewerRef = useRef<any>(null);
  
  const { schools, kindergartens, hospitals, isLoadingGeo } = useGeoData();
  const { tasks, searchQuery } = useAppContext();
  
  // Layer Toggles
  const [showProblems, setShowProblems] = useState(true);
  const [showTasks, setShowTasks] = useState(true);
  const [showSchools, setShowSchools] = useState(true);
  const [showKindergartens, setShowKindergartens] = useState(true);
  const [showHospitals, setShowHospitals] = useState(true);
  const [showLayers, setShowLayers] = useState(false);

  // Map Features Toggles
  const [mapStyle, setMapStyle] = useState<'streets' | 'satellite'>('satellite');
  const [showTerrain, setShowTerrain] = useState(true);
  const [show3DBuildings, setShow3DBuildings] = useState(true);

  // Popup State
  const [selectedPoint, setSelectedPoint] = useState<any | null>(null);
  
  // User Location State
  const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);

  // Locate Me Handler
  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          
          // Fly to location
          if (viewerRef.current && viewerRef.current.cesiumElement) {
            const viewer = viewerRef.current.cesiumElement;
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, 2000),
              orientation: {
                heading: Cesium.Math.toRadians(0),
                pitch: Cesium.Math.toRadians(-45),
                roll: 0
              }
            });
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          // Using a simple alert as per instructions, but in a real app, use a custom UI
          alert("Could not get your location. Please enable location permissions.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  // Prepare points
  const points = useMemo(() => {
    const allPoints: any[] = [];
    const now = Cesium.JulianDate.now();

    if (showProblems) {
      problems.filter(p => p.latitude && p.longitude).forEach(p => {
        allPoints.push({ id: p.id, type: 'problem', data: p, lat: p.latitude, lng: p.longitude, createdAt: now });
      });
    }

    if (showTasks) {
      tasks.filter(t => t.latitude && t.longitude).forEach(t => {
        allPoints.push({ id: t.id, type: 'task', data: t, lat: t.latitude, lng: t.longitude, createdAt: now });
      });
    }

    if (showSchools) {
      schools.filter(s => s.lat && s.long).forEach(s => {
        allPoints.push({ id: `school-${s.id}`, type: 'school', data: s, lat: parseFloat(s.lat), lng: parseFloat(s.long), createdAt: now });
      });
    }

    if (showKindergartens) {
      kindergartens.filter(k => k.lat && k.long).forEach(k => {
        allPoints.push({ id: `kg-${k.id}`, type: 'kindergarten', data: k, lat: parseFloat(k.lat), lng: parseFloat(k.long), createdAt: now });
      });
    }

    if (showHospitals) {
      hospitals.filter(h => h.lat && h.long).forEach(h => {
        allPoints.push({ id: `hosp-${h.id}`, type: 'hospital', data: h, lat: parseFloat(h.lat), lng: parseFloat(h.long), createdAt: now });
      });
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return allPoints.filter(p => {
        const title = p.data?.title || p.data?.obekt_nomi || p.data?.nomi || '';
        const desc = p.data?.description || p.data?.tuman || '';
        return title.toLowerCase().includes(query) || desc.toLowerCase().includes(query);
      });
    }

    return allPoints;
  }, [problems, tasks, schools, kindergartens, hospitals, showProblems, showTasks, showSchools, showKindergartens, showHospitals, searchQuery]);

  const getMarkerColor = (type: string, data?: any) => {
    switch (type) {
      case 'problem':
        if (data?.votes > 20) return Cesium.Color.fromCssColorString('#EF4444'); // Red
        if (data?.votes > 10) return Cesium.Color.fromCssColorString('#F97316'); // Orange
        return Cesium.Color.fromCssColorString('#EAB308'); // Yellow
      case 'task': return Cesium.Color.fromCssColorString('#10B981'); // Green
      case 'school': return Cesium.Color.fromCssColorString('#3B82F6'); // Blue
      case 'kindergarten': return Cesium.Color.fromCssColorString('#A855F7'); // Purple
      case 'hospital': return Cesium.Color.fromCssColorString('#EF4444'); // Red
      default: return Cesium.Color.fromCssColorString('#6B7280'); // Gray
    }
  };

  const getIconUrl = (type: string) => {
    let color = '#3B82F6';
    let path = '';
    
    if (type === 'school') {
      color = '#3B82F6';
      path = '<path d="m12 3 10 4.5V19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7.5L12 3Z"/><polyline points="12 9 12 21"/><polyline points="7 12 17 12"/>';
    } else if (type === 'kindergarten') {
      color = '#A855F7';
      path = '<path d="M9 12h.01"/><path d="M15 12h.01"/><path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5"/><path d="M19 6.3a9 9 0 0 1 1.8 3.9 2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 5 6.3"/><path d="M12 2.1a7.3 7.3 0 0 1 3 2"/><path d="M12 2.1a7.3 7.3 0 0 0-3 2"/>';
    } else if (type === 'hospital') {
      color = '#EF4444';
      path = '<path d="M12 6v12"/><path d="M6 12h12"/><rect width="20" height="20" x="2" y="2" rx="5"/>';
    } else {
      return null;
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const handleEntityClick = (e: any) => {
    if (viewerRef.current && viewerRef.current.cesiumElement) {
      const viewer = viewerRef.current.cesiumElement;
      const pickedObject = viewer.scene.pick(e.position);
      if (Cesium.defined(pickedObject) && pickedObject.id) {
        const entity = pickedObject.id;
        if (entity.properties) {
          const properties = entity.properties.getValue(Cesium.JulianDate.now());
          setSelectedPoint(properties);
        }
      } else {
        setSelectedPoint(null);
      }
    }
  };

  const dataSourceRef = useRef<any>(null);
  const clusterImageCache = useRef<Record<number, HTMLCanvasElement>>({});

  const getClusterImage = (count: number) => {
    if (clusterImageCache.current[count]) {
      return clusterImageCache.current[count];
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 44;
    canvas.height = 44;
    const context = canvas.getContext('2d');
    if (context) {
      context.fillStyle = '#3B82F6';
      context.beginPath();
      context.arc(22, 22, 20, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = '#FFFFFF';
      context.lineWidth = 3;
      context.stroke();
    }
    
    clusterImageCache.current[count] = canvas;
    return canvas;
  };

  useEffect(() => {
    if (searchQuery.trim() && points.length > 0 && viewerRef.current?.cesiumElement) {
      const viewer = viewerRef.current.cesiumElement;
      const firstPoint = points[0];
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(firstPoint.lng, firstPoint.lat, 1500),
        duration: 1.5
      });
      
      // Select the point
      setSelectedPoint(firstPoint);
    }
  }, [searchQuery]);

  useEffect(() => {
    let removeListener: (() => void) | undefined;
    let timeoutId: number;

    const attachListener = () => {
      if (dataSourceRef.current && dataSourceRef.current.cesiumElement) {
        const dataSource = dataSourceRef.current.cesiumElement;
        removeListener = dataSource.clustering.clusterEvent.addEventListener((clusteredEntities: any[], cluster: any) => {
          cluster.label.show = true;
          cluster.label.text = clusteredEntities.length.toLocaleString();
          cluster.label.font = 'bold 14px Inter, sans-serif';
          cluster.label.fillColor = Cesium.Color.WHITE;
          cluster.label.style = Cesium.LabelStyle.FILL;
          cluster.label.verticalOrigin = Cesium.VerticalOrigin.CENTER;
          cluster.label.horizontalOrigin = Cesium.HorizontalOrigin.CENTER;
          
          cluster.billboard.show = true;
          cluster.billboard.id = cluster.label.id;
          cluster.billboard.verticalOrigin = Cesium.VerticalOrigin.CENTER;
          cluster.billboard.image = getClusterImage(clusteredEntities.length);
        });
      } else {
        timeoutId = window.setTimeout(attachListener, 100);
      }
    };

    attachListener();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (removeListener) removeListener();
    };
  }, [points]);

  // Imagery Providers
  const [satelliteImagery, setSatelliteImagery] = useState<Cesium.ArcGisMapServerImageryProvider | undefined>(undefined);

  useEffect(() => {
    Cesium.ArcGisMapServerImageryProvider.fromUrl(
      'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer'
    ).then(setSatelliteImagery);
  }, []);

  const streetImagery = useMemo(() => {
    return new Cesium.OpenStreetMapImageryProvider({
      url: 'https://a.tile.openstreetmap.org/'
    });
  }, []);

  // Terrain Provider
  const [terrain, setTerrain] = useState<Cesium.TerrainProvider | undefined>(undefined);

  useEffect(() => {
    if (showTerrain) {
      Cesium.createWorldTerrainAsync().then(setTerrain).catch(console.error);
    } else {
      setTerrain(undefined);
    }
  }, [showTerrain]);

  const [buildings, setBuildings] = useState<Cesium.Cesium3DTileset | null>(null);

  useEffect(() => {
    if (show3DBuildings) {
      Cesium.createOsmBuildingsAsync().then(tileset => {
        setBuildings(tileset);
      }).catch(console.error);
    } else {
      setBuildings(null);
    }
  }, [show3DBuildings]);

  return (
    <div className="w-full h-full relative bg-gray-100 overflow-hidden">
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
        terrainProvider={terrain}
        className="w-full h-full"
      >
        <ImageryLayer imageryProvider={mapStyle === 'satellite' ? (satelliteImagery || streetImagery) : streetImagery} />
        
        <CameraFlyTo
          destination={Cesium.Cartesian3.fromDegrees(69.2401, 41.2995, 2000)}
          orientation={{
            heading: Cesium.Math.toRadians(0),
            pitch: Cesium.Math.toRadians(-45),
            roll: 0
          }}
          duration={0}
        />
        
        {show3DBuildings && buildings && (
          <Primitive primitive={buildings} />
        )}

        {userLocation && (
          <Entity
            position={Cesium.Cartesian3.fromDegrees(userLocation.lng, userLocation.lat)}
            point={{ pixelSize: 20, color: Cesium.Color.BLUE, outlineColor: Cesium.Color.WHITE, outlineWidth: 3 }}
          />
        )}

        <ScreenSpaceEventHandler>
          <ScreenSpaceEvent action={handleEntityClick} type={Cesium.ScreenSpaceEventType.LEFT_CLICK} />
        </ScreenSpaceEventHandler>

        <CustomDataSource
          ref={dataSourceRef}
          name="markers"
          clustering={new Cesium.EntityCluster({
            enabled: true,
            pixelRange: 40,
            minimumClusterSize: 2,
            clusterBillboards: true,
            clusterLabels: true,
            clusterPoints: true,
          })}
        >
          {points.map(point => (
            <Entity
              key={point.id}
              position={Cesium.Cartesian3.fromDegrees(point.lng, point.lat)}
              properties={point}
            >
              {['school', 'kindergarten', 'hospital'].includes(point.type) ? (
                <BillboardGraphics
                  image={getIconUrl(point.type)}
                  width={32}
                  height={32}
                  verticalOrigin={Cesium.VerticalOrigin.BOTTOM}
                  disableDepthTestDistance={Number.POSITIVE_INFINITY}
                />
              ) : (
                <PointGraphics
                  pixelSize={new Cesium.CallbackProperty((time) => {
                    const diff = Cesium.JulianDate.secondsDifference(time, point.createdAt);
                    const duration = 0.5;
                    if (diff >= duration) return 16;
                    
                    // Elastic ease out
                    const progress = Math.max(0, diff / duration);
                    const c4 = (2 * Math.PI) / 3;
                    const ease = progress === 0 ? 0 : progress === 1 ? 1 : Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * c4) + 1;
                    
                    return Math.max(0, 16 * ease);
                  }, false)}
                  color={getMarkerColor(point.type, point.data)}
                  outlineColor={Cesium.Color.WHITE}
                  outlineWidth={3}
                />
              )}
            </Entity>
          ))}
        </CustomDataSource>
      </Viewer>

      {/* Popup Overlay - Moved to left to avoid sidebar overlap */}
      <AnimatePresence>
        {selectedPoint && (
          <motion.div
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            className="absolute top-32 left-8 z-[100] w-80"
          >
            <Card className="p-4 shadow-2xl border-white/40 bg-white/95 backdrop-blur-xl relative">
              <button 
                onClick={() => setSelectedPoint(null)}
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200"
              >
                &times;
              </button>
              
              {selectedPoint.type === 'problem' && (
                <>
                  <div className="relative h-36 rounded-xl overflow-hidden mb-3">
                    <img src={selectedPoint.data.image} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-lg">
                      {selectedPoint.data.district}
                    </div>
                  </div>
                  <h3 className="font-black text-gray-900 text-base mb-1 leading-tight">{selectedPoint.data.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4 leading-relaxed">{selectedPoint.data.description}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1.5">
                      <ThumbsUp className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-black text-gray-900">{selectedPoint.data.votes}</span>
                    </div>
                    <button 
                      onClick={() => navigate(`/problem/${selectedPoint.data.id}`)}
                      className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-100 transition-colors"
                    >
                      {t('common.viewDetails')} <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </>
              )}

              {selectedPoint.type === 'task' && (
                <div className="p-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="bg-emerald-100 p-2 rounded-xl">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Gov Task</span>
                      <h3 className="font-black text-gray-900 text-sm leading-tight">{selectedPoint.data.title}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-4">{selectedPoint.data.description}</p>
                  <button 
                    onClick={() => navigate('/tasks')}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors"
                  >
                    Verify Task <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}

              {['school', 'kindergarten', 'hospital'].includes(selectedPoint.type) && (
                <div className="p-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={cn(
                      "p-2 rounded-xl",
                      selectedPoint.type === 'school' ? "bg-blue-100" : 
                      selectedPoint.type === 'kindergarten' ? "bg-purple-100" : "bg-red-100"
                    )}>
                      {selectedPoint.type === 'school' && <School className="w-5 h-5 text-blue-600" />}
                      {selectedPoint.type === 'kindergarten' && <Baby className="w-5 h-5 text-purple-600" />}
                      {selectedPoint.type === 'hospital' && <Hospital className="w-5 h-5 text-red-600" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        {selectedPoint.type === 'school' ? t('home.schools') : 
                         selectedPoint.type === 'kindergarten' ? t('home.kindergartens') : t('home.healthcare')}
                      </span>
                      <h3 className="font-black text-gray-900 text-sm leading-tight">{selectedPoint.data.nomi || selectedPoint.data.obekt_nomi}</h3>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                      <p className="text-[11px] text-gray-600 font-medium">
                        <span className="text-gray-400 uppercase text-[9px] font-bold block">District</span>
                        {selectedPoint.data.tuman}
                      </p>
                    </div>
                    {selectedPoint.data.manzil && (
                      <div className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                        <p className="text-[11px] text-gray-600 font-medium">
                          <span className="text-gray-400 uppercase text-[9px] font-bold block">Address</span>
                          {selectedPoint.data.manzil}
                        </p>
                      </div>
                    )}
                    {selectedPoint.data.umumiy_uquvchi && (
                      <div className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full bg-gray-300 mt-1.5 shrink-0" />
                        <p className="text-[11px] text-gray-600 font-medium">
                          <span className="text-gray-400 uppercase text-[9px] font-bold block">Capacity</span>
                          {selectedPoint.data.umumiy_uquvchi} students
                        </p>
                      </div>
                    )}
                  </div>

                  <button 
                    onClick={() => navigate(selectedPoint.type === 'school' ? `/school/${selectedPoint.data.id}` : '#')}
                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-colors"
                  >
                    {t('common.viewDetails')} <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Controls - Mobile & Desktop */}
      <div className="absolute bottom-24 left-6 z-[10] flex flex-col gap-3">
        {isLoadingGeo && (
          <div className="glass-morphism p-3 rounded-2xl flex items-center gap-2 animate-pulse">
            <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Loading...</span>
          </div>
        )}
        
        {/* Locate Me Button */}
        <button 
          onClick={handleLocateMe}
          className="w-12 h-12 rounded-full glass-morphism flex items-center justify-center text-gray-900 shadow-xl active:scale-95 transition-all bg-white/10 border border-white/20 hover:bg-white/20"
          title="Locate Me"
        >
          <Locate className="w-6 h-6" />
        </button>

        {/* Main Control FAB */}
        <button 
          onClick={() => setShowLayers(!showLayers)}
          className={cn(
            "w-12 h-12 rounded-full glass-morphism flex items-center justify-center text-gray-900 shadow-xl active:scale-95 transition-all border border-white/20",
            showLayers ? "bg-blue-600 text-white" : "bg-white/10 hover:bg-white/20"
          )}
          title="Layers"
        >
          <Layers className="w-6 h-6" />
        </button>
        
        <AnimatePresence>
          {showLayers && (
            <motion.div 
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              className="glass-morphism p-4 rounded-3xl w-72 max-h-[50vh] overflow-y-auto shadow-2xl border border-white/20"
            >
              {/* Map Style */}
              <div className="mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Map Style</span>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setMapStyle('streets')} 
                    className={cn("px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all", mapStyle === 'streets' ? "bg-gray-900 text-white shadow-md" : "bg-white/50 text-gray-600 hover:bg-white")}
                  >
                    Map
                  </button>
                  <button 
                    onClick={() => setMapStyle('satellite')} 
                    className={cn("px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all", mapStyle === 'satellite' ? "bg-gray-900 text-white shadow-md" : "bg-white/50 text-gray-600 hover:bg-white")}
                  >
                    Satellite
                  </button>
                </div>
              </div>

              {/* 3D Features */}
              <div className="mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">3D Features</span>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => setShowTerrain(!showTerrain)} 
                    className={cn("px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", showTerrain ? "bg-emerald-500 text-white shadow-sm" : "bg-white/50 text-gray-600 hover:bg-white")}
                  >
                    <Mountain className="w-4 h-4" /> Terrain
                  </button>
                  <button 
                    onClick={() => setShow3DBuildings(!show3DBuildings)} 
                    className={cn("px-4 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2", show3DBuildings ? "bg-purple-500 text-white shadow-sm" : "bg-white/50 text-gray-600 hover:bg-white")}
                  >
                    <Building2 className="w-4 h-4" /> 3D
                  </button>
                </div>
              </div>

              {/* Map Layers */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Map Layers</span>
                <div className="flex flex-col gap-1">
                  <button onClick={() => setShowProblems(!showProblems)} className={cn("flex items-center gap-3 p-3 rounded-2xl transition-all", showProblems ? "bg-red-50 text-red-600" : "text-gray-600 hover:bg-white/50")}>
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Problems</span>
                  </button>
                  <button onClick={() => setShowTasks(!showTasks)} className={cn("flex items-center gap-3 p-3 rounded-2xl transition-all", showTasks ? "bg-emerald-50 text-emerald-600" : "text-gray-600 hover:bg-white/50")}>
                    <ShieldCheck className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">Gov Tasks</span>
                  </button>
                  <button onClick={() => setShowSchools(!showSchools)} className={cn("flex items-center gap-3 p-3 rounded-2xl transition-all", showSchools ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-white/50")}>
                    <School className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">{t('home.schools')}</span>
                  </button>
                  <button onClick={() => setShowKindergartens(!showKindergartens)} className={cn("flex items-center gap-3 p-3 rounded-2xl transition-all", showKindergartens ? "bg-purple-50 text-purple-600" : "text-gray-600 hover:bg-white/50")}>
                    <Baby className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">{t('home.kindergartens')}</span>
                  </button>
                  <button onClick={() => setShowHospitals(!showHospitals)} className={cn("flex items-center gap-3 p-3 rounded-2xl transition-all", showHospitals ? "bg-orange-50 text-orange-600" : "text-gray-600 hover:bg-white/50")}>
                    <Hospital className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-widest">{t('home.healthcare')}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default MapComponent;
