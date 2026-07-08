import React, { useState, useEffect, useRef } from 'react';
import { useResearch } from './ResearchContext';
import { Dna, HelpCircle, Activity, Cpu, ShieldAlert, FileSpreadsheet, Binary, ChevronRight, LogIn, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function LandingPage({ onAuthClick }: { onAuthClick: () => void }) {
  const { signUp, error, loading } = useResearch();
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const authFormRef = useRef<HTMLDivElement | null>(null);

  const handleAccessPortalClick = () => {
    setIsSignUp(true);
    authFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    if (onAuthClick) {
      onAuthClick();
    }
  };

  // Advanced Canvas-based 3D DNA Helix background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      width = canvas.width = canvas.parentElement?.clientWidth || 800;
      height = canvas.height = canvas.parentElement?.clientHeight || 600;
    };
    window.addEventListener('resize', handleResize);

    const numNodes = 30;
    const spacing = width / numNodes;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.lineWidth = 1.5;

      for (let i = 0; i < numNodes; i++) {
        const x = i * spacing + spacing / 2;
        const amplitude = 60;
        
        // Helix strand A
        const yA = height / 2 + Math.sin(phase + i * 0.4) * amplitude;
        // Helix strand B
        const yB = height / 2 + Math.sin(phase + i * 0.4 + Math.PI) * amplitude;

        // Draw connections (rungs)
        ctx.strokeStyle = `rgba(16, 185, 129, ${0.15 + Math.abs(Math.sin(phase + i * 0.4)) * 0.35})`;
        ctx.beginPath();
        ctx.moveTo(x, yA);
        ctx.lineTo(x, yB);
        ctx.stroke();

        // Draw node A
        ctx.fillStyle = yA < yB ? '#10b981' : '#3b82f6'; // Depth coloring
        ctx.beginPath();
        ctx.arc(x, yA, 5 + Math.sin(phase + i * 0.4) * 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw node B
        ctx.fillStyle = yB < yA ? '#10b981' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(x, yB, 5 + Math.sin(phase + i * 0.4 + Math.PI) * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      phase += 0.02;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await signUp({ email, password, name, institution });
    } else {
      await signUp({ email, password, name: email.split('@')[0], isLogin: true });
    }
  };

  return (
    <div id="landing-page" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Upper Navigation Rail */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-lg shadow-lg">
            <Dna className="w-6 h-6 text-slate-950 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white font-sans flex items-center gap-1.5">
              GeneVision <span className="text-emerald-400 text-xs font-mono px-2 py-0.5 rounded-full border border-emerald-500/20 bg-emerald-500/10">QUANTUM v1.2</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleAccessPortalClick}
            className="text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 border border-slate-800 rounded-md hover:border-slate-700 transition animate-pulse hover:animate-none"
          >
            <LogIn className="w-3.5 h-3.5" /> ACCESS PORTAL
          </button>
        </div>
      </header>

      {/* Main Hero & Split Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden relative">
        {/* Left Side: DNA Canvas Animation + Core Science Info */}
        <div className="lg:col-span-7 flex flex-col justify-center px-8 md:px-16 py-12 border-r border-slate-900 relative">
          {/* Canvas Background */}
          <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>

          <div className="relative z-10 space-y-8 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-xs font-mono uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Next-Gen Precision Oncology & Neurology
            </div>

            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-none">
                AI + Quantum <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500">
                  Genomics Classifier
                </span>
              </h2>
              <p className="text-slate-400 text-base md:text-lg leading-relaxed font-sans">
                Analyze high-dimensional somatic mutation datasets and RNA-Seq transcriptome matrices using state-vector **QSVM** and **Variational Quantum Classifiers (VQC)**. Unlock non-linear biomolecular patterns classical networks cannot compute.
              </p>
            </div>

            {/* Core Tech Dials */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/40 backdrop-blur-sm hover:border-emerald-500/25 transition">
                <Cpu className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="text-sm font-bold text-white font-mono">QML Pipelines</h4>
                <p className="text-xs text-slate-500 mt-1">Hadamard, CNOT lattices & RealAmplitudes Ansatz.</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/40 backdrop-blur-sm hover:border-blue-500/25 transition">
                <Activity className="w-5 h-5 text-blue-400 mb-2" />
                <h4 className="text-sm font-bold text-white font-mono">Explainable AI</h4>
                <p className="text-xs text-slate-500 mt-1">Full SHAP waterfall plots & driver gene metrics.</p>
              </div>
              <div className="p-4 rounded-xl border border-slate-900 bg-slate-900/40 backdrop-blur-sm hover:border-emerald-500/25 transition">
                <Dna className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="text-sm font-bold text-white font-mono">Biochemical Nodes</h4>
                <p className="text-xs text-slate-500 mt-1">Interlinked Reactome & KEGG network overlays.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Box */}
        <div className="lg:col-span-5 bg-slate-950 flex flex-col justify-center px-8 md:px-16 py-12">
          <div ref={authFormRef} className="max-w-md w-full mx-auto p-8 rounded-2xl border border-slate-900 bg-slate-900/20 backdrop-blur-md relative">
            <div className="absolute top-0 right-0 p-3">
              <HelpCircle className="w-4 h-4 text-slate-600 hover:text-slate-400 cursor-help" title="To log in or register, use this secure, local research sandbox portal." />
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-white mb-2">
              {isSignUp ? 'Initialize Workspace' : 'Authorize Credentials'}
            </h3>
            <p className="text-xs text-slate-500 mb-6 font-mono">
              SECURE RESEARCH SHELL // PERSISTENT SESSION
            </p>

            {error && (
              <div className="mb-4 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs font-mono flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Researcher Name</label>
                    <input
                      id="researcher-name-input"
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Affiliated Institution</label>
                    <input
                      type="text"
                      placeholder="e.g. Dana-Farber Cancer Institute"
                      value={institution}
                      onChange={e => setInstitution(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-sans"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Research Email</label>
                <input
                  type="email"
                  required
                  placeholder="name@institution.org"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-1">Security Key (Password)</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition duration-200 flex items-center justify-center gap-2 mt-6 cursor-pointer"
              >
                {loading ? 'SYNCHRONIZING...' : isSignUp ? 'INITIALIZE SYSTEM' : 'AUTHORIZE PORTAL'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-mono underline cursor-pointer"
              >
                {isSignUp ? 'Already have credentials? Access Portal' : 'Register new scientific workspace'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modern High-End Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs font-mono">
        <div>
          © 2026 GENEVISION BIOMEDICAL INC. LICENSED FOR ACADEMIC & THERAPEUTIC USE.
        </div>
        <div className="flex items-center gap-4 mt-2 sm:mt-0">
          <span className="hover:text-slate-300 cursor-pointer">PRIVACY RULES</span>
          <span>//</span>
          <span className="hover:text-slate-300 cursor-pointer">DOCUMENTATION</span>
          <span>//</span>
          <span className="text-emerald-500 animate-pulse">● ALL SYSTEMS RUNNING</span>
        </div>
      </footer>
    </div>
  );
}
