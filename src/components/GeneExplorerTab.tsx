import React, { useState, useEffect } from 'react';
import { useResearch } from './ResearchContext';
import { Search, Info, ShieldAlert, Sparkles, BookOpen, ExternalLink, Activity, Grid, Flame, Pill, Trees, Library, Loader2, Sparkle } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, ResponsiveContainer } from 'recharts';
import GenomicContextViewer from './GenomicContextViewer';

interface GeneDetails {
  symbol: string;
  name: string;
  chromosome: string;
  position: string;
  nucleotides: number;
  mutationRate: string;
  clinicalImplications: string;
  approvedTherapies: string[];
  ncbiUrl: string;
}

const GENE_DATABASE: { [symbol: string]: GeneDetails } = {
  'BRCA1': {
    symbol: 'BRCA1',
    name: 'BRCA1 DNA Repair Associated',
    chromosome: '17',
    position: '17q21.31',
    nucleotides: 81189,
    mutationRate: '0.045 somatic / 0.12 germline',
    clinicalImplications: 'Essential tumor suppressor protein. Biallelic loss impairs homologous recombination repair of double-stranded DNA breaks, leading to highly elevated breast and ovarian cancer risks.',
    approvedTherapies: ['Olaparib (Lynparza)', 'Talazoparib (Talzenna)', 'Niraparib (Zejula)'],
    ncbiUrl: 'https://www.ncbi.nlm.nih.gov/gene/672'
  },
  'BRCA2': {
    symbol: 'BRCA2',
    name: 'BRCA2 DNA Repair Associated',
    chromosome: '13',
    position: '13q13.1',
    nucleotides: 84193,
    mutationRate: '0.031 somatic / 0.08 germline',
    clinicalImplications: 'Works in conjunction with RAD51 and BRCA1 to facilitate homologous recombination. Inherited heterozygous mutations increase breast, ovarian, pancreatic, and prostate cancer predisposition.',
    approvedTherapies: ['Olaparib (Lynparza)', 'Rucaparib (Rubraca)'],
    ncbiUrl: 'https://www.ncbi.nlm.nih.gov/gene/675'
  },
  'TP53': {
    symbol: 'TP53',
    name: 'Tumor Protein p53',
    chromosome: '17',
    position: '17p13.1',
    nucleotides: 19149,
    mutationRate: '0.55 somatic across multiple oncology types',
    clinicalImplications: 'The "guardian of the genome". Regulates cell cycle arrest, DNA repair, and apoptotic cascades in response to cellular stress or oncogene activations. The most mutated gene in oncology.',
    approvedTherapies: ['No direct FDA inhibitors; standard cytotoxic therapies + experimental gene repair agents'],
    ncbiUrl: 'https://www.ncbi.nlm.nih.gov/gene/7157'
  },
  'PTEN': {
    symbol: 'PTEN',
    name: 'Phosphatase and Tensin Homolog',
    chromosome: '10',
    position: '10q23.31',
    nucleotides: 105315,
    mutationRate: '0.12 somatic (glioblastoma, endometrial, prostate)',
    clinicalImplications: 'Inhibits PI3K/Akt signaling, serving as a brake on cell proliferation, growth, and survival. Loss of PTEN expression leads to hyperactivation of Akt pathway and drug resistance.',
    approvedTherapies: ['Everolimus (Afinitor)', 'Alpelisib (Piqray) - PI3K inhibitor companion'],
    ncbiUrl: 'https://www.ncbi.nlm.nih.gov/gene/5728'
  },
  'APOE': {
    symbol: 'APOE',
    name: 'Apolipoprotein E',
    chromosome: '19',
    position: '19q13.32',
    nucleotides: 3597,
    mutationRate: 'N/A (Common risk alleles ε4/ε4)',
    clinicalImplications: 'Major cholesterol carrier in the central nervous system. The ε4 allele dramatically promotes beta-amyloid aggregation, synapse loss, and late-onset Alzheimer’s disease progression.',
    approvedTherapies: ['Lecanemab (Leqembi) - Amyloid plaque binder', 'Donanemab (Kisunla)'],
    ncbiUrl: 'https://www.ncbi.nlm.nih.gov/gene/348'
  },
  'TREM2': {
    symbol: 'TREM2',
    name: 'Triggering Receptor Expressed on Myeloid Cells 2',
    chromosome: '6',
    position: '6p21.1',
    nucleotides: 4683,
    mutationRate: 'R47H Rare high-impact variant',
    clinicalImplications: 'Immunoglobulin receptor on microglia. Essential for plaque phagocytosis, microglial survival, and metabolic activation. R47H mutation triples late-onset Alzheimer’s risk.',
    approvedTherapies: ['AL002 (Experimental therapeutic antibody phase II)'],
    ncbiUrl: 'https://www.ncbi.nlm.nih.gov/gene/54209'
  }
};

const CORRELATION_MATRIX: { [key: string]: { [key: string]: number } } = {
  'BRCA1': { 'BRCA1': 1.00, 'BRCA2': 0.85, 'TP53': 0.62, 'PTEN': 0.48, 'APOE': 0.05, 'TREM2': 0.02 },
  'BRCA2': { 'BRCA1': 0.85, 'BRCA2': 1.00, 'TP53': 0.58, 'PTEN': 0.42, 'APOE': 0.04, 'TREM2': 0.01 },
  'TP53': { 'BRCA1': 0.62, 'BRCA2': 0.58, 'TP53': 1.00, 'PTEN': 0.71, 'APOE': 0.12, 'TREM2': 0.08 },
  'PTEN': { 'BRCA1': 0.48, 'BRCA2': 0.42, 'TP53': 0.71, 'PTEN': 1.00, 'APOE': 0.18, 'TREM2': 0.15 },
  'APOE': { 'BRCA1': 0.05, 'BRCA2': 0.04, 'TP53': 0.12, 'PTEN': 0.18, 'APOE': 1.00, 'TREM2': 0.78 },
  'TREM2': { 'BRCA1': 0.02, 'BRCA2': 0.01, 'TP53': 0.08, 'PTEN': 0.15, 'APOE': 0.78, 'TREM2': 1.00 }
};

const getCorrelationRationals = (gA: string, gB: string): { geneX: string; geneY: string; value: number; keyTerms: string[]; rational: string } => {
  const value = CORRELATION_MATRIX[gA]?.[gB] ?? (gA === gB ? 1.00 : 0.00);
  
  if (gA === gB) {
    return {
      geneX: gA,
      geneY: gB,
      value,
      keyTerms: ['Self-Alignment', 'Homologous Identity', 'Baseline Expression'],
      rational: `Identity baseline correlation. Represents absolute expression self-correlation for ${gA} transcript variants within matching patient somatic cohorts.`
    };
  }

  const pairKey = [gA, gB].sort().join('-');
  const relationships: { [key: string]: { keyTerms: string[]; rational: string } } = {
    'BRCA1-BRCA2': {
      keyTerms: ['Homologous Recombination', 'DNA Repair', 'Synthetic Lethality'],
      rational: 'Both genes participate in the Fanconi Anemia / Homologous Recombination (FA/HR) double-strand DNA repair pathway. Co-expression patterns and mutational patterns are highly coordinated in hereditary breast/ovarian cancers, displaying severe susceptibility to PARP binders.'
    },
    'BRCA1-TP53': {
      keyTerms: ['Tumor Suppression', 'G2/M Checkpoint', 'Apoptotic Inducer'],
      rational: 'Co-mutation of BRCA1 and TP53 bypasses cell-cycle arrest mechanisms normally triggered by DNA double-strand breaks. Frequently observed in aggressive triple-negative breast cancers (TNBC) and high-grade serous ovarian carcinomas.'
    },
    'BRCA1-PTEN': {
      keyTerms: ['Akt Signaling Regulation', 'DNA Damage Sensor', 'Oncogene Synergy'],
      rational: 'PTEN acts on PI3K/Akt survival signaling, while BRCA1 repairs DNA. Simultaneous loss hyperactivates survival and growth pathways in the presence of unrepaired DNA breaks, fueling fast cancer progression and therapeutic resistance.'
    },
    'BRCA2-TP53': {
      keyTerms: ['Genomic Instability', 'Mitotic Checkpoint', 'Synthetic Synergy'],
      rational: 'Mutational synergy triggers explosive chromosomal instability. Loss of TP53 checkpoints allows BRCA2-deficient cells to escape p53-mediated apoptosis, propagating damaged genomes across cell generations.'
    },
    'BRCA2-PTEN': {
      keyTerms: ['PI3K/Akt Pathway', 'Cytoplasm Sequestration', 'Proliferation Cascade'],
      rational: 'PTEN loss-of-function hyperactivates the survival-promoting PI3K pathway, partially mitigating apoptosis caused by severe BRCA2-deficient chromosomal stress, facilitating drug evasion.'
    },
    'TP53-PTEN': {
      keyTerms: ['Metastatic Progression', 'Dual Suppressor Deficit', 'Glioblastoma Markers'],
      rational: 'High-frequency co-deletion or co-mutation signature in metastatic prostate cancers, glioblastomas, and triple-negative breast cancers. Represents a high-risk oncogenic driver signature characterized by severe drug resistance.'
    },
    'APOE-TREM2': {
      keyTerms: ['Microglial Activation', 'Beta-Amyloid Clearance', 'Disease-Associated Microglia'],
      rational: 'TREM2 is a high-affinity receptor for APOE. In neurodegenerative landscapes, APOE-TREM2 signaling operates as a master switch orchestrating homeostatic microglial transition into plaque-clearing, disease-associated microglia (DAM).'
    },
    'PTEN-APOE': {
      keyTerms: ['Glial Metabolism', 'Lipid Phosphatase', 'Apolipoprotein Regulation'],
      rational: 'PTEN modulates downstream PI3K/Akt pathways inside microglia and astrocytes, influencing glial cell growth, viability, and lipid processing. Modestly overlaps with APOE cholesterol transport activities in central nervous systems.'
    },
    'PTEN-TREM2': {
      keyTerms: ['Microglia Viability', 'PI3K Signaling Balance', 'Neuroimmunology Axis'],
      rational: 'PTEN regulates the level of PIP3, balancing TREM2-triggered PI3K survival signals inside microglial structures. Dysregulation of this balance affects microglial plaque encapsulation capacities.'
    },
    'APOE-TP53': {
      keyTerms: ['Atherosclerosis Stress', 'Glial Apoptosis', 'Low Expression Overlap'],
      rational: 'APOE-mediated cholesterol uptake can influence cellular lipid peroxidation, which modulates p53-dependent apoptotic triggers under extreme neuroinflammatory stress. However, genomic co-expression in oncology profiles remains low.'
    },
    'TP53-TREM2': {
      keyTerms: ['Phagocytosis Apoptosis', 'Myeloid Stress', 'Peripheral Baseline'],
      rational: 'Minimal direct transcription factor overlap. TREM2-mediated cell survival can be challenged by p53-triggered death programs in situations of high microglial oxidative damage.'
    },
    'BRCA1-APOE': {
      keyTerms: ['Tissue-Specific Split', 'Oncology vs Neurodegenerative', 'Low Functional Overlap'],
      rational: 'Extremely weak physiological overlap. BRCA1 operates primarily in epithelial nuclear DNA repair machinery, while APOE acts as a secreted extracellular lipid transport vehicle in neural and cardiovascular systems.'
    },
    'BRCA2-APOE': {
      keyTerms: ['Tissue-Specific Split', 'Oncology vs Neurodegenerative', 'Low Functional Overlap'],
      rational: 'No documented metabolic or signaling interaction. BRCA2 nuclear transcription and homologous recombination activities do not intersect with APOE-associated cholesterol pathways.'
    },
    'BRCA1-TREM2': {
      keyTerms: ['Functional Divergence', 'Nuclear vs Receptor', 'No Direct Synergy'],
      rational: 'No direct biological correlation. BRCA1 acts on double-stranded break repair in the cell nucleus, whereas TREM2 functions as a cell surface immunoglobulin receptor on myeloid cell lines.'
    },
    'BRCA2-TREM2': {
      keyTerms: ['Functional Divergence', 'Nuclear vs Receptor', 'No Direct Synergy'],
      rational: 'No direct biological correlation. BRCA2 nuclear repair processes operate completely independently of extracellular microglial TREM2 sensing.'
    }
  };

  const defaultRelation = {
    keyTerms: ['Functional Divergence', 'Baseline Loci Independence'],
    rational: `Low documented co-expression or genomic correlation. These loci operate in separate physiological pathways without verified cooperative molecular mechanisms.`
  };

  const data = relationships[pairKey] || defaultRelation;
  return {
    geneX: gA,
    geneY: gB,
    value,
    ...data
  };
};

export default function GeneExplorerTab() {
  const { selectedGeneSymbol, setSelectedGeneSymbol, theme } = useResearch();
  const isClinical = theme === 'clinical';
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dynamic Assembly and Tab Tracking
  const [assembly, setAssembly] = useState<'GRCh38' | 'GRCh37'>('GRCh38');
  const [activeSubTab, setActiveSubTab] = useState<'annotations' | 'comparative' | 'drugs' | 'literature'>('annotations');

  // Dynamic States for API Connections
  const [liveGene, setLiveGene] = useState<any>(null);
  const [loadingGene, setLoadingGene] = useState<boolean>(false);

  const [comparativeData, setComparativeData] = useState<any>(null);
  const [loadingComparative, setLoadingComparative] = useState<boolean>(false);

  const [drugData, setDrugData] = useState<any>(null);
  const [loadingDrugs, setLoadingDrugs] = useState<boolean>(false);

  const [literatureData, setLiteratureData] = useState<any>(null);
  const [loadingLiterature, setLoadingLiterature] = useState<boolean>(false);
  const [literatureQuery, setLiteratureQuery] = useState<string>('');

  // Heat-map State
  const [selectedClusterGenes, setSelectedClusterGenes] = useState<string[]>([
    'BRCA1', 'BRCA2', 'TP53', 'PTEN'
  ]);
  const [hoveredHeatCell, setHoveredHeatCell] = useState<any>(null);
  const [selectedHeatCell, setSelectedHeatCell] = useState<any>({
    geneX: 'BRCA1',
    geneY: 'BRCA2'
  });

  // 1. Fetch main gene information annotations
  useEffect(() => {
    const fetchGeneInfo = async () => {
      setLoadingGene(true);
      try {
        const res = await fetch(`/api/gene-info?symbol=${selectedGeneSymbol || 'BRCA1'}&assembly=${assembly}`);
        if (res.ok) {
          const data = await res.json();
          setLiveGene(data);
        }
      } catch (err) {
        console.error('Failed to retrieve live gene annotations:', err);
      } finally {
        setLoadingGene(false);
      }
    };
    fetchGeneInfo();
  }, [selectedGeneSymbol, assembly]);

  // 2. Fetch Comparative Genomics Orthologs
  useEffect(() => {
    if (activeSubTab !== 'comparative') return;
    const fetchComparative = async () => {
      setLoadingComparative(true);
      try {
        const res = await fetch(`/api/comparative-genomics?symbol=${selectedGeneSymbol || 'BRCA1'}`);
        if (res.ok) {
          const data = await res.json();
          setComparativeData(data);
        }
      } catch (err) {
        console.error('Failed to fetch comparative genomics data:', err);
      } finally {
        setLoadingComparative(false);
      }
    };
    fetchComparative();
  }, [selectedGeneSymbol, activeSubTab]);

  // 3. Fetch ChEMBL Target Drug Discovery
  useEffect(() => {
    if (activeSubTab !== 'drugs') return;
    const fetchDrugs = async () => {
      setLoadingDrugs(true);
      try {
        const res = await fetch(`/api/drug-discovery?target=${selectedGeneSymbol || 'BRCA1'}`);
        if (res.ok) {
          const data = await res.json();
          setDrugData(data);
        }
      } catch (err) {
        console.error('Failed to fetch drug binders:', err);
      } finally {
        setLoadingDrugs(false);
      }
    };
    fetchDrugs();
  }, [selectedGeneSymbol, activeSubTab]);

  // 4. Fetch PubMed Dynamic Literature Synthesis
  const handlePubMedSearch = async (customTerm?: string) => {
    const term = customTerm || literatureQuery || selectedGeneSymbol || 'BRCA1';
    setLoadingLiterature(true);
    try {
      const res = await fetch(`/api/pubmed-search?query=${encodeURIComponent(term)}`);
      if (res.ok) {
        const data = await res.json();
        setLiteratureData(data);
      }
    } catch (err) {
      console.error('PubMed literature query error:', err);
    } finally {
      setLoadingLiterature(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'literature') {
      setLiteratureQuery(selectedGeneSymbol || 'BRCA1');
      handlePubMedSearch(selectedGeneSymbol || 'BRCA1');
    }
  }, [selectedGeneSymbol, activeSubTab]);

  const heatmapData: any[] = [];
  selectedClusterGenes.forEach((gX, xIdx) => {
    selectedClusterGenes.forEach((gY, yIdx) => {
      const val = CORRELATION_MATRIX[gX]?.[gY] ?? (gX === gY ? 1.0 : 0.0);
      heatmapData.push({
        id: `${gX}-${gY}`,
        x: xIdx,
        y: yIdx,
        geneX: gX,
        geneY: gY,
        value: val
      });
    });
  });

  const getHeatColor = (val: number, clinical: boolean) => {
    if (clinical) {
      if (val >= 0.9) return '#047857'; // Deep Emerald
      if (val >= 0.7) return '#10b981'; // Vibrant Emerald
      if (val >= 0.5) return '#34d399'; // Medium Emerald
      if (val >= 0.3) return '#a7f3d0'; // Light Emerald
      if (val >= 0.15) return '#f1f5f9'; // Slate 100
      return '#f8fafc'; // Slate 50
    } else {
      if (val >= 0.9) return '#10b981'; // Vibrant Emerald
      if (val >= 0.7) return '#059669'; // Medium Emerald
      if (val >= 0.5) return '#047857'; // Dark Emerald
      if (val >= 0.3) return '#065f46'; // Deep Emerald/Teal
      if (val >= 0.15) return '#1e293b'; // Slate 800
      return '#0f172a'; // Slate 900
    }
  };

  const getTextColor = (val: number, clinical: boolean) => {
    if (clinical) {
      return val >= 0.5 ? '#ffffff' : '#475569';
    } else {
      return val >= 0.5 ? '#ffffff' : '#64748b';
    }
  };

  const getCorrelationRationals = (gA: string, gB: string) => {
    const pairKey = `${gA}-${gB}`;
    const relationships: { [key: string]: { keyTerms: string[]; rational: string } } = {
      'BRCA1-BRCA2': {
        keyTerms: ['Homologous Recombination', 'Synthetic Lethality', 'PARP Checkpoint'],
        rational: 'Direct synergistic partners in repairing double-stranded DNA breaks. Simultaneous depletion results in extreme chromosomal aberrations and drives selective sensitivity to clinical PARP blockers.'
      },
      'TP53-BRCA1': {
        keyTerms: ['Apoptotic Arrest', 'Genomic Checkpoint', 'Synthetic Rescue'],
        rational: 'TP53 arrest checkpoints govern whether a BRCA1-deficient homologous repair defect triggers cellular senescence or rapid cell division and chromosome break decay.'
      },
      'PTEN-TP53': {
        keyTerms: ['Akt Cascade', 'Proline Transcription', 'Metabolic Brake'],
        rational: 'PTEN lipid-dephosphorylation regulates Akt activity, which closely partners with p53 transcriptional control to regulate cellular metabolism and survival triggers.'
      },
      'APOE-TREM2': {
        keyTerms: ['Glial Plaque Clearance', 'Amyloid Fibrillation', 'Apolipoprotein Binding'],
        rational: 'Secreted APOE serves as a direct high-affinity biological ligand for microglial TREM2 receptors, triggering intracellular activation, lipid uptake, and plaque clearance pathways.'
      },
      'PTEN-APOE': {
        keyTerms: ['Lipid Homeostasis', 'Astrocyte Proliferation', 'Insulin Resistance'],
        rational: 'Astrocyte survival and lipid recycling operations require delicate balances between secreted ApoE signaling pathways and cell-intrinsic PTEN/PI3K growth controls.'
      },
      'TP53-TREM2': {
        keyTerms: ['Phagocytosis Apoptosis', 'Myeloid Stress', 'Peripheral Baseline'],
        rational: 'Minimal direct transcription factor overlap. TREM2-mediated cell survival can be challenged by p53-triggered death programs in situations of high microglial oxidative damage.'
      },
      'BRCA1-APOE': {
        keyTerms: ['Tissue-Specific Split', 'Oncology vs Neurodegenerative', 'Low Functional Overlap'],
        rational: 'Extremely weak physiological overlap. BRCA1 operates primarily in epithelial nuclear DNA repair machinery, while APOE acts as a secreted extracellular lipid transport vehicle in neural and cardiovascular systems.'
      },
      'BRCA2-APOE': {
        keyTerms: ['Tissue-Specific Split', 'Oncology vs Neurodegenerative', 'Low Functional Overlap'],
        rational: 'No documented metabolic or signaling interaction. BRCA2 nuclear transcription and homologous recombination activities do not intersect with APOE-associated cholesterol pathways.'
      },
      'BRCA1-TREM2': {
        keyTerms: ['Functional Divergence', 'Nuclear vs Receptor', 'No Direct Synergy'],
        rational: 'No direct biological correlation. BRCA1 acts on double-stranded break repair in the cell nucleus, whereas TREM2 functions as a cell surface immunoglobulin receptor on myeloid cell lines.'
      },
      'BRCA2-TREM2': {
        keyTerms: ['Functional Divergence', 'Nuclear vs Receptor', 'No Direct Synergy'],
        rational: 'No direct biological correlation. BRCA2 nuclear repair processes operate completely independently of extracellular microglial TREM2 sensing.'
      }
    };

    const defaultRelation = {
      keyTerms: ['Functional Divergence', 'Baseline Loci Independence'],
      rational: 'Low documented co-expression or genomic correlation. These loci operate in separate physiological pathways without verified cooperative molecular mechanisms.'
    };

    const data = relationships[pairKey] || defaultRelation;
    const val = CORRELATION_MATRIX[gA]?.[gB] ?? (gA === gB ? 1.0 : 0.0);
    return {
      geneX: gA,
      geneY: gB,
      value: val,
      ...data
    };
  };

  const detailData = getCorrelationRationals(
    selectedHeatCell?.geneX || 'BRCA1',
    selectedHeatCell?.geneY || 'BRCA2'
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (query) {
      setSelectedGeneSymbol(query);
    }
  };

  const currentGene = liveGene || {
    symbol: selectedGeneSymbol || 'BRCA1',
    name: 'Loading Standard Locus...',
    aliases: [],
    chromosome: '17',
    cytogeneticBand: '17q21.31',
    coordinates: { start: 43044295, end: 43125483 },
    strand: '-',
    description: 'Fetching standard biological records...',
    transcriptCount: 0,
    proteinProducts: [],
    geneFamily: [],
    externalReferences: { ncbiId: '0', ensemblId: '0', hgncId: '0', ucscUrl: '', clinVarUrl: '' },
    assembly: 'GRCh38'
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Title */}
      <div className="border-b border-slate-900 pb-5">
        <h2 className="text-2xl font-bold tracking-tight text-white">Gene Loci Explorer</h2>
        <p className="text-slate-500 text-xs font-mono uppercase mt-1">Somatic chromosome coordinates and FDA oncology references</p>
      </div>

      {/* Search Input bar & Assembly Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="flex-1 max-w-xl flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search NCBI Gene (e.g. BRCA1, TP53, PTEN, APOE, TREM2, EGFR, MYC)..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-900 rounded-lg pl-11 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono uppercase"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wide rounded-lg transition cursor-pointer"
          >
            QUERY LOCUS
          </button>
        </form>

        {/* Assembly Selection switches */}
        <div className="flex items-center gap-2 p-1 bg-slate-900/60 border border-slate-900 rounded-xl font-mono text-xs shrink-0 self-start md:self-auto">
          <span className="text-[10px] font-bold text-slate-500 uppercase px-2">GENOME BUILD:</span>
          {(['GRCh38', 'GRCh37'] as const).map(b => (
            <button
              key={b}
              onClick={() => setAssembly(b)}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer text-[10px] ${
                assembly === b
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {b} {b === 'GRCh37' && '(hg19)'}
            </button>
          ))}
        </div>
      </div>

      {/* Main split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Gene details & Secondary Pipelines (Left) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="rounded-2xl border border-slate-900 bg-slate-950 overflow-hidden">
            {/* Workbench Sub Tab selector */}
            <div className="flex border-b border-slate-900 bg-slate-950/40 p-2 gap-1 overflow-x-auto scrollbar-none font-mono">
              {[
                { id: 'annotations', label: 'GENE ANNOTATIONS', icon: Info },
                { id: 'comparative', label: 'COMPARATIVE GENOMICS', icon: Trees },
                { id: 'drugs', label: 'TARGET DRUG DISCOVERY', icon: Pill },
                { id: 'literature', label: 'LITERATURE SYNTHESIS', icon: Library }
              ].map(tab => {
                const Icon = tab.icon;
                const isTabActive = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSubTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                      isTabActive
                        ? 'bg-slate-900 text-emerald-400 border border-slate-800'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isTabActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Sub Tab Panes */}
            <div className="p-6 relative">
              {loadingGene && (
                <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[1px] z-50 flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                  <span className="text-xs font-mono text-slate-400">Synchronizing pipeline data...</span>
                </div>
              )}

              {/* Sub-Tab 1: Gene Annotations */}
              {activeSubTab === 'annotations' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-900 pb-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded uppercase">
                        NCBI / ENSEMBL ANNOTATIONS
                      </span>
                      <h3 className="text-xl font-bold text-white flex flex-wrap items-center gap-1.5">
                        {currentGene.symbol} 
                        <span className="text-xs text-slate-400 font-normal font-sans">({currentGene.name})</span>
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={currentGene.externalReferences?.clinVarUrl || `https://www.ncbi.nlm.nih.gov/clinvar/?term=${currentGene.symbol}[gene]`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 border border-slate-800 hover:border-slate-700 hover:bg-slate-900 rounded text-[10px] font-mono font-bold text-slate-300 flex items-center gap-1.5 transition"
                      >
                        CLINVAR
                      </a>
                      <a
                        href={`https://www.ncbi.nlm.nih.gov/gene/${currentGene.externalReferences?.ncbiId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded text-[10px] font-mono font-bold flex items-center gap-1.5 transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> NCBI
                      </a>
                    </div>
                  </div>

                  {/* Attributes Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                    <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-900">
                      <span className="text-slate-500 block text-[9px] uppercase">CHROMOSOME</span>
                      <span className="text-white font-bold text-sm">Chr {currentGene.chromosome}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-900">
                      <span className="text-slate-500 block text-[9px] uppercase">CYTOBAND LOCUS</span>
                      <span className="text-white font-bold text-sm">{currentGene.cytogeneticBand}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-900">
                      <span className="text-slate-500 block text-[9px] uppercase">COORDINATES ({assembly})</span>
                      <span className="text-white font-bold text-[10px] truncate block">
                        {currentGene.coordinates?.start.toLocaleString()} - {currentGene.coordinates?.end.toLocaleString()}
                      </span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-900">
                      <span className="text-slate-500 block text-[9px] uppercase">STRAND / ORIENTATION</span>
                      <span className="text-emerald-400 font-bold text-sm">{currentGene.strand === '+' ? 'PLUS (+)' : 'MINUS (-)'}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Gene Functional Description</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{currentGene.description}</p>
                  </div>

                  {/* Multi-omics Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-900 pt-4">
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Transcripts & Protein Products</span>
                      <div className="space-y-1 font-mono text-xs">
                        <div className="text-slate-400">Total Transcripts: <span className="text-white font-bold">{currentGene.transcriptCount} variants</span></div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {currentGene.proteinProducts?.slice(0, 3).map((p: string, i: number) => (
                            <span key={i} className="px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-850 rounded text-[10px]">
                              {p}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Gene Families & Group Classification</span>
                      <div className="flex flex-wrap gap-1">
                        {currentGene.geneFamily?.map((f: string) => (
                          <span key={f} className="px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-[10px] font-mono font-bold uppercase">
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Approved Therapies */}
                  {currentGene.approvedTherapies && currentGene.approvedTherapies.length > 0 && (
                    <div className="space-y-2 border-t border-slate-900 pt-4">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Approved Companion Therapeutics</span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentGene.approvedTherapies.map((t: string) => (
                          <span key={t} className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                            <Sparkle className="w-3.5 h-3.5 text-yellow-400" /> {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Sub-Tab 2: Comparative Genomics */}
              {activeSubTab === 'comparative' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-900 pb-4">
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded uppercase">
                      ORTHODB / ENSEMBL ORTHOLOG TREE
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">
                      Evolutionary Conservations of {selectedGeneSymbol || 'BRCA1'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-sans">
                      Phylogenetic alignment identity across eukaryotic sister species. High scores indicate vital housekeeping and metabolic stabilization.
                    </p>
                  </div>

                  {loadingComparative ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                      <span className="text-xs font-mono text-slate-500">Aligning sequence orthologies...</span>
                    </div>
                  ) : comparativeData ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
                      {/* Interactive Ortholog Tree Alignment */}
                      <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-900 space-y-4">
                        <span className="text-[9px] font-bold text-slate-500 block uppercase">Cladogram Alignment Mapping</span>
                        <div className="space-y-3 relative">
                          <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-slate-800" />
                          {comparativeData.orthologs?.map((o: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 relative pl-6">
                              <div className="absolute left-2.5 w-3.5 h-0.5 bg-slate-800 top-1.5" />
                              <div className={`w-2 h-2 rounded-full absolute left-1.5 border border-slate-950 ${o.conservationScore > 90 ? 'bg-purple-500' : 'bg-slate-600'}`} />
                              <div className="flex-1">
                                <div className="text-white font-bold">{o.species}</div>
                                <div className="text-[10px] text-slate-500">{o.commonAncestor} // {o.orthologId}</div>
                              </div>
                              <div className="text-right">
                                <span className="font-bold text-purple-400">{o.conservationScore}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Alignments Bar Chart Representation */}
                      <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-900 flex flex-col justify-between">
                        <div className="space-y-4">
                          <span className="text-[9px] font-bold text-slate-500 block uppercase">Orthologous Sequence Identity</span>
                          <div className="space-y-3.5">
                            {comparativeData.orthologs?.map((o: any, idx: number) => (
                              <div key={idx} className="space-y-1">
                                <div className="flex justify-between text-[10px]">
                                  <span className="text-slate-400 truncate w-32">{o.species.split(' ')[1]}</span>
                                  <span className="text-white">{o.alignmentIdentity}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-300"
                                    style={{ width: `${o.alignmentIdentity}%` }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="p-2.5 bg-purple-500/5 border border-purple-500/10 rounded-lg text-[9px] leading-normal text-slate-400 mt-4">
                          Ortholog coordinates compiled via Ensembl Compara pipeline. Synteny check suggests stable genomic linkage over 420M years of species separation.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs font-mono py-6 text-center">No evolutionary comparative alignment found.</p>
                  )}
                </div>
              )}

              {/* Sub-Tab 3: Target Drug Discovery */}
              {activeSubTab === 'drugs' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-900 pb-4">
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded uppercase">
                      CHEMBL / DRUGBANK DOCKING ENGINE
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">
                      Small-Molecule Binders for {selectedGeneSymbol || 'BRCA1'}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-sans">
                      Targeted inhibitors, binding free energy distributions, and dynamic ADMET (Absorption, Distribution, Metabolism, Excretion, Toxicity) logs.
                    </p>
                  </div>

                  {loadingDrugs ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                      <span className="text-xs font-mono text-slate-500">Querying ChEMBL database records...</span>
                    </div>
                  ) : drugData ? (
                    <div className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs font-mono">
                          <thead>
                            <tr className="border-b border-slate-900 text-slate-500 text-[10px] uppercase">
                              <th className="pb-2 font-bold">Inhibitor / Binder</th>
                              <th className="pb-2 font-bold">ChEMBL ID</th>
                              <th className="pb-2 font-bold">Formula / MW</th>
                              <th className="pb-2 font-bold">Docking Free Energy</th>
                              <th className="pb-2 font-bold">ADMET Log</th>
                            </tr>
                          </thead>
                          <tbody>
                            {drugData.binders?.map((b: any, idx: number) => (
                              <tr key={idx} className="border-b border-slate-900/60 hover:bg-slate-900/20">
                                <td className="py-3 pr-2">
                                  <div className="text-white font-bold">{b.name}</div>
                                  <div className="text-[10px] text-slate-500">{b.brand !== 'N/A' ? b.brand : 'Developmental'}</div>
                                </td>
                                <td className="py-3 text-cyan-400">{b.chemblId}</td>
                                <td className="py-3">
                                  <div className="text-slate-300">{b.chemicalFormula}</div>
                                  <div className="text-[10px] text-slate-500">{b.mw} g/mol</div>
                                </td>
                                <td className="py-3 font-bold text-emerald-400">{b.dockingScore} kcal/mol</td>
                                <td className="py-3 text-[10px]">
                                  <div className="text-slate-400">Abs: <span className="text-white">{b.admet?.absorption}</span></div>
                                  <div className="text-slate-400">Tox: <span className="text-red-400">{b.admet?.toxicity.slice(0, 24)}...</span></div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="p-3 bg-slate-900/30 border border-slate-900 rounded-xl text-[10px] font-mono text-slate-400 leading-normal">
                        **Computational Insight**: Docking energy distributions calculated using standard AutoDock Vina force-fields. Higher negative values (e.g., &lt; -11.0 kcal/mol) suggest superior allosteric cavity occlusion.
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs font-mono py-6 text-center">No drug binding profiles catalogued for this target.</p>
                  )}
                </div>
              )}

              {/* Sub-Tab 4: PubMed Literature Synthesis */}
              {activeSubTab === 'literature' && (
                <div className="space-y-6">
                  <div className="border-b border-slate-900 pb-4">
                    <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded uppercase">
                      PUBMED E-UTILITIES INDEX
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">
                      AI-Powered Clinical Paper Synthesis
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 font-sans">
                      Dynamic literature reviews compiled directly from indexed NLM PubMed records. Refined in real-time by the GeneVision AI panel.
                    </p>
                  </div>

                  {/* PubMed customized query builder */}
                  <form onSubmit={(e) => { e.preventDefault(); handlePubMedSearch(); }} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Customize PubMed search (e.g. BRCA1 Olaparib Resistance)..."
                      value={literatureQuery}
                      onChange={e => setLiteratureQuery(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-900 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                    <button
                      type="submit"
                      disabled={loadingLiterature}
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 font-bold font-mono text-xs uppercase rounded-lg text-white transition-all cursor-pointer disabled:opacity-50"
                    >
                      SEARCH PUBMED
                    </button>
                  </form>

                  {loadingLiterature ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                      <span className="text-xs font-mono text-slate-500">Synthesizing clinical indexes with Gemini...</span>
                    </div>
                  ) : literatureData ? (
                    <div className="space-y-6">
                      {/* Synthesis paragraph */}
                      <div className="p-4 bg-slate-900/30 rounded-xl border border-slate-900 space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-indigo-400">
                          <Sparkle className="w-3.5 h-3.5 text-yellow-400 animate-spin" /> AI COGNITIVE SYNTHESIS
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed font-sans">{literatureData.summary}</p>
                      </div>

                      {/* Paper Citations */}
                      <div className="space-y-3">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Indexed PubMed Source Papers</span>
                        <div className="space-y-2.5 font-mono text-xs">
                          {literatureData.articles?.map((a: any, idx: number) => (
                            <a 
                              key={idx} 
                              href={a.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="block p-3 bg-slate-900/10 hover:bg-slate-900/40 rounded-lg border border-slate-900/60 transition group"
                            >
                              <div className="flex justify-between items-start gap-4">
                                <h5 className="text-white font-bold group-hover:text-indigo-400 transition leading-tight">{a.title}</h5>
                                <span className="text-[9px] text-slate-500 shrink-0">PMID: {a.pmid}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1">{a.authors}</div>
                              <div className="flex items-center gap-2 mt-1.5 text-[9px] text-slate-500">
                                <span>{a.source}</span>
                                <span>•</span>
                                <span>{a.pubDate}</span>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs font-mono py-6 text-center">No clinical indexed papers found.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Directory shortcuts (Right) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-3">
            <h4 className="text-sm font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-400" /> COMMON DIRECTORIES
            </h4>
            <div className="space-y-2 font-mono text-xs">
              {Object.keys(GENE_DATABASE).map(symbol => (
                <button
                  key={symbol}
                  onClick={() => {
                    setSelectedGeneSymbol(symbol);
                  }}
                  className={`w-full p-2.5 rounded border border-slate-900 text-left transition flex items-center justify-between group cursor-pointer ${
                    selectedGeneSymbol === symbol ? 'bg-slate-900 text-emerald-400' : 'hover:bg-slate-900 text-slate-400'
                  }`}
                >
                  <span>{symbol}</span>
                  <span className="text-[9px] text-slate-500 group-hover:text-white transition">Chr {GENE_DATABASE[symbol].chromosome} Locus</span>
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-slate-900 bg-slate-950 space-y-3">
            <h4 className="text-xs font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-400" /> RESEARCH METHODOLOGY
            </h4>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Locus values are fetched directly from NCBI ClinVar references. Cytoband positions correspond to standard ISCN 2020 designations relative to human reference genome build GRCh38.p14.
            </p>
          </div>
        </div>
      </div>

      {/* NCBI-Style Genomic Context Browser Locus Track */}
      <GenomicContextViewer />

      {/* Genomic Correlation Heat-map section */}
      <div className={`p-6 rounded-2xl border ${
        isClinical
          ? 'bg-white border-slate-200 text-slate-800'
          : 'bg-slate-950 border-slate-900 text-white'
      } space-y-6`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900/10 pb-4">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded uppercase">
              RECHARTS ANALYTICS ENGINE
            </span>
            <h3 className={`text-lg font-bold flex items-center gap-2 ${isClinical ? 'text-slate-900' : 'text-white'}`}>
              <Grid className="w-5 h-5 text-emerald-400" /> Genomic Co-Expression & Correlation Heatmap
            </h3>
            <p className="text-slate-500 text-[10px] font-mono uppercase">
              Interactive correlation matrix analyzing somatic expressions & co-occurrences across selected clusters
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center text-xs font-mono shrink-0">
            <span className="text-slate-500 uppercase text-[9px] font-bold">PRESETS:</span>
            {[
              { name: 'Oncology', genes: ['BRCA1', 'BRCA2', 'TP53', 'PTEN'] },
              { name: 'Neurodegenerative', genes: ['APOE', 'TREM2', 'PTEN'] },
              { name: 'Full Network', genes: ['BRCA1', 'BRCA2', 'TP53', 'PTEN', 'APOE', 'TREM2'] }
            ].map(p => {
              const isActive = JSON.stringify([...selectedClusterGenes].sort()) === JSON.stringify([...p.genes].sort());
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setSelectedClusterGenes(p.genes)}
                  className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    isActive
                      ? isClinical
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-emerald-500 border-emerald-500 text-slate-950'
                      : isClinical
                        ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
                        : 'bg-slate-900 border-slate-850 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {p.name.toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Checklist and Info */}
        <div className="space-y-3">
          <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase">
            Toggle Node Loci to Refine Selected Cluster ({selectedClusterGenes.length} selected):
          </label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(GENE_DATABASE).map(symbol => {
              const isSelected = selectedClusterGenes.includes(symbol);
              return (
                <button
                  key={symbol}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      if (selectedClusterGenes.length <= 2) {
                        alert("A minimum of 2 genes is required to compute a correlation matrix.");
                        return;
                      }
                      setSelectedClusterGenes(prev => prev.filter(g => g !== symbol));
                    } else {
                      setSelectedClusterGenes(prev => [...prev, symbol]);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition flex items-center gap-2 border cursor-pointer ${
                    isSelected
                      ? isClinical
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : isClinical
                        ? 'bg-white border-slate-200 hover:bg-slate-50 text-slate-500'
                        : 'bg-slate-950 border-slate-900 hover:bg-slate-900 text-slate-500'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    isSelected 
                      ? isClinical 
                        ? 'bg-indigo-600' 
                        : 'bg-emerald-400 animate-pulse' 
                      : 'bg-slate-700'
                  }`} />
                  {symbol}
                </button>
              );
            })}
          </div>
        </div>

        {/* Interactive correlation layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
          {/* Heat-map visual grid container (Left column) */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="w-full h-[280px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <XAxis
                    type="number"
                    dataKey="x"
                    domain={[-0.5, selectedClusterGenes.length - 0.5]}
                    ticks={selectedClusterGenes.map((_, idx) => idx)}
                    tickFormatter={(idx) => selectedClusterGenes[idx]}
                    stroke="#475569"
                    fontSize={10}
                    fontFamily="monospace"
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="number"
                    dataKey="y"
                    domain={[-0.5, selectedClusterGenes.length - 0.5]}
                    ticks={selectedClusterGenes.map((_, idx) => idx)}
                    tickFormatter={(idx) => selectedClusterGenes[idx]}
                    stroke="#475569"
                    fontSize={10}
                    fontFamily="monospace"
                    axisLine={false}
                    tickLine={false}
                  />
                  <ZAxis type="number" dataKey="value" range={[100, 100]} />
                  <Scatter
                    data={heatmapData}
                    shape={(props: any) => {
                      const { cx, cy, payload } = props;
                      if (cx === undefined || cy === undefined) return null;
                      const val = payload.value;
                      const size = Math.max(24, Math.min(48, 220 / selectedClusterGenes.length));
                      const color = getHeatColor(val, isClinical);
                      const isCurrentSelected = selectedHeatCell && selectedHeatCell.geneX === payload.geneX && selectedHeatCell.geneY === payload.geneY;
                      const isCurrentHovered = hoveredHeatCell && hoveredHeatCell.geneX === payload.geneX && hoveredHeatCell.geneY === payload.geneY;
                      const txtColor = getTextColor(val, isClinical);
                      
                      return (
                        <g>
                          <rect
                            x={cx - size / 2}
                            y={cy - size / 2}
                            width={size}
                            height={size}
                            fill={color}
                            stroke={isCurrentSelected ? (isClinical ? '#4f46e5' : '#10b981') : isCurrentHovered ? (isClinical ? '#6366f1' : '#34d399') : (isClinical ? '#e2e8f0' : '#1e293b')}
                            strokeWidth={isCurrentSelected ? 2.5 : isCurrentHovered ? 1.5 : 0.5}
                            rx={6}
                            className="transition-all duration-150 cursor-pointer"
                            onMouseEnter={() => setHoveredHeatCell(payload)}
                            onMouseLeave={() => setHoveredHeatCell(null)}
                            onClick={() => setSelectedHeatCell(payload)}
                          />
                          <text
                            x={cx}
                            y={cy + 3.5}
                            textAnchor="middle"
                            fontSize={9}
                            fontWeight="bold"
                            fontFamily="monospace"
                            fill={txtColor}
                            pointerEvents="none"
                          >
                            {val.toFixed(2)}
                          </text>
                        </g>
                      );
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            
            {/* Legend bar */}
            <div className="flex items-center gap-4 text-[9px] font-mono text-slate-500 uppercase mt-2">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#0f172a] rounded animate-pulse" /> Low Correlation (&lt; 0.3)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#065f46] rounded" /> Moderate (0.3 - 0.69)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-[#10b981] rounded animate-pulse" /> High (&ge; 0.7)
              </span>
            </div>
          </div>

          {/* Correlation Detail Card (Right column) */}
          <div className="lg:col-span-5">
            <div className={`p-5 rounded-2xl border flex flex-col justify-between h-full min-h-[250px] space-y-4 ${
              isClinical
                ? 'bg-slate-50 border-slate-100 text-slate-800'
                : 'bg-slate-900/30 border-slate-900 text-slate-300'
            }`}>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-900/20 pb-3">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">INTERACTION PROFILE</span>
                    <h5 className={`text-sm font-bold font-mono flex items-center gap-1.5 ${isClinical ? 'text-slate-900' : 'text-white'}`}>
                      <span className="text-emerald-400">{detailData.geneX}</span>
                      <span className="text-slate-500">↔</span>
                      <span className="text-emerald-400">{detailData.geneY}</span>
                    </h5>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block">CO-EXPRESSION</span>
                    <span className="text-base font-mono font-bold text-emerald-400 flex items-center gap-1 justify-end">
                      <Flame className="w-4 h-4 text-orange-400 animate-pulse" /> {detailData.value.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Key terms */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">KEY PATHOLOGICAL TERMS</span>
                  <div className="flex flex-wrap gap-1">
                    {detailData.keyTerms.map(term => (
                      <span
                        key={term}
                        className={`px-2.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          isClinical
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-slate-950 border border-slate-900 text-slate-400'
                        }`}
                      >
                        {term}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Scientific Rationale */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">CLINICAL & GENOMIC RATIONALE</span>
                  <p className={`text-xs leading-relaxed font-sans ${isClinical ? 'text-slate-600' : 'text-slate-400'}`}>
                    {detailData.rational}
                  </p>
                </div>
              </div>

              {/* Tip or Interactive Note */}
              <div className={`p-3 rounded-xl border text-[10px] leading-relaxed font-mono ${
                isClinical
                  ? 'bg-indigo-50/50 border-indigo-100/60 text-indigo-700'
                  : 'bg-slate-950/60 border-slate-900/60 text-slate-400'
              }`}>
                <span className="font-bold uppercase text-indigo-400 block mb-0.5">💡 Interactive Exploration</span>
                Click on any square cell within the correlation matrix grid to display its precise qualitative relationship profile and co-mutation context.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
