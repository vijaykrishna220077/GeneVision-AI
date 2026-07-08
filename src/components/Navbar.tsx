import React from 'react';
import { useResearch } from './ResearchContext';
import {
  LayoutDashboard,
  UploadCloud,
  TrendingUp,
  Atom,
  HelpCircle,
  Network,
  Search,
  BookOpen,
  Settings,
  Terminal,
  LogOut,
  FolderDot,
  Plus,
  Dna,
  Menu,
  ChevronLeft,
  Activity,
  Sun,
  Moon,
  Cpu
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export default function Navbar({ activeTab, setActiveTab, collapsed, setCollapsed }: NavbarProps) {
  const { user, logOut, projects, activeProject, setActiveProject, createProject, theme, setTheme } = useResearch();
  const [showNewProjModal, setShowNewProjModal] = React.useState(false);
  const [newProjName, setNewProjName] = React.useState('');
  const [newProjDesc, setNewProjDesc] = React.useState('');
  const [newProjDisease, setNewProjDisease] = React.useState('Breast Cancer');

  const menuItems = [
    { id: 'dashboard', label: 'Research Overview', icon: LayoutDashboard },
    { id: 'upload', label: 'Dataset Registry', icon: UploadCloud },
    { id: 'predictions', label: 'AI Predictor', icon: TrendingUp },
    { id: 'quantum', label: 'Quantum Circuits', icon: Atom },
    { id: 'explain', label: 'Explainability (SHAP)', icon: HelpCircle },
    { id: 'pathways', label: 'Biological Pathways', icon: Network },
    { id: 'explorer', label: 'Gene Loci Explorer', icon: Search },
    { id: 'labs', label: 'Advanced Gen-Labs', icon: Cpu },
    { id: 'copilot', label: 'Research Copilot', icon: BookOpen },
    { id: 'api', label: 'REST API Sandbox', icon: Terminal },
  ];

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjName) return;
    await createProject({
      name: newProjName,
      description: newProjDesc,
      diseaseType: newProjDisease
    });
    setNewProjName('');
    setNewProjDesc('');
    setShowNewProjModal(false);
  };

  return (
    <div
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } bg-slate-950 border-r border-slate-900 flex flex-col h-screen text-slate-400 transition-all duration-300 shrink-0 relative z-40 font-sans`}
    >
      {/* Brand & Toggle */}
      <div className="p-4 border-b border-slate-900 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2 text-white font-bold tracking-wider text-sm font-mono">
            <Dna className="w-5 h-5 text-emerald-400" />
            <span>GENEVISION AI</span>
          </div>
        )}
        {collapsed && <Dna className="w-6 h-6 text-emerald-400 mx-auto animate-pulse" />}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 hover:bg-slate-900 hover:text-white rounded-md text-slate-500 transition cursor-pointer"
        >
          {collapsed ? <Menu className="w-4 h-4 mx-auto" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Active Project Selection Context */}
      <div className="p-3 border-b border-slate-900 bg-slate-950">
        {!collapsed ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase">Active Project</span>
              <button
                onClick={() => setShowNewProjModal(true)}
                className="p-0.5 hover:bg-slate-900 hover:text-emerald-400 rounded transition cursor-pointer"
                title="Create New Research Project"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <select
              value={activeProject?.id || ''}
              onChange={e => {
                const found = projects.find(p => p.id === e.target.value);
                if (found) setActiveProject(found);
              }}
              className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {activeProject && (
              <div className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1.5 justify-center">
                <Activity className="w-3 h-3" /> Targeting: {activeProject.diseaseType}
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center relative group">
            <button
              onClick={() => setShowNewProjModal(true)}
              className="p-1 hover:bg-slate-900 hover:text-emerald-400 rounded transition cursor-pointer"
            >
              <FolderDot className="w-5 h-5 text-slate-500" />
            </button>
            <div className="absolute left-14 bg-slate-900 border border-slate-800 text-white text-xs font-mono px-2 py-1 rounded hidden group-hover:block whitespace-nowrap shadow-xl">
              Projects Manager
            </div>
          </div>
        )}
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono tracking-wide uppercase transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-500/20 to-blue-500/10 border border-emerald-500/35 text-white'
                  : 'hover:bg-slate-900 hover:text-white border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Theme Toggle section */}
      <div className="p-3 border-t border-slate-900 bg-slate-950/60">
        {!collapsed ? (
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold tracking-widest text-slate-500 uppercase">SCHEME DESIGN</span>
            <div className="flex gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
              <button
                onClick={() => setTheme('dark')}
                className={`p-1.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
                  theme === 'dark'
                    ? 'bg-slate-800 text-emerald-400 border border-slate-700/60 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Dark core mode"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="text-[9px] font-mono uppercase px-0.5">DARK</span>
              </button>
              <button
                onClick={() => setTheme('clinical')}
                className={`p-1.5 rounded-md transition cursor-pointer flex items-center gap-1 ${
                  theme === 'clinical'
                    ? 'bg-slate-800 text-amber-400 border border-slate-700/60 shadow-sm font-bold'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Clinical high-contrast mode"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="text-[9px] font-mono uppercase px-0.5">CLINICAL</span>
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setTheme(theme === 'dark' ? 'clinical' : 'dark')}
            className="p-2 hover:bg-slate-900 rounded-lg text-slate-500 mx-auto block cursor-pointer transition-all"
            title={theme === 'dark' ? 'Switch to Clinical Mode' : 'Switch to Dark Core'}
          >
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-slate-500" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500 animate-pulse" />
            )}
          </button>
        )}
      </div>

      {/* User Session Footer Card */}
      <div className="p-3 border-t border-slate-900 bg-slate-950/60 mt-auto">
        {!collapsed ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold font-mono text-xs text-white uppercase">
                {user?.name ? user.name[0] : 'R'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">{user?.name || 'Researcher'}</p>
                <p className="text-[10px] font-mono text-slate-500 truncate">{user?.institution || 'Genetics Core'}</p>
              </div>
            </div>
            <button
              onClick={logOut}
              className="w-full py-1.5 hover:bg-red-500/10 hover:text-red-400 text-slate-500 font-mono text-xs uppercase tracking-wider rounded-lg border border-slate-900 hover:border-red-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" /> Terminate Shell
            </button>
          </div>
        ) : (
          <button
            onClick={logOut}
            className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded-lg text-slate-500 mx-auto block cursor-pointer"
            title="Terminate Shell Session"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProjModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-slate-100">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <FolderDot className="w-5 h-5 text-emerald-400" /> Start New Scientific Project
            </h3>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Project Identifier (Name)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BRCA1/2 Receptor Screening"
                  value={newProjName}
                  onChange={e => setNewProjName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Target Disease Focus</label>
                <select
                  value={newProjDisease}
                  onChange={e => setNewProjDisease(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="Breast Cancer">Breast Cancer</option>
                  <option value="Lung Cancer">Lung Cancer</option>
                  <option value="Colon Cancer">Colon Cancer</option>
                  <option value="Leukemia">Leukemia</option>
                  <option value="Alzheimer's Disease">Alzheimer's Disease</option>
                  <option value="Parkinson's Disease">Parkinson's Disease</option>
                  <option value="Diabetes">Diabetes</option>
                  <option value="Heart Disease">Heart Disease</option>
                  <option value="Rare Diseases">Rare Diseases</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Hypothesis & Objective (Description)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Profiling somatic variants for therapeutic cell validation."
                  value={newProjDesc}
                  onChange={e => setNewProjDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewProjModal(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded font-mono text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
