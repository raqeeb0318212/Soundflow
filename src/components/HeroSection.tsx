import React from 'react';
import {
  Download,
  Send,
  Linkedin,
  Github,
  MessageSquare,
  MapPin,
  GraduationCap,
  Sparkles,
  ArrowDown,
  Code2,
  Layers,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';

interface HeroSectionProps {
  theme: 'dark' | 'light';
  onOpenCv: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ theme, onOpenCv }) => {
  return (
    <section
      id="hero"
      className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-16 overflow-hidden"
    >
      {/* Subtle Background Glow Accent */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[360px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Core Introduction (3-sec recruiter hook) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            {/* Status Pill */}
            <div
              id="hero-status-pill"
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold mb-6 border transition-all ${
                theme === 'dark'
                  ? 'bg-slate-900/90 border-slate-800 text-slate-300'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-emerald-500 font-bold">🟢 Open for Work:</span>
              <span>Frontend & Mobile Roles</span>
            </div>

            {/* Candidate Name - Bara aur Bold */}
            <h1
              id="hero-candidate-name"
              className={`text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.08] mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              Muhammad <span className="text-emerald-500">Raqeeb</span>
            </h1>

            {/* Job Title - Crisp & Recruiter-Targeted */}
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <span
                id="hero-job-title"
                className={`text-xl sm:text-2xl font-bold tracking-tight ${
                  theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                }`}
              >
                Frontend Developer & Software Engineer
              </span>
              <span className="hidden sm:inline-block text-slate-500">•</span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-800 text-emerald-400'
                    : 'bg-white border-slate-200 text-emerald-700 shadow-xs'
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                CGPA 3.68 / 4.00
              </span>
            </div>

            {/* 1-Line Tagline */}
            <p
              id="hero-tagline"
              className={`text-lg sm:text-xl font-normal max-w-2xl leading-relaxed mb-8 ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}
            >
              "{PERSONAL_INFO.tagline}"
            </p>

            {/* 2 Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10 w-full sm:w-auto">
              {/* Button 1: Hire Me */}
              <a
                id="hero-hire-btn"
                href="#contact"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm tracking-wide transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 active:translate-y-0"
              >
                <Send className="w-4 h-4" />
                <span>Hire Me</span>
              </a>

              {/* Button 2: Download CV */}
              <button
                id="hero-download-cv-btn"
                onClick={onOpenCv}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl border font-bold text-sm transition-all duration-200 cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-slate-900/90 hover:bg-slate-800 border-slate-700 text-white hover:border-slate-500 shadow-md shadow-black/20'
                    : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-800 shadow-sm'
                } hover:-translate-y-0.5 active:translate-y-0`}
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Download CV</span>
              </button>
            </div>

            {/* Social Links Bar */}
            <div className="flex items-center gap-5 pt-4 border-t border-slate-800/60 w-full">
              <span
                className={`text-xs uppercase tracking-wider font-semibold ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                Connect:
              </span>

              <div className="flex items-center gap-3">
                {/* LinkedIn */}
                <a
                  id="hero-social-linkedin"
                  href={PERSONAL_INFO.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn Profile"
                  className={`p-2.5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-blue-500 hover:bg-blue-500/10'
                      : 'bg-white border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-300'
                  }`}
                >
                  <Linkedin className="w-4 h-4" />
                </a>

                {/* GitHub */}
                <a
                  id="hero-social-github"
                  href={PERSONAL_INFO.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub Profile"
                  className={`p-2.5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500 hover:bg-emerald-500/10'
                      : 'bg-white border-slate-200 text-slate-700 hover:text-slate-950 hover:border-slate-400'
                  }`}
                >
                  <Github className="w-4 h-4" />
                </a>

                {/* WhatsApp */}
                <a
                  id="hero-social-whatsapp"
                  href={PERSONAL_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Chat on WhatsApp"
                  className={`p-2.5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${
                    theme === 'dark'
                      ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500 hover:bg-emerald-500/10'
                      : 'bg-white border-slate-200 text-slate-700 hover:text-emerald-600 hover:border-emerald-300'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>

              {/* Location Badge */}
              <div
                className={`hidden sm:flex items-center gap-1.5 ml-auto text-xs font-medium ${
                  theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                <span>{PERSONAL_INFO.location}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Professional Profile Photo & 3D Interactive Tech Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div
              id="hero-profile-card"
              className={`relative w-full max-w-sm rounded-3xl p-6 border transition-all duration-300 shadow-2xl ${
                theme === 'dark'
                  ? 'bg-slate-900/90 border-slate-800/80 shadow-black/60'
                  : 'bg-white border-slate-200 shadow-slate-200'
              }`}
            >
              {/* Top Card Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  software_profile.ts
                </span>
              </div>

              {/* Center Portrait / Avatar representation */}
              <div className="relative mx-auto w-36 h-36 mb-5">
                {/* Outer Glow Ring */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 p-[3px] shadow-lg shadow-emerald-500/25">
                  <div
                    className={`w-full h-full rounded-full flex flex-col items-center justify-center overflow-hidden ${
                      theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'
                    }`}
                  >
                    {/* Stylized Portrait Visual */}
                    <div className="relative flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 text-2xl font-black shadow-inner">
                        MR
                      </div>
                      <div className="text-[11px] font-bold tracking-wider uppercase mt-2 text-emerald-500">
                        Developer
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating Micro Badge: React */}
                <div
                  className="absolute -top-1 -right-2 p-1.5 rounded-xl bg-slate-900 border border-slate-700 shadow-md text-cyan-400"
                  title="React & Modern Web"
                >
                  <Code2 className="w-4 h-4" />
                </div>

                {/* Floating Micro Badge: Flutter */}
                <div
                  className="absolute -bottom-1 -left-2 p-1.5 rounded-xl bg-slate-900 border border-slate-700 shadow-md text-sky-400"
                  title="Flutter & Mobile"
                >
                  <Smartphone className="w-4 h-4" />
                </div>
              </div>

              {/* Card Meta Details */}
              <div className="text-center mb-5">
                <h3
                  className={`text-lg font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  {PERSONAL_INFO.name}
                </h3>
                <p className="text-xs text-slate-400">
                  The University of Lahore • Class of 2026
                </p>
              </div>

              {/* Compact Quick Facts Box */}
              <div
                className={`rounded-xl p-3 mb-4 space-y-2 border text-xs ${
                  theme === 'dark'
                    ? 'bg-slate-950/60 border-slate-800 text-slate-300'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Education</span>
                  <span className="font-semibold text-emerald-400">BS CS (3.68 CGPA)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Primary Stack</span>
                  <span className="font-semibold">React, Flutter, Tailwind</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Current Base</span>
                  <span className="font-semibold">Raiwind, Punjab, PK</span>
                </div>
              </div>

              {/* Quick WhatsApp Connect */}
              <a
                id="hero-quick-wa-btn"
                href={PERSONAL_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Quick WhatsApp: +92 318 2121032</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
