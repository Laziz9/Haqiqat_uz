/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import NotificationBar from './components/NotificationBar';
import SearchBar from './components/SearchBar';
import Home from './pages/Home';
import Landing from './pages/Landing';
import ReportProblem from './pages/ReportProblem';
import ProblemDetail from './pages/ProblemDetail';
import SchoolDetail from './pages/SchoolDetail';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';

import { cn } from './components/ui/Base';

const AppContent = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const isApp = location.pathname.startsWith('/app') || location.pathname === '/app';
  const isHome = location.pathname === '/app';

  if (isLanding) {
    return <Landing />;
  }

  return (
    <div className="h-screen overflow-hidden bg-gray-50 font-sans text-gray-900">
      {isHome && (
        <div className="lg:hidden fixed top-4 left-4 right-4 z-[1000]">
          <SearchBar />
        </div>
      )}
      <Navbar />
      <NotificationBar />
      <main className="w-full h-full relative">
        {/* Keep Home mounted to prevent map re-loading */}
        <div className={cn("w-full h-full absolute inset-0 transition-opacity duration-300", !isHome ? "opacity-0 pointer-events-none" : "opacity-100")}>
          <Home />
        </div>
        
        <div className={cn("w-full h-full overflow-y-auto", isHome && "hidden")}>
          <Routes>
            <Route path="/app" element={<div />} />
            <Route path="/report" element={<ReportProblem />} />
            <Route path="/problem/:id" element={<ProblemDetail />} />
            <Route path="/school/:id" element={<SchoolDetail />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
}



