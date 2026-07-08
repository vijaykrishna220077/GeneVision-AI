import React, { useState, useEffect, useRef } from 'react';
import { useResearch } from './ResearchContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  X,
  Atom,
  Network,
  BookOpen,
  Plus,
  Trash2,
  FolderDot,
  FileText,
  Edit3,
  Calendar,
  Sparkles,
  Command,
  ArrowRight,
  Bookmark,
  Check,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

interface GlobalSearchBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

interface CustomNote {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  associatedGene?: string;
}

const GENE_DATABASE: { [symbol: string]: { symbol: string; name: string; chromosome: string; position: string; description: string; therapies: string[] } } = {
  'BRCA1': {
    symbol: 'BRCA1',
    name: 'BRCA1 DNA Repair Associated',
    chromosome: '17',
    position: '17q21.31',
    description: 'Essential tumor suppressor protein. Biallelic loss impairs homologous recombination repair of double-stranded DNA breaks, leading to highly elevated breast and ovarian cancer risks.',
    therapies: ['Olaparib (Lynparza)', 'Talazoparib (Talzenna)', 'Niraparib (Zejula)']
  },
  'BRCA2': {
    symbol: 'BRCA2',
    name: 'BRCA2 DNA Repair Associated',
    chromosome: '13',
    position: '13q13.1',
    description: 'Works in conjunction with RAD51 and BRCA1 to facilitate homologous recombination. Inherited heterozygous mutations increase breast, ovarian, pancreatic, and prostate cancer predisposition.',
    therapies: ['Olaparib (Lynparza)', 'Rucaparib (Rubraca)']
  },
  'TP53': {
    symbol: 'TP53',
    name: 'Tumor Protein p53',
    chromosome: '17',
    position: '17p13.1',
    description: 'The "guardian of the genome". Regulates cell cycle arrest, DNA repair, and apoptotic cascades in response to cellular stress or oncogene activations. The most mutated gene in oncology.',
    therapies: ['No direct FDA inhibitors; standard cytotoxic therapies + experimental gene repair agents']
  },
  'PTEN': {
    symbol: 'PTEN',
    name: 'Phosphatase and Tensin Homolog',
    chromosome: '10',
    position: '10q23.31',
    description: 'Inhibits PI3K/Akt signaling, serving as a brake on cell proliferation, growth, and survival. Loss of PTEN expression leads to hyperactivation of Akt pathway and drug resistance.',
    therapies: ['Everolimus (Afinitor)', 'Alpelisib (Piqray)']
  },
  'APOE': {
    symbol: 'APOE',
    name: 'Apolipoprotein E',
    chromosome: '19',
    position: '19q13.32',
    description: 'Major cholesterol carrier in the central nervous system. The ε4 allele dramatically promotes beta-amyloid aggregation, synapse loss, and late-onset Alzheimer’s disease progression.',
    therapies: ['Lecanemab (Leqembi)', 'Donanemab (Kisunla)']
  },
  'TREM2': {
    symbol: 'TREM2',
    name: 'Triggering Receptor Expressed on Myeloid Cells 2',
    chromosome: '6',
    position: '6p21.1',
    description: 'Immunoglobulin receptor on microglia. Essential for plaque phagocytosis, microglial survival, and metabolic activation. R47H mutation triples late-onset Alzheimer’s risk.',
    therapies: ['AL002 (Experimental Phase II)']
  }
};

const PATHWAY_DATABASE = [
  {
    id: 'p1',
    name: 'Double-Strand DNA Repair Pathway',
    source: 'KEGG',
    description: 'Critical cellular response involving homologous recombination to repair lethal double-strand breaks. Governed by BRCA1, BRCA2, and RAD51 proteins.',
    genes: ['BRCA1', 'BRCA2', 'RAD51']
  },
  {
    id: 'p2',
    name: 'PI3K/Akt/mTOR Proliferation Pathway',
    source: 'Reactome',
    description: 'An intracellular signaling pathway crucial for regulating the cell cycle, cell growth, and translation. Highly activated in oncogenesis when PTEN tumor suppressor is lost.',
    genes: ['PTEN', 'PIK3CA', 'AKT1', 'MTOR']
  },
  {
    id: 'p3',
    name: 'Amyloid-Beta Microglial Phagocytosis Cascade',
    source: 'WikiPathways',
    description: 'Neuroimmunology cascade that facilitates microglial migration, plaque clearance, and cell survival in central nervous system structures. Influenced by TREM2 variants and APOE alleles.',
    genes: ['TREM2', 'APOE', 'TYROBP']
  }
];

export default function GlobalSearchBar({ activeTab, setActiveTab }: GlobalSearchBarProps) {
  const { theme, projects, setSelectedGeneSymbol } = useResearch();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'genes' | 'projects' | 'notes'>('all');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  // Mouse position and hover tracking for details pane dynamic glowing border
  const [paneMousePos, setPaneMousePos] = useState({ x: 0, y: 0 });
  const [isPaneHovered, setIsPaneHovered] = useState(false);

  const handlePaneMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPaneMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  // Custom Notes State (Persisted in localStorage)
  const [customNotes, setCustomNotes] = useState<CustomNote[]>([]);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');
  const [newNoteAssociatedGene, setNewNoteAssociatedGene] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Load custom notes on mount
  useEffect(() => {
    const savedNotes = localStorage.getItem('gv_research_notes');
    if (savedNotes) {
      try {
        setCustomNotes(JSON.parse(savedNotes));
      } catch (err) {
        console.error('Failed to parse saved notes:', err);
      }
    } else {
      // Seed default notes for a rich initial experience
      const defaultNotes: CustomNote[] = [
        {
          id: 'note-1',
          title: 'BRCA1 Double-Strand DNA Repair Efficiency',
          content: 'Observed significant therapeutic response with Olaparib (Lynparza) in cohorts showing somatic BRCA1 cytoband deletions. Homologous recombination deficiency (HRD) score should be evaluated.',
          tags: ['BRCA1', 'Oncology', 'Therapeutics'],
          createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
          associatedGene: 'BRCA1'
        },
        {
          id: 'note-2',
          title: 'APOE ε4 Alzheimer Plaque Correlation',
          content: 'Microglial clearout rates appear significantly suppressed in homozygous ε4/ε4 models compared to controls. Interlocking TREM2 receptor function might restore plaque phagocytosis rates.',
          tags: ['APOE', 'Neurodegenerative', 'Microglia'],
          createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
          associatedGene: 'APOE'
        }
      ];
      setCustomNotes(defaultNotes);
      localStorage.setItem('gv_research_notes', JSON.stringify(defaultNotes));
    }
  }, []);

  // Save notes helper
  const saveNotesToStorage = (notes: CustomNote[]) => {
    setCustomNotes(notes);
    localStorage.setItem('gv_research_notes', JSON.stringify(notes));
  };

  // Listen for keyboard shortcuts (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
      setSelectedItem(null);
      setIsCreatingNote(false);
      setIsEditingNote(false);
    }
  }, [isOpen]);

  // Handle Note Creation
  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;

    const newNote: CustomNote = {
      id: `note-${Date.now()}`,
      title: newNoteTitle.trim(),
      content: newNoteContent.trim(),
      tags: newNoteTags.split(',').map(tag => tag.trim().replace(/^#/, '')).filter(tag => tag.length > 0),
      createdAt: new Date().toISOString(),
      associatedGene: newNoteAssociatedGene || undefined
    };

    const updated = [newNote, ...customNotes];
    saveNotesToStorage(updated);
    
    // Reset fields
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteTags('');
    setNewNoteAssociatedGene('');
    setIsCreatingNote(false);
    setSelectedItem(newNote);
  };

  // Handle Note Editing
  const handleUpdateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingNoteId || !newNoteTitle.trim() || !newNoteContent.trim()) return;

    const updated = customNotes.map(n => {
      if (n.id === editingNoteId) {
        return {
          ...n,
          title: newNoteTitle.trim(),
          content: newNoteContent.trim(),
          tags: newNoteTags.split(',').map(tag => tag.trim().replace(/^#/, '')).filter(tag => tag.length > 0),
          associatedGene: newNoteAssociatedGene || undefined
        };
      }
      return n;
    });

    saveNotesToStorage(updated);
    
    // Reset fields
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteTags('');
    setNewNoteAssociatedGene('');
    setIsEditingNote(false);
    setEditingNoteId(null);
    
    const updatedNote = updated.find(n => n.id === editingNoteId);
    if (updatedNote) setSelectedItem(updatedNote);
  };

  // Handle Note Deletion
  const handleDeleteNote = (noteId: string) => {
    if (confirm('Are you sure you want to delete this research note?')) {
      const updated = customNotes.filter(n => n.id !== noteId);
      saveNotesToStorage(updated);
      setSelectedItem(null);
    }
  };

  const startEditNote = (note: CustomNote) => {
    setNewNoteTitle(note.title);
    setNewNoteContent(note.content);
    setNewNoteTags(note.tags.join(', '));
    setNewNoteAssociatedGene(note.associatedGene || '');
    setEditingNoteId(note.id);
    setIsEditingNote(true);
    setIsCreatingNote(false);
  };

  // Compile search results
  const getSearchResults = () => {
    const results: any[] = [];
    const query = searchQuery.trim().toLowerCase();

    // 1. Genes
    if (activeFilter === 'all' || activeFilter === 'genes') {
      Object.values(GENE_DATABASE).forEach(gene => {
        if (
          gene.symbol.toLowerCase().includes(query) ||
          gene.name.toLowerCase().includes(query) ||
          gene.chromosome.toLowerCase().includes(query) ||
          gene.description.toLowerCase().includes(query)
        ) {
          results.push({
            type: 'gene',
            id: `gene-${gene.symbol}`,
            title: gene.symbol,
            subtitle: gene.name,
            description: gene.description,
            data: gene
          });
        }
      });
    }

    // 2. Projects & Pathways
    if (activeFilter === 'all' || activeFilter === 'projects') {
      // Projects
      projects.forEach(project => {
        if (
          project.name.toLowerCase().includes(query) ||
          project.description.toLowerCase().includes(query) ||
          project.diseaseType.toLowerCase().includes(query)
        ) {
          results.push({
            type: 'project',
            id: `project-${project.id}`,
            title: project.name,
            subtitle: `Project Cluster • ${project.diseaseType}`,
            description: project.description,
            data: project
          });
        }
      });

      // Pathways
      PATHWAY_DATABASE.forEach(pathway => {
        if (
          pathway.name.toLowerCase().includes(query) ||
          pathway.description.toLowerCase().includes(query) ||
          pathway.genes.some(g => g.toLowerCase().includes(query))
        ) {
          results.push({
            type: 'pathway',
            id: `pathway-${pathway.id}`,
            title: pathway.name,
            subtitle: `Biological Pathway Map • ${pathway.source}`,
            description: pathway.description,
            data: pathway
          });
        }
      });
    }

    // 3. Custom Research Notes
    if (activeFilter === 'all' || activeFilter === 'notes') {
      customNotes.forEach(note => {
        if (
          note.title.toLowerCase().includes(query) ||
          note.content.toLowerCase().includes(query) ||
          note.tags.some(t => t.toLowerCase().includes(query)) ||
          (note.associatedGene && note.associatedGene.toLowerCase().includes(query))
        ) {
          results.push({
            type: 'note',
            id: `note-${note.id}`,
            title: note.title,
            subtitle: `Research Note • ${note.tags.map(t => `#${t}`).join(' ')}`,
            description: note.content,
            data: note
          });
        }
      });
    }

    return results;
  };

  const results = getSearchResults();

  // If search matches perfectly, default select first item
  useEffect(() => {
    if (results.length > 0 && !selectedItem) {
      setSelectedItem(results[0]);
    }
  }, [results, selectedItem]);

  const handleItemSelect = (item: any) => {
    setSelectedItem(item);
    setIsCreatingNote(false);
    setIsEditingNote(false);
  };

  // Navigation handlers
  const navigateToGene = (symbol: string) => {
    setSelectedGeneSymbol(symbol);
    setActiveTab('explorer');
    setIsOpen(false);
  };

  const navigateToPathway = () => {
    setActiveTab('pathways');
    setIsOpen(false);
  };

  const navigateToDashboard = () => {
    setActiveTab('dashboard');
    setIsOpen(false);
  };

  const isClinical = theme === 'clinical';

  return (
    <>
      {/* Top Header compact triggers */}
      <div className="relative max-w-xs md:max-w-md w-full shrink-0 min-w-[180px]">
        <div
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-mono select-none cursor-pointer transition-all ${
            isClinical
              ? 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-400 hover:bg-white shadow-sm'
              : 'bg-slate-900/40 border-slate-900 text-slate-500 hover:border-slate-800 hover:bg-slate-900/60'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-indigo-400" />
          <span className="flex-1 text-left text-[11px] text-slate-500 truncate">
            Search Genes, Pathways, or Research Notes...
          </span>
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono leading-none border scale-90 ${
            isClinical
              ? 'bg-slate-100 border-slate-200 text-slate-500'
              : 'bg-slate-950 border-slate-900 text-slate-400'
          }`}>
            ⌘K
          </span>
        </div>
      </div>

      {/* Global Search command palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="global-search-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 md:p-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
          >
            <motion.div
              id="global-search-modal"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
              className={`w-full max-w-4xl h-[85vh] max-h-[650px] rounded-xl border overflow-hidden shadow-2xl flex flex-col ${
                isClinical
                  ? 'bg-white/80 backdrop-blur-xl border-slate-200 text-slate-800 shadow-slate-300/40'
                  : 'bg-slate-950/80 backdrop-blur-xl border-slate-900 text-white shadow-indigo-500/10'
              }`}
            >
            {/* Header: Input area */}
            <div className={`p-4 md:p-5 border-b flex items-center gap-3 shrink-0 ${
              isClinical ? 'border-slate-100' : 'border-slate-900'
            }`}>
              <Search className="w-5 h-5 text-indigo-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Type to find genes (BRCA1, TP53...), pathway concepts, or somatic research notes..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedItem(null); // Reset detail pane on input
                }}
                className={`flex-1 bg-transparent text-sm md:text-base border-none focus:outline-none focus:ring-0 ${
                  isClinical ? 'text-slate-900 placeholder-slate-400 font-medium' : 'text-white placeholder-slate-500 font-medium'
                }`}
              />
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-full transition-all cursor-pointer ${
                  isClinical ? 'hover:bg-slate-100 text-slate-400 hover:text-slate-800' : 'hover:bg-slate-900 text-slate-500 hover:text-white'
                }`}
                title="Close overlay"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Navigation Bar */}
            <div className={`px-4 md:px-5 py-2.5 border-b flex items-center gap-1 overflow-x-auto shrink-0 ${
              isClinical ? 'bg-slate-50 border-slate-100' : 'bg-slate-900/10 border-slate-900'
            }`}>
              {[
                { id: 'all', label: 'All Registry Items' },
                { id: 'genes', label: 'Gene Loci entries' },
                { id: 'projects', label: 'Pathways & Projects' },
                { id: 'notes', label: 'Somatic Research Notes' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    setActiveFilter(f.id as any);
                    setSelectedItem(null);
                  }}
                  className={`px-3 py-1 rounded-full text-[10px] md:text-[11px] font-mono tracking-wider uppercase transition-all shrink-0 cursor-pointer ${
                    activeFilter === f.id
                      ? 'bg-indigo-600 text-white font-bold'
                      : isClinical
                        ? 'hover:bg-slate-200 text-slate-500'
                        : 'hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}

              <div className="ml-auto pl-4">
                <button
                  onClick={() => {
                    setIsCreatingNote(true);
                    setSelectedItem(null);
                    setNewNoteTitle('');
                    setNewNoteContent('');
                    setNewNoteTags('');
                    setNewNoteAssociatedGene('');
                  }}
                  className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-[10px] uppercase rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                >
                  <Plus className="w-3 h-3" /> New Note
                </button>
              </div>
            </div>

            {/* Main Content Split: Left Results, Right Details */}
            <div className="flex-1 flex overflow-hidden">
              {/* Left Column: Results List */}
              <div className={`w-full md:w-[42%] flex flex-col border-r overflow-y-auto ${
                isClinical ? 'border-slate-100' : 'border-slate-900'
              }`}>
                {results.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <HelpCircle className="w-8 h-8 text-slate-600 animate-pulse" />
                    <div className="space-y-1">
                      <p className="text-xs font-mono font-bold uppercase text-slate-400">No registry matches found</p>
                      <p className="text-[10px] text-slate-500 max-w-[200px] leading-relaxed mx-auto">
                        Try searching for symbols like <strong>BRCA1, TP53, APOE, TREM2</strong> or check pathways.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-900/30 p-2 space-y-1">
                    {results.map(item => {
                      const isSelected = selectedItem?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleItemSelect(item)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                            isSelected
                              ? isClinical
                                ? 'bg-indigo-50/70 border-indigo-200 text-indigo-900'
                                : 'bg-slate-900 border-slate-800 text-white'
                              : isClinical
                                ? 'bg-transparent border-transparent hover:bg-slate-50 text-slate-700'
                                : 'bg-transparent border-transparent hover:bg-slate-950 text-slate-300'
                          }`}
                        >
                          {/* Type-based icon */}
                          <div className={`p-2 rounded-xl shrink-0 ${
                            item.type === 'gene' ? 'bg-emerald-500/10 text-emerald-400' :
                            item.type === 'pathway' ? 'bg-amber-500/10 text-amber-400' :
                            item.type === 'project' ? 'bg-indigo-500/10 text-indigo-400' :
                            'bg-sky-500/10 text-sky-400'
                          }`}>
                            {item.type === 'gene' && <Atom className="w-4 h-4" />}
                            {item.type === 'pathway' && <Network className="w-4 h-4" />}
                            {item.type === 'project' && <FolderDot className="w-4 h-4" />}
                            {item.type === 'note' && <FileText className="w-4 h-4" />}
                          </div>

                          <div className="flex-1 min-w-0 space-y-0.5">
                            <h4 className="font-sans font-bold text-xs truncate uppercase tracking-tight">
                              {item.title}
                            </h4>
                            <p className="text-[10px] font-mono text-slate-500 uppercase truncate">
                              {item.subtitle}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate leading-snug">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right Column: Detail Pane / Note Creator */}
              <div
                key={selectedItem?.id || (isCreatingNote ? 'create' : 'empty')}
                onMouseMove={handlePaneMouseMove}
                onMouseEnter={() => setIsPaneHovered(true)}
                onMouseLeave={() => setIsPaneHovered(false)}
                className={`hidden md:block flex-1 overflow-y-auto p-6 md:p-8 border-l relative transition-all duration-300 animate-detail-slide-in ${
                  isClinical 
                    ? 'bg-slate-50/40 border-slate-100 hover:border-indigo-300/60' 
                    : 'bg-slate-950/20 border-slate-900 hover:border-indigo-500/30'
                }`}
              >
                {/* Dynamic glowing border overlay that reacts to cursor position */}
                <div 
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-20"
                  style={{
                    padding: '1px',
                    background: isPaneHovered 
                      ? `radial-gradient(180px circle at ${paneMousePos.x}px ${paneMousePos.y}px, ${
                          isClinical ? 'rgba(99, 102, 241, 0.45)' : 'rgba(99, 102, 241, 0.6)'
                        }, transparent 80%)` 
                      : 'transparent',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude',
                    opacity: isPaneHovered ? 1 : 0,
                  }}
                />

                {/* Dynamic subtle radial inner glow overlay that reacts to cursor position */}
                <div 
                  className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-10"
                  style={{
                    background: isPaneHovered 
                      ? `radial-gradient(280px circle at ${paneMousePos.x}px ${paneMousePos.y}px, ${
                          isClinical ? 'rgba(99, 102, 241, 0.03)' : 'rgba(99, 102, 241, 0.07)'
                        }, transparent 80%)` 
                      : 'transparent',
                    opacity: isPaneHovered ? 1 : 0,
                  }}
                />

                {isCreatingNote ? (
                  /* Create Note Panel */
                  <form onSubmit={handleCreateNote} className="space-y-4 max-w-md">
                    <div className="flex items-center justify-between border-b border-slate-900/20 pb-3">
                      <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Bookmark className="w-4 h-4 text-emerald-400 animate-pulse" /> Capture Somatic Research Note
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsCreatingNote(false)}
                        className="text-[10px] font-mono text-slate-500 hover:text-slate-400 uppercase"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Note Title</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. BRCA1 Homologous Deficiency evaluation"
                          value={newNoteTitle}
                          onChange={e => setNewNoteTitle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Associated Gene Symbol (Optional)</label>
                        <select
                          value={newNoteAssociatedGene}
                          onChange={e => setNewNoteAssociatedGene(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                        >
                          <option value="">-- None --</option>
                          {Object.keys(GENE_DATABASE).map(symbol => (
                            <option key={symbol} value={symbol}>{symbol}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Research Observations</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Document mutation variances, treatment outcomes, or structural molecular predictions..."
                          value={newNoteContent}
                          onChange={e => setNewNoteContent(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Tags (Comma separated)</label>
                        <input
                          type="text"
                          placeholder="oncology, breast-cancer, trial-3"
                          value={newNoteTags}
                          onChange={e => setNewNoteTags(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
                      >
                        Commit Note to Registry
                      </button>
                    </div>
                  </form>
                ) : isEditingNote ? (
                  /* Edit Note Panel */
                  <form onSubmit={handleUpdateNote} className="space-y-4 max-w-md">
                    <div className="flex items-center justify-between border-b border-slate-900/20 pb-3">
                      <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Edit3 className="w-4 h-4 text-indigo-400 animate-pulse" /> Edit Somatic Research Note
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsEditingNote(false)}
                        className="text-[10px] font-mono text-slate-500 hover:text-slate-400 uppercase"
                      >
                        Cancel
                      </button>
                    </div>

                    <div className="space-y-3.5">
                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Note Title</label>
                        <input
                          type="text"
                          required
                          value={newNoteTitle}
                          onChange={e => setNewNoteTitle(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Associated Gene Symbol (Optional)</label>
                        <select
                          value={newNoteAssociatedGene}
                          onChange={e => setNewNoteAssociatedGene(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                        >
                          <option value="">-- None --</option>
                          {Object.keys(GENE_DATABASE).map(symbol => (
                            <option key={symbol} value={symbol}>{symbol}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Research Observations</label>
                        <textarea
                          required
                          rows={4}
                          value={newNoteContent}
                          onChange={e => setNewNoteContent(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Tags (Comma separated)</label>
                        <input
                          type="text"
                          value={newNoteTags}
                          onChange={e => setNewNoteTags(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition-all shadow-md cursor-pointer"
                      >
                        Save Observations Update
                      </button>
                    </div>
                  </form>
                ) : selectedItem ? (
                  /* Detail display panel based on selection */
                  <div className="space-y-6 animate-fadeIn">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono font-bold tracking-wider px-2 py-0.5 rounded uppercase border ${
                          selectedItem.type === 'gene' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          selectedItem.type === 'pathway' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                          selectedItem.type === 'project' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                          'bg-sky-500/10 text-sky-400 border-sky-500/20'
                        }`}>
                          {selectedItem.type} Details
                        </span>
                        {selectedItem.type === 'note' && (
                          <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {new Date(selectedItem.data.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <h3 className={`text-xl font-bold tracking-tight ${
                        isClinical ? 'text-slate-900' : 'text-white'
                      }`}>
                        {selectedItem.title}
                      </h3>
                      <p className="text-xs font-mono text-indigo-500 font-semibold uppercase">
                        {selectedItem.subtitle}
                      </p>
                    </div>

                    <p className={`text-xs md:text-sm leading-relaxed ${
                      isClinical ? 'text-slate-600' : 'text-slate-400'
                    }`}>
                      {selectedItem.description}
                    </p>

                    {/* Meta specifications blocks */}
                    {selectedItem.type === 'gene' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                          <div className={`p-3 rounded-xl border ${isClinical ? 'bg-slate-100/40 border-slate-200' : 'bg-slate-900/30 backdrop-blur-sm border-slate-800/60'}`}>
                            <span className="text-slate-500 block text-[9px] uppercase">Chromosome</span>
                            <span className={`font-bold ${isClinical ? 'text-slate-800' : 'text-slate-200'}`}>Chr {selectedItem.data.chromosome}</span>
                          </div>
                          <div className={`p-3 rounded-xl border ${isClinical ? 'bg-slate-100/40 border-slate-200' : 'bg-slate-900/30 backdrop-blur-sm border-slate-800/60'}`}>
                            <span className="text-slate-500 block text-[9px] uppercase">Locus Location</span>
                            <span className={`font-bold ${isClinical ? 'text-slate-800' : 'text-slate-200'}`}>{selectedItem.data.position}</span>
                          </div>
                        </div>

                        {selectedItem.data.therapies && (
                          <div className="space-y-2">
                            <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Approved Targeted Binders</span>
                            <div className="flex flex-wrap gap-1.5">
                              {selectedItem.data.therapies.map((t: string) => (
                                <span key={t} className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-full flex items-center gap-1 border ${
                                  isClinical
                                    ? 'bg-slate-100/60 border-slate-200 text-emerald-700'
                                    : 'bg-slate-900/45 border-slate-800/40 text-emerald-400'
                                }`}>
                                  <Sparkles className="w-3 h-3 text-yellow-400" /> {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <button
                          onClick={() => navigateToGene(selectedItem.title)}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Launch in Loci Explorer <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {selectedItem.type === 'pathway' && (
                      <div className="space-y-4">
                        <div className={`p-4 rounded-xl border space-y-2 ${isClinical ? 'bg-slate-100/50 border-slate-200' : 'bg-slate-900 border-slate-850'}`}>
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Interlocked Gene Nodes ({selectedItem.data.genes.length})</span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedItem.data.genes.map((g: string) => (
                              <button
                                key={g}
                                onClick={() => navigateToGene(g)}
                                className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[9px] font-mono text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition rounded"
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={navigateToPathway}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          View Biological Signaling Map <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {selectedItem.type === 'project' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                          <div className={`p-3 rounded-xl border ${isClinical ? 'bg-slate-100/40 border-slate-200' : 'bg-slate-900/30 backdrop-blur-sm border-slate-800/60'}`}>
                            <span className="text-slate-500 block text-[9px] uppercase">Cohort Condition</span>
                            <span className={`font-bold ${isClinical ? 'text-slate-800' : 'text-slate-200'}`}>{selectedItem.data.diseaseType}</span>
                          </div>
                          <div className={`p-3 rounded-xl border ${isClinical ? 'bg-slate-100/40 border-slate-200' : 'bg-slate-900/30 backdrop-blur-sm border-slate-800/60'}`}>
                            <span className="text-slate-500 block text-[9px] uppercase">Created Date</span>
                            <span className={`font-bold ${isClinical ? 'text-slate-800' : 'text-slate-200'}`}>{new Date(selectedItem.data.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={navigateToDashboard}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold font-mono text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Select Project Context <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {selectedItem.type === 'note' && (
                      <div className="space-y-4 pt-4 border-t border-slate-900/30">
                        {selectedItem.data.associatedGene && (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-500 uppercase">Linked Gene:</span>
                            <button
                              onClick={() => navigateToGene(selectedItem.data.associatedGene)}
                              className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono text-[10px] rounded hover:bg-emerald-500/20 transition cursor-pointer"
                            >
                              {selectedItem.data.associatedGene}
                            </button>
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditNote(selectedItem.data)}
                            className={`flex-1 py-2 rounded-lg border font-mono text-xs font-bold uppercase transition flex items-center justify-center gap-1.5 cursor-pointer ${
                              isClinical
                                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                                : 'bg-slate-950 border-slate-900 text-slate-300 hover:bg-slate-900 hover:text-white'
                            }`}
                          >
                            <Edit3 className="w-4 h-4" /> Edit Observations
                          </button>

                          <button
                            onClick={() => handleDeleteNote(selectedItem.data.id)}
                            className="px-3.5 py-2 rounded-lg bg-rose-950/20 border border-rose-900/30 hover:bg-rose-900/40 text-rose-400 transition flex items-center justify-center cursor-pointer"
                            title="Delete note"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                    <Command className="w-12 h-12 text-slate-700 animate-pulse" />
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-mono font-bold uppercase text-slate-400">Genomic Workspace Search</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed max-w-sm font-sans mx-auto">
                        Select a search result on the left to see advanced structural clinical annotations, target therapies, signaling maps, or commit your custom research logs.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer tips */}
            <div className={`p-3 border-t text-[10px] font-mono text-slate-500 uppercase flex items-center justify-between shrink-0 ${
              isClinical ? 'bg-slate-50 border-slate-100' : 'bg-slate-950 border-slate-900'
            }`}>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                <span>INDEX SYNCED: {Object.keys(GENE_DATABASE).length} GENES • {PATHWAY_DATABASE.length} PATHWAYS • {customNotes.length} ACTIVE NOTES</span>
              </div>
              <div className="hidden sm:block">
                Press <span className="text-slate-400 font-bold font-sans">ESC</span> to exit • Use <span className="text-slate-400 font-bold font-sans">⌘K / Ctrl+K</span> to toggle
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  );
}
