import React, { useState } from 'react';
import {
  ExternalLink,
  Github,
  Sparkles,
  CheckCircle2,
  Layers,
  Smartphone,
  Layout,
  Cpu,
  Info,
  X,
} from 'lucide-react';
import { PROJECTS } from '../data/portfolioData';
import { Project } from '../types';

interface ProjectsSectionProps {
  theme: 'dark' | 'light';
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ theme }) => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const categories = ['all', 'Mobile App', 'Frontend Web', 'AI / Machine Learning', 'Full Stack'];

  const filteredProjects =
    activeCategoryFilter === 'all'
      ? PROJECTS
      : PROJECTS.filter((p) => p.category === activeCategoryFilter);

  return (
    <section
      id="projects"
      className={`py-20 border-t transition-colors ${
        theme === 'dark' ? 'border-slate-800/80 bg-slate-900/40' : 'border-slate-200 bg-slate-50/70'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Featured Engineering Work</span>
            </div>
            <h2
              className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}
            >
              Projects & Case Studies
            </h2>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Production-ready mobile applications, web platforms, and machine learning utilities demonstrating practical problem solving.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl border border-slate-800 bg-slate-900/60">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeCategoryFilter === cat
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'all' ? 'All (4)' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid (Adhering strictly to the 5 requested elements per project) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredProjects.map((project) => (
            <article
              key={project.id}
              id={`project-card-${project.id}`}
              className={`group flex flex-col rounded-3xl border overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${
                theme === 'dark'
                  ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-black/40'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-slate-200'
              }`}
            >
              {/* 1. Project Thumbnail / Mockup with Category Pill */}
              <div className="relative h-56 w-full overflow-hidden bg-slate-950">
                <img
                  src={project.thumbnailUrl}
                  alt={`${project.name} preview thumbnail`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  loading="lazy"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

                {/* Top Badge: Category & Year */}
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/90 backdrop-blur-md text-emerald-400 border border-slate-700 shadow-sm">
                    {project.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono text-slate-300 bg-slate-900/90 backdrop-blur-md border border-slate-800">
                    {project.year}
                  </span>
                </div>

                {/* Quick Metrics Overlay at bottom of image */}
                {project.metrics && (
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-[11px] font-semibold text-slate-200 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/10 inline-block truncate max-w-full">
                      ⚡ {project.metrics}
                    </span>
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between">
                <div>
                  {/* 2. Project Name + 1 Line Problem Statement */}
                  <h3
                    className={`text-xl font-bold mb-2 group-hover:text-emerald-400 transition-colors ${
                      theme === 'dark' ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {project.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-4">
                    <strong className={theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}>
                      Problem Solved:
                    </strong>{' '}
                    {project.oneLiner}
                  </p>

                  {/* 3. Tech Stack Used (Badges) */}
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${
                          theme === 'dark'
                            ? 'bg-slate-950/70 border-slate-800 text-slate-300'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* 4. What I Did (2-3 crisp bullet points) */}
                  <div className="space-y-2 mb-6 pt-4 border-t border-slate-800/60">
                    <span
                      className={`text-xs font-bold uppercase tracking-wider block ${
                        theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
                      }`}
                    >
                      Key Contributions:
                    </span>
                    <ul className="space-y-1.5">
                      {project.whatIDid.map((point, index) => (
                        <li key={index} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
                            {point}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 5. 2 Action Links: Live Demo + GitHub Code (+ Architecture Deep Dive) */}
                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {/* Live Demo Link */}
                    {project.liveDemoUrl && (
                      <a
                        id={`btn-live-${project.id}`}
                        href={project.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Live Demo</span>
                      </a>
                    )}

                    {/* GitHub Code Link */}
                    <a
                      id={`btn-github-${project.id}`}
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
                        theme === 'dark'
                          ? 'border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub Code</span>
                    </a>
                  </div>

                  {/* Architecture Details Modal Trigger */}
                  <button
                    onClick={() => setSelectedProject(project)}
                    className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5" />
                    <span>Deep Dive</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Interactive Project Architecture Deep Dive Modal */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border p-6 sm:p-8 relative shadow-2xl ${
              theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedProject(null)}
              className="absolute top-6 right-6 p-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Content */}
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  {selectedProject.category} • {selectedProject.year}
                </span>
                <h3 className="text-2xl font-black mt-1">{selectedProject.name}</h3>
                <p className="text-sm text-slate-400 mt-2">{selectedProject.oneLiner}</p>
              </div>

              {/* Tech Stack */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Technology Stack
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedProject.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Key Implementation Points */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Full Implementation Breakdown
                </h4>
                <ul className="space-y-2">
                  {selectedProject.whatIDid.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Architecture Highlights */}
              {selectedProject.architectureHighlights && (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    <span>Technical Architecture Highlights</span>
                  </h4>
                  <ul className="space-y-1.5">
                    {selectedProject.architectureHighlights.map((arch, i) => (
                      <li key={i} className="text-xs text-slate-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>{arch}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-800">
                {selectedProject.liveDemoUrl && (
                  <a
                    href={selectedProject.liveDemoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open Live Demo</span>
                  </a>
                )}
                <a
                  href={selectedProject.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-200 font-bold text-sm"
                >
                  <Github className="w-4 h-4" />
                  <span>Inspect GitHub Repo</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
