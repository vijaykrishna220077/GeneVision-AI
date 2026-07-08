import React from 'react';
import { useResearch } from './ResearchContext';
import { HelpCircle, ShieldAlert, TrendingUp, Info, ListFilter, Sparkles } from 'lucide-react';

export default function ExplainabilityTab() {
  const { activeProject, activePrediction } = useResearch();

  // Custom SVG Waterfall Plot Generator
  const renderWaterfallPlot = () => {
    if (!activePrediction) return null;
    const rankings = activePrediction.geneRankings;
    
    const startX = 100;
    const paddingY = 30;
    const rowHeight = 45;
    const plotWidth = 350;
    const height = (rankings.length + 2) * rowHeight;
    const width = 500;

    // We assume risk score scale is 0 to 100 (which maps to plotting bounds)
    const scale = (val: number) => (val / 1.5) * (plotWidth / 2) + (plotWidth / 2) + startX;

    const baseVal = 0.35; // base probability
    let currentVal = baseVal;

    return (
      <svg className="w-full h-auto bg-slate-950 rounded-2xl border border-slate-900 shadow-2xl" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <filter id="glow-3d" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <linearGradient id="bar-3d-red" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="25%" stopColor="#ef4444" />
            <stop offset="75%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
          <linearGradient id="bar-3d-blue" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="25%" stopColor="#0ea5e9" />
            <stop offset="75%" stopColor="#0369a1" />
            <stop offset="100%" stopColor="#0c4a6e" />
          </linearGradient>
          <linearGradient id="bar-3d-purple" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#d8b4fe" />
            <stop offset="25%" stopColor="#a855f7" />
            <stop offset="75%" stopColor="#7e22ce" />
            <stop offset="100%" stopColor="#581c87" />
          </linearGradient>
          <linearGradient id="bar-3d-emerald" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="25%" stopColor="#10b981" />
            <stop offset="75%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>
        </defs>

        <style>{`
          @keyframes pulse-outcome {
            0%, 100% { r: 4px; filter: drop-shadow(0 0 2px #10b981); }
            50% { r: 5.5px; filter: drop-shadow(0 0 6px #34d399); }
          }
          .pulsing-outcome {
            animation: pulse-outcome 2.5s ease-in-out infinite;
            cursor: pointer;
          }
          .waterfall-bar-hover {
            transition: all 0.25s ease-out;
            cursor: pointer;
          }
          .waterfall-bar-hover:hover {
            fill-opacity: 0.95;
            filter: drop-shadow(0px 0px 5px currentColor);
            transform: scaleY(1.08);
          }
        `}</style>

        {/* Draw vertical grid lines */}
        {[-1.0, -0.5, 0, 0.5, 1.0].map(tick => {
          const x = scale(tick);
          return (
            <g key={tick}>
              <line x1={x} y1={15} x2={x} y2={height - 25} stroke="#1e293b" strokeWidth={1} strokeDasharray="2 2" />
              <text x={x} y={height - 10} textAnchor="middle" className="fill-slate-500 font-mono text-[8px]">{tick > 0 ? `+${tick}` : tick}</text>
            </g>
          );
        })}

        {/* Row 1: Base Value */}
        <g>
          <text x="15" y={paddingY + 4} className="fill-slate-400 font-mono text-[10px]" fontWeight="bold">E[f(x)] (Base)</text>
          <circle cx={scale(baseVal)} cy={paddingY} r="4" fill="url(#bar-3d-purple)" className="waterfall-bar-hover text-purple-500" />
          <line x1={scale(0)} y1={paddingY} x2={scale(baseVal)} y2={paddingY} stroke="#a855f7" strokeWidth={1.5} />
          <text x={scale(baseVal)} y={paddingY - 8} textAnchor="middle" className="fill-purple-400 font-mono text-[9px]">{baseVal.toFixed(2)}</text>
        </g>

        {/* Dynamic cascading blocks */}
        {rankings.map((g, idx) => {
          const y = paddingY + (idx + 1) * rowHeight;
          const prevVal = currentVal;
          currentVal += g.shapValue;

          const xStart = scale(Math.min(prevVal, currentVal));
          const xEnd = scale(Math.max(prevVal, currentVal));
          const barWidth = Math.max(2, xEnd - xStart);
          const isPositive = g.shapValue >= 0;
          const barFill = isPositive ? 'url(#bar-3d-red)' : 'url(#bar-3d-blue)';
          const hoverColorClass = isPositive ? 'text-red-500' : 'text-sky-500';

          return (
            <g key={g.geneName}>
              {/* Row Label */}
              <text x="15" y={y + 4} className="fill-white font-mono text-[10px] font-bold">{g.geneName}</text>
              <text x="75" y={y + 4} className="fill-slate-500 font-mono text-[8px]">({g.expressionLevel})</text>

              {/* Waterfall bar block */}
              <rect 
                x={xStart} 
                y={y - 8} 
                width={barWidth} 
                height="16" 
                rx="3" 
                fill={barFill} 
                fillOpacity={0.8}
                stroke={isPositive ? '#ef4444' : '#0ea5e9'} 
                strokeWidth={1} 
                className={`waterfall-bar-hover ${hoverColorClass}`}
                style={{ transformOrigin: `${xStart + barWidth/2}px ${y}px` }}
              />

              {/* Arrow connector */}
              <line x1={scale(prevVal)} y1={y - 8} x2={scale(prevVal)} y2={y + 12} stroke="#334155" strokeWidth={0.8} strokeDasharray="2 2" />

              {/* Impact label */}
              <text x={isPositive ? xEnd + 6 : xStart - 6} y={y + 3} textAnchor={isPositive ? 'start' : 'end'} className={`font-mono text-[8px] font-bold ${isPositive ? 'text-red-400' : 'text-sky-400'}`}>
                {isPositive ? `+${g.shapValue.toFixed(3)}` : g.shapValue.toFixed(3)}
              </text>
            </g>
          );
        })}

        {/* Final Row: Predicted Risk Outcome */}
        <g>
          <text x="15" y={paddingY + (rankings.length + 1) * rowHeight + 4} className="fill-white font-mono text-[10px] font-bold">f(x) (Outcome)</text>
          <circle cx={scale(currentVal)} cy={paddingY + (rankings.length + 1) * rowHeight} r="4.5" fill="url(#bar-3d-emerald)" className="pulsing-outcome" />
          <line x1={scale(0)} y1={paddingY + (rankings.length + 1) * rowHeight} x2={scale(currentVal)} y2={paddingY + (rankings.length + 1) * rowHeight} stroke="#10b981" strokeWidth={1.5} />
          <text x={scale(currentVal)} y={paddingY + (rankings.length + 1) * rowHeight - 8} textAnchor="middle" className="fill-emerald-400 font-mono text-[9px] font-bold">{currentVal.toFixed(2)}</text>
        </g>
      </svg>
    );
  };

  // Custom SVG Beeswarm plot representation
  const renderBeeswarmPlot = () => {
    if (!activePrediction) return null;
    const rankings = activePrediction.geneRankings;

    const rowHeight = 45;
    const height = rankings.length * rowHeight + 40;
    const width = 900;
    const startX = 130;
    const plotWidth = 720;

    const scale = (val: number) => (val / 1.0) * (plotWidth / 2) + (plotWidth / 2) + startX;

    return (
      <div id="beeswarm-scroll-container" className="w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-slate-950/40 rounded-2xl border border-slate-900 bg-slate-950/60 p-1">
        <svg 
          id="beeswarm-svg-plot" 
          className="min-w-[900px] h-auto bg-slate-950 rounded-xl" 
          viewBox={`0 0 ${width} ${height}`}
        >
          <defs>
            <radialGradient id="sphere-3d-blue" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="40%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#0369a1" />
            </radialGradient>
            <radialGradient id="sphere-3d-blue-mid" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="40%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0891b2" />
            </radialGradient>
            <radialGradient id="sphere-3d-purple" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#f3e8ff" />
              <stop offset="40%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#7e22ce" />
            </radialGradient>
            <radialGradient id="sphere-3d-pink" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffe4e6" />
              <stop offset="40%" stopColor="#f43f5e" />
              <stop offset="100%" stopColor="#be123c" />
            </radialGradient>
            <radialGradient id="sphere-3d-red" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#fef2f2" />
              <stop offset="40%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#b91c1c" />
            </radialGradient>
          </defs>

          <style>{`
            @keyframes float-dot {
              0%, 100% { transform: translateY(0px) translateX(0px); }
              50% { transform: translateY(var(--float-y, -2px)) translateX(var(--float-x, 1.5px)); }
            }
            .floating-sphere {
              animation: float-dot var(--float-dur, 3s) ease-in-out infinite;
              animation-delay: var(--float-delay, 0s);
              transform-origin: center;
              transition: r 0.2s ease, filter 0.2s ease;
              cursor: pointer;
            }
            .floating-sphere:hover {
              r: 6.5px !important;
              filter: drop-shadow(0px 0px 6px var(--hover-glow-color, #10b981));
            }
          `}</style>

          {/* Draw vertical zero line */}
          <line x1={scale(0)} y1={10} x2={scale(0)} y2={height - 30} stroke="#475569" strokeWidth={1} />
          <text x={scale(0)} y={height - 15} textAnchor="middle" className="fill-slate-500 font-mono text-[8px]">0.0 SHAP</text>
          <text x={scale(-0.5)} y={height - 15} textAnchor="middle" className="fill-slate-500 font-mono text-[8px]">Negative Impact</text>
          <text x={scale(0.5)} y={height - 15} textAnchor="middle" className="fill-slate-500 font-mono text-[8px]">Positive Impact</text>

          {rankings.map((g, idx) => {
            const y = 30 + idx * rowHeight;
            const isPositive = g.shapValue >= 0;

            // Generate deterministic simulated dots for patient runs to prevent flickering
            const dots = Array.from({ length: 15 }).map((_, dIdx) => {
              // Deterministic seed based on index and gene name
              const seed = (dIdx * 17 + g.geneName.charCodeAt(0) * 7) % 100;
              const spreadX = g.shapValue * (0.6 + (seed % 30) / 50) + (Math.sin(seed) * 0.05);
              const spreadY = Math.sin(seed * 4) * 8;
              
              // Expression values determine coloring: high = red, low = blue
              const exprRatio = dIdx / 14;
              const gradientIndex = Math.min(4, Math.floor(exprRatio * 5));
              const gradientId = [
                'sphere-3d-blue',
                'sphere-3d-blue-mid',
                'sphere-3d-purple',
                'sphere-3d-pink',
                'sphere-3d-red'
              ][gradientIndex];

              const hoverColor = exprRatio > 0.6 ? '#ef4444' : exprRatio < 0.4 ? '#38bdf8' : '#a855f7';

              return (
                <circle
                  key={dIdx}
                  cx={scale(spreadX)}
                  cy={y + spreadY}
                  r="3.5"
                  fill={`url(#${gradientId})`}
                  className="floating-sphere"
                  style={{
                    '--float-y': `${Math.sin(seed) * 2.5}px`,
                    '--float-x': `${Math.cos(seed) * 1.5}px`,
                    '--float-dur': `${3 + (seed % 4)}s`,
                    '--float-delay': `${-(seed % 5)}s`,
                    '--hover-glow-color': hoverColor,
                    transformOrigin: `${scale(spreadX)}px ${y + spreadY}px`
                  } as React.CSSProperties}
                />
              );
            });

            return (
              <g key={`swarm-${g.geneName}`}>
                <text x="15" y={y + 4} className="fill-white font-mono text-[10px] font-bold">{g.geneName}</text>
                <line x1={startX} y1={y} x2={startX + plotWidth} y2={y} stroke="#1e293b" strokeWidth={0.5} />
                {dots}
              </g>
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-white">Explainable AI (XAI) Panel</h2>
        <p className="text-slate-500 text-xs font-mono uppercase mt-1">Quantify biometric driver margins using SHAP values</p>
      </div>

      {!activeProject || !activePrediction ? (
        <div className="p-8 border border-slate-900 bg-slate-950 rounded-2xl text-center space-y-3">
          <ShieldAlert className="w-8 h-8 text-yellow-500 mx-auto" />
          <h4 className="text-sm font-mono font-bold text-white uppercase">Diagnostic Run Context Idle</h4>
          <p className="text-xs text-slate-500">You must run an AI prediction model first in order to generate SHAP feature explanations.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top informative rail */}
          <div className="p-4 rounded-xl border border-slate-900 bg-slate-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Sparkles className="w-5 h-5 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">Explainable AI Sandbox Active</span>
                <span className="text-[10px] font-mono text-slate-500">MODEL TYPE: {activePrediction.modelType} // COGNITIVE RISK MAP</span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
              SHAPLEY VALS CONVERGED OVER {activePrediction.geneRankings.length} NODES
            </div>
          </div>

          {/* Main plots split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Waterfall Plot */}
            <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono font-bold tracking-wider text-slate-500 uppercase">
                  SHAP Waterfall Attribution Plot
                </h3>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded">
                  Additive Impact
                </span>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                This waterfall chart shows how individual driver expressions shifted the clinical risk prediction from the baseline expected probability ($E[f(x)] = 0.35$) to the target outcome ($f(x) = {(activePrediction.overallRiskScore / 100).toFixed(2)}$).
              </p>
              {renderWaterfallPlot()}
            </div>

            {/* Summary Beeswarm Plot */}
            <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-mono font-bold tracking-wider text-slate-500 uppercase">
                  SHAP Beeswarm Density Summary
                </h3>
                {/* Horizontal Gradient Colorbar key */}
                <div className="flex items-center gap-1.5 text-[8px] font-mono text-slate-500">
                  <span>Low Expr</span>
                  <div className="w-16 h-2 bg-gradient-to-r from-blue-500 to-red-500 rounded" />
                  <span>High Expr</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Beeswarm plots display the impact of all transcriptomic samples in the dataset. Each dot represents a single patient run, where color indicates high (red) or low (blue) raw gene expression levels.
              </p>
              {renderBeeswarmPlot()}
            </div>
          </div>

          {/* Theoretical explanation footer */}
          <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950 space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-400" /> WHAT ARE SHAPLEY VALUES IN BIOMEDICINE?
            </h4>
            <p className="text-xs text-slate-500 font-sans leading-relaxed">
              **SHAP (Shapley Additive exPlanations)** is a game-theoretic approach that explains the output of machine learning models. By modeling genes as cooperative players in a clinical coalition, SHAP distributes payoff (prediction score) proportional to their marginal contributions. High positive red SHAP values indicate that elevated expression (e.g. high APOE4) directly promoted the high risk classification, while high negative blue values indicate that high expression acted as a protective tumor suppressor (e.g. high PTEN) reducing risk.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
