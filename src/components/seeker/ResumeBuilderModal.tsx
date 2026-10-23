import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Printer, Download, Sparkles, Check, FileText } from 'lucide-react';

export const ResumeBuilderModal: React.FC = () => {
  const { isResumeBuilderOpen, setIsResumeBuilderOpen, user } = useApp();
  const [template, setTemplate] = useState<'minimal' | 'modern' | 'executive'>('minimal');
  const [copied, setCopied] = useState(false);

  if (!isResumeBuilderOpen) return null;

  const handleCopyText = () => {
    const text = `
${user.fullName.toUpperCase()}
${user.headline}
${user.email} | ${user.phone} | ${user.location}
${user.links.github ? `GitHub: ${user.links.github}` : ''} ${user.links.linkedin ? `| LinkedIn: ${user.links.linkedin}` : ''}

SUMMARY
${user.bio}

CORE TECHNICAL SKILLS
${user.skills.join(', ')}

EXPERIENCE
${user.experience
  .map(
    (e) => `• ${e.role} — ${e.company} (${e.startDate} - ${e.endDate || 'Present'})
  ${e.description}`
  )
  .join('\n')}

PROJECTS
${user.projects
  .map(
    (p) => `• ${p.title}: ${p.description}
  Technologies: ${p.technologies.join(', ')}`
  )
  .join('\n')}

EDUCATION
${user.education
  .map((ed) => `• ${ed.degree} — ${ed.institution} (${ed.startYear} - ${ed.endYear}) ${ed.grade ? `[${ed.grade}]` : ''}`)
  .join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl text-neutral-100 flex flex-col max-h-[92vh]">
        {/* Top bar */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-950">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-sm text-white">In-App Resume Builder</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Template picker */}
            <div className="flex bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-xs">
              <button
                onClick={() => setTemplate('minimal')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  template === 'minimal' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400'
                }`}
              >
                Minimal
              </button>
              <button
                onClick={() => setTemplate('modern')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  template === 'modern' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400'
                }`}
              >
                Modern
              </button>
            </div>

            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-200 flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Text'}
            </button>

            <button
              onClick={() => setIsResumeBuilderOpen(false)}
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Paper Document Preview */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-neutral-950 flex justify-center">
          <div className="w-full max-w-2xl bg-white text-neutral-900 p-8 sm:p-10 rounded-xl shadow-lg font-sans text-xs space-y-5 leading-normal">
            {/* Header */}
            <div className="border-b border-neutral-200 pb-4 text-center sm:text-left">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-950 font-display">
                {user.fullName}
              </h1>
              <p className="text-sm font-medium text-blue-600 mt-0.5">{user.headline}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-3 gap-y-1 text-neutral-600 text-[11px] mt-2">
                <span>{user.email}</span>
                <span>·</span>
                <span>{user.phone}</span>
                <span>·</span>
                <span>{user.location}</span>
                {user.links.portfolio && (
                  <>
                    <span>·</span>
                    <span className="text-blue-600 font-mono">{user.links.portfolio}</span>
                  </>
                )}
              </div>
            </div>

            {/* Summary */}
            {user.bio && (
              <div className="space-y-1">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 font-display border-b border-neutral-100 pb-1">
                  Professional Profile
                </h2>
                <p className="text-neutral-700 leading-relaxed text-[11.5px]">{user.bio}</p>
              </div>
            )}

            {/* Skills */}
            <div className="space-y-1.5">
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 font-display border-b border-neutral-100 pb-1">
                Technical Expertise
              </h2>
              <p className="text-neutral-800 text-[11.5px]">
                <strong className="font-semibold">Core Competencies:</strong>{' '}
                {user.skills.join(', ')}
              </p>
            </div>

            {/* Experience */}
            {user.experience.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 font-display border-b border-neutral-100 pb-1">
                  Experience
                </h2>
                {user.experience.map((exp) => (
                  <div key={exp.id} className="space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-neutral-900 text-[12px]">{exp.role}</span>
                      <span className="text-neutral-500 text-[11px] font-mono">
                        {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <div className="text-neutral-600 text-[11px]">{exp.company} · {exp.location}</div>
                    <p className="text-neutral-700 text-[11px] mt-1 leading-relaxed">
                      {exp.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {user.projects.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 font-display border-b border-neutral-100 pb-1">
                  Key Engineering Projects
                </h2>
                {user.projects.map((proj) => (
                  <div key={proj.id} className="space-y-0.5">
                    <div className="flex justify-between items-baseline">
                      <span className="font-bold text-neutral-900 text-[12px]">{proj.title}</span>
                      {proj.technologies && (
                        <span className="text-neutral-500 text-[10.5px]">
                          {proj.technologies.join(', ')}
                        </span>
                      )}
                    </div>
                    <p className="text-neutral-700 text-[11px] leading-relaxed">{proj.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Education */}
            {user.education.length > 0 && (
              <div className="space-y-2">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-800 font-display border-b border-neutral-100 pb-1">
                  Education
                </h2>
                {user.education.map((edu) => (
                  <div key={edu.id} className="flex justify-between items-baseline">
                    <div>
                      <div className="font-bold text-neutral-900 text-[11.5px]">{edu.degree}</div>
                      <div className="text-neutral-600 text-[11px]">{edu.institution} {edu.grade ? `(${edu.grade})` : ''}</div>
                    </div>
                    <span className="text-neutral-500 text-[11px] font-mono">
                      {edu.startYear} – {edu.endYear}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
