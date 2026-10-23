import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NotificationCategory } from '../../types';
import {
  X,
  Bell,
  CheckCircle2,
  Calendar,
  Briefcase,
  MessageSquare,
  ShieldCheck,
  Sliders,
  Trash2,
  ExternalLink,
  Mail,
  Smartphone,
} from 'lucide-react';
import { filterNotificationsByPreference } from '../../utils/notificationService';

export const NotificationCenter: React.FC = () => {
  const {
    isNotificationModalOpen,
    setIsNotificationModalOpen,
    notifications,
    notificationPreferences,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    updateNotificationPreferences,
    setSelectedJob,
    jobs,
    setActiveTab,
    user,
  } = useApp();

  const [activeView, setActiveView] = useState<'inbox' | 'preferences'>('inbox');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | NotificationCategory>('ALL');

  if (!isNotificationModalOpen) return null;

  const filteredNotifications = filterNotificationsByPreference(
    notifications,
    notificationPreferences,
    selectedCategory
  );

  const getCategoryIcon = (cat: NotificationCategory) => {
    switch (cat) {
      case 'interview_reminder':
        return <Calendar className="w-4 h-4 text-purple-400" />;
      case 'application_update':
        return <CheckCircle2 className="w-4 h-4 text-blue-400" />;
      case 'job_match':
        return <Briefcase className="w-4 h-4 text-emerald-400" />;
      case 'recruiter_message':
        return <MessageSquare className="w-4 h-4 text-amber-400" />;
      case 'account_verification':
        return <ShieldCheck className="w-4 h-4 text-blue-400" />;
    }
  };

  const handleNotificationClick = (notif: any) => {
    markNotificationAsRead(notif.id);
    if (notif.jobId) {
      const job = jobs.find((j) => j.id === notif.jobId);
      if (job) {
        setSelectedJob(job);
        setActiveTab('home');
        setIsNotificationModalOpen(false);
      }
    } else if (notif.applicationId) {
      setActiveTab('applications');
      setIsNotificationModalOpen(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl text-neutral-100 flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-neutral-800 flex items-center justify-between shrink-0 bg-neutral-950">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-sm text-white">Notification Center</h3>
          </div>

          <div className="flex items-center gap-2">
            {/* View switcher */}
            <div className="flex bg-neutral-900 p-0.5 rounded-lg border border-neutral-800 text-xs">
              <button
                onClick={() => setActiveView('inbox')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeView === 'inbox' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400'
                }`}
              >
                Alerts
              </button>
              <button
                onClick={() => setActiveView('preferences')}
                className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  activeView === 'preferences' ? 'bg-neutral-800 text-white font-medium' : 'text-neutral-400'
                }`}
              >
                <Sliders className="w-3 h-3" /> Preferences
              </button>
            </div>

            <button
              onClick={() => setIsNotificationModalOpen(false)}
              className="p-1 rounded-full text-neutral-400 hover:text-white hover:bg-neutral-800 ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeView === 'inbox' ? (
            <div className="space-y-3.5">
              {/* Category tabs ribbon */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-[11px]">
                  {[
                    { id: 'ALL', label: 'All' },
                    { id: 'job_match', label: 'Matches' },
                    { id: 'application_update', label: 'Applications' },
                    { id: 'interview_reminder', label: 'Interviews' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id as any)}
                      className={`px-2.5 py-1 rounded-lg border transition-colors ${
                        selectedCategory === cat.id
                          ? 'bg-blue-600/15 border-blue-500 text-blue-300 font-medium'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-[11px] shrink-0">
                  <button
                    onClick={markAllNotificationsAsRead}
                    className="text-neutral-400 hover:text-white"
                  >
                    Read All
                  </button>
                  <span>·</span>
                  <button
                    onClick={clearAllNotifications}
                    className="text-neutral-500 hover:text-red-400"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Notification Cards */}
              <div className="space-y-2">
                {filteredNotifications.length === 0 ? (
                  <div className="py-12 text-center text-neutral-500 space-y-1">
                    <p className="font-semibold text-neutral-400">All caught up</p>
                    <p className="text-[11px]">No notifications in this category.</p>
                  </div>
                ) : (
                  filteredNotifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleNotificationClick(n)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                        !n.read
                          ? 'bg-neutral-950 border-blue-500/40 shadow-sm'
                          : 'bg-neutral-950/60 border-neutral-800/80 hover:border-neutral-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(n.category)}
                          <span className={`text-xs font-semibold ${!n.read ? 'text-white' : 'text-neutral-300'}`}>
                            {n.title}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-neutral-500">{n.timestamp}</span>
                      </div>

                      <p className="text-[11.5px] text-neutral-300 leading-relaxed pl-6">
                        {n.message}
                      </p>

                      {n.actionLabel && n.actionUrl && (
                        <div className="pl-6 pt-1">
                          <a
                            href={n.actionUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-[11px] font-medium transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {n.actionLabel}
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* PREFERENCES TAB */
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-semibold text-white text-xs">Delivery Channels</h4>
                <p className="text-[11px] text-neutral-400">Choose where Dhruva updates reach you</p>
              </div>

              {/* Channel toggles */}
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-blue-400" />
                    <div>
                      <span className="font-medium text-white block">Mobile Push Notifications (APNs / FCM)</span>
                      <span className="text-[10.5px] text-neutral-500">Real-time alerts for interviews & recruiter pings</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPreferences.pushEnabled}
                    onChange={(e) => updateNotificationPreferences({ pushEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-neutral-800 border-neutral-700 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-800/80">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-medium text-white block">Email Notification Digest</span>
                      <span className="text-[10.5px] text-neutral-500">Sent to {user.email}</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={notificationPreferences.emailEnabled}
                    onChange={(e) => updateNotificationPreferences({ emailEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600 bg-neutral-800 border-neutral-700 cursor-pointer"
                  />
                </div>

                {notificationPreferences.emailEnabled && (
                  <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[11px]">
                    <span className="text-neutral-400">Digest Cadence:</span>
                    <select
                      value={notificationPreferences.emailDigestCadence}
                      onChange={(e) => updateNotificationPreferences({ emailDigestCadence: e.target.value as any })}
                      className="bg-neutral-900 border border-neutral-800 rounded-lg p-1 text-white focus:outline-none"
                    >
                      <option value="instant">Instant per event</option>
                      <option value="daily">Daily 9 AM Digest</option>
                      <option value="weekly">Weekly Summary</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Granular Categories */}
              <div className="space-y-1">
                <h4 className="font-semibold text-white text-xs">Alert Categories</h4>
                <p className="text-[11px] text-neutral-400">Toggle individual alert topics to avoid notification fatigue</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-3">
                {[
                  { key: 'jobMatches', label: 'Matching Job Alerts (>85% Match)', desc: 'AI-grounded recommendations matching your skills' },
                  { key: 'applicationUpdates', label: 'Application Status Progression', desc: 'When employers view, shortlist, or update your status' },
                  { key: 'interviewReminders', label: 'Interview Timers & Meeting Links', desc: '24h and 2h alerts prior to video rounds' },
                  { key: 'recruiterMessages', label: 'Recruiter Direct Messages', desc: 'In-app chat messages from verified hiring managers' },
                  { key: 'verificationAlerts', label: 'Identity & Biometric Updates', desc: 'Audit compliance alerts and trust badge status' },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-medium text-white block">{item.label}</span>
                      <span className="text-[10.5px] text-neutral-500">{item.desc}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={(notificationPreferences as any)[item.key]}
                      onChange={(e) => updateNotificationPreferences({ [item.key]: e.target.checked })}
                      className="w-4 h-4 rounded text-blue-600 bg-neutral-800 border-neutral-700 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
