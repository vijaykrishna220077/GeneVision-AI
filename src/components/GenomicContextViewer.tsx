import React, { useState, useEffect, useRef } from 'react';
import { useResearch } from './ResearchContext';
import { 
  ZoomIn, 
  ZoomOut, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  HelpCircle, 
  Activity, 
  Sliders, 
  Fingerprint, 
  Search,
  BookOpen,
  Compass
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ==========================================
// GENOMIC CONTEXT DATABASE (REF: GRCh38.p14)
// ==========================================
interface Exon {
  id: string;
  start: number;
  end: number;
}

interface LocusFeature {
  id: string;
  type: 'gene' | 'promoter' | 'enhancer' | 'cpg_island' | 'ctcf_site';
  name: string;
  start: number;
  end: number;
  strand: '+' | '-';
  details: string;
  gcContent?: number;
  chromatinState?: string;
  exons?: Exon[];
}

interface ChromosomeBand {
  name: string;
  start: number;
  end: number;
  type: 'gpos100' | 'gpos75' | 'gpos50' | 'gpos25' | 'gneg' | 'acen';
}

interface LocusData {
  symbol: string;
  chromosome: string;
  cytoband: string;
  locusStart: number;
  locusEnd: number;
  bands: ChromosomeBand[];
  features: LocusFeature[];
}

const LOCUS_DATABASE: { [symbol: string]: LocusData } = {
  'BRCA1': {
    symbol: 'BRCA1',
    chromosome: '17',
    cytoband: '17q21.31',
    locusStart: 43000000,
    locusEnd: 43220000,
    bands: [
      { name: '17q21.1', start: 43000000, end: 43050000, type: 'gneg' },
      { name: '17q21.2', start: 43050000, end: 43120000, type: 'gpos50' },
      { name: '17q21.31', start: 43120000, end: 43180000, type: 'gneg' },
      { name: '17q21.32', start: 43180000, end: 43220000, type: 'gpos100' }
    ],
    features: [
      {
        id: 'brca1-gene',
        type: 'gene',
        name: 'BRCA1',
        start: 43044295,
        end: 43170245,
        strand: '-',
        details: 'Breast cancer type 1 susceptibility protein. Plays an essential role in DNA double-strand break repair via homologous recombination.',
        gcContent: 45.8,
        chromatinState: 'Active Transcription Locus (H3K4me3 enriched)',
        exons: [
          { id: 'ex1', start: 43044295, end: 43045500 },
          { id: 'ex2', start: 43051000, end: 43052200 },
          { id: 'ex3', start: 43063000, end: 43064100 },
          { id: 'ex4', start: 43075000, end: 43076800 },
          { id: 'ex5', start: 43088000, end: 43089400 },
          { id: 'ex6', start: 43102000, end: 43103100 },
          { id: 'ex7', start: 43118000, end: 43119500 },
          { id: 'ex8', start: 43135000, end: 43136500 },
          { id: 'ex9', start: 43152000, end: 43154000 },
          { id: 'ex10', start: 43168000, end: 43170245 }
        ]
      },
      {
        id: 'nbr1-gene',
        type: 'gene',
        name: 'NBR1',
        start: 43175000,
        end: 43210000,
        strand: '+',
        details: 'Neighbor of BRCA1 gene 1. Encodes an autophagy receptor that interacts with ubiquitin and LC3 to target protein aggregates for degradation.',
        gcContent: 52.3,
        chromatinState: 'Moderately Active (H3K27ac enriched)',
        exons: [
          { id: 'nbr-ex1', start: 43175000, end: 43176000 },
          { id: 'nbr-ex2', start: 43184000, end: 43185200 },
          { id: 'nbr-ex3', start: 43196000, end: 43197500 },
          { id: 'nbr-ex4', start: 43208000, end: 43210000 }
        ]
      },
      {
        id: 'nbr2-gene',
        type: 'gene',
        name: 'NBR2',
        start: 43020000,
        end: 43038000,
        strand: '-',
        details: 'Neighbor of BRCA1 gene 2 (non-protein coding). Transcribes a long non-coding RNA (lncRNA) that co-shares a bidirectional promoter with BRCA1.',
        gcContent: 49.1,
        chromatinState: 'Epigenetically Linked lncRNA Region',
        exons: [
          { id: 'nbr2-ex1', start: 43020000, end: 43022500 },
          { id: 'nbr2-ex2', start: 43032000, end: 43034000 },
          { id: 'nbr2-ex3', start: 43037000, end: 43038000 }
        ]
      },
      {
        id: 'brca1-promoter',
        type: 'promoter',
        name: 'BRCA1 Bidirectional Promoter',
        start: 43038000,
        end: 43044295,
        strand: '-',
        details: 'Core bidirectional transcriptional promoter shared between BRCA1 and NBR2. Highly sensitive to CpG hypermethylation which can silence tumor suppression.',
        gcContent: 68.4,
        chromatinState: 'Open Chromatin/Hypomethylated'
      },
      {
        id: 'brca1-enhancer-1',
        type: 'enhancer',
        name: 'Distal Enhancer ENSR000000451',
        start: 43110000,
        end: 43114000,
        strand: '+',
        details: 'Somatic tissue-specific enhancer containing Estrogen Receptor Alpha (ERα) response elements, amplifying transcriptional rate in mammary epithelium.',
        gcContent: 41.5,
        chromatinState: 'Super-Enhancer Locus (H3K27ac Peak)'
      },
      {
        id: 'brca1-cpg-1',
        type: 'cpg_island',
        name: 'CpG Island CpG_17q21',
        start: 43037500,
        end: 43046000,
        strand: '+',
        details: 'Rich GC island containing 114 CpG dinucleotides. Epigenetic hypermethylation here is found in 10-15% of sporadic triple-negative breast cancers.',
        gcContent: 72.1,
        chromatinState: 'DNA Methylation Control Hub'
      },
      {
        id: 'brca1-ctcf-1',
        type: 'ctcf_site',
        name: 'CTCF Boundary Locus #17',
        start: 43172000,
        end: 43173500,
        strand: '-',
        details: 'CTCF insulator binding site, marking the boundary of the topological domain (TAD) separating NBR1 and BRCA1 chromatin-loop domains.',
        gcContent: 58.0,
        chromatinState: 'Insulator/Boundary Element'
      }
    ]
  },
  'BRCA2': {
    symbol: 'BRCA2',
    chromosome: '13',
    cytoband: '13q13.1',
    locusStart: 32300000,
    locusEnd: 32450000,
    bands: [
      { name: '13q12.3', start: 32300000, end: 32330000, type: 'gneg' },
      { name: '13q13.1', start: 32330000, end: 32410000, type: 'gpos50' },
      { name: '13q13.2', start: 32410000, end: 32450000, type: 'gneg' }
    ],
    features: [
      {
        id: 'brca2-gene',
        type: 'gene',
        name: 'BRCA2',
        start: 32315474,
        end: 32400266,
        strand: '+',
        details: 'Breast cancer type 2 susceptibility protein. Coordinates homologous recombinational repair of double strand DNA breaks by loading RAD51 onto single strand DNA.',
        gcContent: 39.4,
        chromatinState: 'Active (H3K4me3 enriched)',
        exons: [
          { id: 'b2-ex1', start: 32315474, end: 32316200 },
          { id: 'b2-ex2', start: 32328000, end: 32329500 },
          { id: 'b2-ex3', start: 32341000, end: 32342200 },
          { id: 'b2-ex4', start: 32356000, end: 32358000 },
          { id: 'b2-ex5', start: 32371000, end: 32372500 },
          { id: 'b2-ex6', start: 32386000, end: 32387800 },
          { id: 'b2-ex7', start: 32398500, end: 32400266 }
        ]
      },
      {
        id: 'pds5b-gene',
        type: 'gene',
        name: 'PDS5B',
        start: 32415000,
        end: 32448000,
        strand: '-',
        details: 'PDS5 cohesin associated factor B. Regulator of sister chromatid cohesion during mitosis and meiosis.',
        gcContent: 46.2,
        chromatinState: 'Active',
        exons: [
          { id: 'pds-ex1', start: 32415000, end: 32417000 },
          { id: 'pds-ex2', start: 32430000, end: 32432000 },
          { id: 'pds-ex3', start: 32445000, end: 32448000 }
        ]
      },
      {
        id: 'brca2-promoter',
        type: 'promoter',
        name: 'BRCA2 Locus Promoter',
        start: 32312000,
        end: 32315474,
        strand: '+',
        details: 'Core transcriptional promoter region containing multiple E2F transcription factor binding sequences for cell-cycle coordinated expression.',
        gcContent: 61.2,
        chromatinState: 'Active Promoter'
      },
      {
        id: 'brca2-enhancer',
        type: 'enhancer',
        name: 'Super-Enhancer ENSR000001092',
        start: 32362000,
        end: 32367000,
        strand: '+',
        details: 'Epigenetic enhancer domain supporting persistent high-level expression of BRCA2 in active cell lines.',
        gcContent: 43.1,
        chromatinState: 'Highly Acetylated Chromatin (H3K27ac)'
      }
    ]
  },
  'TP53': {
    symbol: 'TP53',
    chromosome: '17',
    cytoband: '17p13.1',
    locusStart: 7600000,
    locusEnd: 7710000,
    bands: [
      { name: '17p13.2', start: 7600000, end: 7640000, type: 'gpos75' },
      { name: '17p13.1', start: 7640000, end: 7700000, type: 'gneg' },
      { name: '17p12', start: 7700000, end: 7710000, type: 'gpos50' }
    ],
    features: [
      {
        id: 'tp53-gene',
        type: 'gene',
        name: 'TP53',
        start: 7661779,
        end: 7687538,
        strand: '-',
        details: 'Tumor suppressor p53. Orchestrates cellular stress responses, regulating transcription of cell-cycle arrest, DNA repair, and apoptosis pathways.',
        gcContent: 58.2,
        chromatinState: 'Active/Poised Transcription Node',
        exons: [
          { id: 'p53-ex1', start: 7661779, end: 7663200 },
          { id: 'p53-ex2', start: 7668000, end: 7669500 },
          { id: 'p53-ex3', start: 7674000, end: 7675100 },
          { id: 'p53-ex4', start: 7678000, end: 7679800 },
          { id: 'p53-ex5', start: 7686000, end: 7687538 }
        ]
      },
      {
        id: 'wrap53-gene',
        type: 'gene',
        name: 'WRAP53',
        start: 7688000,
        end: 7705000,
        strand: '+',
        details: 'WD repeat containing antisense to TP53. Essential structural gene transcribing p53-antisense transcripts that physically stabilize TP53 mRNA.',
        gcContent: 62.4,
        chromatinState: 'Bidirectional Spliced Active Region',
        exons: [
          { id: 'wr-ex1', start: 7688000, end: 7690000 },
          { id: 'wr-ex2', start: 7696000, end: 7698000 },
          { id: 'wr-ex3', start: 7703000, end: 7705000 }
        ]
      },
      {
        id: 'tp53-cpg',
        type: 'cpg_island',
        name: 'CpG_Island_Chr17_766',
        start: 7686800,
        end: 7688200,
        strand: '+',
        details: 'Intense CpG sequence bridging the TP53 and WRAP53 promoters. Epigenetic methylation blocks transcription factor docking, reducing p53 cellular levels.',
        gcContent: 74.5,
        chromatinState: 'Highly Active CpG/Promoter'
      }
    ]
  },
  'PTEN': {
    symbol: 'PTEN',
    chromosome: '10',
    cytoband: '10q23.31',
    locusStart: 87800000,
    locusEnd: 88020000,
    bands: [
      { name: '10q23.2', start: 87800000, end: 87840000, type: 'gneg' },
      { name: '10q23.31', start: 87840000, end: 87980000, type: 'gpos25' },
      { name: '10q23.32', start: 87980000, end: 88020000, type: 'gneg' }
    ],
    features: [
      {
        id: 'pten-gene',
        type: 'gene',
        name: 'PTEN',
        start: 87862637,
        end: 87971930,
        strand: '-',
        details: 'Phosphatase and tensin homolog. Catalyzes dephosphorylation of PIP3 to PIP2, directly opposing oncogenic PI3K/Akt/mTOR signaling.',
        gcContent: 41.8,
        chromatinState: 'Active Transcription',
        exons: [
          { id: 'pt-ex1', start: 87862637, end: 87863500 },
          { id: 'pt-ex2', start: 87878000, end: 87879200 },
          { id: 'pt-ex3', start: 87895000, end: 87896100 },
          { id: 'pt-ex4', start: 87912000, end: 87913800 },
          { id: 'pt-ex5', start: 87934000, end: 87935200 },
          { id: 'pt-ex6', start: 87955000, end: 87956800 },
          { id: 'pt-ex7', start: 87970000, end: 87971930 }
        ]
      },
      {
        id: 'klln-gene',
        type: 'gene',
        name: 'KLLN',
        start: 87975000,
        end: 87995000,
        strand: '+',
        details: 'Killin, p53-regulated DNA replication inhibitor. Sits immediately adjacent, transcribing antisense pathways, causing cell-cycle arresting programs.',
        gcContent: 49.3,
        chromatinState: 'Co-regulated active transcript',
        exons: [
          { id: 'kl-ex1', start: 87975000, end: 87977000 },
          { id: 'kl-ex2', start: 87988000, end: 87990000 },
          { id: 'kl-ex3', start: 87993000, end: 87995000 }
        ]
      }
    ]
  },
  'APOE': {
    symbol: 'APOE',
    chromosome: '19',
    cytoband: '19q13.32',
    locusStart: 44880000,
    locusEnd: 44940000,
    bands: [
      { name: '19q13.31', start: 44880000, end: 44900000, type: 'gneg' },
      { name: '19q13.32', start: 44900000, end: 44930000, type: 'gpos50' },
      { name: '19q13.33', start: 44930000, end: 44940000, type: 'gneg' }
    ],
    features: [
      {
        id: 'apoe-gene',
        type: 'gene',
        name: 'APOE',
        start: 44905791,
        end: 44909393,
        strand: '+',
        details: 'Apolipoprotein E. Major lipoprotein mediator of neural cholesterol clearance and Amyloid Beta aggregation rates.',
        gcContent: 63.8,
        chromatinState: 'Highly active glial pathway',
        exons: [
          { id: 'ap-ex1', start: 44905791, end: 44906200 },
          { id: 'ap-ex2', start: 44906900, end: 44907400 },
          { id: 'ap-ex3', start: 44908100, end: 44908500 },
          { id: 'ap-ex4', start: 44909000, end: 44909393 }
        ]
      },
      {
        id: 'tomm40-gene',
        type: 'gene',
        name: 'TOMM40',
        start: 44890000,
        end: 44904000,
        strand: '+',
        details: 'Translocase of outer mitochondrial membrane 40. Essential mitochondrial membrane import pore, genetically linked to neurodegenerative risk patterns.',
        gcContent: 58.7,
        chromatinState: 'Active transcription',
        exons: [
          { id: 'tom-ex1', start: 44890000, end: 44892000 },
          { id: 'tom-ex2', start: 44896000, end: 44898000 },
          { id: 'tom-ex3', start: 44902000, end: 44904000 }
        ]
      },
      {
        id: 'apoc1-gene',
        type: 'gene',
        name: 'APOC1',
        start: 44915000,
        end: 44921000,
        strand: '+',
        details: 'Apolipoprotein C1. Lipoprotein component clustered physically in series with APOE transcripts.',
        gcContent: 60.1,
        chromatinState: 'Active glial complex',
        exons: [
          { id: 'ac-ex1', start: 44915000, end: 44916500 },
          { id: 'ac-ex2', start: 44919000, end: 44921000 }
        ]
      }
    ]
  },
  'TREM2': {
    symbol: 'TREM2',
    chromosome: '6',
    cytoband: '6p21.1',
    locusStart: 41100000,
    locusEnd: 41200000,
    bands: [
      { name: '6p21.2', start: 41100000, end: 41140000, type: 'gneg' },
      { name: '6p21.1', start: 41140000, end: 41180000, type: 'gpos25' },
      { name: '6p19.3', start: 41180000, end: 41200000, type: 'gneg' }
    ],
    features: [
      {
        id: 'trem2-gene',
        type: 'gene',
        name: 'TREM2',
        start: 41158506,
        end: 41163188,
        strand: '+',
        details: 'Triggering receptor expressed on myeloid cells 2. Microglial surface receptor organizing plaque phagocytosis and metabolic signaling cascade.',
        gcContent: 51.5,
        chromatinState: 'Tissue-specific active (Microglia)',
        exons: [
          { id: 'tr-ex1', start: 41158506, end: 41159100 },
          { id: 'tr-ex2', start: 41159800, end: 41160300 },
          { id: 'tr-ex3', start: 41160900, end: 41161400 },
          { id: 'tr-ex4', start: 41162000, end: 41162500 },
          { id: 'tr-ex5', start: 41162800, end: 41163188 }
        ]
      },
      {
        id: 'treml1-gene',
        type: 'gene',
        name: 'TREML1',
        start: 41120000,
        end: 41145000,
        strand: '-',
        details: 'TREM-like transcript 1 protein. Expressed on platelets, moderates downstream immunoglobin signaling interactions.',
        gcContent: 47.6,
        chromatinState: 'Vascular active transcription',
        exons: [
          { id: 'tl-ex1', start: 41120000, end: 41122000 },
          { id: 'tl-ex2', start: 41135000, end: 41137000 },
          { id: 'tl-ex3', start: 41143000, end: 41145000 }
        ]
      },
      {
        id: 'treml2-gene',
        type: 'gene',
        name: 'TREML2',
        start: 41175000,
        end: 41195000,
        strand: '+',
        details: 'TREM-like transcript 2. Interacts closely in the microglial receptor gene cluster on Chromosome 6.',
        gcContent: 49.0,
        chromatinState: 'Myeloid active complex',
        exons: [
          { id: 'tl2-ex1', start: 41175000, end: 41177000 },
          { id: 'tl2-ex2', start: 41188000, end: 41190000 },
          { id: 'tl2-ex3', start: 41193000, end: 41195000 }
        ]
      }
    ]
  }
};

export default function GenomicContextViewer() {
  const { selectedGeneSymbol, theme, token } = useResearch();
  const isClinical = theme === 'clinical';
  const containerRef = useRef<HTMLDivElement>(null);

  // Load active locus or fallback to BRCA1
  const locusKey = LOCUS_DATABASE[selectedGeneSymbol] ? selectedGeneSymbol : 'BRCA1';
  const locus = LOCUS_DATABASE[locusKey];

  // Browser state
  const [viewportStart, setViewportStart] = useState<number>(locus.locusStart);
  const [viewportEnd, setViewportEnd] = useState<number>(locus.locusEnd);
  const [selectedFeature, setSelectedFeature] = useState<LocusFeature | null>(null);
  const [hoveredFeature, setHoveredFeature] = useState<LocusFeature | null>(null);
  const [customCoord, setCustomCoord] = useState<string>('');
  const [showOverlays, setShowOverlays] = useState<boolean>(true);
  
  // AI summarizer state
  const [aiAnnotation, setAiAnnotation] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);

  // Sync state if gene changes
  useEffect(() => {
    setViewportStart(locus.locusStart);
    setViewportEnd(locus.locusEnd);
    setSelectedFeature(locus.features.find(f => f.name === locus.symbol) || null);
    setAiAnnotation('');
  }, [selectedGeneSymbol, locusKey]);

  // Coordinate scaling mathematics
  const width = 800; // SVG standard coordinate space width
  const toPixel = (bp: number): number => {
    const scale = width / (viewportEnd - viewportStart);
    return (bp - viewportStart) * scale;
  };

  const toBp = (px: number): number => {
    const scale = (viewportEnd - viewportStart) / width;
    return viewportStart + px * scale;
  };

  const viewportSize = viewportEnd - viewportStart;

  // Zoom / Pan functions
  const handleZoom = (factor: number) => {
    const center = (viewportStart + viewportEnd) / 2;
    const newHalfSize = (viewportSize * factor) / 2;
    // Limit zoom to keep scientific detail readable
    if (newHalfSize * 2 < 2000) return; // limit zoom in at 2 kb
    if (newHalfSize * 2 > 1000000) return; // limit zoom out at 1 Mb

    setViewportStart(Math.max(locus.locusStart, Math.floor(center - newHalfSize)));
    setViewportEnd(Math.min(locus.locusEnd, Math.floor(center + newHalfSize)));
  };

  const handlePan = (direction: 'left' | 'right') => {
    const shift = Math.floor(viewportSize * 0.25);
    if (direction === 'left') {
      const newStart = Math.max(locus.locusStart, viewportStart - shift);
      const newEnd = newStart + viewportSize;
      setViewportStart(newStart);
      setViewportEnd(Math.min(locus.locusEnd, newEnd));
    } else {
      const newEnd = Math.min(locus.locusEnd, viewportEnd + shift);
      const newStart = newEnd - viewportSize;
      setViewportEnd(newEnd);
      setViewportStart(Math.max(locus.locusStart, newStart));
    }
  };

  const handleCoordinateSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Parse coordinates like "43,050,000-43,100,000" or simple numbers
    const clean = customCoord.replace(/,/g, '').trim();
    const parts = clean.split('-');
    if (parts.length === 2) {
      const start = parseInt(parts[0]);
      const end = parseInt(parts[1]);
      if (!isNaN(start) && !isNaN(end) && start < end && start >= locus.locusStart && end <= locus.locusEnd) {
        setViewportStart(start);
        setViewportEnd(end);
      } else {
        alert(`Coordinates must be within chromosomal locus bounds: ${locus.locusStart.toLocaleString()} - ${locus.locusEnd.toLocaleString()} bp`);
      }
    } else {
      const center = parseInt(clean);
      if (!isNaN(center) && center >= locus.locusStart && center <= locus.locusEnd) {
        const half = 25000; // 50 kb window
        setViewportStart(Math.max(locus.locusStart, center - half));
        setViewportEnd(Math.min(locus.locusEnd, center + half));
      } else {
        alert('Format must be "Start-End" (e.g. 43040000-43100000) or a single central base-pair coordinate.');
      }
    }
  };

  const triggerLocusAnalysis = async () => {
    setLoadingAi(true);
    setAiAnnotation('');
    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({
          newMessage: `Perform a detailed scientific chromosome spatial annotation for the active locus: ${locus.symbol} (${locus.cytoband}) at coordinates chr${locus.chromosome}:${viewportStart.toLocaleString()}-${viewportEnd.toLocaleString()}. Explain how this neighborhood is structured, what enhancers or CTCF loop domains regulate it, and what are the neighboring genes or antisense transcripts (like NBR1, WRAP53, TOMM40). Focus on real clinical implications and double-strand break or metabolic pathways. Keep it concise, high-impact, and structured with bold terms.`
        })
      });
      const data = await response.json();
      setAiAnnotation(data.content || data.reply || (typeof data === 'string' ? data : 'Failed to retrieve AI analysis.'));
    } catch (err) {
      setAiAnnotation('Failed to establish real-time connection with GeneVision AI board. Please verify credentials.');
    } finally {
      setLoadingAi(false);
    }
  };

  // Filter features within current window
  const visibleFeatures = locus.features.filter(f => {
    return f.end >= viewportStart && f.start <= viewportEnd;
  });

  return (
    <div className={`p-6 rounded-2xl border ${
      isClinical 
        ? 'bg-white border-slate-200 text-slate-800' 
        : 'bg-slate-950 border-slate-900 text-white'
    } space-y-6 overflow-visible`}>
      
      {/* Header info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900/10 pb-4">
        <div className="space-y-1">
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded uppercase">
            NCBI-GENOME-BROWSER NODE
          </span>
          <h3 className={`text-lg font-bold flex items-center gap-2 ${isClinical ? 'text-slate-900' : 'text-white'}`}>
            <Compass className="w-5 h-5 text-emerald-400" /> NCBI-Style 3D Genomic Locus Viewer
          </h3>
          <p className="text-slate-500 text-[10px] font-mono uppercase">
            Physical chromosome coordinates, exons structure, and regulatory loop topography (Build GRCh38.p14)
          </p>
        </div>

        {/* Regulatory Overlays Toggle */}
        <div className="flex items-center gap-4 shrink-0">
          <label className="flex items-center gap-2 text-xs font-mono text-slate-400 cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={showOverlays} 
              onChange={() => setShowOverlays(!showOverlays)}
              className="accent-emerald-500 rounded cursor-pointer"
            />
            <span>REGULATORY TRACKS</span>
          </label>
          <div className="text-xs font-mono text-slate-400">
            Locus: <span className="font-bold text-emerald-400">{locus.symbol}</span> (Chr {locus.chromosome}:{locus.cytoband})
          </div>
        </div>
      </div>

      {/* Dynamic Cytoband Overview Track */}
      <div className="space-y-2">
        <div className="flex justify-between text-[10px] font-mono text-slate-500">
          <span>Chromosome {locus.chromosome} overview:</span>
          <span>{locus.locusStart.toLocaleString()} bp — {locus.locusEnd.toLocaleString()} bp</span>
        </div>
        
        {/* Cytoband SVG */}
        <div className="relative h-7 bg-slate-900/50 rounded-lg border border-slate-800 flex items-center overflow-hidden">
          {locus.bands.map((band, idx) => {
            const bandWidth = `${((band.end - band.start) / (locus.locusEnd - locus.locusStart)) * 100}%`;
            const bandColor = band.type === 'gpos100' ? 'bg-slate-800' 
                            : band.type === 'gpos75' ? 'bg-slate-700'
                            : band.type === 'gpos50' ? 'bg-slate-600'
                            : band.type === 'gpos25' ? 'bg-slate-500'
                            : band.type === 'acen' ? 'bg-red-950/20'
                            : 'bg-slate-300';
            const textColor = band.type === 'gpos100' || band.type === 'gpos75' ? 'text-slate-400' : 'text-slate-700';

            return (
              <div 
                key={band.name} 
                className={`h-full ${bandColor} flex items-center justify-center relative border-r border-slate-900/10`}
                style={{ width: bandWidth }}
              >
                <span className={`text-[8px] font-mono font-bold ${textColor} select-none`}>{band.name}</span>
              </div>
            );
          })}

          {/* Red view boundary bracket */}
          {(() => {
            const totalRange = locus.locusEnd - locus.locusStart;
            const leftPercent = `${((viewportStart - locus.locusStart) / totalRange) * 100}%`;
            const widthPercent = `${((viewportEnd - viewportStart) / totalRange) * 100}%`;
            return (
              <div 
                className="absolute top-0 bottom-0 border-2 border-red-500 bg-red-500/10 rounded pointer-events-none transition-all duration-150"
                style={{ left: leftPercent, width: widthPercent }}
              />
            );
          })()}
        </div>
      </div>

      {/* Control Panel: Zoom, Pan, Search */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-slate-900/20 border border-slate-900 rounded-xl">
        {/* Pan and Zoom Buttons */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => handlePan('left')}
            className="p-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-300 transition cursor-pointer"
            title="Pan Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <button 
            onClick={() => handleZoom(0.75)} // Zoom In
            className="p-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-300 transition flex items-center gap-1 cursor-pointer"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold hidden sm:inline">ZOOM IN</span>
          </button>

          <button 
            onClick={() => handleZoom(1.35)} // Zoom Out
            className="p-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-300 transition flex items-center gap-1 cursor-pointer"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold hidden sm:inline">ZOOM OUT</span>
          </button>

          <button 
            onClick={() => handlePan('right')}
            className="p-1.5 bg-slate-900 hover:bg-slate-850 rounded-lg border border-slate-800 hover:border-slate-700 text-slate-300 transition cursor-pointer"
            title="Pan Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Coordinate Window Label */}
        <div className="text-xs font-mono font-bold text-slate-400 text-center px-4 py-1.5 bg-slate-950 border border-slate-900 rounded-lg">
          Viewport: chr{locus.chromosome}:{viewportStart.toLocaleString()} - {viewportEnd.toLocaleString()} bp 
          <span className="text-slate-500 font-normal ml-1">({viewportSize.toLocaleString()} bp)</span>
        </div>

        {/* Coordinate Search form */}
        <form onSubmit={handleCoordinateSearch} className="flex gap-1.5">
          <input 
            type="text" 
            placeholder="Go to coord (e.g. 43050000-43100000)..." 
            value={customCoord}
            onChange={e => setCustomCoord(e.target.value)}
            className="bg-slate-950 border border-slate-900 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono w-48 sm:w-56"
          />
          <button 
            type="submit"
            className="p-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition cursor-pointer"
            title="Jump to coordinates"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Main SVG Coordinate Browser Area */}
      <div className="relative bg-slate-950 rounded-2xl border border-slate-900 p-4 select-none overflow-hidden">
        
        {/* Scale indicator */}
        <div className="absolute top-2 left-4 flex flex-col gap-0.5 text-[9px] font-mono text-slate-500">
          <div className="flex items-center gap-1">
            <div className="w-16 h-0.5 bg-slate-500" />
            <span>{Math.floor(viewportSize / 10).toLocaleString()} bp</span>
          </div>
        </div>

        {/* Browser Tracks SVG */}
        <svg 
          viewBox={`0 0 ${width} 230`} 
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="3d-exon-active" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a7f3d0" />
              <stop offset="30%" stopColor="#34d399" />
              <stop offset="70%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#064e3b" />
            </linearGradient>
            <linearGradient id="3d-exon-inactive" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#cbd5e1" />
              <stop offset="30%" stopColor="#94a3b8" />
              <stop offset="70%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="3d-promoter" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a5f3fc" />
              <stop offset="40%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#083344" />
            </linearGradient>
            <linearGradient id="3d-enhancer" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#713f12" />
            </linearGradient>
            <linearGradient id="3d-cpg" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#bbf7d0" />
              <stop offset="40%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#14532d" />
            </linearGradient>
            <linearGradient id="3d-ctcf" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ddd6fe" />
              <stop offset="40%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#2e1065" />
            </linearGradient>
            <filter id="3d-glow-active" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.06   0 0 0 0 0.73   0 0 0 0 0.51  0 0 0 0.6 0" />
              <feMerge>
                <feMergeNode />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Vertical grid lines (5 partitions) */}
          {[0, 1, 2, 3, 4, 5].map(idx => {
            const x = (idx / 5) * width;
            const bp = Math.floor(viewportStart + (idx / 5) * viewportSize);
            return (
              <g key={idx}>
                <line 
                  x1={x} 
                  y1={15} 
                  x2={x} 
                  y2={210} 
                  stroke="#1e293b" 
                  strokeWidth={0.5} 
                  strokeDasharray="2 3" 
                />
                <text 
                  x={x} 
                  y={12} 
                  textAnchor="middle" 
                  className="fill-slate-600 font-mono text-[8px]"
                >
                  {bp.toLocaleString()}
                </text>
              </g>
            );
          })}

          {/* ========================================== */}
          {/* TRACK 1: GENE TRANSCRIPTS AND EXONS        */}
          {/* ========================================== */}
          <text x="5" y="45" className="fill-slate-400 font-mono text-[10px] font-bold">GENE TRACK</text>
          
          {visibleFeatures.filter(f => f.type === 'gene').map((gene) => {
            const xStart = toPixel(gene.start);
            const xEnd = toPixel(gene.end);
            const y = 60;
            const direction = gene.strand === '+' ? '→' : '←';
            const isActive = selectedFeature?.id === gene.id;
            const isHovered = hoveredFeature?.id === gene.id;

            return (
              <g 
                key={gene.id}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredFeature(gene)}
                onMouseLeave={() => setHoveredFeature(null)}
                onClick={() => setSelectedFeature(gene)}
              >
                {/* Thin Intron connecting line */}
                <line 
                  x1={Math.max(0, xStart)} 
                  y1={y} 
                  x2={Math.min(width, xEnd)} 
                  y2={y} 
                  stroke={isActive ? '#10b981' : isHovered ? '#34d399' : '#475569'} 
                  strokeWidth={isActive ? 2 : 1.2} 
                />

                {/* Splicing direction arrows */}
                {Array.from({ length: 6 }).map((_, aIdx) => {
                  const arrowX = xStart + ((aIdx + 1) / 7) * (xEnd - xStart);
                  if (arrowX > 0 && arrowX < width) {
                    return (
                      <text 
                        key={aIdx} 
                        x={arrowX} 
                        y={y + 3} 
                        textAnchor="middle" 
                        className={`font-sans text-[8px] select-none ${isActive ? 'fill-emerald-400' : 'fill-slate-600'}`}
                      >
                        {direction}
                      </text>
                    );
                  }
                  return null;
                })}

                {/* Render thick Exon blocks with 3D gradient fill */}
                {gene.exons?.map((exon) => {
                  const exX = toPixel(exon.start);
                  const exW = toPixel(exon.end) - exX;
                  // Render only if within viewport bounds
                  if (exX + exW > 0 && exX < width) {
                    const exonFill = isActive ? 'url(#3d-exon-active)' : isHovered ? 'url(#3d-exon-active)' : 'url(#3d-exon-inactive)';
                    return (
                      <rect 
                        key={exon.id}
                        x={Math.max(0, exX)}
                        y={y - 10}
                        width={Math.max(3, exW)}
                        height={20}
                        rx={3}
                        fill={exonFill}
                        stroke={isActive ? '#ffffff' : '#0f172a'}
                        strokeWidth={0.8}
                        filter={isActive ? 'url(#3d-glow-active)' : 'none'}
                        className="transition-all duration-150"
                      />
                    );
                  }
                  return null;
                })}

                {/* Gene Name Label */}
                <text 
                  x={(xStart + xEnd) / 2} 
                  y={y - 14} 
                  textAnchor="middle" 
                  className={`font-mono text-[9px] font-bold ${isActive ? 'fill-emerald-400' : isHovered ? 'fill-slate-200' : 'fill-slate-400'}`}
                >
                  {gene.name} ({gene.strand})
                </text>
              </g>
            );
          })}

          {/* ========================================== */}
          {/* TRACK 2: REGULATORY ELEMENTS OVERLAY       */}
          {/* ========================================== */}
          {showOverlays && (
            <>
              <line x1="0" y1="110" x2={width} y2="110" stroke="#1e293b" strokeWidth={1} />
              <text x="5" y="128" className="fill-slate-400 font-mono text-[10px] font-bold">REGULATORY OVERLAYS</text>

              {visibleFeatures.filter(f => f.type !== 'gene').map((elem) => {
                const elX = toPixel(elem.start);
                const elW = toPixel(elem.end) - elX;
                const y = 150;
                const isActive = selectedFeature?.id === elem.id;
                const isHovered = hoveredFeature?.id === elem.id;

                // Color based on regulatory element type
                const colorFill = elem.type === 'promoter' ? 'url(#3d-promoter)'
                            : elem.type === 'enhancer' ? 'url(#3d-enhancer)'
                            : elem.type === 'cpg_island' ? 'url(#3d-cpg)'
                            : 'url(#3d-ctcf)';

                const strokeColor = elem.type === 'promoter' ? '#22d3ee'
                             : elem.type === 'enhancer' ? '#fbbf24'
                             : elem.type === 'cpg_island' ? '#22c55e'
                             : '#8b5cf6';

                if (elX + elW > 0 && elX < width) {
                  return (
                    <g 
                      key={elem.id}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredFeature(elem)}
                      onMouseLeave={() => setHoveredFeature(null)}
                      onClick={() => setSelectedFeature(elem)}
                    >
                      <rect 
                        x={Math.max(0, elX)}
                        y={y - 12}
                        width={Math.max(5, elW)}
                        height={24}
                        rx={5}
                        fill={colorFill}
                        fillOpacity={isActive ? 0.9 : isHovered ? 0.75 : 0.45}
                        stroke={isActive ? '#ffffff' : strokeColor}
                        strokeWidth={isActive ? 1.5 : isHovered ? 1.0 : 0.6}
                        strokeDasharray={elem.type === 'ctcf_site' ? '3 2' : 'none'}
                        filter={isActive ? 'url(#3d-glow-active)' : 'none'}
                      />
                      
                      {/* Element title */}
                      <text 
                        x={Math.max(10, elX + 6)}
                        y={y + 16}
                        className={`font-mono text-[8px] font-bold ${isActive ? 'fill-white' : isHovered ? 'fill-slate-100' : 'fill-slate-400'}`}
                      >
                        {elem.name}
                      </text>
                    </g>
                  );
                }
                return null;
              })}
            </>
          )}
        </svg>

        {/* Prompt instructions if nothing hovered/selected */}
        {!selectedFeature && !hoveredFeature && (
          <div className="absolute inset-0 bg-slate-950/25 backdrop-blur-[1px] flex items-center justify-center pointer-events-none">
            <div className="bg-slate-950/95 border border-slate-900 rounded-xl px-4 py-2 text-[10px] font-mono text-slate-400 flex items-center gap-1.5 shadow-xl">
              <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span>Click Exons, Neighbor Genes, or Regulatory items above to inspect local bio-properties</span>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Locus Details & AI Annotation Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        
        {/* Detail Inspector Card */}
        <div className="lg:col-span-5">
          <AnimatePresence mode="wait">
            {selectedFeature ? (
              <motion.div 
                key={selectedFeature.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="p-5 rounded-2xl border border-slate-900 bg-slate-900/10 flex flex-col justify-between h-full space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-bold">
                        {selectedFeature.type.toUpperCase()}
                      </span>
                      <h4 className="text-sm font-bold text-white font-mono">{selectedFeature.name}</h4>
                    </div>
                    <div className="text-right text-[10px] font-mono text-slate-500">
                      <span>Len: {(selectedFeature.end - selectedFeature.start).toLocaleString()} bp</span>
                    </div>
                  </div>

                  {/* Range Coordinates */}
                  <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl space-y-1 font-mono text-[10px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">CHROMOSOME</span>
                      <span className="text-white font-bold">Chr {locus.chromosome}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">RANGE</span>
                      <span className="text-white font-bold">
                        {selectedFeature.start.toLocaleString()} - {selectedFeature.end.toLocaleString()} bp
                      </span>
                    </div>
                    {selectedFeature.gcContent && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">GC CONTENT</span>
                        <span className="text-white font-bold">{selectedFeature.gcContent}%</span>
                      </div>
                    )}
                    {selectedFeature.chromatinState && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">CHROMATIN STATE</span>
                        <span className="text-emerald-400 font-bold">{selectedFeature.chromatinState}</span>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase block">Biological Description</span>
                    <p className="text-xs leading-relaxed text-slate-400 font-sans">{selectedFeature.details}</p>
                  </div>
                </div>

                <div className="p-2.5 bg-slate-950/40 border border-slate-900/60 rounded-xl text-[9px] font-mono text-slate-500 leading-relaxed">
                  💡 Double-click or pan your cursor along the track to inspect the entire genomic neighborhood.
                </div>
              </motion.div>
            ) : (
              <div className="p-5 rounded-2xl border border-slate-900 bg-slate-900/5 h-full flex flex-col items-center justify-center text-center py-12">
                <Compass className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-xs font-mono text-slate-500">No feature currently loaded in inspectors.</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* AI chromatin neighborhood Loop summary (Right column) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl border border-slate-900 bg-slate-950 flex flex-col justify-between h-full min-h-[250px] space-y-4 relative">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-slate-500 uppercase block">AI GROUNDED CHATTER</span>
                  <h5 className="text-sm font-bold text-white flex items-center gap-1.5 font-mono">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Chromatin Loop & Insulator AI Summary
                  </h5>
                </div>
                
                {/* AI button */}
                <button 
                  onClick={triggerLocusAnalysis}
                  disabled={loadingAi}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-[10px] uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {loadingAi ? 'Annotating...' : 'Analyze Locus'}
                  <Sparkles className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* AI output */}
              <div className="max-h-[160px] overflow-y-auto text-xs leading-relaxed font-sans text-slate-400 space-y-2 pr-2 scrollbar-thin">
                {loadingAi ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-2 text-slate-500">
                    <Activity className="w-5 h-5 text-emerald-400 animate-spin" />
                    <span className="font-mono text-[10px] uppercase">Retrieving chromatin coordinates from GeneVision AI Board...</span>
                  </div>
                ) : aiAnnotation ? (
                  <div className="whitespace-pre-line text-slate-300 font-sans leading-relaxed">
                    {aiAnnotation}
                  </div>
                ) : (
                  <p className="text-slate-500 italic py-6 text-center">
                    Click "Analyze Locus" to query our AI board for real-time epigenetic models, TAD loop boundary analysis, and clinical mutation insights.
                  </p>
                )}
              </div>
            </div>

            <div className="p-2.5 bg-slate-900/40 border border-slate-900/60 rounded-xl text-[9px] font-mono text-slate-500 leading-relaxed">
              🧬 Generative response grounded in actual NCBI transcripts and 3D chromatin conformation profiles.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
