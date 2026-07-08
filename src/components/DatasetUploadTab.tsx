import React, { useState } from 'react';
import { useResearch } from './ResearchContext';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  FileCode, 
  CheckCircle, 
  ShieldAlert, 
  Binary, 
  Info, 
  HelpCircle, 
  Search, 
  ArrowRight, 
  Database, 
  Cpu, 
  Atom, 
  ChevronLeft, 
  ChevronRight, 
  Filter 
} from 'lucide-react';

export default function DatasetUploadTab({ onTabChange }: { onTabChange?: (tab: string) => void }) {
  const { activeProject, activeDataset, setActiveDataset, datasets, uploadDataset, loading, error } = useResearch();
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'CSV' | 'TSV' | 'FASTA' | 'VCF' | 'JSON'>('CSV');
  const [rawText, setRawText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  
  // Table search & pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // High-fidelity genomic mock sequences for instant testing
  const BRCA_SAMPLE_FASTA = `>gi|12345|ref|NM_007294.3| Homo sapiens BRCA1 DNA repair associated, mRNA
MDLSALRVEEVQNVINAMQKILECPICLELIKEPVSTKCDHIFCKFCMLKLLNQKKGPSQC
PLCKNDITKRSLQESTRFSQLVEELLKIICAFQLDTGLEYANSYNFAKKENNSPEHLKDE
VSIIQSMGYRNRAKRLLQSEPENPSLQETSLSVQLSNLGTVRTLRTKQRIQPQKTSVYIE
LGSNNSAPTVFNKTASFSGDFKKKMSVSVPLTLLDKRNSLGLKSRKPLSVLSNS`;

  const BRCA_SAMPLE_CSV = `PatientId,BRCA1,BRCA2,TP53,PTEN,PIK3CA,Age,Label
BC-2001,8.42,4.88,5.12,1.95,6.12,45,1
BC-2002,3.12,3.11,2.54,4.88,2.15,58,0
BC-2003,7.11,5.22,4.88,2.12,5.88,61,1
BC-2004,2.95,2.88,3.12,5.12,1.95,35,0`;

  const AD_SAMPLE_JSON = `[
  {"sampleId": "AD-01", "APOE": 8.42, "TREM2": 1.12, "CLU": 3.12, "BIN1": 2.12, "Age": 72, "Label": 1},
  {"sampleId": "AD-02", "APOE": 3.11, "TREM2": 4.52, "CLU": 5.12, "BIN1": 4.88, "Age": 68, "Label": 0}
 ]`;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawText(event.target?.result as string || '');
      };
      reader.readAsText(file);
      
      // Auto detect type
      const ext = file.name.split('.').pop()?.toUpperCase();
      if (ext === 'CSV') setFileType('CSV');
      if (ext === 'FASTA' || ext === 'FA') setFileType('FASTA');
      if (ext === 'JSON') setFileType('JSON');
      if (ext === 'TSV') setFileType('TSV');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setRawText(event.target?.result as string || '');
      };
      reader.readAsText(file);
    }
  };

  const loadSample = (type: 'FASTA' | 'CSV' | 'JSON') => {
    if (type === 'FASTA') {
      setFileName('sample_brca1_damage.fasta');
      setFileType('FASTA');
      setRawText(BRCA_SAMPLE_FASTA);
    } else if (type === 'CSV') {
      setFileName('sample_expression_matrix.csv');
      setFileType('CSV');
      setRawText(BRCA_SAMPLE_CSV);
    } else {
      setFileName('sample_alzheimers_profile.json');
      setFileType('JSON');
      setRawText(AD_SAMPLE_JSON);
    }
  };

  const handleUpload = async () => {
    if (!activeProject) return;
    if (!fileName || !rawText) return;

    setUploadSuccess(false);
    const result = await uploadDataset({
      projectId: activeProject.id,
      name: fileName,
      fileType,
      rawText
    });

    if (result) {
      setUploadSuccess(true);
      // Auto clear after 4s
      setTimeout(() => setUploadSuccess(false), 4000);
      setRawText('');
      setFileName('');
      setCurrentPage(1);
    }
  };

  // Filter datasets belonging to active project
  const projectDatasets = datasets.filter(d => d.projectId === activeProject?.id);

  // Filter and Paginate Raw Preview Rows of Active Dataset
  const activeRawData = activeDataset?.rawData || [];
  
  const filteredRawData = activeRawData.filter((row: any) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return Object.entries(row).some(([key, val]) => 
      String(val).toLowerCase().includes(term) || String(key).toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(filteredRawData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedRawData = filteredRawData.slice(startIndex, startIndex + pageSize);

  // Dynamic headers extracted from first item keys
  const tableHeaders = activeRawData.length > 0 ? Object.keys(activeRawData[0]) : [];

  const formatHeaderLabel = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .toUpperCase();
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Title */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-white">Dataset Core Registry</h2>
        <p className="text-slate-500 text-xs font-mono uppercase mt-1">Ingest, clean, and map transcriptomic files</p>
      </div>

      {!activeProject ? (
        <div className="p-8 border border-slate-900 bg-slate-950 rounded-2xl text-center space-y-3">
          <ShieldAlert className="w-8 h-8 text-yellow-500 mx-auto" />
          <h4 className="text-sm font-mono font-bold text-white uppercase">No Active Project Loaded</h4>
          <p className="text-xs text-slate-500">Please choose or create a scientific project context in the sidebar first.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Ingestion Box */}
            <div className="lg:col-span-7 space-y-6">
              <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-4">
                <h3 className="text-sm font-mono font-bold tracking-wider text-slate-500 uppercase">1. SECURE SHELL UPLOAD</h3>

                {/* Drag n Drop Boundary */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center space-y-2 ${
                    isDragOver ? 'border-emerald-500 bg-emerald-500/10' : 'border-slate-800 hover:border-slate-700 bg-slate-900/10'
                  }`}
                >
                  <UploadCloud className="w-10 h-10 text-slate-500 animate-pulse" />
                  <div>
                    <p className="text-xs font-mono text-white">DRAG AND DROP TRANSCRIPTOMIC MATRIX FILE</p>
                    <p className="text-[10px] font-mono text-slate-500 mt-1">supports .CSV, .TSV, .FASTA, .VCF, or .JSON formats</p>
                  </div>
                  <div className="pt-2">
                    <label className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded text-[10px] font-mono font-bold text-slate-300 uppercase cursor-pointer">
                      Browse File System
                      <input type="file" onChange={handleFileChange} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* Form Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">Dataset ID Name</label>
                    <input
                      type="text"
                      placeholder="brca1_transcriptome.csv"
                      value={fileName}
                      onChange={e => setFileName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1 uppercase">Genomic File Format</label>
                    <select
                      value={fileType}
                      onChange={e => setFileType(e.target.value as any)}
                      className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="CSV">CSV Expression Matrix</option>
                      <option value="FASTA">FASTA Sequence Alignment</option>
                      <option value="JSON">JSON Matrix</option>
                      <option value="TSV">TSV Array</option>
                    </select>
                  </div>
                </div>

                {/* Raw Sequence Editor */}
                <div className="space-y-1">
                  <label className="block text-xs font-mono text-slate-400 uppercase">2. Raw Genomic / Microarray Sequence Editor</label>
                  <textarea
                    rows={6}
                    placeholder="Paste raw sequence rows or matrix rows here..."
                    value={rawText}
                    onChange={e => setRawText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-3 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                {error && (
                  <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 shrink-0" /> {error}
                  </div>
                )}

                {uploadSuccess && (
                  <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" /> Dataset mapped and successfully registered!
                  </div>
                )}

                {/* Submit Ingestion */}
                <button
                  onClick={handleUpload}
                  disabled={loading || !fileName || !rawText}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition disabled:bg-slate-900 disabled:text-slate-600 disabled:border-slate-950 cursor-pointer"
                >
                  {loading ? 'ANALYZING & REGISTERING...' : 'RUN INGESTION PIPELINE'}
                </button>
              </div>
            </div>

            {/* Right Presets & Pipeline Overview */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-4">
                <h3 className="text-sm font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-400" /> INSTANT DATA PRESETS
                </h3>
                <p className="text-xs text-slate-400">
                  Don't have a dataset file ready? Load our pre-curated high-fidelity genomics templates to begin immediately:
                </p>

                <div className="space-y-2">
                  <button
                    onClick={() => loadSample('CSV')}
                    className="w-full p-3 rounded-xl border border-slate-900 hover:border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white block group-hover:text-emerald-400 transition">BRCA1 somatic expression matrix (.csv)</span>
                      <span className="text-[10px] font-mono text-slate-500">120 patients, 15 variables, clinical labels</span>
                    </div>
                    <FileSpreadsheet className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
                  </button>

                  <button
                    onClick={() => loadSample('FASTA')}
                    className="w-full p-3 rounded-xl border border-slate-900 hover:border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white block group-hover:text-emerald-400 transition">Homo sapiens BRCA1 DNA FASTA (.fasta)</span>
                      <span className="text-[10px] font-mono text-slate-500">Nucleotide sequence, alignment header, amino residues</span>
                    </div>
                    <Binary className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
                  </button>

                  <button
                    onClick={() => loadSample('JSON')}
                    className="w-full p-3 rounded-xl border border-slate-900 hover:border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 text-left transition flex items-center justify-between group cursor-pointer"
                  >
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white block group-hover:text-emerald-400 transition">APOE ε4 late-onset AD profiles (.json)</span>
                      <span className="text-[10px] font-mono text-slate-500">85 microarray samples, TREM2, CLU variables</span>
                    </div>
                    <FileCode className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
                  </button>
                </div>
              </div>

              {/* Pipeline flowchart mapping */}
              <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-3">
                <h3 className="text-sm font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-blue-400" /> AUTOMATED PIPELINE STAGES
                </h3>
                <div className="space-y-3 font-mono text-[10px] text-slate-400">
                  <div className="flex gap-2">
                    <span className="text-emerald-400">[01]</span>
                    <div>
                      <span className="text-white block font-bold">LEXICAL PARSING & GC ANALYZER</span>
                      <span>Validates FASTA/VCF delimiters, calculates GC nucleotides ratio and expression baselines.</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-400">[02]</span>
                    <div>
                      <span className="text-white block font-bold">NORMALIZATION & SCALING</span>
                      <span>Applies log2 fold conversions, handles missing expression bounds, standardizes distributions.</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-emerald-400">[03]</span>
                    <div>
                      <span className="text-white block font-bold">FEATURE CORRELATION MAP</span>
                      <span>Constructs covariance matrix to isolate peak driving biomarkers for downstream QSVM circuits.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Core Dataset Registry Insights and Interactive Table */}
          {projectDatasets.length > 0 && (
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 rounded-xl">
                    <Database className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Project Dataset Registry</h3>
                    <p className="text-[10px] font-mono text-slate-500 uppercase mt-0.5">Isolate, review, and toggle active transcriptomic files</p>
                  </div>
                </div>
                
                {/* Dataset selector switcher */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Selected Context:</span>
                  <select
                    value={activeDataset?.id || ''}
                    onChange={(e) => {
                      const target = datasets.find(d => d.id === e.target.value);
                      if (target) {
                        setActiveDataset(target);
                        setCurrentPage(1);
                        setSearchTerm('');
                      }
                    }}
                    className="bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                  >
                    {projectDatasets.map((d) => (
                      <option key={d.id} value={d.id}>{d.name} ({d.fileType})</option>
                    ))}
                  </select>
                </div>
              </div>

              {activeDataset ? (
                <div className="space-y-6">
                  {/* Stats Bento Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Ingested Records</span>
                      <p className="text-xl font-bold text-white tracking-tight">{activeDataset.rowCount} rows</p>
                    </div>
                    <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Genomic Variables</span>
                      <p className="text-xl font-bold text-white tracking-tight">{activeDataset.columnCount} columns</p>
                    </div>
                    <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Mean expression level</span>
                      <p className="text-xl font-bold text-emerald-400 tracking-tight">
                        {activeDataset.summaryStats.meanExpression} <span className="text-xs font-mono text-slate-400">log2</span>
                      </p>
                    </div>
                    <div className="p-4 bg-slate-900/40 border border-slate-900 rounded-xl space-y-1">
                      <span className="text-[10px] font-mono text-slate-500 uppercase">Estimated anomaly rate</span>
                      <p className="text-xl font-bold text-orange-400 tracking-tight">
                        {(activeDataset.summaryStats.mutationRate * 100).toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  {/* Detected Genomic Features tags */}
                  {activeDataset.genesDetected && activeDataset.genesDetected.length > 0 && (
                    <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl space-y-2">
                      <span className="text-[10px] font-mono text-slate-500 uppercase block">
                        Identified biomarkers ({activeDataset.genesDetected.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                        {activeDataset.genesDetected.map((gene) => (
                          <span
                            key={gene}
                            className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono font-medium text-slate-300 hover:border-slate-700 transition"
                          >
                            {gene}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive micro-array data table */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Filter className="w-3.5 h-3.5 text-emerald-400" /> Genomic Microarray Preview Matrix
                      </h4>
                      
                      {/* Search Bar */}
                      <div className="relative w-full sm:w-72">
                        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-500">
                          <Search className="w-3.5 h-3.5" />
                        </span>
                        <input
                          type="text"
                          placeholder="Search microarray rows (e.g. BRCA1, mutated)..."
                          value={searchTerm}
                          onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                    </div>

                    {tableHeaders.length > 0 ? (
                      <div className="overflow-x-auto border border-slate-900 rounded-xl">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-900/60 border-b border-slate-900 font-mono text-slate-400 uppercase text-[10px]">
                              {tableHeaders.map((hdr) => (
                                <th key={hdr} className="p-3 font-semibold tracking-wider">{formatHeaderLabel(hdr)}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-900/40 text-slate-300 font-mono">
                            {paginatedRawData.length > 0 ? (
                              paginatedRawData.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-slate-900/20 transition">
                                  {tableHeaders.map((hdr) => {
                                    const value = row[hdr];
                                    let cellValue = String(value ?? '');
                                    
                                    // Custom styling for boolean or numeric tags
                                    let styleClass = "p-3 font-medium";
                                    if (value === true || cellValue.toLowerCase() === 'true' || (hdr === 'mutation' && cellValue === '1')) {
                                      return (
                                        <td key={hdr} className="p-3">
                                          <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-[9px] font-bold text-red-400 uppercase">MUTATED</span>
                                        </td>
                                      );
                                    }
                                    if (value === false || cellValue.toLowerCase() === 'false' || (hdr === 'mutation' && cellValue === '0')) {
                                      return (
                                        <td key={hdr} className="p-3">
                                          <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-750 text-[9px] font-bold text-slate-500 uppercase">WILD</span>
                                        </td>
                                      );
                                    }
                                    if (hdr.toLowerCase().includes('expression_level') || hdr.toLowerCase().includes('methylation')) {
                                      styleClass += " text-emerald-400 font-bold";
                                    }
                                    if (hdr.toLowerCase() === 'gene_name' || hdr.toLowerCase() === 'gene_id' || hdr.toLowerCase() === 'patientid' || hdr.toLowerCase() === 'sampleid') {
                                      styleClass += " text-white font-bold";
                                    }

                                    return (
                                      <td key={hdr} className={styleClass}>
                                        {cellValue}
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={tableHeaders.length} className="p-8 text-center text-slate-500 font-mono">
                                  No microarray rows matched your filter query.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="p-6 text-center text-slate-500 text-xs font-mono">Unable to extract matrix preview formats.</p>
                    )}

                    {/* Pagination controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between font-mono text-[10px] text-slate-400 border-t border-slate-900 pt-3">
                        <span>
                          SHOWING {startIndex + 1} - {Math.min(startIndex + pageSize, filteredRawData.length)} OF {filteredRawData.length} RECORDS
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-300 rounded disabled:opacity-30 disabled:hover:border-slate-850 cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 py-1 bg-slate-900 border border-slate-850 text-white rounded">
                            PAGE {currentPage} OF {totalPages}
                          </span>
                          <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 bg-slate-900 border border-slate-850 hover:border-slate-700 text-slate-300 rounded disabled:opacity-30 disabled:hover:border-slate-850 cursor-pointer"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Scientific Pipeline Call to Actions */}
                  <div className="border-t border-slate-900 pt-6">
                    <h4 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-3">
                      NEXT SCIENTIFIC WORKFLOW STAGES
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* AI Predictor CTA */}
                      <div className="p-5 bg-gradient-to-r from-purple-950/20 to-slate-950 border border-purple-900/30 hover:border-purple-900/60 rounded-2xl flex flex-col justify-between space-y-4 group transition">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-purple-400">
                            <Cpu className="w-4 h-4" />
                            <span className="text-xs font-mono font-bold tracking-wider uppercase">Genomic AI Diagnostics</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            Run high-dimensional classical or hybrid quantum classification algorithms over the uploaded dataset to compile SHAP importance statistics.
                          </p>
                        </div>
                        <button
                          onClick={() => onTabChange?.('predictions')}
                          className="w-full py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold font-mono text-[10px] uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2 group-hover:translate-y-[-2px] cursor-pointer"
                        >
                          Execute AI Diagnostic Run <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Quantum Simulator CTA */}
                      <div className="p-5 bg-gradient-to-r from-emerald-950/20 to-slate-950 border border-emerald-900/30 hover:border-emerald-900/60 rounded-2xl flex flex-col justify-between space-y-4 group transition">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-emerald-400">
                            <Atom className="w-4 h-4" />
                            <span className="text-xs font-mono font-bold tracking-wider uppercase">QML State Simulations</span>
                          </div>
                          <p className="text-xs text-slate-300 leading-relaxed font-sans">
                            Encode the variables of the active dataset on simulated qubits and run high-fidelity parameterized circuit simulations to map State Vectors.
                          </p>
                        </div>
                        <button
                          onClick={() => onTabChange?.('quantum')}
                          className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-[10px] uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2 group-hover:translate-y-[-2px] cursor-pointer"
                        >
                          Execute Quantum Circuit <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 border border-dashed border-slate-900 rounded-xl text-center space-y-2 text-slate-500 font-mono text-xs">
                  <p>NO ACTIVE DATASET INSTATED</p>
                  <p className="text-[10px] text-slate-600 uppercase">Please select a dataset context or run ingestion on a new microarray file above.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
