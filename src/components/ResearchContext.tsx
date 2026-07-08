import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Project, Dataset, PredictionResult, QuantumJob, ActivityLog, BiologicalPathway } from '../types';

interface ResearchContextType {
  user: User | null;
  token: string | null;
  projects: Project[];
  datasets: Dataset[];
  predictions: PredictionResult[];
  quantumJobs: QuantumJob[];
  activityLogs: ActivityLog[];
  activeProject: Project | null;
  activeDataset: Dataset | null;
  activePrediction: PredictionResult | null;
  activeQuantumJob: QuantumJob | null;
  loading: boolean;
  error: string | null;
  theme: 'dark' | 'clinical';
  
  // Actions
  signUp: (data: any) => Promise<boolean>;
  logIn: (data: any) => Promise<boolean>;
  logOut: () => void;
  createProject: (data: { name: string; description?: string; diseaseType: string }) => Promise<Project | null>;
  deleteProject: (id: string) => Promise<boolean>;
  uploadDataset: (data: { projectId: string; name: string; fileType: string; rawText: string }) => Promise<Dataset | null>;
  runClassification: (modelType: string) => Promise<PredictionResult | null>;
  runQuantumSim: (config: { qubits: number; encodingType: 'Angle' | 'Amplitude' | 'Basis'; ansatz: 'HardwareEfficient' | 'QAOA' | 'RealAmplitudes'; noiseLevel: number }) => Promise<QuantumJob | null>;
  loadPathways: (diseaseType: string) => Promise<BiologicalPathway[]>;
  setActiveProject: (p: Project | null, customDatasets?: Dataset[], customPredictions?: PredictionResult[], customJobs?: QuantumJob[]) => void;
  setActiveDataset: (d: Dataset | null, customPredictions?: PredictionResult[], customJobs?: QuantumJob[]) => void;
  setActivePrediction: (r: PredictionResult | null) => void;
  setActiveQuantumJob: (j: QuantumJob | null) => void;
  setTheme: (t: 'dark' | 'clinical') => void;
  fetchData: () => Promise<void>;
  selectedGeneSymbol: string;
  setSelectedGeneSymbol: (symbol: string) => void;
  supabaseStatus: {
    configured: boolean;
    active: boolean;
    errorMessage: string | null;
    supabaseUrl: string | null;
    setupSql: string;
  } | null;
  fetchSupabaseStatus: () => Promise<void>;
  triggerSupabaseSync: () => Promise<boolean>;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

export const ResearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [quantumJobs, setQuantumJobs] = useState<QuantumJob[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  const [activeProject, setActiveProjectState] = useState<Project | null>(null);
  const [activeDataset, setActiveDatasetState] = useState<Dataset | null>(null);
  const [activePrediction, setActivePredictionState] = useState<PredictionResult | null>(null);
  const [activeQuantumJob, setActiveQuantumJobState] = useState<QuantumJob | null>(null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setThemeState] = useState<'dark' | 'clinical'>('dark');
  const [selectedGeneSymbol, setSelectedGeneSymbol] = useState<string>('BRCA1');
  const [supabaseStatus, setSupabaseStatus] = useState<ResearchContextType['supabaseStatus']>(null);

  // Setup initial state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('gv_user');
    const storedToken = localStorage.getItem('gv_token');
    const savedTheme = localStorage.getItem('gv_theme') as 'dark' | 'clinical';
    if (savedTheme) {
      setThemeState(savedTheme);
    }
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      // Every project/dataset/prediction/quantumJob/log endpoint now
      // requires a bearer token and returns only this account's data, so
      // there's no point fetching before we know who's logged in.
      fetchData(storedToken);
    }
    fetchSupabaseStatus();
  }, []);

  const authHeaders = (activeToken?: string | null): Record<string, string> => {
    const t = activeToken ?? token;
    return t ? { Authorization: `Bearer ${t}` } : {};
  };

  const fetchSupabaseStatus = async () => {
    try {
      const res = await fetch('/api/supabase/status');
      if (res.ok) {
        const data = await res.json();
        setSupabaseStatus(data);
      }
    } catch (err) {
      console.error('Error fetching Supabase connection status:', err);
    }
  };

  const triggerSupabaseSync = async (): Promise<boolean> => {
    try {
      const res = await fetch('/api/supabase/sync', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSupabaseStatus(prev => prev ? { ...prev, active: data.active, errorMessage: data.errorMessage } : null);
        await fetchData(); // refresh local memory after sync
        return data.active;
      }
    } catch (err) {
      console.error('Error triggering Supabase sync:', err);
    }
    return false;
  };

  const setTheme = (t: 'dark' | 'clinical') => {
    setThemeState(t);
    localStorage.setItem('gv_theme', t);
  };

  // Accepts an explicit token for the moments right after login/signup,
  // where the `token` state variable hasn't re-rendered yet.
  const fetchData = async (activeToken?: string | null) => {
    const t = activeToken ?? token;
    if (!t) {
      // Not logged in: show nothing rather than falling back to a
      // pre-auth global list.
      setProjects([]);
      setDatasets([]);
      setPredictions([]);
      setQuantumJobs([]);
      setActivityLogs([]);
      return;
    }
    try {
      const headers = authHeaders(t);
      const [resProj, resData, resPred, resJobs, resLogs] = await Promise.all([
        fetch('/api/projects', { headers }).then(r => r.ok ? r.json() : []),
        fetch('/api/datasets', { headers }).then(r => r.ok ? r.json() : []),
        fetch('/api/predictions', { headers }).then(r => r.ok ? r.json() : []),
        fetch('/api/quantumJobs', { headers }).then(r => r.ok ? r.json() : []), // fallback
        fetch('/api/logs', { headers }).then(r => r.ok ? r.json() : [])
      ]);

      setProjects(resProj || []);
      setDatasets(resData || []);
      setPredictions(resPred || []);
      setQuantumJobs(resJobs || []);
      setActivityLogs(resLogs || []);

      const currentProj = activeProject ? (resProj || []).find((p: any) => p.id === activeProject.id) : null;
      if (currentProj) {
        setActiveProject(currentProj, resData || [], resPred || [], resJobs || []);
      } else if (resProj && resProj.length > 0 && !activeProject) {
        setActiveProject(resProj[0], resData || [], resPred || [], resJobs || []);
      }
    } catch (err) {
      console.error('Error syncing bio-data core:', err);
    }
  };

  const setActiveProject = (
    p: Project | null,
    customDatasets?: Dataset[],
    customPredictions?: PredictionResult[],
    customJobs?: QuantumJob[]
  ) => {
    setActiveProjectState(p);
    const targetDatasets = customDatasets || datasets;
    const targetPredictions = customPredictions || predictions;
    const targetJobs = customJobs || quantumJobs;

    if (p) {
      // Find associated datasets
      const filteredData = targetDatasets.filter(d => d.projectId === p.id);
      if (filteredData.length > 0) {
        setActiveDatasetState(filteredData[0]);
        // Find associated predictions
        const filteredPred = targetPredictions.filter(pr => pr.projectId === p.id && pr.datasetId === filteredData[0].id);
        setActivePredictionState(filteredPred.length > 0 ? filteredPred[0] : null);
        // Find associated quantum jobs
        const filteredJobs = targetJobs.filter(q => q.projectId === p.id && q.datasetId === filteredData[0].id);
        setActiveQuantumJobState(filteredJobs.length > 0 ? filteredJobs[0] : null);
      } else {
        setActiveDatasetState(null);
        setActivePredictionState(null);
        setActiveQuantumJobState(null);
      }
    } else {
      setActiveDatasetState(null);
      setActivePredictionState(null);
      setActiveQuantumJobState(null);
    }
  };

  const setActiveDataset = (
    d: Dataset | null,
    customPredictions?: PredictionResult[],
    customJobs?: QuantumJob[]
  ) => {
    setActiveDatasetState(d);
    const targetPredictions = customPredictions || predictions;
    const targetJobs = customJobs || quantumJobs;

    if (d) {
      const filteredPred = targetPredictions.filter(pr => pr.datasetId === d.id);
      setActivePredictionState(filteredPred.length > 0 ? filteredPred[0] : null);
      const filteredJobs = targetJobs.filter(q => q.datasetId === d.id);
      setActiveQuantumJobState(filteredJobs.length > 0 ? filteredJobs[0] : null);
    } else {
      setActivePredictionState(null);
      setActiveQuantumJobState(null);
    }
  };

  const setActivePrediction = (r: PredictionResult | null) => {
    setActivePredictionState(r);
  };

  const setActiveQuantumJob = (j: QuantumJob | null) => {
    setActiveQuantumJobState(j);
  };

  const signUp = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Signup failed');
      
      setUser(result.user);
      setToken(result.token);
      localStorage.setItem('gv_user', JSON.stringify(result.user));
      localStorage.setItem('gv_token', result.token);
      await fetchData(result.token);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logIn = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Login failed');
      
      setUser(result.user);
      setToken(result.token);
      localStorage.setItem('gv_user', JSON.stringify(result.user));
      localStorage.setItem('gv_token', result.token);
      await fetchData(result.token);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logOut = () => {
    // Best-effort: invalidate the session server-side too, so a copied
    // token can't keep being used after logout. Not awaited since the
    // local state clear below is what actually matters to the user.
    if (token) {
      fetch('/api/auth/logout', { method: 'POST', headers: authHeaders() }).catch(() => {});
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('gv_user');
    localStorage.removeItem('gv_token');
    setProjects([]);
    setDatasets([]);
    setPredictions([]);
    setQuantumJobs([]);
    setActivityLogs([]);
    setActiveProjectState(null);
    setActiveDatasetState(null);
    setActivePredictionState(null);
    setActiveQuantumJobState(null);
  };

  const createProject = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Project creation failed');
      
      await fetchData();
      setActiveProject(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE', headers: authHeaders() });
      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Project deletion failed');
      }
      
      const updatedProj = projects.filter(p => p.id !== id);
      setProjects(updatedProj);
      if (activeProject?.id === id) {
        setActiveProject(updatedProj.length > 0 ? updatedProj[0] : null);
      }
      await fetchData();
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const uploadDataset = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/datasets/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Dataset upload failed');
      
      await fetchData();
      // Find and update active project selection to hook references
      const freshProj = projects.find(p => p.id === data.projectId);
      if (freshProj) {
        setActiveProjectState(freshProj);
        setActiveDatasetState(result);
        setActivePredictionState(null);
        setActiveQuantumJobState(null);
      }
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const runClassification = async (modelType: string) => {
    if (!activeProject || !activeDataset) {
      setError('Please select/upload a dataset context first');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/predictions/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          projectId: activeProject.id,
          datasetId: activeDataset.id,
          modelType
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Classification run failed');
      
      await fetchData();
      setActivePredictionState(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const runQuantumSim = async (config: any) => {
    if (!activeProject || !activeDataset) {
      setError('Please select/upload a dataset context first');
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/quantum/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          projectId: activeProject.id,
          datasetId: activeDataset.id,
          ...config
        })
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Quantum simulation failed');
      
      await fetchData();
      setActiveQuantumJobState(result);
      return result;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const loadPathways = async (diseaseType: string) => {
    try {
      const res = await fetch(`/api/pathways/${encodeURIComponent(diseaseType)}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.error('Failed to load biochemical pathways:', err);
    }
    return [];
  };

  return (
    <ResearchContext.Provider
      value={{
        user,
        token,
        projects,
        datasets,
        predictions,
        quantumJobs,
        activityLogs,
        activeProject,
        activeDataset,
        activePrediction,
        activeQuantumJob,
        loading,
        error,
        theme,
        signUp,
        logIn,
        logOut,
        createProject,
        deleteProject,
        uploadDataset,
        runClassification,
        runQuantumSim,
        loadPathways,
        setActiveProject,
        setActiveDataset,
        setActivePrediction,
        setActiveQuantumJob,
        setTheme,
        fetchData,
        selectedGeneSymbol,
        setSelectedGeneSymbol,
        supabaseStatus,
        fetchSupabaseStatus,
        triggerSupabaseSync
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
};

export const useResearch = () => {
  const context = useContext(ResearchContext);
  if (context === undefined) {
    throw new Error('useResearch must be used within a ResearchProvider');
  }
  return context;
};
