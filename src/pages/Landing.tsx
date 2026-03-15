import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shield, Globe, Zap } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-blue-500/30 overflow-hidden font-sans">
      {/* Premium Background Architecture */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(30,58,138,0.15),transparent_70%)]" />
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] bg-blue-600/10 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-[20%] -left-[10%] w-[70%] h-[70%] bg-indigo-600/10 rounded-full blur-[120px]" 
        />
      </div>

      {/* Top Navigation Bar (Minimalist) */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-8 md:px-12 flex justify-between items-center">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">Haqiqat Uz</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="hidden md:flex items-center gap-8"
        >
          {['Platforma', 'Maqsad', 'Hamkorlik'].map((item) => (
            <span key={item} className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 hover:text-white cursor-pointer transition-colors">
              {item}
            </span>
          ))}
        </motion.div>
      </nav>

      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6">
        <div className="max-w-7xl w-full grid lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left Column: Content */}
          <div className="flex flex-col items-start text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-blue-400">Fuqarolik Nazorati Platformasi</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl lg:text-[110px] font-black leading-[0.85] tracking-tighter mb-8 uppercase">
                Shaffof <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-blue-600 to-indigo-600">Kelajak</span> <br />
                Sari.
              </h1>
              
              <p className="text-lg md:text-xl text-white/40 font-medium max-w-lg mb-12 leading-relaxed tracking-tight">
                Davlat loyihalari va shahar infratuzilmasi ustidan real vaqt rejimida fuqarolik nazoratini o'rnating. Haqiqat — sizning qo'lingizda.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate('/app')}
                  className="group relative flex items-center justify-center gap-4 bg-white text-black px-10 py-6 rounded-2xl text-lg font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-2xl shadow-white/5"
                >
                  Platformaga Kirish
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </motion.button>
                
                <div className="flex items-center gap-4 px-6 py-4 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-[#050505] bg-gray-800 overflow-hidden">
                        <img src={`https://picsum.photos/seed/user${i}/64/64`} alt="User" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                  <div className="h-6 w-px bg-white/10" />
                  <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">12K+ Faol Fuqarolar</span>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Visual Elements */}
          <div className="hidden lg:block relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateY: 20 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10"
            >
              {/* Main Visual Card */}
              <div className="relative aspect-[4/5] w-full max-w-md ml-auto rounded-[48px] overflow-hidden border border-white/10 bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm group">
                <img 
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000" 
                  className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000"
                  alt="City Architecture"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
                
                <div className="absolute bottom-12 left-12 right-12">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-blue-600/20 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-blue-500/30">
                      <Globe className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Global Nazorat</p>
                      <p className="text-xl font-black">Butun O'zbekiston</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-12 -left-12 p-8 bg-white/10 backdrop-blur-3xl rounded-[32px] border border-white/20 shadow-2xl"
              >
                <Zap className="w-8 h-8 text-blue-400 mb-4" />
                <p className="text-3xl font-black">842</p>
                <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Hal etilgan muammolar</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-12 -right-12 p-8 bg-blue-600 backdrop-blur-3xl rounded-[32px] shadow-2xl shadow-blue-600/20"
              >
                <p className="text-3xl font-black">2.5K</p>
                <p className="text-[9px] font-black text-white/80 uppercase tracking-widest">Ijtimoiy ob'ektlar</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* Footer Micro-details */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 px-6 py-12 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 pointer-events-none">
        <div className="flex items-center gap-8">
          <span className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">© 2026 Haqiqat Uz</span>
          <div className="hidden md:block h-px w-12 bg-white/10" />
          <span className="hidden md:block text-[9px] font-black text-white/20 uppercase tracking-[0.4em]">Toshkent, O'zbekiston</span>
        </div>
        
        <div className="flex gap-8">
          {['Instagram', 'Telegram', 'Twitter'].map(social => (
            <span key={social} className="text-[9px] font-black text-white/20 uppercase tracking-[0.4em] hover:text-white cursor-pointer transition-colors pointer-events-auto">
              {social}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
};

export default Landing;
