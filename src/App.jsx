import React, { useState, useMemo, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { Mail, Phone, Github, Linkedin, Sun, Moon, Menu, X, Code, BrainCircuit, Atom, Waves } from 'lucide-react';

// --- Helper Data ---
const cvData = {
  education: [
    { degree: "BS-MS Dual Degree, Physics Major", institution: "Indian Institute of Science Education and Research (IISER) Bhopal", period: "2020 - 2027 (Expected)", details: "CGPA: 9.5/10 (equivalent to 3.8/4.0)" },
    { degree: "Higher Secondary (XII)", institution: "St. Xavier’s Institution, Panihati", period: "2020", details: "Percentage: 98.75%" },
    { degree: "Secondary (X)", institution: "St. Xavier’s Institution, Panihati", period: "2018", details: "Percentage: 98%" }
  ],
  coursework: [ 'Introduction to Quantum Physics', 'Quantum Mechanics I', 'Advanced Quantum Mechanics', 'Statistical Mechanics', 'Numerical Methods in Programming', 'Wave and Optics', 'Electromagnetism', 'Classical Mechanics', 'General Properties of Matter', 'Physics through Computational Thinking', 'Classical Thermodynamics', 'Basic Electronics', 'Introduction to Programming', 'Linear Algebra', 'Complex Variables', 'Probability and Statistics', 'Multivariable Calculus', 'Groups and Symmetry', 'Real Analysis', 'Mathematical Methods for Physicists', 'Basic Physical Chemistry' ]
};

const blogPosts = [
  { title: "A Review on Topological Magnons and Their Applications", summary: "Topological magnons, the quantized spin waves in magnetic materials, have emerged as a fascinating area of research. This article reviews the fundamental concepts, material realizations, and potential applications in spintronics and quantum information processing.", link: "https://arxiv.org/abs/2108.11476", tags: ["Topological Magnons", "Spintronics", "Review"] },
  { title: "Quantum Spin Liquids: A Review", summary: "Quantum spin liquids are exotic states of matter where magnetic moments are highly entangled and fluctuate down to the lowest temperatures, avoiding conventional magnetic order. This review covers theoretical models, experimental signatures, and the search for candidate materials.", link: "https://www.nature.com/articles/nphys4144", tags: ["Quantum Spin Liquids", "Frustrated Magnetism", "Entanglement"] },
  { title: "Machine Learning for Quantum Matter", summary: "Exploring the intersection of machine learning and condensed matter physics. This article discusses how ML techniques, from neural networks to kernel methods, are being used to classify phases of matter, solve quantum many-body problems, and accelerate materials discovery.", link: "https://arxiv.org/abs/1810.03336", tags: ["Machine Learning", "Quantum Matter", "Computational Physics"] }
];

const galleryItems = [
    { src: "https://placehold.co/600x400/1e293b/94a3b8?text=Topological+Magnon+Bands", caption: "Topologically gapped magnon bands with DMI." },
    { src: "https://placehold.co/600x400/1e293b/94a3b8?text=Spin+Wave+Dispersion", caption: "Dispersion of a 1D Ferromagnetic Spin Wave." },
    { src: "https://placehold.co/600x400/1e293b/94a3b8?text=SSH+Model+Plot", caption: "Dispersion of the SSH Model (Topological Phase)." },
    { src: "https://placehold.co/600x400/1e293b/94a3b8?text=Quantum+Circuit", caption: "Diagram of a Quantum Computing Circuit." },
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


// --- Physics Simulation Components ---

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
    <div className="bg-slate-100 dark:bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
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
        <div className="bg-slate-100 dark:bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
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
    const [D, setD] = useState(0.5); // DMI
    const [B, setB] = useState(0.3); // Magnetic Field

    const dispersionData = useMemo(() => {
        const k_values = Array.from({ length: 201 }, (_, i) => (i - 100) * Math.PI / 100);
        // Energy for 1D model with DMI: E(k) = B + 2J(1-cos(k)) ± 2Dsin(k). Let J=1.
        const J = 1.0;
        const E_plus = k_values.map(k => B + 2 * J * (1 - Math.cos(k)) + 2 * D * Math.sin(k));
        const E_minus = k_values.map(k => B + 2 * J * (1 - Math.cos(k)) - 2 * D * Math.sin(k));
        return [{ x: k_values, y: E_plus, type: 'scatter', mode: 'lines', name: 'Upper Band', line: { color: '#8b5cf6', width: 3 } }, { x: k_values, y: E_minus, type: 'scatter', mode: 'lines', name: 'Lower Band', line: { color: '#db2777', width: 3 } }];
    }, [D, B]);
    
    const isGapped = D > 0;

    return (
        <div className="bg-slate-100 dark:bg-slate-800/50 p-4 sm:p-6 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">3. Topological Magnon Bands</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">A 1D model where Dzyaloshinskii-Moriya Interaction (DMI) `D` breaks inversion symmetry, splitting the magnon bands. An external field `B` sets the baseline energy.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                    <div><label htmlFor="d_slider" className="block text-sm font-medium text-slate-700 dark:text-slate-300">DMI `D`: {D.toFixed(2)}</label><input id="d_slider" type="range" min="0" max="1.5" step="0.05" value={D} onChange={(e) => setD(parseFloat(e.target.value))} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" /></div>
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
        <p className="text-lg text-slate-700 dark:text-slate-300">One of the best ways to build intuition in physics is to see it in action. This section contains interactive simulations of interesting physical models. Play with the parameters and see what happens!</p>
        <div className="space-y-8">
            <SpinWaveSim isDarkMode={isDarkMode} />
            <TopologicalMagnonSim isDarkMode={isDarkMode} />
            <SSHModelSim isDarkMode={isDarkMode} />
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
        <p className="text-lg text-slate-700 dark:text-slate-300 mb-6">A collection of plots, figures, and schematics from my research projects and studies. These are placeholders; feel free to replace them with your own work.</p>
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
