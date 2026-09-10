import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { SkillsSection } from './components/SkillsSection';
import { ProjectsSection } from './components/ProjectsSection';
import { ExperienceEducationSection } from './components/ExperienceEducationSection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { CvModal } from './components/CvModal';

export default function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isCvModalOpen, setIsCvModalOpen] = useState(false);

  // Sync theme with body styling
  useEffect(() => {
    if (theme === 'dark') {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
      document.body.style.backgroundColor = '#020617'; // slate-950
      document.body.style.color = '#f8fafc'; // slate-50
    } else {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#0f172a'; // slate-900
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
      }`}
    >
      {/* Navigation Header */}
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        onOpenCv={() => setIsCvModalOpen(true)}
      />

      {/* Main Content Sections (1 through 6) */}
      <main className="flex-1">
        {/* 1. HERO SECTION - Pehla Impression */}
        <HeroSection
          theme={theme}
          onOpenCv={() => setIsCvModalOpen(true)}
        />

        {/* 2. ABOUT ME SECTION */}
        <AboutSection
          theme={theme}
          onOpenCv={() => setIsCvModalOpen(true)}
        />

        {/* 3. SKILLS SECTION */}
        <SkillsSection theme={theme} />

        {/* 4. PROJECTS SECTION - Sabse Important */}
        <ProjectsSection theme={theme} />

        {/* 5. EXPERIENCE / EDUCATION SECTION (Timeline style) */}
        <ExperienceEducationSection theme={theme} />

        {/* 6. CONTACT SECTION */}
        <ContactSection theme={theme} />
      </main>

      {/* 7. FOOTER */}
      <Footer theme={theme} />

      {/* Interactive Printable & Downloadable CV Modal */}
      <CvModal
        isOpen={isCvModalOpen}
        onClose={() => setIsCvModalOpen(false)}
        theme={theme}
      />
    </div>
  );
}

