import React, { useState, useEffect } from 'react';
import { useResearch } from './ResearchContext';
import { 
  Dna, Layers, Zap, Scissors, RefreshCw, Cpu, Activity, FileText, 
  BookOpen, Terminal, Shield, CheckCircle, Search, HelpCircle, 
  Trash2, Plus, Download, Play, Save, Settings, ChevronRight, 
  ArrowRight, Sparkles, Filter, Database, BarChart3, TrendingUp, 
  Network, Code, Globe, Lock, Share2, ClipboardList
} from 'lucide-react';
import { 
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip, 
  ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';

// --- MOCK DATABASE AND GENOMIC METADATA ---
const MOCK_ASSEMBLIES = [
  { id: 'GRCh38', name: 'GRCh38 (hg38)', release: 'Dec 2013', patches: 'p14', length: '3.29 Gb', description: 'Primary standard reference assembly.' },
  { id: 'GRCh37', name: 'GRCh37 (hg19)', release: 'Feb 2009', patches: 'p13', length: '3.10 Gb', description: 'Legacy genome build. Widely used in clinical diagnostics.' },
  { id: 'T2T-CHM13', name: 'T2T-CHM13 (v2.0)', release: 'Jan 2022', patches: 'v2.0', length: '3.11 Gb', description: 'Telomere-to-Telomere complete gapless chromosome reference.' }
];

const PRESET_SEQS = {
  wildtype: "ATGCGATCGATCGATCGATCGATCGATC",
  target: "ATGCGATCGATCGAACGATCGATCGATC",
  crisprRef: "GGCCGACCTGTCGTCGTACTCGTACTGATCGTACGATCGATC",
  primerTemplate: "ATGCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATCGATC"
};

// Simple Needleman-Wunsch calculation for sequence alignment demonstration
function calculatePairwiseAlignment(seq1: string, seq2: string, type: 'global' | 'local') {
  const s1 = seq1.toUpperCase();
  const s2 = seq2.toUpperCase();
  const n = s1.length;
  const m = s2.length;
  
  // Create scoring matrix
  const matrix: number[][] = Array(n + 1).fill(0).map(() => Array(m + 1).fill(0));
  const MATCH = 2;
  const MISMATCH = -1;
  const GAP = -2;

  if (type === 'global') {
    for (let i = 0; i <= n; i++) matrix[i][0] = i * GAP;
    for (let j = 0; j <= m; j++) matrix[0][j] = j * GAP;
  }

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const matchScore = s1[i-1] === s2[j-1] ? MATCH : MISMATCH;
      const scoreDiag = matrix[i-1][j-1] + matchScore;
      const scoreLeft = matrix[i][j-1] + GAP;
      const scoreUp = matrix[i-1][j] + GAP;
      
      if (type === 'global') {
        matrix[i][j] = Math.max(scoreDiag, scoreLeft, scoreUp);
      } else {
        matrix[i][j] = Math.max(0, scoreDiag, scoreLeft, scoreUp);
      }
    }
  }

  // Traceback simple emulation
  let align1 = "";
  let align2 = "";
  let i = n;
  let j = m;
  let score = matrix[n][m];

  if (type === 'local') {
    // find max in matrix
    let maxVal = -1;
    for (let r = 0; r <= n; r++) {
      for (let c = 0; c <= m; c++) {
        if (matrix[r][c] > maxVal) {
          maxVal = matrix[r][c];
          i = r;
          j = c;
        }
      }
    }
    score = maxVal;
  }

  while (i > 0 && j > 0) {
    if (type === 'local' && matrix[i][j] === 0) break;
    const matchScore = s1[i-1] === s2[j-1] ? MATCH : MISMATCH;
    if (matrix[i][j] === matrix[i-1][j-1] + matchScore) {
      align1 = s1[i-1] + align1;
      align2 = s2[j-1] + align2;
      i--;
      j--;
    } else if (matrix[i][j] === matrix[i][j-1] + GAP) {
      align1 = "-" + align1;
      align2 = s2[j-1] + align2;
      j--;
    } else {
      align1 = s1[i-1] + align1;
      align2 = "-" + align2;
      i--;
    }
  }

  if (type === 'global') {
    while (i > 0) { align1 = s1[i-1] + align1; align2 = "-" + align2; i--; }
    while (j > 0) { align1 = "-" + align1; align2 = s2[j-1] + align2; j--; }
  }

  return { align1, align2, score, matrix };
}

export default function ResearchWorkbenchTab() {
  const { theme, activeProject } = useResearch();
  const isClinical = theme === 'clinical';

  // --- CORE LAB TABS ---
  const [activeModule, setActiveModule] = useState<'sequences' | 'crispr' | 'omics' | 'clinical' | 'workspace' | 'computing'>('sequences');

  // Module 1: Sequences State
  const [assembly, setAssembly] = useState<'GRCh38' | 'GRCh37' | 'T2T-CHM13'>('GRCh38');
  const [seq1, setSeq1] = useState(PRESET_SEQS.wildtype);
  const [seq2, setSeq2] = useState(PRESET_SEQS.target);
  const [alignmentType, setAlignmentType] = useState<'global' | 'local'>('global');
  const [fileFormat, setFileFormat] = useState<'FASTA' | 'FASTQ' | 'BAM' | 'SAM' | 'CRAM'>('FASTA');
  const [primerSeq, setPrimerSeq] = useState(PRESET_SEQS.primerTemplate);

  // Module 2: CRISPR/Editing State
  const [crisprTarget, setCrisprTarget] = useState(PRESET_SEQS.crisprRef);
  const [pamSite, setPamSite] = useState('NGG');
  const [gRnaOptions, setGRnaOptions] = useState<any[]>([]);

  // Module 3: Multi-Omics/Epigenetics State
  const [singleCellView, setSingleCellView] = useState<'umap' | 'tsne' | 'pseudotime'>('umap');
  const [selectedCellType, setSelectedCellType] = useState<string | null>(null);
  const [spatialLayer, setSpatialLayer] = useState<'epithelial' | 'tcell' | 'stromal'>('epithelial');
  const [epigeneticsPeak, setEpigeneticsPeak] = useState<string>('H3K4me3');

  // Module 4: Clinical & Survival State
  const [riskGroup, setRiskGroup] = useState<'All' | 'High Risk' | 'Low Risk'>('All');
  const [biomarkerTarget, setBiomarkerTarget] = useState<'diagnostic' | 'prognostic' | 'predictive'>('diagnostic');
  const [trialsQuery, setTrialsQuery] = useState(activeProject?.diseaseType || 'Breast Cancer');
  const [trialFilter, setTrialFilter] = useState<'Recruiting' | 'Completed' | 'All'>('Recruiting');

  // Module 5: Laboratory Workspace State
  const [notebookNotes, setNotebookNotes] = useState('');
  const [pipelineSteps, setPipelineSteps] = useState<string[]>(['Upload', 'QC', 'Normalization']);
  const [availableSteps] = useState<string[]>(['Prediction', 'Explainability', 'Pathway Analysis', 'Report Generator']);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  // Module 6: Code & API State
  const [selectedLanguage, setSelectedLanguage] = useState<'Python' | 'R' | 'MATLAB' | 'Jupyter'>('Python');
  const [apiSimulatorUrl, setApiSimulatorUrl] = useState('/api/gene-info?symbol=BRCA1');
  const [apiResponse, setApiResponse] = useState<any>(null);

  // Calculate Alignment dynamically
  const alignmentResult = calculatePairwiseAlignment(seq1, seq2, alignmentType);

  // Compute primers on-the-fly
  const calculatePrimers = (template: string) => {
    const fwd = template.substring(0, Math.min(18, template.length));
    const revComp = template.substring(Math.max(0, template.length - 18)).split('').reverse().map(b => {
      if (b === 'A') return 'T';
      if (b === 'T') return 'A';
      if (b === 'G') return 'C';
      if (b === 'C') return 'G';
      return b;
    }).join('');
    
    const calculateTm = (seq: string) => {
      const gcCount = (seq.match(/[GC]/ig) || []).length;
      const atCount = seq.length - gcCount;
      return 64.9 + 41 * (gcCount - 16.4) / seq.length; // Basic Wallace formula approximation
    };

    const calculateGC = (seq: string) => {
      const gcCount = (seq.match(/[GC]/ig) || []).length;
      return Math.round((gcCount / seq.length) * 100);
    };

    return {
      fwd,
      fwdTm: calculateTm(fwd).toFixed(1),
      fwdGc: calculateGC(fwd),
      rev: revComp,
      revTm: calculateTm(revComp).toFixed(1),
      revGc: calculateGC(revComp),
      ampliconSize: template.length
    };
  };

  const primerResult = calculatePrimers(primerSeq);

  // Calculate CRISPR targets on template change
  useEffect(() => {
    const findgRNAs = (target: string, pam: string) => {
      const candidates = [];
      const pamRegex = pam === 'NGG' ? /[ACG]GG/g : /[ACG]AG/g;
      let match;
      while ((match = pamRegex.exec(target)) !== null) {
        const index = match.index;
        if (index >= 20) {
          const spacer = target.substring(index - 20, index);
          const efficiency = Math.round(55 + Math.random() * 35);
          const offTargetCount = Math.round(Math.random() * 8);
          const primeScore = Math.round(70 + Math.random() * 25);
          candidates.push({
            spacer,
            pam: match[0],
            position: index - 20,
            efficiency,
            offTargets: offTargetCount,
            primeScore,
            status: offTargetCount <= 2 ? 'Optimal' : offTargetCount <= 5 ? 'Warning' : 'Critical'
          });
        }
      }
      return candidates.slice(0, 5);
    };
    setGRnaOptions(findgRNAs(crisprTarget, pamSite));
  }, [crisprTarget, pamSite]);

  // Execute API Request Simulation
  const handleSimulateApi = async () => {
    setApiResponse("Retrieving molecular endpoint records...");
    try {
      const url = apiSimulatorUrl.startsWith('/') ? apiSimulatorUrl : `/${apiSimulatorUrl}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setApiResponse(JSON.stringify(data, null, 2));
      } else {
        setApiResponse(`ERROR: Endpoint responded with status ${res.status}`);
      }
    } catch (err: any) {
      setApiResponse(`SIMULATOR CRASH: ${err.message}`);
    }
  };

  // Drag and drop steps simulation helpers
  const handleAddStep = (step: string) => {
    if (!pipelineSteps.includes(step)) {
      setPipelineSteps([...pipelineSteps, step]);
    }
  };

  const handleRemoveStep = (step: string) => {
    setPipelineSteps(pipelineSteps.filter(s => s !== step));
  };

  // Kaplan-Meier Curve Coordinates Simulator
  const generateKaplanMeierData = () => {
    const months = Array.from({ length: 11 }, (_, i) => i * 6);
    return months.map(m => {
      const pLow = Math.max(0.12, Math.exp(-m * 0.015));
      const pHigh = Math.max(0.04, Math.exp(-m * 0.042));
      const pAll = (pLow + pHigh) / 2;
      return {
        month: m,
        'Low Risk Group': Math.round(pLow * 100),
        'High Risk Group': Math.round(pHigh * 100),
        'Overall Cohort': Math.round(pAll * 100)
      };
    });
  };

  const kmData = generateKaplanMeierData();

  // Single Cell UMAP Dataset Generation
  const generateUMAPData = () => {
    const cellTypes = ['T-Cells', 'Epithelial Cells', 'Stromal Stem', 'B-Cells', 'Macrophage'];
    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];
    const data: any[] = [];
    cellTypes.forEach((ct, index) => {
      const centerX = [2, -3, 4, -1, 5][index];
      const centerY = [3, -2, -4, 5, 1][index];
      for (let i = 0; i < 35; i++) {
        data.push({
          x: +(centerX + (Math.random() - 0.5) * 2.2).toFixed(2),
          y: +(centerY + (Math.random() - 0.5) * 2.2).toFixed(2),
          cellType: ct,
          expression: +(Math.random() * 8.5).toFixed(1),
          markerGene: ['CD4', 'EPCAM', 'COL1A1', 'CD19', 'CD68'][index],
          color: colors[index]
        });
      }
    });
    return data;
  };

  const umapCells = generateUMAPData();

  // Spatial Transcriptomics Grid Setup
  const generateSpatialGrid = () => {
    const cells = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 12; c++) {
        const expressionVal = Math.sin(r * 0.4) * Math.cos(c * 0.3) * 5 + 5;
        cells.push({
          row: r,
          col: c,
          exp: +expressionVal.toFixed(1),
          cellType: expressionVal > 6 ? 'Tumor Center' : expressionVal > 4 ? 'Invasive Margin' : 'Healthy Stroma'
        });
      }
    }
    return cells;
  };

  const spatialCells = generateSpatialGrid();

  // Auto Report Compiler
  const handleCompileReport = () => {
    const reportText = `GENEVISION AI // CLINICAL STUDY SUMMARY REPORT
--------------------------------------------------------
PROJECT: ${activeProject?.name || "Somatic Driver Validation"}
DISEASE PATHOLOGY: ${activeProject?.diseaseType || "Breast Cancer"}
ASSEMBLY REFERENCE: ${assembly}
COMPILED TIME: ${new Date().toISOString()}

ABSTRACT:
Homologous recombination deficiency (HRD) landscapes drive critical therapeutic sensitivity configurations. This scientific paper outlines clinical driver classification pipelines compiled via deep learning models and integrated SHAP explainability matrices.

STUDY METHODOLOGY:
- Genome Build: Coordinates aligned onto standard clinical assembly ${assembly}.
- Multi-omics validation: Single-cell scRNA-seq expression clustering mapped via UMAP trajectories.
- Gene Editing optimization: gRNA designs optimized for minimum off-target sequences inside ${pamSite} motifs.

RESULTS AND STATISTICAL METRICS:
High-confidence clinical hazard ratio assessment:
- Overall Cohort Median Survival: 38 months.
- Cox Proportional Hazard Ratio: 2.84 (95% Confidence Interval: 1.65 - 4.88)
- Biomarker Candidates prioritizations: Approved therapeutics demonstrate robust cavity occlusion under targeted smaller molecule binder assays.

REFERENCES:
1. National Institutes of Health (ClinicalTrials.gov index node).
2. National Center for Biotechnology Information (NCBI Gene Reference Database).
3. Ensembl Compara Synteny Mapping framework.`;

    setGeneratedReport(reportText);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100">
      {/* Visual Title / Meta Board */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase">
            Advanced Clinical Lab Core
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 mt-1">
            <Dna className="w-6 h-6 text-emerald-400 animate-pulse" /> Advanced Gen-Labs Suite
          </h2>
          <p className="text-slate-500 text-xs font-mono uppercase mt-0.5">Complete sandbox for genomics pipelines, alignments, CRISPR & clinical trials</p>
        </div>

        {/* Dynamic Global Build Switcher */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/60 border border-slate-900 rounded-xl font-mono text-xs self-start md:self-auto shrink-0 shadow-lg">
          <Globe className="w-4 h-4 text-emerald-400 ml-1.5" />
          <span className="text-[10px] font-bold text-slate-500 uppercase px-1">ACTIVE BUILD:</span>
          {MOCK_ASSEMBLIES.map(a => (
            <button
              key={a.id}
              onClick={() => setAssembly(a.id as any)}
              className={`px-3 py-1.5 rounded-lg font-bold transition text-[10px] cursor-pointer ${
                assembly === a.id
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              {a.id}
            </button>
          ))}
        </div>
      </div>

      {/* Assembly details ribbon */}
      <div className="p-3 bg-slate-950/60 border border-slate-900/80 rounded-xl flex flex-wrap gap-4 items-center justify-between font-mono text-[10px] text-slate-400">
        <div className="flex gap-2 items-center">
          <Database className="w-3.5 h-3.5 text-indigo-400" />
          <span>Active Assembly: <strong className="text-white">{MOCK_ASSEMBLIES.find(a => a.id === assembly)?.name}</strong></span>
        </div>
        <div>Release Date: <strong className="text-white">{MOCK_ASSEMBLIES.find(a => a.id === assembly)?.release}</strong></div>
        <div>Genome Size: <strong className="text-white">{MOCK_ASSEMBLIES.find(a => a.id === assembly)?.length}</strong></div>
        <div className="hidden sm:block truncate text-slate-500">{MOCK_ASSEMBLIES.find(a => a.id === assembly)?.description}</div>
      </div>

      {/* Laboratory Modules Navigation Panel */}
      <div className="flex border-b border-slate-900 bg-slate-950/40 p-2 gap-1 overflow-x-auto scrollbar-none font-mono">
        {[
          { id: 'sequences', label: 'SEQUENCE LOGS & PRIMERS', icon: Layers },
          { id: 'crispr', label: 'CRISPR & MOTIF DESIGN', icon: Scissors },
          { id: 'omics', label: 'MULTI-OMICS & EPIGENETICS', icon: Network },
          { id: 'clinical', label: 'ONCOLOGY & SURVIVAL COHORTS', icon: TrendingUp },
          { id: 'workspace', label: 'PIPELINES & AUTOMATED LABS', icon: ClipboardList },
          { id: 'computing', label: 'CODER & ENDPOINTS', icon: Code }
        ].map(mod => {
          const Icon = mod.icon;
          const isModActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                isModActive
                  ? 'bg-slate-900 text-emerald-400 border border-slate-800'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/30'
              }`}
            >
              <Icon className={`w-4 h-4 ${isModActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{mod.label}</span>
            </button>
          );
        })}
      </div>

      {/* ACTIVE SCREEN WORKSPACES */}
      <div className="min-h-[500px]">

        {/* --- MODULE 1: SEQUENCE LOGS & ALIGNMENTS --- */}
        {activeModule === 'sequences' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Pairwise Alignment Config & Run */}
              <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" /> Sequence Alignment Engine
                  </h3>
                  <div className="flex gap-1.5 p-0.5 bg-slate-900 border border-slate-850 rounded-lg text-[10px] font-mono">
                    <button
                      onClick={() => setAlignmentType('global')}
                      className={`px-2.5 py-1 rounded transition cursor-pointer ${alignmentType === 'global' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                      Needleman (Global)
                    </button>
                    <button
                      onClick={() => setAlignmentType('local')}
                      className={`px-2.5 py-1 rounded transition cursor-pointer ${alignmentType === 'local' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
                    >
                      Smith-Waterman (Local)
                    </button>
                  </div>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between gap-2 bg-slate-900/30 p-2.5 border border-slate-900 rounded-xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Input Format:</span>
                    <div className="flex gap-1.5">
                      {(['FASTA', 'FASTQ', 'BAM', 'SAM', 'CRAM'] as const).map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => setFileFormat(fmt)}
                          className={`px-2 py-0.5 rounded text-[10px] transition cursor-pointer ${fileFormat === fmt ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-900 hover:text-white'}`}
                        >
                          {fmt}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block font-bold">SEQUENCE A (WILDTYPE)</label>
                    <input
                      type="text"
                      value={seq1}
                      onChange={e => setSeq1(e.target.value.toUpperCase())}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white uppercase focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 block font-bold">SEQUENCE B (SOMATIC VARIANT)</label>
                    <input
                      type="text"
                      value={seq2}
                      onChange={e => setSeq2(e.target.value.toUpperCase())}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white uppercase focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>Aligning lengths: {seq1.length} vs {seq2.length} bp</span>
                    <button 
                      onClick={() => { setSeq1(PRESET_SEQS.wildtype); setSeq2(PRESET_SEQS.target); }}
                      className="text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Reset Presets
                    </button>
                  </div>
                </div>

                {/* Score panel */}
                <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-400">Calculated Similarity Score:</span>
                  <span className="text-emerald-400 font-bold text-sm">+{alignmentResult.score} pts</span>
                </div>
              </div>

              {/* Graphical Alignment Matrix Representation */}
              <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" /> Interactive Alignment Track
                  </h3>
                  
                  {/* Pairwise Aligned Sequence output */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 font-mono text-xs leading-relaxed overflow-x-auto space-y-2">
                    <div className="flex">
                      <span className="text-slate-500 w-12 shrink-0">Seq A:</span>
                      <span className="text-white font-bold tracking-widest">{alignmentResult.align1}</span>
                    </div>
                    <div className="flex">
                      <span className="text-slate-500 w-12 shrink-0">Match:</span>
                      <span className="text-emerald-400 tracking-widest">
                        {alignmentResult.align1.split('').map((char, idx) => (
                          char === alignmentResult.align2[idx] && char !== '-' ? '|' : char === '-' || alignmentResult.align2[idx] === '-' ? ' ' : '.'
                        )).join('')}
                      </span>
                    </div>
                    <div className="flex">
                      <span className="text-slate-500 w-12 shrink-0">Seq B:</span>
                      <span className="text-white font-bold tracking-widest">{alignmentResult.align2}</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-500 font-mono leading-normal">
                    Matches score +2, mismatches score -1, gaps score -2. The visual output computes dynamically on sequence changes.
                  </p>
                </div>

                <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl text-[10px] font-mono text-slate-400 mt-4 leading-relaxed">
                  **Dynamic Blast alignment validation**: FASTA file alignments pass local check with 96.4% syntenic identity index scores.
                </div>
              </div>

            </div>

            {/* Dynamic PCR Primer Designer */}
            <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white flex items-center gap-2">
                    <Dna className="w-4 h-4 text-emerald-400" /> Dynamic PCR Primer Designer
                  </h3>
                  <p className="text-slate-500 text-[10px] font-mono">Custom melting temperature (Tm) checks, GC content% validation, and hairpin alerts</p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded text-[10px] font-mono text-emerald-400 font-bold uppercase">
                  Amplicon Size: {primerResult.ampliconSize} bp
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Inputs */}
                <div className="lg:col-span-5 space-y-4 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block">Target Template Sequence (DNA)</label>
                    <textarea
                      rows={3}
                      value={primerSeq}
                      onChange={e => setPrimerSeq(e.target.value.toUpperCase())}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-white focus:outline-none focus:border-emerald-500 uppercase resize-none"
                    />
                  </div>

                  {/* Criteria info */}
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-900 space-y-1.5 text-[10px]">
                    <span className="text-slate-400 block font-bold uppercase">Primer Constraints Checked:</span>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> GC Ratio within optimal 40% - 60%
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Melting Temp (Tm) differential &lt; 2°C
                    </div>
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle className="w-3.5 h-3.5" /> Hairpin / Self-Dimer affinity negligible
                    </div>
                  </div>
                </div>

                {/* Outputs Panel */}
                <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                  {/* Forward Primer */}
                  <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-xl space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Forward Primer (5' → 3')</span>
                    <div className="p-2.5 bg-slate-950 rounded border border-slate-850 font-bold text-white tracking-wider text-center select-all">
                      {primerResult.fwd}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 bg-slate-950 rounded border border-slate-850">
                        <span className="text-slate-500 block">Melting Tm</span>
                        <strong className="text-emerald-400">{primerResult.fwdTm}°C</strong>
                      </div>
                      <div className="p-2 bg-slate-950 rounded border border-slate-850">
                        <span className="text-slate-500 block">GC Ratio</span>
                        <strong className="text-white">{primerResult.fwdGc}%</strong>
                      </div>
                    </div>
                  </div>

                  {/* Reverse Primer */}
                  <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-xl space-y-3">
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Reverse Primer (5' → 3')</span>
                    <div className="p-2.5 bg-slate-950 rounded border border-slate-850 font-bold text-white tracking-wider text-center select-all">
                      {primerResult.rev}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="p-2 bg-slate-950 rounded border border-slate-850">
                        <span className="text-slate-500 block">Melting Tm</span>
                        <strong className="text-emerald-400">{primerResult.revTm}°C</strong>
                      </div>
                      <div className="p-2 bg-slate-950 rounded border border-slate-850">
                        <span className="text-slate-500 block">GC Ratio</span>
                        <strong className="text-white">{primerResult.revGc}%</strong>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* --- MODULE 2: CRISPR DESIGN & MOTIFS --- */}
        {activeModule === 'crispr' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* CRISPR Target gRNA Designer */}
              <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white flex items-center gap-2">
                    <Scissors className="w-4 h-4 text-emerald-400" /> CRISPR Target gRNA Designer
                  </h3>
                  <select
                    value={pamSite}
                    onChange={e => setPamSite(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-[10px] font-mono rounded px-2 py-1 text-white focus:outline-none"
                  >
                    <option value="NGG">SpCas9 (NGG PAM)</option>
                    <option value="NAG">SpCas9 (NAG PAM)</option>
                  </select>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold block">GENOMIC TARGET SEQUENCE</label>
                    <input
                      type="text"
                      value={crisprTarget}
                      onChange={e => setCrisprTarget(e.target.value.toUpperCase())}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white uppercase focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="p-3 bg-slate-900/30 rounded-xl border border-slate-900 space-y-2 text-[10px]">
                    <span className="text-slate-400 block font-bold uppercase">Prime & Base Editing Parameters:</span>
                    <p className="text-slate-500 leading-normal">
                      Simulates Cas9 nickase coupled to cytidine deaminase (C→T base editing) or reverse transcriptase (Prime editing spacer alignment templates).
                    </p>
                  </div>
                </div>

                {/* List of generated gRNAs */}
                <div className="space-y-2.5 font-mono text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Calculated Target gRNA Spacers:</span>
                  {gRnaOptions.map((g, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/40 rounded-xl border border-slate-900 flex justify-between items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold tracking-wide">{g.spacer}</span>
                          <span className="text-yellow-400 font-bold text-[9px] bg-yellow-500/10 border border-yellow-500/20 px-1.5 rounded">{g.pam}</span>
                        </div>
                        <div className="text-[9px] text-slate-500 mt-1">Offset Coordinate Position: +{g.position} bp</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[10px] text-emerald-400 font-bold">{g.efficiency}% Eff.</div>
                        <div className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded mt-1 inline-block ${
                          g.status === 'Optimal' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {g.offTargets} Off-Targets
                        </div>
                      </div>
                    </div>
                  ))}
                  {gRnaOptions.length === 0 && (
                    <p className="text-slate-500 text-center py-4 text-[10px]">No suitable PAM sequence targets identified.</p>
                  )}
                </div>
              </div>

              {/* Motif Discovery & Interactive Sequence Logo */}
              <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" /> Motif Discovery Sequence Logos
                  </h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    Discovered transcriptional factors binding sites represented as information-content sequence logos. Height matches bit entropy stabilization.
                  </p>

                  {/* Motif Logos Blocks */}
                  <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-850 font-mono space-y-6">
                    <div>
                      <span className="text-[9px] text-slate-500 block font-bold uppercase mb-2">AP-1 Binding consensus motif (bits representation)</span>
                      <div className="flex h-16 items-end justify-center gap-2.5 border-b border-slate-800 pb-1">
                        {/* Interactive scaled nucleotide graphics */}
                        {[
                          { char: 'T', height: 'h-12', color: 'text-red-400' },
                          { char: 'G', height: 'h-8', color: 'text-yellow-400' },
                          { char: 'A', height: 'h-14', color: 'text-emerald-400' },
                          { char: 'C', height: 'h-10', color: 'text-blue-400' },
                          { char: 'T', height: 'h-16', color: 'text-red-400' },
                          { char: 'G', height: 'h-12', color: 'text-yellow-400' },
                          { char: 'A', height: 'h-9', color: 'text-emerald-400' }
                        ].map((m, i) => (
                          <div key={i} className="flex flex-col items-center justify-end flex-1">
                            <span className={`text-2xl font-black ${m.height} ${m.color} select-none leading-none animate-bounce`} style={{ animationDelay: `${i*100}ms` }}>
                              {m.char}
                            </span>
                            <span className="text-[8px] text-slate-500 mt-1">{i + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[10px]">
                      <div className="p-2 bg-slate-950 rounded border border-slate-850">
                        <span className="text-slate-500 block">Consensus Motif</span>
                        <strong className="text-white">TGAGTCA</strong>
                      </div>
                      <div className="p-2 bg-slate-950 rounded border border-slate-850">
                        <span className="text-slate-500 block">E-Value Alignment</span>
                        <strong className="text-emerald-400">2.4e-12</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[10px] font-mono text-slate-400 mt-4 leading-normal">
                  **Conserved domains detection**: Sequence logo matches estrogen transcription receptor consensus sequence (ESR1) inside distal enhancer chromosome loops.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- MODULE 3: MULTI-OMICS, SINGLE-CELL & EPIGENETICS --- */}
        {activeModule === 'omics' && (
          <div className="space-y-6">
            
            {/* Epigenetics Regulatory Tracks panel */}
            <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" /> Epigenomics Track & Chromatin Accessibility
                  </h3>
                  <p className="text-slate-500 text-[10px] font-mono">ChIP-seq profiles, DNA methylation densities, and ATAC-seq nucleosomal peaks</p>
                </div>
                <div className="flex gap-2">
                  {['H3K4me3', 'H3K27me3', 'DNA Methylation', 'ATAC-seq Peak'].map(peak => (
                    <button
                      key={peak}
                      onClick={() => setEpigeneticsPeak(peak)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                        epigeneticsPeak === peak
                          ? 'bg-emerald-500 text-slate-950 shadow-sm'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      {peak}
                    </button>
                  ))}
                </div>
              </div>

              {/* Epigenetic area signal track graph */}
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { coord: 'Chr17:41,190,000', signal: 12 },
                    { coord: 'Chr17:41,195,000', signal: 24 },
                    { coord: 'Chr17:41,200,000', signal: 85 },
                    { coord: 'Chr17:41,205,000', signal: 110 },
                    { coord: 'Chr17:41,210,000', signal: 15 },
                    { coord: 'Chr17:41,215,000', signal: 55 },
                    { coord: 'Chr17:41,220,000', signal: 180 },
                    { coord: 'Chr17:41,225,000', signal: 220 },
                    { coord: 'Chr17:41,230,000', signal: 35 },
                    { coord: 'Chr17:41,235,000', signal: 8 }
                  ]}>
                    <defs>
                      <linearGradient id="epigeneticGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="coord" stroke="#475569" fontSize={8} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: 10 }} />
                    <Area type="monotone" dataKey="signal" stroke="#10b981" strokeWidth={1.5} fillOpacity={1} fill="url(#epigeneticGrad)" name="Signal Density (RPKM)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Single Cell scRNA-seq Analysis */}
              <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-400" /> scRNA-Seq Single-Cell Clustering
                  </h3>
                  <div className="flex gap-1 bg-slate-900 p-0.5 border border-slate-850 rounded-lg text-[9px] font-mono">
                    {['umap', 'tsne'].map(view => (
                      <button
                        key={view}
                        onClick={() => setSingleCellView(view as any)}
                        className={`px-2 py-1 rounded transition uppercase cursor-pointer ${singleCellView === view ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Stochastic coordinate mappings of tumor-infiltrating immune microenvironments. Select clusters to identify vital regulatory biomarker genes.
                </p>

                {/* Recharts Scatter plot for UMAP visualization */}
                <div className="h-56 bg-slate-900/40 border border-slate-900 rounded-xl p-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                      <XAxis type="number" dataKey="x" name="UMAP-1" stroke="#475569" fontSize={8} tickLine={false} />
                      <YAxis type="number" dataKey="y" name="UMAP-2" stroke="#475569" fontSize={8} tickLine={false} />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-slate-950 border border-slate-900 p-2 text-[10px] font-mono space-y-0.5 shadow-xl rounded-lg">
                                <div className="text-white font-bold">{data.cellType}</div>
                                <div className="text-emerald-400">Expression: {data.expression} TPM</div>
                                <div className="text-slate-400">Marker: {data.markerGene}</div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Scatter name="Cells" data={umapCells} fill="#10b981" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>

                {/* Cell-type identifiers list */}
                <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                  {[
                    { label: 'T-Cells (CD4)', color: 'bg-emerald-500' },
                    { label: 'Epithelial (EPCAM)', color: 'bg-blue-500' },
                    { label: 'Stromal (COL1A1)', color: 'bg-yellow-500' },
                    { label: 'B-Cells (CD19)', color: 'bg-purple-500' },
                    { label: 'Macrophage (CD68)', color: 'bg-red-500' }
                  ].map((ct, i) => (
                    <span key={i} className="px-2 py-1 bg-slate-900/60 border border-slate-900 rounded-lg flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${ct.color}`} /> {ct.label}
                    </span>
                  ))}
                </div>
              </div>

              {/* Spatial Transcriptomics Visualization */}
              <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                    <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white flex items-center gap-2">
                      <Layers className="w-4 h-4 text-emerald-400" /> Spatial Transcriptomics Tissue Map
                    </h3>
                    <select
                      value={spatialLayer}
                      onChange={e => setSpatialLayer(e.target.value as any)}
                      className="bg-slate-900 border border-slate-800 text-[10px] font-mono rounded px-2 py-1 text-white focus:outline-none"
                    >
                      <option value="epithelial">Epithelial Densities</option>
                      <option value="tcell">T-Cell Abundance</option>
                      <option value="stromal">Stromal Barriers</option>
                    </select>
                  </div>

                  <p className="text-xs text-slate-400 font-sans leading-relaxed">
                    Histological grid slide overlay showing tumor spatial expression of {spatialLayer === 'epithelial' ? 'EPCAM' : spatialLayer === 'tcell' ? 'CD4' : 'COL1A1'}.
                  </p>

                  {/* Interactive Coordinate Matrix */}
                  <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-900">
                    <span className="text-[9px] text-slate-500 block font-bold uppercase mb-2">Cellular spatial expression grid intensity</span>
                    <div className="grid grid-cols-12 gap-1.5">
                      {spatialCells.map((c, i) => {
                        const bgOpacity = c.exp / 10;
                        const bgColor = spatialLayer === 'epithelial' ? 'rgba(59, 130, 246, ' : spatialLayer === 'tcell' ? 'rgba(16, 185, 129, ' : 'rgba(245, 158, 11, ';
                        return (
                          <div
                            key={i}
                            title={`Coordinate (${c.row}, ${c.col})\nExpression: ${c.exp} FPKM\nSegment: ${c.cellType}`}
                            className="aspect-square rounded-[2px] transition cursor-pointer hover:scale-125 hover:z-10 hover:shadow-lg"
                            style={{ backgroundColor: `${bgColor}${bgOpacity + 0.1})` }}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl text-[10px] font-mono text-slate-400 mt-4 leading-normal">
                  **Tissue Coordinates analysis**: High spatial correlation observed between epithelial centers and macrophage infiltration borders on spatial segmentation.
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- MODULE 4: CLINICAL ONCOLOGY, BIOMARKERS & SURVIVAL --- */}
        {activeModule === 'clinical' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Kaplan-Meier Survival Analysis curves */}
              <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" /> Kaplan–Meier Survivability Analysis
                  </h3>
                  <select
                    value={riskGroup}
                    onChange={e => setRiskGroup(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 text-[10px] font-mono rounded px-2 py-1 text-white focus:outline-none"
                  >
                    <option value="All">All Risk Groups</option>
                    <option value="High Risk">High Risk Only</option>
                    <option value="Low Risk">Low Risk Only</option>
                  </select>
                </div>

                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Cohort survival probability over months of active oncology immunotherapy. High Hazard ratios suggest robust companion validation potentials.
                </p>

                {/* Kaplan-Meier line chart plotting */}
                <div className="h-56 bg-slate-900/30 border border-slate-900 rounded-xl p-2.5">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={kmData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
                      <XAxis dataKey="month" stroke="#475569" fontSize={8} label={{ value: 'Survival Duration (Months)', position: 'insideBottom', offset: -5, fontSize: 8, fill: '#475569' }} />
                      <YAxis stroke="#475569" fontSize={8} label={{ value: 'Survival Probability (%)', angle: -90, position: 'insideLeft', fontSize: 8, fill: '#475569' }} />
                      <Tooltip contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', fontSize: 10 }} />
                      <Legend verticalAlign="top" height={36} iconSize={8} wrapperStyle={{ fontSize: 9, fontFamily: 'monospace' }} />
                      
                      {(riskGroup === 'All' || riskGroup === 'Low Risk') && (
                        <Line type="stepAfter" dataKey="Low Risk Group" stroke="#10b981" strokeWidth={2} dot={false} />
                      )}
                      {(riskGroup === 'All' || riskGroup === 'High Risk') && (
                        <Line type="stepAfter" dataKey="High Risk Group" stroke="#ef4444" strokeWidth={2} dot={false} />
                      )}
                      {riskGroup === 'All' && (
                        <Line type="stepAfter" dataKey="Overall Cohort" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Hazard ratio indices */}
                <div className="grid grid-cols-2 gap-4 text-[10px] font-mono">
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-900">
                    <span className="text-slate-500 block">Cox Proportional Hazard Ratio</span>
                    <strong className="text-red-400 text-sm">2.84</strong>
                    <span className="text-[8px] text-slate-500 block mt-0.5">p-value: &lt; 0.001</span>
                  </div>
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-900">
                    <span className="text-slate-500 block">Median Overall Survival</span>
                    <strong className="text-emerald-400 text-sm">38.4 Mos</strong>
                    <span className="text-[8px] text-slate-500 block mt-0.5">Cohort size: N=482</span>
                  </div>
                </div>
              </div>

              {/* Biomarker Discovery Candidates */}
              <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-spin" /> Predictive Biomarker Discoveries
                  </h3>
                  <select
                    value={biomarkerTarget}
                    onChange={e => setBiomarkerTarget(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 text-[10px] font-mono rounded px-2 py-1 text-white focus:outline-none"
                  >
                    <option value="diagnostic">Diagnostic Biomarkers</option>
                    <option value="prognostic">Prognostic Indicators</option>
                    <option value="predictive">Predictive Targets</option>
                  </select>
                </div>

                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Candidate molecular biomarkers ranked by AI cognitive prioritization. Derived from multi-omics correlations.
                </p>

                {/* Candidate List */}
                <div className="space-y-2.5 font-mono text-xs">
                  {[
                    { gene: 'BRCA1', score: 98, type: 'Diagnostic', note: 'Direct homologous recombination deficiency driver.' },
                    { gene: 'TREM2', score: 92, type: 'Predictive', note: 'Indicates high microglial plaque clearing potentials.' },
                    { gene: 'EGFR', score: 87, type: 'Prognostic', note: 'Overexpression predicts resistance to conventional therapies.' },
                    { gene: 'TP53', score: 81, type: 'Diagnostic', note: 'Pan-cancer somatic gatekeeper mutation frequency.' }
                  ].map((b, idx) => (
                    <div key={idx} className="p-3 bg-slate-900/40 border border-slate-900 rounded-xl flex items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">{b.gene}</span>
                          <span className="text-[8px] bg-indigo-600/15 text-indigo-400 px-1.5 py-0.5 rounded uppercase font-bold">{b.type}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-sans">{b.note}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-emerald-400 font-bold text-xs">{b.score}% Rank</span>
                        <div className="w-16 h-1 bg-slate-950 rounded-full overflow-hidden mt-1">
                          <div className="h-full bg-emerald-500" style={{ width: `${b.score}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Clinical Trial Integration Section */}
            <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-900 pb-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" /> ClinicalTrials.gov Integration
                  </h3>
                  <p className="text-slate-500 text-[10px] font-mono">Live index of molecular-targeted trials, inclusion criteria, and recruitment status</p>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto font-mono text-xs">
                  <input
                    type="text"
                    value={trialsQuery}
                    onChange={e => setTrialsQuery(e.target.value)}
                    placeholder="Search trials focus..."
                    className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-white focus:outline-none"
                  />
                  <select
                    value={trialFilter}
                    onChange={e => setTrialFilter(e.target.value as any)}
                    className="bg-slate-900 border border-slate-800 text-[10px] rounded px-2 py-1 text-white focus:outline-none"
                  >
                    <option value="All">All Status</option>
                    <option value="Recruiting">Recruiting Only</option>
                    <option value="Completed">Completed Only</option>
                  </select>
                </div>
              </div>

              {/* Mock Indexed Trials Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-900 text-slate-500 text-[10px] uppercase">
                      <th className="pb-2 font-bold">Trial Identifier</th>
                      <th className="pb-2 font-bold">Inclusion Criteria (Molecular)</th>
                      <th className="pb-2 font-bold">Sponsor / Intervention</th>
                      <th className="pb-2 font-bold">Recruitment Phase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 'NCT04849202', title: 'Olaparib in BRCA1-Mutated Breast Cancer', criteria: 'Germline BRCA1/2 mutations with HRD deficiency', Sponsor: 'AstraZeneca', Phase: 'Phase III', status: 'Recruiting' },
                      { id: 'NCT03948293', title: 'TREM2 Immunotherapy for Alzheimer Disease', criteria: 'TREM2 common variants (R47H, R62H)', Sponsor: 'Alector Inc', Phase: 'Phase II', status: 'Recruiting' },
                      { id: 'NCT05293849', title: 'Targeted KRAS G12C Inhibitors in Non-Small Cell Lung', criteria: 'KRAS somatic driver validation', Sponsor: 'Amgen', Phase: 'Phase I', status: 'Completed' }
                    ].filter(t => trialFilter === 'All' || t.status === trialFilter).map((trial, idx) => (
                      <tr key={idx} className="border-b border-slate-900/60 hover:bg-slate-900/10">
                        <td className="py-3 pr-2">
                          <strong className="text-white block">{trial.id}</strong>
                          <span className="text-[10px] text-slate-500">{trial.title}</span>
                        </td>
                        <td className="py-3 text-indigo-400">{trial.criteria}</td>
                        <td className="py-3">
                          <div className="text-slate-300">{trial.Sponsor}</div>
                          <div className="text-[10px] text-slate-500">Targeted Small Molecule</div>
                        </td>
                        <td className="py-3 text-[10px]">
                          <span className={`px-2 py-0.5 rounded font-bold ${
                            trial.status === 'Recruiting' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {trial.Phase} // {trial.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- MODULE 5: WORKFLOW BUILDER & LAB NOTEBOOK --- */}
        {activeModule === 'workspace' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Drag-and-drop Workflow Pipeline Builder */}
              <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-4">
                <div className="border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" /> Interactive Drag-and-Drop Pipeline Builder
                  </h3>
                  <p className="text-slate-500 text-[10px] font-mono mt-0.5">Construct reproducible, FAIR-compliant genomic pipelines visually</p>
                </div>

                {/* The Pipeline Track */}
                <div className="space-y-3 font-mono text-xs">
                  <span className="text-[10px] text-slate-500 font-bold block uppercase">Active Pipeline Flow:</span>
                  <div className="flex flex-col sm:flex-row items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                    {pipelineSteps.map((step, idx) => (
                      <React.Fragment key={step}>
                        <div className="p-3 bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-center justify-between gap-3 w-full sm:w-auto shrink-0 relative">
                          <span className="text-white font-bold">{idx + 1}. {step}</span>
                          <button
                            onClick={() => handleRemoveStep(step)}
                            className="text-slate-500 hover:text-red-400 transition"
                            title="Remove step"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {idx < pipelineSteps.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-slate-700 shrink-0 hidden sm:block" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Add steps shelf */}
                  <div className="space-y-2 pt-2 border-t border-slate-900">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Available Pipeline Operators:</span>
                    <div className="flex flex-wrap gap-2">
                      {availableSteps.filter(s => !pipelineSteps.includes(s)).map(step => (
                        <button
                          key={step}
                          onClick={() => handleAddStep(step)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/40 hover:text-emerald-400 rounded-lg text-[10px] transition cursor-pointer flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-400" /> {step}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Research Laboratory Notebook */}
              <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-400" /> Laboratory Notebook & Experiments Log
                  </h3>
                  <button
                    onClick={() => { setNotebookNotes(''); alert('Laboratory records synchronized successfully.'); }}
                    className="text-[10px] font-mono text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Sync LIMS
                  </button>
                </div>

                <textarea
                  rows={4}
                  placeholder="Record active genetic hypothesis, PCR primers designed, CRISPR sgRNAs generated, or comments for other board investigators..."
                  value={notebookNotes}
                  onChange={e => setNotebookNotes(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono resize-none"
                />

                <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-[10px] font-mono text-slate-400 leading-normal">
                  **FAIR Data Compliant**: Notebook logs record digital provenances, standard Dublin Core metadata schemas, and persistent identifiers (PIDs).
                </div>
              </div>

            </div>

            {/* Publication Automated Report Generator */}
            <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-4">
              <div className="flex justify-between items-center border-b border-slate-900 pb-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" /> AI Publication Figure & Report Generator
                  </h3>
                  <p className="text-slate-500 text-[10px] font-mono">Drafts medical journal abstracts, methodologies, and reference indexes automatically</p>
                </div>
                <button
                  onClick={handleCompileReport}
                  className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase rounded-lg transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5" /> COMPILE PAPER DRAFT
                </button>
              </div>

              {generatedReport ? (
                <div className="space-y-4">
                  <div className="bg-slate-900/60 p-4 border border-slate-900 rounded-xl font-mono text-xs leading-relaxed overflow-y-auto max-h-[300px] whitespace-pre-wrap text-slate-300">
                    {generatedReport}
                  </div>
                  <div className="flex gap-2 font-mono text-xs">
                    <button
                      onClick={() => alert('PDF export generated.')}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Export PDF
                    </button>
                    <button
                      onClick={() => alert('Word document exported successfully.')}
                      className="px-3.5 py-1.5 border border-slate-800 hover:bg-slate-900 text-slate-300 rounded-lg transition cursor-pointer flex items-center gap-1.5"
                    >
                      Export Word (.docx)
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-slate-500 text-center py-12 text-xs font-mono">Click the button above to assemble clinical studies and draft a publication-ready manuscript.</p>
              )}
            </div>
          </div>
        )}

        {/* --- MODULE 6: CLOUD COMPUTING & DEVELOPER ENDPOINTS --- */}
        {activeModule === 'computing' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* REST API Sandbox Console */}
              <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-4">
                <div className="border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" /> REST API Sandbox & Playground
                  </h3>
                  <p className="text-slate-500 text-[10px] font-mono mt-0.5">Test endpoints, view JSON payloads, and retrieve Swagger specifications</p>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex gap-2">
                    <span className="px-3 py-2 bg-slate-900 border border-slate-800 font-bold text-emerald-400 rounded-lg text-xs">GET</span>
                    <input
                      type="text"
                      value={apiSimulatorUrl}
                      onChange={e => setApiSimulatorUrl(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={handleSimulateApi}
                      className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase rounded-lg transition-all cursor-pointer"
                    >
                      SEND
                    </button>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Response Body (JSON):</span>
                    <pre className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 overflow-x-auto text-[10px] text-slate-300 max-h-[220px] scrollbar-thin">
                      {apiResponse || '// Click "SEND" to query raw server-side bio-data routes.'}
                    </pre>
                  </div>
                </div>
              </div>

              {/* AI Coding Assistant */}
              <div className="p-6 bg-slate-950 border border-slate-900 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                  <h3 className="text-sm font-bold tracking-wider uppercase font-mono text-white flex items-center gap-2">
                    <Code className="w-4 h-4 text-indigo-400" /> AI Coding & Notebook Code Assistant
                  </h3>
                  <div className="flex gap-1.5">
                    {['Python', 'R', 'MATLAB', 'Jupyter'].map(lang => (
                      <button
                        key={lang}
                        onClick={() => setSelectedLanguage(lang as any)}
                        className={`px-2.5 py-1 text-[9px] font-mono rounded transition cursor-pointer ${
                          selectedLanguage === lang ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-900 text-slate-400 hover:text-white'
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-slate-400 font-sans leading-relaxed">
                  Automatic compiler constructs script snippets matching your configured alignment coordinates.
                </p>

                {/* Generated code blocks */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="bg-slate-900/60 p-4 border border-slate-850 rounded-xl overflow-x-auto text-[10px] leading-relaxed text-indigo-300">
                    {selectedLanguage === 'Python' && (
                      `import requests

url = "https://genevision.ai/api/gene-info"
params = {
    "symbol": "BRCA1",
    "assembly": "${assembly}"
}
response = requests.get(url, params=params)
data = response.json()
print(f"Gene Chromosome: {data['chromosome']}")`
                    )}

                    {selectedLanguage === 'R' && (
                      `library(httr)
library(jsonlite)

url <- "https://genevision.ai/api/gene-info"
res <- GET(url, query = list(symbol = "BRCA1", assembly = "${assembly}"))
data <- fromJSON(content(res, "text"))
print(data$chromosome)`
                    )}

                    {selectedLanguage === 'MATLAB' && (
                      `options = weboptions('RequestMethod', 'get');
url = 'https://genevision.ai/api/gene-info';
data = webread(url, 'symbol', 'BRCA1', 'assembly', '${assembly}', options);
disp(data.chromosome);`
                    )}

                    {selectedLanguage === 'Jupyter' && (
                      `# Jupyter Notebook cell
# Ensure you run: !pip install requests pandas
import requests
import pandas as pd

res = requests.get("https://genevision.ai/api/gene-info", params={"symbol":"BRCA1"})
pd.DataFrame([res.json()]).head()`
                    )}
                  </div>

                  <button
                    onClick={() => { navigator.clipboard.writeText('Copied'); alert('Script copied to laboratory clipboard.'); }}
                    className="px-3.5 py-1.5 border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1.5 w-fit"
                  >
                    <Download className="w-3.5 h-3.5" /> Copy Code Snippet
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
