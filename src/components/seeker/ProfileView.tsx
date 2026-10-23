import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldCheck,
  FileText,
  Sparkles,
  Trash2,
  LogOut,
  Camera,
  Coins,
  Sun,
  Moon,
  Monitor,
  Check,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    user,
    updateSeekerProfile,
    setIsBiometricModalOpen,
    setIsResumeModalOpen,
    setIsResumeBuilderOpen,
    logout,
    theme,
    toggleTheme,
    setTheme,
  } = useApp();

  const [newSkillInput, setNewSkillInput] = useState<string>('');
  const [isEditingExpectedSalary, setIsEditingExpectedSalary] = useState<boolean>(false);
  const [salaryMin, setSalaryMin] = useState<number>(user.expectedSalary.min);
  const [salaryMax, setSalaryMax] = useState<number>(user.expectedSalary.max);
  const [salaryCurr, setSalaryCurr] = useState<'INR' | 'USD'>(user.expectedSalary.currency);

  const handleAddSkill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSkillInput.trim()) return;
    const trimmed = newSkillInput.trim();
    if (!user.skills.includes(trimmed)) {
      updateSeekerProfile({ skills: [...user.skills, trimmed] });
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    updateSeekerProfile({
      skills: user.skills.filter((s) => s !== skillToRemove),
    });
  };

  const handleSaveSalary = () => {
    updateSeekerProfile({
      expectedSalary: {
        min: salaryMin,
        max: salaryMax,
        currency: salaryCurr,
        period: 'year',
      },
    });
    setIsEditingExpectedSalary(false);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24 px-4 pt-3 space-y-4 no-scrollbar text-neutral-900 dark:text-neutral-100 transition-colors duration-200">
      {/* Profile Header Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user.fullName}
                className="w-14 h-14 rounded-full object-cover ring-2 ring-neutral-300 dark:ring-neutral-700 shadow-xs"
              />
              {user.isIdentityVerified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center ring-2 ring-white dark:ring-neutral-900 shadow">
                  <ShieldCheck className="w-3 h-3" />
                </div>
              )}
            </div>

            <div>
              <h2 className="text-sm font-bold text-neutral-900 dark:text-white tracking-normal flex items-center gap-1.5">
                {user.fullName}
              </h2>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 max-w-[200px] truncate">{user.headline}</p>
              <div className="flex items-center gap-2 text-[10.5px] text-neutral-500 mt-0.5">
                <span>{user.location}</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Completeness bar */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-col gap-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-neutral-500 dark:text-neutral-400 font-medium">Profile Completeness:</span>
            <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{user.completenessScore}%</span>
          </div>
          <span className="text-[10.5px] text-emerald-600 dark:text-emerald-400 font-medium">
            {user.completenessScore >= 80 ? 'High visibility to top companies' : 'Add resume to boost'}
          </span>
        </div>
      </div>

      {/* System-wide Dark Mode Toggle Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span>Appearance & Theme</span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                  {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Switch system-wide theme styling instantly
              </div>
            </div>
          </div>

          {/* Interactive Switch Pill */}
          <button
            type="button"
            role="switch"
            aria-checked={theme === 'dark'}
            onClick={toggleTheme}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
              theme === 'dark' ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-700'
            }`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            <span
              className={`inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
                theme === 'dark' ? 'translate-x-6 text-neutral-900' : 'translate-x-1 text-amber-500'
              }`}
            >
              {theme === 'dark' ? <Moon className="w-2.5 h-2.5" /> : <Sun className="w-2.5 h-2.5" />}
            </span>
          </button>
        </div>

        {/* Quick Segmented Mode Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-2xl text-xs font-semibold border transition-all ${
              theme === 'light'
                ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-xs'
                : 'bg-neutral-50 dark:bg-neutral-950/60 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500' : ''}`} />
            <span>Light Theme</span>
            {theme === 'light' && <Check className="w-3 h-3 text-blue-600" />}
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-2xl text-xs font-semibold border transition-all ${
              theme === 'dark'
                ? 'bg-neutral-800 border-blue-500 text-white shadow-xs'
                : 'bg-neutral-50 dark:bg-neutral-950/60 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-blue-400' : ''}`} />
            <span>Dark Theme</span>
            {theme === 'dark' && <Check className="w-3 h-3 text-blue-400" />}
          </button>
        </div>
      </div>

      {/* Identity Verification Card */}
      <div className="p-3.5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center justify-between transition-colors">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              user.isIdentityVerified
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            }`}
          >
            {user.isIdentityVerified ? (
              <ShieldCheck className="w-5 h-5" />
            ) : (
              <Camera className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-900 dark:text-white">
              {user.isIdentityVerified ? 'Verified Seeker Badge' : 'Face Liveness Verification'}
            </div>
            <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {user.isIdentityVerified
                ? 'Protected with DPDP Act 2023 biometric encryption'
                : 'Takes 60 seconds with your camera'}
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsBiometricModalOpen(true)}
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            user.isIdentityVerified
              ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
          }`}
        >
          {user.isIdentityVerified ? 'Manage' : 'Verify'}
        </button>
      </div>

      {/* Resume Management Hub */}
      <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-3 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
            Resume & Parser
          </span>
          {user.resumeFileName && (
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono truncate max-w-[150px]">
              {user.resumeFileName}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setIsResumeModalOpen(true)}
            className="p-3 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-purple-500 dark:text-purple-400" />
            <span>AI Parse Resume</span>
          </button>

          <button
            onClick={() => setIsResumeBuilderOpen(true)}
            className="p-3 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-700 dark:text-blue-300 text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            <span>In-App Builder</span>
          </button>
        </div>
      </div>

      {/* Expected Salary Section (Dual Currency) */}
      <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2 transition-colors">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" /> Expected Compensation
          </span>
          <button
            onClick={() => setIsEditingExpectedSalary(!isEditingExpectedSalary)}
            className="text-[11px] text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            {isEditingExpectedSalary ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {!isEditingExpectedSalary ? (
          <div className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
            {user.expectedSalary.currency === 'INR'
              ? `₹${user.expectedSalary.min} – ₹${user.expectedSalary.max} LPA`
              : `$${user.expectedSalary.min}k – $${user.expectedSalary.max}k / year`}
          </div>
        ) : (
          <div className="space-y-3 pt-2 text-xs">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSalaryCurr('INR')}
                className={`flex-1 py-1.5 rounded-xl font-medium border text-xs transition-colors ${
                  salaryCurr === 'INR'
                    ? 'bg-blue-50 dark:bg-neutral-800 border-blue-500 text-blue-700 dark:text-white'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                ₹ INR (Lakhs)
              </button>
              <button
                type="button"
                onClick={() => setSalaryCurr('USD')}
                className={`flex-1 py-1.5 rounded-xl font-medium border text-xs transition-colors ${
                  salaryCurr === 'USD'
                    ? 'bg-blue-50 dark:bg-neutral-800 border-blue-500 text-blue-700 dark:text-white'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
                }`}
              >
                $ USD (k/yr)
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type="number"
                value={salaryMin}
                onChange={(e) => setSalaryMin(Number(e.target.value))}
                placeholder="Min"
                className="w-1/2 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white"
              />
              <input
                type="number"
                value={salaryMax}
                onChange={(e) => setSalaryMax(Number(e.target.value))}
                placeholder="Max"
                className="w-1/2 p-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-white"
              />
            </div>

            <button
              onClick={handleSaveSalary}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium text-xs transition-colors"
            >
              Save Compensation
            </button>
          </div>
        )}
      </div>

      {/* Skills Manager */}
      <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2.5 transition-colors">
        <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider block">
          Skills & Tech Stack ({user.skills.length})
        </span>

        <div className="flex flex-wrap gap-1.5">
          {user.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-neutral-800 dark:text-neutral-200 text-xs font-medium"
            >
              {skill}
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="text-neutral-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <form onSubmit={handleAddSkill} className="flex gap-1.5 pt-1">
          <input
            type="text"
            value={newSkillInput}
            onChange={(e) => setNewSkillInput(e.target.value)}
            placeholder="Add new skill (e.g. Next.js, Kubernetes)"
            className="flex-1 px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-white text-xs font-medium transition-colors"
          >
            Add
          </button>
        </form>
      </div>

      {/* Education List */}
      <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2.5 transition-colors">
        <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider block">
          Education
        </span>
        {user.education.map((edu) => (
          <div key={edu.id} className="text-xs space-y-0.5 border-b border-neutral-100 dark:border-neutral-800/60 pb-2 last:border-0 last:pb-0">
            <div className="font-semibold text-neutral-900 dark:text-white">{edu.degree}</div>
            <div className="text-neutral-500 dark:text-neutral-400">{edu.institution} · {edu.startYear}–{edu.endYear}</div>
            {edu.grade && <div className="text-neutral-400 dark:text-neutral-500 font-mono text-[11px]">{edu.grade}</div>}
          </div>
        ))}
      </div>

      {/* Experience List */}
      <div className="p-4 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs space-y-2.5 transition-colors">
        <span className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider block">
          Experience
        </span>
        {user.experience.map((exp) => (
          <div key={exp.id} className="text-xs space-y-0.5 border-b border-neutral-100 dark:border-neutral-800/60 pb-2 last:border-0 last:pb-0">
            <div className="font-semibold text-neutral-900 dark:text-white">{exp.role}</div>
            <div className="text-neutral-500 dark:text-neutral-400">{exp.company} · {exp.startDate}–{exp.endDate}</div>
            <p className="text-neutral-600 dark:text-neutral-300 text-[11px] mt-1 leading-relaxed">{exp.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
