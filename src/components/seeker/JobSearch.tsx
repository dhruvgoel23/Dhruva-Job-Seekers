import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { JobPosting, Currency, WorkMode, JobType, SavedJobAlert } from '../../types';
import {
  Search,
  ShieldCheck,
  AlertTriangle,
  ArrowUpDown,
  X,
  Bookmark,
  Bell,
  BellRing,
  Plus,
  Trash2,
  Play,
  CheckCircle2,
  ChevronRight,
  SlidersHorizontal,
  RotateCcw,
  Check,
  Briefcase,
  Building2,
  Globe,
  Sparkles,
  MapPin,
} from 'lucide-react';

export const JobSearch: React.FC = () => {
  const {
    jobs,
    savedJobIds,
    toggleSaveJob,
    setSelectedJob,
    savedAlerts,
    toggleAlertActive,
    deleteSavedAlert,
    simulateJobAlertTrigger,
    setIsJobAlertModalOpen,
    setPrefilledAlertCriteria,
    isJobSearchFilterOpen,
    setIsJobSearchFilterOpen,
    toggleJobSearchFilter,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'search' | 'alerts'>('search');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<'ALL' | Currency>('ALL');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'relevance' | 'newest' | 'salary'>('relevance');
  const [lastSimulatedAlertId, setLastSimulatedAlertId] = useState<string | null>(null);

  // Slide-over Filter Panel State (Job types, exp levels, work modes)
  const [selectedJobTypes, setSelectedJobTypes] = useState<JobType[]>([]);
  const [selectedExpLevels, setSelectedExpLevels] = useState<('fresher' | '1-3 years' | '3-5 years' | '5+ years')[]>([]);
  const [selectedWorkModes, setSelectedWorkModes] = useState<WorkMode[]>([]);

  // Toggle helpers for multi-select categories
  const toggleJobType = (type: JobType) => {
    setSelectedJobTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleExpLevel = (lvl: 'fresher' | '1-3 years' | '3-5 years' | '5+ years') => {
    setSelectedExpLevels((prev) =>
      prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]
    );
  };

  const toggleWorkMode = (mode: WorkMode) => {
    setSelectedWorkModes((prev) =>
      prev.includes(mode) ? prev.filter((m) => m !== mode) : [...prev, mode]
    );
  };

  const resetAllFilters = () => {
    setSelectedJobTypes([]);
    setSelectedExpLevels([]);
    setSelectedWorkModes([]);
    setSelectedCurrency('ALL');
    setVerifiedOnly(false);
  };

  const activeFilterCount = useMemo(() => {
    return (
      selectedJobTypes.length +
      selectedExpLevels.length +
      selectedWorkModes.length +
      (verifiedOnly ? 1 : 0) +
      (selectedCurrency !== 'ALL' ? 1 : 0)
    );
  }, [selectedJobTypes, selectedExpLevels, selectedWorkModes, verifiedOnly, selectedCurrency]);

  // Filtered and sorted jobs
  const filteredJobs = useMemo(() => {
    let result = jobs.filter((job) => {
      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = job.title.toLowerCase().includes(q);
        const matchCompany = job.companyName.toLowerCase().includes(q);
        const matchSkill = job.skillsRequired.some((s) => s.toLowerCase().includes(q));
        const matchLoc = job.location.toLowerCase().includes(q);
        if (!matchTitle && !matchCompany && !matchSkill && !matchLoc) return false;
      }

      // Job Type filter
      if (selectedJobTypes.length > 0 && !selectedJobTypes.includes(job.jobType)) {
        return false;
      }

      // Experience Level filter
      if (selectedExpLevels.length > 0 && !selectedExpLevels.includes(job.experienceLevel)) {
        return false;
      }

      // Remote / Work Mode filter
      if (selectedWorkModes.length > 0 && !selectedWorkModes.includes(job.workMode)) {
        return false;
      }

      // Currency
      if (selectedCurrency !== 'ALL' && job.salary.currency !== selectedCurrency) {
        return false;
      }

      // Verified company only
      if (verifiedOnly && job.trustBadge !== 'verified_company') {
        return false;
      }

      return true;
    });

    // Sorting
    if (sortBy === 'salary') {
      result = [...result].sort((a, b) => b.salary.min - a.salary.min);
    } else if (sortBy === 'newest') {
      result = [...result].sort((a, b) => (a.postedDate === 'Today' ? -1 : 1));
    }

    return result;
  }, [jobs, searchQuery, selectedJobTypes, selectedExpLevels, selectedWorkModes, selectedCurrency, verifiedOnly, sortBy]);

  const handleOpenAlertFromSearch = () => {
    const primaryWorkMode = selectedWorkModes.length === 1 ? selectedWorkModes[0] : 'ALL';
    setPrefilledAlertCriteria({
      title: searchQuery.trim()
        ? `${searchQuery.trim()} Roles` + (primaryWorkMode !== 'ALL' ? ` · ${primaryWorkMode}` : '')
        : 'All Active Tech Roles',
      query: searchQuery.trim(),
      workMode: primaryWorkMode,
      currency: selectedCurrency,
      pushNotification: true,
      emailNotification: true,
    });
    setIsJobAlertModalOpen(true);
  };

  const handleApplyAlertFilters = (alert: SavedJobAlert) => {
    setSearchQuery(alert.query || '');
    if (alert.workMode && alert.workMode !== 'ALL') {
      setSelectedWorkModes([alert.workMode]);
    } else {
      setSelectedWorkModes([]);
    }
    if (alert.currency) setSelectedCurrency(alert.currency);
    setActiveSubTab('search');
  };

  const handleSimulateAlert = (alertId: string) => {
    setLastSimulatedAlertId(alertId);
    simulateJobAlertTrigger(alertId);
    setTimeout(() => setLastSimulatedAlertId(null), 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20 px-4 pt-3 space-y-3.5 no-scrollbar text-neutral-900 dark:text-neutral-100 transition-colors duration-200 relative">
      {/* Subtab Segmented Switcher (Apple HIG style) */}
      <div className="flex bg-neutral-200/80 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 p-1 rounded-2xl shadow-inner transition-colors">
        <button
          onClick={() => setActiveSubTab('search')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'search'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>Browse Roles</span>
          <span className="text-[10px] text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-950 px-1.5 py-0.5 rounded-md font-mono">
            {filteredJobs.length}
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('alerts')}
          className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
            activeSubTab === 'alerts'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          <BellRing className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Real-Time Alerts</span>
          <span className="text-[10px] text-blue-700 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded-md border border-blue-500/20 font-mono">
            {savedAlerts.filter((a) => a.active).length} Active
          </span>
        </button>
      </div>

      {activeSubTab === 'search' ? (
        <>
          {/* Search Bar + Slide-over Filter Panel Trigger + Save Alert */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 dark:text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, skills (React, Node, Go), or company..."
                className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl text-xs text-neutral-900 dark:text-white placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-blue-500 shadow-xs transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Slide-over Filter Panel Button */}
            <button
              onClick={toggleJobSearchFilter}
              className={`px-3 py-2.5 rounded-2xl border text-xs font-semibold flex items-center gap-1.5 transition-all shrink-0 shadow-xs cursor-pointer ${
                activeFilterCount > 0
                  ? 'bg-blue-600 text-white border-blue-600 shadow-blue-500/20'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
              title="Open Filter Drawer (Press Space)"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Filters</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-neutral-100 dark:bg-neutral-800/80 text-neutral-600 dark:text-neutral-400 border border-neutral-300 dark:border-neutral-700">
                Space
              </kbd>
              {activeFilterCount > 0 && (
                <span className="w-4.5 h-4.5 rounded-full bg-white text-blue-700 font-mono text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Save Search as Alert Button */}
            <button
              onClick={handleOpenAlertFromSearch}
              title="Save current search criteria as an instant push alert"
              className="px-3 py-2.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-700 dark:text-blue-400 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              <Bell className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Alert</span>
            </button>
          </div>

          {/* Quick Filter Pill Ribbon */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-[11px]">
            {/* Quick Filter Drawer Opener Pill */}
            <button
              onClick={toggleJobSearchFilter}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 shrink-0 font-medium hover:border-blue-500 transition-colors"
              title="Toggle filters (Space)"
            >
              <SlidersHorizontal className="w-3 h-3 text-blue-600 dark:text-blue-400" />
              <span>All Filters</span>
              <kbd className="hidden sm:inline-flex items-center px-1 py-0.2 rounded text-[8.5px] font-mono bg-neutral-100 dark:bg-neutral-800 text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                Space
              </kbd>
              {activeFilterCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Remote Quick Pill */}
            <button
              onClick={() => toggleWorkMode('remote')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border shrink-0 transition-colors font-medium ${
                selectedWorkModes.includes('remote')
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Remote</span>
            </button>

            {/* Full-time Quick Pill */}
            <button
              onClick={() => toggleJobType('full-time')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border shrink-0 transition-colors font-medium ${
                selectedJobTypes.includes('full-time')
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <span>Full-time</span>
            </button>

            {/* Contract Quick Pill */}
            <button
              onClick={() => toggleJobType('contract')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border shrink-0 transition-colors font-medium ${
                selectedJobTypes.includes('contract')
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <span>Contract</span>
            </button>

            {/* Verified only toggle */}
            <button
              onClick={() => setVerifiedOnly(!verifiedOnly)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border shrink-0 transition-colors font-medium ${
                verifiedOnly
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-400 font-semibold'
                  : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400'
              }`}
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Verified Only</span>
            </button>

            {/* Reset active filters if any */}
            {activeFilterCount > 0 && (
              <button
                onClick={resetAllFilters}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-neutral-500 hover:text-red-500 dark:hover:text-red-400 shrink-0 transition-colors text-[11px]"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Active Filter Summary Badges */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-[11px]">
              <span className="text-neutral-400 dark:text-neutral-500 text-[10px] uppercase font-semibold">Active:</span>
              {selectedJobTypes.map((type) => (
                <span
                  key={type}
                  onClick={() => toggleJobType(type)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-[10.5px] font-medium cursor-pointer"
                >
                  <span className="capitalize">{type}</span>
                  <X className="w-2.5 h-2.5 hover:text-blue-900 dark:hover:text-white" />
                </span>
              ))}

              {selectedExpLevels.map((lvl) => (
                <span
                  key={lvl}
                  onClick={() => toggleExpLevel(lvl)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 text-indigo-700 dark:text-indigo-300 text-[10.5px] font-medium cursor-pointer"
                >
                  <span>{lvl}</span>
                  <X className="w-2.5 h-2.5 hover:text-indigo-900 dark:hover:text-white" />
                </span>
              ))}

              {selectedWorkModes.map((wm) => (
                <span
                  key={wm}
                  onClick={() => toggleWorkMode(wm)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-[10.5px] font-medium cursor-pointer"
                >
                  <span className="capitalize">{wm}</span>
                  <X className="w-2.5 h-2.5 hover:text-emerald-900 dark:hover:text-white" />
                </span>
              ))}

              {verifiedOnly && (
                <span
                  onClick={() => setVerifiedOnly(false)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 text-[10.5px] font-medium cursor-pointer"
                >
                  <span>Verified Cos</span>
                  <X className="w-2.5 h-2.5 hover:text-amber-900 dark:hover:text-white" />
                </span>
              )}
            </div>
          )}

          {/* Quick Alert Promotion Banner if active search or filters */}
          {(searchQuery || activeFilterCount > 0) && (
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between gap-2 text-[11px] transition-colors">
              <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 min-w-0">
                <BellRing className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="truncate">
                  Save current filter radar for instant notifications
                </span>
              </div>
              <button
                onClick={handleOpenAlertFromSearch}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline text-[11px] shrink-0"
              >
                Create Alert →
              </button>
            </div>
          )}

          {/* Results Count & Sort */}
          <div className="flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 pt-0.5">
            <span>
              <strong className="text-neutral-900 dark:text-white font-mono">{filteredJobs.length}</strong> jobs matching criteria
            </span>
            <div className="flex items-center gap-1">
              <ArrowUpDown className="w-3 h-3 text-neutral-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer font-medium"
              >
                <option value="relevance" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Relevance</option>
                <option value="newest" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Newest First</option>
                <option value="salary" className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white">Highest Compensation</option>
              </select>
            </div>
          </div>

          {/* Job list */}
          <div className="space-y-2.5">
            {filteredJobs.length === 0 ? (
              <div className="py-12 text-center space-y-2.5 bg-white dark:bg-neutral-900/60 rounded-3xl border border-neutral-200 dark:border-neutral-800/80 p-6 shadow-xs">
                <Search className="w-8 h-8 text-neutral-400 dark:text-neutral-600 mx-auto" />
                <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200">No matching roles with current filters</p>
                <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                  Try clearing some categories in the slide-over filter panel or resetting keywords.
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <button
                    onClick={resetAllFilters}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-xs font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Filters
                  </button>
                  <button
                    onClick={handleOpenAlertFromSearch}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
                  >
                    <Bell className="w-3 h-3" />
                    Save as Radar Alert
                  </button>
                </div>
              </div>
            ) : (
              filteredJobs.map((job) => {
                const isSaved = savedJobIds.includes(job.id);
                return (
                  <div
                    key={job.id}
                    onClick={() => setSelectedJob(job)}
                    className="p-3.5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 hover:border-blue-400 dark:hover:border-neutral-700 transition-all space-y-2.5 cursor-pointer shadow-xs group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {job.companyLogo ? (
                          <img
                            src={job.companyLogo}
                            alt={job.companyName}
                            className="w-9 h-9 rounded-xl object-cover shrink-0 border border-neutral-200 dark:border-neutral-800 mt-0.5"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs text-neutral-500 shrink-0 mt-0.5">
                            {job.companyName.charAt(0)}
                          </div>
                        )}

                        <div className="space-y-0.5 min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-neutral-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {job.title}
                            </span>
                            {job.trustBadge === 'verified_company' && (
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                            )}
                            {job.trustBadge === 'caution' && (
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
                            {job.companyName}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSaveJob(job.id);
                        }}
                        className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
                          isSaved
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40'
                            : 'text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800'
                        }`}
                        title={isSaved ? 'Unsave Job' : 'Save Job'}
                      >
                        <Bookmark className="w-3.5 h-3.5" fill={isSaved ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    {/* Metadata tags (Salary, Location, Mode, JobType, Exp) */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[10.5px]">
                      <span className="text-neutral-900 dark:text-white font-mono font-bold bg-neutral-100 dark:bg-neutral-950 px-2 py-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
                        {job.salary.displayString}
                      </span>
                      <span className="text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950 px-2 py-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800 capitalize font-medium">
                        {job.workMode}
                      </span>
                      <span className="text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-950 px-2 py-0.5 rounded-lg border border-neutral-200 dark:border-neutral-800 capitalize font-medium">
                        {job.jobType}
                      </span>
                      <span className="text-neutral-500 dark:text-neutral-400 text-[10px]">
                        {job.experienceLevel}
                      </span>
                    </div>

                    {/* Skills pills */}
                    <div className="flex flex-wrap gap-1">
                      {job.skillsRequired.slice(0, 4).map((skill, i) => (
                        <span
                          key={i}
                          className="text-[10px] text-neutral-600 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-950 px-2 py-0.5 rounded-md border border-neutral-200 dark:border-neutral-800 font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skillsRequired.length > 4 && (
                        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 px-1 py-0.5 font-mono">
                          +{job.skillsRequired.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        /* Saved Alerts Management View */
        <div className="space-y-3">
          {/* Header & Add Button */}
          <div className="flex items-center justify-between p-3.5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs transition-colors">
            <div>
              <h4 className="text-xs font-bold text-neutral-900 dark:text-white">Saved Radar Alerts</h4>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">Push notification monitors active 24/7</p>
            </div>
            <button
              onClick={() => {
                setPrefilledAlertCriteria(null);
                setIsJobAlertModalOpen(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Alert</span>
            </button>
          </div>

          {/* List of alerts */}
          {savedAlerts.length === 0 ? (
            <div className="py-12 text-center space-y-2 bg-white dark:bg-neutral-900/40 rounded-3xl border border-neutral-200 dark:border-neutral-800/60 p-6 shadow-xs">
              <Bell className="w-8 h-8 text-neutral-400 dark:text-neutral-600 mx-auto" />
              <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-300">No saved alerts yet</p>
              <p className="text-[11px] text-neutral-500 max-w-xs mx-auto">
                Set up an alert with your preferred skills or role to receive real-time push notifications.
              </p>
              <button
                onClick={() => {
                  setPrefilledAlertCriteria(null);
                  setIsJobAlertModalOpen(true);
                }}
                className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-medium cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Create First Alert
              </button>
            </div>
          ) : (
            savedAlerts.map((alert) => {
              const isSimulating = lastSimulatedAlertId === alert.id;
              return (
                <div
                  key={alert.id}
                  className={`p-3.5 rounded-3xl bg-white dark:bg-neutral-900 border transition-all space-y-2.5 shadow-xs ${
                    alert.active
                      ? 'border-neutral-200 dark:border-neutral-800/90'
                      : 'border-neutral-200 dark:border-neutral-800/40 opacity-70'
                  }`}
                >
                  {/* Alert title and active toggle */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900 dark:text-white truncate">{alert.title}</span>
                        {alert.active ? (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 font-medium">
                            Active
                          </span>
                        ) : (
                          <span className="text-[10px] text-neutral-500 dark:text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded font-medium">
                            Paused
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        Created {alert.createdAt} · {alert.matchesCount} matches triggered
                        {alert.lastTriggeredAt ? ` · Last: ${alert.lastTriggeredAt}` : ''}
                      </div>
                    </div>

                    {/* Active toggle */}
                    <button
                      onClick={() => toggleAlertActive(alert.id)}
                      className={`w-8 h-4.5 rounded-full p-0.5 transition-colors shrink-0 cursor-pointer ${
                        alert.active ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-800'
                      }`}
                      title={alert.active ? 'Pause Alert' : 'Resume Alert'}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded-full bg-white transition-transform ${
                          alert.active ? 'translate-x-3.5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Criteria summary chips */}
                  <div className="flex flex-wrap gap-1.5 text-[10px]">
                    {alert.query && (
                      <span className="bg-neutral-100 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800">
                        Keyword: "{alert.query}"
                      </span>
                    )}
                    {alert.location && (
                      <span className="bg-neutral-100 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800">
                        {alert.location}
                      </span>
                    )}
                    {alert.workMode && alert.workMode !== 'ALL' && (
                      <span className="bg-neutral-100 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 capitalize">
                        {alert.workMode}
                      </span>
                    )}
                    {alert.currency && alert.currency !== 'ALL' && (
                      <span className="bg-neutral-100 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800">
                        {alert.currency}
                      </span>
                    )}
                    {alert.minSalary && alert.minSalary > 0 && (
                      <span className="bg-neutral-100 dark:bg-neutral-950 text-neutral-700 dark:text-neutral-300 px-2 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 font-mono">
                        Min {alert.currency === 'USD' ? `$${alert.minSalary}k` : `₹${alert.minSalary} LPA`}
                      </span>
                    )}
                    {alert.pushNotification && (
                      <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-semibold">
                        ⚡ Push Toast
                      </span>
                    )}
                  </div>

                  {/* Actions row */}
                  <div className="pt-1.5 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleSimulateAlert(alert.id)}
                      disabled={isSimulating}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSimulating
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700/60'
                      }`}
                    >
                      {isSimulating ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                          <span>Push Dispatched!</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 text-blue-600 dark:text-blue-400 fill-current" />
                          <span>Simulate Radar Alert</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApplyAlertFilters(alert)}
                        className="text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>Search</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteSavedAlert(alert.id)}
                        className="p-1 text-neutral-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Delete Alert"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Slide-over Filter Panel Drawer */}
      {isJobSearchFilterOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-auto">
          {/* Backdrop overlay */}
          <div
            onClick={() => setIsJobSearchFilterOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 animate-fadeIn cursor-pointer"
          />

          {/* Slide-over Sheet / Panel */}
          <div
            className="relative w-full max-w-md max-h-[85vh] bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 rounded-t-3xl shadow-2xl flex flex-col overflow-hidden z-10 transition-transform duration-300 ease-out transform animate-slideUp text-neutral-900 dark:text-neutral-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Grab Handle */}
            <div className="pt-2 pb-1 flex justify-center">
              <div className="w-12 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full" />
            </div>

            {/* Drawer Header */}
            <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-neutral-900 dark:text-white">Filter Opportunities</h3>
                    <span className="hidden sm:inline-flex items-center gap-1 text-[9.5px] text-neutral-400 font-mono">
                      <kbd className="px-1 py-0.2 rounded bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700">Space</kbd>
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">
                    {filteredJobs.length} roles currently match
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={resetAllFilters}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 cursor-pointer flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setIsJobSearchFilterOpen(false)}
                  className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                  title="Close filters (Esc or Space)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Filter Categories */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 no-scrollbar">
              {/* Category 1: Job Type (Full-time, Part-time, Contract, Internship) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    Job Type
                  </label>
                  <span className="text-[10px] text-neutral-400">
                    {selectedJobTypes.length === 0 ? 'All Types' : `${selectedJobTypes.length} selected`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'full-time' as JobType, label: 'Full-time', desc: 'Permanent roles' },
                    { id: 'part-time' as JobType, label: 'Part-time', desc: 'Flexible schedule' },
                    { id: 'contract' as JobType, label: 'Contract', desc: 'Fixed engagements' },
                    { id: 'internship' as JobType, label: 'Internship', desc: 'Campus & trainees' },
                  ].map((item) => {
                    const isSelected = selectedJobTypes.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleJobType(item.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 dark:border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                            : 'bg-neutral-50 dark:bg-neutral-950/60 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div>
                          <div className={`text-xs font-bold ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-neutral-900 dark:text-white'}`}>
                            {item.label}
                          </div>
                          <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                            {item.desc}
                          </div>
                        </div>
                        <div
                          className={`w-4.5 h-4.5 rounded-lg flex items-center justify-center text-[10px] border transition-colors mt-0.5 ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category 2: Experience Level */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Experience Level
                  </label>
                  <span className="text-[10px] text-neutral-400">
                    {selectedExpLevels.length === 0 ? 'All Levels' : `${selectedExpLevels.length} selected`}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'fresher' as const, label: 'Fresher / Entry', range: '0-1 yr' },
                    { id: '1-3 years' as const, label: '1 - 3 Years', range: 'Junior / Mid' },
                    { id: '3-5 years' as const, label: '3 - 5 Years', range: 'Mid - Senior' },
                    { id: '5+ years' as const, label: '5+ Years / Staff', range: 'Lead & Staff' },
                  ].map((item) => {
                    const isSelected = selectedExpLevels.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleExpLevel(item.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-start justify-between ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 dark:border-indigo-500 shadow-xs ring-1 ring-indigo-500/20'
                            : 'bg-neutral-50 dark:bg-neutral-950/60 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div>
                          <div className={`text-xs font-bold ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-neutral-900 dark:text-white'}`}>
                            {item.label}
                          </div>
                          <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                            {item.range}
                          </div>
                        </div>
                        <div
                          className={`w-4.5 h-4.5 rounded-lg flex items-center justify-center text-[10px] border transition-colors mt-0.5 ${
                            isSelected
                              ? 'bg-indigo-600 border-indigo-600 text-white'
                              : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category 3: Remote / On-site Status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Remote / On-site Status
                  </label>
                  <span className="text-[10px] text-neutral-400">
                    {selectedWorkModes.length === 0 ? 'All Modes' : `${selectedWorkModes.length} selected`}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'remote' as WorkMode, label: 'Remote', sub: '100% WFH' },
                    { id: 'hybrid' as WorkMode, label: 'Hybrid', sub: 'Flexible' },
                    { id: 'on-site' as WorkMode, label: 'On-site', sub: 'In-office' },
                  ].map((mode) => {
                    const isSelected = selectedWorkModes.includes(mode.id);
                    return (
                      <button
                        key={mode.id}
                        type="button"
                        onClick={() => toggleWorkMode(mode.id)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 shadow-xs ring-1 ring-emerald-500/20'
                            : 'bg-neutral-50 dark:bg-neutral-950/60 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700'
                        }`}
                      >
                        <div className={`text-xs font-bold ${isSelected ? 'text-emerald-700 dark:text-emerald-300' : 'text-neutral-900 dark:text-white'}`}>
                          {mode.label}
                        </div>
                        <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
                          {mode.sub}
                        </div>
                        {isSelected && (
                          <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 text-white flex items-center justify-center mt-0.5">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category 4: Company Trust & Currency */}
              <div className="space-y-3 pt-1 border-t border-neutral-100 dark:border-neutral-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div>
                      <div className="text-xs font-bold text-neutral-900 dark:text-white">Verified Employers Only</div>
                      <div className="text-[11px] text-neutral-500">Government CIN/GST verified companies</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={verifiedOnly}
                    onClick={() => setVerifiedOnly(!verifiedOnly)}
                    className={`relative inline-flex h-5.5 w-10 items-center rounded-full transition-colors cursor-pointer ${
                      verifiedOnly ? 'bg-blue-600' : 'bg-neutral-300 dark:bg-neutral-800'
                    }`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                        verifiedOnly ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Currency selector */}
                <div className="flex items-center justify-between pt-1">
                  <div className="text-xs font-bold text-neutral-900 dark:text-white">Currency</div>
                  <div className="flex bg-neutral-100 dark:bg-neutral-950 p-0.5 rounded-xl border border-neutral-200 dark:border-neutral-800">
                    {(['ALL', 'INR', 'USD'] as const).map((curr) => (
                      <button
                        key={curr}
                        type="button"
                        onClick={() => setSelectedCurrency(curr)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          selectedCurrency === curr
                            ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-xs font-bold'
                            : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                        }`}
                      >
                        {curr === 'ALL' ? 'All' : curr === 'INR' ? '₹ INR' : '$ USD'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Drawer Footer */}
            <div className="px-5 py-3.5 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={resetAllFilters}
                className="py-2.5 px-4 rounded-2xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-colors cursor-pointer"
              >
                Clear All
              </button>

              <button
                type="button"
                onClick={() => setIsJobSearchFilterOpen(false)}
                className="flex-1 py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Apply Filters</span>
                <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-mono">
                  {filteredJobs.length} {filteredJobs.length === 1 ? 'Role' : 'Roles'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
