# GeneVision AI 🧬✨

**GeneVision AI** is an advanced AI and quantum-enhanced genomic and disease classification platform designed for clinical researchers, biologists, and therapeutic developers. By fusing state-of-the-art multi-omics analysis, sequence engines, and Google Gemini-powered intelligence, the platform accelerates key laboratory pipelines from raw sequence alignment to publication-ready reports.

---

## 🎨 Immersive Design & User Experience
- **Clinical & Dark Research Modes**: A highly responsive, sleek, bento-grid dashboard utilizing either a pristine, distraction-free **Clinical White** palette or a modern, high-contrast **Slate Dark Theme**.
- **Interactive Visualizers**: Leverages dynamic canvas frameworks, `d3` layouts, and responsive `recharts` for molecular tracks, UMAP clustering, and tissue grids.
- **Apple-Inspired Aesthetics**: Smooth, fluid spring physics transitions (powered by `motion`) coupled with precise hover states and rounded containers.

---

## 🚀 Key Genomic & Analytical Features

### 1. 🧬 Multi-Assembly Coordinate Switching
Seamlessly shift genomic coordinate references across standard reference builds:
- **GRCh38 (hg38)** — Modern gold standard clinical assembly.
- **GRCh37 (hg19)** — High-fidelity legacy diagnostics reference.
- **T2T-CHM13 (v2.0)** — Gapless telomere-to-telomere human chromosome reference.

### 2. ⚡ Sequence Alignment & Alignment Tracks
Perform local and global alignments directly within the browser:
- Supports formats: **FASTA**, **FASTQ**, **BAM**, **SAM**, and **CRAM**.
- Dynamic algorithm toggling between **Needleman-Wunsch (Global)** and **Smith-Waterman (Local)** scoring.
- Visual alignment tracks mapping exact matches (`|`), mismatches (`.`), and gap penalties.

### 3. ✂️ CRISPR Design & Base Editing
Streamline gene-editing target selection:
- Target spacer identifier with programmable PAM sites (e.g., SpCas9 `NGG` and `NAG`).
- Computes position coordinates, off-target sequence frequencies, and predicted cutting efficiency.
- Supports prime and base-editing (C→T transition) spacer modeling.

### 4. 🧪 PCR Primer Designer
Instantly generate experimental primers for any template DNA:
- Design forward and reverse primers with real-time **Melting Temperature ($T_m$)** and **GC Content%** checking.
- Built-in warning notifications for self-dimerization risk or hairpin secondary structures.

### 5. 🎨 Motif Discovery & Sequence Logos
Analyze transcription factor (TF) binding affinity:
- Renders conservation Shannon entropy as digital sequence logos.
- Visual height scaling directly indicates bits conservation scores (e.g., AP-1 consensus patterns).

### 6. 📊 Multi-Omics, Epigenetics & Single-Cell Clusters
- **Epigenomics Track Viewer**: Area-chart plotting of ATAC-seq accessibility peaks, histone modifications ($H_3K_4me_3$, $H_3K_{27}me_3$), and DNA methylation densities.
- **scRNA-seq Clustering**: High-dimensional **UMAP** and **t-SNE** scatter plots highlighting immune microenvironments and localized marker genes.
- **Spatial Transcriptomics**: Grid-slide overlays representing tumor-infiltrating densities (EPCAM, CD4, COL1A1) on tissue slices.

### 7. 🏥 Oncology, Survival Cohorts & Clinical Trials
- **Kaplan–Meier Survival Curves**: Multi-cohort log-rank tests computing survival percentages over time.
- **Clinical Risk Modeling**: Calculates Cox proportional hazards ratio ($HR$) and confidence intervals.
- **ClinicalTrials.gov Explorer**: Pulls active trials, drug candidates, and inclusion criteria for target diseases.

### 8. 🛠️ Workflow Pipeline Builder & Automated Reports
- **Pipeline Constructor**: Drag-and-drop workflow steps (Raw Upload → QC → Normalization → Prediction → Explainability → Pathway Analysis → Report).
- **Automated Report Compiler**: Formulates publication-ready scientific summaries, abstracts, results tables, and bibliography indexes.

### 9. ⚛️ Experimental Quantum-Enhanced Simulator
- Sandbox simulating quantum-annealing or variational algorithms for pathway node optimization and high-dimensional feature selection.

---

## 🛠️ Tech Stack

- **Frontend Core:** React 18, TypeScript, Tailwind CSS
- **Interactions & Motion:** `motion/react`, `lucide-react`
- **Charts & Graphics:** `recharts`, SVG-driven coordinate mapping
- **Backend Service:** Node.js, Express (custom Vite middleware integration)
- **AI Brain:** Google Gemini API (`@google/genai` TypeScript SDK)

---

## 📦 How to Run Locally

### Prerequisites
- Node.js (v18.x or higher) installed on your machine.
- NPM or Yarn package manager.

### Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vijaykrishna220077/GeneVision-AI.git
   cd GeneVision-AI
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory of the project:
   ```env
   # .env
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
   *(Note: The server reads `GEMINI_API_KEY` securely on the backend, ensuring key safety and preventing exposure to browser DevTools).*

4. **Launch the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the platform in your browser.

---

## 🌐 Deployment & AI Studio integration
The live version of this full-stack application runs on Cloud Run and integrates seamlessly within the Google AI Studio builder environment.

- **Developer Workspace View:** [GeneVision-AI Project](https://ai.studio/build)

---

*GeneVision AI is created for high-density academic and clinical exploration. Happy analyzing! 🧬🧪*
