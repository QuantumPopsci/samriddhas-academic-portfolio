import React, { useState, useMemo, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { Mail, Phone, Github, Linkedin, Sun, Moon, Menu, X, Code, BrainCircuit, Atom, Waves } from 'lucide-react';

// --- Helper Data ---
const cvData = {
  education: [
    { degree: "BS-MS Dual Degree, Physics Major", institution: "Indian Institute of Science Education and Research (IISER) Bhopal", period: "2022 - 2027 (Expected)", details: "CGPA: 9.5/10 (equivalent to 3.85/4.0)" },
    { degree: "Higher Secondary (XII)", institution: "St. Xavier’s Institution, Panihati", period: "2022", details: "Percentage: 98.75%" },
    { degree: "Secondary (X)", institution: "St. Xavier’s Institution, Panihati", period: "2020", details: "Percentage: 98%" }
  ],
  coursework: [ 'Introduction to Quantum Physics', 'Quantum Mechanics I', 'Advanced Quantum Mechanics', 'Statistical Mechanics', 'Numerical Methods in Programming', 'Wave and Optics', 'Electromagnetism', 'Classical Mechanics', 'General Properties of Matter', 'Physics through Computational Thinking', 'Classical Thermodynamics', 'Basic Electronics', 'Introduction to Programming', 'Linear Algebra', 'Complex Variables', 'Probability and Statistics', 'Multivariable Calculus', 'Groups and Symmetry', 'Real Analysis', 'Mathematical Methods for Physicists', 'Basic Physical Chemistry' ]
};

const blogPosts = [
  { title: "Nobel Lecture: Topological quantum matter", summary: "The concise review of topological phases of matter with some of the semminal papers referred from the Nobel Lecture by Nobel Prize Winner FDM Haldane", link: "https://doi.org/10.1103/RevModPhys.89.040502", tags: ["Topological Matter", "Quantum Hall Effect", "Chern Insulator"] },
  { title: "Topological Magnons: A Review", summary: "Topological magnons, the quantized spin waves in magnetic materials, have emerged as a fascinating area of research. This article reviews the fundamental concepts, material realizations, and potential applications in spintronics and quantum information processing.", link: "https://doi.org/10.1146/annurev-conmatphys-031620-104715", tags: ["Topological Magnons", "Spintronics", "Review"] },
  { title: "Non-Abelian Anyons and Topological Quantum Computation", summary: "In this review article, the authors describe current research in this field, focusing on the general theoretical concepts of non-Abelian statistics as it relates to topological quantum computation, on understanding non-Abelian quantum Hall states, on proposed experiments to detect non-Abelian anyons, and on proposed architectures for a topological quantum computer. ", link: "https://arxiv.org/abs/0707.1889", tags: ["Non-Abelian Anyons", "Majorana Modes", "Topological Quantum Computing"] },
  { title: "Quantum magnonics: when magnon spintronics meets quantum information science", summary: "Exploring the highly interdisciplinary field of quantum magnonics, which combines spintronics, quantum optics and quantum information, this gives an overview of the recent developments concerning the quantum states of magnons and their hybridization with mature quantum platforms.", link: "https://arxiv.org/abs/2111.14241", tags: ["Magnonics", "Quantum Matter", "Quantum Information"] },
  { title: "Quantum Decoherence", summary: "Exploring the paradigm of Quantum to Classical Transition, this paper is a pedagogical overview of Decoherence in Quantum Systems", link: "https://arxiv.org/abs/1911.06282", tags: ["Quantum Decoherence", "Quantum Master Equations", "Quantum Information"] }
];


const galleryItems = [
    { src: "/magnon-bands.png", caption: "Topologically gapped magnon bands with DMI." },
    { src: "/spin-wave.png", caption: "Dispersion of a 1D Ferromagnetic Spin Wave." },
    { src: "/ssh-model.png", caption: "Dispersion of the SSH Model (Topological Phase)." },
    { src: "/quantum-circuit.jpg", caption: "Diagram of a Quantum Computing Circuit." },
];

// --- Thematic SVG Icons ---
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

// --- Physics Simulation Component ---
const WavePacketSimFinal = ({ isDarkMode }) => {
    // Parameters
    const N = 32; // Grid size. Keep this <= 32 for performance. 50 is too slow for web.
    const timesteps = 50;

    // State for user-controllable parameters
    const [D, setD] = useState(0.2); // DMI
    const [kx0, setKx0] = useState(0.0); // Initial kx
    const [ky0, setKy0] = useState(0.0); // Initial ky
    const [sigma, setSigma] = useState(0.3); // Wavepacket width
    const [timeScale, setTimeScale] = useState(100); // Time evolution speed

    // State for animation
    const [frame, setFrame] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [plotData, setPlotData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const animationFrameRef = React.useRef();

    // --- Core FFT and Complex Number Functions ---
    const complex = (re, im) => ({ re, im });
    const cadd = (a, b) => complex(a.re + b.re, a.im + b.im);
    const csub = (a, b) => complex(a.re - b.re, a.im - b.im);
    const cmul = (a, b) => complex(a.re * b.re - a.im * b.im, a.re * b.im + a.im * b.re);
    const cexp = (c) => {
        const exp_re = Math.exp(c.re);
        return complex(exp_re * Math.cos(c.im), exp_re * Math.sin(c.im));
    };
    const conj = (a) => complex(a.re, -a.im);
    const mag2 = (a) => a.re * a.re + a.im * a.im;

    const fft = (x) => {
        const n = x.length;
        if (n <= 1) return x;
        const even = fft(x.filter((_, i) => i % 2 === 0));
        const odd = fft(x.filter((_, i) => i % 2 === 1));
        const result = new Array(n);
        for (let k = 0; k < n / 2; k++) {
            const t = cmul(cexp(complex(0, -2 * Math.PI * k / n)), odd[k]);
            result[k] = cadd(even[k], t);
            result[k + n / 2] = csub(even[k], t);
        }
        return result;
    };
    
    const ifft = (x) => {
        const n = x.length;
        const x_conj = x.map(c => conj(c));
        const y_conj = fft(x_conj);
        return y_conj.map(c => complex(c.re / n, -c.im / n));
    };

    const ifft2d = (matrix) => {
        const rows = matrix.map(row => ifft(row));
        const transposed = rows[0].map((_, colIndex) => rows.map(row => row[colIndex]));
        const cols_ifft = transposed.map(col => ifft(col));
        const final_transposed = cols_ifft[0].map((_, colIndex) => cols_ifft.map(row => row[colIndex]));
        return final_transposed;
    };
    
    const fftshift2d = (matrix) => {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const halfRows = Math.ceil(rows / 2);
        const halfCols = Math.ceil(cols / 2);
        const shifted = Array.from({ length: rows }, () => new Array(cols));
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                shifted[r][c] = matrix[(r + halfRows) % rows][(c + halfCols) % cols];
            }
        }
        return shifted;
    };


    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            const kx_vals = Array.from({ length: N }, (_, i) => -Math.PI + (2 * Math.PI * i) / N);
            const ky_vals = Array.from({ length: N }, (_, i) => -Math.PI + (2 * Math.PI * i) / N);

            const eigvals = Array.from({ length: N }, () => Array.from({ length: N }, () => [0, 0]));
            const eigvecs_lower_band = Array.from({ length: N }, () => Array.from({ length: N }, () => [complex(0, 0), complex(0, 0)]));
            const delta = [[0.0, 1.0], [-Math.sqrt(3)/2, -0.5], [Math.sqrt(3)/2, -0.5]];

            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    let d12 = complex(0, 0);
                    for (const vec of delta) {
                        const phase = complex(0, kx_vals[i] * vec[0] + ky_vals[j] * vec[1]);
                        const term1 = cmul(complex(-1, 0), cexp(phase));
                        const term2 = cmul(complex(0, D), cexp(phase));
                        d12 = cadd(d12, cadd(term1, term2));
                    }
                    const d_mag = Math.sqrt(mag2(d12));
                    eigvals[i][j] = [-d_mag, d_mag];
                    
                    const v0 = d12;
                    const v1 = complex(d_mag, 0);
                    const norm = Math.sqrt(mag2(v0) + mag2(v1));
                    eigvecs_lower_band[i][j] = [complex(v0.re / norm, v0.im / norm), complex(v1.re / norm, v1.im / norm)];
                }
            }

            const Gk = Array(N).fill(0).map(() => Array(N).fill(0));
            let Gk_norm_sq = 0;
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    const val = Math.exp(-((kx_vals[i] - kx0)**2 + (ky_vals[j] - ky0)**2) / (2 * sigma**2));
                    Gk[i][j] = val;
                    Gk_norm_sq += val**2;
                }
            }
            const Gk_norm = Math.sqrt(Gk_norm_sq);

            const psi_k = Array.from({ length: N }, (_, i) =>
                Array.from({ length: N }, (_, j) => {
                    const g_val = Gk[i][j] / Gk_norm;
                    return eigvecs_lower_band[i][j].map(c => complex(c.re * g_val, c.im * g_val));
                })
            );
            
            const t = frame * timeScale;
            const psi_k_t = Array.from({ length: N }, () => Array.from({ length: N }, () => [complex(0,0), complex(0,0)]));
            for (let i = 0; i < N; i++) {
                for (let j = 0; j < N; j++) {
                    const phase = cexp(complex(0, -eigvals[i][j][0] * t));
                    psi_k_t[i][j][0] = cmul(phase, psi_k[i][j][0]);
                    psi_k_t[i][j][1] = cmul(phase, psi_k[i][j][1]);
                }
            }
            
            const psi_k_t_component0 = psi_k_t.map(row => row.map(spinor => spinor[0]));
            const psi_rt_component0 = ifft2d(psi_k_t_component0);

            const probability_density = fftshift2d(psi_rt_component0.map(row => row.map(c => mag2(c))));
            
            setPlotData(probability_density);
            setIsLoading(false);
        }, 20);

    }, [frame, D, kx0, ky0, sigma, timeScale]);


    useEffect(() => {
        if (isRunning) {
            animationFrameRef.current = requestAnimationFrame(() => {
                setFrame(prev => (prev + 1) % timesteps);
            });
        }
        return () => cancelAnimationFrame(animationFrameRef.current);
    }, [isRunning, frame]);

    const handleStartStop = () => setIsRunning(!isRunning);
    const handleReset = () => {
        setIsRunning(false);
        setFrame(0);
    };

    return (
        <div className="bg-slate-100 dark:bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">2D Wave Packet Evolution on Honeycomb Lattice</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">A direct JavaScript implementation of the Python/SciPy simulation for a magnon wave packet. This is computationally intensive. Grid size is reduced to {N}x{N} for web performance.</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2 bg-white dark:bg-slate-900/50 rounded-lg overflow-hidden min-h-[400px] flex items-center justify-center">
                    {isLoading ? (
                        <div className="text-center">
                            <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <p className="mt-2 text-slate-600 dark:text-slate-300">Calculating...</p>
                        </div>
                    ) : (
                        <Plot
                            data={[{
                                z: plotData,
                                type: 'surface',
                                colorscale: 'Viridis',
                                cmin: 0,
                                cmax: plotData ? Math.max(...plotData.flat()) * 0.8 : 1,
                            }]}
                            layout={{
                                title: `|ψ(r, t)|² at t = ${(frame * timeScale).toFixed(0)}`,
                                autosize: true,
                                paper_bgcolor: 'rgba(0,0,0,0)',
                                scene: {
                                    xaxis: { title: 'x' },
                                    yaxis: { title: 'y' },
                                    zaxis: { title: '|ψ|²' },
                                    camera: { eye: { x: 1.5, y: 1.5, z: 1.5 } }
                                },
                                margin: { l: 0, r: 0, b: 0, t: 40 }
                            }}
                            useResizeHandler={true}
                            style={{ width: '100%', height: '100%' }}
                            config={{ responsive: true }}
                        />
                    )}
                </div>
                <div className="space-y-4">
                    <div><label className="block text-sm font-medium">DMI `D`: {D.toFixed(2)}</label><input type="range" min="0" max="1.0" step="0.05" value={D} onChange={e => { setFrame(0); setD(parseFloat(e.target.value)); }} className="w-full" /></div>
                    <div><label className="block text-sm font-medium">Initial kx₀: {kx0.toFixed(2)}</label><input type="range" min={-Math.PI} max={Math.PI} step="0.1" value={kx0} onChange={e => { setFrame(0); setKx0(parseFloat(e.target.value)); }} className="w-full" /></div>
                    <div><label className="block text-sm font-medium">Initial ky₀: {ky0.toFixed(2)}</label><input type="range" min={-Math.PI} max={Math.PI} step="0.1" value={ky0} onChange={e => { setFrame(0); setKy0(parseFloat(e.target.value)); }} className="w-full" /></div>
                    <div><label className="block text-sm font-medium">Width σ: {sigma.toFixed(2)}</label><input type="range" min="0.1" max="1.0" step="0.05" value={sigma} onChange={e => { setFrame(0); setSigma(parseFloat(e.target.value)); }} className="w-full" /></div>
                    <div><label className="block text-sm font-medium">Time Scale: {timeScale}</label><input type="range" min="10" max="500" step="10" value={timeScale} onChange={e => { setTimeScale(parseFloat(e.target.value)); }} className="w-full" /></div>
                    <div className="flex space-x-2 pt-4">
                        <button onClick={handleStartStop} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg w-full">{isRunning ? 'Pause' : 'Start'}</button>
                        <button onClick={handleReset} className="px-4 py-2 bg-slate-500 text-white font-semibold rounded-lg w-full">Reset</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Page Components ---

const PageWrapper = ({ title, children, showTitle=true }) => (
    <div className="animate-fade-in-up space-y-8">
        {showTitle && <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white border-b-2 border-blue-500 pb-2">{title}</h2>}
        {children}
    </div>
);

const HomePage = () => (
    <PageWrapper title="Home" showTitle={false}>
        <div className="text-center py-12 md:py-20">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Samriddha Ganguly
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-slate-600 dark:text-slate-300">
                A Physics undergraduate at IISER Bhopal exploring the frontiers of theoretical condensed matter, from topological materials to quantum computation.
            </p>
            <div className="mt-8 flex justify-center gap-4">
                <a href="mailto:samriddha22@iiserb.ac.in" className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"><Mail size={20} /></a>
                <a href="https://github.com/SamriddhaGanguly" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"><Github size={20} /></a>
                <a href="https://www.linkedin.com/in/samriddha-ganguly/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"><Linkedin size={20} /></a>
                <a href="tel:+919830606317" className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"><Phone size={20} /></a>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center">
                <div className="w-24 h-24 mx-auto text-blue-500"><Atom className="w-full h-full" strokeWidth={1.5}/></div>
                <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Quantum Materials</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">Investigating exotic electronic and magnetic properties in novel materials.</p>
            </div>
             <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center">
                <div className="w-24 h-24 mx-auto text-emerald-500"><SpinLatticeIcon /></div>
                <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Quantum Magnetism</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">Exploring spin liquids, topological magnons, and frustrated magnetic systems.</p>
            </div>
             <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center">
                <div className="w-24 h-24 mx-auto text-purple-500"><QubitIcon /></div>
                <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Quantum Computation</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">Harnessing quantum phenomena for fault-tolerant information processing.</p>
            </div>
             <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center">
                <div className="w-24 h-24 mx-auto text-rose-500"><BrainCircuit className="w-full h-full" strokeWidth={1.5}/></div>
                <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Computational Physics</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-300">Applying numerical methods and ML to solve complex physical problems.</p>
            </div>
        </div>
    </PageWrapper>
);

const ResearchPage = () => (
    <PageWrapper title="Research Interests">
        <div className="space-y-6 text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
            <p>My research interests are centered at the confluence of condensed matter theory, quantum information, and computational physics. I aim to explore novel quantum phenomena in materials and harness them for future technologies.</p>
            <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-lg"><h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Topological Magnons for Quantum Computing</h3><p>Magnons, the quanta of spin waves, can exhibit non-trivial topological properties. I am interested in how these can be used as robust carriers of quantum information, leading to new platforms for quantum computation that are intrinsically protected from certain types of noise.</p></div>
            <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-lg"><h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Quantum Spin Liquids</h3><p>These are exotic states of matter that defy conventional magnetic ordering even at absolute zero. Their highly entangled nature makes them a prime candidate for realizing topological quantum computation. My interest lies in theoretically modeling these systems and identifying experimental signatures.</p></div>
            <div className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-lg"><h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2">Computational Approaches & Machine Learning</h3><p>I am a firm believer in the power of computation to solve complex physical problems. I am actively developing my skills in numerical methods and applying machine learning to classify quantum phases of matter and accelerate the discovery of new materials.</p></div>
        </div>
    </PageWrapper>
);

const CVPage = () => (
    <PageWrapper title="Curriculum Vitae">
        <div className="space-y-8">
            <div><h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Education</h3><div className="space-y-4">{cvData.education.map((edu, index) => (<div key={index} className="p-4 bg-slate-100 dark:bg-slate-800/50 rounded-lg"><p className="font-bold text-lg text-blue-600 dark:text-blue-400">{edu.degree}</p><p className="text-slate-700 dark:text-slate-300">{edu.institution} ({edu.period})</p><p className="text-sm text-slate-500 dark:text-slate-400">{edu.details}</p></div>))}</div></div>
            <div><h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-4">Relevant Coursework</h3><div className="flex flex-wrap gap-2">{cvData.coursework.map((course, index) => (<span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full dark:bg-blue-900/50 dark:text-blue-200">{course}</span>))}</div></div>
        </div>
    </PageWrapper>
);

const SimulationsPage = ({ isDarkMode }) => (
    <PageWrapper title="Physics is Fun">
        <p className="text-lg text-slate-700 dark:text-slate-300">
            This page features an interactive simulation of a 2D wave packet. It is a direct port of the Python/SciPy code and is computationally intensive. Please be patient during calculations.
        </p>
        <div className="space-y-8">
            <WavePacketSimFinal isDarkMode={isDarkMode} />
        </div>
    </PageWrapper>
);

const BlogPage = () => (
    <PageWrapper title="Blog & Articles">
        <div className="space-y-8">{blogPosts.map((post, index) => (<div key={index} className="p-6 bg-slate-100 dark:bg-slate-800/50 rounded-lg shadow-md transition-transform hover:scale-[1.02]"><h3 className="text-2xl font-bold text-slate-900 dark:text-white">{post.title}</h3><div className="flex flex-wrap gap-2 my-2">{post.tags.map(tag => <span key={tag} className="text-xs font-semibold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-1 rounded-full">{tag}</span>)}</div><p className="text-slate-600 dark:text-slate-300 my-4">{post.summary}</p><a href={post.link} target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-500 hover:text-blue-600 dark:hover:text-blue-400">Read Paper &rarr;</a></div>))}</div>
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
        <div className="p-8 bg-slate-100 dark:bg-slate-800/50 rounded-lg text-center"><h3 className="text-2xl font-bold text-slate-900 dark:text-white">Get In Touch</h3><p className="text-slate-600 dark:text-slate-300 mt-2 mb-6">I'm always open to discussing research, collaborations, or interesting opportunities.</p><div className="flex flex-col sm:flex-row justify-center items-center gap-6"><a href="mailto:samriddha22@iiserb.ac.in" className="flex items-center gap-2 text-lg text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"><Mail /> Email Me</a><a href="https://github.com/SamriddhaGanguly" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-lg text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"><Github /> Follow on GitHub</a><a href="https://www.linkedin.com/in/samriddha-ganguly/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-lg text-blue-500 hover:text-blue-600 dark:hover:text-blue-400"><Linkedin /> Connect on LinkedIn</a></div></div>
    </PageWrapper>
);


// --- Main App Component ---
export default function App() {
  const [page, setPage] = useState('home');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => { document.documentElement.classList.toggle('dark', isDarkMode); }, [isDarkMode]);

  const navLinks = [ { id: 'home', title: 'Home' }, { id: 'research', title: 'Research' }, { id: 'cv', title: 'CV' }, { id: 'simulations', title: 'Simulations' }, { id: 'blog', title: 'Blog' }, { id: 'gallery', title: 'Gallery' }, { id: 'contact', title: 'Contact' } ];

  const renderPage = () => {
    switch (page) {
      case 'home': return <HomePage />;
      case 'research': return <ResearchPage />;
      case 'cv': return <CVPage />;
      case 'simulations': return <SimulationsPage isDarkMode={isDarkMode} />;
      case 'blog': return <BlogPage />;
      case 'gallery': return <GalleryPage />;
      case 'contact': return <ContactPage />;
      default: return <HomePage />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-xl font-bold text-slate-800 dark:text-slate-200"><a href="#" onClick={(e) => { e.preventDefault(); setPage('home'); }}>Samriddha Ganguly</a></div>
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
      <style>{` @keyframes fade-in-up { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } } @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-10px); } 100% { opacity: 1; transform: translateY(0); } } .animate-fade-in-up { animation: fade-in-up 0.5s ease-out forwards; } .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; } `}</style>
    </div>
  );
}
