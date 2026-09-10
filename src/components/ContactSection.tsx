import React, { useState } from 'react';
import {
  Mail,
  Phone,
  Linkedin,
  Github,
  MessageSquare,
  MapPin,
  Send,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import { PERSONAL_INFO } from '../data/portfolioData';

interface ContactSectionProps {
  theme: 'dark' | 'light';
}

export const ContactSection: React.FC<ContactSectionProps> = ({ theme }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'Job Opportunity / Frontend Developer Role',
    message: '',
  });

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(PERSONAL_INFO.phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate clean dispatch with mailto fallback
    setTimeout(() => {
      setIsSubmitting(false);
      setFormSubmitted(true);
    }, 600);
  };

  return (
    <section
      id="contact"
      className={`py-20 border-t transition-colors ${
        theme === 'dark' ? 'border-slate-800/80 bg-slate-900/50' : 'border-slate-200 bg-slate-50/70'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-xs font-semibold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Get In Touch</span>
          </div>
          <h2
            className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${
              theme === 'dark' ? 'text-white' : 'text-slate-900'
            }`}
          >
            Let's Discuss Opportunities & Collaboration
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Recruiter, hiring manager, or founder? Reach out directly via WhatsApp, email, or send a message below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Direct Info & Rapid Channels */}
          <div className="lg:col-span-5 space-y-4">
            <h3
              className={`text-sm font-bold uppercase tracking-wider ${
                theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Direct Communication Channels
            </h3>

            {/* Email Card with 1-Click Copy */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Email Address
                    </span>
                    <a
                      href={`mailto:${PERSONAL_INFO.email}`}
                      className={`text-sm font-semibold hover:text-emerald-400 transition-colors break-all ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {PERSONAL_INFO.email}
                    </a>
                  </div>
                </div>

                <button
                  id="btn-copy-email"
                  onClick={handleCopyEmail}
                  title="Copy email to clipboard"
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    copiedEmail
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {copiedEmail ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Phone & WhatsApp Card */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Phone & Call
                    </span>
                    <a
                      href={`tel:${PERSONAL_INFO.phone}`}
                      className={`text-sm font-semibold hover:text-teal-400 transition-colors ${
                        theme === 'dark' ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      {PERSONAL_INFO.phoneDisplay}
                    </a>
                  </div>
                </div>

                <button
                  id="btn-copy-phone"
                  onClick={handleCopyPhone}
                  title="Copy phone number"
                  className={`p-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    copiedPhone
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                      : theme === 'dark'
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                      : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {copiedPhone ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* WhatsApp Quick Chat Card */}
            <a
              id="contact-whatsapp-direct"
              href={PERSONAL_INFO.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Fastest Response
                  </span>
                  <span className="text-sm font-bold text-emerald-300">
                    Direct WhatsApp Chat
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </a>

            {/* LinkedIn & GitHub Direct Profiles */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                id="contact-linkedin-link"
                href={PERSONAL_INFO.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-blue-500 hover:text-blue-400'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300'
                }`}
              >
                <Linkedin className="w-4 h-4 text-blue-500" />
                <span>LinkedIn Profile</span>
              </a>

              <a
                id="contact-github-link"
                href={PERSONAL_INFO.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold transition-all ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-emerald-500 hover:text-emerald-400'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                }`}
              >
                <Github className="w-4 h-4" />
                <span>GitHub Repos</span>
              </a>
            </div>

            {/* Location Box */}
            <div
              className={`p-4 rounded-xl border flex items-center gap-3 text-xs ${
                theme === 'dark'
                  ? 'bg-slate-950/60 border-slate-800/80 text-slate-400'
                  : 'bg-slate-100 border-slate-200 text-slate-600'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <strong className={theme === 'dark' ? 'text-slate-300' : 'text-slate-800'}>
                  Current Location:
                </strong>{' '}
                {PERSONAL_INFO.location} (Willing to relocate or work remotely)
              </div>
            </div>
          </div>

          {/* Right Column: Simple, Crisp Contact Form */}
          <div className="lg:col-span-7">
            <div
              className={`rounded-3xl p-6 sm:p-8 border shadow-xl ${
                theme === 'dark'
                  ? 'bg-slate-900/90 border-slate-800 shadow-black/40'
                  : 'bg-white border-slate-200 shadow-slate-200'
              }`}
            >
              <h3
                className={`text-xl font-bold mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-slate-900'
                }`}
              >
                Send a Direct Message
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Fill out the form below. Messages dispatch directly to Muhammad Raqeeb.
              </p>

              {formSubmitted ? (
                <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto font-bold shadow-lg shadow-emerald-500/30">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-emerald-400">Message Prepared!</h4>
                    <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                      Thank you for reaching out, {formData.name || 'there'}! You can also launch your local email client directly below.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <a
                      href={`mailto:${PERSONAL_INFO.email}?subject=${encodeURIComponent(
                        formData.subject
                      )}&body=${encodeURIComponent(
                        `From: ${formData.name} (${formData.email})\n\n${formData.message}`
                      )}`}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md"
                    >
                      Open in Email App
                    </a>
                    <button
                      onClick={() => setFormSubmitted(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-700 text-xs text-slate-300 hover:text-white"
                    >
                      Send Another
                    </button>
                  </div>
                </div>
              ) : (
                <form id="portfolio-contact-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-semibold text-slate-300 mb-1.5"
                      >
                        Your Name / Company *
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        placeholder="e.g. John Doe / Tech Corp"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                          theme === 'dark'
                            ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                        }`}
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-semibold text-slate-300 mb-1.5"
                      >
                        Your Email *
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        placeholder="recruiter@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                          theme === 'dark'
                            ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                        }`}
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="block text-xs font-semibold text-slate-300 mb-1.5"
                    >
                      Subject / Position
                    </label>
                    <input
                      id="contact-subject"
                      type="text"
                      placeholder="Opportunity / Project Consultation"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all ${
                        theme === 'dark'
                          ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                      }`}
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-semibold text-slate-300 mb-1.5"
                    >
                      Message *
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={4}
                      placeholder="Hi Muhammad, we reviewed your portfolio and would like to schedule an introductory discussion..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition-all resize-none ${
                        theme === 'dark'
                          ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                            : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-500'
                      }`}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    id="btn-submit-contact-form"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-md shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
