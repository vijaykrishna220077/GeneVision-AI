import React, { useState, useEffect, useRef } from 'react';
import { useResearch } from './ResearchContext';
import { Atom, ShieldAlert, Sliders, Play, Info, Activity, Sparkles, AlertCircle, Terminal, Download, X, Copy, Check, History, GitCompare, RefreshCw, Eye, CheckCircle2, Compass, Wand2, Plus, Trash2, PlayCircle, Layers } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';

interface SimLog {
  id: string;
  time: string;
  msg: string;
  type: 'info' | 'success' | 'warn' | 'process';
}

export interface QuantumPreset {
  id: string;
  name: string;
  description: string;
  qubits: number;
  encodingType: 'Angle' | 'Amplitude' | 'Basis';
  ansatz: 'HardwareEfficient' | 'QAOA' | 'RealAmplitudes';
  theta: number;
  beta: number;
  gamma: number;
  noiseLevel: number;
  circuitDepth: number;
  gateCount: number;
  sequenceSteps: string[];
  explanation: string;
  expectedOutcome: string;
}

export const QUANTUM_PRESETS: QuantumPreset[] = [
  {
    id: 'qft',
    name: 'Quantum Fourier Transform (QFT)',
    description: 'Applies a quantum analogue of the discrete Fourier transform. Crucial for phase estimation, period-finding, and Shor’s algorithm.',
    qubits: 3,
    encodingType: 'Amplitude',
    ansatz: 'HardwareEfficient',
    theta: 1.57,
    beta: 0.78,
    gamma: 0.39,
    noiseLevel: 0.005,
    circuitDepth: 8,
    gateCount: 12,
    sequenceSteps: [
      'H q[0] - Create uniform superposition',
      'CP(π/2) q[1]->q[0] - Controlled phase shift',
      'H q[1] - Hadamard on qubit 1',
      'CP(π/4) q[2]->q[0] - Controlled phase shift',
      'CP(π/2) q[2]->q[1] - Controlled phase shift',
      'H q[2] - Hadamard on qubit 2',
      'SWAP q[0]<->q[2] - Reverse qubit order for output alignment'
    ],
    explanation: 'Transforms computational basis states into phase-frequency space, producing uniform superposition with phase-shifts corresponding to input data coordinates.',
    expectedOutcome: 'Spreads amplitude evenly across all computational states with fractional phase rotations.'
  },
  {
    id: 'grovers',
    name: 'Grover’s Search (Amplitude Amplification)',
    description: 'Uses constructive quantum interference to locate a target state in an unstructured database with quadratic speedup.',
    qubits: 3,
    encodingType: 'Basis',
    ansatz: 'HardwareEfficient',
    theta: 3.14,
    beta: 1.57,
    gamma: 1.57,
    noiseLevel: 0.010,
    circuitDepth: 7,
    gateCount: 11,
    sequenceSteps: [
      'H(all) - Initialize uniform superposition',
      'Oracle(|111⟩) - Invert phase of the target state',
      'H(all) - Hadamard transformation for reflection',
      'X(all) - Prepare states for control-Z logic',
      'Controlled-Z - Reflect about average amplitude',
      'X(all) - Restore states',
      'H(all) - Constructive interference reconstruction'
    ],
    explanation: 'Applies Grover reflection operators to rotate the state vector towards the marked search item, maximizing its measurement probability.',
    expectedOutcome: 'Measurement probability concentrated heavily in a single target state (e.g., |111⟩).'
  },
  {
    id: 'ghz',
    name: 'GHZ Maximally Entangled State',
    description: 'Generates a multi-qubit entangled state of the form (|000⟩ + |111⟩)/√2. Essential for benchmarking multi-qubit coherence.',
    qubits: 3,
    encodingType: 'Angle',
    ansatz: 'RealAmplitudes',
    theta: 1.57,
    beta: 0.00,
    gamma: 0.00,
    noiseLevel: 0.015,
    circuitDepth: 4,
    gateCount: 5,
    sequenceSteps: [
      'H q[0] - Split initial state of first qubit',
      'CNOT q[0]->q[1] - Entangle first and second qubits',
      'CNOT q[1]->q[2] - Expand entanglement to third qubit',
      'Measure in Bell computational basis'
    ],
    explanation: 'Creates non-local quantum correlations such that measuring any single qubit immediately determines the state of all other qubits, violating classical Bell inequalities.',
    expectedOutcome: 'Equal 50% probability peaks at extreme states |000⟩ and |111⟩, with zero probability for intermediate states.'
  },
  {
    id: 'qaoa',
    name: 'QAOA MaxCut Optimizer (Combinatorial)',
    description: 'Quantum Approximate Optimization Algorithm preset configured to solve combinatorial graph partitioning problems.',
    qubits: 3,
    encodingType: 'Angle',
    ansatz: 'QAOA',
    theta: 0.50,
    beta: 0.85,
    gamma: 1.25,
    noiseLevel: 0.020,
    circuitDepth: 5,
    gateCount: 8,
    sequenceSteps: [
      'H(all) - Uniform start state preparation',
      'Rzz(γ) - Cost Hamiltonian phase-encoding over graph edges',
      'Rx(β) - Driver Hamiltonian mixer layer for superposition flow',
      'Iterative parameter-shift gradient updates on classical optimizer'
    ],
    explanation: 'Alternates between cost-Hamiltonian phase rotations and mixer driver rotations to drive the quantum state toward optimal cut solutions.',
    expectedOutcome: 'High-probability states align with the maximum-cut graph bipartitions.'
  },
  {
    id: 'vqe',
    name: 'Variational Quantum Eigensolver (VQE)',
    description: 'A hybrid algorithm using parametric circuits to find ground state wavefunctions and minimum eigenvalues of chemical systems.',
    qubits: 2,
    encodingType: 'Angle',
    ansatz: 'RealAmplitudes',
    theta: 0.95,
    beta: 1.15,
    gamma: 0.45,
    noiseLevel: 0.005,
    circuitDepth: 4,
    gateCount: 6,
    sequenceSteps: [
      'Ry(θ) q[0] - Single-qubit ansatz rotation',
      'Ry(θ) q[1] - Single-qubit ansatz rotation',
      'CNOT q[0]->q[1] - Correlate states',
      'Energy calculation & classical optimization feedback loop'
    ],
    explanation: 'Prepares a parameterized trial state (ansatz) on the quantum simulator, measures its energy, and optimizes parameters θ and γ classically.',
    expectedOutcome: 'Trial state converges perfectly to the physical ground-state energy level.'
  },
  {
    id: 'qpe',
    name: 'Quantum Phase Estimation (QPE)',
    description: 'Estimates the phase/eigenvalue of a unitary operator. Uses a control register and a target register connected via controlled gates.',
    qubits: 4,
    encodingType: 'Amplitude',
    ansatz: 'HardwareEfficient',
    theta: 2.00,
    beta: 1.00,
    gamma: 0.50,
    noiseLevel: 0.010,
    circuitDepth: 9,
    gateCount: 15,
    sequenceSteps: [
      'H q[0..2] - Control register setup',
      'X q[3] - Target register state prep',
      'Controlled-U q[0]->q[3]',
      'Controlled-U^2 q[1]->q[3]',
      'Controlled-U^4 q[2]->q[3]',
      'Inverse QFT on control qubits'
    ],
    explanation: 'Encodes eigenvalues of a target unitary matrix directly into the phases of control qubits, which are then read out using Inverse QFT.',
    expectedOutcome: 'Peaks in the control register state represent the binary expansion of the phase.'
  }
];

export default function QuantumComputingTab() {
  const { 
    activeProject, 
    activeDataset, 
    activeQuantumJob, 
    runQuantumSim, 
    loading, 
    error, 
    theme,
    quantumJobs,
    setActiveQuantumJob
  } = useResearch();
  
  // Quantum Circuit Settings
  const [qubits, setQubits] = useState(3);
  const [encodingType, setEncodingType] = useState<'Angle' | 'Amplitude' | 'Basis'>('Angle');
  const [ansatz, setAnsatz] = useState<'HardwareEfficient' | 'QAOA' | 'RealAmplitudes'>('RealAmplitudes');
  const [noiseLevel, setNoiseLevel] = useState(0.015);
  const [runningJob, setRunningJob] = useState(false);
  const [simLogs, setSimLogs] = useState<SimLog[]>([]);
  const [progress, setProgress] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Real-time circuit interactive parameters
  const [thetaValue, setThetaValue] = useState(0.5);
  const [betaValue, setBetaValue] = useState(0.25);
  const [gammaValue, setGammaValue] = useState(0.4);
  const [selectedGate, setSelectedGate] = useState<any | null>(null);

  // Comparative Simulation States
  const [compareJobIds, setCompareJobIds] = useState<string[]>([]);

  // Preset Selection State
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');

  // Batch Queue States
  const [batchQueue, setBatchQueue] = useState<any[]>([]);
  const [batchResults, setBatchResults] = useState<any[]>([]);
  const [isRunningBatch, setIsRunningBatch] = useState<boolean>(false);
  const [currentBatchIndex, setCurrentBatchIndex] = useState<number>(0);
  const [customConfigName, setCustomConfigName] = useState<string>('');

  // Helper to retrieve structured gate specifications
  const getGateInfo = (gateType: string, qIdx: number): any => {
    switch (gateType) {
      case 'encoding':
        return {
          id: `enc-${qIdx}`,
          name: encodingType === 'Angle' ? 'Angle Embedding Ry(x)' : encodingType === 'Amplitude' ? 'Amplitude State Preparation' : 'Basis Binary Embedding X',
          symbol: encodingType === 'Angle' ? `Ry(x_${qIdx})` : encodingType === 'Amplitude' ? 'ψ_enc' : 'X',
          qubit: qIdx,
          formula: encodingType === 'Angle' ? 'Ry(x_i) = \n[ cos(x_i/2)  -sin(x_i/2) ]\n[ sin(x_i/2)   cos(x_i/2) ]' : encodingType === 'Amplitude' ? 'StatePrep(x) |0⟩ = Σ x_i |i⟩' : 'X |0⟩ = |1⟩ if x_i > threshold',
          matrix: encodingType === 'Angle' ? [
            [`cos(x_${qIdx}/2)`, `-sin(x_${qIdx}/2)`],
            [`sin(x_${qIdx}/2)`, `cos(x_${qIdx}/2)`]
          ] : null,
          role: 'Encodes classical gene expression level vectors directly into quantum mechanical amplitudes.',
          color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20'
        };
      case 'ry':
        return {
          id: `ry-${qIdx}`,
          name: 'Parametric Y-Rotation Ry(θ)',
          symbol: `Ry(θ)`,
          qubit: qIdx,
          parameterName: 'θ',
          parameterValue: thetaValue,
          setParameter: setThetaValue,
          min: 0,
          max: 6.283,
          formula: 'Ry(θ) = \n[ cos(θ/2)  -sin(θ/2) ]\n[ sin(θ/2)   cos(θ/2) ]',
          matrix: [
            [(Math.cos(thetaValue / 2)).toFixed(3), (-Math.sin(thetaValue / 2)).toFixed(3)],
            [(Math.sin(thetaValue / 2)).toFixed(3), (Math.cos(thetaValue / 2)).toFixed(3)]
          ],
          role: 'Applies a tunable rotation around the Y-axis. Gradient-optimized to split high-dimensional cancer genomic profiles.',
          color: 'text-purple-400 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20'
        };
      case 'rx':
        return {
          id: `rx-${qIdx}`,
          name: 'Parametric X-Rotation Rx(β)',
          symbol: `Rx(β)`,
          qubit: qIdx,
          parameterName: 'β',
          parameterValue: betaValue,
          setParameter: setBetaValue,
          min: 0,
          max: 6.283,
          formula: 'Rx(β) = \n[ cos(β/2)   -i*sin(β/2) ]\n[ -i*sin(β/2)  cos(β/2) ]',
          matrix: [
            [(Math.cos(betaValue / 2)).toFixed(3), `-${(Math.sin(betaValue / 2)).toFixed(3)}i`],
            [`-${(Math.sin(betaValue / 2)).toFixed(3)}i`, (Math.cos(betaValue / 2)).toFixed(3)]
          ],
          role: 'Applies tunable rotation around the X-axis of the Bloch sphere to establish constructive interference states.',
          color: 'text-pink-400 border-pink-500/30 bg-pink-500/10 hover:bg-pink-500/20'
        };
      case 'rz':
        return {
          id: `rz-${qIdx}`,
          name: 'Parametric Z-Rotation Rz(γ)',
          symbol: `Rz(γ)`,
          qubit: qIdx,
          parameterName: 'γ',
          parameterValue: gammaValue,
          setParameter: setGammaValue,
          min: 0,
          max: 6.283,
          formula: 'Rz(γ) = \n[ e^(-i*γ/2)      0      ]\n[      0       e^(i*γ/2) ]',
          matrix: [
            [`e^(-${(gammaValue / 2).toFixed(2)}i)`, '0'],
            ['0', `e^(${(gammaValue / 2).toFixed(2)}i)`]
          ],
          role: 'Adjusts complex-valued wave function phases, storing gene target regulatory interactions.',
          color: 'text-amber-400 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20'
        };
      case 'rzz':
        return {
          id: `rzz-${qIdx}`,
          name: 'Ising Coupling ZZ-Rotation Rzz(γ)',
          symbol: `Rzz(γ)`,
          qubit: qIdx,
          parameterName: 'γ',
          parameterValue: gammaValue,
          setParameter: setGammaValue,
          min: 0,
          max: 6.283,
          formula: 'Rzz(γ) = \n[ e^(-i*γ/2)    0         0         0      ]\n[     0      e^(i*γ/2)    0         0      ]\n[     0         0      e^(i*γ/2)    0      ]\n[     0         0         0      e^(-i*γ/2) ]',
          matrix: null,
          role: 'Models co-expression correlation strengths (Ising coupling target interaction) between adjacent genetic indicators.',
          color: 'text-teal-400 border-teal-500/30 bg-teal-500/10 hover:bg-teal-500/20'
        };
      case 'cnot':
        return {
          id: `cnot-${qIdx}`,
          name: 'Controlled-NOT (CNOT) Entangler',
          symbol: 'CX',
          qubit: qIdx,
          formula: 'CNOT = \n[ 1  0  0  0 ]\n[ 0  1  0  0 ]\n[ 0  0  0  1 ]\n[ 0  0  1  0 ]',
          role: 'Generates maximum multi-qubit entanglement to model high-order correlations and pathways between biomarkers.',
          color: 'text-sky-400 border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20'
        };
      case 'measurement':
        return {
          id: `meas-${qIdx}`,
          name: 'Computational Basis Measurement',
          symbol: 'M',
          qubit: qIdx,
          formula: 'M_z = |0⟩⟨0| - |1⟩⟨1|',
          role: 'Projects and collapses the final entangled superposition to gather diagnostic statistics over 1000 trials.',
          color: 'text-slate-400 border-slate-500/30 bg-slate-500/10 hover:bg-slate-500/20'
        };
      default:
        return null;
    }
  };

  const generateStateVectorSnapshotForJob = (job: any) => {
    if (!job) return null;
    
    const states = Object.entries(job.qubitMeasurements).map(([state, shots], idx) => {
      const prob = (shots as number) / 1000;
      const mag = Math.sqrt(prob);
      // Generate some deterministic phases to simulate complex state vectors
      const phaseRad = (idx * Math.PI) / 4 + 0.2; // varying phase
      const real = mag * Math.cos(phaseRad);
      const imag = mag * Math.sin(phaseRad);
      const phaseDeg = (phaseRad * 180) / Math.PI % 360;
      
      return {
        state: `|${state}⟩`,
        shots,
        probability: parseFloat(prob.toFixed(4)),
        amplitude: {
          real: parseFloat(real.toFixed(4)),
          imag: parseFloat(imag.toFixed(4)),
          magnitude: parseFloat(mag.toFixed(4)),
          phaseRad: parseFloat(phaseRad.toFixed(4)),
          phaseDeg: parseFloat(phaseDeg.toFixed(1)),
          formatted: `${real >= 0 ? '' : '-'}${Math.abs(real).toFixed(3)} ${imag >= 0 ? '+' : '-'}${Math.abs(imag).toFixed(3)}i`
        }
      };
    });

    return {
      metadata: {
        jobId: job.id,
        projectId: job.projectId,
        datasetId: job.datasetId,
        projectName: activeProject?.name || 'Unknown Project',
        diseaseContext: activeProject?.diseaseType || 'Unknown Disease',
        qubits: job.qubits,
        circuitDepth: job.circuitDepth,
        gateCount: job.gateCount,
        encodingType: job.encodingType,
        ansatz: job.ansatz,
        noiseLevel: job.noiseLevel,
        fidelity: job.fidelity,
        quantumAccuracy: job.quantumAccuracy,
        classicalAccuracy: job.classicalAccuracy,
        executionTimeMs: job.executionTimeMs,
        timestamp: job.createdAt
      },
      blochSpheres: job.blochCoordinates.map((coords: any, idx: number) => ({
        qubitIndex: idx,
        x: coords.x,
        y: coords.y,
        z: coords.z
      })),
      stateVector: states
    };
  };

  const generateStateVectorSnapshot = () => {
    if (!activeQuantumJob) return null;
    return generateStateVectorSnapshotForJob(activeQuantumJob);
  };

  const handleCopyJSON = (data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = (data: any) => {
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quantum_simulation_${activeQuantumJob?.id || 'export'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll function
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [simLogs, runningJob]);

  // Initial and reactive logs setup
  useEffect(() => {
    if (activeQuantumJob) {
      setSimLogs([
        { 
          id: 'load-1', 
          time: new Date().toLocaleTimeString(), 
          msg: `Quantum Core state synchronized. Loaded active job for Project: ${activeProject?.name || 'Active Project'}`, 
          type: 'info' 
        },
        { 
          id: 'load-2', 
          time: new Date().toLocaleTimeString(), 
          msg: `PQC Configuration: ${activeQuantumJob.qubits} Qubits | Encoding: ${activeQuantumJob.encodingType} | Ansatz: ${activeQuantumJob.ansatz}`, 
          type: 'info' 
        },
        { 
          id: 'load-3', 
          time: new Date().toLocaleTimeString(), 
          msg: `Simulation completed with state fidelity: ${(activeQuantumJob.fidelity * 100).toFixed(2)}%`, 
          type: 'success' 
        }
      ]);
      setProgress(100);
    } else {
      setSimLogs([
        { 
          id: 'init-idle', 
          time: new Date().toLocaleTimeString(), 
          msg: 'Quantum Core virtual processor idling. Awaiting pipeline execution command...', 
          type: 'info' 
        }
      ]);
      setProgress(0);
    }
  }, [activeQuantumJob?.id, activeProject?.id]);

  const addLog = (msg: string, type: 'info' | 'success' | 'warn' | 'process') => {
    const time = new Date().toLocaleTimeString();
    setSimLogs(prev => [...prev, { id: Math.random().toString(), time, msg, type }]);
  };

  const handleSubmit = async () => {
    setRunningJob(true);
    setProgress(0);
    setSimLogs([]); // Clear logs for new execution

    const steps = [
      { msg: 'Connecting to high-performance virtual QPU simulator backend...', type: 'info' as const, delay: 350 },
      { msg: `Allocating registers for ${qubits} Qubits (State Hilbert space size: 2^${qubits} = ${Math.pow(2, qubits)} states)`, type: 'info' as const, delay: 450 },
      { msg: `Executing quantum state preparation using dynamic '${encodingType}' encoding...`, type: 'process' as const, delay: 500 },
      { msg: `State vectors successfully mapped into initial Bloch sphere positions.`, type: 'success' as const, delay: 350 },
      { msg: `Synthesizing Parametric Quantum Circuit with '${ansatz}' Ansatz topology...`, type: 'process' as const, delay: 550 },
      { msg: `Adding rotational layers and entangling CNOT cascades...`, type: 'process' as const, delay: 450 },
      { msg: `Hardware-efficient ansatz lattice compiled successfully.`, type: 'success' as const, delay: 300 },
      { msg: `Modeling hardware decoherence & amplitude damping noise (Noise factor: ${(noiseLevel * 100).toFixed(2)}%)...`, type: 'warn' as const, delay: 400 },
      { msg: `Executing 1,000 statistical sampling shots on simulated QPU backend...`, type: 'process' as const, delay: 600 }
    ];

    let currentStep = 0;
    for (const step of steps) {
      addLog(step.msg, step.type);
      currentStep++;
      setProgress(Math.round((currentStep / (steps.length + 1)) * 90));
      await new Promise(resolve => setTimeout(resolve, step.delay));
    }

    addLog('Finalizing hybrid AI-quantum prediction integration...', 'process');
    setProgress(90);

    const result = await runQuantumSim({
      qubits,
      encodingType,
      ansatz,
      noiseLevel
    });

    if (result) {
      setProgress(100);
      addLog(`Job execution complete. Quantum measurement state fidelity: ${(result.fidelity * 100).toFixed(2)}%`, 'success');
      addLog(`Achieved prediction accuracy: ${(result.quantumAccuracy * 100).toFixed(1)}% vs. classical baseline of ${(result.classicalAccuracy * 100).toFixed(1)}%`, 'success');
    } else {
      setProgress(0);
      addLog('Error executing pipeline simulation. Check project dataset context.', 'warn');
    }

    setRunningJob(false);
  };

  const handleToggleCompare = (jobId: string) => {
    setCompareJobIds(prev => {
      if (prev.includes(jobId)) {
        return prev.filter(id => id !== jobId);
      } else {
        if (prev.length >= 3) {
          addLog("Maximum of 3 configurations can be compared side-by-side.", "warn");
          return prev;
        }
        return [...prev, jobId];
      }
    });
  };

  const handleLoadJob = (job: any) => {
    setActiveQuantumJob(job);
    setQubits(job.qubits);
    setEncodingType(job.encodingType);
    setAnsatz(job.ansatz);
    setNoiseLevel(job.noiseLevel);
    addLog(`Successfully loaded past simulation run [${job.id.substring(0, 8)}] into the workspace.`, 'info');
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (!presetId) return;

    const preset = QUANTUM_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setQubits(preset.qubits);
      setEncodingType(preset.encodingType);
      setAnsatz(preset.ansatz);
      setThetaValue(preset.theta);
      setBetaValue(preset.beta);
      setGammaValue(preset.gamma);
      setNoiseLevel(preset.noiseLevel);
      setActiveQuantumJob(null); // Clear previous active job since workspace was modified with a new preset

      // Log the injection of the preset
      addLog(`[Preset Injector] Injected Quantum Gate Sequence: ${preset.name}`, 'success');
      addLog(`Configured Workspace: ${preset.qubits} Qubits | ${preset.encodingType} Encoding | Ansatz: ${preset.ansatz}`, 'info');
      addLog(`Parameters set: θ=${preset.theta.toFixed(2)}, β=${preset.beta.toFixed(2)}, γ=${preset.gamma.toFixed(2)} | Noise: ${(preset.noiseLevel * 100).toFixed(1)}%`, 'info');
      
      preset.sequenceSteps.forEach((step, idx) => {
        addLog(`Step ${idx + 1}: ${step}`, 'process');
      });
    }
  };

  const addToBatchQueue = (name?: string) => {
    const configName = name || customConfigName.trim() || `Config #${batchQueue.length + 1} (${ansatz})`;
    const newItem = {
      id: Math.random().toString(),
      name: configName,
      qubits,
      encodingType,
      ansatz,
      theta: thetaValue,
      beta: betaValue,
      gamma: gammaValue,
      noiseLevel
    };
    setBatchQueue(prev => [...prev, newItem]);
    setCustomConfigName('');
    addLog(`[Batch Queue] Added configuration: "${configName}" to queue.`, 'info');
  };

  const removeFromBatchQueue = (id: string) => {
    setBatchQueue(prev => prev.filter(item => item.id !== id));
  };

  const clearBatchQueue = () => {
    setBatchQueue([]);
    setBatchResults([]);
    addLog('[Batch Queue] Queue and results cleared.', 'warn');
  };

  const loadSampleQueue = () => {
    const samples = [
      {
        id: 'sample-1',
        name: 'Hardware Efficient (3Q, Ry Angle)',
        qubits: 3,
        encodingType: 'Angle' as const,
        ansatz: 'HardwareEfficient' as const,
        theta: 1.57,
        beta: 0.5,
        gamma: 0.2,
        noiseLevel: 0.01
      },
      {
        id: 'sample-2',
        name: 'QAOA Combinatorial MaxCut (3Q)',
        qubits: 3,
        encodingType: 'Basis' as const,
        ansatz: 'QAOA' as const,
        theta: 0.5,
        beta: 0.85,
        gamma: 1.25,
        noiseLevel: 0.01
      },
      {
        id: 'sample-3',
        name: 'Real Amplitudes (3Q, Clean QPU)',
        qubits: 3,
        encodingType: 'Amplitude' as const,
        ansatz: 'RealAmplitudes' as const,
        theta: 0.95,
        beta: 1.15,
        gamma: 0.45,
        noiseLevel: 0.002
      }
    ];
    setBatchQueue(samples);
    addLog('[Batch Queue] Loaded 3 standard research sample configurations into queue.', 'info');
  };

  const runBatchSequentially = async () => {
    if (batchQueue.length === 0) return;
    setIsRunningBatch(true);
    setBatchResults([]);
    setCurrentBatchIndex(0);
    
    addLog(`[Batch Runner] Starting sequential execution of ${batchQueue.length} queued configurations...`, 'process');
    
    const results: any[] = [];
    
    for (let i = 0; i < batchQueue.length; i++) {
      setCurrentBatchIndex(i);
      const item = batchQueue[i];
      addLog(`[Batch Runner] [${i+1}/${batchQueue.length}] Running: ${item.name}`, 'process');
      
      // Update UI configuration values in active workspace during sequential run
      setQubits(item.qubits);
      setEncodingType(item.encodingType);
      setAnsatz(item.ansatz);
      setThetaValue(item.theta);
      setBetaValue(item.beta);
      setGammaValue(item.gamma);
      setNoiseLevel(item.noiseLevel);

      // Execute actual simulation using runQuantumSim
      const result = await runQuantumSim({
        qubits: item.qubits,
        encodingType: item.encodingType,
        ansatz: item.ansatz,
        noiseLevel: item.noiseLevel
      });

      if (result) {
        const fullResult = {
          ...result,
          name: item.name,
          theta: item.theta,
          beta: item.beta,
          gamma: item.gamma
        };
        results.push(fullResult);
        addLog(`[Batch Runner] [${i+1}/${batchQueue.length}] Completed. Fidelity: ${(result.fidelity * 100).toFixed(1)}% | Accuracy: ${(result.quantumAccuracy * 100).toFixed(1)}%`, 'success');
        
        // Update the active workspace job so the primary visuals render the last completed run of the batch
        setActiveQuantumJob(result);
      } else {
        addLog(`[Batch Runner] [${i+1}/${batchQueue.length}] Failed: ${item.name}`, 'warn');
      }

      // Small pause to allow UI update and prevent locking
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    setBatchResults(results);
    setIsRunningBatch(false);
    addLog(`[Batch Runner] Sequential execution finished. ${results.length} runs complete. Comparison summary compiled below.`, 'success');
  };

  // Convert measurement counts to recharts format
  const getMeasurementData = () => {
    if (!activeQuantumJob) return [];
    return Object.entries(activeQuantumJob.qubitMeasurements).map(([state, count]) => ({
      state: `|${state}⟩`,
      shots: count
    }));
  };

  // SVG Parameterized Quantum Circuit generator
  const renderQuantumCircuit = () => {
    const wireCount = qubits;
    const padding = 25;
    const wireSpacing = 40;
    const startX = 60;
    const endX = 420;
    const height = wireCount * wireSpacing + padding * 2;
    const width = 480;

    const isSelected = (gateId: string) => selectedGate?.id === gateId;

    return (
      <svg className="w-full h-auto bg-slate-950 rounded-xl border border-slate-900 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
          </linearGradient>
          <filter id="glow-filter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Draw wires */}
        {Array.from({ length: wireCount }).map((_, idx) => {
          const y = padding + idx * wireSpacing;
          return (
            <g key={idx}>
              <text x="15" y={y + 4} className="fill-slate-500 font-mono text-[10px]" fontWeight="bold">q[{idx}]</text>
              <line x1={startX} y1={y} x2={endX} y2={y} stroke="#1e293b" strokeWidth={2} />
              <line x1={startX} y1={y} x2={endX} y2={y} stroke="#334155" strokeWidth={1} />
              
              {/* Dynamic Real-time wave/pulse flow when runningJob is active */}
              {runningJob && (
                <circle r="3" className="fill-emerald-400 filter" style={{ filter: 'url(#glow-filter)' }}>
                  <animateMotion dur="2.5s" repeatCount="indefinite" path={`M ${startX} ${y} L ${endX} ${y}`} />
                </circle>
              )}
            </g>
          );
        })}

        {/* Draw Encoding Gates */}
        {Array.from({ length: wireCount }).map((_, idx) => {
          const y = padding + idx * wireSpacing;
          const gateX = startX + 30;
          const label = encodingType === 'Angle' ? 'Ry(x)' : encodingType === 'Amplitude' ? 'Amp' : 'X';
          const gateColor = encodingType === 'Angle' ? '#10b981' : encodingType === 'Amplitude' ? '#3b82f6' : '#ec4899';
          const gateId = `enc-${idx}`;
          const active = isSelected(gateId);
          const gateInfo = getGateInfo('encoding', idx);

          return (
            <g 
              key={`enc-${idx}`} 
              className="cursor-pointer transition-all duration-200" 
              onClick={() => setSelectedGate(gateInfo)}
            >
              <rect 
                x={gateX - 22} 
                y={y - 12} 
                width="44" 
                height="24" 
                rx="4" 
                fill={active ? gateColor : '#020617'} 
                fillOpacity={active ? 0.3 : 0.15} 
                stroke={gateColor} 
                strokeWidth={active ? 2 : 1.2} 
                className="hover:stroke-white transition-all"
                style={{ filter: active ? 'url(#glow-filter)' : undefined }}
              />
              <text 
                x={gateX} 
                y={y + 4} 
                textAnchor="middle" 
                className={`${active ? 'fill-white' : 'fill-slate-300'} font-mono text-[8px] select-none`} 
                fontWeight="bold"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* Draw Ansatz Gates: RealAmplitudes */}
        {ansatz === 'RealAmplitudes' && (
          <>
            {/* Ry rotations Layer */}
            {Array.from({ length: wireCount }).map((_, idx) => {
              const y = padding + idx * wireSpacing;
              const gateX = startX + 115;
              const gateId = `ry-${idx}`;
              const active = isSelected(gateId);
              const gateInfo = getGateInfo('ry', idx);

              return (
                <g 
                  key={`ry-${idx}`} 
                  className="cursor-pointer" 
                  onClick={() => setSelectedGate(gateInfo)}
                >
                  <rect 
                    x={gateX - 22} 
                    y={y - 12} 
                    width="44" 
                    height="24" 
                    rx="4" 
                    fill={active ? '#a855f7' : '#020617'} 
                    fillOpacity={active ? 0.3 : 0.15} 
                    stroke="#a855f7" 
                    strokeWidth={active ? 2 : 1.2} 
                    className="hover:stroke-white transition-all"
                    style={{ filter: active ? 'url(#glow-filter)' : undefined }}
                  />
                  <text 
                    x={gateX} 
                    y={y + 4} 
                    textAnchor="middle" 
                    className={`${active ? 'fill-white' : 'fill-slate-300'} font-mono text-[8px] select-none`} 
                    fontWeight="bold"
                  >
                    Ry({thetaValue.toFixed(2)})
                  </text>
                </g>
              );
            })}

            {/* Entanglers - CNOT Cascade */}
            {wireCount > 1 && Array.from({ length: wireCount - 1 }).map((_, idx) => {
              const cX = startX + 195 + (idx * 28);
              const yCtrl = padding + idx * wireSpacing;
              const yTgt = padding + (idx + 1) * wireSpacing;
              const gateId = `cnot-${idx}`;
              const active = isSelected(gateId);
              const gateInfo = getGateInfo('cnot', idx);

              return (
                <g 
                  key={`cnot-${idx}`} 
                  className="cursor-pointer" 
                  onClick={() => setSelectedGate(gateInfo)}
                >
                  <line 
                    x1={cX} 
                    y1={yCtrl} 
                    x2={cX} 
                    y2={yTgt} 
                    stroke="#3b82f6" 
                    strokeWidth={active ? 2 : 1.2} 
                    strokeDasharray={active ? "none" : "3 3"} 
                  />
                  <circle 
                    cx={cX} 
                    cy={yCtrl} 
                    r={active ? 6 : 4} 
                    fill="#3b82f6" 
                    style={{ filter: active ? 'url(#glow-filter)' : undefined }}
                  />
                  {/* CNOT target symbol */}
                  <circle 
                    cx={cX} 
                    cy={yTgt} 
                    r={active ? 8 : 6} 
                    fill="#3b82f6" 
                    style={{ filter: active ? 'url(#glow-filter)' : undefined }}
                  />
                  <line x1={cX - 6} y1={yTgt} x2={cX + 6} y2={yTgt} stroke="#0f172a" strokeWidth={1.5} />
                  <line x1={cX} y1={yTgt - 6} x2={cX} y2={yTgt + 6} stroke="#0f172a" strokeWidth={1.5} />
                </g>
              );
            })}
          </>
        )}

        {/* Draw Ansatz Gates: HardwareEfficient */}
        {ansatz === 'HardwareEfficient' && (
          <>
            {/* Rx Layer */}
            {Array.from({ length: wireCount }).map((_, idx) => {
              const y = padding + idx * wireSpacing;
              const gateX = startX + 105;
              const gateId = `rx-${idx}`;
              const active = isSelected(gateId);
              const gateInfo = getGateInfo('rx', idx);

              return (
                <g 
                  key={`rx-${idx}`} 
                  className="cursor-pointer" 
                  onClick={() => setSelectedGate(gateInfo)}
                >
                  <rect 
                    x={gateX - 18} 
                    y={y - 12} 
                    width="36" 
                    height="24" 
                    rx="4" 
                    fill={active ? '#ec4899' : '#020617'} 
                    fillOpacity={active ? 0.3 : 0.15} 
                    stroke="#ec4899" 
                    strokeWidth={active ? 2 : 1.2} 
                    className="hover:stroke-white transition-all"
                    style={{ filter: active ? 'url(#glow-filter)' : undefined }}
                  />
                  <text 
                    x={gateX} 
                    y={y + 4} 
                    textAnchor="middle" 
                    className={`${active ? 'fill-white' : 'fill-slate-300'} font-mono text-[8px] select-none`} 
                    fontWeight="bold"
                  >
                    Rx({betaValue.toFixed(2)})
                  </text>
                </g>
              );
            })}

            {/* Rz Layer */}
            {Array.from({ length: wireCount }).map((_, idx) => {
              const y = padding + idx * wireSpacing;
              const gateX = startX + 155;
              const gateId = `rz-${idx}`;
              const active = isSelected(gateId);
              const gateInfo = getGateInfo('rz', idx);

              return (
                <g 
                  key={`rz-${idx}`} 
                  className="cursor-pointer" 
                  onClick={() => setSelectedGate(gateInfo)}
                >
                  <rect 
                    x={gateX - 18} 
                    y={y - 12} 
                    width="36" 
                    height="24" 
                    rx="4" 
                    fill={active ? '#eab308' : '#020617'} 
                    fillOpacity={active ? 0.3 : 0.15} 
                    stroke="#eab308" 
                    strokeWidth={active ? 2 : 1.2} 
                    className="hover:stroke-white transition-all"
                    style={{ filter: active ? 'url(#glow-filter)' : undefined }}
                  />
                  <text 
                    x={gateX} 
                    y={y + 4} 
                    textAnchor="middle" 
                    className={`${active ? 'fill-white' : 'fill-slate-300'} font-mono text-[8px] select-none`} 
                    fontWeight="bold"
                  >
                    Rz({gammaValue.toFixed(2)})
                  </text>
                </g>
              );
            })}

            {/* CNOT Entanglement Cascade for HardwareEfficient */}
            {wireCount > 1 && Array.from({ length: wireCount - 1 }).map((_, idx) => {
              const cX = startX + 225 + (idx * 28);
              const yCtrl = padding + idx * wireSpacing;
              const yTgt = padding + (idx + 1) * wireSpacing;
              const gateId = `cnot-${idx}`;
              const active = isSelected(gateId);
              const gateInfo = getGateInfo('cnot', idx);

              return (
                <g 
                  key={`he-cnot-${idx}`} 
                  className="cursor-pointer" 
                  onClick={() => setSelectedGate(gateInfo)}
                >
                  <line 
                    x1={cX} 
                    y1={yCtrl} 
                    x2={cX} 
                    y2={yTgt} 
                    stroke="#3b82f6" 
                    strokeWidth={active ? 2 : 1.2} 
                    strokeDasharray={active ? "none" : "3 3"} 
                  />
                  <circle cx={cX} cy={yCtrl} r={active ? 6 : 4} fill="#3b82f6" style={{ filter: active ? 'url(#glow-filter)' : undefined }} />
                  <circle cx={cX} cy={yTgt} r={active ? 8 : 6} fill="#3b82f6" style={{ filter: active ? 'url(#glow-filter)' : undefined }} />
                  <line x1={cX - 6} y1={yTgt} x2={cX + 6} y2={yTgt} stroke="#0f172a" strokeWidth={1.5} />
                  <line x1={cX} y1={yTgt - 6} x2={cX} y2={yTgt + 6} stroke="#0f172a" strokeWidth={1.5} />
                </g>
              );
            })}
          </>
        )}

        {/* Draw Ansatz Gates: QAOA */}
        {ansatz === 'QAOA' && (
          <>
            {/* Rz(γ) layer */}
            {Array.from({ length: wireCount }).map((_, idx) => {
              const y = padding + idx * wireSpacing;
              const gateX = startX + 105;
              const gateId = `rz-${idx}`;
              const active = isSelected(gateId);
              const gateInfo = getGateInfo('rz', idx);

              return (
                <g 
                  key={`qaoa-rz-${idx}`} 
                  className="cursor-pointer" 
                  onClick={() => setSelectedGate(gateInfo)}
                >
                  <rect 
                    x={gateX - 18} 
                    y={y - 12} 
                    width="36" 
                    height="24" 
                    rx="4" 
                    fill={active ? '#f59e0b' : '#020617'} 
                    fillOpacity={active ? 0.3 : 0.15} 
                    stroke="#f59e0b" 
                    strokeWidth={active ? 2 : 1.2} 
                    className="hover:stroke-white transition-all"
                    style={{ filter: active ? 'url(#glow-filter)' : undefined }}
                  />
                  <text 
                    x={gateX} 
                    y={y + 4} 
                    textAnchor="middle" 
                    className={`${active ? 'fill-white' : 'fill-slate-300'} font-mono text-[8px] select-none`} 
                    fontWeight="bold"
                  >
                    Rz({gammaValue.toFixed(2)})
                  </text>
                </g>
              );
            })}

            {/* Rzz(γ) Ising Coupling layer */}
            {wireCount > 1 && Array.from({ length: wireCount - 1 }).map((_, idx) => {
              const cX = startX + 175 + (idx * 25);
              const yCtrl = padding + idx * wireSpacing;
              const yTgt = padding + (idx + 1) * wireSpacing;
              const gateId = `rzz-${idx}`;
              const active = isSelected(gateId);
              const gateInfo = getGateInfo('rzz', idx);

              return (
                <g 
                  key={`qaoa-rzz-${idx}`} 
                  className="cursor-pointer" 
                  onClick={() => setSelectedGate(gateInfo)}
                >
                  <line 
                    x1={cX} 
                    y1={yCtrl} 
                    x2={cX} 
                    y2={yTgt} 
                    stroke="#0d9488" 
                    strokeWidth={active ? 2 : 1.2} 
                  />
                  <rect 
                    x={cX - 15} 
                    y={((yCtrl + yTgt) / 2) - 10} 
                    width="30" 
                    height="20" 
                    rx="3" 
                    fill={active ? '#0d9488' : '#020617'} 
                    fillOpacity={active ? 0.35 : 0.2} 
                    stroke="#0d9488" 
                    strokeWidth={1.2}
                    className="hover:stroke-white transition-all"
                    style={{ filter: active ? 'url(#glow-filter)' : undefined }}
                  />
                  <text 
                    x={cX} 
                    y={((yCtrl + yTgt) / 2) + 3} 
                    textAnchor="middle" 
                    className={`${active ? 'fill-white' : 'fill-slate-300'} font-mono text-[7px] font-bold select-none`}
                  >
                    ZZ(γ)
                  </text>
                </g>
              );
            })}

            {/* Rx(β) Mixer layer */}
            {Array.from({ length: wireCount }).map((_, idx) => {
              const y = padding + idx * wireSpacing;
              const gateX = startX + 285;
              const gateId = `rx-${idx}`;
              const active = isSelected(gateId);
              const gateInfo = getGateInfo('rx', idx);

              return (
                <g 
                  key={`qaoa-rx-${idx}`} 
                  className="cursor-pointer" 
                  onClick={() => setSelectedGate(gateInfo)}
                >
                  <rect 
                    x={gateX - 18} 
                    y={y - 12} 
                    width="36" 
                    height="24" 
                    rx="4" 
                    fill={active ? '#ec4899' : '#020617'} 
                    fillOpacity={active ? 0.3 : 0.15} 
                    stroke="#ec4899" 
                    strokeWidth={active ? 2 : 1.2} 
                    className="hover:stroke-white transition-all"
                    style={{ filter: active ? 'url(#glow-filter)' : undefined }}
                  />
                  <text 
                    x={gateX} 
                    y={y + 4} 
                    textAnchor="middle" 
                    className={`${active ? 'fill-white' : 'fill-slate-300'} font-mono text-[8px] select-none`} 
                    fontWeight="bold"
                  >
                    Rx({betaValue.toFixed(2)})
                  </text>
                </g>
              );
            })}
          </>
        )}

        {/* Measurement Symbols */}
        {Array.from({ length: wireCount }).map((_, idx) => {
          const y = padding + idx * wireSpacing;
          const gateX = endX - 30;
          const gateId = `meas-${idx}`;
          const active = isSelected(gateId);
          const gateInfo = getGateInfo('measurement', idx);

          return (
            <g 
              key={`meas-${idx}`} 
              className="cursor-pointer" 
              onClick={() => setSelectedGate(gateInfo)}
            >
              <rect 
                x={gateX - 15} 
                y={y - 12} 
                width="30" 
                height="24" 
                rx="4" 
                fill={active ? '#64748b' : '#020617'} 
                fillOpacity={active ? 0.35 : 0.15} 
                stroke="#64748b" 
                strokeWidth={active ? 2 : 1.2} 
                className="hover:stroke-white transition-all"
                style={{ filter: active ? 'url(#glow-filter)' : undefined }}
              />
              <text 
                x={gateX} 
                y={y + 4} 
                textAnchor="middle" 
                className={`${active ? 'fill-white' : 'fill-slate-400'} font-mono text-[10px] select-none`} 
                fontWeight="bold"
              >
                M
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // SVG Bloch Sphere Vector Projection
  const renderBlochSphere = (qIdx: number, coords: { x: number; y: number; z: number }) => {
    const size = 100;
    const center = size / 2;
    const r = size / 2.5;

    // Convert coords to dynamic visual offsets
    const vecX = center + coords.x * r;
    const vecY = center - coords.z * r; // Map Z coordinate to standard Y projection axis

    return (
      <div key={qIdx} className="p-3 border border-slate-900 bg-slate-900/10 rounded-xl flex flex-col items-center space-y-1.5">
        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">Qubit [{qIdx}] State</span>
        
        <svg className="w-20 h-20 overflow-visible" viewBox={`0 0 ${size} ${size}`}>
          {/* Sphere circle wireframe */}
          <circle cx={center} cy={center} r={r} fill="none" stroke="#334155" strokeWidth={1} strokeDasharray="2 2" />
          
          {/* Equatorial Ellipse (dashed to give 3D spherical look!) */}
          <ellipse cx={center} cy={center} rx={r} ry={r / 3.5} fill="none" stroke="#1e293b" strokeWidth={1} />

          {/* Coordinate Axes */}
          <line x1={center} y1={center - r - 4} x2={center} y2={center + r + 4} stroke="#475569" strokeWidth={0.5} /> {/* Z Axis */}
          <line x1={center - r - 4} y1={center} x2={center + r + 4} y2={center} stroke="#475569" strokeWidth={0.5} /> {/* X Axis */}

          {/* Core Axis labels */}
          <text x={center} y={center - r - 6} textAnchor="middle" className="fill-slate-500 font-mono text-[7px]">|+z⟩</text>
          <text x={center} y={center + r + 11} textAnchor="middle" className="fill-slate-500 font-mono text-[7px] font-bold">|-z⟩</text>

          {/* State Vector */}
          <line x1={center} y1={center} x2={vecX} y2={vecY} stroke="#10b981" strokeWidth={1.8} />
          <circle cx={vecX} cy={vecY} r="3" fill="#10b981" />
        </svg>

        <div className="font-mono text-[8px] text-slate-400 space-x-1.5 text-center mt-1">
          <span>X: {coords.x.toFixed(2)}</span>
          <span>Y: {coords.y.toFixed(2)}</span>
          <span>Z: {coords.z.toFixed(2)}</span>
        </div>
      </div>
    );
  };

  const filteredJobs = (quantumJobs || []).filter(
    j => j.projectId === activeProject?.id && j.datasetId === activeDataset?.id
  );

  const renderComparisonSection = () => {
    if (compareJobIds.length === 0) return null;
    const comparedJobs = quantumJobs.filter(j => compareJobIds.includes(j.id));

    // Helper to find the maximum or best value among compared runs
    const getBestValue = (key: string, type: 'min' | 'max') => {
      const values = comparedJobs.map(j => (j as any)[key]).filter(v => typeof v === 'number');
      if (values.length === 0) return null;
      return type === 'max' ? Math.max(...values) : Math.min(...values);
    };

    const bestAccuracy = getBestValue('quantumAccuracy', 'max');
    const bestFidelity = getBestValue('fidelity', 'max');
    const fastestExecution = getBestValue('executionTimeMs', 'min');

    // Compile comparison data for state vector chart
    const maxQubits = Math.max(...comparedJobs.map(j => j.qubits));
    const totalStates = Math.pow(2, maxQubits);
    const statesList: string[] = [];
    for (let i = 0; i < totalStates; i++) {
      statesList.push(i.toString(2).padStart(maxQubits, '0'));
    }

    const comparisonChartData = statesList.map(state => {
      const entry: any = { state: `|${state}⟩` };
      comparedJobs.forEach((job, index) => {
        const shots = job.qubitMeasurements[state] || 0;
        entry[`run_${index + 1}`] = parseFloat((shots / 10).toFixed(1)); // percentage
      });
      return entry;
    });

    const colors = ['#10b981', '#3b82f6', '#a855f7'];

    return (
      <div className={`p-6 rounded-3xl border ${theme === 'clinical' ? 'bg-white border-slate-200 shadow-sm text-slate-800' : 'bg-slate-950 border-slate-900 text-white'} space-y-6 animate-fadeIn`}>
        <div className={`flex items-center justify-between border-b ${theme === 'clinical' ? 'border-slate-100' : 'border-slate-900'} pb-3`}>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-purple-500" />
            <div>
              <h3 className={`text-sm font-mono font-bold tracking-wider ${theme === 'clinical' ? 'text-slate-900' : 'text-white'} uppercase`}>
                Active Quantum Configuration Comparison
              </h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase">
                Comparing {comparedJobs.length} circuit design profiles side-by-side
              </p>
            </div>
          </div>
          <button
            onClick={() => setCompareJobIds([])}
            className={`px-2.5 py-1 text-[10px] font-mono rounded-lg transition cursor-pointer ${
              theme === 'clinical'
                ? 'text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200'
                : 'text-slate-400 bg-slate-900 border border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            Clear Selection
          </button>
        </div>

        {/* 1. Comparison Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {comparedJobs.map((job, idx) => {
            const isActive = activeQuantumJob?.id === job.id;
            const isBestAccuracy = job.quantumAccuracy === bestAccuracy;
            const isBestFidelity = job.fidelity === bestFidelity;
            const isFastest = job.executionTimeMs === fastestExecution;

            return (
              <div 
                key={job.id} 
                className={`p-5 rounded-2xl border transition-all ${
                  theme === 'clinical'
                    ? isActive 
                      ? 'border-purple-300 bg-purple-50/50 shadow-sm' 
                      : 'border-slate-200 bg-slate-50/50'
                    : isActive 
                      ? 'border-purple-500/50 bg-purple-950/10 shadow-lg shadow-purple-500/5' 
                      : 'border-slate-900 bg-slate-900/10'
                } space-y-4`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase">
                      RUN #{idx + 1} • {job.id.substring(0, 8).toUpperCase()}
                    </span>
                    <h4 className={`text-xs font-mono font-bold uppercase truncate max-w-[150px] ${theme === 'clinical' ? 'text-slate-800' : 'text-white'}`}>
                      {job.ansatz}
                    </h4>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {isActive ? (
                      <span className="text-[8px] font-mono text-purple-600 bg-purple-100 border border-purple-200 px-1.5 py-0.5 rounded uppercase font-bold">
                        ACTIVE IN WORKSPACE
                      </span>
                    ) : (
                      <button
                        onClick={() => handleLoadJob(job)}
                        className={`text-[8px] font-mono px-2 py-0.5 rounded uppercase transition cursor-pointer ${
                          theme === 'clinical'
                            ? 'text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200'
                            : 'text-slate-400 bg-slate-900 border border-slate-800 hover:text-white'
                        }`}
                      >
                        LOAD RUN
                      </button>
                    )}
                  </div>
                </div>

                {/* Specs badges */}
                <div className="flex flex-wrap gap-1.5">
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${theme === 'clinical' ? 'text-slate-600 bg-white border-slate-200' : 'text-slate-400 bg-slate-950 border-slate-900'}`}>
                    {job.qubits} Qubits
                  </span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded border truncate max-w-[120px] ${theme === 'clinical' ? 'text-slate-600 bg-white border-slate-200' : 'text-slate-400 bg-slate-950 border-slate-900'}`} title={job.encodingType}>
                    {job.encodingType}
                  </span>
                  <span className={`text-[9px] font-mono px-2 py-0.5 rounded border ${theme === 'clinical' ? 'text-slate-600 bg-white border-slate-200' : 'text-slate-400 bg-slate-950 border-slate-900'}`}>
                    {job.gateCount} Gates
                  </span>
                </div>

                {/* Core metrics comparison */}
                <div className={`grid grid-cols-2 gap-3 pt-3 border-t ${theme === 'clinical' ? 'border-slate-200' : 'border-slate-900/40'}`}>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Quantum Acc.</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-bold font-mono ${isBestAccuracy ? 'text-emerald-600' : theme === 'clinical' ? 'text-slate-700' : 'text-slate-300'}`}>
                        {(job.quantumAccuracy * 100).toFixed(1)}%
                      </span>
                      {isBestAccuracy && (
                        <span className="text-[8px] font-mono text-emerald-600 bg-emerald-100 border border-emerald-200 px-1 rounded font-bold uppercase">
                          BEST
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Fidelity</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-bold font-mono ${isBestFidelity ? 'text-emerald-600' : theme === 'clinical' ? 'text-slate-700' : 'text-slate-300'}`}>
                        {(job.fidelity * 100).toFixed(1)}%
                      </span>
                      {isBestFidelity && (
                        <span className="text-[8px] font-mono text-emerald-600 bg-emerald-100 border border-emerald-200 px-1 rounded font-bold uppercase">
                          BEST
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Classical Baseline</span>
                    <span className={`text-xs font-mono block font-bold ${theme === 'clinical' ? 'text-slate-600' : 'text-slate-400'}`}>
                      {(job.classicalAccuracy * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase block">Sim Duration</span>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-mono font-bold ${isFastest ? 'text-emerald-600' : theme === 'clinical' ? 'text-slate-600' : 'text-slate-400'}`}>
                        {job.executionTimeMs}ms
                      </span>
                      {isFastest && (
                        <span className="text-[8px] font-mono text-emerald-600 bg-emerald-100 border border-emerald-200 px-1 rounded font-bold uppercase">
                          FAST
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Accuracy Improvement badge */}
                <div className="pt-2">
                  {job.quantumAccuracy >= job.classicalAccuracy ? (
                    <div className={`p-2 rounded-lg flex items-center justify-between text-[10px] font-mono ${
                      theme === 'clinical'
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                        : 'bg-emerald-950/20 border border-emerald-900/30 text-emerald-400'
                    }`}>
                      <span>Quantum Improvement:</span>
                      <span className="font-extrabold">+{( (job.quantumAccuracy - job.classicalAccuracy) * 100 ).toFixed(1)}%</span>
                    </div>
                  ) : (
                    <div className={`p-2 rounded-lg flex items-center justify-between text-[10px] font-mono ${
                      theme === 'clinical'
                        ? 'bg-rose-50 border border-rose-200 text-rose-700'
                        : 'bg-rose-950/20 border border-rose-900/30 text-rose-400'
                    }`}>
                      <span>Quantum Deficit:</span>
                      <span className="font-extrabold">-{( (job.classicalAccuracy - job.quantumAccuracy) * 100 ).toFixed(1)}%</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. Side-by-Side State Vector Probability Chart & Data Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Chart column */}
          <div className="lg:col-span-7 space-y-3">
            <h4 className={`text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${theme === 'clinical' ? 'text-slate-700' : 'text-slate-400'}`}>
              <Activity className="w-3.5 h-3.5 text-emerald-500" /> State Vector Measurement Probabilities (%)
            </h4>
            
            <div className={`h-64 w-full p-4 rounded-2xl border ${theme === 'clinical' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-900'}`}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comparisonChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid stroke={theme === 'clinical' ? '#e2e8f0' : '#1e293b'} strokeDasharray="3 3" />
                  <XAxis dataKey="state" stroke="#475569" fontSize={10} fontFamily="monospace" />
                  <YAxis stroke="#475569" fontSize={10} fontFamily="monospace" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'clinical' ? '#ffffff' : '#0f172a', 
                      border: theme === 'clinical' ? '1px solid #cbd5e1' : '1px solid #1e293b',
                      color: theme === 'clinical' ? '#0f172a' : '#ffffff'
                    }} 
                    labelStyle={{ color: theme === 'clinical' ? '#000000' : '#ffffff', fontFamily: 'monospace', fontWeight: 'bold' }} 
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: 9, fontFamily: 'monospace', paddingTop: 10 }}
                    verticalAlign="bottom"
                  />
                  {comparedJobs.map((job, idx) => (
                    <Bar 
                      key={job.id}
                      dataKey={`run_${idx + 1}`}
                      name={`Run ${idx + 1}: ${job.ansatz} (${job.qubits}Q)`}
                      fill={colors[idx % colors.length]}
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table column */}
          <div className="lg:col-span-5 space-y-3">
            <h4 className={`text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${theme === 'clinical' ? 'text-slate-700' : 'text-slate-400'}`}>
              <Sparkles className="w-3.5 h-3.5 text-purple-500" /> State Amplitude |Ψ⟩ Comparative Table
            </h4>

            <div className={`rounded-2xl border overflow-hidden divide-y max-h-64 overflow-y-auto scrollbar-thin ${
              theme === 'clinical' 
                ? 'bg-slate-50 border-slate-200 divide-slate-200' 
                : 'bg-slate-950 border-slate-900 divide-slate-900'
            }`}>
              {statesList.map(state => {
                return (
                  <div key={state} className={`p-3 transition space-y-1.5 ${theme === 'clinical' ? 'hover:bg-slate-100/50' : 'hover:bg-slate-900/10'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-extrabold text-emerald-600">|{state}⟩</span>
                      <span className="text-[8px] font-mono text-slate-500 uppercase">MEASUREMENT OVERLAP</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 font-mono text-[9px]">
                      {comparedJobs.map((job, idx) => {
                        const snap = generateStateVectorSnapshotForJob(job);
                        const vecItem = snap?.stateVector.find(v => v.state === `|${state}⟩`);
                        const probability = vecItem ? (vecItem.probability * 100).toFixed(1) : '0.0';
                        const formattedAmp = vecItem ? vecItem.amplitude.formatted : '0.000 + 0.000i';

                        return (
                          <div 
                            key={job.id} 
                            className={`p-1.5 rounded border text-center space-y-0.5 ${
                              theme === 'clinical'
                                ? 'bg-white border-slate-200'
                                : 'bg-slate-900/30 border-slate-900'
                            }`}
                          >
                            <span className="text-[8px] text-slate-500 block">RUN #{idx + 1}</span>
                            <span className={`font-bold block ${theme === 'clinical' ? 'text-slate-800' : 'text-white'}`}>{probability}%</span>
                            <span className="text-slate-500 text-[7px] block truncate">{formattedAmp}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. Comparative Bloch Vector coordinates table */}
        <div className="space-y-3 pt-2">
          <h4 className={`text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${theme === 'clinical' ? 'text-slate-700' : 'text-slate-400'}`}>
            <Atom className="w-3.5 h-3.5 text-sky-500" /> Comparative Bloch Sphere Coordinates (X, Y, Z)
          </h4>

          <div className={`p-4 rounded-2xl border overflow-x-auto ${theme === 'clinical' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-900 text-slate-400'}`}>
            <table className="w-full text-left font-mono text-[10px] border-collapse">
              <thead>
                <tr className={`border-b text-[9px] uppercase ${theme === 'clinical' ? 'border-slate-200 text-slate-500' : 'border-slate-900 text-slate-500'}`}>
                  <th className="pb-2">Qubit</th>
                  {comparedJobs.map((job, idx) => (
                    <th key={job.id} className="pb-2 text-center">
                      Run #{idx + 1} ({job.ansatz})
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'clinical' ? 'divide-slate-200/50' : 'divide-slate-900/40'}`}>
                {Array.from({ length: maxQubits }).map((_, qubitIdx) => (
                  <tr key={qubitIdx} className={theme === 'clinical' ? 'hover:bg-slate-100/50' : 'hover:bg-slate-900/10'}>
                    <td className={`py-2.5 font-bold ${theme === 'clinical' ? 'text-slate-700' : 'text-slate-300'}`}>Qubit [{qubitIdx}]</td>
                    {comparedJobs.map((job) => {
                      const coord = job.blochCoordinates[qubitIdx];
                      return (
                        <td key={job.id} className="py-2.5 text-center">
                          {coord ? (
                            <span className={theme === 'clinical' ? 'text-slate-700' : 'text-slate-300'}>
                              [{coord.x.toFixed(2)}, {coord.y.toFixed(2)}, {coord.z.toFixed(2)}]
                            </span>
                          ) : (
                            <span className="text-slate-500">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderHistoryRegistry = () => {
    const sortedJobs = [...filteredJobs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    if (sortedJobs.length === 0) {
      return (
        <div className={`p-8 border rounded-2xl text-center space-y-3 py-14 ${
          theme === 'clinical' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-900'
        }`}>
          <History className="w-8 h-8 text-slate-500 mx-auto animate-pulse" />
          <h4 className={`text-xs font-mono font-bold uppercase ${theme === 'clinical' ? 'text-slate-700' : 'text-white'}`}>Simulation Run History empty</h4>
          <p className="text-[11px] text-slate-500 max-w-md mx-auto">
            You have not executed any hybrid quantum-classical simulations in the active project yet. Configure options and trigger a run to log performance metrics.
          </p>
        </div>
      );
    }

    return (
      <div className={`p-6 rounded-3xl border ${
        theme === 'clinical' ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-900 text-white'
      } space-y-4`}>
        <div className={`flex items-center justify-between border-b pb-3 ${theme === 'clinical' ? 'border-slate-100' : 'border-slate-900'}`}>
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-500" />
            <div>
              <h3 className={`text-sm font-mono font-bold tracking-wider uppercase ${theme === 'clinical' ? 'text-slate-900' : 'text-white'}`}>
                Quantum Simulation Run Registry
              </h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase">
                History log of past simulations for {activeProject?.name}
              </p>
            </div>
          </div>
          <div className={`text-[10px] font-mono px-3 py-1 rounded-lg ${
            theme === 'clinical' ? 'text-slate-700 bg-slate-100 border border-slate-200' : 'text-slate-400 bg-slate-900 border border-slate-800'
          }`}>
            Total Runs logged: <span className="text-emerald-500 font-bold">{sortedJobs.length}</span>
          </div>
        </div>

        {/* Legend / Tip */}
        <p className="text-[10px] text-slate-500 leading-normal font-sans">
          💡 Select checkboxes on up to <span className="text-purple-600 font-bold">3 configurations</span> below to enable active side-by-side state vector and performance metric comparison analysis. Click "Load" to restore circuit parameters into the design panel.
        </p>

        {/* Registry Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-[10px] border-collapse">
            <thead>
              <tr className={`border-b text-[9px] text-slate-500 uppercase ${theme === 'clinical' ? 'border-slate-100' : 'border-slate-900'}`}>
                <th className="pb-2.5 pl-3">Compare</th>
                <th className="pb-2.5">Config Specs</th>
                <th className="pb-2.5">Ansatz Design</th>
                <th className="pb-2.5 text-center">Fidelity</th>
                <th className="pb-2.5 text-center">Q. Accuracy</th>
                <th className="pb-2.5 text-center">C. Baseline</th>
                <th className="pb-2.5 text-center">Gain</th>
                <th className="pb-2.5 text-center">Duration</th>
                <th className="pb-2.5 text-right pr-3">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'clinical' ? 'divide-slate-100' : 'divide-slate-900/30'}`}>
              {sortedJobs.map((job) => {
                const isCompared = compareJobIds.includes(job.id);
                const isCurrentActive = activeQuantumJob?.id === job.id;
                const gain = job.quantumAccuracy - job.classicalAccuracy;

                return (
                  <tr 
                    key={job.id} 
                    className={`transition-colors ${
                      theme === 'clinical'
                        ? isCurrentActive ? 'bg-emerald-50/40 hover:bg-slate-50' : 'hover:bg-slate-50'
                        : isCurrentActive ? 'bg-emerald-950/5 hover:bg-slate-900/10' : 'hover:bg-slate-900/20'
                    }`}
                  >
                    {/* Compare Checkbox */}
                    <td className="py-3 pl-3">
                      <label className="relative flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isCompared}
                          onChange={() => handleToggleCompare(job.id)}
                          className="sr-only"
                        />
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                          isCompared 
                            ? 'bg-purple-500 border-purple-500 text-white' 
                            : theme === 'clinical'
                              ? 'border-slate-300 bg-white hover:border-slate-400'
                              : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                        }`}>
                          {isCompared && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </label>
                    </td>

                    {/* Specs badges */}
                    <td className="py-3 font-mono">
                      <div className="space-y-0.5">
                        <span className={`font-bold block ${theme === 'clinical' ? 'text-slate-800' : 'text-white'}`}>
                          {job.qubits} Qubits • {job.id.substring(0, 8).toUpperCase()}
                        </span>
                        <span className="text-slate-500 text-[9px] uppercase block">
                          Encoding: {job.encodingType} • Noise: {(job.noiseLevel * 100).toFixed(1)}%
                        </span>
                      </div>
                    </td>

                    {/* Ansatz */}
                    <td className="py-3">
                      <span className={`font-bold block ${theme === 'clinical' ? 'text-slate-700' : 'text-slate-300'}`}>{job.ansatz}</span>
                      <span className="text-slate-500 text-[9px] uppercase block">
                        Depth {job.circuitDepth} / {job.gateCount} Gates
                      </span>
                    </td>

                    {/* Fidelity */}
                    <td className="py-3 text-center">
                      <span className={theme === 'clinical' ? 'text-slate-700 font-semibold' : 'text-slate-300 font-semibold'}>
                        {(job.fidelity * 100).toFixed(1)}%
                      </span>
                    </td>

                    {/* Quantum Accuracy */}
                    <td className="py-3 text-center">
                      <span className={`${theme === 'clinical' ? 'text-emerald-600' : 'text-emerald-400'} font-extrabold text-xs`}>
                        {(job.quantumAccuracy * 100).toFixed(1)}%
                      </span>
                    </td>

                    {/* Classical Baseline */}
                    <td className="py-3 text-center">
                      <span className="text-slate-500 font-medium">
                        {(job.classicalAccuracy * 100).toFixed(1)}%
                      </span>
                    </td>

                    {/* Accuracy Gain */}
                    <td className="py-3 text-center">
                      <span className={`font-extrabold text-[10px] px-1.5 py-0.5 rounded ${
                        gain >= 0 
                          ? theme === 'clinical' 
                            ? 'text-emerald-700 bg-emerald-100/50 border border-emerald-200' 
                            : 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
                          : theme === 'clinical' 
                            ? 'text-rose-700 bg-rose-100/50 border border-rose-200' 
                            : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                      }`}>
                        {gain >= 0 ? '+' : ''}{(gain * 100).toFixed(1)}%
                      </span>
                    </td>

                    {/* Simulation Duration */}
                    <td className="py-3 text-center font-medium">
                      {job.executionTimeMs}ms
                    </td>

                    {/* Load workspace buttons */}
                    <td className="py-3 text-right pr-3">
                      <div className="flex items-center justify-end gap-2">
                        {isCurrentActive ? (
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                            theme === 'clinical'
                              ? 'text-emerald-700 bg-emerald-100 border border-emerald-200'
                              : 'text-emerald-400 bg-emerald-400/10 border border-emerald-400/20'
                          }`}>
                            Active
                          </span>
                        ) : (
                          <button
                            onClick={() => handleLoadJob(job)}
                            className={`px-2.5 py-1 text-[9px] font-mono rounded transition flex items-center gap-1 cursor-pointer ${
                              theme === 'clinical'
                                ? 'text-slate-700 bg-slate-100 border border-slate-200 hover:bg-slate-200'
                                : 'text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white'
                            }`}
                          >
                            <Eye className="w-3 h-3 text-blue-500" /> Load
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderBatchQueueSection = () => {
    return (
      <div className={`p-6 rounded-3xl border ${
        theme === 'clinical' ? 'bg-white border-slate-200 text-slate-800 shadow-sm' : 'bg-slate-950 border-slate-900 text-white'
      } space-y-6 animate-fadeIn`}>
        {/* Title */}
        <div className={`flex items-center justify-between border-b pb-3 ${theme === 'clinical' ? 'border-slate-100' : 'border-slate-900'}`}>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className={`text-sm font-mono font-bold tracking-wider uppercase ${theme === 'clinical' ? 'text-slate-900' : 'text-white'}`}>
                Sequential Batch Queue Processor
              </h3>
              <p className="text-[10px] font-mono text-slate-500 uppercase">
                Design, schedule, and compare multiple virtual quantum circuits side-by-side
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={loadSampleQueue}
              disabled={isRunningBatch}
              className={`px-2.5 py-1 text-[10px] font-mono rounded-lg transition-all ${
                theme === 'clinical'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700'
              } disabled:opacity-50 cursor-pointer`}
            >
              Load Research Templates
            </button>
            <button
              onClick={clearBatchQueue}
              disabled={isRunningBatch || (batchQueue.length === 0 && batchResults.length === 0)}
              className={`px-2.5 py-1 text-[10px] font-mono rounded-lg transition-all ${
                theme === 'clinical'
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                  : 'bg-rose-950/20 hover:bg-rose-900/40 text-rose-400 border border-rose-900'
              } disabled:opacity-50 cursor-pointer`}
            >
              Clear Queue & Results
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left panel: Queue Manager */}
          <div className="xl:col-span-4 space-y-4">
            <div className={`p-4 rounded-2xl border ${
              theme === 'clinical' ? 'bg-slate-50/50 border-slate-200' : 'bg-slate-900/10 border-slate-900'
            } space-y-4`}>
              <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                1. Workspace Config Builder
              </h4>
              <p className="text-[10px] text-slate-500 leading-normal">
                Adjust the parameters in the circuit configuration workspace above, then snapshot the current design directly into the queue:
              </p>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Custom config name (e.g. Run ${batchQueue.length + 1})`}
                  value={customConfigName}
                  onChange={e => setCustomConfigName(e.target.value)}
                  disabled={isRunningBatch}
                  className="flex-1 bg-slate-950 border border-slate-900 rounded px-2.5 py-1.5 text-[11px] text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                />
                <button
                  onClick={() => addToBatchQueue()}
                  disabled={isRunningBatch}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-[10px] font-bold uppercase rounded transition-all flex items-center gap-1 shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Queue Current
                </button>
              </div>

              <div className="text-[10px] font-mono border border-slate-900/50 bg-slate-950/40 p-2.5 rounded-lg space-y-1">
                <div className="text-slate-500 uppercase">Workspace Design Snapshot:</div>
                <div className="grid grid-cols-2 gap-x-3 text-slate-400 text-[9px]">
                  <div>Qubits: <span className="text-white font-bold">{qubits}</span></div>
                  <div>Ansatz: <span className="text-purple-400 font-bold">{ansatz}</span></div>
                  <div>Encoding: <span className="text-sky-400 font-bold">{encodingType}</span></div>
                  <div>Noise: <span className="text-amber-500 font-bold">{(noiseLevel*100).toFixed(1)}%</span></div>
                  <div className="col-span-2 text-slate-500 pt-1 border-t border-slate-900 mt-1">
                    Parameters: θ={thetaValue.toFixed(2)} | β={betaValue.toFixed(2)} | γ={gammaValue.toFixed(2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Queue List */}
            <div className="space-y-2">
              <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>2. Scheduled Queue ({batchQueue.length} items)</span>
                {batchQueue.length > 0 && !isRunningBatch && (
                  <button
                    onClick={runBatchSequentially}
                    className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-[10px] uppercase rounded transition-all flex items-center gap-1 cursor-pointer shadow-sm shadow-emerald-500/20"
                  >
                    <PlayCircle className="w-3.5 h-3.5" /> Start Sequential Run
                  </button>
                )}
              </h4>

              {batchQueue.length === 0 ? (
                <div className={`p-6 border border-dashed rounded-xl text-center text-slate-500 text-[11px] ${
                  theme === 'clinical' ? 'bg-slate-50/20 border-slate-200' : 'bg-slate-950/20 border-slate-900'
                }`}>
                  Queue is empty. Click "Queue Current" or "Load Research Templates" above to fill.
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {batchQueue.map((item, idx) => {
                    const isProcessing = isRunningBatch && currentBatchIndex === idx;
                    const isUpcoming = isRunningBatch && idx > currentBatchIndex;
                    const isDone = isRunningBatch && idx < currentBatchIndex;

                    return (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                          isProcessing
                            ? 'border-emerald-500/50 bg-emerald-950/10 text-white animate-pulse'
                            : isDone
                              ? 'border-slate-900/60 bg-slate-950/30 text-slate-500'
                              : 'border-slate-900 bg-slate-950 text-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold text-slate-500">
                              #{idx + 1}
                            </span>
                            <span className="font-sans font-semibold text-xs truncate max-w-[170px]" title={item.name}>
                              {item.name}
                            </span>
                          </div>
                          <div className="font-mono text-[9px] text-slate-500 flex flex-wrap gap-x-2">
                            <span>Qubits: {item.qubits}</span>
                            <span>Ansatz: {item.ansatz}</span>
                            <span>Noise: {(item.noiseLevel*100).toFixed(1)}%</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {isProcessing && (
                            <span className="text-[8px] font-mono font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded uppercase border border-emerald-500/20 animate-bounce">
                              RUNNING
                            </span>
                          )}
                          {isDone && (
                            <span className="text-[8px] font-mono font-bold text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded uppercase">
                              COMPLETED
                            </span>
                          )}
                          {isUpcoming && (
                            <span className="text-[8px] font-mono font-bold text-slate-600 bg-slate-950 px-1.5 py-0.5 rounded uppercase">
                              QUEUED
                            </span>
                          )}
                          {!isRunningBatch && (
                            <button
                              onClick={() => removeFromBatchQueue(item.id)}
                              className="p-1 rounded hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 transition cursor-pointer"
                              title="Delete config"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Comparative Table and Progress */}
          <div className="xl:col-span-8 flex flex-col justify-between">
            {isRunningBatch ? (
              <div className="h-full flex flex-col items-center justify-center p-8 border border-slate-900 bg-slate-950/40 rounded-2xl min-h-[350px] space-y-6">
                <div className="relative flex items-center justify-center w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-slate-900 border-t-emerald-500 animate-spin"></div>
                  <Atom className="w-7 h-7 text-emerald-400 animate-pulse" />
                </div>
                
                <div className="text-center space-y-2 max-w-md">
                  <h4 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                    Running Sequential Circuit Configuration Batch
                  </h4>
                  <p className="text-[11px] font-mono text-slate-500">
                    Configuration {currentBatchIndex + 1} of {batchQueue.length} in progress...
                  </p>
                  <p className="text-xs text-emerald-400 animate-pulse font-mono max-w-xs truncate mx-auto">
                    {batchQueue[currentBatchIndex]?.name}
                  </p>
                </div>

                <div className="w-full max-w-xs bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${((currentBatchIndex) / batchQueue.length) * 100}%` }}
                  />
                </div>
              </div>
            ) : batchResults.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 border border-dashed border-slate-900 bg-slate-950/20 rounded-2xl min-h-[350px] text-center space-y-4">
                <GitCompare className="w-10 h-10 text-slate-600 animate-pulse" />
                <div className="space-y-1.5 max-w-md">
                  <h4 className="text-xs font-mono font-bold text-white uppercase">Awaiting Sequential Batch Runs</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                    Load templates or add custom configurations on the left, then click <strong>"Start Sequential Run"</strong>. The QPU simulator will sequentially run each design and synthesize their final state probability vectors into a compact heatmap comparison matrix below.
                  </p>
                </div>
              </div>
            ) : (() => {
              const maxQ = Math.max(...batchResults.map(r => r.qubits));
              const numStates = Math.pow(2, maxQ);
              const states: string[] = [];
              for (let i = 0; i < numStates; i++) {
                states.push(i.toString(2).padStart(maxQ, '0'));
              }

              return (
                <div className="space-y-5 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Compiled Batch Performance Matrix
                    </h4>
                    <span className="text-[9px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20 rounded">
                      Batch complete: {batchResults.length} configurations
                    </span>
                  </div>

                  {/* Summary Table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950 font-mono">
                    <table className="w-full text-left font-mono text-[10px] border-collapse">
                      <thead>
                        <tr className="border-b border-slate-900 text-slate-500 text-[9px] uppercase bg-slate-900/10">
                          <th className="py-2.5 px-3">Configuration Run</th>
                          <th className="py-2.5 px-2">Qubits/Ansatz</th>
                          <th className="py-2.5 px-2 text-center">Fidelity</th>
                          <th className="py-2.5 px-2 text-center">Accuracy</th>
                          <th className="py-2.5 px-2 text-center">Gain vs. Baseline</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-900/60">
                        {batchResults.map((result, idx) => {
                          const gain = result.quantumAccuracy - result.classicalAccuracy;
                          return (
                            <tr key={idx} className="hover:bg-slate-900/20 transition-all">
                              <td className="py-2.5 px-3 font-sans font-semibold text-white">
                                {result.name}
                              </td>
                              <td className="py-2.5 px-2 text-slate-400">
                                {result.qubits}Q • {result.ansatz}
                              </td>
                              <td className="py-2.5 px-2 text-center font-bold text-slate-300">
                                {(result.fidelity * 100).toFixed(1)}%
                              </td>
                              <td className="py-2.5 px-2 text-center font-bold text-emerald-400">
                                {(result.quantumAccuracy * 100).toFixed(1)}%
                              </td>
                              <td className="py-2.5 px-2 text-center">
                                <span className={`font-extrabold text-[9px] px-1.5 py-0.5 rounded ${
                                  gain >= 0
                                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                                    : 'text-rose-400 bg-rose-500/10 border border-rose-500/20'
                                }`}>
                                  {gain >= 0 ? '+' : ''}{(gain * 100).toFixed(1)}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Superposition Amplitude Matrix Heatmap */}
                  <div className="space-y-2.5">
                    <h4 className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <span>⚡ Superposition state vector comparison spectrum matrix</span>
                    </h4>

                    <div className="overflow-x-auto rounded-xl border border-slate-900 bg-slate-950">
                      <table className="w-full text-center font-mono text-[10px] border-collapse">
                        <thead>
                          <tr className="border-b border-slate-900 text-slate-500 text-[9px] uppercase bg-slate-900/10">
                            <th className="py-2.5 px-3 text-left">Configuration</th>
                            {states.map(state => (
                              <th key={state} className="py-2.5 px-2">|{state}⟩</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900/60">
                          {batchResults.map((result, rIdx) => {
                            return (
                              <tr key={rIdx} className="hover:bg-slate-900/20 transition-all">
                                <td className="py-2.5 px-3 text-left font-sans font-medium text-slate-300 max-w-[150px] truncate" title={result.name}>
                                  {result.name}
                                </td>
                                {states.map(state => {
                                  const count = result.qubitMeasurements[state] || 0;
                                  const prob = count / 10;
                                  const opacity = Math.min(1, Math.max(0.05, count / 1000));
                                  const hasNonZero = count > 0;

                                  return (
                                    <td
                                      key={state}
                                      className="py-2.5 px-2 relative group cursor-help transition-all"
                                      style={{
                                        backgroundColor: hasNonZero ? `rgba(16, 185, 129, ${opacity * 0.25})` : 'transparent'
                                      }}
                                    >
                                      <span className={`font-bold ${hasNonZero ? 'text-emerald-400' : 'text-slate-700'}`}>
                                        {prob.toFixed(1)}%
                                      </span>
                                      
                                      {/* Tooltip on Hover */}
                                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 hidden group-hover:block bg-slate-900 text-white font-mono text-[8px] p-2 rounded-lg border border-slate-800 shadow-xl z-50 pointer-events-none whitespace-nowrap leading-relaxed">
                                        <div className="text-emerald-400 font-bold">State |{state}⟩</div>
                                        <div>Shots: {count} / 1000</div>
                                        <div>Overlap: {prob.toFixed(2)}%</div>
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-white">Quantum Computing Kernels</h2>
        <p className="text-slate-500 text-xs font-mono uppercase mt-1">Design PQCs and measure qubit entanglement probabilities</p>
      </div>

      {!activeProject || !activeDataset ? (
        <div className="p-8 border border-slate-900 bg-slate-950 rounded-2xl text-center space-y-3">
          <ShieldAlert className="w-8 h-8 text-yellow-500 mx-auto" />
          <h4 className="text-sm font-mono font-bold text-white uppercase">Dataset context not established</h4>
          <p className="text-xs text-slate-500">Please upload a transcriptomic dataset first in order to compile Quantum Kernels.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Circuit Design Panel */}
          <div className="lg:col-span-5 space-y-6">
            {/* Quantum Preset Library Card */}
            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-4">
              <h3 className="text-sm font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
                <Compass className="w-4 h-4 text-emerald-400" /> QUANTUM PRESET LIBRARY
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">Select Common Gate Sequence Preset</label>
                  <select
                    value={selectedPresetId}
                    onChange={e => handleSelectPreset(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition cursor-pointer"
                  >
                    <option value="">-- Choose a preconfigured gate sequence preset... --</option>
                    {QUANTUM_PRESETS.map(preset => (
                      <option key={preset.id} value={preset.id}>
                        {preset.name} ({preset.qubits} Q, Depth {preset.circuitDepth})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPresetId && (() => {
                  const preset = QUANTUM_PRESETS.find(p => p.id === selectedPresetId);
                  if (!preset) return null;
                  return (
                    <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 space-y-3 animate-fadeIn">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1 text-emerald-400 font-mono text-xs font-bold">
                          <Wand2 className="w-3.5 h-3.5" />
                          <span>{preset.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                          {preset.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-slate-900/60 pt-2.5">
                        <div>
                          <span className="text-slate-500 uppercase">Qubits:</span>{' '}
                          <span className="text-white font-bold">{preset.qubits}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase">Est. Depth:</span>{' '}
                          <span className="text-white font-bold">{preset.circuitDepth}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase">Encoding:</span>{' '}
                          <span className="text-white font-bold">{preset.encodingType}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 uppercase">Ansatz:</span>{' '}
                          <span className="text-white font-bold">{preset.ansatz}</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-900/60 pt-2.5 space-y-1.5">
                        <span className="block text-[10px] font-mono text-slate-500 uppercase">Logical Gate Sequence:</span>
                        <div className="bg-slate-950 p-2 rounded border border-slate-900 text-[10px] font-mono text-emerald-400 max-h-32 overflow-y-auto leading-normal space-y-1">
                          {preset.sequenceSteps.map((step, idx) => (
                            <div key={idx} className="flex gap-1">
                              <span className="text-slate-600 select-none">{idx + 1}.</span>
                              <span className="break-all">{step}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="text-[10px] space-y-1 border-t border-slate-900/60 pt-2">
                        <p className="leading-relaxed font-sans">
                          <strong className="font-mono text-slate-500 uppercase">Operation:</strong>{' '}
                          <span className="text-slate-300">{preset.explanation}</span>
                        </p>
                        <p className="leading-relaxed font-sans">
                          <strong className="font-mono text-slate-500 uppercase">Expected State:</strong>{' '}
                          <span className="text-emerald-300">{preset.expectedOutcome}</span>
                        </p>
                      </div>

                      <div className="pt-1.5 flex items-center justify-between text-[9px] font-mono text-slate-500">
                        <span>💡 Slider parameters pre-tuned</span>
                        <button
                          onClick={() => handleSelectPreset(preset.id)}
                          className="px-2 py-0.5 bg-slate-900 hover:bg-slate-850 hover:text-white border border-slate-800 rounded transition cursor-pointer"
                        >
                          Reset Parameters
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-4">
              <h3 className="text-sm font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" /> KERNEL COMPILER CONFIG
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Target Qubits ({qubits})</label>
                  <input
                    type="range"
                    min="2"
                    max="4"
                    value={qubits}
                    onChange={e => setQubits(parseInt(e.target.value))}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between font-mono text-[8px] text-slate-500 px-1 mt-1">
                    <span>2 QUBITS (DIM 4)</span>
                    <span>3 QUBITS (DIM 8)</span>
                    <span>4 QUBITS (DIM 16)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">State Encoding Scheme</label>
                  <select
                    value={encodingType}
                    onChange={e => setEncodingType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="Angle">Angle Encoding (Ry Rotation mapping)</option>
                    <option value="Amplitude">Amplitude Encoding (Dense state packing)</option>
                    <option value="Basis">Basis Encoding (Binary thresholding)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Ansatz Design Pattern</label>
                  <select
                    value={ansatz}
                    onChange={e => setAnsatz(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white focus:outline-none"
                  >
                    <option value="RealAmplitudes">RealAmplitudes (Highly entangled Ry-CNOT loop)</option>
                    <option value="HardwareEfficient">HardwareEfficient (Rx, Rz, CNOT lattice)</option>
                    <option value="QAOA">QAOA (Ising coupling target optimization)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1">Noise & Decoherence Model (Fidelity)</label>
                  <input
                    type="range"
                    min="0"
                    max="0.05"
                    step="0.005"
                    value={noiseLevel}
                    onChange={e => setNoiseLevel(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex justify-between font-mono text-[8px] text-slate-500 px-1 mt-1">
                    <span>0% (IDEAL SIMULATOR)</span>
                    <span>2.5%</span>
                    <span>5% (DECOHERENCE THRESHOLD)</span>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading || runningJob}
                  className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" /> {loading || runningJob ? 'COMPILING QUBIT LATTICE...' : 'EXECUTE HYBRID JOB'}
                </button>

                {/* Dynamic Progress Bar */}
                {(runningJob || (progress > 0 && activeQuantumJob)) && (
                  <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-900/40">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className={`${theme === 'clinical' ? 'text-slate-600 font-bold' : 'text-slate-400'} uppercase tracking-wider`}>
                        {runningJob ? (
                          progress < 15 ? 'INITIALIZING...' :
                          progress < 30 ? 'ALLOCATING REGISTERS...' :
                          progress < 45 ? 'ENCODING STATE...' :
                          progress < 75 ? 'COMPILING ANSATZ...' :
                          progress < 90 ? 'SIMULATING NOISE...' :
                          progress < 100 ? 'SAMPLING QPU...' : 'COMPLETING...'
                        ) : 'SIMULATION COMPLETED'}
                      </span>
                      <span className={`${theme === 'clinical' ? 'text-emerald-700' : 'text-emerald-400'} font-bold`}>{progress}%</span>
                    </div>
                    <div className={`w-full border rounded-full h-2 overflow-hidden ${
                      theme === 'clinical' ? 'bg-slate-200 border-slate-300' : 'bg-slate-900 border-slate-800'
                    }`}>
                      <div 
                        className={`h-full transition-all duration-300 ease-out ${
                          runningJob ? 'animate-pulse' : ''
                        } ${
                          theme === 'clinical' ? 'bg-emerald-600' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* PQC Visualizer Workspace */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <div className="flex items-center gap-2">
                  <Atom className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-mono font-bold tracking-wider text-slate-400 uppercase">
                    PQC CIRCUIT DESIGN & PARAMETER MONITOR
                  </h3>
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase">
                  Real-time State Representation
                </div>
              </div>

              <div className="space-y-4">
                {/* Circuit SVG area */}
                <div className="relative">
                  {renderQuantumCircuit()}
                  <div className="absolute top-2 right-2 bg-slate-950/80 border border-slate-900/80 px-2 py-1 rounded text-[9px] font-mono text-slate-500 select-none">
                    CLICK GATES TO INSPECT
                  </div>
                </div>

                {/* Interactive Gate Inspector & Real-time Tuner Panel */}
                <div className="p-4 rounded-xl border border-slate-900/60 bg-slate-900/25 space-y-4">
                  {selectedGate ? (
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Active Element:</span>
                            <span className="text-xs font-mono font-bold text-white px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                              Qubit [{selectedGate.qubit}]
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                            {selectedGate.name}
                          </h4>
                        </div>
                        <button 
                          onClick={() => setSelectedGate(null)}
                          className="p-1 hover:bg-slate-900 rounded-lg text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed font-sans">
                        {selectedGate.role}
                      </p>

                      {/* Slider controls if tunable */}
                      {selectedGate.parameterName && (
                        <div className="space-y-2 pt-2 border-t border-slate-900/40">
                          <div className="flex items-center justify-between text-xs font-mono">
                            <span className="text-slate-400">Parameter {selectedGate.parameterName} Value</span>
                            <span className="text-emerald-400 font-bold">{selectedGate.parameterValue.toFixed(3)} rad</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => {
                                const newVal = Math.max(0, selectedGate.parameterValue - 0.05);
                                selectedGate.setParameter(newVal);
                                setSelectedGate(prev => ({ ...prev, parameterValue: newVal }));
                              }}
                              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded text-xs font-mono transition-colors cursor-pointer"
                            >
                              -0.05
                            </button>
                            <input 
                              type="range"
                              min="0"
                              max="6.283"
                              step="0.01"
                              value={selectedGate.parameterValue}
                              onChange={e => {
                                const newVal = parseFloat(e.target.value);
                                selectedGate.setParameter(newVal);
                                setSelectedGate(prev => ({ ...prev, parameterValue: newVal }));
                              }}
                              className="flex-1 h-1 bg-slate-950 rounded appearance-none cursor-pointer accent-emerald-500"
                            />
                            <button
                              onClick={() => {
                                const newVal = Math.min(6.283, selectedGate.parameterValue + 0.05);
                                selectedGate.setParameter(newVal);
                                setSelectedGate(prev => ({ ...prev, parameterValue: newVal }));
                              }}
                              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded text-xs font-mono transition-colors cursor-pointer"
                            >
                              +0.05
                            </button>
                          </div>
                          <div className="flex justify-between text-[9px] font-mono text-slate-600">
                            <span>0.00 (0°)</span>
                            <span>3.14 (π)</span>
                            <span>6.28 (2π)</span>
                          </div>
                        </div>
                      )}

                      {/* Display matrix or formula */}
                      <div className="pt-2 border-t border-slate-900/40">
                        {selectedGate.matrix ? (
                          <div className="space-y-1.5">
                            <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                              Quantum Unitary Matrix U({selectedGate.parameterName || 'x'})
                            </label>
                            <div className="flex items-center justify-center gap-4 bg-slate-950 p-2.5 rounded-lg border border-slate-900 font-mono text-xs text-slate-300">
                              <span className="text-xl text-slate-600 font-light select-none">[</span>
                              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-center min-w-[130px]">
                                {selectedGate.matrix.map((row: any[], rIdx: number) => 
                                  row.map((val: any, cIdx: number) => (
                                    <span key={`${rIdx}-${cIdx}`} className="text-emerald-400 font-bold tracking-tight">
                                      {val}
                                    </span>
                                  ))
                                )}
                              </div>
                              <span className="text-xl text-slate-600 font-light select-none">]</span>
                            </div>
                          </div>
                        ) : selectedGate.formula ? (
                          <div className="space-y-1.5">
                            <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                              Operator Representation Formula
                            </label>
                            <pre className="p-2.5 bg-slate-950 rounded-lg border border-slate-900 font-mono text-[9px] text-emerald-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                              {selectedGate.formula}
                            </pre>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider">
                          Global Parameter Tuning Console
                        </h4>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-900 space-y-2">
                          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                            <span>Ansatz Angle θ (Theta)</span>
                            <span className="text-purple-400 font-bold font-mono">{thetaValue.toFixed(2)} rad</span>
                          </div>
                          <input 
                            type="range"
                            min="0"
                            max="6.28"
                            step="0.05"
                            value={thetaValue}
                            onChange={e => setThetaValue(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-purple-500"
                          />
                          <p className="text-[9px] font-mono text-slate-500 leading-tight">
                            Alters state vector positions for all Ry(θ) rotation operations in the current ansatz.
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-900 space-y-2">
                          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                            <span>Mixer Angle β (Beta)</span>
                            <span className="text-pink-400 font-bold font-mono">{betaValue.toFixed(2)} rad</span>
                          </div>
                          <input 
                            type="range"
                            min="0"
                            max="6.28"
                            step="0.05"
                            value={betaValue}
                            onChange={e => setBetaValue(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-pink-500"
                          />
                          <p className="text-[9px] font-mono text-slate-500 leading-tight">
                            Regulates Rx(β) mixers in QAOA and HardwareEfficient designs to control superposition amplitude.
                          </p>
                        </div>

                        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-900 space-y-2">
                          <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                            <span>Phase Angle γ (Gamma)</span>
                            <span className="text-amber-400 font-bold font-mono">{gammaValue.toFixed(2)} rad</span>
                          </div>
                          <input 
                            type="range"
                            min="0"
                            max="6.28"
                            step="0.05"
                            value={gammaValue}
                            onChange={e => setGammaValue(parseFloat(e.target.value))}
                            className="w-full h-1 bg-slate-900 rounded appearance-none cursor-pointer accent-amber-400"
                          />
                          <p className="text-[9px] font-mono text-slate-500 leading-tight">
                            Tunes Z-axis phase relations and regulatory Ising interaction coupling ZZ matrices.
                          </p>
                        </div>
                      </div>
                      
                      <p className="text-[9px] font-mono text-slate-500 text-center select-none pt-1">
                        💡 Tip: Click any gate directly in the circuit schematic above to inspect its mathematical unitary matrix!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* QPU Real-time simulation log monitor */}
            <div className="p-5 bg-slate-950 rounded-2xl border border-slate-900 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <h4 className="text-[11px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                    QPU REAL-TIME SIMULATION MONITOR
                  </h4>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-1.5 w-1.5 relative">
                    {runningJob ? (
                      <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                      </>
                    ) : (
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-slate-600"></span>
                    )}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 uppercase">
                    {runningJob ? 'RUNNING' : 'STANDBY'}
                  </span>
                </div>
              </div>

              <div className="font-mono text-[10px] space-y-2 max-h-48 overflow-y-auto pr-1 select-text scrollbar-thin scrollbar-thumb-slate-800">
                {simLogs.map((log) => {
                  let badgeColor = 'text-slate-400 bg-slate-900 border-slate-800';
                  let logIcon = '●';
                  if (log.type === 'success') {
                    badgeColor = 'text-emerald-400 bg-emerald-950/20 border-emerald-900/30';
                    logIcon = '✓';
                  } else if (log.type === 'warn') {
                    badgeColor = 'text-amber-500 bg-amber-950/20 border-amber-900/30';
                    logIcon = '⚠';
                  } else if (log.type === 'process') {
                    badgeColor = 'text-blue-400 bg-blue-950/20 border-blue-900/30';
                    logIcon = '⚡';
                  }

                  return (
                    <div key={log.id} className="flex items-start gap-2 py-0.5 leading-relaxed">
                      <span className="text-slate-600 shrink-0 text-[8px] select-none mt-0.5">[{log.time}]</span>
                      <span className={`inline-flex items-center justify-center w-4.5 h-4.5 rounded border text-[9px] shrink-0 font-bold ${badgeColor}`}>
                        {logIcon}
                      </span>
                      <span className={`flex-1 ${
                        log.type === 'success' 
                          ? 'text-emerald-400 font-medium' 
                          : log.type === 'warn' 
                          ? 'text-amber-500' 
                          : log.type === 'process'
                          ? 'text-blue-400 font-medium'
                          : 'text-slate-400'
                      }`}>
                        {log.msg}
                      </span>
                    </div>
                  );
                })}
                {runningJob && (
                  <div className="flex items-center gap-2 text-emerald-400 animate-pulse py-0.5">
                    <span className="text-slate-600 text-[8px] select-none">[{new Date().toLocaleTimeString()}]</span>
                    <span className="inline-flex items-center justify-center w-4.5 h-4.5 rounded border border-emerald-500/20 bg-emerald-500/10 text-[9px] shrink-0 font-bold">
                      ⚡
                    </span>
                    <span>QPU processing active. Measuring state matrices...</span>
                  </div>
                )}
                <div ref={terminalEndRef} />
              </div>
            </div>
          </div>

          {/* Right Simulation outputs */}
          <div className="lg:col-span-7 space-y-6">
            {activeQuantumJob ? (
              <div className="space-y-6">
                {/* Dynamic Bloch Sphere projection */}
                <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950 space-y-4">
                  <h3 className="text-sm font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Bloch Sphere State Vectors
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {activeQuantumJob.blochCoordinates.map((coords, idx) =>
                      renderBlochSphere(idx, coords)
                    )}
                  </div>
                </div>

                {/* Accuracy comparison & stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-5 rounded-2xl border ${theme === 'clinical' ? 'border-emerald-300 bg-emerald-50/50' : 'border-emerald-500/20 bg-emerald-950/20'} space-y-1.5`}>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${theme === 'clinical' ? 'text-emerald-800' : 'text-emerald-400'}`}>Quantum Accuracy</span>
                    <span className={`text-3xl font-extrabold tracking-tight ${theme === 'clinical' ? 'text-emerald-700' : 'text-emerald-400'}`}>{(activeQuantumJob.quantumAccuracy * 100).toFixed(1)}%</span>
                  </div>
                  <div className={`p-5 rounded-2xl border ${theme === 'clinical' ? 'border-slate-300 bg-slate-50/50' : 'border-slate-800 bg-slate-900/40'} space-y-1.5`}>
                    <span className={`text-[10px] font-mono font-bold uppercase tracking-wider block ${theme === 'clinical' ? 'text-slate-600' : 'text-slate-400'}`}>Classical Baseline</span>
                    <span className={`text-3xl font-extrabold tracking-tight ${theme === 'clinical' ? 'text-slate-800' : 'text-slate-200'}`}>{(activeQuantumJob.classicalAccuracy * 100).toFixed(1)}%</span>
                  </div>
                </div>

                {/* Measurements Shots Histogram */}
                <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-mono font-bold tracking-wider text-slate-500 uppercase">
                      Measurement Frequencies (1000 Shots)
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                        Fidelity: {(activeQuantumJob.fidelity * 100).toFixed(2)}%
                      </span>
                      <button
                        onClick={() => setShowExportModal(true)}
                        className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-[9px] uppercase tracking-wider rounded transition flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/20"
                      >
                        <Download className="w-3 h-3 animate-bounce" /> Export Results
                      </button>
                    </div>
                  </div>

                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getMeasurementData()} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" />
                        <XAxis dataKey="state" stroke="#475569" fontSize={10} fontFamily="monospace" />
                        <YAxis stroke="#475569" fontSize={10} fontFamily="monospace" />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} labelStyle={{ color: '#10b981' }} />
                        <Bar dataKey="shots" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 border border-slate-900 bg-slate-950 rounded-2xl text-center space-y-3 py-20">
                <Atom className="w-10 h-10 text-slate-600 mx-auto animate-spin" />
                <h4 className="text-sm font-mono font-bold text-white uppercase">Quantum Cores Standby</h4>
                <p className="text-xs text-slate-500">Submit a hybrid classical-quantum job to map genetic matrices to state-vector spheres.</p>
              </div>
            )}
          </div>
        </div>

        {/* Batch Processing Queue Row */}
        <div className="mt-8 border-t border-slate-900/60 pt-8 space-y-8">
          {renderBatchQueueSection()}
        </div>

        {/* History Log and Comparison Playground Row */}
        <div className="mt-8 border-t border-slate-900/60 pt-8 space-y-8">
          {renderComparisonSection()}
          {renderHistoryRegistry()}
        </div>
      </>
      )}

      {/* Export Results Modal Overlay */}
      {showExportModal && activeQuantumJob && (() => {
        const exportData = generateStateVectorSnapshot();
        if (!exportData) return null;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md" id="export-modal-overlay" onClick={(e) => {
            if ((e.target as HTMLElement).id === 'export-modal-overlay') setShowExportModal(false);
          }}>
            <div className="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl shadow-emerald-500/10">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-900 px-6 py-4 bg-slate-900/30">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-mono font-bold tracking-wider text-white uppercase">
                      Quantum State Vector & Metadata Export
                    </h3>
                    <p className="text-[10px] font-mono text-slate-500 uppercase">Compiled simulation snapshot for validation</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowExportModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content Scroll Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Metadata */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-1.5 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-blue-400" /> Circuit & Environment Metadata
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-3 font-mono text-[10px]">
                      <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-0.5">
                        <span className="text-slate-500 block text-[9px] uppercase">PROJECT ID</span>
                        <span className="text-white font-medium truncate block">{exportData.metadata.projectName}</span>
                      </div>
                      <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-0.5">
                        <span className="text-slate-500 block text-[9px] uppercase">DISEASE TARGET</span>
                        <span className="text-white font-medium truncate block">{exportData.metadata.diseaseContext}</span>
                      </div>
                      <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-0.5">
                        <span className="text-slate-500 block text-[9px] uppercase">QUBITS & DIMENSION</span>
                        <span className="text-emerald-400 font-bold block">{exportData.metadata.qubits} Qubits (d={Math.pow(2, exportData.metadata.qubits)})</span>
                      </div>
                      <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-0.5">
                        <span className="text-slate-500 block text-[9px] uppercase">CIRCUIT DEPTH / GATES</span>
                        <span className="text-white font-medium block">{exportData.metadata.circuitDepth} Layers / {exportData.metadata.gateCount} Gates</span>
                      </div>
                      <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-0.5">
                        <span className="text-slate-500 block text-[9px] uppercase">ENCODING SCHEME</span>
                        <span className="text-sky-400 font-bold block">{exportData.metadata.encodingType}</span>
                      </div>
                      <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-0.5">
                        <span className="text-slate-500 block text-[9px] uppercase">ANSATZ PATTERN</span>
                        <span className="text-purple-400 font-bold block">{exportData.metadata.ansatz}</span>
                      </div>
                      <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-0.5">
                        <span className="text-slate-500 block text-[9px] uppercase">NOISE / FIDELITY</span>
                        <span className="text-amber-500 font-bold block">{(exportData.metadata.noiseLevel * 100).toFixed(2)}% / {(exportData.metadata.fidelity * 100).toFixed(2)}%</span>
                      </div>
                      <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl space-y-0.5">
                        <span className="text-slate-500 block text-[9px] uppercase">HYBRID PERFORMANCE</span>
                        <span className="text-emerald-400 font-bold block">{(exportData.metadata.quantumAccuracy * 100).toFixed(1)}% Accuracy</span>
                      </div>
                    </div>

                    {/* Bloch Coordinate Log */}
                    <div className="space-y-2">
                      <h5 className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Atom className="w-3 h-3 text-emerald-400" /> BLOCH VECTOR COORDINATES
                      </h5>
                      <div className="bg-slate-950 border border-slate-900 p-3 rounded-xl space-y-1.5 max-h-24 overflow-y-auto scrollbar-thin">
                        {exportData.blochSpheres.map((sphere) => (
                          <div key={sphere.qubitIndex} className="flex justify-between font-mono text-[9px] text-slate-400">
                            <span className="text-emerald-400 font-bold">Qubit [{sphere.qubitIndex}]</span>
                            <span className="text-slate-500">X: {sphere.x.toFixed(4)} | Y: {sphere.y.toFixed(4)} | Z: {sphere.z.toFixed(4)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: State Vector List */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-1.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400" /> CALCULATED STATE VECTOR |Ψ⟩
                    </h4>
                    
                    <div className="bg-slate-950 border border-slate-900 rounded-xl divide-y divide-slate-900 max-h-72 overflow-y-auto scrollbar-thin">
                      {exportData.stateVector.map((vec) => (
                        <div key={vec.state} className="p-2.5 flex items-center justify-between font-mono text-[10px] hover:bg-slate-900/20 transition">
                          <div className="space-y-0.5">
                            <span className="text-emerald-400 font-bold text-xs">{vec.state}</span>
                            <span className="text-slate-500 text-[8px] block">PROB: {(vec.probability * 100).toFixed(2)}% | SHOTS: {vec.shots}</span>
                          </div>
                          <div className="text-right space-y-0.5">
                            <span className="text-white font-medium">{vec.amplitude.formatted}</span>
                            <span className="text-slate-500 text-[8px] block">MAG: {vec.amplitude.magnitude.toFixed(3)} | ∠{vec.amplitude.phaseDeg.toFixed(1)}°</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* JSON Code block representation */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">RAW JSON SNAPSHOT PAYLOAD</h4>
                  <div className="relative group">
                    <pre className="p-4 bg-slate-950 border border-slate-900 rounded-2xl font-mono text-[9px] text-slate-400 overflow-x-auto max-h-40 overflow-y-auto select-all scrollbar-thin">
                      {JSON.stringify(exportData, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Footer controls */}
              <div className="flex items-center justify-between border-t border-slate-900 px-6 py-4 bg-slate-900/10">
                <span className="text-[9px] font-mono text-slate-500">TIMESTAMP: {new Date(exportData.metadata.timestamp).toLocaleString()}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleCopyJSON(exportData)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 cursor-pointer border border-slate-800"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                    {copied ? 'Copied Snapshot' : 'Copy JSON'}
                  </button>
                  <button
                    onClick={() => handleDownloadJSON(exportData)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-500/20"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Snapshot
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
