import React, { useState, useEffect } from 'react';
import { useResearch } from './ResearchContext';
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  Atom,
  Network,
  LayoutDashboard,
  UploadCloud,
  TrendingUp,
  Terminal,
  BookOpen,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface WelcomeTourProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeTour({ activeTab, setActiveTab, isOpen, onClose }: WelcomeTourProps) {
  const { theme } = useResearch();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to GeneVision AI!",
      subtitle: "Hybrid Quantum-Genomics Research Workbench",
      description: "Welcome to the ultimate research node for deep-genomic disease modeling and quantum molecular computing simulations. Let's take a quick 1-minute tour of your secure hybrid workspace.",
      icon: Sparkles,
      iconColor: "text-emerald-400",
      tabId: "dashboard",
      highlights: [
        "Advanced neural genomic prediction models",
        "Cellular signaling and biological pathways maps",
        "Virtual quantum circuit simulators with noise control"
      ]
    },
    {
      title: "Research Dashboard Hub",
      subtitle: "Global Project Analytics & Live Logs",
      description: "Get a bird's eye view of all active genomic research. Monitor active projects, track cumulative mutated gene counts, visualize global risk distribution across cohorts, and stream real-time workspace system logs.",
      icon: LayoutDashboard,
      iconColor: "text-indigo-400",
      tabId: "dashboard",
      highlights: [
        "Project-wide cohorts risk statistics",
        "System telemetry logs & workspace status indicators",
        "Dynamic disease-targeting project selection"
      ]
    },
    {
      title: "Dataset Registry & Import",
      subtitle: "High-Dimensional Multi-Omic Files",
      description: "Securely register raw sequencing, expression, or mutation files. The workspace parses standard formats and calculates baseline statistical summaries instantly.",
      icon: UploadCloud,
      iconColor: "text-sky-400",
      tabId: "upload",
      highlights: [
        "Supports standard CSV, TSV, FASTA, VCF, and JSON structures",
        "Calculates mean gene expression level & variance",
        "Automatic background mutation rate evaluation"
      ]
    },
    {
      title: "AI Risk Predictor Models",
      subtitle: "Deep-Learning Targeted Genomic Assessment",
      description: "Execute highly robust machine learning pipelines on registered multi-omic cohorts. Accurately predict clinical risk categories and extract primary mutant genetic drivers.",
      icon: TrendingUp,
      iconColor: "text-rose-400",
      tabId: "predictions",
      highlights: [
        "Interactive confusion matrix performance metrics",
        "Precision risk classification: Low to Critical",
        "Comprehensive gene mutation rankings catalog"
      ]
    },
    {
      title: "Quantum Circuits tab",
      subtitle: "Active ansatz models & sequential batch processors",
      description: "Simulate advanced quantum algorithms on high-performance virtual QPUs. Run Hardware Efficient, QAOA, or Real Amplitudes circuits, apply realistic depolarizing noise, and use our new Sequential Batch Processor to run multiple designs side-by-side!",
      icon: Atom,
      iconColor: "text-purple-400",
      tabId: "quantum",
      highlights: [
        "Dynamic quantum circuit gate & Bloch sphere visualizations",
        "Sequential Batch Queue: stack multiple circuit config designs",
        "Side-by-side probability vector comparisons & heatmaps"
      ]
    },
    {
      title: "Interactive Biological Pathways",
      subtitle: "Cellular Signaling & Protein Interaction Networks",
      description: "Explore comprehensive spatial interactive pathway signal charts. Examine signaling cascades (e.g., PI3K/Akt, MAPK, EGFR), simulate gene knockouts, and inspect protein structure characteristics.",
      icon: Network,
      iconColor: "text-amber-400",
      tabId: "pathways",
      highlights: [
        "Interactive D3/SVG node-link network layouts",
        "Knockout simulation: observe downstream signaling changes",
        "Targeted cancer therapy pathway correlation vectors"
      ]
    },
    {
      title: "Research Copilot & Sandbox",
      subtitle: "Bio-Molecular AI Assistant & Dev Tools",
      description: "Query our intelligent chat agent to obtain advanced genomic suggestions, synthesize summaries, or explore pre-written Node/Python scripts & OpenAPI schemas to integrate your custom analytical flows.",
      icon: BookOpen,
      iconColor: "text-teal-400",
      tabId: "copilot",
      highlights: [
        "Research Copilot: LLM-driven medical literature explorer",
        "Live REST API sandboxes with sample curl snippets",
        "Interactive python SDK templates ready to download"
      ]
    },
    {
      title: "Workspace Configured!",
      subtitle: "You're ready to accelerate your research",
      description: "Congratulations! You have completed the workspace onboarding. You can re-trigger this interactive guide anytime by clicking the 'SYSTEM TOUR' button in the workspace top bar.",
      icon: CheckCircle2,
      iconColor: "text-emerald-500",
      tabId: "dashboard",
      highlights: [
        "Custom workspace layouts adapted to your target disease",
        "Clinical high-contrast themes optimized for eye health",
        "Robust developer sandbox integrations"
      ]
    }
  ];

  // Auto switch tab when step changes to let user visualize the respective feature!
  useEffect(() => {
    if (isOpen) {
      const stepConfig = steps[currentStep];
      if (stepConfig && activeTab !== stepConfig.tabId) {
        setActiveTab(stepConfig.tabId);
      }
    }
  }, [currentStep, isOpen]);

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const StepIcon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const isClinical = theme === 'clinical';

  return (
    <div id="welcome-tour-overlay" className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300">
      <div
        id="welcome-tour-modal"
        className={`relative w-full max-w-xl rounded-3xl border overflow-hidden shadow-2xl flex flex-col p-6 md:p-8 space-y-6 transform scale-100 transition-all duration-300 ${
          isClinical
            ? 'bg-white border-slate-200 text-slate-800 shadow-slate-300/40'
            : 'bg-slate-950 border-slate-900 text-white shadow-indigo-500/10'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-1.5 rounded-full transition-all cursor-pointer ${
            isClinical
              ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-800'
              : 'hover:bg-slate-900 text-slate-500 hover:text-white'
          }`}
          title="Skip Tour"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Header */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${
            isClinical ? 'bg-slate-50 border border-slate-200/60' : 'bg-slate-900/60 border border-slate-800'
          }`}>
            <StepIcon className={`w-8 h-8 ${currentStepData.iconColor} animate-pulse`} />
          </div>
          <div className="space-y-1">
            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
              isClinical ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-slate-400'
            }`}>
              Onboarding: Step {currentStep + 1} of {steps.length}
            </span>
            <h2 className={`text-lg md:text-xl font-bold font-sans tracking-tight ${
              isClinical ? 'text-slate-900' : 'text-white'
            }`}>
              {currentStepData.title}
            </h2>
            <p className="text-xs font-mono text-indigo-500 font-semibold uppercase">
              {currentStepData.subtitle}
            </p>
          </div>
        </div>

        {/* Body Description */}
        <div className="space-y-4">
          <p className={`text-xs md:text-sm leading-relaxed ${
            isClinical ? 'text-slate-600' : 'text-slate-400'
          }`}>
            {currentStepData.description}
          </p>

          {/* Highlights bullet boxes */}
          <div className={`p-4 rounded-2xl border ${
            isClinical ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-900/20 border-slate-900'
          } space-y-2.5`}>
            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
              Core highlights of this view:
            </span>
            <ul className="space-y-2 text-xs font-sans">
              {currentStepData.highlights.map((highlight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-left">
                  <span className="text-indigo-500 mt-0.5 shrink-0 font-bold">•</span>
                  <span className={isClinical ? 'text-slate-700 font-medium' : 'text-slate-300 font-medium'}>
                    {highlight}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full space-y-1.5">
          <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
            <span>COMPLETION STATUS</span>
            <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className={`h-1.5 w-full rounded-full overflow-hidden ${isClinical ? 'bg-slate-100' : 'bg-slate-900'}`}>
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Modal Actions */}
        <div className={`flex items-center justify-between border-t pt-4 ${
          isClinical ? 'border-slate-100' : 'border-slate-900'
        }`}>
          {/* Skip button / Step indicator dots */}
          <button
            onClick={onClose}
            className="text-[11px] font-mono font-bold text-slate-500 hover:text-slate-400 uppercase tracking-wider cursor-pointer"
          >
            Skip Tour
          </button>

          {/* Visual Step Dots */}
          <div className="hidden sm:flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === idx
                    ? 'bg-indigo-500 scale-125'
                    : isClinical
                      ? 'bg-slate-200 hover:bg-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700'
                }`}
                title={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold uppercase transition-all flex items-center gap-1 cursor-pointer ${
                  isClinical
                    ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                    : 'bg-slate-950 border-slate-900 hover:bg-slate-900 text-slate-300 hover:text-white'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-indigo-600/10"
            >
              {currentStep === steps.length - 1 ? "Finish" : "Next"} <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
