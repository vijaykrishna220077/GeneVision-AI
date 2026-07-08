/**
 * GeneVision AI - Shared Types
 */

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  institution: string;
}

export interface Project {
  id: string;
  // Owning user's id, or 'demo' for the shared, read-only sample projects
  // every account sees. Used to scope all project/dataset/prediction/
  // quantumJob/log queries per-user.
  userId: string;
  name: string;
  description: string;
  diseaseType: DiseaseType;
  createdAt: string;
}

export type DiseaseType =
  | 'Breast Cancer'
  | 'Lung Cancer'
  | 'Colon Cancer'
  | 'Leukemia'
  | 'Alzheimer\'s Disease'
  | 'Parkinson\'s Disease'
  | 'Diabetes'
  | 'Heart Disease'
  | 'Rare Diseases';

export interface Dataset {
  id: string;
  projectId: string;
  name: string;
  fileType: 'CSV' | 'TSV' | 'FASTA' | 'VCF' | 'JSON';
  uploadedAt: string;
  rowCount: number;
  columnCount: number;
  genesDetected: string[];
  summaryStats: {
    meanExpression: number;
    variance: number;
    missingValues: number;
    mutationRate: number;
  };
  rawData: any[];
}

export interface PredictionResult {
  id: string;
  projectId: string;
  datasetId: string;
  modelType: string;
  diseaseType: string;
  overallRiskScore: number; // 0 - 100
  riskCategory: 'Low' | 'Moderate' | 'High' | 'Critical';
  predictionAccuracy: number; // 0 - 1
  classifiedAt: string;
  geneRankings: GeneRanking[];
  confusionMatrix: {
    tp: number;
    fp: number;
    fn: number;
    tn: number;
  };
}

export interface GeneRanking {
  geneName: string;
  expressionLevel: number;
  shapValue: number;
  importance: number; // 0 - 1
  pvalue: number;
  chromosome: string;
  diseaseAssociation: string;
}

export interface QuantumJob {
  id: string;
  projectId: string;
  datasetId: string;
  qubits: number;
  circuitDepth: number;
  gateCount: number;
  encodingType: 'Angle' | 'Amplitude' | 'Basis';
  ansatz: 'HardwareEfficient' | 'QAOA' | 'RealAmplitudes';
  status: 'pending' | 'running' | 'completed' | 'failed';
  fidelity: number;
  qubitMeasurements: { [state: string]: number };
  quantumAccuracy: number;
  classicalAccuracy: number;
  blochCoordinates: { x: number; y: number; z: number }[];
  noiseLevel: number;
  createdAt: string;
  executionTimeMs: number;
  // Advanced scientifically accurate simulation metrics
  purity?: number;
  entropy?: number;
  densityMatrixHeatmap?: { r: number; c: number; real: number; imag: number }[];
  gateMatrix?: { r: number; c: number; real: number; imag: number }[];
  amplitudeTable?: { state: string; real: number; imag: number; prob: number; phase: number }[];
  entanglementGraph?: {
    nodes: { id: string; label: string; size: number }[];
    edges: { source: string; target: string; value: number }[];
  };
  expectationValue?: number;
  algorithmLogs?: string[];
}

export interface PathwayNode {
  id: string;
  label: string;
  type: 'gene' | 'protein' | 'pathway' | 'drug';
  expressionLevel?: number;
  activityState?: 'active' | 'suppressed' | 'neutral';
}

export interface PathwayEdge {
  id: string;
  source: string;
  target: string;
  type: 'activation' | 'inhibition' | 'association';
}

export interface BiologicalPathway {
  id: string;
  name: string;
  source: 'KEGG' | 'Reactome' | 'WikiPathways';
  impactScore: number; // 0 - 100
  genesInvolved: string[];
  nodes: PathwayNode[];
  edges: PathwayEdge[];
  description: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  referencedGenes?: string[];
  referencedPathways?: string[];
}

export interface ActivityLog {
  id: string;
  // Owning user's id, or 'demo' for the seeded sample activity. Logs are
  // filtered per-user the same way projects are.
  userId: string;
  type: 'upload' | 'prediction' | 'quantum' | 'auth' | 'project';
  description: string;
  timestamp: string;
  details?: string;
}

export interface LiveGeneDetails {
  symbol: string;
  name: string;
  aliases: string[];
  chromosome: string;
  cytogeneticBand: string;
  coordinates: {
    start: number;
    end: number;
  };
  strand: string;
  description: string;
  transcriptCount: number;
  proteinProducts: string[];
  geneFamily: string[];
  externalReferences: {
    ncbiId: string;
    ensemblId: string;
    hgncId: string;
    ucscUrl: string;
    clinVarUrl: string;
  };
  assembly: string;
  approvedTherapies?: string[];
  mutationRate?: string;
}

