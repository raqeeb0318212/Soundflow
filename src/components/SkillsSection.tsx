import React, { useState } from 'react';
import {
  Code,
  Layout,
  Smartphone,
  Terminal,
  Users,
  CheckCircle2,
  Sparkles,
  Layers,
} from 'lucide-react';
import { SKILL_CATEGORIES } from '../data/portfolioData';

interface SkillsSectionProps {
  theme: 'dark' | 'light';
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ theme }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getCategoryIcon = (id: string) => {
    switch (id) {
      case 'frontend':
        return <Layout className="w-5 h-5 text-emerald-400" />;
      case 'mobile-core':
        return <Smartphone className="w-5 h-5 text-teal-400" />;
      case 'tools':
        return <Terminal className="w-5 h-5 text-sky-400" />;
      case 'soft-skills':
        return <Users className="w-5 h-5 text-amber-400" />;
      default:
        return <Layers className="w-5 h-5 text-emerald-400" />;
    }
  };

  const filteredCategories =
    selectedCategory === 'all'
      ? SKILL_CATEGORIES
      : SKILL_CATEGORIES.filter((c) => c.id === selectedCategory);

  return (
    <section
      id="skills"
      className={`py-20 border-t transition-colors ${
        theme === 'dark' ? 'border-slate-800/80 bg-slate-950' : 'border-slate-200 bg-white'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Technical & Professional Capabilities</span>
            </div>
            <h2
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              Skills & Tech Stack
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Categorized proficiency benchmarks based on production projects, university coursework, and continuous practice.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-slate-800 bg-slate-900/50">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All (19)
            </button>
            {SKILL_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat.title.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className={`rounded-2xl p-6 sm:p-7 border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                theme === 'dark'
                  ? 'bg-slate-900/70 border-slate-800 hover:border-slate-700 shadow-black/30'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 shadow-slate-100'
              }`}
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-slate-800/60">
                <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                  {getCategoryIcon(category.id)}
                </div>
                <div>
                  <h3
                    className={`font-bold text-lg ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {category.title}
                  </h3>
                  <p className="text-xs text-slate-400">{category.description}</p>
                </div>
              </div>

              {/* Skills List with % Bars and Badges */}
              <div className="space-y-4 pt-2">
                {category.skills.map((skill) => (
                  <div key={skill.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold ${
                            theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                          }`}
                        >
                          {skill.name}
                        </span>
                        {skill.highlight && (
                          <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                            Core
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-slate-400">
                          {skill.level}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-emerald-400">
                          {skill.percentage}%
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div
                      className={`w-full h-2 rounded-full overflow-hidden ${
                        theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'
                      }`}
                    >
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                        style={{ width: `${skill.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Quick Recruiter Callout Banner */}
        <div
          className={`mt-10 rounded-2xl p-5 border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            theme === 'dark'
              ? 'bg-slate-900/40 border-slate-800 text-slate-300'
              : 'bg-emerald-50/50 border-emerald-200 text-slate-800'
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-xs sm:text-sm">
              Solid theoretical foundation in Algorithms & OOP backed by real hands-on GitHub project repositories.
            </span>
          </div>
          <a
            href="https://github.com/raqeeb0318212"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-emerald-500 hover:text-emerald-400 whitespace-nowrap underline underline-offset-4"
          >
            Inspect GitHub Code Repositories &rarr;
          </a>
        </div>
      </div>
    </section>
  );
};
