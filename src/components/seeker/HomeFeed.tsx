import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobPosting } from '../../types';
import {
  MapPin,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Bookmark,
  Sparkles,
  Send,
  CheckCircle2,
  Building,
  Clock,
  Compass,
  FileText,
  DollarSign,
  X,
  Bell,
  Zap,
} from 'lucide-react';

export const HomeFeed: React.FC = () => {
  const {
    jobs,
    user,
    selectedJob,
    setSelectedJob,
    savedJobIds,
    toggleSaveJob,
    applyToJob,
    applications,
    isLocationEnabled,
    toggleLocation,
    currentLocationName,
    setIsBiometricModalOpen,
    setIsResumeModalOpen,
    setIsNotificationModalOpen,
    unreadNotificationsCount,
    recommendedRankings,
    setIsCoverLetterModalOpen,
    setCoverLetterJob,
  } = useApp();

  const [feedTab, setFeedTab] = useState<'for_you' | 'nearby' | 'all'>('for_you');
  const [activeDetailJob, setActiveDetailJob] = useState<JobPosting | null>(null);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [screeningAnswer, setScreeningAnswer] = useState<string>('');
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);

  // Filter jobs by tab
  const displayedJobs = React.useMemo(() => {
    if (feedTab === 'for_you') {
      return recommendedRankings.map((r) => r.job);
    }
    if (feedTab === 'nearby') {
      return jobs.filter((j) =>
        j.location.toLowerCase().includes('bangalore') || j.workMode === 'remote'
      );
    }
    return jobs;
  }, [feedTab, recommendedRankings, jobs]);

  const handleApplyClick = (job: JobPosting) => {
    setActiveDetailJob(job);
    setAppliedSuccess(false);
    setScreeningAnswer('');
  };

  const handleOpenCoverLetterGenerator = (job: JobPosting, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCoverLetterJob(job);
    setIsCoverLetterModalOpen(true);
  };

  const handleSubmitApplication = () => {
    if (!activeDetailJob) return;
    setIsApplying(true);
    setTimeout(() => {
      applyToJob(
        activeDetailJob.id,
        undefined,
        screeningAnswer ? { answer: screeningAnswer } : undefined
      );
      setIsApplying(false);
      setAppliedSuccess(true);
    }, 600);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20 px-4 pt-3 space-y-4 no-scrollbar">
      {/* Top Greeting & Notification Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[11px] font-medium text-neutral-400">Welcome back</span>
          <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            {user.fullName.split(' ')[0]}
            {user.isIdentityVerified && (
              <span title="Identity Verified">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400 inline" />
              </span>
            )}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Location Toggle Chip */}
          <button
            onClick={() => toggleLocation(!isLocationEnabled)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors ${
              isLocationEnabled
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span className="max-w-[110px] truncate">{isLocationEnabled ? 'Bangalore' : 'Location Off'}</span>
          </button>

          {/* Notification Bell Button */}
          <button
            onClick={() => setIsNotificationModalOpen(true)}
            className="relative p-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-white transition-colors"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-600 text-white font-mono text-[9px] font-bold flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Profile Completeness Card (if < 100%) */}
      {user.completenessScore < 100 && (
        <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800/80 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">Profile Strength</span>
            <span className="font-mono text-blue-400 font-bold">{user.completenessScore}%</span>
          </div>

          <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${user.completenessScore}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-0.5">
            <span>
              {!user.isIdentityVerified
                ? 'Complete facial verification'
                : 'Upload or refresh parsed resume'}
            </span>
            <button
              onClick={() => {
                if (!user.isIdentityVerified) {
                  setIsBiometricModalOpen(true);
                } else {
                  setIsResumeModalOpen(true);
                }
              }}
              className="text-blue-400 hover:text-blue-300 font-medium"
            >
              Finish →
            </button>
          </div>
        </div>
      )}

      {/* Feed Tabs: For You (AI Match) | Nearby | All */}
      <div className="flex bg-neutral-900 p-0.5 rounded-2xl border border-neutral-800 text-xs">
        <button
          onClick={() => setFeedTab('for_you')}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 ${
            feedTab === 'for_you'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          For You (AI Match)
        </button>
        <button
          onClick={() => setFeedTab('nearby')}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 ${
            feedTab === 'nearby'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          Jobs Near Me
        </button>
        <button
          onClick={() => setFeedTab('all')}
          className={`flex-1 py-1.5 rounded-xl font-medium transition-all flex items-center justify-center gap-1.5 ${
            feedTab === 'all'
              ? 'bg-neutral-800 text-white shadow-sm'
              : 'text-neutral-400 hover:text-white'
          }`}
        >
          All Postings
        </button>
      </div>

      {/* Jobs List */}
      <div className="space-y-2.5">
        {displayedJobs.map((job) => {
          const isApplied = applications.some((a) => a.jobId === job.id);
          const isSaved = savedJobIds.includes(job.id);
          const ranking = recommendedRankings.find((r) => r.job.id === job.id);
          const matchBreakdown = ranking?.match;

          return (
            <div
              key={job.id}
              onClick={() => handleApplyClick(job)}
              className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700/80 transition-all cursor-pointer space-y-2 group"
            >
              {/* Title & Trust Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                      {job.title}
                    </span>
                    {job.trustBadge === 'verified_company' && (
                      <span title="Verified Company">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      </span>
                    )}
                    {job.trustBadge === 'caution' && (
                      <span title="Caution Note">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate">
                    {job.companyName}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* AI Match Badge */}
                  {matchBreakdown && feedTab === 'for_you' && (
                    <span className="font-mono text-[10px] font-bold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full">
                      {matchBreakdown.overallScore}% Match
                    </span>
                  )}

                  {/* Bookmark */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSaveJob(job.id);
                    }}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isSaved
                        ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                        : 'border-transparent text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                  </button>
                </div>
              </div>

              {/* Unboxed Metadata (Zero-Pill Discipline) */}
              <div className="flex items-center gap-2 text-[11px] text-neutral-400 flex-wrap">
                <span className="text-white font-mono font-medium">{job.salary.displayString}</span>
                <span aria-hidden="true">·</span>
                <span>{job.location.split(',')[0]}</span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{job.workMode}</span>
                <span aria-hidden="true">·</span>
                <span>{job.source}</span>
              </div>

              {/* Explainable AI match reason tag */}
              {matchBreakdown && matchBreakdown.reasons.length > 0 && feedTab === 'for_you' && (
                <div className="text-[10.5px] text-purple-300/90 bg-purple-500/10 p-1.5 rounded-lg border border-purple-500/20 flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                  <span className="truncate">{matchBreakdown.reasons[0]}</span>
                </div>
              )}

              {/* Skills strip & Cover letter shortcut */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex flex-wrap gap-1">
                  {job.skillsRequired.slice(0, 3).map((skill, i) => (
                    <span
                      key={i}
                      className="text-[10px] text-neutral-400 bg-neutral-950 px-2 py-0.5 rounded-md border border-neutral-800"
                    >
                      {skill}
                    </span>
                  ))}
                  {job.skillsRequired.length > 3 && (
                    <span className="text-[10px] text-neutral-500 px-1 py-0.5">
                      +{job.skillsRequired.length - 3}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={(e) => handleOpenCoverLetterGenerator(job, e)}
                  className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                >
                  <FileText className="w-3 h-3" /> Cover Letter
                </button>
              </div>

              {/* Applied status kicker */}
              {isApplied && (
                <div className="pt-0.5 flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Applied
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Scam Detection Warning Showcase */}
      {jobs.some((j) => j.trustBadge === 'caution') && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Fraud Prevention Radar</span>
          </div>

          {jobs
            .filter((j) => j.trustBadge === 'caution')
            .map((job) => (
              <div
                key={job.id}
                onClick={() => handleApplyClick(job)}
                className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500/30 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-semibold text-amber-200">{job.title}</span>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-medium">
                    Risk {job.riskScore}%
                  </span>
                </div>
                <p className="text-[11px] text-neutral-400">
                  {job.companyName} · {job.contactEmail}
                </p>
                <p className="text-[10.5px] text-amber-400/90 leading-tight">
                  Caution: {job.riskFactors[0] || 'Unverified recruiter with high risk indicators'}
                </p>
              </div>
            ))}
        </div>
      )}

      {/* Job Detail Slide-up Sheet Modal */}
      {activeDetailJob && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-[400px] bg-neutral-900 border-t border-neutral-800 rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden text-neutral-100 shadow-2xl">
            {/* Grab handle */}
            <div className="w-10 h-1 bg-neutral-700 rounded-full mx-auto my-2.5 shrink-0" />

            {/* Header */}
            <div className="px-5 py-2 border-b border-neutral-800 flex items-start justify-between shrink-0">
              <div className="space-y-0.5 pr-2">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white">{activeDetailJob.title}</h3>
                  {activeDetailJob.trustBadge === 'verified_company' && (
                    <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0" />
                  )}
                </div>
                <div className="text-xs text-neutral-400">
                  {activeDetailJob.companyName} · {activeDetailJob.location}
                </div>
              </div>
              <button
                onClick={() => setActiveDetailJob(null)}
                className="p-1 rounded-full text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable details */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Trust & Risk Banner */}
              {activeDetailJob.trustBadge === 'caution' ? (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 space-y-1">
                  <div className="font-semibold flex items-center gap-1 text-[11.5px]">
                    <AlertTriangle className="w-3.5 h-3.5" /> High Risk Factors Detected
                  </div>
                  <ul className="list-disc list-inside text-[11px] text-neutral-300 space-y-0.5">
                    {activeDetailJob.riskFactors.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] flex items-center justify-between">
                  <span className="flex items-center gap-1 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                    Verified Employer on Dhruva
                  </span>
                  <span className="font-mono text-neutral-400">{activeDetailJob.source}</span>
                </div>
              )}

              {/* Salary & Details */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-950 rounded-xl border border-neutral-800">
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase">Compensation</span>
                  <div className="font-mono font-bold text-white text-xs">{activeDetailJob.salary.displayString}</div>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase">Work Mode</span>
                  <div className="capitalize text-white">{activeDetailJob.workMode}</div>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase">Experience</span>
                  <div className="text-white">{activeDetailJob.experienceLevel}</div>
                </div>
                <div>
                  <span className="text-[10px] text-neutral-500 uppercase">Deadline</span>
                  <div className="text-white font-mono">{activeDetailJob.deadline}</div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <span className="text-neutral-400 font-semibold block">About the Role</span>
                <p className="text-neutral-300 leading-relaxed text-[11.5px]">{activeDetailJob.description}</p>
              </div>

              {/* Requirements */}
              {activeDetailJob.requirements?.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-neutral-400 font-semibold block">Requirements</span>
                  <ul className="list-disc list-inside text-neutral-300 space-y-1 text-[11px]">
                    {activeDetailJob.requirements.map((req, i) => (
                      <li key={i}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Screening Question */}
              {activeDetailJob.screeningQuestions && activeDetailJob.screeningQuestions.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-neutral-400 font-semibold block">
                    Screening: {activeDetailJob.screeningQuestions[0]}
                  </span>
                  <textarea
                    rows={2}
                    value={screeningAnswer}
                    onChange={(e) => setScreeningAnswer(e.target.value)}
                    placeholder="Enter your response..."
                    className="w-full p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              {/* AI Cover Letter Generator trigger box */}
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between">
                <div>
                  <span className="text-purple-400 font-semibold text-xs flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> AI Cover Letter Generator
                  </span>
                  <span className="text-[11px] text-neutral-400 block">
                    Customized with your profile and {activeDetailJob.companyName}'s requirements
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenCoverLetterGenerator(activeDetailJob)}
                  className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-medium"
                >
                  Generate →
                </button>
              </div>
            </div>

            {/* Bottom Apply Bar */}
            <div className="p-4 border-t border-neutral-800 bg-neutral-950 shrink-0">
              {appliedSuccess || applications.some((a) => a.jobId === activeDetailJob.id) ? (
                <div className="py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center font-medium text-xs flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Application Submitted to {activeDetailJob.companyName}
                </div>
              ) : (
                <button
                  onClick={handleSubmitApplication}
                  disabled={isApplying}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {isApplying ? 'Submitting...' : 'One-Tap Apply with Dhruva Profile'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
