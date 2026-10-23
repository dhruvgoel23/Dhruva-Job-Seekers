import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { CoverLetterTone } from '../../types';
import { X, Sparkles, Copy, Check, Send, RotateCw, FileText, CheckCircle2 } from 'lucide-react';

export const CoverLetterModal: React.FC = () => {
  const {
    isCoverLetterModalOpen,
    setIsCoverLetterModalOpen,
    coverLetterJob,
    user,
    applyToJob,
    applications,
  } = useApp();

  const [tone, setTone] = useState<CoverLetterTone>('minimalist');
  const [letterContent, setLetterContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  // Generate on initial open or tone switch
  useEffect(() => {
    if (isCoverLetterModalOpen && coverLetterJob) {
      generateLetter(tone);
      setAppliedSuccess(false);
    }
  }, [isCoverLetterModalOpen, coverLetterJob, tone]);

  const generateLetter = async (selectedTone: CoverLetterTone) => {
    if (!coverLetterJob) return;

    const initialText =
      selectedTone === 'impact_metrics'
        ? `Dear ${coverLetterJob.companyName} Hiring Team,\n\nI am writing to submit my candidacy for the ${coverLetterJob.title} role. Across my recent engineering projects, I have focused on high-throughput performance—optimizing client bundle latency by over 30%, refactoring state stores to sub-16ms render budgets, and deploying containerized microservices using ${user.skills.slice(0, 3).join(', ')}.\n\n${coverLetterJob.companyName}'s engineering culture of technical precision and scale strongly matches my passion for measurable impact. I look forward to bringing this analytical discipline to your roadmap.\n\nBest regards,\n${user.fullName}`
        : selectedTone === 'conversational'
        ? `Hi ${coverLetterJob.companyName} Team,\n\nI've been following ${coverLetterJob.companyName}'s work and couldn't be more excited to apply for the ${coverLetterJob.title} position. As someone who deeply values both clean system design and effortless user experience, I love tackling ambiguous problems and building software that genuinely helps people.\n\nMy background spans ${user.skills.slice(0, 4).join(', ')}, and I thrive in collaborative teams that balance speed with craftsmanship. I'd love to chat about how I can contribute to what you're building next!\n\nWarmly,\n${user.fullName}`
        : `Dear ${coverLetterJob.companyName} Hiring Team,\n\nI am writing to express my strong enthusiasm for the ${coverLetterJob.title} position at ${coverLetterJob.companyName}. With a focus on building accessible, high-performance web products and hands-on expertise in ${user.skills.slice(0, 4).join(', ')}, I am confident in my ability to make an immediate impact on your engineering initiatives.\n\n${coverLetterJob.companyName}'s standard for technical rigor and user empathy strongly aligns with my own engineering ethos. I would welcome the opportunity to discuss how my technical expertise can contribute to your team.\n\nWarm regards,\n${user.fullName}`;

    setLetterContent(initialText);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/ai/cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle: coverLetterJob.title,
          companyName: coverLetterJob.companyName,
          seekerName: user.fullName,
          skills: user.skills,
          experienceSummary: user.bio,
          tone: selectedTone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.coverLetter) {
          setLetterContent(data.coverLetter);
        }
      }
    } catch (err) {
      console.warn('Cover letter API fallback active');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(letterContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAttachAndApply = () => {
    if (!coverLetterJob) return;
    applyToJob(coverLetterJob.id, letterContent);
    setAppliedSuccess(true);
    setTimeout(() => {
      setIsCoverLetterModalOpen(false);
    }, 1200);
  };

  if (!isCoverLetterModalOpen || !coverLetterJob) return null;

  const isAlreadyApplied = applications.some((a) => a.jobId === coverLetterJob.id);
  const wordCount = letterContent.trim().split(/\s+/).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl text-neutral-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-950">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-white">AI Cover Letter Generator</h3>
              <p className="text-[11px] text-neutral-400">
                {coverLetterJob.title} · {coverLetterJob.companyName}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCoverLetterModalOpen(false)}
            className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Tone Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
              Aesthetic & Tone
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'minimalist', label: 'Apple Minimalist' },
                { id: 'impact_metrics', label: 'Impact & Metrics' },
                { id: 'conversational', label: 'Conversational' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTone(t.id as CoverLetterTone)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-medium border text-center transition-all ${
                    tone === t.id
                      ? 'bg-purple-600/15 border-purple-500 text-purple-300'
                      : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Context chips */}
          <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800/80 space-y-1.5">
            <div className="flex justify-between text-[11px] text-neutral-400">
              <span>Candidate: <strong className="text-white">{user.fullName}</strong></span>
              <span>Matched Skills: <strong className="text-purple-400 font-mono">{user.skills.slice(0, 3).join(', ')}</strong></span>
            </div>
          </div>

          {/* Letter text area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] text-neutral-400">
              <span className="font-semibold text-neutral-300">Editable Cover Letter</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-neutral-500">{wordCount} words</span>
                <button
                  onClick={() => generateLetter(tone)}
                  disabled={isGenerating}
                  className="text-purple-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <RotateCw className={`w-3 h-3 ${isGenerating ? 'animate-spin' : ''}`} />
                  Regenerate
                </button>
              </div>
            </div>

            <textarea
              rows={8}
              value={letterContent}
              onChange={(e) => setLetterContent(e.target.value)}
              disabled={isGenerating}
              placeholder="Generating personalized cover letter with Gemini 3.8 Flash..."
              className="w-full p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs leading-relaxed focus:outline-none focus:border-purple-500 font-sans"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="flex-1 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard' : 'Copy Text'}
            </button>

            {appliedSuccess || isAlreadyApplied ? (
              <div className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Already Applied
              </div>
            ) : (
              <button
                type="button"
                onClick={handleAttachAndApply}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-purple-600/20 active:scale-[0.98]"
              >
                <Send className="w-3.5 h-3.5" /> Attach & Apply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
