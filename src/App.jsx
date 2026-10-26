import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { Analytics } from '@vercel/analytics/react';

// Register GSAP Plugins
gsap.registerPlugin(ScrollTrigger);

// Helper to check for reduced motion
const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Opening Preloader Component (Replicating the exact entrance experience)
function Preloader({ onDone }) {
  const containerRef = useRef(null);
  const counterRef = useRef(null);
  const progressRef = useRef(null);
  const [isFinished, setIsFinished] = useState(false);

  // Lock body scroll when preloader is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) {
      document.body.style.overflow = '';
      setIsFinished(true);
      onDone();
      return;
    }

    const ctx = gsap.context(() => {
      const counterObj = { v: 0 };
      const tl = gsap.timeline({
        onComplete: () => {
          document.body.style.overflow = '';
          setIsFinished(true);
          onDone();
        }
      });

      // Animate pre-loader lines in
      tl.to(".pre-line", {
        opacity: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: 'power3.out'
      })
      // Animate progress percentage value
      .to(counterObj, {
        v: 100,
        duration: 1.6,
        ease: "power2.inOut",
        onUpdate: () => {
          if (counterRef.current) {
            counterRef.current.textContent = String(Math.round(counterObj.v)).padStart(3, "0");
          }
        }
      }, 0.2)
      // Animate progress line scale
      .to(progressRef.current, {
        scaleX: 1,
        duration: 1.6,
        ease: "power2.inOut"
      }, 0.2)
      // Animate elements out
      .to(".pre-line", {
        opacity: 0,
        y: -14,
        duration: 0.5,
        stagger: 0.05,
        ease: "power2.in"
      }, "+=0.15")
      // Slide up the black background slats
      .to(".pre-slat", {
        yPercent: -101,
        duration: 1.05,
        stagger: 0.07,
        ease: 'power4.inOut'
      }, "-=0.2");

    }, containerRef);

    return () => ctx.revert();
  }, [onDone]);

  if (isFinished) return null;

  return (
    <div ref={containerRef} className="fixed inset-0 z-[9999] pointer-events-none">
      {/* 5 Vertical Black slats sliding up */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="pre-slat flex-1 h-full bg-[#141414]"></div>
        ))}
      </div>
      
      {/* Loader UI */}
      <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10 text-[#f2efe9] pointer-events-auto">
        
        {/* Header line */}
        <div className="flex justify-between items-start">
          <div className="pre-line opacity-0 translate-y-3">
            <div className="label-sm opacity-60">Shaik Asif</div>
            <div className="label-sm opacity-60 mt-1">Portfolio / 2026</div>
          </div>
          <div className="pre-line opacity-0 translate-y-3 label-sm opacity-60">
            Booting System
          </div>
        </div>

        {/* Footer progress & counter */}
        <div className="pre-line opacity-0 translate-y-3">
          <div className="flex items-end justify-between gap-6">
            <div className="display text-[18vw] md:text-[13vw] leading-[0.8] font-serif">
              <span ref={counterRef}>000</span>
            </div>
            <div className="label-sm opacity-60 pb-4 hidden sm:block">
              AI & Data Science / Learning Journey
            </div>
          </div>
          
          {/* Progress bar line */}
          <div className="h-px w-full bg-white/20 mt-6 overflow-hidden">
            <div ref={progressRef} className="h-full w-full bg-[#e8552c] origin-left scale-x-0"></div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Stat Counter Component (Animates numbers on scroll)
function StatCounter({ value, suffix = "", active }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    if (!el) return;

    if (prefersReducedMotion()) {
      el.textContent = `${value}${suffix}`;
      return;
    }

    const obj = { val: 0 };
    const ctx = gsap.context(() => {
      gsap.to(obj, {
        val: value,
        duration: 1.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true,
        },
        onUpdate: () => {
          el.textContent = `${Math.round(obj.val)}${suffix}`;
        }
      });
    }, el);

    return () => ctx.revert();
  }, [value, suffix, active]);

  return <span ref={ref}>0{suffix}</span>;
}

// Section Header with scroll trigger animation
function SectionHeader({ num, kicker, title, intro, active }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!active || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.gsap-reveal',
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            toggleActions: 'play none none none',
            once: true,
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, [active]);

  return (
    <div ref={sectionRef} className="border-b border-[var(--border-subtle)] pb-8 md:pb-12">
      <div className="flex items-center gap-3 gsap-reveal opacity-0">
        <span className="label-sm text-[#e8552c]">{num}</span>
        <span className="h-px w-12 bg-[var(--border-strong)]"></span>
        <span className="label-sm text-[var(--color-ink-subtle)]">{kicker}</span>
      </div>
      <h2 className="display text-6xl md:text-8xl text-[var(--color-ink)] mt-4 gsap-reveal opacity-0">
        {title}
      </h2>
      {intro && (
        <p className="text-[13px] md:text-sm text-[var(--color-ink-subtle)] max-w-xl mt-4 leading-relaxed gsap-reveal opacity-0">
          {intro}
        </p>
      )}
    </div>
  );
}

// Infinite Marquee / Ticker Component
function Marquee({ items, speed = 60, className = '' }) {
  const trackRef = useRef(null);

  useEffect(() => {
    const el = trackRef.current;
    if (!el || prefersReducedMotion()) return;

    const totalWidth = el.scrollWidth / 2;
    if (!totalWidth) return;

    const wrap = gsap.utils.wrap(-totalWidth, 0);
    let direction = -1;

    const tween = gsap.to(el, {
      x: `-=${totalWidth}`,
      duration: totalWidth / speed,
      ease: 'none',
      repeat: -1,
      modifiers: {
        x: (x) => `${wrap(parseFloat(x))}px`,
      },
    });

    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      const newDir = currentY > lastScrollY ? -1 : 1;
      if (newDir !== direction) {
        direction = newDir;
        tween.timeScale(direction === -1 ? 1 : -1);
      }
      lastScrollY = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      tween.kill();
    };
  }, [speed]);

  const doubled = [...items, ...items];

  return (
    <div className={`overflow-hidden select-none ${className}`} aria-hidden="true">
      <div ref={trackRef} className="flex whitespace-nowrap will-change-transform">
        {doubled.map((item, idx) => (
          <span key={idx} className="flex items-center shrink-0">
            <span className="display text-[7vw] md:text-[4.5vw] leading-none px-6 text-[var(--color-ink)]">
              {item}
            </span>
            <span className="w-[7px] h-[7px] bg-[#e8552c] shrink-0"></span>
          </span>
        ))}
      </div>
    </div>
  );
}

// === Interactive AI Terminal Window ===
const BOOT_LINES = [
  { text: 'Asif Terminal v1.0.0  (Python 3.12)', color: '#f2efe960' },
  { text: 'Type help() for commands, clear to reset.', color: '#f2efe960' },
  { text: '', color: '' },
];

const TECH_QUOTES = [
  '"We can only see a short distance ahead, but we can see plenty there that needs to be done." — Alan Turing',
  '"The best way to understand a model is to build it from scratch." — Andrej Karpathy',
  '"Simplicity is prerequisite for reliability." — Edsger W. Dijkstra',
  '"What I cannot create, I do not understand." — Richard Feynman',
  '"Data is the new soil; intelligence is what grows from it."',
  '"Stay curious, stay disciplined, and keep building." — Shaik Asif',
];

const CMD_RESPONSES = {
  'help()': [
    { text: 'Built-in & Secret commands:', color: '#f2efe9' },
    { text: '  whoami          → about me', color: '#b4c7b4' },
    { text: '  ls              → list project files', color: '#b4c7b4' },
    { text: '  skills()        → my technical stack', color: '#b4c7b4' },
    { text: '  contact         → view direct contact channels', color: '#b4c7b4' },
    { text: '  quote           → random AI / CS quote 💡', color: '#e8552c' },
    { text: '  matrix          → digital rain simulation 🟢', color: '#e8552c' },
    { text: '  theme           → toggle Paper / Obsidian mode 🌓', color: '#e8552c' },
    { text: '  sudo hire       → initiate hire sequence 🎉', color: '#e8552c' },
    { text: '  clear           → reset terminal window', color: '#b4c7b4' },
    { text: '', color: '' },
    { text: 'Also try: print("hi"), import numpy, 2**10', color: '#f2efe960' },
  ],
  'help': [
    { text: 'Type help() for the full command list.', color: '#b4c7b4' },
  ],
  'whoami': [
    { text: 'Shaik Asif', color: '#e8552c' },
    { text: 'CSE (AI & Data Science) — Mohan Babu University', color: '#f2efe9' },
    { text: 'Focused on Python · Machine Learning · Generative AI · Web Systems', color: '#b4c7b4' },
  ],
  'ls': [
    { text: 'train_model.py    llm_app.py    web_scraper.py', color: '#b4c7b4' },
    { text: 'dataset.csv       model.pkl     requirements.txt', color: '#b4c7b4' },
    { text: 'portfolio/        README.md', color: '#b4c7b4' },
  ],
  'contact': [
    { text: 'Email     → asifshaika9032@gmail.com', color: '#e8552c' },
    { text: 'GitHub    → https://github.com/asifshaik-git', color: '#b4c7b4' },
    { text: 'LinkedIn  → https://www.linkedin.com/in/shaikasif-ai/', color: '#b4c7b4' },
    { text: 'Location  → Tirupati, India', color: '#b4c7b4' },
  ],
  'skills()': [
    { text: 'Languages  → Python, JavaScript, HTML/CSS', color: '#b4c7b4' },
    { text: 'Exploring  → Generative AI, AI Engineering, ML, LLMs', color: '#b4c7b4' },
    { text: 'Web Dev    → React, Firebase, REST APIs', color: '#b4c7b4' },
    { text: 'Tools      → Git, GitHub, VS Code, Bash (Basic)', color: '#b4c7b4' },
  ],
  'sudo hire': [
    { text: '[ACCESS GRANTED] 🎉', color: '#28ca41' },
    { text: 'Initiating offer sequence for Shaik Asif...', color: '#f2efe9' },
    { text: 'Status: Open for AI engineering, internships & collaborative roles!', color: '#b4c7b4' },
    { text: 'Direct Email: asifshaika9032@gmail.com', color: '#e8552c' },
  ],
  'hire': [
    { text: 'Try: sudo hire 😉', color: '#e8552c' },
  ],
  '2**10': [{ text: '1024', color: '#e8552c' }],
  '2+2':   [{ text: '4',    color: '#e8552c' }],
  '1+1':   [{ text: '2',    color: '#e8552c' }],
  'import numpy': [
    { text: 'NumPy 2.0.1 loaded successfully ✓', color: '#b4c7b4' },
  ],
  'import tensorflow': [
    { text: 'TensorFlow 2.16.0 — GPU detected: None', color: '#b4c7b4' },
    { text: 'Loaded successfully ✓', color: '#b4c7b4' },
  ],
  'import pandas': [
    { text: 'pandas 2.2.0 loaded successfully ✓', color: '#b4c7b4' },
  ],
  'import torch': [
    { text: 'PyTorch 2.3.0 loaded successfully ✓', color: '#b4c7b4' },
  ],
};

function evalTerminalCmd(raw, onToggleTheme, isDark) {
  const cmd = raw.trim();
  if (!cmd) return [];

  // Theme switch easter egg
  if (cmd === 'theme' || cmd === 'mode' || cmd === 'toggle') {
    onToggleTheme?.();
    return [
      { text: `✓ Theme toggled to ${isDark ? 'WARM PAPER' : 'DARK OBSIDIAN'} mode.`, color: '#e8552c' },
    ];
  }

  // Quote easter egg
  if (cmd === 'quote' || cmd === 'quotes') {
    const q = TECH_QUOTES[Math.floor(Math.random() * TECH_QUOTES.length)];
    return [
      { text: q, color: '#e8552c' },
    ];
  }

  // Exact match
  if (CMD_RESPONSES[cmd]) return CMD_RESPONSES[cmd];

  // print("...")
  const printMatch = cmd.match(/^print\(["'`](.*)["'`]\)$/);
  if (printMatch) return [{ text: printMatch[1], color: '#f2efe9' }];

  // Simple arithmetic
  try {
    if (/^[\d\s+\-*/.()%**]+$/.test(cmd)) {
      // eslint-disable-next-line no-eval
      const result = Function(`"use strict"; return (${cmd})`)();
      return [{ text: String(result), color: '#e8552c' }];
    }
  } catch (_) { /* fall through */ }

  // Unknown
  return [{ text: `NameError: name '${cmd.split(/\s/)[0]}' is not defined. Type help() for command list.`, color: '#ff7070' }];
}

function TerminalWindow({ isDark = false, onToggleTheme }) {
  const [lines, setLines]       = useState(BOOT_LINES);
  const [input, setInput]       = useState('');
  const [history, setHistory]   = useState([]);
  const [histIdx, setHistIdx]   = useState(-1);
  const [showCaret, setShowCaret] = useState(true);
  const [isMatrixRunning, setIsMatrixRunning] = useState(false);
  const bodyRef  = useRef(null);
  const inputRef = useRef(null);

  // Blinking caret
  useEffect(() => {
    const id = setInterval(() => setShowCaret(c => !c), 530);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll on new output
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines]);

  const focusInput = () => inputRef.current?.focus();

  const runMatrixEffect = () => {
    setIsMatrixRunning(true);
    const chars = '01010101ABCDEF0123456789$#@*&%';
    let count = 0;
    const interval = setInterval(() => {
      count++;
      let randLine = '';
      for (let i = 0; i < 34; i++) {
        randLine += chars[Math.floor(Math.random() * chars.length)];
      }
      setLines(prev => [...prev, { text: randLine, color: '#28ca41' }]);
      if (count >= 10) {
        clearInterval(interval);
        setTimeout(() => {
          setLines(prev => [
            ...prev,
            { text: '', color: '' },
            { text: '[MATRIX STREAM COMPLETE] 🟢 "Wake up, Neo... The matrix has you."', color: '#28ca41' },
            { text: '', color: '' },
          ]);
          setIsMatrixRunning(false);
        }, 200);
      }
    }, 100);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') {
      if (isMatrixRunning) return;
      const cmd = input.trim();

      // Echo the command
      const echoed = { text: `$ ${input}`, color: '#e8552c' };

      if (cmd === 'clear') {
        setLines(BOOT_LINES);
        setInput('');
        setHistIdx(-1);
        return;
      }

      if (cmd === 'matrix') {
        setLines(prev => [...prev, echoed, { text: 'Entering the Matrix...', color: '#28ca41' }]);
        setInput('');
        setHistIdx(-1);
        runMatrixEffect();
        return;
      }

      const output = evalTerminalCmd(cmd, onToggleTheme, isDark);
      setLines(prev => [...prev, echoed, ...output, { text: '', color: '' }]);
      if (cmd) {
        setHistory(prev => [cmd, ...prev]);
      }
      setInput('');
      setHistIdx(-1);

    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(next);
      setInput(history[next] ?? '');

    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? '' : history[next]);
    }
  };

  // Dynamic opposite color theme:
  // Light page -> Dark Terminal
  // Dark page  -> Light/Warm Ivory Terminal
  const termBgClass     = isDark ? 'bg-[#f8f5ee]' : 'bg-[#111110]';
  const titleBarClass   = isDark ? 'bg-[#e5e0d3] border-black/10' : 'bg-[#1e1e1c] border-white/5';
  const titleTextClass  = isDark ? 'text-[#141414]/70' : 'text-white/30';
  const shadowCardClass = isDark ? 'bg-[#222220] border-white/10' : 'bg-[#e7e3da] border-[#141414]/10';
  const statusBarClass  = isDark ? 'bg-[#ece6da] border-black/10' : 'bg-[#1a1a18] border-white/5';
  const statusTextClass = isDark ? 'text-[#141414]/60' : 'text-white/30';
  const defaultTextColor = isDark ? '#141414' : '#f2efe9';

  return (
    <div
      className={`relative border ${isDark ? 'border-[#f0ece1]/30' : 'border-[#141414]/20'} shadow-[0_24px_80px_rgba(0,0,0,0.25)] cursor-text select-none transition-colors duration-350`}
      style={{ fontFamily: 'var(--font-mono)' }}
      onClick={focusInput}
    >
      {/* Offset shadow card */}
      <div className={`absolute -bottom-2 -right-2 inset-0 border ${shadowCardClass} -z-10 transition-colors duration-350`} />

      {/* macOS-style title bar */}
      <div className={`flex items-center gap-2 px-4 py-3 ${titleBarClass} border-b transition-colors duration-350`}>
        <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <span className="w-3 h-3 rounded-full bg-[#28ca41]" />
        <span className={`ml-auto label-sm text-[10px] ${titleTextClass}`}>
          asif@mbu — python3 [{isDark ? 'LIGHT' : 'DARK'}]
        </span>
      </div>

      {/* Terminal body (history) */}
      <div
        ref={bodyRef}
        className={`${termBgClass} px-5 pt-5 pb-2 min-h-[240px] max-h-[300px] overflow-y-auto transition-colors duration-350`}
        style={{ scrollbarWidth: 'none' }}
      >
        {lines.map((line, idx) => {
          let col = line.color;
          if (isDark) {
            if (col === '#f2efe9' || !col) col = '#141414';
            else if (col === '#b4c7b4') col = '#196b27';
            else if (col === '#f2efe960' || col === '#f2efe940') col = 'rgba(20,20,20,0.55)';
          }
          return (
            <div
              key={idx}
              className="text-[12px] leading-[1.85] whitespace-pre-wrap break-all"
              style={{ color: col || defaultTextColor }}
            >
              {line.text || <>&nbsp;</>}
            </div>
          );
        })}
      </div>

      {/* Live input line */}
      <div
        className={`${termBgClass} px-5 pb-4 flex items-center gap-1.5 transition-colors duration-350`}
        onClick={focusInput}
      >
        <span className="text-[12px] text-[#e8552c] shrink-0">$</span>
        <span className={`text-[12px] ${isDark ? 'text-[#141414]' : 'text-[#f2efe9]'} flex-1 relative min-h-[20px]`}>
          {input}
          <span
            className="inline-block w-[7px] h-[13px] ml-[1px] align-middle"
            style={{
              background: '#e8552c',
              opacity: showCaret ? 1 : 0,
              transition: 'opacity 0.08s',
            }}
          />
        </span>
        {/* Hidden real input to capture keystrokes */}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          className="absolute opacity-0 w-px h-px pointer-events-none"
          aria-label="Terminal input"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </div>

      {/* Status bar */}
      <div className={`flex items-center justify-between px-5 py-2.5 ${statusBarClass} border-t transition-colors duration-350`}>
        <span className={`label-sm text-[10px] ${statusTextClass}`}>Python 3.12.0</span>
        <span className="label-sm text-[10px] text-[#e8552c]">● interactive</span>
        <span className={`label-sm text-[10px] ${statusTextClass} opacity-70`}>click to type</span>
      </div>
    </div>
  );
}

// === Live Tirupati Local Time & Status Pill ===
function TirupatiStatusWidget({ className = '' }) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const str = now.toLocaleTimeString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setTimeStr(str);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[var(--border-subtle)] bg-[var(--color-paper-2)]/60 backdrop-blur-sm shadow-xs ${className}`}>
      <span className="flex items-center gap-1.5">
        <span className="text-[#e8552c] text-xs">📍</span>
        <span className="label-sm text-[10px] text-[var(--color-ink)] font-semibold tracking-wider">Tirupati, IN</span>
      </span>
      <span className="w-1 h-1 rounded-full bg-[var(--border-strong)]"></span>
      <span className="label-sm text-[10px] font-mono text-[var(--color-ink-subtle)] font-medium">
        {timeStr || '12:00:00 PM'} IST
      </span>
      <span className="flex items-center gap-1.5 pl-1.5 border-l border-[var(--border-subtle)]">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-emerald-600 dark:text-emerald-400 label-sm text-[9px] tracking-normal">
          open to learning &amp; collaboration
        </span>
      </span>
    </div>
  );
}

// === Theme Switcher (Warm Paper ↔ Dark Obsidian) ===
function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      data-cursor=""
      className="label-sm text-[10px] border border-[var(--border-subtle)] hover:border-[var(--color-accent)] px-3 py-1.5 rounded-full flex items-center gap-2 text-[var(--color-ink)] bg-[var(--color-paper-2)]/50 hover:bg-[var(--color-paper-2)] transition-all duration-300 shadow-sm select-none"
      title={`Switch to ${isDark ? 'Warm Paper' : 'Dark Obsidian'} mode`}
      aria-label="Toggle Theme"
    >
      <span className="text-[#e8552c] text-xs transition-transform duration-300">
        {isDark ? '☾' : '☀'}
      </span>
      <span className="tracking-widest font-mono text-[9px]">
        {isDark ? 'OBSIDIAN' : 'PAPER'}
      </span>
    </button>
  );
}

// === Two-Part Custom Cursor (matches reference site) ===
function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;

    const dot  = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    if (!dot || !ring || !label) return;

    document.body.classList.add('cursor-host');

    // Start hidden at top-left
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

    // Fast follower for the dot, slow for the ring
    const moveDotX  = gsap.quickTo(dot,  'x', { duration: 0.12, ease: 'power3.out' });
    const moveDotY  = gsap.quickTo(dot,  'y', { duration: 0.12, ease: 'power3.out' });
    const moveRingX = gsap.quickTo(ring, 'x', { duration: 0.50, ease: 'power3.out' });
    const moveRingY = gsap.quickTo(ring, 'y', { duration: 0.50, ease: 'power3.out' });

    let visible = false;

    const onMove = (e) => {
      if (!visible) {
        visible = true;
        gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
      }
      moveDotX(e.clientX);  moveDotY(e.clientY);
      moveRingX(e.clientX); moveRingY(e.clientY);
    };

    const onOver = (e) => {
      const target = e.target?.closest('[data-cursor]');
      if (target) {
        const text = target.getAttribute('data-cursor') || '';
        label.textContent = text;
        gsap.to(ring,  { width: text ? 78 : 54, height: text ? 78 : 54, borderColor: '#E8552C', duration: 0.4, ease: 'expo.out' });
        gsap.to(label, { opacity: 1, duration: 0.3 });
        gsap.to(dot,   { scale: 0, duration: 0.3, ease: 'expo.out' });
      }
    };

    const onOut = (e) => {
      const left = e.target?.closest('[data-cursor]');
      if (left) {
        gsap.to(ring,  { width: 26, height: 26, borderColor: 'var(--cursor-ring)', duration: 0.4, ease: 'expo.out' });
        gsap.to(label, { opacity: 0, duration: 0.2 });
        gsap.to(dot,   { scale: 1, duration: 0.3, ease: 'expo.out' });
      }
    };

    const onLeave = () => {
      visible = false;
      gsap.to([dot, ring], { opacity: 0, duration: 0.25 });
    };

    window.addEventListener('mousemove', onMove);
    document.addEventListener('mouseover', onOver);
    document.addEventListener('mouseout',  onOut);
    document.addEventListener('mouseleave', onLeave);

    return () => {
      document.body.classList.remove('cursor-host');
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout',  onOut);
      document.removeEventListener('mouseleave', onLeave);
      gsap.killTweensOf([dot, ring, label]);
    };
  }, []);

  return (
    <div className="hidden md:block" aria-hidden="true">
      {/* Tiny orange dot — fast follower */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-[6px] h-[6px] bg-[#e8552c] rounded-full z-[10000] pointer-events-none"
      />
      {/* Outer ring — slow follower, expands on hover */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 rounded-full z-[10000] pointer-events-none flex items-center justify-center"
        style={{ width: 26, height: 26, border: '1px solid var(--cursor-ring)' }}
      >
        <span
          ref={labelRef}
          className="label-sm text-[var(--color-ink)] opacity-0 text-[8px] text-center leading-none px-1 pointer-events-none"
        />
      </div>
    </div>
  );
}

export default function App() {
  const [isPreloaderActive, setIsPreloaderActive] = useState(true);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shaik_asif_theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('shaik_asif_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 1. Lenis Smooth Scroll Setup
  useEffect(() => {
    if (isPreloaderActive || prefersReducedMotion()) return;

    // Detect touch / mobile device
    const isTouchDevice =
      typeof window !== 'undefined' &&
      ('ontouchstart' in window || navigator.maxTouchPoints > 0);

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Disable synthetic touch hijacking on mobile devices to preserve native momentum scroll
      syncTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 1,
    });

    lenis.on('scroll', ScrollTrigger.update);

    // Single unified RAF loop bound to GSAP ticker
    const updateLenis = (time) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    // Smooth Anchor Scroll
    const handleAnchorClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (!target) return;
      const href = target.getAttribute('href');
      if (!href || href === '#') return;
      const el = document.querySelector(href);
      if (el) {
        e.preventDefault();
        lenis.scrollTo(el, { offset: -40, duration: 1.4 });
      }
    };

    document.addEventListener('click', handleAnchorClick);

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, [isPreloaderActive]);

  // 3. Vertical Timeline Spine Animation
  useEffect(() => {
    if (isPreloaderActive || prefersReducedMotion()) {
      if (!isPreloaderActive) {
        gsap.set('.spine-fill', { scaleY: 1 });
        gsap.set('.layer-block', { opacity: 1, x: 0 });
        gsap.set('.chip', { opacity: 1, y: 0, scale: 1 });
      }
      return;
    }

    const ctx = gsap.context(() => {
      // Animate spine filling down
      gsap.fromTo(
        '.spine-fill',
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '.spine-track',
            start: 'top 75%',
            end: 'bottom 85%',
            scrub: 0.6,
          }
        }
      );

      // Stagger each layer card reveal
      gsap.utils.toArray('.layer-block').forEach((block) => {
        gsap.timeline({
          scrollTrigger: {
            trigger: block,
            start: 'top 82%',
            toggleActions: 'play none none none',
            once: true,
          }
        })
        .fromTo(
          block.querySelector('.layer-node'),
          { scale: 0 },
          { scale: 1, duration: 0.5, ease: 'back.out(1.7)' }
        )
        .fromTo(
          block.querySelector('.layer-head'),
          { opacity: 0, x: -24 },
          { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
          '-=0.3'
        )
        .fromTo(
          block.querySelectorAll('.chip'),
          { opacity: 0, y: 15, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.04, ease: 'power2.out' },
          '-=0.5'
        );
      });
    });

    return () => ctx.revert();
  }, [isPreloaderActive]);

  // 4. Hero Section Entrance Animation
  useEffect(() => {
    if (isPreloaderActive || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.hero-reveal',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: 'power4.out', delay: 0.2 }
      );
    });

    return () => ctx.revert();
  }, [isPreloaderActive]);

  // 5. Journey Section Timeline & Line Scale Animations on Scroll
  useEffect(() => {
    if (isPreloaderActive || prefersReducedMotion()) {
      if (!isPreloaderActive) {
        gsap.set('.journey-row', { opacity: 1, y: 0 });
        gsap.set('.journey-rule', { scaleX: 1 });
      }
      return;
    }

    const ctx = gsap.context(() => {
      gsap.utils.toArray('.journey-row').forEach((row) => {
        gsap.fromTo(
          row,
          { opacity: 0, y: 35 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: row,
              start: 'top 85%',
              toggleActions: 'play none none none',
              once: true,
            }
          }
        );

        gsap.fromTo(
          row.querySelector('.journey-rule'),
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1.1,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: row,
              start: 'top 85%',
              toggleActions: 'play none none none',
              once: true,
            }
          }
        );
      });
    });

    return () => ctx.revert();
  }, [isPreloaderActive]);

  // 6. Contact Section Scroll Reveal
  useEffect(() => {
    if (isPreloaderActive || prefersReducedMotion()) {
      if (!isPreloaderActive) {
        gsap.set('.contact-reveal', { opacity: 1, y: 0 });
      }
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact-reveal',
        { opacity: 0, y: 35 },
        {
          opacity: 1,
          y: 0,
          duration: 1.1,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '#contact',
            start: 'top 75%',
            toggleActions: 'play none none none',
            once: true,
          }
        }
      );
    });

    return () => ctx.revert();
  }, [isPreloaderActive]);

  // Key Stats
  const stats = [
    { value: 2029, suffix: '', label: 'Expected Graduation' },
    { value: 2025, suffix: '–29', label: 'B.Tech AI & DS' },
    { value: 10, suffix: '+', label: 'AI & Dev Skills Built' },
    { value: 100, suffix: '%', label: 'Dedication to Craft' },
  ];

  // Data Definitions
  const contact = {
    email: "asifshaika9032@gmail.com",
    github: "https://github.com/asifshaik-git",
    linkedin: "https://www.linkedin.com/in/shaikasif-ai/",
    resume: "#"
  };

  // Layered Technical Capabilities Stack
  const skillLayers = [
    {
      category: "Languages & Foundation",
      items: ["Python", "JavaScript", "C++ Fundamentals", "HTML5 & CSS3", "Object-Oriented Programming (OOP)", "Data Structures & Algorithms"]
    },
    {
      category: "Web & Interactive Systems",
      items: ["React.js", "Modern Web Architecture", "RESTful APIs", "Firebase & Auth", "Responsive UI Design", "Vite Tooling"]
    },
    {
      category: "Development Tooling",
      items: ["Git", "GitHub", "VS Code", "Terminal / Bash — basic"]
    },
    {
      category: "Currently Exploring",
      items: ["Generative AI", "AI Engineering", "Machine Learning", "LLM Applications"]
    }
  ];

  // Core Pillars / Focus Points
  const focusPoints = [
    {
      title: "Principled Execution",
      text: "Building clean, documented code and prioritizing sound foundational concepts over quick shortcuts."
    },
    {
      title: "Continuous Exploration",
      text: "Actively studying emerging research in machine learning, agentic workflows, and transformer architectures."
    },
    {
      title: "Practical AI Application",
      text: "Dedicated to transforming complex mathematical and algorithmic insights into real, deployable tools."
    }
  ];

  // Journey Timeline
  const journeyTimeline = [
    {
      period: "2025 — Present",
      stage: "B.Tech — AI & Data Science",
      detail: "Commenced undergraduate studies at Mohan Babu University. Focused on strengthening programming fundamentals, algorithms, linear algebra, and data science principles."
    },
    {
      period: "Early Foundations",
      stage: "Programming & Web Fundamentals",
      detail: "Explored Python syntax, web development structures, and algorithmic logic through hands-on practice, coding exercises, and self-guided projects."
    },
    {
      period: "Next Milestones",
      stage: "Deep Learning & Complex Structures",
      detail: "Currently gearing up to explore complex Data Structures & Algorithms, Neural Networks, and production-grade MLOps pipelines to bridge studies and practical application."
    }
  ];

  const isDark = theme === 'dark';

  return (
    <div className="min-h-screen relative text-[var(--color-ink)] bg-[var(--color-paper)]">
      {/* 00. Preloader Screen */}
      <Preloader onDone={() => setIsPreloaderActive(false)} />

      {/* Two-Part Custom Cursor */}
      <CustomCursor />

      {/* Header Sticky Navigation */}
      <header className="sticky top-0 z-50 w-full bg-[var(--header-bg)] backdrop-blur-md border-b border-[var(--border-subtle)] px-6 md:px-10 py-3.5 md:py-4 transition-colors duration-350">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          
          {/* Clean Editorial Brand */}
          <div className="flex items-center">
            <a href="#intro" data-cursor="" className="group flex flex-col">
              <span className="display text-2xl md:text-3xl text-[var(--color-ink)] group-hover:text-[#e8552c] transition-colors duration-300">
                Shaik Asif
              </span>
              <span className="label-sm text-[8px] md:text-[9px] text-[var(--color-ink-faint)] -mt-1 tracking-widest uppercase">
                AI &amp; Data Science
              </span>
            </a>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            <a href="#intro" data-cursor="" className="label-sm text-[var(--color-ink-subtle)] hover:text-[#e8552c] transition-colors duration-300">
              <span className="text-[#e8552c] mr-1.5">00</span>Intro
            </a>
            <a href="#about" data-cursor="" className="label-sm text-[var(--color-ink-subtle)] hover:text-[#e8552c] transition-colors duration-300">
              <span className="text-[#e8552c] mr-1.5">01</span>About
            </a>
            <a href="#capabilities" data-cursor="" className="label-sm text-[var(--color-ink-subtle)] hover:text-[#e8552c] transition-colors duration-300">
              <span className="text-[#e8552c] mr-1.5">02</span>Capabilities
            </a>
            <a href="#journey" data-cursor="" className="label-sm text-[var(--color-ink-subtle)] hover:text-[#e8552c] transition-colors duration-300">
              <span className="text-[#e8552c] mr-1.5">03</span>Journey
            </a>
            <a href="#contact" data-cursor="" className="label-sm text-[var(--color-ink-subtle)] hover:text-[#e8552c] transition-colors duration-300">
              <span className="text-[#e8552c] mr-1.5">04</span>Contact
            </a>
          </nav>

          {/* Actions: Theme Toggle & Hire Button */}
          <div className="flex items-center gap-3">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
            <a 
              href={`mailto:${contact.email}`} 
              data-cursor=""
              className="label-sm bg-[var(--color-ink)] text-[var(--color-paper)] hover:bg-[#e8552c] hover:text-[#f2efe9] px-4 py-2 rounded-full transition-colors duration-300 shadow-sm"
            >
              Hire Me
            </a>
          </div>

        </div>
      </header>

      {/* Main Content Sections */}
      <main className="relative z-10">

        {/* 00 - INTRO (Hero) */}
        <section id="intro" className="relative min-h-[calc(100vh-80px)] flex items-center py-16 md:py-24 px-6 md:px-10 border-b border-[var(--border-subtle)]">
          <div className="max-w-[1600px] mx-auto w-full grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Bio Text */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <div className="hero-reveal opacity-0 flex flex-wrap items-center gap-3">
                <span className="label-sm text-[#e8552c] font-bold">00</span>
                <span className="h-px w-8 bg-[var(--border-strong)]"></span>
                <TirupatiStatusWidget />
              </div>
              <h1 className="hero-reveal opacity-0 display text-6xl md:text-9xl leading-[0.85] text-[var(--color-ink)] mt-6">
                Shaik Asif
              </h1>
              <p className="hero-reveal opacity-0 label text-[#e8552c] mt-4 md:mt-6 text-sm md:text-lg">
                CSE (AI &amp; Data Science) Student
              </p>
              <p className="hero-reveal opacity-0 text-base md:text-lg leading-[1.85] text-[var(--color-ink-subtle)] max-w-xl mt-8">
                I study computational pathways and modern models to explore how technology, data systems, and human ingenuity solve complex, real-world problems.
              </p>
              
              <div className="hero-reveal opacity-0 mt-10 md:mt-14 flex flex-wrap gap-5 items-center">
                <a 
                  href={`mailto:${contact.email}`} 
                  data-cursor=""
                  className="inline-flex items-center gap-2 group label-sm bg-[#e8552c] text-[#f2efe9] hover:bg-[var(--color-ink)] py-3.5 px-6 rounded-full transition-colors duration-300"
                >
                  Get In Touch
                  <span className="group-hover:translate-x-1 transition-transform duration-300">→</span>
                </a>
                <a 
                  href="#about" 
                  data-cursor=""
                  className="label-sm border border-[var(--border-strong)] hover:border-[var(--color-ink)] hover:bg-[var(--color-ink)]/5 py-3.5 px-6 rounded-full transition-all duration-300"
                >
                  Explore Profile
                </a>
              </div>
            </div>

            {/* Right: Animated AI Terminal Window (Opposite Color Theme + Easter Eggs) */}
            <div className="lg:col-span-5 flex justify-center items-center">
              <div className="hero-reveal opacity-0 w-full max-w-[460px]">
                <TerminalWindow isDark={isDark} onToggleTheme={toggleTheme} />
              </div>
            </div>

          </div>
        </section>

        {/* TICKER / MARQUEE STRIP */}
        <Marquee
          items={["AI & Data Science", "Machine Learning", "Python", "LLM Applications", "Generative AI", "Web Dev", "Firebase", "Mohan Babu University", "Deep Learning", "Tirupati"]}
          className="py-5 border-y border-[var(--border-subtle)] bg-[var(--ticker-bg)]"
        />

        {/* 01 - ABOUT */}
        <section id="about" className="relative py-24 md:py-36 px-6 md:px-10 border-b border-[var(--border-subtle)]">
          <div className="max-w-[1600px] mx-auto">
            <SectionHeader 
              num="01" 
              kicker="Manifesto" 
              title="About" 
              intro="Disciplined, ethical, long-term growth as an engineer." 
              active={!isPreloaderActive}
            />

            <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 mt-16 md:mt-24">
              
              {/* Left Manifesto & Stats */}
              <div className="lg:col-span-7 flex flex-col justify-between">
                <p className="text-base md:text-xl leading-[1.8] text-[var(--color-ink)]/90 max-w-2xl">
                  I am a CSE (AI &amp; Data Science) student focused on understanding how technology, data, and artificial intelligence can solve meaningful problems. I am continuously building my skills in programming, web development, machine learning, and AI engineering while staying curious, disciplined, and open to learning.
                </p>

                {/* 2x2 Stats Grid */}
                <div className="grid grid-cols-2 gap-px bg-[var(--border-subtle)] mt-12 md:mt-16 border border-[var(--border-subtle)]">
                  {stats.map((stat, idx) => (
                    <div key={idx} className="bg-[var(--color-paper)] p-5 md:p-6 flex flex-col justify-center">
                      <div className="display text-4xl md:text-5xl text-[var(--color-ink)] leading-none">
                        <StatCounter value={stat.value} suffix={stat.suffix} active={!isPreloaderActive} />
                      </div>
                      <div className="label-sm text-[var(--color-ink-subtle)] mt-3 leading-relaxed">
                        {stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Education & Location */}
              <div className="lg:col-span-5 lg:pl-12 lg:border-l border-[var(--border-subtle)] flex flex-col gap-8 justify-between">
                
                {/* Education Block */}
                <div>
                  <div className="label-sm text-[var(--color-ink-subtle)] mb-6 flex items-center gap-3">
                    <span className="w-1.5 h-1.5 bg-[#e8552c]"></span>
                    Education
                  </div>
                  
                  {/* University Entry */}
                  <div className="py-6 border-t border-[var(--border-subtle)]">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="display text-2xl md:text-3xl text-[var(--color-ink)] leading-tight">
                        Mohan Babu University
                      </h3>
                      <span className="label-sm text-[#e8552c] shrink-0 pt-1.5">
                        2025 – 2029
                      </span>
                    </div>
                    <p className="text-[13px] text-[var(--color-ink-subtle)] mt-2 leading-relaxed font-mono">
                      B.Tech — Computer Science &amp; Engineering (AI &amp; Data Science)
                    </p>
                    <p className="text-[12px] text-[var(--color-ink-faint)] mt-1 font-mono">
                      Current Grade: CGPA 6.82
                    </p>
                  </div>

                  {/* Intermediate Entry */}
                  <div className="py-6 border-t border-[var(--border-subtle)]">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="display text-2xl md:text-3xl text-[var(--color-ink)] leading-tight">
                        Sri Chaitanya Junior College
                      </h3>
                      <span className="label-sm text-[#e8552c] shrink-0 pt-1.5">
                        68.2%
                      </span>
                    </div>
                    <p className="text-[13px] text-[var(--color-ink-subtle)] mt-2 leading-relaxed font-mono">
                      Intermediate (Class XII)
                    </p>
                  </div>
                </div>

                {/* Location Card */}
                <div className="tex-kraft border border-[var(--border-strong)] p-6 md:p-8 shadow-[0_4px_14px_rgba(0,0,0,0.04)]">
                  <div className="label-sm text-[var(--color-ink-subtle)]">Based in</div>
                  <div className="display text-3xl md:text-4xl mt-2 text-[var(--color-ink)]">
                    Tirupati, India
                  </div>
                  <div className="label-sm text-[var(--color-ink-faint)] mt-3 leading-relaxed">
                    13.6288° N / 79.4192° E
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* 02 - CAPABILITIES */}
        <section id="capabilities" className="relative py-24 md:py-36 px-6 md:px-10 bg-[var(--ticker-bg)] border-b border-[var(--border-subtle)]">
          <div className="max-w-[1600px] mx-auto">
            <SectionHeader 
              num="02" 
              kicker="Capability Stack" 
              title="Capabilities" 
              intro="A layered breakdown of technical capability — from core coding structures up to intelligent layers." 
              active={!isPreloaderActive}
            />

            <div className="spine-track relative mt-16 md:mt-24 pl-8 md:pl-20">
              
              {/* Vertical Spine Line */}
              <div className="absolute left-0 md:left-8 top-0 bottom-0 w-[2px] bg-[var(--border-strong)]">
                <div className="spine-fill absolute top-0 left-0 w-full h-full bg-[#e8552c] origin-top scale-y-0"></div>
              </div>

              {/* Spine Layers */}
              <div className="space-y-12 md:space-y-16">
                {skillLayers.map((layer, idx) => (
                  <div key={idx} className="layer-block relative group">
                    
                    {/* Bullet Node */}
                    <div className="layer-node absolute -left-10 md:-left-[23px] top-1.5 w-3 h-3 md:w-4 md:h-4 bg-[var(--color-paper)] border-2 border-[var(--color-ink)] rounded-full z-10 transition-colors duration-300 group-hover:bg-[#e8552c]"></div>
                    
                    <div className="layer-head opacity-0">
                      <span className="label-sm text-[#e8552c]">Layer 0{idx + 1}</span>
                      <h3 className="display text-2xl md:text-3xl text-[var(--color-ink)] mt-1.5">
                        {layer.category}
                      </h3>
                    </div>

                    <div className="flex flex-wrap gap-2.5 mt-4">
                      {layer.items.map((item, sIdx) => (
                        <span 
                          key={sIdx} 
                          className="chip opacity-0 label-sm border border-[var(--border-strong)] bg-[var(--color-paper)] text-[var(--color-ink-subtle)] px-3 py-1.5 hover:border-[var(--color-ink)] hover:text-[#e8552c] transition-all duration-300 cursor-default"
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                  </div>
                ))}
              </div>

            </div>

            {/* Core Focus Highlights */}
            <div className="grid md:grid-cols-3 gap-6 mt-20 pt-16 border-t border-[var(--border-subtle)]">
              {focusPoints.map((pt, idx) => (
                <div key={idx} className="bg-[var(--color-paper)]/50 border border-[var(--border-subtle)] p-6 flex flex-col justify-between hover:border-[#e8552c]/50 transition-colors duration-300">
                  <div className="label-sm text-[#e8552c]">0{idx + 1} / Core Value</div>
                  <div>
                    <h4 className="display text-2xl text-[var(--color-ink)] mt-4">{pt.title}</h4>
                    <p className="text-[13px] text-[var(--color-ink-subtle)] mt-3 leading-relaxed">
                      {pt.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 03 - JOURNEY */}
        <section id="journey" className="relative py-24 md:py-36 px-6 md:px-10 border-b border-[var(--border-subtle)]">
          <div className="max-w-[1600px] mx-auto">
            <SectionHeader 
              num="03" 
              kicker="Academic &amp; Personal timeline" 
              title="Journey" 
              intro="Highlighting academic development, learning paths, and independent growth milestones." 
              active={!isPreloaderActive}
            />

            <div className="mt-16 md:mt-24 flex flex-col">
              {journeyTimeline.map((item, idx) => (
                <div key={idx} className="journey-row opacity-0 py-8 md:py-12 first:pt-0 last:pb-0 grid md:grid-cols-12 gap-6 items-baseline group relative hover:bg-[var(--color-paper-2)]/30 px-2 rounded-sm transition-colors duration-300">
                  
                  {/* Timeline Period */}
                  <div className="md:col-span-3">
                    <span className="label text-[#e8552c]">{item.period}</span>
                  </div>

                  {/* Stage Details */}
                  <div className="md:col-span-9 pb-6">
                    <h3 className="display text-2xl md:text-3xl text-[var(--color-ink)] group-hover:text-[#e8552c] transition-colors duration-300 leading-tight">
                      {item.stage}
                    </h3>
                    <p className="text-sm text-[var(--color-ink-subtle)] mt-3 leading-relaxed max-w-3xl">
                      {item.detail}
                    </p>
                  </div>

                  {/* Bottom Line Animated Separator */}
                  <div className="journey-rule absolute bottom-0 left-0 w-full h-px bg-[var(--border-subtle)] origin-left scale-x-0"></div>

                </div>
              ))}
            </div>

          </div>
        </section>

        {/* 04 - CONTACT */}
        <section id="contact" className="relative py-24 md:py-36 px-6 md:px-10 bg-[var(--color-kraft)]/35">
          <div className="max-w-[1600px] mx-auto flex flex-col justify-between min-h-[60vh]">
            
            <div>
              <div className="contact-reveal opacity-0 flex items-center gap-3">
                <span className="label-sm text-[#e8552c]">04</span>
                <span className="h-px w-10 bg-[var(--border-strong)]"></span>
                <span className="label-sm text-[var(--color-ink-subtle)]">Initiate Connection</span>
              </div>
              <h2 className="contact-reveal opacity-0 display text-5xl md:text-8xl text-[var(--color-ink)] mt-6">
                Let's Build Together
              </h2>
              <p className="contact-reveal opacity-0 text-sm md:text-base text-[var(--color-ink-subtle)] max-w-xl mt-6 leading-relaxed">
                Whether you want to discuss AI models, data systems, academic collaboration, or just connect to share ideas—my inbox is open.
              </p>
              
              <div className="contact-reveal opacity-0 mt-10 md:mt-14 overflow-hidden">
                <a 
                  href={`mailto:${contact.email}`} 
                  data-cursor=""
                  className="display text-3xl sm:text-5xl md:text-7xl lg:text-8xl text-[var(--color-ink)] hover:text-[#e8552c] transition-colors duration-500 break-words link-underline inline-block pb-2"
                >
                  {contact.email}
                </a>
              </div>

              {/* Official Profiles & Channels Showcase Cards */}
              <div className="contact-reveal opacity-0 mt-14 md:mt-20 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                
                {/* GitHub Official Profile Card */}
                <a
                  href={contact.github}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor=""
                  className="group relative p-6 md:p-7 border border-[var(--border-strong)] bg-[var(--color-paper)]/85 hover:border-[#e8552c] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-full border border-[var(--border-strong)] bg-[var(--color-paper-2)] flex items-center justify-center text-[var(--color-ink)] group-hover:bg-[#e8552c] group-hover:text-white group-hover:border-[#e8552c] transition-all duration-300">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                    </div>
                    <span className="label-sm text-[9px] text-[#e8552c] border border-[#e8552c]/30 px-2.5 py-0.5 rounded-full">
                      Code &amp; AI Repos
                    </span>
                  </div>
                  <div className="mt-6">
                    <div className="label-sm text-[10px] text-[var(--color-ink-faint)]">GitHub Profile</div>
                    <div className="display text-2xl md:text-3xl text-[var(--color-ink)] group-hover:text-[#e8552c] transition-colors duration-300 mt-1">
                      @asifshaik-git
                    </div>
                    <p className="text-xs text-[var(--color-ink-subtle)] mt-2 font-mono leading-relaxed">
                      Explore my open-source AI projects, machine learning models &amp; code repositories.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <span className="label-sm text-[10px] text-[var(--color-ink)] font-semibold">github.com/asifshaik-git</span>
                    <span className="label-sm text-[10px] text-[#e8552c] group-hover:translate-x-1 transition-transform duration-300 font-bold">
                      View Profile →
                    </span>
                  </div>
                </a>

                {/* LinkedIn Official Profile Card */}
                <a
                  href={contact.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor=""
                  className="group relative p-6 md:p-7 border border-[var(--border-strong)] bg-[var(--color-paper)]/85 hover:border-[#0077b5] transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-full border border-[var(--border-strong)] bg-[var(--color-paper-2)] flex items-center justify-center text-[var(--color-ink)] group-hover:bg-[#0077b5] group-hover:text-white group-hover:border-[#0077b5] transition-all duration-300">
                      <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </div>
                    <span className="label-sm text-[9px] text-[#0077b5] border border-[#0077b5]/30 px-2.5 py-0.5 rounded-full">
                      Professional Network
                    </span>
                  </div>
                  <div className="mt-6">
                    <div className="label-sm text-[10px] text-[var(--color-ink-faint)]">LinkedIn Profile</div>
                    <div className="display text-2xl md:text-3xl text-[var(--color-ink)] group-hover:text-[#0077b5] transition-colors duration-300 mt-1">
                      /in/shaikasif-ai
                    </div>
                    <p className="text-xs text-[var(--color-ink-subtle)] mt-2 font-mono leading-relaxed">
                      Connect for AI engineering collaborations, academic milestones &amp; technical updates.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <span className="label-sm text-[10px] text-[var(--color-ink)] font-semibold">linkedin.com/in/shaikasif-ai</span>
                    <span className="label-sm text-[10px] text-[#0077b5] group-hover:translate-x-1 transition-transform duration-300 font-bold">
                      Connect Now →
                    </span>
                  </div>
                </a>

                {/* Direct Channel & Status Card */}
                <div className="sm:col-span-2 lg:col-span-1 p-6 md:p-7 border border-[var(--border-strong)] bg-[var(--color-paper)]/85 flex flex-col justify-between shadow-xs">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-full border border-[var(--border-strong)] bg-[var(--color-paper-2)] flex items-center justify-center text-[#e8552c] text-lg">
                      ✉
                    </div>
                    <span className="label-sm text-[9px] text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                      Direct Channel
                    </span>
                  </div>
                  <div className="mt-6">
                    <div className="label-sm text-[10px] text-[var(--color-ink-faint)]">Electronic Mail</div>
                    <div className="display text-xl md:text-2xl text-[var(--color-ink)] mt-1 break-all">
                      asifshaika9032@gmail.com
                    </div>
                    <p className="text-xs text-[var(--color-ink-subtle)] mt-2 font-mono leading-relaxed">
                      Drop a line anytime for engineering discussions, data problems, or student networking.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                    <a
                      href={`mailto:${contact.email}`}
                      data-cursor=""
                      className="label-sm text-[10px] text-[#e8552c] hover:underline font-semibold"
                    >
                      Send Message →
                    </a>
                    <span className="label-sm text-[9px] text-[var(--color-ink-faint)]">
                      Resume: In Progress
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Bottom Metadata */}
            <div className="contact-reveal opacity-0 mt-20 pt-10 border-t border-[var(--border-subtle)] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="label-sm text-[var(--color-ink-faint)]">
                © {new Date().getFullYear()} Shaik Asif. Designed with React, GSAP &amp; AI Focus.
              </div>
              
              <div className="flex gap-6 items-center">
                <a 
                  href={contact.github} 
                  target="_blank" 
                  rel="noreferrer" 
                  data-cursor=""
                  className="label-sm text-[var(--color-ink-subtle)] hover:text-[#e8552c] transition-colors duration-300"
                >
                  GitHub: @asifshaik-git
                </a>
                <span className="w-1 h-1 bg-[var(--border-strong)] rounded-full"></span>
                <a 
                  href={contact.linkedin} 
                  target="_blank" 
                  rel="noreferrer" 
                  data-cursor=""
                  className="label-sm text-[var(--color-ink-subtle)] hover:text-[#0077b5] transition-colors duration-300"
                >
                  LinkedIn: /in/shaikasif-ai
                </a>
              </div>

              <div className="label-sm text-[var(--color-ink-faint)]">
                Tirupati, AP, India
              </div>
            </div>

          </div>
        </section>

      </main>
      <Analytics />
    </div>
  );
}