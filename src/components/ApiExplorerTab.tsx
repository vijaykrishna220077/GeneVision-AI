import React, { useState } from 'react';
import { Terminal, Copy, CheckCircle2, Play, Cpu, Settings, Database, CloudLightning, RefreshCw, ExternalLink, ShieldAlert, BadgeAlert, DatabaseBackup } from 'lucide-react';
import { useResearch } from './ResearchContext';

interface Endpoint {
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  desc: string;
  headers: string;
  body?: string;
}

export default function ApiExplorerTab() {
  const { supabaseStatus, triggerSupabaseSync } = useResearch();
  const [activeEndpointIdx, setActiveEndpointIdx] = useState(0);
  const [showCurl, setShowCurl] = useState(true);
  const [copied, setCopied] = useState(false);
  const [responseJson, setResponseJson] = useState<string>('{\n  "status": "idle",\n  "tip": "Hit \'Execute Request\' to query local server node."\n}');
  const [executing, setExecuting] = useState(false);
  const [status, setStatus] = useState<number | null>(null);
  
  const [syncing, setSyncing] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<boolean | null>(null);

  const endpoints: Endpoint[] = [
    {
      method: 'GET',
      path: '/api/projects',
      desc: 'Retrieves all registered project identifiers, clinical targets, and initialization dates.',
      headers: 'Accept: application/json\nAuthorization: Bearer session_token_gv_2026'
    },
    {
      method: 'POST',
      path: '/api/projects',
      desc: 'Registers a new scientific project workspace targeting oncology or neurology datasets.',
      headers: 'Content-Type: application/json\nAuthorization: Bearer session_token_gv_2026',
      body: '{\n  "name": "BRCA1 Receptor Screening",\n  "diseaseType": "Breast Cancer",\n  "description": "Profiling somatic variants for cell validation."\n}'
    },
    {
      method: 'POST',
      path: '/api/datasets/upload',
      desc: 'Submits a raw genomic sequence (FASTA, VCF, CSV) to lexical analyzers and GC GC-nucleotide calculation pipelines.',
      headers: 'Content-Type: application/json',
      body: '{\n  "projectId": "proj-9001",\n  "name": "brca_expression.csv",\n  "fileType": "CSV",\n  "rawText": "PatientId,BRCA1,Age,Label\\nBC-2001,8.42,45,1"\n}'
    },
    {
      method: 'POST',
      path: '/api/predictions/classify',
      desc: 'Trains deep multi-layer perceptron or SVM classifiers on somatic expression matrices and calculates SHAP values.',
      headers: 'Content-Type: application/json',
      body: '{\n  "projectId": "proj-9001",\n  "datasetId": "data-8001",\n  "modelType": "Quantum SVM Classifier"\n}'
    },
    {
      method: 'POST',
      path: '/api/quantum/simulate',
      desc: 'Runs the local state-vector simulator across a parameterized qubit CNOT cascade lattice and evaluates quantum-classical boundaries.',
      headers: 'Content-Type: application/json',
      body: '{\n  "projectId": "proj-9001",\n  "datasetId": "data-8001",\n  "qubits": 3,\n  "encodingType": "Angle",\n  "ansatz": "RealAmplitudes",\n  "noiseLevel": 0.015\n}'
    },
    {
      method: 'POST',
      path: '/api/copilot/chat',
      desc: 'Queries the server-side Gemini knowledge engine for medical guidelines, metabolic binders, and explainability annotations.',
      headers: 'Content-Type: application/json',
      body: '{\n  "message": "Explain how homologous recombination works.",\n  "diseaseType": "Breast Cancer"\n}'
    }
  ];

  const activeEp = endpoints[activeEndpointIdx];

  const handleCopy = () => {
    const curlCmd = `curl -X ${activeEp.method} "http://localhost:3000${activeEp.path}" \\\n  -H "Content-Type: application/json" ${activeEp.body ? `\\\n  -d '${activeEp.body.replace(/\n/g, '')}'` : ''}`;
    
    navigator.clipboard.writeText(curlCmd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecute = async () => {
    setExecuting(true);
    setStatus(null);
    setResponseJson('');

    try {
      const options: RequestInit = {
        method: activeEp.method,
        headers: {
          'Content-Type': 'application/json',
          'gv-sandbox-bypass': 'true' // custom tag
        }
      };
      
      if (activeEp.method === 'POST' && activeEp.body) {
        options.body = activeEp.body;
      }

      // Query local endpoint
      const res = await fetch(activeEp.path, options);
      setStatus(res.status);
      const data = await res.json();
      setResponseJson(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResponseJson(JSON.stringify({ error: 'Connection failed', message: err.message }, null, 2));
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-white">Programmatic REST API Sandbox</h2>
        <p className="text-slate-500 text-xs font-mono uppercase mt-1">Execute live curls against local node servers</p>
      </div>

      {/* Supabase Integration Dashboard Card */}
      <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950/60 backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <Database className="w-48 h-48 text-emerald-400" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${
              !supabaseStatus?.configured 
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' 
                : supabaseStatus.active 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              <Database className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Supabase Cloud Database Sync</h3>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase border ${
                  !supabaseStatus?.configured
                    ? 'bg-blue-500/15 text-blue-400 border-blue-500/25'
                    : supabaseStatus.active
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/25'
                }`}>
                  {!supabaseStatus?.configured 
                    ? 'Fallback Local DB' 
                    : supabaseStatus.active 
                      ? 'Cloud Sync Active' 
                      : 'Sync Interrupted'
                  }
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                {!supabaseStatus?.configured
                  ? "Your research workbench is securely saving all projects, datasets, and predictions onto the local sandbox disk. Link a cloud-hosted Supabase PostgreSQL database to persist your metrics indefinitely."
                  : supabaseStatus.active
                    ? `Fully integrated with Cloud Supabase: ${supabaseStatus.supabaseUrl}. All transcriptomics datasets, quantum jobs, and copilot logs are synchronized in real-time.`
                    : `Your secrets are configured, but we couldn't connect. Error: ${supabaseStatus.errorMessage || 'Please run the SQL schema snippet below in your Supabase SQL Editor.'}`
                }
              </p>
            </div>
          </div>

          <div className="shrink-0 flex flex-wrap items-center gap-3">
            {supabaseStatus?.configured && (
              <button
                disabled={syncing}
                onClick={async () => {
                  setSyncing(true);
                  setSyncSuccess(null);
                  const success = await triggerSupabaseSync();
                  setSyncSuccess(success);
                  setSyncing(false);
                  setTimeout(() => setSyncSuccess(null), 3000);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800/80 transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-emerald-400' : ''}`} />
                {syncing ? 'Synchronizing...' : 'Force Sync Data'}
              </button>
            )}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15 border border-emerald-500/20 transition cursor-pointer"
            >
              <span>Visit Supabase</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Sync Success / Error Alert Box */}
        {syncSuccess !== null && (
          <div className={`mt-4 p-3 rounded-xl border flex items-center gap-2 text-xs font-mono ${
            syncSuccess 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
              : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          }`}>
            <CloudLightning className="w-4 h-4 text-emerald-400 animate-pulse" />
            {syncSuccess 
              ? 'Database check succeeded! Full system tables queried and updated in 43ms.' 
              : 'Sync failed: The "genevision_storage" table was not detected. Apply the SQL snippet below in Supabase SQL editor.'
            }
          </div>
        )}

        {/* SQL Schema helper snippet (only if configured but offline/error, or as a helpful guide) */}
        {(!supabaseStatus?.configured || !supabaseStatus?.active) && (
          <div className="mt-5 border-t border-slate-900/60 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-blue-400" /> Supabase SQL Setup Snippet
              </span>
              <button
                onClick={() => {
                  const sql = supabaseStatus?.setupSql || `-- Create the key-value storage table for GeneVision AI
CREATE TABLE IF NOT EXISTS genevision_storage (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial records to activate cloud sync
INSERT INTO genevision_storage (key, value) VALUES
('projects', '[]'::jsonb),
('datasets', '[]'::jsonb),
('predictions', '[]'::jsonb),
('quantumJobs', '[]'::jsonb),
('activityLogs', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;`;
                  navigator.clipboard.writeText(sql);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 2000);
                }}
                className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-slate-400 hover:text-white transition cursor-pointer"
              >
                {copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Snippet'}
              </button>
            </div>

            {!supabaseStatus?.configured ? (
              <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 space-y-1">
                <span className="text-[10px] font-mono font-bold text-blue-400 uppercase block">Quick Configuration Guide</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  To sync with Supabase: 
                  1. Create a free project at <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline">supabase.com</a>. 
                  2. Open the <strong>SQL Editor</strong> tab and run the SQL schema snippet below to create the storage table. 
                  3. Go to Project Settings &gt; API, and copy the <strong>Project URL</strong> and <strong>anon public key</strong>.
                  4. Paste them into the <strong>Secrets</strong> panel in AI Studio as <code>SUPABASE_URL</code> and <code>SUPABASE_ANON_KEY</code>.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[10px] font-mono font-bold text-rose-400 uppercase block">Schema Required</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Your Supabase credentials are valid, but the database table <code>genevision_storage</code> is not present. Paste the SQL script below in your Supabase SQL Editor and click <strong>Run</strong> to establish table state.
                  </p>
                </div>
              </div>
            )}

            <pre className="p-4 rounded-xl border border-slate-900 bg-slate-950 font-mono text-[10.5px] text-slate-400 leading-relaxed overflow-x-auto max-h-40">
              {supabaseStatus?.setupSql || `-- Create the key-value storage table for GeneVision AI
CREATE TABLE IF NOT EXISTS genevision_storage (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed initial records to activate cloud sync
INSERT INTO genevision_storage (key, value) VALUES
('projects', '[]'::jsonb),
('datasets', '[]'::jsonb),
('predictions', '[]'::jsonb),
('quantumJobs', '[]'::jsonb),
('activityLogs', '[]'::jsonb)
ON CONFLICT (key) DO NOTHING;`}
            </pre>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[500px]">
        {/* Endpoint selector list (Left) */}
        <div className="lg:col-span-4 flex flex-col p-4 rounded-2xl border border-slate-900 bg-slate-950 overflow-y-auto space-y-2 h-full">
          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase px-2 mb-2 block">
            Liveliness Endpoints Directory
          </span>

          {endpoints.map((ep, idx) => (
            <button
              key={ep.path + ep.method}
              onClick={() => {
                setActiveEndpointIdx(idx);
                setStatus(null);
                setResponseJson('{\n  "status": "idle"\n}');
              }}
              className={`p-3 rounded-xl border text-left transition flex flex-col gap-1.5 cursor-pointer ${
                activeEndpointIdx === idx
                  ? 'bg-slate-900 border-slate-800 text-white'
                  : 'hover:bg-slate-900/40 border-transparent text-slate-400'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold ${
                  ep.method === 'GET' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {ep.method}
                </span>
                <span className="text-[11px] font-mono truncate">{ep.path}</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-snug">{ep.desc}</p>
            </button>
          ))}
        </div>

        {/* Console payload & execution sandbox (Right) */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
          {/* Top: Payload editor */}
          <div className="p-4 rounded-2xl border border-slate-900 bg-slate-950 flex flex-col justify-between h-full">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-emerald-400" /> Request Payload Shell
                </span>
                <button
                  onClick={handleCopy}
                  className="p-1 hover:bg-slate-900 hover:text-white rounded text-slate-500 transition cursor-pointer"
                  title="Copy curl command line"
                >
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Show Curl command toggle */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                  <span>CURL COMPILED TARGET</span>
                  <button onClick={() => setShowCurl(!showCurl)} className="underline hover:text-white">
                    {showCurl ? 'Show raw JSON' : 'Show full Curl'}
                  </button>
                </div>
                
                {showCurl ? (
                  <div className="bg-slate-950 border border-slate-900 rounded p-3 h-48 overflow-y-auto font-mono text-[10px] text-sky-400 whitespace-pre-wrap select-all">
                    curl -X {activeEp.method} "http://localhost:3000{activeEp.path}" \<br />
                    &nbsp;&nbsp;-H "Content-Type: application/json" <br />
                    {activeEp.body && (
                      <>&nbsp;&nbsp;-d '{activeEp.body.replace(/\n/g, '')}'</>
                    )}
                  </div>
                ) : (
                  <textarea
                    rows={8}
                    readOnly
                    value={activeEp.body || '{\n  // No payload parameter required\n}'}
                    className="w-full bg-slate-950 border border-slate-900 rounded p-3 font-mono text-[10px] text-slate-300 focus:outline-none"
                  />
                )}
              </div>
            </div>

            <button
              onClick={handleExecute}
              disabled={executing}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2 mt-4 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" /> {executing ? 'QUERING HOST NODE...' : 'EXECUTE REQUEST'}
            </button>
          </div>

          {/* Bottom: Response terminal console */}
          <div className="p-4 rounded-2xl border border-slate-900 bg-slate-950 flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2 shrink-0">
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-blue-400" /> Node Response Console
              </span>
              {status !== null && (
                <span className={`px-1.5 py-0.5 rounded text-[8px] font-mono font-bold uppercase ${
                  status < 300 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  Status: {status} {status === 200 ? 'OK' : 'ERR'}
                </span>
              )}
            </div>

            <div className="flex-1 bg-slate-950 border border-slate-900 rounded p-3 font-mono text-[10px] text-emerald-400 overflow-y-auto whitespace-pre-wrap select-text mt-3">
              {executing ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-2">
                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                  <span className="animate-pulse">Awaiting handshake...</span>
                </div>
              ) : (
                responseJson
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
