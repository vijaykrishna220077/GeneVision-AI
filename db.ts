import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Project, Dataset, PredictionResult, QuantumJob, ActivityLog, BiologicalPathway } from '../src/types.js';

// Load environment variables
dotenv.config();
if (!process.env.SUPABASE_URL && fs.existsSync(path.join(process.cwd(), '.env.example'))) {
  dotenv.config({ path: path.join(process.cwd(), '.env.example') });
}

const DB_FILE = path.join(process.cwd(), 'db.json');

// Initialize Supabase Client dynamically
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

export let supabase: SupabaseClient | null = null;
export let isSupabaseConfigured = false;
export let isSupabaseAvailable = false;
export let supabaseErrorMsg = '';

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    isSupabaseConfigured = true;
    isSupabaseAvailable = true;
    console.log('Supabase client successfully initialized with URL:', supabaseUrl);
  } catch (err: any) {
    supabaseErrorMsg = err.message || 'Initialization failed';
    console.error('Failed to initialize Supabase client:', err);
  }
}

export interface StoredUser {
  id: string;
  email: string;
  name: string;
  institution: string;
  role: string;
  passwordHash: string; // format: scrypt$<saltHex>$<hashHex>
  createdAt: string;
}

// A login session token, mapping an opaque bearer token to the user it
// belongs to. This is what lets the API tell requests from different
// accounts apart, instead of every request seeing the same global data.
export interface StoredSession {
  token: string;
  userId: string;
  createdAt: string;
}

interface DatabaseSchema {
  projects: Project[];
  datasets: Dataset[];
  predictions: PredictionResult[];
  quantumJobs: QuantumJob[];
  activityLogs: ActivityLog[];
  users: StoredUser[];
  sessions: StoredSession[];
}

// userId used for the shared, read-only sample projects that ship with
// every fresh install. Every account can see these, but only the account
// that actually created a project (userId === their own id) can modify it.
export const DEMO_USER_ID = 'demo';


const DEFAULT_DB: DatabaseSchema = {
  projects: [
    {
      id: 'proj-1',
      userId: DEMO_USER_ID,
      name: 'BRCA1/2 Expression Profile',
      description: 'Analysis of breast cancer susceptibility genes BRCA1 and BRCA2 using RNA-Seq tumor microenvironment data.',
      diseaseType: 'Breast Cancer',
      createdAt: new Date('2026-06-15T09:00:00Z').toISOString(),
    },
    {
      id: 'proj-2',
      userId: DEMO_USER_ID,
      name: 'APOE4 Alzheimer\'s Genome Mapping',
      description: 'Study of APOE ε4 allele status and its association with late-onset Alzheimer\'s genomic expressions.',
      diseaseType: 'Alzheimer\'s Disease',
      createdAt: new Date('2026-06-20T14:30:00Z').toISOString(),
    }
  ],
  datasets: [
    {
      id: 'data-1',
      projectId: 'proj-1',
      name: 'brca1_expression_matrix.csv',
      fileType: 'CSV',
      uploadedAt: new Date('2026-06-15T10:15:00Z').toISOString(),
      rowCount: 120,
      columnCount: 15,
      genesDetected: ['BRCA1', 'BRCA2', 'TP53', 'PTEN', 'AKT1', 'PIK3CA', 'EGFR', 'ESR1', 'PGR', 'ERBB2'],
      summaryStats: {
        meanExpression: 5.42,
        variance: 1.84,
        missingValues: 0,
        mutationRate: 0.12,
      },
      rawData: Array.from({ length: 10 }).map((_, i) => ({
        patientId: `BC-${1000 + i}`,
        BRCA1: (4.2 + Math.random() * 3).toFixed(2),
        BRCA2: (3.8 + Math.random() * 2.5).toFixed(2),
        TP53: (2.1 + Math.random() * 4).toFixed(2),
        PTEN: (5.1 + Math.random() * 2).toFixed(2),
        PIK3CA: (3.2 + Math.random() * 3).toFixed(2),
        Age: (30 + Math.floor(Math.random() * 45)),
        Stage: i % 3 === 0 ? 'II' : i % 3 === 1 ? 'III' : 'I',
        Label: i % 2 === 0 ? 1 : 0
      }))
    },
    {
      id: 'data-2',
      projectId: 'proj-2',
      name: 'apoe4_microarray_data.json',
      fileType: 'JSON',
      uploadedAt: new Date('2026-06-20T15:00:00Z').toISOString(),
      rowCount: 85,
      columnCount: 12,
      genesDetected: ['APOE', 'CLU', 'ABCA7', 'TREM2', 'CR1', 'PICALM', 'BIN1', 'CD33'],
      summaryStats: {
        meanExpression: 3.11,
        variance: 0.95,
        missingValues: 2,
        mutationRate: 0.08,
      },
      rawData: Array.from({ length: 8 }).map((_, i) => ({
        sampleId: `AD-SMP-${200 + i}`,
        APOE: (6.1 + Math.random() * 2).toFixed(2),
        CLU: (3.1 + Math.random() * 1.5).toFixed(2),
        TREM2: (1.5 + Math.random() * 2.2).toFixed(2),
        BIN1: (4.3 + Math.random() * 1.8).toFixed(2),
        Age: (65 + Math.floor(Math.random() * 20)),
        CognitiveScore: (12 + Math.floor(Math.random() * 18)),
        Label: i % 2 === 0 ? 1 : 0
      }))
    }
  ],
  predictions: [
    {
      id: 'pred-1',
      projectId: 'proj-1',
      datasetId: 'data-1',
      modelType: 'Quantum SVM Classifier',
      diseaseType: 'Breast Cancer',
      overallRiskScore: 78.4,
      riskCategory: 'High',
      predictionAccuracy: 0.933,
      classifiedAt: new Date('2026-06-15T11:30:00Z').toISOString(),
      confusionMatrix: { tp: 52, fp: 3, fn: 5, tn: 60 },
      geneRankings: [
        { geneName: 'BRCA1', expressionLevel: 6.84, shapValue: 0.42, importance: 0.98, pvalue: 0.0001, chromosome: '17q21.31', diseaseAssociation: 'Breast/Ovarian cancer tumor suppressor, DNA repair' },
        { geneName: 'TP53', expressionLevel: 5.92, shapValue: 0.35, importance: 0.89, pvalue: 0.0004, chromosome: '17p13.1', diseaseAssociation: 'Cell cycle checkpoint guardian, mutation triggers aggressive carcinomas' },
        { geneName: 'PTEN', expressionLevel: 2.11, shapValue: -0.28, importance: 0.81, pvalue: 0.0012, chromosome: '10q23.31', diseaseAssociation: 'PI3K pathway inhibitor, deletion leads to uncontrolled growth' },
        { geneName: 'BRCA2', expressionLevel: 4.88, shapValue: 0.22, importance: 0.74, pvalue: 0.0035, chromosome: '13q13.1', diseaseAssociation: 'Double-strand break repair, homologous recombination pathway' },
        { geneName: 'PIK3CA', expressionLevel: 6.12, shapValue: 0.18, importance: 0.65, pvalue: 0.0084, chromosome: '3q26.32', diseaseAssociation: 'Oncogenic kinase activation, drives hormone-receptor positive cells' },
        { geneName: 'EGFR', expressionLevel: 5.45, shapValue: 0.12, importance: 0.52, pvalue: 0.0150, chromosome: '7p11.2', diseaseAssociation: 'Receptor tyrosine kinase, elevated in triple-negative subtypes' }
      ]
    },
    {
      id: 'pred-2',
      projectId: 'proj-2',
      datasetId: 'data-2',
      modelType: 'Variational Quantum Classifier (VQC)',
      diseaseType: 'Alzheimer\'s Disease',
      overallRiskScore: 54.2,
      riskCategory: 'Moderate',
      predictionAccuracy: 0.875,
      classifiedAt: new Date('2026-06-20T16:45:00Z').toISOString(),
      confusionMatrix: { tp: 34, fp: 5, fn: 5, tn: 41 },
      geneRankings: [
        { geneName: 'APOE', expressionLevel: 7.21, shapValue: 0.51, importance: 0.95, pvalue: 0.0002, chromosome: '19q13.32', diseaseAssociation: 'Lipid transport mediator, ε4 isoform strongly impairs beta-amyloid clearance' },
        { geneName: 'TREM2', expressionLevel: 1.84, shapValue: 0.29, importance: 0.83, pvalue: 0.0015, chromosome: '6p21.1', diseaseAssociation: 'Microglial receptor, regulates neuroinflammatory response to amyloid plaques' },
        { geneName: 'CLU', expressionLevel: 4.52, shapValue: 0.19, importance: 0.71, pvalue: 0.0042, chromosome: '8p21.1', diseaseAssociation: 'Apolipoprotein J, acts as chaperone preventing amyloid-beta aggregation' },
        { geneName: 'BIN1', expressionLevel: 3.12, shapValue: -0.15, importance: 0.62, pvalue: 0.0110, chromosome: '2q14.3', diseaseAssociation: 'Synaptic vesicle trafficking, regulates tau pathology progression' }
      ]
    }
  ],
  quantumJobs: [
    {
      id: 'job-1',
      projectId: 'proj-1',
      datasetId: 'data-1',
      qubits: 3,
      circuitDepth: 18,
      gateCount: 24,
      encodingType: 'Angle',
      ansatz: 'RealAmplitudes',
      status: 'completed',
      fidelity: 0.978,
      qubitMeasurements: { '000': 45, '001': 112, '010': 38, '011': 480, '100': 22, '101': 51, '110': 35, '111': 217 },
      quantumAccuracy: 0.933,
      classicalAccuracy: 0.895,
      blochCoordinates: [
        { x: 0.35, y: -0.45, z: 0.82 },
        { x: -0.12, y: 0.68, z: -0.72 },
        { x: 0.55, y: 0.21, z: 0.81 }
      ],
      noiseLevel: 0.015,
      createdAt: new Date('2026-06-15T11:15:00Z').toISOString(),
      executionTimeMs: 1450
    },
    {
      id: 'job-2',
      projectId: 'proj-2',
      datasetId: 'data-2',
      qubits: 2,
      circuitDepth: 12,
      gateCount: 15,
      encodingType: 'Amplitude',
      ansatz: 'HardwareEfficient',
      status: 'completed',
      fidelity: 0.985,
      qubitMeasurements: { '00': 152, '01': 489, '10': 118, '11': 241 },
      quantumAccuracy: 0.875,
      classicalAccuracy: 0.850,
      blochCoordinates: [
        { x: 0.18, y: -0.72, z: 0.66 },
        { x: -0.45, y: 0.51, z: -0.73 }
      ],
      noiseLevel: 0.008,
      createdAt: new Date('2026-06-20T16:30:00Z').toISOString(),
      executionTimeMs: 980
    }
  ],
  activityLogs: [
    {
      id: 'log-1',
      userId: DEMO_USER_ID,
      type: 'auth',
      description: 'System initialization completed. Core databases loaded.',
      timestamp: new Date('2026-07-07T07:00:00Z').toISOString()
    },
    {
      id: 'log-2',
      userId: DEMO_USER_ID,
      type: 'project',
      description: 'Project BRCA1/2 Expression Profile initialized.',
      timestamp: new Date('2026-06-15T09:00:00Z').toISOString()
    },
    {
      id: 'log-3',
      userId: DEMO_USER_ID,
      type: 'upload',
      description: 'Dataset brca1_expression_matrix.csv uploaded successfully.',
      timestamp: new Date('2026-06-15T10:15:00Z').toISOString()
    },
    {
      id: 'log-4',
      userId: DEMO_USER_ID,
      type: 'quantum',
      description: 'Quantum Job completed successfully on IBM Quantum simulator with Angle encoding.',
      timestamp: new Date('2026-06-15T11:15:00Z').toISOString()
    },
    {
      id: 'log-5',
      userId: DEMO_USER_ID,
      type: 'prediction',
      description: 'AI classification model trained: Quantum SVM Classifier. Accuracy: 93.3%',
      timestamp: new Date('2026-06-15T11:30:00Z').toISOString()
    }
  ],
  users: [],
  sessions: []
};

// Local helper read/write functions
function getLocalDb(): DatabaseSchema {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
  try {
    const data = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    // Backfill any keys (e.g. `users`) missing from DB files written before
    // this schema field existed, so older local/cloud state doesn't crash.
    for (const key of Object.keys(DEFAULT_DB) as (keyof DatabaseSchema)[]) {
      if (!(key in parsed)) {
        parsed[key] = JSON.parse(JSON.stringify(DEFAULT_DB[key]));
      }
    }
    return parsed;
  } catch (err) {
    console.error('Error reading db file, falling back to defaults', err);
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }
}

function writeLocalDb(db: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing local database file:', err);
  }
}

// Background pull sync helper
export async function syncFromSupabase(): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    const { data, error } = await supabase
      .from('genevision_storage')
      .select('*');

    if (error) {
      const isMissingTable = error.message && error.message.includes('Invalid path specified in request URL');
      supabaseErrorMsg = isMissingTable 
        ? 'Table "genevision_storage" not found. Please create it using the SQL editor in your Supabase dashboard.' 
        : error.message;
      isSupabaseAvailable = false;
      console.warn('Could not read from Supabase (maybe table "genevision_storage" does not exist yet):', supabaseErrorMsg);
      return;
    }

    if (data && data.length > 0) {
      isSupabaseAvailable = true;
      const db = getLocalDb();
      data.forEach((row: any) => {
        const key = row.key as keyof DatabaseSchema;
        if (row.value && (key in db)) {
          db[key] = row.value;
        }
      });
      writeLocalDb(db);
      console.log('Successfully synchronized local database from Supabase cloud state!');
    } else {
      isSupabaseAvailable = true;
      console.log('Supabase "genevision_storage" table is active but empty. Seeding local state to cloud...');
      const db = getLocalDb();
      await syncAllToSupabase(db);
    }
  } catch (err: any) {
    const msg = err.message || '';
    const isMissingTable = msg.includes('Invalid path specified in request URL');
    supabaseErrorMsg = isMissingTable 
      ? 'Table "genevision_storage" not found. Please create it using the SQL editor in your Supabase dashboard.' 
      : msg;
    console.error('Error during Supabase sync pull:', supabaseErrorMsg);
    isSupabaseAvailable = false;
  }
}

// Background push sync helper
async function syncToSupabase(key: string, value: any) {
  if (!supabase || !isSupabaseConfigured || !isSupabaseAvailable) return;
  try {
    const { error } = await supabase
      .from('genevision_storage')
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });

    if (error) {
      const isMissingTable = error.message && error.message.includes('Invalid path specified in request URL');
      supabaseErrorMsg = isMissingTable 
        ? 'Table "genevision_storage" not found. Please create it using the SQL editor in your Supabase dashboard.' 
        : error.message;
      isSupabaseAvailable = false;
      console.warn(`Failed to sync key "${key}" to Supabase:`, supabaseErrorMsg);
    } else {
      isSupabaseAvailable = true;
    }
  } catch (err: any) {
    const msg = err.message || '';
    const isMissingTable = msg.includes('Invalid path specified in request URL');
    supabaseErrorMsg = isMissingTable 
      ? 'Table "genevision_storage" not found. Please create it using the SQL editor in your Supabase dashboard.' 
      : msg;
    isSupabaseAvailable = false;
    console.error(`Network error syncing key "${key}" to Supabase:`, supabaseErrorMsg);
  }
}

export async function syncAllToSupabase(db: DatabaseSchema): Promise<void> {
  if (!supabase || !isSupabaseConfigured) return;
  try {
    const keys: (keyof DatabaseSchema)[] = ['projects', 'datasets', 'predictions', 'quantumJobs', 'activityLogs', 'users', 'sessions'];
    for (const key of keys) {
      if (!isSupabaseAvailable) {
        break; // stop early to avoid log spamming
      }
      await syncToSupabase(key, db[key]);
    }
    if (isSupabaseAvailable) {
      console.log('Successfully completed full data push sync to Supabase!');
    }
  } catch (err: any) {
    console.error('Failed full push sync to Supabase:', err.message);
  }
}

let isFirstLoad = true;

// Seed/load the DB
export function getDb(): DatabaseSchema {
  const db = getLocalDb();
  if (isFirstLoad) {
    isFirstLoad = false;
    // Trigger non-blocking async pull from Supabase in background
    if (isSupabaseConfigured && supabase) {
      syncFromSupabase().catch(err => console.error('Initial Supabase sync failed:', err));
    }
  }
  return db;
}

export function saveDb(db: DatabaseSchema): void {
  writeLocalDb(db);
  if (isSupabaseConfigured && supabase) {
    syncAllToSupabase(db).catch(err => console.error('Background Supabase sync failed:', err));
  }
}

// ==================== USER AUTHENTICATION ====================
//
// Passwords are hashed with Node's built-in scrypt (no extra dependency).
// Format stored: "scrypt$<saltHex>$<hashHex>". Never store or return plaintext.

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split('$');
  if (parts.length !== 3 || parts[0] !== 'scrypt') return false;
  const salt = Buffer.from(parts[1], 'hex');
  const expectedHash = Buffer.from(parts[2], 'hex');
  const actualHash = crypto.scryptSync(password, salt, 64);
  // Guard against comparing buffers of different lengths (timingSafeEqual throws otherwise)
  if (actualHash.length !== expectedHash.length) return false;
  return crypto.timingSafeEqual(actualHash, expectedHash);
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  // Always pull the freshest cloud state first when Supabase is configured,
  // so login/signup checks aren't working off a stale local cache on a cold
  // serverless instance.
  if (isSupabaseConfigured && supabase) {
    await syncFromSupabase();
  }
  const db = getLocalDb();
  const normalized = email.trim().toLowerCase();
  return db.users.find(u => u.email.toLowerCase() === normalized);
}

export async function createUser(params: { email: string; password: string; name: string; institution?: string }): Promise<StoredUser> {
  const db = getLocalDb();
  const user: StoredUser = {
    id: `usr-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    email: params.email.trim().toLowerCase(),
    name: params.name,
    institution: params.institution || 'Independent',
    role: 'Bioinformatician',
    passwordHash: hashPassword(params.password),
    createdAt: new Date().toISOString(),
  };
  db.users.push(user);
  writeLocalDb(db);
  // Await the cloud push for users specifically so an account created on one
  // serverless invocation is actually visible to the next one.
  if (isSupabaseConfigured && supabase) {
    await syncToSupabase('users', db.users);
  }
  return user;
}

export function checkPassword(user: StoredUser, password: string): boolean {
  return verifyPassword(password, user.passwordHash);
}

export function addLog(type: ActivityLog['type'], description: string, userId: string, details?: string): ActivityLog {
  const db = getDb();
  const log: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    userId,
    type,
    description,
    timestamp: new Date().toISOString(),
    details
  };
  db.activityLogs.unshift(log);
  // Keep logs to max 100 *per user* so one account's activity can't push
  // another account's history out of the window.
  const own = db.activityLogs.filter(l => l.userId === userId);
  if (own.length > 100) {
    const toDrop = new Set(own.slice(100).map(l => l.id));
    db.activityLogs = db.activityLogs.filter(l => !toDrop.has(l.id));
  }
  saveDb(db);
  return log;
}

// ==================== SESSIONS ====================
//
// A signup/login creates a session token that's persisted alongside the
// rest of the data (so it survives dev-server restarts and, when Supabase
// is configured, cold serverless starts). Every authenticated request
// resolves its bearer token back to a userId via getSessionUserId, which
// is what makes per-user data scoping possible.

export async function createSession(userId: string): Promise<string> {
  const db = getLocalDb();
  const token = `sk_gv_${crypto.randomBytes(24).toString('hex')}`;
  db.sessions.push({ token, userId, createdAt: new Date().toISOString() });
  writeLocalDb(db);
  if (isSupabaseConfigured && supabase) {
    // Await this one (like createUser) so a session created on one
    // serverless invocation is visible to the very next request.
    await syncToSupabase('sessions', db.sessions);
  }
  return token;
}

export async function getSessionUserId(token: string): Promise<string | null> {
  if (!token) return null;
  // Pull fresh cloud state first, same reasoning as findUserByEmail: a
  // cold serverless instance shouldn't reject a token that was created by
  // a different instance moments ago.
  if (isSupabaseConfigured && supabase) {
    await syncFromSupabase();
  }
  const db = getLocalDb();
  const session = db.sessions.find(s => s.token === token);
  return session ? session.userId : null;
}

export async function deleteSession(token: string): Promise<void> {
  const db = getLocalDb();
  db.sessions = db.sessions.filter(s => s.token !== token);
  writeLocalDb(db);
  if (isSupabaseConfigured && supabase) {
    await syncToSupabase('sessions', db.sessions);
  }
}

