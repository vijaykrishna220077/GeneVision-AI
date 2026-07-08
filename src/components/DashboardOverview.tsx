import React from 'react';
import { useResearch } from './ResearchContext';
import { FolderDot, FileSpreadsheet, Binary, Atom, Database, CheckCircle, Flame, Clock, Download } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardOverview({ onTabChange }: { onTabChange: (tab: string) => void }) {
  const {
    projects,
    datasets,
    predictions,
    quantumJobs,
    activityLogs,
    activeProject,
    activeDataset,
    activePrediction,
    deleteProject,
    theme
  } = useResearch();

  const isClinical = theme === 'clinical';

  const metrics = [
    { label: 'Active Projects', value: projects.length, icon: FolderDot, color: isClinical ? 'text-indigo-600 bg-indigo-50' : 'text-emerald-400 bg-emerald-500/10' },
    { label: 'Dataset Registry', value: datasets.length, icon: FileSpreadsheet, color: isClinical ? 'text-blue-600 bg-blue-50' : 'text-blue-400 bg-blue-500/10' },
    { label: 'Trained Classifiers', value: predictions.length, icon: Binary, color: isClinical ? 'text-purple-600 bg-purple-50' : 'text-purple-400 bg-purple-500/10' },
    { label: 'Quantum Circuits', value: quantumJobs.length, icon: Atom, color: isClinical ? 'text-emerald-600 bg-emerald-50' : 'text-emerald-400 bg-emerald-500/10' },
  ];

  const getLogColor = (type: string) => {
    switch (type) {
      case 'upload': return isClinical ? 'text-blue-600 font-bold' : 'text-blue-400';
      case 'prediction': return isClinical ? 'text-purple-600 font-bold' : 'text-purple-400';
      case 'quantum': return isClinical ? 'text-emerald-600 font-bold' : 'text-emerald-400';
      case 'project': return isClinical ? 'text-amber-600 font-bold' : 'text-yellow-400';
      default: return 'text-slate-500';
    }
  };

  const performanceHistory = activityLogs
    .filter(log => log.type === 'prediction' || log.type === 'quantum')
    .map((log, idx) => ({
      name: `Run ${idx + 1}`,
      accuracy: 80 + Math.floor(Math.sin(idx) * 15 + Math.random() * 5),
    })).reverse();

  const handleDownloadReport = () => {
    if (!activeProject) {
      alert("No active research project found. Please select or create a project first.");
      return;
    }

    let csvContent = "";

    // 1. PROJECT METADATA
    csvContent += "=== RESEARCH PROJECT METADATA ===\n";
    csvContent += "Field,Value\n";
    csvContent += `Project ID,${activeProject.id}\n`;
    csvContent += `Project Name,"${activeProject.name.replace(/"/g, '""')}"\n`;
    csvContent += `Disease Context,"${activeProject.diseaseType}"\n`;
    csvContent += `Description,"${(activeProject.description || '').replace(/"/g, '""')}"\n`;
    csvContent += `Created At,${activeProject.createdAt}\n\n`;

    // 2. DATASET DETAILS
    csvContent += "=== ACTIVE DATASET SUMMARY ===\n";
    if (activeDataset) {
      csvContent += "Field,Value\n";
      csvContent += `Dataset ID,${activeDataset.id}\n`;
      csvContent += `Dataset Name,"${activeDataset.name.replace(/"/g, '""')}"\n`;
      csvContent += `File Format,${activeDataset.fileType}\n`;
      csvContent += `Row Count,${activeDataset.rowCount}\n`;
      csvContent += `Column Count,${activeDataset.columnCount}\n`;
      csvContent += `Mean Expression Level,${activeDataset.summaryStats?.meanExpression ?? 'N/A'}\n`;
      csvContent += `Expression Variance,${activeDataset.summaryStats?.variance ?? 'N/A'}\n`;
      csvContent += `Missing Values,${activeDataset.summaryStats?.missingValues ?? 'N/A'}\n`;
      csvContent += `Mutation Prevalence Rate,${activeDataset.summaryStats?.mutationRate ?? 'N/A'}\n`;
      csvContent += `Uploaded At,${activeDataset.uploadedAt}\n\n`;
    } else {
      csvContent += "No active dataset loaded for this project context.\n\n";
    }

    // 3. CLASSIFICATION ANALYSIS SUMMARY
    csvContent += "=== GENOMIC CLASSIFICATION SUMMARY ===\n";
    if (activePrediction) {
      csvContent += "Field,Value\n";
      csvContent += `Diagnostic Run ID,${activePrediction.id}\n`;
      csvContent += `Machine Learning Model,${activePrediction.modelType}\n`;
      csvContent += `Primary Target,${activePrediction.diseaseType}\n`;
      csvContent += `Overall Risk Score (0-100),${activePrediction.overallRiskScore}\n`;
      csvContent += `Assigned Risk Category,${activePrediction.riskCategory}\n`;
      csvContent += `Model Cross-Validation Accuracy,${(activePrediction.predictionAccuracy * 100).toFixed(2)}%\n`;
      csvContent += `Classified At,${activePrediction.classifiedAt}\n\n`;

      // 4. GENE RANKINGS (CLASSIFICATION RESULTS)
      csvContent += "=== GENE CLASSIFICATION RESULTS (RANKINGS) ===\n";
      csvContent += "Gene Name,Chromosome,Expression Level,SHAP Importance,Association Strength,p-value,Disease Association\n";
      if (activePrediction.geneRankings && activePrediction.geneRankings.length > 0) {
        activePrediction.geneRankings.forEach(g => {
          csvContent += `${g.geneName},${g.chromosome},${g.expressionLevel},${g.shapValue},${g.importance},${g.pvalue},"${(g.diseaseAssociation || '').replace(/"/g, '""')}"\n`;
        });
      } else {
        csvContent += "No gene rankings found in the prediction payload.\n";
      }
      csvContent += "\n";
    } else {
      csvContent += "No classical or quantum classification runs executed yet for this project.\n\n";
    }

    // 5. QUANTUM CO-PROCESSING METRICS (IF ANY)
    csvContent += "=== QUANTUM CO-PROCESSING LOG ===\n";
    const projectJobs = quantumJobs.filter(j => j.projectId === activeProject.id);
    if (projectJobs.length > 0) {
      csvContent += "Job ID,Qubits,Ansatz,Encoding,Status,Fidelity,Quantum Accuracy,Classical Accuracy,Execution Time (ms),Created At\n";
      projectJobs.forEach(j => {
        csvContent += `${j.id},${j.qubits},${j.ansatz},${j.encodingType},${j.status},${j.fidelity},${j.quantumAccuracy},${j.classicalAccuracy},${j.executionTimeMs},${j.createdAt}\n`;
      });
    } else {
      csvContent += "No quantum-enhanced co-processing diagnostics executed in this session.\n";
    }

    // Generate blob and trigger file download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    // Format filename safely
    const cleanProjectName = activeProject.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
    link.setAttribute("download", `genevision_report_${cleanProjectName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Title & Controls */}
      <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b pb-5 ${
        isClinical ? 'border-slate-200' : 'border-slate-900'
      }`}>
        <div>
          <h2 className={`text-2xl font-bold tracking-tight ${
            isClinical ? 'text-slate-900' : 'text-white'
          }`}>Research Command Center</h2>
          <p className="text-slate-500 text-xs font-mono uppercase mt-1">GENOMIC WORKSPACE OVERVIEW</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {activeProject && (
            <button
              id="download-report-btn"
              onClick={handleDownloadReport}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-mono tracking-wide uppercase transition-all cursor-pointer ${
                isClinical
                  ? 'bg-indigo-600 border-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  : 'bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-400 font-bold'
              }`}
              title="Export complete session research data & classification results to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Report</span>
            </button>
          )}
          <span className={`text-[10px] font-mono px-2.5 py-1 rounded border ${
            isClinical
              ? 'bg-slate-100 border-slate-200 text-slate-600'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            LOCAL NODE ID: CLOUD-RUN-3000
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Synchronized" />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => {
          const Icon = m.icon;
          return (
            <div key={m.label} className={`p-5 rounded-2xl border flex items-center justify-between transition ${
              isClinical
                ? 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                : 'bg-slate-950 border-slate-900 hover:border-slate-800 text-white'
            }`}>
              <div className="space-y-1">
                <p className="text-xs font-mono text-slate-500 uppercase tracking-wide">{m.label}</p>
                <p className={`text-2xl font-bold tracking-tight ${isClinical ? 'text-slate-900' : 'text-white'}`}>{m.value}</p>
              </div>
              <div className={`p-3 rounded-xl ${m.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Split Info Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Active Project Focus Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className={`p-6 rounded-2xl border space-y-4 ${
            isClinical
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-slate-950 border-slate-900 text-white'
          }`}>
            <h3 className="text-sm font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" /> Active Research Context
            </h3>
            {activeProject ? (
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className={`text-lg font-bold ${isClinical ? 'text-slate-900' : 'text-white'}`}>{activeProject.name}</h4>
                  <p className={`text-xs leading-relaxed font-sans ${isClinical ? 'text-slate-600' : 'text-slate-400'}`}>{activeProject.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className={`p-3 rounded-lg border ${
                    isClinical ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}>
                    <span className="text-slate-500 block mb-1 uppercase text-[10px]">DISEASE TYPE</span>
                    <span className={`font-bold ${isClinical ? 'text-slate-800' : 'text-white'}`}>{activeProject.diseaseType}</span>
                  </div>
                  <div className={`p-3 rounded-lg border ${
                    isClinical ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}>
                    <span className="text-slate-500 block mb-1 uppercase text-[10px]">MUTATION RATE</span>
                    <span className={`font-bold flex items-center gap-1 ${isClinical ? 'text-slate-800' : 'text-white'}`}>
                      <Flame className="w-3.5 h-3.5 text-orange-400" /> 12.4% (Elevated)
                    </span>
                  </div>
                  <div className={`p-3 rounded-lg border ${
                    isClinical ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}>
                    <span className="text-slate-500 block mb-1 uppercase text-[10px]">INITIALIZED</span>
                    <span className={`font-bold ${isClinical ? 'text-slate-800' : 'text-slate-300'}`}>{new Date(activeProject.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Direct Action Navigation */}
                <div className="flex flex-wrap gap-2 pt-2 text-xs font-mono uppercase font-bold">
                  <button
                    onClick={() => onTabChange('upload')}
                    className={`px-4 py-2 rounded transition cursor-pointer ${
                      isClinical
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                    }`}
                  >
                    Upload Dataset
                  </button>
                  <button
                    onClick={() => onTabChange('quantum')}
                    className={`px-4 py-2 border rounded transition cursor-pointer ${
                      isClinical
                        ? 'border-slate-300 hover:bg-slate-50 text-slate-700 font-bold'
                        : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-white'
                    }`}
                  >
                    Run Quantum Simulator
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Warning: Are you sure you want to delete Project "${activeProject.name}" and all of its diagnostic runs? This cannot be undone.`)) {
                        deleteProject(activeProject.id);
                      }
                    }}
                    className="px-4 py-2 text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/25 rounded transition cursor-pointer ml-auto"
                  >
                    Delete Project
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <p className="text-slate-500 text-xs font-mono">NO RESEARCH ENVIRONMENT LOADED</p>
                <button
                  onClick={() => onTabChange('dashboard')}
                  className="px-3.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-300 text-xs font-mono uppercase rounded hover:border-slate-700 cursor-pointer"
                >
                  Create a New Project Context in the Sidebar
                </button>
              </div>
            )}
          </div>

          {/* Core Accuracy Performance Trend */}
          <div className={`p-6 rounded-2xl border space-y-4 ${
            isClinical
              ? 'bg-white border-slate-200 text-slate-800'
              : 'bg-slate-950 border-slate-900 text-white'
          }`}>
            <h3 className="text-sm font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-purple-400" /> Genomic Accuracy Evolution
            </h3>
            {performanceHistory.length > 0 ? (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performanceHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#475569" fontSize={10} fontFamily="monospace" />
                    <YAxis stroke="#475569" domain={[70, 100]} fontSize={10} fontFamily="monospace" />
                    <Tooltip contentStyle={{ backgroundColor: isClinical ? '#ffffff' : '#0f172a', border: isClinical ? '1px solid #cbd5e1' : '1px solid #1e293b', labelStyle: { color: '#10b981' } }} labelStyle={{ fontFamily: 'monospace', color: '#10b981' }} />
                    <Area type="monotone" dataKey="accuracy" stroke="#10b981" fillOpacity={1} fill="url(#colorAcc)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-slate-600 text-xs font-mono py-6 text-center">Run classical AI or QML classifiers to generate metrics trend history.</p>
            )}
          </div>
        </div>

        {/* Right: Activity logs list */}
        <div className={`lg:col-span-5 flex flex-col p-6 rounded-2xl border h-[480px] ${
          isClinical
            ? 'bg-white border-slate-200 text-slate-800'
            : 'bg-slate-950 border-slate-900 text-white'
        }`}>
          <h3 className="text-sm font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2 mb-4 shrink-0">
            <Clock className="w-4 h-4 text-blue-400" /> Audit Log System
          </h3>
          <div className="flex-1 overflow-y-auto pr-1 space-y-3">
            {activityLogs.length > 0 ? (
              activityLogs.map(log => (
                <div key={log.id} className={`p-3 border rounded-xl space-y-1 ${
                  isClinical
                    ? 'border-slate-100 bg-slate-50/50 text-slate-700'
                    : 'border-slate-900 bg-slate-900/20 text-slate-300'
                }`}>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={`uppercase font-bold ${getLogColor(log.type)}`}>{log.type}</span>
                    <span className="text-slate-600">{new Date(log.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className={`text-xs font-sans leading-snug ${isClinical ? 'text-slate-700 font-medium' : 'text-slate-300'}`}>{log.description}</p>
                  {log.details && <p className="text-[10px] font-mono text-slate-500 truncate">{log.details}</p>}
                </div>
              ))
            ) : (
              <p className="text-slate-600 text-xs font-mono text-center py-12">No activity events recorded.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
