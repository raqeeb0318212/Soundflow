import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Copy,
  Check,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Github,
  Award,
  GraduationCap,
  Briefcase,
  Code,
  Globe,
} from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';

interface CvModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
}

export const CvModal: React.FC<CvModalProps> = ({ isOpen, onClose, theme }) => {
  const [copiedText, setCopiedText] = useState(false);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const plainTextResume = `
MUHAMMAD RAQEEB
Computer Science Graduate | Frontend & Mobile Developer
Contact: +92 318 2121032 | raqeeb0318212@gmail.com
Location: Raiwind / Bhera, Punjab, Pakistan
LinkedIn: https://linkedin.com/in/raqeeb0318 | GitHub: https://github.com/raqeeb0318212

PROFESSIONAL SUMMARY:
Computer Science graduate with a 3.68/4.00 CGPA and hands-on project experience in Flutter app development, web fundamentals (HTML/CSS/React), Java, and AI/ML concepts. Strong foundation in problem-solving and software development, with a keen interest in building practical, user-focused applications.

EDUCATION:
- BS Computer Science (2022 – 2026), The University of Lahore | CGPA: 3.68 / 4.00
- Intermediate (FSc Pre-Medical) (2020 – 2022), Reader Group of Colleges, Bhera | 884 / 1100
- Matriculation (Science) (2018 – 2020), Govt. Islamia High School, Bhera | 943 / 1100

TECHNICAL PROJECTS:
1. Nexus — University Alumni Networking App (2026)
   Flutter / Dart | Firebase (Auth, Firestore, Storage, Messaging)
   - Built a cross-platform alumni networking app using Flutter with a Firebase backend.
   - Developed core modules: social feed with CRUD posts, real-time chat, job board, and event calendar.
   - Implemented secure authentication, dark mode, and customizable colorblind-friendly themes.

2. Fixit Bhera — On-Demand Services Platform (2026)
   React, TypeScript, Tailwind CSS, Vite
   - Fast, localized booking platform for verified doorstep repair technicians.
   - Urdu & English bilingual support with 1-click WhatsApp instant dispatch.

3. AgriScan — AI Leaf Pathogen Classifier (2025)
   Flutter, Python, TensorFlow Lite, OpenCV
   - On-device crop pathology detection with 94% validation accuracy.

EXPERIENCE:
Data Entry Associate — Freelance (1 Month, 2026)
- Performed accurate, high-volume data entry and record management for client Excel sheets, ensuring consistency and error-free reporting.
- Organized and maintained structured daily and monthly spreadsheets, improving data accessibility for reporting purposes.
- Communicated directly with the client to understand requirements and deliver work within tight turnaround times.

TECHNICAL PROFILE:
- Programming: Java, Dart, JavaScript, TypeScript
- Web: HTML5, CSS3, React, Tailwind CSS
- Mobile: Flutter
- AI / ML: Machine learning fundamentals and academic project work
- Dev Tools: Git, GitHub, VS Code, Android Studio
- Languages: English (Professional), Urdu (Native)
`.trim();

    navigator.clipboard.writeText(plainTextResume);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  return (
    <div
      id="cv-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
    >
      <div
        className={`w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden my-auto ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Top Control Bar (No Print) */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-950/60 no-print">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Verified Candidate Curriculum Vitae
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Print / Save PDF Button */}
            <button
              id="btn-print-cv"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            {/* Copy Plain Text for ATS */}
            <button
              id="btn-copy-cv-text"
              onClick={handleCopyText}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedText ? 'Copied ATS Text!' : 'Copy Text'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Resume Content (Formatted identically to Muhammad Raqeeb's Verified CV) */}
        <div className="p-6 sm:p-10 overflow-y-auto bg-white text-slate-900 cv-printable">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-950 uppercase">
                  Muhammad Raqeeb
                </h1>
                <p className="text-sm font-bold text-slate-700 mt-0.5">
                  Computer Science Graduate • Frontend & Mobile Developer
                </p>
              </div>

              {/* Direct Contacts */}
              <div className="text-xs text-slate-700 space-y-1 sm:text-right">
                <p className="font-semibold">+92 318 2121032</p>
                <p className="font-semibold text-emerald-700">raqeeb0318212@gmail.com</p>
                <p>Raiwind / Bhera, Punjab, Pakistan</p>
                <p className="text-[11px] font-mono">
                  linkedin.com/in/raqeeb0318 • github.com/raqeeb0318212
                </p>
              </div>
            </div>
          </div>

          {/* 2-Column CV Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Left Column: Summary, Projects, Experience */}
            <div className="md:col-span-8 space-y-6">
              {/* Professional Summary */}
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-2">
                  Professional Summary
                </h2>
                <p className="text-xs leading-relaxed text-slate-700">
                  Computer Science graduate with a <strong>3.68/4.00 CGPA</strong> and hands-on project experience in Flutter app development, web fundamentals (HTML, CSS, React), Java, and AI/ML concepts. Strong foundation in problem-solving and software development, with a keen interest in building practical, user-focused applications.
                </p>
              </div>

              {/* Technical Projects */}
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-3">
                  Technical Projects
                </h2>

                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-950">
                        Nexus — University Alumni Networking App
                      </h3>
                      <span className="text-[11px] font-mono text-slate-500">2026</span>
                    </div>
                    <p className="text-[11px] font-medium text-emerald-700 mb-1">
                      Flutter / Dart | Firebase (Auth, Firestore, Storage, Cloud Messaging)
                    </p>
                    <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                      <li>Built a cross-platform alumni networking app using Flutter with a Firebase backend.</li>
                      <li>Developed core modules: social feed with CRUD posts, real-time chat, job board, and event calendar.</li>
                      <li>Implemented secure authentication, dark mode, and customizable colorblind-friendly themes.</li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-950">
                        Fixit Bhera — On-Demand Services Platform
                      </h3>
                      <span className="text-[11px] font-mono text-slate-500">2026</span>
                    </div>
                    <p className="text-[11px] font-medium text-emerald-700 mb-1">
                      React, TypeScript, Tailwind CSS, Vite
                    </p>
                    <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                      <li>Engineered a high-performance booking marketplace for verified home repair technicians.</li>
                      <li>Implemented English & Urdu bilingual localization with instant WhatsApp dispatch.</li>
                    </ul>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-slate-950">
                        AgriScan — AI Crop Disease Classifier
                      </h3>
                      <span className="text-[11px] font-mono text-slate-500">2025</span>
                    </div>
                    <p className="text-[11px] font-medium text-emerald-700 mb-1">
                      Flutter, Python, TensorFlow Lite, OpenCV
                    </p>
                    <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside">
                      <li>On-device machine learning diagnostic tool detecting leaf pathologies with 94% validation accuracy.</li>
                      <li>Delivered localized organic and chemical remedy workflows for smallholder farmers.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Work Experience */}
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-2">
                  Experience
                </h2>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-950">
                      Data Entry Associate — Freelance
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500">1 Month, 2026</span>
                  </div>
                  <ul className="text-xs text-slate-700 space-y-1 list-disc list-inside mt-1">
                    <li>Performed accurate, high-volume data entry and record management for client Excel sheets, ensuring consistency and error-free reporting.</li>
                    <li>Organized and maintained structured daily and monthly spreadsheets, improving data accessibility.</li>
                    <li>Communicated directly with the client to understand requirements and deliver work within tight turnaround times.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column: Education & Technical Profile */}
            <div className="md:col-span-4 space-y-6">
              {/* Education */}
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-2">
                  Education
                </h2>

                <div className="space-y-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-950">BS Computer Science</h3>
                    <p className="text-xs text-slate-700">The University of Lahore</p>
                    <p className="text-[11px] text-slate-500">2022 – 2026</p>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">CGPA: 3.68 / 4.00</p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-950">Intermediate (FSc Pre-Medical)</h3>
                    <p className="text-xs text-slate-700">Reader Group of Colleges, Bhera</p>
                    <p className="text-[11px] text-slate-500">2020 – 2022</p>
                    <p className="text-xs font-semibold text-slate-800">884 / 1100 (Grade A+)</p>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-slate-950">Matriculation (Science)</h3>
                    <p className="text-xs text-slate-700">Govt. Islamia High School, Bhera</p>
                    <p className="text-[11px] text-slate-500">2018 – 2020</p>
                    <p className="text-xs font-semibold text-slate-800">943 / 1100 (Grade A+)</p>
                  </div>
                </div>
              </div>

              {/* Technical Profile */}
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-2">
                  Technical Profile
                </h2>
                <div className="text-xs space-y-1.5 text-slate-700">
                  <p><strong>Programming:</strong> Java, Dart, JavaScript, TypeScript</p>
                  <p><strong>Web:</strong> HTML5, CSS3, React, Tailwind CSS</p>
                  <p><strong>Mobile:</strong> Flutter / Dart</p>
                  <p><strong>AI / ML:</strong> ML fundamentals & OpenCV</p>
                  <p><strong>Dev Tools:</strong> Git, GitHub, VS Code, Figma</p>
                </div>
              </div>

              {/* Languages */}
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-1">
                  Languages
                </h2>
                <p className="text-xs text-slate-700">
                  ● English (Professional) <br />
                  ● Urdu (Native)
                </p>
              </div>

              {/* Objective */}
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-1 mb-1">
                  Professional Objective
                </h2>
                <p className="text-xs leading-relaxed text-slate-600">
                  Seeking an entry-level technical role where I can apply my programming and software development skills, contribute to real-world applications, and grow through continuous learning and collaboration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
