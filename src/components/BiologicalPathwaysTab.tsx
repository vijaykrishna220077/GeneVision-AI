import React, { useState, useEffect } from 'react';
import { useResearch } from './ResearchContext';
import { Network, ShieldAlert, Sparkles, HelpCircle, Activity, Info, Zap } from 'lucide-react';
import { BiologicalPathway, PathwayNode } from '../types';

export default function BiologicalPathwaysTab() {
  const { activeProject, loadPathways } = useResearch();
  const [pathways, setPathways] = useState<BiologicalPathway[]>([]);
  const [activePathway, setActivePathway] = useState<BiologicalPathway | null>(null);
  const [selectedNode, setSelectedNode] = useState<PathwayNode | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeProject) {
      setLoading(true);
      loadPathways(activeProject.diseaseType).then(data => {
        setPathways(data || []);
        setActivePathway(data && data.length > 0 ? data[0] : null);
        setSelectedNode(null);
        setLoading(false);
      });
    }
  }, [activeProject]);

  // Render Interactive Node-Edge cellular pathway map
  const renderPathwayMap = () => {
    if (!activePathway) return null;

    const width = 600;
    const height = 350;

    // Fixed pre-calculated layout coordinates for a perfect diagram look (avoid overlapping)
    const coordinates: { [nodeId: string]: { x: number; y: number } } = {
      // Breast Cancer Homologous Recombination DNA Repair Map
      'BRCA1': { x: 120, y: 120 },
      'BRCA2': { x: 120, y: 220 },
      'TP53': { x: 300, y: 70 },
      'RAD51': { x: 260, y: 170 },
      'DNA_DAMAGE': { x: 450, y: 170 },
      'PARP_INHIB': { x: 120, y: 40 },

      // Breast Cancer PI3K Growth Map
      'PIK3CA': { x: 150, y: 120 },
      'PTEN': { x: 150, y: 40 },
      'AKT1': { x: 300, y: 120 },
      'MTOR': { x: 450, y: 120 },
      'PROLIF': { x: 450, y: 220 },
      'EVEROLIMUS': { x: 450, y: 40 },

      // Alzheimer's amyloid map
      'APP': { x: 120, y: 120 },
      'BACE1': { x: 120, y: 40 },
      'APOE': { x: 260, y: 200 },
      'CLU': { x: 260, y: 120 },
      'PLAQUES': { x: 450, y: 120 },
      'LECANEMAB': { x: 450, y: 40 },

      // Alzheimer's TREM2 map
      'TREM2': { x: 120, y: 120 },
      'CD33': { x: 120, y: 40 },
      'TYROBP': { x: 280, y: 120 },
      'TNF': { x: 440, y: 120 },
      'SYN_LOSS': { x: 440, y: 220 }
    };

    const getCoord = (id: string) => coordinates[id] || { x: 100, y: 100 };

    return (
      <svg className="w-full h-auto bg-slate-950 rounded-2xl border border-slate-900" viewBox={`0 0 ${width} ${height}`}>
        {/* Draw Edges / Arrows */}
        {activePathway.edges.map(edge => {
          const start = getCoord(edge.source);
          const end = getCoord(edge.target);
          const isInhibition = edge.type === 'inhibition';
          
          // Calculate slightly offset line to avoid overlapping the node bounds
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const len = Math.sqrt(dx*dx + dy*dy);
          const offset = 25; // Node radius approximation
          
          const endX = end.x - (dx / len) * offset;
          const endY = end.y - (dy / len) * offset;

          return (
            <g key={edge.id}>
              {/* Connection line */}
              <line
                x1={start.x}
                y1={start.y}
                x2={endX}
                y2={endY}
                stroke={isInhibition ? '#ef4444' : '#10b981'}
                strokeWidth={1.8}
                strokeDasharray={edge.type === 'association' ? '3 3' : 'none'}
              />
              
              {/* Connector markers */}
              {isInhibition ? (
                // Draw tee-head for inhibition
                <g transform={`translate(${endX}, ${endY}) rotate(${Math.atan2(dy, dx) * 180 / Math.PI})`}>
                  <line x1="0" y1="-6" x2="0" y2="6" stroke="#ef4444" strokeWidth={2.5} />
                </g>
              ) : (
                // Draw standard arrow
                <polygon
                  points="0,0 -8,-4 -8,4"
                  fill="#10b981"
                  transform={`translate(${endX}, ${endY}) rotate(${Math.atan2(dy, dx) * 180 / Math.PI})`}
                />
              )}
            </g>
          );
        })}

        {/* Draw Nodes */}
        {activePathway.nodes.map(node => {
          const coord = getCoord(node.id);
          const isSelected = selectedNode?.id === node.id;
          
          let color = '#475569'; // Neutral gray
          if (node.type === 'gene') {
            color = node.activityState === 'active' ? '#ef4444' : node.activityState === 'suppressed' ? '#3b82f6' : '#a855f7';
          } else if (node.type === 'drug') {
            color = '#eab308'; // Drug targets
          } else if (node.type === 'pathway') {
            color = '#06b6d4'; // Phenotype outcomes
          }

          return (
            <g
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className="cursor-pointer group"
            >
              {/* Glow for active nodes */}
              {node.activityState === 'active' && (
                <circle cx={coord.x} cy={coord.y} r="25" fill="#ef4444" fillOpacity={0.06} className="animate-pulse" />
              )}
              {node.activityState === 'suppressed' && (
                <circle cx={coord.x} cy={coord.y} r="25" fill="#3b82f6" fillOpacity={0.06} />
              )}

              {/* Node boundary circle */}
              <circle
                cx={coord.x}
                cy={coord.y}
                r="20"
                fill="#0f172a"
                stroke={color}
                strokeWidth={isSelected ? 3.0 : 1.5}
                className="group-hover:stroke-white transition-all"
              />

              {/* Node text identifier */}
              <text
                x={coord.x}
                y={coord.y + 3}
                textAnchor="middle"
                className="fill-white font-mono text-[8px] font-bold select-none"
              >
                {node.id}
              </text>

              {/* Little visual badge */}
              {node.expressionLevel && (
                <g transform={`translate(${coord.x + 12}, ${coord.y - 12})`}>
                  <circle r="6" fill="#1e293b" stroke={color} strokeWidth={0.5} />
                  <text y="2" textAnchor="middle" className="fill-slate-400 font-mono text-[5px]" fontWeight="bold">
                    {node.expressionLevel}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-white">Biological Pathways Analyzer</h2>
        <p className="text-slate-500 text-xs font-mono uppercase mt-1">Overlay expression levels on Reactome/KEGG cellular lattices</p>
      </div>

      {!activeProject ? (
        <div className="p-8 border border-slate-900 bg-slate-950 rounded-2xl text-center space-y-3">
          <ShieldAlert className="w-8 h-8 text-yellow-500 mx-auto" />
          <h4 className="text-sm font-mono font-bold text-white uppercase">No Active Project Focus</h4>
          <p className="text-xs text-slate-500">Please choose or create a project context first to map cellular pathways.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pathway Selector Tabs */}
          <div className="flex gap-2 border-b border-slate-900 pb-2">
            {pathways.map(p => (
              <button
                key={p.id}
                onClick={() => {
                  setActivePathway(p);
                  setSelectedNode(null);
                }}
                className={`px-4 py-2 text-xs font-mono rounded transition cursor-pointer ${
                  activePathway?.id === p.id
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold'
                    : 'hover:bg-slate-900 border border-transparent text-slate-400'
                }`}
              >
                {p.name} [{p.source}]
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Interactive map (Left) */}
            <div className="lg:col-span-8 space-y-4">
              {activePathway ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between font-mono text-[10px]">
                    <span className="text-slate-500 uppercase">Interactive Network Lattice</span>
                    <span className="text-emerald-500 font-bold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-yellow-400 animate-pulse" /> Pathway Impact Score: {activePathway.impactScore}
                    </span>
                  </div>
                  {renderPathwayMap()}
                  <p className="text-[10px] text-slate-500 font-mono text-center uppercase tracking-wider">
                    [Tip: Click individual circular protein nodes to analyze biological descriptions and drug companions]
                  </p>
                </div>
              ) : (
                <p className="text-slate-600 text-xs font-mono text-center py-20">Loading cellular coordinates...</p>
              )}
            </div>

            {/* Informative side inspector (Right) */}
            <div className="lg:col-span-4 space-y-6">
              {activePathway && (
                <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-sm font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" /> Cascade Inspector
                    </h3>

                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">PATHWAY OVERVIEW</span>
                      <p className="text-xs text-slate-400 leading-relaxed">{activePathway.description}</p>
                    </div>

                    {selectedNode ? (
                      <div className="p-4 rounded-xl border border-slate-850 bg-slate-900/30 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                          <span className="text-xs font-bold text-white font-mono">{selectedNode.label}</span>
                          <span className="text-[9px] font-mono text-slate-500 uppercase">[{selectedNode.type}]</span>
                        </div>

                        <div className="space-y-1 text-xs">
                          {selectedNode.expressionLevel && (
                            <p className="flex justify-between font-mono text-[10px]">
                              <span className="text-slate-500">EXPRESSION VALUE:</span>
                              <span className="text-emerald-400 font-bold">{selectedNode.expressionLevel} (Relative)</span>
                            </p>
                          )}
                          <p className="flex justify-between font-mono text-[10px]">
                            <span className="text-slate-500">CASCADE STATE:</span>
                            <span className={`font-bold uppercase ${selectedNode.activityState === 'active' ? 'text-red-400' : selectedNode.activityState === 'suppressed' ? 'text-blue-400' : 'text-slate-400'}`}>
                              {selectedNode.activityState || 'NEUTRAL'}
                            </span>
                          </p>
                        </div>

                        {selectedNode.type === 'gene' && (
                          <p className="text-[10px] text-slate-400 font-sans leading-relaxed">
                            Alterations of this driver gene affect cellular membrane synthesis, transcription binding multipliers, and downstream enzymatic receptors.
                          </p>
                        )}
                        {selectedNode.type === 'drug' && (
                          <p className="text-[10px] text-yellow-400 font-mono font-bold leading-relaxed">
                            COMPANION DRUG: Active target clinical binder! Inhibits targeted metabolic kinases to prevent pathway collapse.
                          </p>
                        )}
                      </div>
                    ) : (
                      <div className="p-4 rounded-xl border border-dashed border-slate-850 text-center py-10">
                        <span className="text-[10px] font-mono text-slate-600 uppercase">Inspect Node Standby</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-900">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>NODES COUNT: {activePathway.nodes.length}</span>
                      <span>EDGES COUNT: {activePathway.edges.length}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
