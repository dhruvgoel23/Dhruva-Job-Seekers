import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { JobPosting, ApplicationStatus, JobApplication, Currency, WorkMode } from '../../types';
import {
  Building2,
  Users,
  Briefcase,
  Plus,
  ShieldCheck,
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  Filter,
  DollarSign,
  FileText,
  Mail,
  Calendar,
  Sparkles,
} from 'lucide-react';

export const CompanyDashboard: React.FC = () => {
  const {
    company,
    jobs,
    applications,
    postJob,
    updateApplicationStatus,
    companyTab,
    setCompanyTab,
  } = useApp();

  // Job creation state
  const [jobTitle, setJobTitle] = useState('');
  const [roleCategory, setRoleCategory] = useState('Engineering');
  const [location, setLocation] = useState('Bangalore, Karnataka');
  const [workMode, setWorkMode] = useState<WorkMode>('hybrid');
  const [experienceLevel, setExperienceLevel] = useState<'fresher' | '1-3 years' | '3-5 years' | '5+ years'>('1-3 years');
  const [salaryMin, setSalaryMin] = useState(20);
  const [salaryMax, setSalaryMax] = useState(32);
  const [currency, setCurrency] = useState<Currency>('INR');
  const [skillsInput, setSkillsInput] = useState('React, TypeScript, Node.js, PostgreSQL');
  const [description, setDescription] = useState('');
  const [screeningQuestion, setScreeningQuestion] = useState('Describe your hands-on experience with modern TypeScript and distributed web apps.');
  const [jobPostedSuccess, setJobPostedSuccess] = useState(false);

  // Applicant inspect
  const [selectedApplicant, setSelectedApplicant] = useState<JobApplication | null>(applications[0] || null);
  const [applicantFilter, setApplicantFilter] = useState<'ALL' | ApplicationStatus>('ALL');

  const filteredApplicants = applications.filter((app) => {
    if (applicantFilter === 'ALL') return true;
    return app.status === applicantFilter;
  });

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;

    const skills = skillsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    postJob({
      companyId: company.id,
      companyName: company.name,
      companyVerified: company.verifiedStatus === 'verified',
      title: jobTitle.trim(),
      roleCategory,
      location,
      workMode,
      jobType: 'full-time',
      experienceLevel,
      salary: {
        min: salaryMin,
        max: salaryMax,
        currency,
        period: 'year',
        displayString:
          currency === 'INR'
            ? `₹${salaryMin} - ${salaryMax} LPA`
            : `$${salaryMin}k - $${salaryMax}k / yr`,
      },
      skillsRequired: skills,
      description: description || 'Exciting engineering role building scalable systems.',
      requirements: ['Proven track record in product development', 'Strong problem solving skills'],
      benefits: ['Competitive compensation', 'Health insurance', 'Equity grants'],
      deadline: '2026-11-30',
      applyType: 'direct',
      source: 'Dhruva Direct',
      contactEmail: company.workEmail,
      recruiterName: 'Talent Acquisition Team',
      riskScore: 0,
      riskFactors: [],
      trustBadge: 'verified_company',
      screeningQuestions: screeningQuestion ? [screeningQuestion] : [],
    });

    setJobPostedSuccess(true);
    setTimeout(() => {
      setJobPostedSuccess(false);
      setCompanyTab('jobs');
    }, 1200);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-neutral-900 text-neutral-100">
      {/* Desktop Sidebar (Apple macOS / Linear style) */}
      <aside className="w-64 border-r border-neutral-800 bg-neutral-950 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Company Lockup */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                G
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1">
                  {company.name}
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                </h3>
                <span className="text-[10px] text-neutral-500 font-mono">
                  CIN: {company.gstCinNumber}
                </span>
              </div>
            </div>
            <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Verified Employer Account
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 text-xs">
            {[
              { id: 'dashboard', label: 'Overview & Metrics', icon: Briefcase },
              { id: 'applicants', label: 'Applicants Pipeline', icon: Users, badge: applications.length },
              { id: 'jobs', label: 'Manage Job Postings', icon: Building2, badge: jobs.length },
              { id: 'post_job', label: 'Post a New Job', icon: Plus },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = companyTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCompanyTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-all ${
                    isActive
                      ? 'bg-neutral-800 text-white shadow-sm'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-800 text-neutral-400">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* DPDP Act Compliance Footer */}
        <div className="p-3 bg-neutral-900 rounded-xl border border-neutral-800 text-[10.5px] text-neutral-400 space-y-1">
          <div className="flex items-center gap-1 text-blue-400 font-semibold">
            <ShieldCheck className="w-3 h-3" />
            DPDP Compliant
          </div>
          <p>Candidate biometric data is verified cryptographically and never exposed in plain text.</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* VIEW 1: DASHBOARD METRICS */}
        {companyTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Recruitment Dashboard</h1>
                <p className="text-xs text-neutral-400">Real-time candidate pipeline and active requisition metrics</p>
              </div>
              <button
                onClick={() => setCompanyTab('post_job')}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-blue-600/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Post New Opening
              </button>
            </div>

            {/* 4 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Active Postings', value: jobs.length.toString(), sub: 'Dhruva Direct + Partners' },
                { label: 'Total Applicants', value: (applications.length + 382).toString(), sub: '98% Identity Verified' },
                { label: 'Shortlisted', value: '42', sub: 'Passed Screening' },
                { label: 'Interviews Scheduled', value: '18', sub: 'Next 5 business days' },
              ].map((card, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-1">
                  <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">{card.label}</span>
                  <div className="text-2xl font-bold font-mono text-white tracking-tight">{card.value}</div>
                  <span className="text-[10px] text-neutral-500">{card.sub}</span>
                </div>
              ))}
            </div>

            {/* Recent Applicants Strip */}
            <div className="p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Recent Verified Applicants</h3>
                <button
                  onClick={() => setCompanyTab('applicants')}
                  className="text-xs text-blue-400 hover:underline"
                >
                  View Pipeline →
                </button>
              </div>

              <div className="divide-y divide-neutral-800 text-xs">
                {applications.map((app) => (
                  <div key={app.id} className="py-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{app.seekerName}</span>
                        <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.2 rounded-full border border-blue-500/20">
                          {app.matchScore}% Match
                        </span>
                      </div>
                      <div className="text-neutral-400 text-[11px]">{app.jobTitle}</div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] text-neutral-400 capitalize">{app.status}</span>
                      <button
                        onClick={() => {
                          setSelectedApplicant(app);
                          setCompanyTab('applicants');
                        }}
                        className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs"
                      >
                        Inspect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: APPLICANTS PIPELINE */}
        {companyTab === 'applicants' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Candidate Pipeline</h1>
                <p className="text-xs text-neutral-400">Review resumes, screening responses, and change candidate stages</p>
              </div>

              {/* Status filter tabs */}
              <div className="flex bg-neutral-950 p-0.5 rounded-xl border border-neutral-800 text-xs">
                {(['ALL', 'applied', 'viewed', 'shortlisted', 'interview', 'offer'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setApplicantFilter(st)}
                    className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                      applicantFilter === st ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Candidate List */}
              <div className="space-y-2.5">
                {filteredApplicants.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApplicant(app)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                      selectedApplicant?.id === app.id
                        ? 'bg-neutral-950 border-blue-500 shadow-md shadow-blue-500/10'
                        : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-white text-xs">{app.seekerName}</span>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded capitalize">
                        {app.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate">{app.seekerHeadline}</p>
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1">
                      <span>{app.jobTitle}</span>
                      <span className="font-mono text-blue-400">{app.matchScore}% Match</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Candidate Inspector */}
              {selectedApplicant && (
                <div className="lg:col-span-2 p-5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-5 text-xs">
                  <div className="flex justify-between items-start border-b border-neutral-800 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-white">{selectedApplicant.seekerName}</h2>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> Biometric Verified Seeker
                        </span>
                      </div>
                      <p className="text-neutral-400 text-xs mt-0.5">{selectedApplicant.seekerHeadline}</p>
                      <div className="flex items-center gap-3 text-[11px] text-neutral-500 mt-1">
                        <span>{selectedApplicant.seekerEmail}</span>
                        <span>·</span>
                        <span>Applied for {selectedApplicant.jobTitle}</span>
                      </div>
                    </div>

                    {/* Stage Changer dropdown */}
                    <div className="space-y-1 text-right">
                      <span className="text-[10px] text-neutral-500 block uppercase">Pipeline Stage</span>
                      <select
                        value={selectedApplicant.status}
                        onChange={(e) => updateApplicationStatus(selectedApplicant.id, e.target.value as any)}
                        className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                      >
                        <option value="applied">Applied</option>
                        <option value="viewed">Viewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interview">Interview Scheduled</option>
                        <option value="offer">Offer Extended</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="space-y-1.5">
                    <span className="font-semibold text-neutral-300 uppercase tracking-wider text-[10px]">
                      Candidate Verified Skills
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedApplicant.seekerSkills.map((s, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-neutral-900 text-neutral-200 text-[11px] border border-neutral-800">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Cover Letter */}
                  {selectedApplicant.coverLetter && (
                    <div className="space-y-1.5 p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800">
                      <span className="font-semibold text-neutral-300 text-[11px] flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-400" /> Candidate Note
                      </span>
                      <p className="text-neutral-300 leading-relaxed text-[11.5px] whitespace-pre-line">
                        {selectedApplicant.coverLetter}
                      </p>
                    </div>
                  )}

                  {/* Status Timeline */}
                  <div className="space-y-2 border-t border-neutral-800 pt-3">
                    <span className="font-semibold text-neutral-400 uppercase tracking-wider text-[10px]">
                      Audit Trail
                    </span>
                    <div className="space-y-1 text-[11px]">
                      {selectedApplicant.statusHistory.map((h, i) => (
                        <div key={i} className="flex justify-between text-neutral-400">
                          <span className="capitalize text-white font-medium">{h.status}</span>
                          <span className="font-mono text-neutral-500">{h.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: MANAGE JOB POSTINGS */}
        {companyTab === 'jobs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Direct Job Postings</h1>
                <p className="text-xs text-neutral-400">Listings published on Dhruva and partner aggregation networks</p>
              </div>
              <button
                onClick={() => setCompanyTab('post_job')}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Post New
              </button>
            </div>

            <div className="space-y-3">
              {jobs.map((job) => (
                <div key={job.id} className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{job.title}</span>
                      <span className="text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 font-mono">
                        {job.source}
                      </span>
                    </div>
                    <div className="text-neutral-400">
                      {job.location} · <span className="font-mono text-white">{job.salary.displayString}</span> · {job.experienceLevel}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-mono font-bold text-white text-sm">{job.applicantCount}</span>
                      <span className="text-[10px] text-neutral-500 block">Applicants</span>
                    </div>
                    <button
                      onClick={() => setCompanyTab('applicants')}
                      className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs"
                    >
                      View Candidates
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: POST A JOB */}
        {companyTab === 'post_job' && (
          <div className="max-w-2xl mx-auto p-6 rounded-3xl bg-neutral-950 border border-neutral-800 space-y-5 text-xs">
            <div>
              <h2 className="text-lg font-bold text-white">Create New Job Posting</h2>
              <p className="text-neutral-400 text-xs">Direct listings receive verified seeker applications and zero spam</p>
            </div>

            {jobPostedSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Job posting published successfully on Dhruva!
              </div>
            )}

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-300">Job Title</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="e.g. Senior Frontend Architect"
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-300">Role Category</label>
                  <select
                    value={roleCategory}
                    onChange={(e) => setRoleCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product">Product</option>
                    <option value="Design">Design</option>
                    <option value="Data">Data & AI</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-300">Work Mode</label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs capitalize"
                  >
                    <option value="hybrid">Hybrid</option>
                    <option value="remote">Remote</option>
                    <option value="on-site">On-site</option>
                  </select>
                </div>
              </div>

              {/* Dual Salary Range */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="font-semibold text-neutral-300">Annual Salary Range</label>
                  <div className="flex gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setCurrency('INR')}
                      className={`px-2 py-0.5 rounded font-medium ${currency === 'INR' ? 'bg-blue-600 text-white' : 'text-neutral-400'}`}
                    >
                      ₹ INR (Lakhs)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency('USD')}
                      className={`px-2 py-0.5 rounded font-medium ${currency === 'USD' ? 'bg-blue-600 text-white' : 'text-neutral-400'}`}
                    >
                      $ USD ($k/yr)
                    </button>
                  </div>
                </div>

                <div className="flex gap-3">
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(Number(e.target.value))}
                    placeholder="Min (e.g. 20)"
                    className="w-1/2 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                  />
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(Number(e.target.value))}
                    placeholder="Max (e.g. 35)"
                    className="w-1/2 p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-300">Required Skills (comma separated)</label>
                <input
                  type="text"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                  placeholder="React, TypeScript, Node.js"
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-300">Screening Question for Candidates</label>
                <input
                  type="text"
                  value={screeningQuestion}
                  onChange={(e) => setScreeningQuestion(e.target.value)}
                  placeholder="e.g. Years of experience with distributed systems"
                  className="w-full p-2.5 rounded-xl bg-neutral-900 border border-neutral-800 text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-lg shadow-blue-600/20"
              >
                Publish Verified Job Posting
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
