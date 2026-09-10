import React from 'react';
import {
  ArrowUp,
  Linkedin,
  Github,
  MessageSquare,
  Mail,
  Heart,
} from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';

interface FooterProps {
  theme: 'dark' | 'light';
}

export const Footer: React.FC<FooterProps> = ({ theme }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      id="main-footer"
      className={`py-12 border-t no-print transition-colors ${
        theme === 'dark'
          ? 'bg-slate-950 border-slate-800/80 text-slate-400'
          : 'bg-white border-slate-200 text-slate-600'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-slate-800/50">
          {/* Brand Info */}
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <div className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
              <span className="w-8 h-8 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-sm">
                MR
              </span>
              <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                {PERSONAL_INFO.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Frontend Developer & Software Engineer • Raiwind, Punjab, PK
            </p>
          </div>

          {/* Social Icons (Repeated as requested in prompt) */}
          <div className="flex items-center gap-3">
            <a
              id="footer-social-linkedin"
              href={PERSONAL_INFO.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className={`p-2.5 rounded-xl border transition-all ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-blue-500'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-blue-600'
              }`}
            >
              <Linkedin className="w-4 h-4" />
            </a>

            <a
              id="footer-social-github"
              href={PERSONAL_INFO.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className={`p-2.5 rounded-xl border transition-all ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950'
              }`}
            >
              <Github className="w-4 h-4" />
            </a>

            <a
              id="footer-social-whatsapp"
              href={PERSONAL_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className={`p-2.5 rounded-xl border transition-all ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-emerald-600'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
            </a>

            <a
              id="footer-social-email"
              href={`mailto:${PERSONAL_INFO.email}`}
              aria-label="Email"
              className={`p-2.5 rounded-xl border transition-all ${
                theme === 'dark'
                  ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-600'
                  : 'bg-slate-100 border-slate-200 text-slate-700 hover:text-slate-950'
              }`}
            >
              <Mail className="w-4 h-4" />
            </a>
          </div>

          {/* Back to Top Button */}
          <button
            id="btn-back-to-top"
            onClick={scrollToTop}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              theme === 'dark'
                ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Back to Top</span>
            <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
          </button>
        </div>

        {/* Copyright Row */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs gap-3">
          <p className="font-mono">
            © 2026 Muhammad Raqeeb. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-slate-400">
            Crafted for high performance, accessibility & recruiter clarity
          </p>
        </div>
      </div>
    </footer>
  );
};
