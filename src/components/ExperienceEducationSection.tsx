import React, { useState } from 'react';
import {
  Briefcase,
  GraduationCap,
  Award,
  Calendar,
  MapPin,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { EXPERIENCES, EDUCATION_LIST, CERTIFICATIONS } from '../data/portfolioData';

interface ExperienceEducationSectionProps {
  theme: 'dark' | 'light';
}

export const ExperienceEducationSection: React.FC<ExperienceEducationSectionProps> = ({ theme }) => {
  const [activeTab, setActiveTab] = useState<'both' | 'experience' | 'education'>('both');

  return (
    <section
      id="experience"
      className={`py-20 border-t transition-colors ${
        theme === 'dark' ? 'border-slate-800/80 bg-slate-950' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Career History & Academic Credentials</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            Experience & Education Timeline
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Proven academic record from The University of Lahore combined with freelance client delivery.
          </p>
        </div>

        {/* 2-Column Side-by-Side Timeline Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Column 1: Experience Timeline (5 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/60">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3
                className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}
              >
                Work & Practical Experience
              </h3>
            </div>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-teal-500 before:to-slate-800">
              {EXPERIENCES.map((exp) => (
                <div key={exp.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[29px] sm:-left-[37px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-emerald-500 group-hover:scale-125 transition-transform duration-200" />

                  {/* Card */}
                  <div
                    className={`rounded-2xl p-5 sm:p-6 border transition-all duration-200 hover:-translate-y-1 ${
                      theme === 'dark'
                        ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                        {exp.type}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                        <Calendar className="w-3 h-3" />
                        {exp.duration}
                      </span>
                    </div>

                    <h4
                      className={`text-lg font-bold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {exp.role}
                    </h4>
                    <p className="text-xs font-semibold text-slate-400 mb-3">{exp.company}</p>

                    {/* Bullets */}
                    <ul className="space-y-2 mb-4">
                      {exp.bullets.map((bullet, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
                            {bullet}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Tech Badges */}
                    <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-800/60">
                      {exp.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800/70 text-slate-300 border border-slate-700/60"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 2: Education & Certifications Timeline (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/60">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h3
                className={`text-xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}
              >
                Education History
              </h3>
            </div>

            <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-teal-500 before:via-emerald-500 before:to-slate-800">
              {EDUCATION_LIST.map((edu) => (
                <div key={edu.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[29px] sm:-left-[37px] top-1.5 w-3.5 h-3.5 rounded-full bg-slate-950 border-2 border-teal-500 group-hover:scale-125 transition-transform duration-200" />

                  {/* Card */}
                  <div
                    className={`rounded-2xl p-5 sm:p-6 border transition-all duration-200 hover:-translate-y-1 ${
                      theme === 'dark'
                        ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <span className="text-xs font-bold text-teal-400">
                        {edu.institution}
                      </span>
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded">
                        <Calendar className="w-3 h-3" />
                        {edu.duration}
                      </span>
                    </div>

                    <h4
                      className={`text-base sm:text-lg font-bold mb-1 ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {edu.degree}
                    </h4>

                    {/* Grade Badge */}
                    <div className="mb-3">
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                        {edu.grade}
                      </span>
                    </div>

                    {/* Highlights */}
                    <ul className="space-y-1.5">
                      {edu.highlights.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs leading-relaxed text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications Box */}
            <div className="pt-4">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-amber-400" />
                <h4
                  className={`text-sm font-bold uppercase tracking-wider ${
                    theme === 'dark' ? 'text-slate-300' : 'text-slate-700'
                  }`}
                >
                  Key Certifications & Focus Areas
                </h4>
              </div>

              <div className="space-y-2.5">
                {CERTIFICATIONS.map((cert) => (
                  <div
                    key={cert.id}
                    className={`p-3.5 rounded-xl border text-xs ${
                      theme === 'dark'
                        ? 'bg-slate-900/60 border-slate-800/90 text-slate-300'
                        : 'bg-white border-slate-200 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className={theme === 'dark' ? 'text-white' : 'text-slate-900'}>
                        {cert.title}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400">{cert.year}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{cert.focus}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
