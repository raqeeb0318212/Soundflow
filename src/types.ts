export type ThemeMode = 'dark' | 'light';

export interface Project {
  id: string;
  name: string;
  oneLiner: string;
  category: 'Mobile App' | 'Frontend Web' | 'Full Stack' | 'AI / Machine Learning';
  year: string;
  featured: boolean;
  techStack: string[];
  whatIDid: string[];
  thumbnailUrl: string;
  mockupAccent: string;
  liveDemoUrl?: string;
  githubUrl: string;
  metrics?: string;
  architectureHighlights?: string[];
}

export interface SkillItem {
  name: string;
  level: string; // e.g., 'Advanced', 'Proficient', 'Core'
  percentage: number;
  highlight?: boolean;
  iconName?: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  skills: SkillItem[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  duration: string;
  type: 'Internship' | 'Freelance' | 'Open Source';
  bullets: string[];
  technologies: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  duration: string;
  grade: string;
  highlights: string[];
}

export interface CertificationItem {
  id: string;
  title: string;
  issuer: string;
  year: string;
  focus: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

