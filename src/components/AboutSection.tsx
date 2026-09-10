import React from 'react';
import {
  FileText,
  MapPin,
  Award,
  Sparkles,
  Layout,
  Smartphone,
  Cpu,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';

interface AboutSectionProps {
  theme: 'dark' | 'light';
  onOpenCv: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ theme, onOpenCv }) => {
  return (
    <section
      id="about"
      className={`py-20 border-t transition-colors ${
        theme === 'dark' ? 'border-slate-800/80 bg-slate-900/30' : 'border-slate-200 bg-slate-50/50'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>About Me</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            Engineering Fast, Practical Digital Experiences
          </h2>
        </div>

        {/* 2-Column Story Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Narrative Story & Location & Action */}
          <div className="lg:col-span-7 space-y-5">
            <div
              className={`rounded-2xl p-6 sm:p-8 border space-y-4 leading-relaxed text-base ${
                theme === 'dark'
                  ? 'bg-slate-900/80 border-slate-800 text-slate-300'
                  : 'bg-white border-slate-200 text-slate-700 shadow-sm'
              }`}
            >
              <p>
                Hello! I am <strong className={theme === 'dark' ? 'text-white' : 'text-slate-950'}>Muhammad Raqeeb</strong>,
                a Computer Science graduate from{' '}
                <span className="text-emerald-500 font-semibold">The University of Lahore</span> with an academic CGPA
                of <span className="font-bold text-emerald-400">3.68 / 4.00</span>.
              </p>
              <p>
                Rather than treating code as just syntax, I treat it as a direct medium for solving human problems.
                Over the past 4 years, I have built real-world cross-platform applications—from an alumni networking
                platform in Flutter with Firebase to bilingual, high-speed on-demand service platforms in React and Tailwind CSS.
              </p>
              <p>
                Whether designing responsive web views with pixel-precise Tailwind layouts or configuring real-time
                mobile sync, my goal is straightforward: write clean, maintainable software that loads in under 2 seconds and
                delights end users.
              </p>

              {/* Verified Location & Education Strip */}
              <div className="pt-4 border-t border-slate-800/60 flex flex-wrap items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <MapPin className="w-4 h-4 text-emerald-500" />
                  <span>Location: {PERSONAL_INFO.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>BS Computer Science (2022–2026)</span>
                </div>
              </div>
            </div>

            {/* Re-iterated Download CV Button (as explicitly requested in Section 2) */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                id="about-download-cv-btn"
                onClick={onOpenCv}
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>Download Complete CV (PDF)</span>
              </button>

              <a
                href="#contact"
                className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold transition-all ${
                  theme === 'dark'
                    ? 'border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
                    : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>Message Raqeeb</span>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-500" />
              </a>
            </div>
          </div>

          {/* Right Column: 3 Key Job Skills required for the role */}
          <div className="lg:col-span-5 space-y-4">
            <h3
              className={`text-sm font-bold uppercase tracking-wider ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              3 Core Job Competencies
            </h3>

            {/* Skill 1: Modern Frontend */}
            <div
              className={`p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 ${
                theme === 'dark'
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  <Layout className="w-5 h-5" />
                </div>
                <div>
                  <h4
                    className={`font-bold text-base mb-1 ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Modern Frontend (React & Tailwind)
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Clean component architecture, TypeScript typing, modular state management, and mobile-first responsive styling.
                  </p>
                </div>
              </div>
            </div>

            {/* Skill 2: Cross-Platform Mobile */}
            <div
              className={`p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 ${
                theme === 'dark'
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h4
                    className={`font-bold text-base mb-1 ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Cross-Platform Mobile (Flutter & Dart)
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    End-to-end app development with Firebase Auth, Firestore real-time queries, accessible themes, and cross-platform UX.
                  </p>
                </div>
              </div>
            </div>

            {/* Skill 3: Core Engineering & OOP */}
            <div
              className={`p-5 rounded-2xl border transition-all duration-200 hover:-translate-y-1 ${
                theme === 'dark'
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h4
                    className={`font-bold text-base mb-1 ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    Core CS & Engineering Principles
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Strong object-oriented fundamentals in Java, algorithmic thinking, Git branch workflows, and applied ML concepts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
