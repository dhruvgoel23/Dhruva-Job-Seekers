import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Currency, WorkMode } from '../../types';
import { X, Bell, Shield, Sparkles, Check } from 'lucide-react';

export const JobAlertModal: React.FC = () => {
  const {
    isJobAlertModalOpen,
    setIsJobAlertModalOpen,
    createSavedAlert,
    prefilledAlertCriteria,
    setPrefilledAlertCriteria,
  } = useApp();

  const [title, setTitle] = useState('');
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [workMode, setWorkMode] = useState<'ALL' | WorkMode>('ALL');
  const [currency, setCurrency] = useState<'ALL' | Currency>('ALL');
  const [minSalary, setMinSalary] = useState<number>(0);
  const [frequency, setFrequency] = useState<'instant' | 'daily'>('instant');
  const [pushNotification, setPushNotification] = useState<boolean>(true);
  const [emailNotification, setEmailNotification] = useState<boolean>(true);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  useEffect(() => {
    if (prefilledAlertCriteria) {
      if (prefilledAlertCriteria.query) {
        setQuery(prefilledAlertCriteria.query);
        setTitle(
          prefilledAlertCriteria.title ||
            `${prefilledAlertCriteria.query} Roles` +
              (prefilledAlertCriteria.location ? ` · ${prefilledAlertCriteria.location}` : '')
        );
      } else {
        setTitle('Custom Job Radar');
      }
      if (prefilledAlertCriteria.location) setLocation(prefilledAlertCriteria.location);
      if (prefilledAlertCriteria.workMode) setWorkMode(prefilledAlertCriteria.workMode);
      if (prefilledAlertCriteria.currency) setCurrency(prefilledAlertCriteria.currency);
      if (prefilledAlertCriteria.minSalary) setMinSalary(prefilledAlertCriteria.minSalary);
    } else {
      setTitle('React & TypeScript Roles');
      setQuery('React');
      setLocation('Bangalore');
      setWorkMode('ALL');
      setCurrency('INR');
      setMinSalary(18);
    }
  }, [prefilledAlertCriteria, isJobAlertModalOpen]);

  if (!isJobAlertModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createSavedAlert({
      title: title.trim(),
      query: query.trim(),
      location: location.trim(),
      workMode,
      currency,
      minSalary: minSalary > 0 ? minSalary : undefined,
      frequency,
      pushNotification,
      emailNotification,
      active: true,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setIsJobAlertModalOpen(false);
      setPrefilledAlertCriteria(null);
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full sm:max-w-md bg-neutral-900 border border-neutral-800 rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto no-scrollbar text-neutral-100">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-base text-white tracking-tight">Create Job Alert</h3>
                <span className="text-[11px] text-neutral-400">Instant push notifications when matched</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setIsJobAlertModalOpen(false);
              setPrefilledAlertCriteria(null);
            }}
            className="p-1.5 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-2 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Check className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">Job Alert Activated</p>
            <p className="text-xs text-neutral-400 max-w-xs">
              Dhruva will monitor direct company postings and aggregations in real-time.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Alert Name */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-400">Alert Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend · Bangalore"
                required
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Keyword Query */}
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-neutral-400">Search Keywords or Skills</label>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. React, TypeScript, Product Engineer"
                className="w-full px-3.5 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Remote'].map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => {
                      if (!query.includes(skill)) {
                        setQuery((prev) => (prev ? `${prev} ${skill}` : skill));
                      }
                    }}
                    className="text-[10px] text-neutral-400 bg-neutral-800/60 hover:text-white px-2 py-0.5 rounded-md border border-neutral-700/50 transition-colors"
                  >
                    +{skill}
                  </button>
                ))}
              </div>
            </div>

            {/* Location & Work Mode */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-400">Target Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bangalore, Remote"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-400">Work Mode</label>
                <select
                  value={workMode}
                  onChange={(e) => setWorkMode(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="ALL">Any Work Mode</option>
                  <option value="remote">Remote Only</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="on-site">On-site</option>
                </select>
              </div>
            </div>

            {/* Currency & Min Salary */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-400">Currency</label>
                <div className="flex bg-neutral-950 p-0.5 rounded-xl border border-neutral-800">
                  {(['ALL', 'INR', 'USD'] as const).map((curr) => (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setCurrency(curr)}
                      className={`flex-1 py-1.5 text-[11px] font-medium rounded-lg transition-colors ${
                        currency === curr
                          ? 'bg-neutral-800 text-white'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      {curr === 'ALL' ? 'All' : curr === 'INR' ? '₹ INR' : '$ USD'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-medium text-neutral-400">
                  Min Salary {currency === 'USD' ? '($k/yr)' : '(₹ LPA)'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={minSalary || ''}
                  onChange={(e) => setMinSalary(Number(e.target.value))}
                  placeholder="e.g. 20"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            {/* Notification Delivery Channels */}
            <div className="p-3 bg-neutral-950/80 rounded-2xl border border-neutral-800/80 space-y-2.5">
              <span className="text-[11px] font-medium text-neutral-300 block">Notification Delivery</span>

              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-white">Instant Push Banner</div>
                  <div className="text-[10px] text-neutral-400">Native mobile APNs / FCM banner on new job</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPushNotification(!pushNotification)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    pushNotification ? 'bg-blue-600' : 'bg-neutral-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      pushNotification ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800/60">
                <div>
                  <div className="font-medium text-white">Email Notification</div>
                  <div className="text-[10px] text-neutral-400">Dispatches digest to registered email</div>
                </div>
                <button
                  type="button"
                  onClick={() => setEmailNotification(!emailNotification)}
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    emailNotification ? 'bg-blue-600' : 'bg-neutral-800'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      emailNotification ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Frequency */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-[11px] text-neutral-400">Frequency:</span>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setFrequency('instant')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    frequency === 'instant'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  ⚡ Real-Time
                </button>
                <button
                  type="button"
                  onClick={() => setFrequency('daily')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    frequency === 'daily'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-neutral-950 text-neutral-400 border border-neutral-800'
                  }`}
                >
                  Daily Digest
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsJobAlertModalOpen(false);
                  setPrefilledAlertCriteria(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-neutral-800 text-xs font-medium text-neutral-300 hover:bg-neutral-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5" />
                Activate Alert
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
