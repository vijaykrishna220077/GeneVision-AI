import React, { useState, useEffect } from 'react';
import { ResearchProvider, useResearch } from './components/ResearchContext';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import DashboardOverview from './components/DashboardOverview';
import DatasetUploadTab from './components/DatasetUploadTab';
import AIPredictionsTab from './components/AIPredictionsTab';
import QuantumComputingTab from './components/QuantumComputingTab';
import ExplainabilityTab from './components/ExplainabilityTab';
import BiologicalPathwaysTab from './components/BiologicalPathwaysTab';
import GeneExplorerTab from './components/GeneExplorerTab';
import ResearchWorkbenchTab from './components/ResearchWorkbenchTab';
import ResearchCopilotTab from './components/ResearchCopilotTab';
import ApiExplorerTab from './components/ApiExplorerTab';
import WelcomeTour from './components/WelcomeTour';
import GlobalSearchBar from './components/GlobalSearchBar';
import { Dna, HelpCircle, Activity, Sun, Moon } from 'lucide-react';

function DashboardContent() {
  const { user, theme, setTheme, supabaseStatus } = useResearch();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Automatically trigger the onboarding tour for first-time users
  useEffect(() => {
    if (user) {
      const completed = localStorage.getItem('gv_tour_completed');
      if (completed !== 'true') {
        // Delay slightly for a smoother transition
        const timer = setTimeout(() => {
          setIsTourOpen(true);
          localStorage.setItem('gv_tour_completed', 'true');
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [user]);

  if (!user) {
    return <LandingPage onAuthClick={() => {}} />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview onTabChange={(tab) => setActiveTab(tab)} />;
      case 'upload':
        return <DatasetUploadTab onTabChange={(tab) => setActiveTab(tab)} />;
      case 'predictions':
        return <AIPredictionsTab />;
      case 'quantum':
        return <QuantumComputingTab />;
      case 'explain':
        return <ExplainabilityTab />;
      case 'pathways':
        return <BiologicalPathwaysTab />;
      case 'explorer':
        return <GeneExplorerTab />;
      case 'labs':
        return <ResearchWorkbenchTab />;
      case 'copilot':
        return <ResearchCopilotTab />;
      case 'api':
        return <ApiExplorerTab />;
      default:
        return <DashboardOverview onTabChange={(tab) => setActiveTab(tab)} />;
    }
  };

  return (
    <div id="dashboard-layout" className={`flex h-screen bg-slate-950 text-slate-100 overflow-hidden ${theme === 'clinical' ? 'clinical-mode' : ''}`}>
      {/* Sidebar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Rail */}
        <header className="h-14 border-b border-slate-900 bg-slate-950 px-6 flex items-center justify-between gap-4 shrink-0 overflow-visible">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">
              SECURE WORKSPACE NODE
            </span>
          </div>

          <GlobalSearchBar activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="flex items-center gap-4 text-xs font-mono shrink-0">
            {/* Global Theme Toggle Button */}
            <button
              id="theme-toggle"
              onClick={() => setTheme(theme === 'clinical' ? 'dark' : 'clinical')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono tracking-wide uppercase transition-all cursor-pointer ${
                theme === 'clinical'
                  ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100 text-emerald-700 font-bold shadow-sm'
                  : 'bg-emerald-950/20 border-emerald-900/50 hover:bg-emerald-900/30 text-emerald-300 hover:text-emerald-100'
              }`}
              title={theme === 'clinical' ? "Switch to Default Dark Mode" : "Switch to Clinical High-Contrast Light Mode"}
            >
              {theme === 'clinical' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span>Clinical Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Default Dark</span>
                </>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-4 text-slate-400">
              <span>//</span>
              <button
                onClick={() => setIsTourOpen(true)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono tracking-wide uppercase transition-all cursor-pointer ${
                  theme === 'clinical'
                    ? 'bg-indigo-50 border-indigo-100 hover:bg-indigo-100 text-indigo-700'
                    : 'bg-indigo-950/20 border-indigo-900/50 hover:bg-indigo-900/30 text-indigo-300 hover:text-indigo-100'
                }`}
                title="Launch dynamic workspace tour"
              >
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                <span>System Tour</span>
              </button>
              <span>//</span>
              <span>LATENCY: <span className="text-emerald-400 font-bold">14ms</span></span>
              <span>//</span>
              <span className="flex items-center gap-1" title={
                !supabaseStatus?.configured 
                  ? "Running on default local JSON DB. Set SUPABASE_URL and SUPABASE_ANON_KEY in Secrets to sync with your Cloud Supabase."
                  : supabaseStatus.active
                    ? `Supabase Sync Active. Connected to ${supabaseStatus.supabaseUrl}`
                    : `Supabase Error: ${supabaseStatus.errorMessage || 'Unknown error'}`
              }>
                DATABASE:{' '}
                {!supabaseStatus?.configured ? (
                  <span className="text-indigo-400 font-bold flex items-center gap-1">● LOCAL DB</span>
                ) : supabaseStatus.active ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">● SUPABASE CLOUD</span>
                ) : (
                  <span className="text-rose-500 font-bold flex items-center gap-1">● SUPABASE OFFLINE</span>
                )}
              </span>
            </div>
          </div>
        </header>

        {/* Scrollable View Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {renderTabContent()}
        </main>
      </div>

      {/* Welcome Onboarding Tour overlay */}
      <WelcomeTour
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ResearchProvider>
      <DashboardContent />
    </ResearchProvider>
  );
}
