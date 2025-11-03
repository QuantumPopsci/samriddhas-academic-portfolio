import React, { useState, useMemo, useEffect, useRef } from 'react';
import Plot from 'react-plotly.js';
import { Mail, Phone, Github, Linkedin, Sun, Moon, Menu, X, Code, BrainCircuit, Atom, Waves, ArrowLeft, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
// --- Helper Data ---
const cvData = {
  education: [
    { degree: "BS-MS Dual Degree, Physics Major", institution: "Indian Institute of Science Education and Research (IISER) Bhopal", period: "2022 - 2027 (Expected)", details: "CGPA: 3.8/4.0" },
    { degree: "Higher Secondary (XII)", institution: "St. Xavier’s Institution, Kolkata", period: "2020 - 2022", details: "Percentage: 98.75%" },
    { degree: "Secondary (X)", institution: "St. Xavier’s Institution, Kolkata", period: "2011 - 2020", details: "Percentage: 98%" }
  ],
  coursework: [ 'Introduction to Quantum Physics', 'Quantum Mechanics I', 'Advanced Quantum Mechanics', 'Statistical Mechanics', 'Numerical Methods in Programming', 'Wave and Optics', 'Electromagnetism', 'Classical Mechanics', 'General Properties of Matter', 'Physics through Computational Thinking', 'Classical Thermodynamics', 'Basic Electronics', 'Linear Algebra', 'Complex Variables', 'Probability and Statistics', 'Multivariable Calculus', 'Groups and Symmetry', 'Real Analysis', 'Mathematical Methods for Physicists' ]
};

const blogPosts = [
  { title: "Nobel Lecture: Topological quantum matter", summary: "The concise review of topological phases of matter with some of the semminal papers referred from the Nobel Lecture by Nobel Prize Winner FDM Haldane", link: "https://doi.org/10.1103/RevModPhys.89.040502", tags: ["Topological Matter", "Quantum Hall Effect", "Chern Insulator"] },
  { title: "Topological Magnons: A Review", summary: "Topological magnons, the quantized spin waves in magnetic materials, have emerged as a fascinating area of research. This article reviews the fundamental concepts, material realizations, and potential applications in spintronics and quantum information processing.", link: "https://doi.org/10.1146/annurev-conmatphys-031620-104715", tags: ["Topological Magnons", "Spintronics", "Review"] },
  { title: "Non-Abelian Anyons and Topological Quantum Computation", summary: "In this review article, the authors describe current research in this field, focusing on the general theoretical concepts of non-Abelian statistics as it relates to topological quantum computation, on understanding non-Abelian quantum Hall states, on proposed experiments to detect non-Abelian anyons, and on proposed architectures for a topological quantum computer. ", link: "https://arxiv.org/abs/0707.1889", tags: ["Non-Abelian Anyons", "Majorana Modes", "Topological Quantum Computing"] },
  { title: "Quantum magnonics: when magnon spintronics meets quantum information science", summary: "Exploring the highly interdisciplinary field of quantum magnonics, which combines spintronics, quantum optics and quantum information, this gives an overview of the recent developments concerning the quantum states of magnons and their hybridization with mature quantum platforms.", link: "https://arxiv.org/abs/2111.14241", tags: ["Magnonics", "Quantum Matter", "Quantum Information"] },
  { title: "Quantum Decoherence", summary: "Exploring the paradigm of Quantum to Classical Transition, this paper is a pedagogical overview of Decoherence in Quantum Systems", link: "https://arxiv.org/abs/1911.06282", tags: ["Quantum Decoherence", "Quantum Master Equations", "Quantum Information"] }
];
const notesData = [
    {
        title: "PHY 642: Special Topics in Quantum Mechanics Notes",
        description: "Advanced Quantum Mechanics",
        file: "/notes/PHY_642__Special_Topics_in_Quantum_Mechanics_1.pdf", // Make sure this file exists in /public/notes/
        icon: <Atom className="w-16 h-16" strokeWidth={1.5} />
    },
    {
        title: "PHY 637: Decoherence and Open Quantum Systems Notes",
        description: "Quantum Master Equations and Quantum Optics",
        file: "/notes/PHY_637__Decoherence_and_Open_Quantum_Systems_Notes_1.pdf", // Make sure this file exists in /public/notes/
        icon: <Waves className="w-16 h-16" strokeWidth={1.5} />
    }
];
const galleryItems = [
    { src: "/IISC", caption: "Indian Institute of Science, Bengaluru" },
    { src: "/GROUPS", caption: "Who says Physics people do not do Math?" },
    { src: "/GMRT", caption: "GMRT during RAWS December 2023" },
    { src: "/NCRA", caption: "NCRA-TIFR Main Building, Pune" },
];

const experienceData = [
  {
    title: "Research Intern",
    institution: "Indian Institute of Science Education and Research, Bhopal",
    period: "June 2025 - Oct 2025",
    description: "Studied the classification of topological quantum matter with symmetries under Dr. Nirmal Ganguli. Conducted a theoretical analysis of symmetry-protected topological Dirac nodal line (DNL) magnonic phases in layered honeycomb collinear antiferromagnets, including the effects of Interlayer Spin Canting Interactions. Work accepted for a poster presentation."
  },
  {
    title: "TCS Research and Innovation Fellow",
    institution: "TCS Innovation Labs, IIT Kharagpur Research Park",
    period: "May 2025 - July 2025",
    description: "Worked in the Acoustic and Quantum Sensing Lab on industry-related R&D problems, gaining exposure to optimizing the workings of Mills and Pipelines."
  },
  {
    title: "UC Berkeley REYES Research Fellow",
    institution: "Temple University (Remote)",
    period: "July 2024 - August 2024",
    description: "Worked under Dr. Martha Constantinou on the project 'Internal structure of hadrons from numerical simulations of Quantum Chromodynamics'."
  },
  {
    title: "INSA-IASC-NASI Summer Research Fellow",
    institution: "Indian Institute of Science, Bengaluru",
    period: "May 2024 - July 2024",
    description: "Selected for the prestigious fellowship to work under Dr. Arvind Ayyer. Project focused on the theoretical background of Markov Processes, particularly using MCMC to simulate the 1D Ising Model."
  },
  {
    title: "RAWS Winter Scholar",
    institution: "IUCAA-NCRA TIFR, Pune",
    period: "December 2023",
    description: "Attended the Radio Astronomy Winter School (RAWS) 2023, learning the basics of Radio Astronomy with hands-on experiments using radio observation equipment."
  }
];

const awardsData = [
  { year: "2025", title: "TCS Research and Innovation Fellowship", description: "Received to carry out a research internship at TCS Innovation Labs, IIT Kharagpur Research Park." },
  { year: "2024", title: "INSA-IASC-NASI Summer Research Fellowship", description: "Selected by the Indian Academy of Sciences' prestigious summer research program." },
  { year: "2023", title: "CNR Rao Education Foundation Prize", description: "Awarded by the Hon'ble Director of IISER Bhopal for having the Highest CPI in the First Semester of First Year of degree." },
  { year: "2022", title: "DST INSPIRE FELLOW", description: "Awarded by the Department of Science & Technology, Govt. of India, for being in the top 1% of board rankers." },
  { year: "2022", title: "Academic Excellence in Higher Secondary Examination", description: "Received award from Hon'ble Chief Minister of West Bengal for achieving AIR 5 in HS Examination." },
  { year: "2020", title: "JBNSTS Junior Fellow", description: "Awarded for qualifying the Jagadis Bose National Science Talent Search Examination." }
];
// --- NEW CV SECTIONS DATA ---
const initiativesData = [
  { 
    title: "open_board: An Interdisciplinary Knowledge-Sharing Initiative", 
    role: "Co-Founder & Lead Developer", 
    description: "Conceptualized and developed a peer-to-peer platform for students to present projects and research to a non-specialist, interdisciplinary audience in fun and engaging live sessions." 
  },
  { 
    title: "A Hitchhiker's Guide to Physics @ IISERB", 
    role: "Lead Developer", 
    description: "Built a comprehensive website for the physics department to centralize academic resources, featuring course guides and timetable and a platform for sharing notes and a secure, domain-restricted (@iiserb.ac.in) forum for discussions." 
  }
];
const reportsData = [
  {
    title: "AFM Presentation",
    file: "/AFM PRESENT.pdf",
    description: "Final presentation on Antiferromagnetism and topological transitions.",
  },
  {
    title: "AFM Report (SG)",
    file: "/AFM_REPORT_SG.pdf",
    description: "Comprehensive report detailing theoretical and computational models for AFM systems.",
  },
  {
    title: "Everything Entangled, All At Once",
    file: "/Everything__Entangled__All_At_Once.pdf",
    description: "A deep dive into entanglement phenomena and quantum information theory.",
  },
  {
    title: "Poisson Statistics in Quantum Systems",
    file: "/Poisson.pdf",
    description: "Mathematical analysis and visualization of Poisson-distributed quantum events.",
  },
  {
    title: "Markov Processes in Physics",
    file: "/Markov.pdf",
    description: "Exploring stochastic Markov chains and their applications in physical systems.",
  },
  {
    title: "Topological Dirac Systems",
    file: "/TopoDirac.pdf",
    description: "Presentation on Dirac cones, topology, and symmetry breaking.",
  },
  {
    title: "Quantum Walk Simulations",
    file: "/QuantumWalk.pdf",
    description: "A report on discrete-time quantum walks and topological transport.",
  },
];
const positionsData = [
  { role: "Secretary, Science Council, IISER Bhopal", period: "2024-2025" },
  { role: "Peer Counselor, Counselling Cell, IISER Bhopal", period: "2023-2024" },
  { role: "Departmental Representative, Dept. of Mathematics, IISER Bhopal", period: "2023-2024" },
  { role: "Math Circle Volunteer, Math Circle, IISER Bhopal.", period: "2023-2024" },
  { role: "Student Mentor, Student Development Council, IISER Bhopal", period: "2023-Pres." },
  { role: "Quiz Club Core Committee Member", period: "2023-Pres." },
  { role: "Movie Club Core Committee Member", period: "2023-2024" },
  { role: "Enthuzia '23 (Annual Cultural Fest) Social Media Associate", period: "2023-2024" }
];
// --- Thematic SVG Icons ---

const CooperPairIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" className="stroke-current">
    {/* Electron 1 */}
    <circle cx="30" cy="50" r="12" className="fill-current opacity-70" />
    <text x="30" y="55" textAnchor="middle" stroke="none" className="fill-white font-bold text-lg">e⁻</text>
    
    {/* Electron 2 */}
    <circle cx="70" cy="50" r="12" className="fill-current opacity-70" />
    <text x="70" y="55" textAnchor="middle" stroke="none" className="fill-white font-bold text-lg">e⁻</text>
    
    {/* Wavy line (phonon interaction) */}
    <path d="M 42 50 C 50 35, 60 65, 68 50" strokeWidth="2.5" fill="none" className="opacity-80" />
  </svg>
);

const SpinLatticeIcon = () => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" className="stroke-current">
    <defs><marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="3" markerHeight="3" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" /></marker></defs>
    {[...Array(4)].map((_, i) => [...Array(4)].map((_, j) => (
      <g key={`${i}-${j}`} transform={`translate(${15 + i * 24}, ${15 + j * 24})`}>
        <circle cx="0" cy="0" r="4" className="fill-current opacity-50" />
        <line x1="0" y1="-10" x2="0" y2="10" markerEnd="url(#arrow)" strokeWidth="2" />
      </g>
    )))}
  </svg>
);

const QubitIcon = () => (
    <svg width="100%" height="100%" viewBox="0 0 100 100" className="stroke-current">
        <circle cx="50" cy="50" r="40" strokeWidth="2" fill="none" className="opacity-30" />
        <ellipse cx="50" cy="50" rx="40" ry="15" strokeWidth="1.5" strokeDasharray="4" fill="none" className="opacity-60" />
        <text x="50" y="15" textAnchor="middle" className="fill-current font-sans text-lg">|0⟩</text>
        <text x="50" y="95" textAnchor="middle" className="fill-current font-sans text-lg">|1⟩</text>
        <line x1="50" y1="50" x2="75" y2="30" strokeWidth="2.5" markerEnd="url(#arrow)" />
    </svg>
);

// --- New Design Components ---
const WaveAnimation = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let time = 0;

        const resizeCanvas = () => {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
        };

        const waves = [
            { amp: 25, freq: 0.02, phase: 0, color: "rgba(59, 130, 246, 0.7)" }, // blue-500
            { amp: 30, freq: 0.015, phase: 1.5, color: "rgba(96, 165, 250, 0.7)" }, // blue-400
            { amp: 20, freq: 0.025, phase: 3, color: "rgba(147, 197, 253, 0.7)" } // blue-300
        ];

        let animationFrameId;
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            time += 0.05;

            waves.forEach(wave => {
                ctx.beginPath();
                ctx.strokeStyle = wave.color;
                ctx.lineWidth = 2;
                for (let x = 0; x < canvas.width; x++) {
                    const y = canvas.height / 2 + wave.amp * Math.sin(x * wave.freq + time + wave.phase);
                    ctx.lineTo(x, y);
                }
                ctx.stroke();
            });
            
            animationFrameId = requestAnimationFrame(animate);
        };

        resizeCanvas();
        animate();

        window.addEventListener('resize', resizeCanvas);
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};


const PageHeader = ({ title }) => (
    <div className="relative py-16 sm:py-20 rounded-lg overflow-hidden bg-slate-200/80 dark:bg-slate-800/50 backdrop-blur-sm mb-12">
        <div className="absolute inset-0 -z-10">
            <svg className="absolute top-0 left-0 w-full h-full stroke-slate-300 dark:stroke-slate-700 [mask-image:radial-gradient(100%_100%_at_top_right,white,transparent)]" aria-hidden="true">
                <defs><pattern id="83fd4e5a-9d52-4224-8854-491221ab92a6" width="200" height="200" x="50%" y="-1" patternUnits="userSpaceOnUse"><path d="M100 200V.5M.5 .5H200" fill="none"/></pattern></defs>
                <svg x="50%" y="-1" className="overflow-visible fill-slate-200/20 dark:fill-slate-800/20"><path d="M-100.5 0h201v201h-201Z M699.5 0h201v201h-201Z M499.5 400h201v201h-201Z M-300.5 600h201v201h-201Z" strokeWidth="0"/></svg>
                <rect width="100%" height="100%" strokeWidth="0" fill="url(#83fd4e5a-9d52-4224-8854-491221ab92a6)"/>
            </svg>
        </div>
        <h2 className="text-4xl text-center font-bold tracking-tight text-slate-900 dark:text-white page-title-glow">{title}</h2>
    </div>
);

// --- Physics Simulation Components ---

const WavePacketSimFinal = ({ isDarkMode }) => {
    const N = 32;
    const timesteps = 60;
    const [D, setD] = useState(0.2);
    const [kx0, setKx0] = useState(0.0);
    const [ky0, setKy0] = useState(0.0);
    const [sigma, setSigma] = useState(0.4);
    const [timeScale, setTimeScale] = useState(150);
    const [frameInterval, setFrameInterval] = useState(50);
    const [frame, setFrame] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [simulationFrames, setSimulationFrames] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const animationTimeoutRef = React.useRef();

    const complex = (re, im) => ({ re, im });
    const cadd = (a, b) => complex(a.re + b.re, a.im + b.im);
    const csub = (a, b) => complex(a.re - b.re, a.im - b.im);
    const cmul = (a, b) => complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
    const cexp = (c) => { const exp_re = Math.exp(c.re); return complex(exp_re * Math.cos(c.im), exp_re * Math.sin(c.im)); };
    const conj = (a) => complex(a.re, -a.im);
    const mag2 = (a) => a.re * a.re + a.im * a.im;
    const fft = (x) => { const n = x.length; if (n <= 1) return x; const even = fft(x.filter((_, i) => i % 2 === 0)); const odd = fft(x.filter((_, i) => i % 2 === 1)); const result = new Array(n); for (let k = 0; k < n / 2; k++) { const t = cmul(cexp(complex(0, -2 * Math.PI * k / n)), odd[k]); result[k] = cadd(even[k], t); result[k + n / 2] = csub(even[k], t); } return result; };
    const ifft = (x) => { const n = x.length; const x_conj = x.map(c => conj(c)); const y_conj = fft(x_conj); return y_conj.map(c => complex(c.re / n, -c.im / n)); };
    const ifft2d = (matrix) => { const rows = matrix.map(row => ifft(row)); const transposed = rows[0].map((_, colIndex) => rows.map(row => row[colIndex])); const cols_ifft = transposed.map(col => ifft(col)); const final_transposed = cols_ifft[0].map((_, colIndex) => cols_ifft.map(row => row[colIndex])); return final_transposed; };
    const fftshift2d = (matrix) => { const rows = matrix.length; const cols = matrix[0].length; const halfRows = Math.ceil(rows / 2); const halfCols = Math.ceil(cols / 2); const shifted = Array.from({ length: rows }, () => new Array(cols)); for (let r = 0; r < rows; r++) { for (let c = 0; c < cols; c++) { shifted[r][c] = matrix[(r + halfRows) % rows][(c + halfCols) % cols]; } } return shifted; };

    const runSimulation = () => {
        setIsRunning(false);
        setIsLoading(true);
        setFrame(0);
        setTimeout(() => {
            const kx_vals = Array.from({ length: N }, (_, i) => -Math.PI + (2 * Math.PI * i) / N);
            const ky_vals = Array.from({ length: N }, (_, i) => -Math.PI + (2 * Math.PI * i) / N);
            const eigvals = Array.from({ length: N }, () => Array.from({ length: N }, () => [0, 0]));
            const eigvecs_lower_band = Array.from({ length: N }, () => Array.from({ length: N }, () => [complex(0, 0), complex(0, 0)]));
            const delta = [[0.0, 1.0], [-Math.sqrt(3)/2, -0.5], [Math.sqrt(3)/2, -0.5]];
            for (let i = 0; i < N; i++) { for (let j = 0; j < N; j++) { let d12 = complex(0, 0); for (const vec of delta) { const phase = complex(0, kx_vals[i] * vec[0] + ky_vals[j] * vec[1]); const term1 = cmul(complex(-1, 0), cexp(phase)); const term2 = cmul(complex(0, D), cexp(phase)); d12 = cadd(d12, cadd(term1, term2)); } const d_mag = Math.sqrt(mag2(d12)); eigvals[i][j] = [-d_mag, d_mag]; const v0 = d12; const v1 = complex(d_mag, 0); const norm = Math.sqrt(mag2(v0) + mag2(v1)); eigvecs_lower_band[i][j] = [complex(v0.re / norm, v0.im / norm), complex(v1.re / norm, v1.im / norm)]; } }
            const Gk = Array(N).fill(0).map(() => Array(N).fill(0));
            let Gk_norm_sq = 0;
            for (let i = 0; i < N; i++) { for (let j = 0; j < N; j++) { const val = Math.exp(-((kx_vals[i] - kx0)**2 + (ky_vals[j] - ky0)**2) / (2 * sigma**2)); Gk[i][j] = val; Gk_norm_sq += val**2; } }
            const Gk_norm = Math.sqrt(Gk_norm_sq);
            const psi_k = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => { const g_val = Gk[i][j] / Gk_norm; return eigvecs_lower_band[i][j].map(c => complex(c.re * g_val, c.im * g_val)); }));
            const allFrames = [];
            for (let t_step = 0; t_step < timesteps; t_step++) {
                const t = t_step * timeScale / 10;
                const psi_k_t = Array.from({ length: N }, () => Array.from({ length: N }, () => [complex(0,0), complex(0,0)]));
                for (let i = 0; i < N; i++) { for (let j = 0; j < N; j++) { const phase = cexp(complex(0, -eigvals[i][j][0] * t)); psi_k_t[i][j][0] = cmul(phase, psi_k[i][j][0]); psi_k_t[i][j][1] = cmul(phase, psi_k[i][j][1]); } }
                const psi_k_t_component0 = psi_k_t.map(row => row.map(spinor => spinor[0]));
                const psi_rt_component0 = ifft2d(psi_k_t_component0);
                const probability_density = fftshift2d(psi_rt_component0.map(row => row.map(c => mag2(c))));
                allFrames.push(probability_density);
            }
            setSimulationFrames(allFrames);
            setIsLoading(false);
            setIsReady(true);
            setIsRunning(true);
        }, 50);
    };

    useEffect(() => {
        if (isRunning && isReady) {
            animationTimeoutRef.current = setTimeout(() => {
                setFrame(prev => (prev + 1) % timesteps);
            }, frameInterval);
        }
        return () => clearTimeout(animationTimeoutRef.current);
    }, [isRunning, frame, isReady, frameInterval]);

    const handleStartStop = () => {
        if (isReady) setIsRunning(!isRunning);
    };

    return (
        <div className="simulation-card">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2D Wave Packet Evolution on Honeycomb Lattice</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">A direct JavaScript implementation of the Python/SciPy simulation for a magnon wave packet. Press "Generate & Play" to pre-calculate all frames and start the animation.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2 bg-white dark:bg-slate-900/50 rounded-lg overflow-hidden min-h-[400px] flex items-center justify-center">
                    {isLoading ? ( <div className="text-center"><svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="mt-2 text-slate-600 dark:text-slate-300">Generating Simulation...</p></div>
                    ) : isReady ? ( <Plot data={[{ z: simulationFrames[frame], type: 'surface', colorscale: 'Viridis', cmin: 0, cmax: simulationFrames[0] ? Math.max(...simulationFrames[0].flat()) * 0.8 : 1, }]} layout={{ title: `|ψ(r, t)|² at Frame: ${frame}`, autosize: true, paper_bgcolor: 'rgba(0,0,0,0)', scene: { xaxis: { title: 'x' }, yaxis: { title: 'y' }, zaxis: { title: '|ψ|²' }, camera: { eye: { x: 1.5, y: 1.5, z: 1.5 } } }, margin: { l: 0, r: 0, b: 0, t: 40 } }} useResizeHandler={true} style={{ width: '100%', height: '100%' }} config={{ responsive: true }} />
                    ) : ( <div className="text-center text-slate-500 dark:text-slate-400">Set parameters and click "Generate & Play" to begin.</div> )}
                </div>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium">DMI `D`: {D.toFixed(2)}</label><input type="range" min="0" max="1.0" step="0.05" value={D} onChange={e => setD(parseFloat(e.target.value))} className="w-full" /></div>
                    <div><label className="block text-sm font-medium">Initial kx₀: {kx0.toFixed(2)}</label><input type="range" min={-Math.PI} max={Math.PI} step="0.1" value={kx0} onChange={e => setKx0(parseFloat(e.target.value))} className="w-full" /></div>
                    <div><label className="block text-sm font-medium">Initial ky₀: {ky0.toFixed(2)}</label><input type="range" min={-Math.PI} max={Math.PI} step="0.1" value={ky0} onChange={e => setKy0(parseFloat(e.target.value))} className="w-full" /></div>
                    <div><label className="block text-sm font-medium">Width σ: {sigma.toFixed(2)}</label><input type="range" min="0.1" max="1.0" step="0.05" value={sigma} onChange={e => setSigma(parseFloat(e.target.value))} className="w-full" /></div>
                    <div><label className="block text-sm font-medium">Time Scale: {timeScale}</label><input type="range" min="10" max="500" step="10" value={timeScale} onChange={e => setTimeScale(parseFloat(e.target.value))} className="w-full" /></div>
                    <div><label className="block text-sm font-medium">Animation Speed (ms): {frameInterval}</label><input type="range" min="10" max="200" step="10" value={frameInterval} onChange={e => setFrameInterval(parseInt(e.target.value))} className="w-full" /></div>
                    <div className="flex flex-col space-y-2 pt-4">
                        <button onClick={runSimulation} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg w-full">Generate & Play</button>
                        <button onClick={handleStartStop} disabled={!isReady || isLoading} className="px-4 py-2 bg-slate-500 text-white font-semibold rounded-lg w-full disabled:opacity-50">{isRunning ? 'Pause' : 'Play'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const ChernInsulatorSim = ({ isDarkMode }) => {
    const N = 40;
    const [m, setM] = useState(1.0);

    const bandData = useMemo(() => {
        const k = Array.from({ length: N }, (_, i) => -Math.PI + (2 * Math.PI * i) / (N - 1));
        const upperBand = Array(N).fill(0).map(() => Array(N).fill(0));
        const lowerBand = Array(N).fill(0).map(() => Array(N).fill(0));

        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                const kx = k[i];
                const ky = k[j];
                const dx = Math.sin(kx);
                const dy = Math.sin(ky);
                const dz = m - Math.cos(kx) - Math.cos(ky);
                const d_mag = Math.sqrt(dx*dx + dy*dy + dz*dz);
                upperBand[i][j] = d_mag;
                lowerBand[i][j] = -d_mag;
            }
        }
        return { upperBand, lowerBand, k };
    }, [m]);

    const isTopological = m > 0 && m < 2;
    const bandGap = Math.min(Math.abs(2 * m), Math.abs(2 * (m - 2)));

    return (
        <div className="simulation-card">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">4. 2D Chern Insulator (QWZ Model)</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">This model on a square lattice shows a topological phase transition. The bands touch and the gap closes at `m=0` and `m=2`, separating the trivial and topological (Chern number C=1) phases.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2 bg-white dark:bg-slate-900/50 rounded-lg overflow-hidden min-h-[400px]">
                    <Plot
                        data={[
                            { z: bandData.upperBand, x: bandData.k, y: bandData.k, type: 'surface', colorscale: 'Blues', showscale: false, name: 'Upper Band' },
                            { z: bandData.lowerBand, x: bandData.k, y: bandData.k, type: 'surface', colorscale: 'Reds', showscale: false, name: 'Lower Band' }
                        ]}
                        layout={{
                            title: 'Energy Bands E(k)',
                            autosize: true,
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            scene: {
                                xaxis: { title: 'kx' },
                                yaxis: { title: 'ky' },
                                zaxis: { title: 'Energy E' },
                                camera: { eye: { x: 2, y: 2, z: 1.5 } }
                            },
                            margin: { l: 0, r: 0, b: 0, t: 40 }
                        }}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '100%' }}
                        config={{ responsive: true }}
                    />
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="m_slider" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Mass `m`: {m.toFixed(2)}</label>
                        <input id="m_slider" type="range" min="-1.0" max="3.0" step="0.05" value={m} onChange={(e) => setM(parseFloat(e.target.value))} className="w-full" />
                    </div>
                     <div className={`p-4 rounded-lg transition-colors duration-300 ${isTopological ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'bg-gray-200 dark:bg-gray-900/50'}`}>
                        <h4 className="font-bold text-lg text-slate-800 dark:text-white">System Phase: {isTopological ? 'Topological' : 'Trivial'}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300">{isTopological ? 'Chern Number C = 1' : 'Chern Number C = 0'}</p>
                        <p className="text-sm font-mono mt-2 text-slate-700 dark:text-slate-200">Band Gap: {bandGap.toFixed(3)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MonteCarloPiSim = ({ isDarkMode }) => {
    const [points, setPoints] = useState({ inside: [], outside: [] });
    const [piEstimate, setPiEstimate] = useState(null);
    const pointCount = points.inside.length + points.outside.length;

    const addPoints = (count) => {
        const newInside = [];
        const newOutside = [];
        for (let i = 0; i < count; i++) {
            const x = Math.random();
            const y = Math.random();
            if (x * x + y * y <= 1) {
                newInside.push({ x, y });
            } else {
                newOutside.push({ x, y });
            }
        }
        
        setPoints(prevPoints => {
            const allInside = [...prevPoints.inside, ...newInside];
            const allOutside = [...prevPoints.outside, ...newOutside];
            const totalPoints = allInside.length + allOutside.length;
            if (totalPoints > 0) {
                setPiEstimate(4 * allInside.length / totalPoints);
            }
            return { inside: allInside, outside: allOutside };
        });
    };

    const resetSimulation = () => {
        setPoints({ inside: [], outside: [] });
        setPiEstimate(null);
    };

    useEffect(() => {
        addPoints(100);
    }, []);

    return (
        <div className="simulation-card">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">5. Monte Carlo Approximation of π</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">This simulation estimates π by randomly placing points in a square. The ratio of points inside the inscribed circle to the total points approximates π/4.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2 bg-white dark:bg-slate-900/50 rounded-lg overflow-hidden min-h-[400px]">
                    <Plot
                        data={[
                            { x: points.inside.map(p => p.x), y: points.inside.map(p => p.y), mode: 'markers', type: 'scatter', name: 'Inside', marker: { color: '#3b82f6', size: 5 } },
                            { x: points.outside.map(p => p.x), y: points.outside.map(p => p.y), mode: 'markers', type: 'scatter', name: 'Outside', marker: { color: '#ef4444', size: 5 } }
                        ]}
                        layout={{
                            title: 'Random Points in a 1x1 Square',
                            autosize: true,
                            paper_bgcolor: 'rgba(0,0,0,0)',
                            plot_bgcolor: 'rgba(0,0,0,0)',
                            xaxis: { range: [0, 1], scaleratio: 1, showgrid: false },
                            yaxis: { range: [0, 1], showgrid: false },
                            shapes: [{ type: 'circle', xref: 'x', yref: 'y', x0: 0, y0: 0, x1: 1, y1: 1, line: { color: isDarkMode ? '#cbd5e1' : '#334155' } }],
                            legend: { orientation: 'h', yanchor: 'bottom', y: 1.02, xanchor: 'right', x: 1 },
                            margin: { l: 40, r: 20, b: 40, t: 40 }
                        }}
                        useResizeHandler={true}
                        style={{ width: '100%', height: '100%' }}
                        config={{ responsive: true }}
                    />
                </div>
                <div className="space-y-4">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-center">
                        <h4 className="font-bold text-lg text-slate-800 dark:text-white">π Estimate</h4>
                        <p className="text-3xl font-mono mt-2 text-blue-600 dark:text-blue-300">{piEstimate ? piEstimate.toFixed(6) : 'N/A'}</p>
                    </div>
                     <div className="p-4 bg-slate-200 dark:bg-slate-700 rounded-lg text-center">
                        <h4 className="font-bold text-lg text-slate-800 dark:text-white">Total Points</h4>
                        <p className="text-3xl font-mono mt-2 text-slate-600 dark:text-slate-300">{pointCount}</p>
                    </div>
                    <div className="flex flex-col space-y-2 pt-4">
                        <button onClick={() => addPoints(100)} className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg w-full">Add 100 Points</button>
                        <button onClick={() => addPoints(1000)} className="px-4 py-2 bg-emerald-700 text-white font-semibold rounded-lg w-full">Add 1000 Points</button>
                        <button onClick={resetSimulation} className="px-4 py-2 bg-slate-500 text-white font-semibold rounded-lg w-full">Reset</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const HofstadterButterflySim = ({ isDarkMode }) => {
    const [qMax, setQMax] = useState(25);
    const [plotData, setPlotData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const calculateButterfly = () => {
        setIsLoading(true);
        setTimeout(() => {
            const allPoints = { x: [], y: [] };
            for (let q = 1; q <= qMax; q++) {
                for (let p = 0; p <= q; p++) {
                    const alpha = p / q;
                    for (let j = 0; j < q; j++) {
                        const energy = 2 * Math.cos(2 * Math.PI * (j / q - alpha / 2));
                        allPoints.x.push(alpha);
                        allPoints.y.push(energy);
                    }
                }
            }
            setPlotData([{
                x: allPoints.x,
                y: allPoints.y,
                mode: 'markers',
                type: 'scattergl',
                marker: { color: isDarkMode ? '#60a5fa' : '#2563eb', size: 1.5, opacity: 0.7 }
            }]);
            setIsLoading(false);
        }, 50);
    };
    
    useEffect(() => {
        calculateButterfly();
    }, [qMax]);

    return (
        <div className="simulation-card">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Hofstadter's Butterfly (Integer QHE)</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">The energy spectrum of a 2D electron gas in a magnetic field, as a function of the magnetic flux α = Φ/Φ₀. The fractal, self-similar structure is a hallmark of the Integer Quantum Hall Effect.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2 bg-white dark:bg-slate-900/50 rounded-lg overflow-hidden min-h-[400px] flex items-center justify-center">
                    {isLoading ? (
                        <div className="text-center"><svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><p className="mt-2">Calculating...</p></div>
                    ) : (
                        <Plot
                            data={plotData}
                            layout={{
                                title: 'Energy Spectrum E vs. Magnetic Flux α',
                                autosize: true,
                                paper_bgcolor: 'rgba(0,0,0,0)',
                                plot_bgcolor: 'rgba(0,0,0,0)',
                                xaxis: { title: 'α = p/q', range: [0, 1] },
                                yaxis: { title: 'Energy E', range: [-4.1, 4.1] },
                                margin: { l: 50, r: 20, b: 50, t: 40 }
                            }}
                            useResizeHandler={true}
                            style={{ width: '100%', height: '100%' }}
                            config={{ responsive: true }}
                        />
                    )}
                </div>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="q_slider" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Resolution (Max Denominator q): {qMax}</label>
                        <input id="q_slider" type="range" min="5" max="50" step="1" value={qMax} onChange={(e) => setQMax(parseInt(e.target.value))} className="w-full" />
                    </div>
                    <div className="p-4 bg-slate-200 dark:bg-slate-700 rounded-lg">
                        <h4 className="font-bold text-lg text-slate-800 dark:text-white">About the Plot</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">This is an approximation of the full spectrum. A higher resolution will reveal more of the fractal's detail but requires more computation.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SSHModelSim = ({ isDarkMode }) => {
  const [t1, setT1] = useState(1.0);
  const [t2, setT2] = useState(1.5);
  const dispersionData = useMemo(() => {
    const k_values = Array.from({ length: 201 }, (_, i) => (i - 100) * Math.PI / 100);
    const E_plus = k_values.map(k => Math.sqrt(t1**2 + t2**2 + 2 * t1 * t2 * Math.cos(k)));
    const E_minus = k_values.map(k => -Math.sqrt(t1**2 + t2**2 + 2 * t1 * t2 * Math.cos(k)));
    return [{ x: k_values, y: E_plus, type: 'scatter', mode: 'lines', name: 'Upper Band', line: { color: '#3b82f6', width: 3 } }, { x: k_values, y: E_minus, type: 'scatter', mode: 'lines', name: 'Lower Band', line: { color: '#ef4444', width: 3 } }];
  }, [t1, t2]);
  const isTopological = Math.abs(t2) > Math.abs(t1);
  const bandGap = 2 * Math.abs(t1 - t2);

  return (
    <div className="simulation-card">
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">1. SSH Model (Topological Insulator)</h3>
      <p className="text-slate-600 dark:text-slate-300 mb-6">A 1D toy model for a topological insulator, describing a chain of atoms with alternating hopping amplitudes `t₁` and `t₂`.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div><label htmlFor="t1_slider" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Intracell Hopping `t₁`: {t1.toFixed(2)}</label><input id="t1_slider" type="range" min="0.1" max="2.0" step="0.05" value={t1} onChange={(e) => setT1(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" /></div>
          <div><label htmlFor="t2_slider" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Intercell Hopping `t₂`: {t2.toFixed(2)}</label><input id="t2_slider" type="range" min="0.1" max="2.0" step="0.05" value={t2} onChange={(e) => setT2(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" /></div>
          <div className={`p-4 rounded-lg transition-colors duration-300 ${isTopological ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-red-100 dark:bg-red-900/50'}`}><h4 className="font-bold text-lg text-slate-800 dark:text-white">System Phase: {isTopological ? 'Topological' : 'Trivial'}</h4><p className="text-sm text-slate-600 dark:text-slate-300">{isTopological ? 'Hosts protected edge states.' : 'A simple band insulator.'}</p><p className="text-sm font-mono mt-2 text-slate-700 dark:text-slate-200">Band Gap: {bandGap.toFixed(3)}</p></div>
        </div>
        <div className="bg-white dark:bg-slate-900/50 rounded-lg overflow-hidden min-h-[300px]"><Plot data={dispersionData} layout={{ title: 'Dispersion Relation E(k)', autosize: true, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: isDarkMode ? '#cbd5e1' : '#334155' }, xaxis: { title: 'Momentum k', gridcolor: isDarkMode ? '#334155' : '#e2e8f0' }, yaxis: { title: 'Energy E', gridcolor: isDarkMode ? '#334155' : '#e2e8f0' }, legend: { orientation: 'h', yanchor: 'bottom', y: 1.02, xanchor: 'right', x: 1 } }} useResizeHandler={true} style={{ width: '100%', height: '100%' }} config={{ responsive: true }} /></div>
      </div>
    </div>
  );
};

const SpinWaveSim = ({ isDarkMode }) => {
    const [J, setJ] = useState(1.0);
    const dispersionData = useMemo(() => {
        const k_values = Array.from({ length: 201 }, (_, i) => (i - 100) * Math.PI / 100);
        const omega = k_values.map(k => 2 * J * (1 - Math.cos(k)));
        return [{ x: k_values, y: omega, type: 'scatter', mode: 'lines', name: 'Magnon Energy', line: { color: '#10b981', width: 3 } }];
    }, [J]);

    return (
        <div className="simulation-card">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2. Ferromagnetic Spin Waves (Magnons)</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">The dispersion for magnons in a 1D ferromagnetic chain with exchange coupling `J`. These are the collective excitations of the ordered spin system.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                    <div><label htmlFor="j_slider" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Exchange Coupling `J`: {J.toFixed(2)}</label><input id="j_slider" type="range" min="0.1" max="5.0" step="0.1" value={J} onChange={(e) => setJ(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" /></div>
                    <div className="p-4 rounded-lg bg-emerald-100 dark:bg-emerald-900/50"><h4 className="font-bold text-lg text-slate-800 dark:text-white">Magnon Properties</h4><p className="text-sm text-slate-600 dark:text-slate-300">The bandwidth is `4J`. The dispersion is gapless at `k=0`, a consequence of Goldstone's theorem for broken rotational symmetry.</p></div>
                </div>
                <div className="bg-white dark:bg-slate-900/50 rounded-lg overflow-hidden min-h-[300px]"><Plot data={dispersionData} layout={{ title: 'Spin Wave Dispersion ω(k)', autosize: true, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: isDarkMode ? '#cbd5e1' : '#334155' }, xaxis: { title: 'Momentum k', gridcolor: isDarkMode ? '#334155' : '#e2e8f0' }, yaxis: { title: 'Energy ω', gridcolor: isDarkMode ? '#334155' : '#e2e8f0', range: [0, 4 * 5] }, legend: { orientation: 'h', yanchor: 'bottom', y: 1.02, xanchor: 'right', x: 1 } }} useResizeHandler={true} style={{ width: '100%', height: '100%' }} config={{ responsive: true }} /></div>
            </div>
        </div>
    );
};

const TopologicalMagnonSim = ({ isDarkMode }) => {
    const [D, setD] = useState(0.5);
    const [B, setB] = useState(0.3);

    const dispersionData = useMemo(() => {
        const k_values = Array.from({ length: 201 }, (_, i) => (i - 100) * Math.PI / 100);
        const J = 1.0;
        const E_plus = k_values.map(k => B + 2 * J * (1 - Math.cos(k)) + 2 * D * Math.sin(k));
        const E_minus = k_values.map(k => B + 2 * J * (1 - Math.cos(k)) - 2 * D * Math.sin(k));
        return [{ x: k_values, y: E_plus, type: 'scatter', mode: 'lines', name: 'Upper Band', line: { color: '#8b5cf6', width: 3 } }, { x: k_values, y: E_minus, type: 'scatter', mode: 'lines', name: 'Lower Band', line: { color: '#db2777', width: 3 } }];
    }, [D, B]);
    
    const isGapped = D > 0;

    return (
        <div className="simulation-card">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Topological Magnon Bands</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">A 1D model where Dzyaloshinskii-Moriya Interaction (DMI) `D` breaks inversion symmetry, splitting the magnon bands. An external field `B` sets the baseline energy.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                    <div><label htmlFor="d_slider_topo" className="block text-sm font-medium text-slate-700 dark:text-slate-300">DMI `D`: {D.toFixed(2)}</label><input id="d_slider_topo" type="range" min="0" max="1.5" step="0.05" value={D} onChange={(e) => setD(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" /></div>
                    <div><label htmlFor="b_slider" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Magnetic Field `B`: {B.toFixed(2)}</label><input id="b_slider" type="range" min="0" max="2.0" step="0.05" value={B} onChange={(e) => setB(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" /></div>
                    <div className={`p-4 rounded-lg transition-colors duration-300 ${isGapped ? 'bg-purple-100 dark:bg-purple-900/50' : 'bg-gray-100 dark:bg-gray-900/50'}`}><h4 className="font-bold text-lg text-slate-800 dark:text-white">System State: {isGapped ? 'Topologically Non-Trivial' : 'Trivial (No DMI)'}</h4><p className="text-sm text-slate-600 dark:text-slate-300">{isGapped ? 'Asymmetric bands can lead to thermal Hall effect.' : 'Standard ferromagnetic dispersion.'}</p></div>
                </div>
                <div className="bg-white dark:bg-slate-900/50 rounded-lg overflow-hidden min-h-[300px]"><Plot data={dispersionData} layout={{ title: 'Topological Magnon Bands E(k)', autosize: true, paper_bgcolor: 'rgba(0,0,0,0)', plot_bgcolor: 'rgba(0,0,0,0)', font: { color: isDarkMode ? '#cbd5e1' : '#334155' }, xaxis: { title: 'Momentum k', gridcolor: isDarkMode ? '#334155' : '#e2e8f0' }, yaxis: { title: 'Energy E', gridcolor: isDarkMode ? '#334155' : '#e2e8f0' }, legend: { orientation: 'h', yanchor: 'bottom', y: 1.02, xanchor: 'right', x: 1 } }} useResizeHandler={true} style={{ width: '100%', height: '100%' }} config={{ responsive: true }} /></div>
            </div>
        </div>
    );
};

// --- Page Components ---

const PageWrapper = ({ title, children, showTitle=true }) => (
    <div className="animate-fade-in-up space-y-8">
        {showTitle && <PageHeader title={title} />}
        {children}
    </div>
);

const HomePage = () => (
    <PageWrapper title="Home" showTitle={false}>
        <div className="relative text-center py-12 md:py-20 z-10 overflow-hidden rounded-lg">
            <div className="absolute inset-0 -z-10"><WaveAnimation /></div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Samriddha's Academic Portfolio
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-slate-600 dark:text-slate-300">
                A fourth-year Physics undergrad at IISER Bhopal. My research interests lie in theoretical condensed matter, particularly in altermagnetic systems, exotic superconductivity, and engineering topological phases for quantum information.
            </p>
            <div className="mt-8 flex justify-center gap-4">
                <a href="mailto:samriddha22@iiserb.ac.in" className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"><Mail size={20} /></a>
                <a href="https://github.com/QuantumPopsci" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"><Github size={20} /></a>
                <a href="https://www.linkedin.com/in/samriddha-ganguly-3360bb16a/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"><Linkedin size={20} /></a>
                <a href="tel:+919830606317" className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"><Phone size={20} /></a>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <a href="https://www.nature.com/articles/nature23268" target="_blank" rel="noopener noreferrer" className="interest-card">
                <div className="w-24 h-24 mx-auto text-blue-500"><Atom className="w-full h-full" strokeWidth={1.5}/></div>
                <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Topological Quantum Matter</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">Investigating electronic and magnetic properties in Topological materials.</p>
            </a>
             <a href="https://journals.aps.org/rmp/abstract/10.1103/RevModPhys.88.041002" target="_blank" rel="noopener noreferrer" className="interest-card">
                <div className="w-24 h-24 mx-auto text-emerald-500"><SpinLatticeIcon /></div>
                <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Quantum Magnetism</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">Exploring spin liquids, topological magnons, and frustrated magnetic systems.</p>
            </a>
             <a href="https://journals.aps.org/rmp/abstract/10.1103/RevModPhys.83.1057" target="_blank" rel="noopener noreferrer" className="interest-card">
                <div className="w-24 h-24 mx-auto text-purple-500"><CooperPairIcon /></div>
                <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Exotic Superconductivity</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">Exploring the field of Topological Superconductors and the newly theorized interplay of Altermagnetism and Superconductivity</p>
            </a>
             <a href="http://www-personal.umich.edu/~mejn/cp/" target="_blank" rel="noopener noreferrer" className="interest-card">
                <div className="w-24 h-24 mx-auto text-rose-500"><BrainCircuit className="w-full h-full" strokeWidth={1.5}/></div>
                <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Computational Physics</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">Applying numerical methods and ML to solve complex physical problems.</p>
            </a>
        </div>
    </PageWrapper>
);

const ResearchPage = () => (
    <PageWrapper title="Research Interests">
        <div className="space-y-6 text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
            <p>My research interests are centered at the confluence of condensed matter theory, quantum information, and computational physics. I aim to explore novel quantum phenomena in materials and harness them for future technologies.</p>
            <div className="content-card"><h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Altermagnetism and Exotic Superconductivity</h3><p>Altermagnets are a newly discovered magnetic class, distinct from ferromagnets and antiferromagnets, that exhibit strong spin-splitting in their band structure without a net external magnetization. I am fascinated by the interplay between this intrinsic spin-momentum coupling and superconductivity. This combination is a promising route to engineer novel topological superconducting phases, such as those hosting Majorana zero modes, which are key building blocks for fault-tolerant quantum computers.</p></div> 
            <div className="content-card"><h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Quantum Spin Liquids</h3><p>These are exotic states of matter that defy conventional magnetic ordering even at absolute zero. Their highly entangled nature makes them a prime candidate for realizing topological quantum computation. My interest lies in theoretically modeling these systems and identifying experimental signatures.</p></div>
            <div className="content-card"><h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Computational Approaches & Machine Learning</h3><p>I am a firm believer in the power of computation to solve complex physical problems. I am actively developing my skills in numerical methods and applying machine learning to classify quantum phases of matter and accelerate the discovery of new materials.</p></div>
        </div>  
    </PageWrapper>
);

const CVPage = () => (
  <PageWrapper title="Curriculum Vitae">
    {/* --- Download Button --- */}
    <div className="flex justify-center mb-10">
      <a
        href="/Samriddha_Ganguly_CV.pdf"
        download="Samriddha_Ganguly_CV.pdf"
        className="inline-flex items-center gap-3 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 transform hover:-translate-y-0.5"
      >
        <Download size={20} />
        Click for Detailed CV
      </a>
    </div>

    <div className="space-y-16">
      {/* --- Education Section --- */}
      <div>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          Education
        </h3>
        <div className="space-y-4">
          {cvData.education.map((edu, index) => (
            <div key={index} className="content-card">
              <p className="font-bold text-lg text-blue-600 dark:text-blue-400">
                {edu.degree}
              </p>
              <p className="text-slate-700 dark:text-slate-300">
                {edu.institution} ({edu.period})
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {edu.details}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* --- Research Experience Section --- */}
      <div>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          Research Experience
        </h3>
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-slate-200 before:dark:bg-slate-700">
          {experienceData.map((exp, index) => (
            <div key={index} className="relative pl-12">
              <div className="absolute left-0 top-1 w-5 h-5 bg-blue-500 rounded-full border-4 border-white dark:border-slate-900"></div>
              <p className="font-semibold text-xl text-blue-600 dark:text-blue-400">
                {exp.title}
              </p>
              <p className="text-md text-slate-700 dark:text-slate-300">
                {exp.institution}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                {exp.period}
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {exp.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* --- Awards & Honours Section --- */}
      <div>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          Awards & Honours
        </h3>
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-slate-200 before:dark:bg-slate-700">
          {awardsData.map((award, index) => (
            <div key={index} className="relative pl-12">
              <div className="absolute left-0 top-1 w-5 h-5 bg-emerald-500 rounded-full border-4 border-white dark:border-slate-900"></div>
              <p className="font-semibold text-xl text-emerald-600 dark:text-emerald-400">
                {award.title}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                {award.year}
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {award.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* --- Relevant Coursework Section --- */}
      <div>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          Relevant Coursework
        </h3>
        <div className="flex flex-wrap gap-2">
          {cvData.coursework.map((course, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-blue-900/50 dark:text-blue-200"
            >
              {course}
            </span>
          ))}
        </div>
      </div>

      {/* --- Initiatives & Projects Section --- */}
      <div>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          Initiatives & Projects
        </h3>
        <div className="space-y-6">
          {initiativesData.map((init, index) => (
            <div
              key={index}
              className="p-5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm"
            >
              <p className="font-semibold text-xl text-blue-600 dark:text-blue-400">
                {init.title}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                {init.role}
              </p>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                {init.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* --- Positions of Responsibility Section --- */}
      <div>
        <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">
          Positions of Responsibility
        </h3>
        <div className="space-y-4">
          {positionsData.map((pos, index) => (
            <div
              key={index}
              className="flex justify-between items-center p-4 border border-slate-200 dark:border-slate-700 rounded-md bg-slate-50 dark:bg-slate-800/50"
            >
              <p className="font-medium text-slate-800 dark:text-slate-200">
                {pos.role}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {pos.period}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </PageWrapper>
);


const SimulationsPage = ({ isDarkMode }) => (
    <PageWrapper title="Physics is Fun">
        <p className="text-lg text-slate-700 dark:text-slate-300">
            This page features interactive simulations of interesting physical models. Please be patient during calculations.
        </p>
        <div className="space-y-8">
            <WavePacketSimFinal isDarkMode={isDarkMode} />
            <ChernInsulatorSim isDarkMode={isDarkMode} />
            <TopologicalMagnonSim isDarkMode={isDarkMode} />
            <SpinWaveSim isDarkMode={isDarkMode} />
            <SSHModelSim isDarkMode={isDarkMode} />
            <MonteCarloPiSim isDarkMode={isDarkMode} />
            <HofstadterButterflySim isDarkMode={isDarkMode} />
        </div>
    </PageWrapper>
);

const BlogPage = () => (
    <PageWrapper title="Papers & Articles">
        <div className="space-y-8">{blogPosts.map((post, index) => (<a href={post.link} target="_blank" rel="noopener noreferrer" key={index} className="block content-card"><h3 className="text-2xl font-bold text-slate-900 dark:text-white">{post.title}</h3><div className="flex flex-wrap gap-2 my-2">{post.tags.map(tag => <span key={tag} className="text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">{tag}</span>)}</div><p className="text-slate-600 dark:text-slate-300 my-4">{post.summary}</p><div className="font-semibold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400">Read Paper &rarr;</div></a>))}</div>
    </PageWrapper>
);

const GalleryPage = () => (
    <PageWrapper title="Gallery">
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">A collection of plots, figures, and non-academic photos from my research projects, studies and Academic Visits.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">{galleryItems.map((item, index) => (<div key={index} className="group relative overflow-hidden rounded-lg shadow-lg"><img src={item.src} alt={item.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" /><div className="absolute inset-0 bg-black/50 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"><p className="text-white font-semibold">{item.caption}</p></div></div>))}</div>
    </PageWrapper>
);

const ContactPage = () => (
    <PageWrapper title="Contact">
        <div className="content-card text-center"><h3 className="text-2xl font-bold text-slate-900 dark:text-white">Get In Touch</h3><p className="text-slate-600 dark:text-slate-300 mt-2 mb-6">I'm always open to discussing research, collaborations, or interesting opportunities.</p><div className="flex flex-col sm:flex-row justify-center items-center gap-6"><a href="mailto:samriddha22@iiserb.ac.in" className="flex items-center gap-2 text-lg text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"><Mail /> Email Me</a><a href="https://github.com/QuantumPopsci" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-lg text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"><Github /> Follow on GitHub</a><a href="https://www.linkedin.com/in/samriddha-ganguly-3360bb16a/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-lg text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"><Linkedin /> Connect on LinkedIn</a></div></div>
    </PageWrapper>
);
const PDFModalViewer = ({ file, title, onClose }) => {
  const [numPages, setNumPages] = useState(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="relative bg-slate-900 rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 rounded-full p-2 text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold text-center text-white py-4 border-b border-slate-700">
          {title}
        </h2>

        <div className="h-[80vh] overflow-y-auto flex justify-center bg-slate-800 p-4">
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<div className="text-white text-center p-10">Loading PDF...</div>}
          >
            {Array.from(new Array(numPages || 0), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                className="mb-4 shadow-lg"
              />
            ))}
          </Document>
        </div>
      </div>
    </div>
  );
};

// --- Main Reports Page ---
const ReportsPage = () => {
  const [selectedReport, setSelectedReport] = useState(null);

  if (selectedReport) {
    return (
      <PDFModalViewer
        file={selectedReport.file}
        title={selectedReport.title}
        onClose={() => setSelectedReport(null)}
      />
    );
  }

  return (
    <PageWrapper title="Reports & Presentations">
      <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">
        A curated selection of my academic reports and research presentations, combining theoretical
        insights and computational explorations.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {reportsData.map((report, index) => (
          <button
            key={index}
            onClick={() => setSelectedReport(report)}
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl bg-gradient-to-br from-blue-50 via-white to-slate-100 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>

            <div className="p-6 relative z-20">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {report.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3">
                {report.description}
              </p>
              <div className="mt-4 font-semibold text-blue-600 dark:text-blue-400 group-hover:underline">
                View Report →
              </div>
            </div>

            {/* Decorative Corner Ribbon */}
            <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg">
              PDF
            </div>
          </button>
        ))}
      </div>
    </PageWrapper>
  );
};
// --- Main App Component ---
export default function App() {
  const [page, setPage] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => { document.documentElement.classList.toggle('dark', isDarkMode); }, [isDarkMode]);

  // In the App component, find navLinks and replace it with this:
const navLinks = [ { id: 'home', title: 'Home' }, { id: 'research', title: 'Research' }, { id: 'cv', title: 'CV' }, { id: 'simulations', title: 'Simulations' }, { id: 'blog', title: 'Resources' }, { id: 'reports', title: 'Reports' }, { id: 'gallery', title: 'Gallery' }, { id: 'contact', title: 'Contact' } ];
  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage />;
      case 'research': return <ResearchPage />;
      case 'cv': return <CVPage />;
      case 'simulations': return <SimulationsPage isDarkMode={isDarkMode} />;
      case 'blog': return <BlogPage />;
      case 'reports': return <ReportsPage />;
      case 'gallery': return <GalleryPage />;
      case 'contact': return <ContactPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      <div className="relative z-10">
        <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-md">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="text-xl font-bold text-slate-800 dark:text-slate-200"><a href="#" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Samriddha's Academic Portfolio</a></div>
              <nav className="hidden md:flex items-center space-x-1">
                {navLinks.map(link => (<a key={link.id} href={`#${link.id}`} onClick={(e) => { e.preventDefault(); setPage(link.id); }} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${ page === link.id ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800' }`}>{link.title}</a>))}
                <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
              </nav>
              <div className="md:hidden flex items-center">
                  <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 mr-2">{isDarkMode ? <Sun size={20} /> : <Moon size={20} />}</button>
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">{isMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
              </div>
            </div>
          </div>
          {isMenuOpen && (<div className="md:hidden animate-fade-in-down"><nav className="px-2 pt-2 pb-3 space-y-1 sm:px-3">{navLinks.map(link => (<a key={link.id} href={`#${link.id}`} onClick={(e) => { e.preventDefault(); setPage(link.id); setIsMenuOpen(false); }} className={`block px-3 py-2 rounded-md text-base font-medium ${ page === link.id ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-white' : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800' }`}>{link.title}</a>))}</nav></div>)}
        </header>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">{renderPage()}</main>
        <footer className="bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 mt-12"><div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-slate-500 dark:text-slate-400"><p>&copy; {new Date().getFullYear()} Samriddha Ganguly. All rights reserved.</p><p className="text-sm mt-1">Built with React, Tailwind CSS, and Plotly.js.</p></div></footer>
      </div>
      <style>{`
        .interest-card, .content-card, .simulation-card {
            background-color: rgba(241, 245, 249, 0.8);
            border-radius: 0.75rem;
            padding: 1.5rem;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border: 1px solid rgba(226, 232, 240, 1);
            backdrop-filter: blur(4px);
        }
        .dark .interest-card, .dark .content-card, .dark .simulation-card {
            background-color: rgba(30, 41, 59, 0.5);
            border-color: rgba(51, 65, 85, 1);
        }
        .interest-card:hover, .content-card:hover, .simulation-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
            border-color: rgba(59, 130, 246, 0.5);
        }
        .dark .interest-card:hover, .dark .content-card:hover, .dark .simulation-card:hover {
             box-shadow: 0 0 25px rgba(59, 130, 246, 0.2);
        }
        .page-title-glow {
             text-shadow: 0 0 8px rgba(59, 130, 246, 0.5);
        }
        /* Add this inside your existing <style> tag at the end of the file */
 `}</style>
    </div>
  );
}
