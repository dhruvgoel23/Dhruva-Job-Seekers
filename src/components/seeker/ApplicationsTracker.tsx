import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ApplicationStatus, JobApplication } from '../../types';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Building,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

const STATUS_COLUMNS: { key: ApplicationStatus; label: string }[] = [
  { key: 'applied', label: 'Applied' },
  { key: 'viewed', label: 'Viewed' },
  { key: 'shortlisted', label: 'Shortlist' },
  { key: 'interview', label: 'Interview' },
  { key: 'offer', label: 'Offer' },
];

export const ApplicationsTracker: React.FC = () => {
  const { applications, setActiveTab } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<ApplicationStatus>('applied');
  const [selectedApp, setSelectedApp] = useState<JobApplication | null>(applications[0] || null);

  const filteredApps = applications.filter((app) => app.status === selectedStatus);

  return (
    <div className="flex-1 overflow-y-auto pb-20 px-4 pt-3 space-y-3.5 no-scrollbar">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white tracking-tight">Application Tracker</h2>
          <p className="text-[11px] text-neutral-400">Track interviews, shortlists, and offers</p>
        </div>
        <span className="font-mono text-xs text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
          {applications.length} Active
        </span>
      </div>

      {/* Segmented Pipeline Bar */}
      <div className="flex bg-neutral-900 p-1 rounded-2xl border border-neutral-800 text-xs overflow-x-auto no-scrollbar gap-1">
        {STATUS_COLUMNS.map((col) => {
          const count = applications.filter((a) => a.status === col.key).length;
          const isActive = selectedStatus === col.key;
          return (
            <button
              key={col.key}
              onClick={() => setSelectedStatus(col.key)}
              className={`flex-1 py-1.5 px-2 rounded-xl font-medium transition-all text-center whitespace-nowrap flex items-center justify-center gap-1 ${
                isActive
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>{col.label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-400'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Applications list for selected status */}
      <div className="space-y-2.5">
        {filteredApps.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2">
            <Clock className="w-8 h-8 text-neutral-600 mx-auto" />
            <p className="text-xs font-semibold text-neutral-300">No applications in this stage</p>
            <p className="text-[11px] text-neutral-500">
              Applications automatically update when recruiters view your resume or schedule interviews.
            </p>
          </div>
        ) : (
          filteredApps.map((app) => (
            <div
              key={app.id}
              onClick={() => setSelectedApp(app)}
              className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800/80 hover:border-neutral-700 transition-all cursor-pointer space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-white">{app.jobTitle}</h4>
                  <div className="text-[11px] text-neutral-400">{app.companyName}</div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 capitalize">
                  {app.status}
                </span>
              </div>

              {/* Match Score */}
              <div className="flex items-center justify-between text-[11px] text-neutral-400">
                <span>Applied {app.appliedDate}</span>
                <span className="text-blue-400 font-mono font-medium">
                  {app.matchScore}% Match
                </span>
              </div>

              {/* Status Note if present */}
              {app.statusHistory[app.statusHistory.length - 1]?.note && (
                <div className="p-2 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-300 flex items-start gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                  <span>{app.statusHistory[app.statusHistory.length - 1].note}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Detail Inspector Sheet for selected application */}
      {selectedApp && (
        <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-3">
          <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Application Milestones
            </span>
            <button
              onClick={() => setActiveTab('messages')}
              className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
            >
              <MessageSquare className="w-3 h-3" /> Chat Recruiter
            </button>
          </div>

          <div className="space-y-2 text-xs">
            {selectedApp.statusHistory.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-1 shrink-0" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="font-semibold text-white capitalize">{step.status}</span>
                    <span className="text-[10px] font-mono text-neutral-500">{step.timestamp}</span>
                  </div>
                  {step.note && (
                    <p className="text-[11px] text-neutral-400 mt-0.5">{step.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
