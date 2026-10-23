import React, { createContext, useContext, useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  UserRole,
  JobSeekerProfile,
  CompanyProfile,
  JobPosting,
  JobApplication,
  BiometricVerificationRecord,
  ViewportMode,
  ApplicationStatus,
  AppNotification,
  NotificationPreferences,
  JobMatchBreakdown,
  SavedJobAlert,
  PushToast,
} from '../types';
import { INITIAL_JOBS } from '../data/seedJobs.ts';
import { calculateProfileCompleteness } from '../utils/profileScore.ts';
import { INITIAL_NOTIFICATIONS, DEFAULT_NOTIFICATION_PREFERENCES, filterNotificationsByPreference } from '../utils/notificationService.ts';
import { rankJobsForCandidate } from '../utils/recommendationEngine.ts';
import { INITIAL_SAVED_ALERTS, findMatchingAlertsForJob } from '../utils/jobAlertService.ts';
import {
  OfflineQueueItem,
  saveJobsToOfflineCache,
  loadJobsFromOfflineCache,
  saveApplicationsToOfflineCache,
  loadApplicationsFromOfflineCache,
  getOfflineQueue,
  enqueueOfflineAction,
  clearOfflineQueue,
  getSimulatedOfflineState,
  setSimulatedOfflineState,
} from '../utils/offlineSync.ts';

interface AppContextType {
  // Auth state
  isAuthenticated: boolean;
  currentRole: UserRole;
  user: JobSeekerProfile;
  company: CompanyProfile;
  login: (phoneOrEmail: string, role: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  // Viewport mode
  viewportMode: ViewportMode;
  setViewportMode: (mode: ViewportMode) => void;

  // System-wide Dark Mode & Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  // Navigation
  activeTab: 'home' | 'search' | 'applications' | 'messages' | 'profile';
  setActiveTab: (tab: 'home' | 'search' | 'applications' | 'messages' | 'profile') => void;
  companyTab: 'dashboard' | 'jobs' | 'applicants' | 'post_job';
  setCompanyTab: (tab: 'dashboard' | 'jobs' | 'applicants' | 'post_job') => void;

  // Data & Jobs
  jobs: JobPosting[];
  selectedJob: JobPosting | null;
  setSelectedJob: (job: JobPosting | null) => void;
  savedJobIds: string[];
  toggleSaveJob: (jobId: string) => void;
  applications: JobApplication[];
  applyToJob: (jobId: string, coverLetter?: string, answers?: Record<string, string>) => void;
  postJob: (job: Omit<JobPosting, 'id' | 'postedDate' | 'applicantCount'>) => void;
  updateApplicationStatus: (appId: string, status: ApplicationStatus) => void;

  // AI Recommendations
  recommendedRankings: { job: JobPosting; match: JobMatchBreakdown }[];

  // Saved Job Alerts & Push Toasts
  savedAlerts: SavedJobAlert[];
  createSavedAlert: (data: Omit<SavedJobAlert, 'id' | 'createdAt' | 'matchesCount'>) => SavedJobAlert;
  updateSavedAlert: (id: string, updates: Partial<SavedJobAlert>) => void;
  toggleAlertActive: (id: string) => void;
  deleteSavedAlert: (id: string) => void;
  activePushToast: PushToast | null;
  setActivePushToast: (toast: PushToast | null) => void;
  dismissPushToast: () => void;
  simulateJobAlertTrigger: (alertId: string) => void;

  // Notifications
  notifications: AppNotification[];
  notificationPreferences: NotificationPreferences;
  unreadNotificationsCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  updateNotificationPreferences: (prefs: Partial<NotificationPreferences>) => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;

  // Profile management
  updateSeekerProfile: (updates: Partial<JobSeekerProfile>) => void;
  updateCompanyProfile: (updates: Partial<CompanyProfile>) => void;

  // Biometrics & Identity
  biometricRecord: BiometricVerificationRecord;
  updateBiometricRecord: (record: Partial<BiometricVerificationRecord>) => void;
  deleteBiometricData: () => void;

  // Location
  currentLocationName: string;
  isLocationEnabled: boolean;
  toggleLocation: (enabled: boolean) => void;

  // Modals
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isBiometricModalOpen: boolean;
  setIsBiometricModalOpen: (open: boolean) => void;
  isResumeModalOpen: boolean;
  setIsResumeModalOpen: (open: boolean) => void;
  isResumeBuilderOpen: boolean;
  setIsResumeBuilderOpen: (open: boolean) => void;
  isNotificationModalOpen: boolean;
  setIsNotificationModalOpen: (open: boolean) => void;
  isCoverLetterModalOpen: boolean;
  setIsCoverLetterModalOpen: (open: boolean) => void;
  coverLetterJob: JobPosting | null;
  setCoverLetterJob: (job: JobPosting | null) => void;
  isJobAlertModalOpen: boolean;
  setIsJobAlertModalOpen: (open: boolean) => void;
  prefilledAlertCriteria: Partial<SavedJobAlert> | null;
  setPrefilledAlertCriteria: (criteria: Partial<SavedJobAlert> | null) => void;

  // Search Filter Slide-over Panel
  isJobSearchFilterOpen: boolean;
  setIsJobSearchFilterOpen: (open: boolean) => void;
  toggleJobSearchFilter: () => void;

  // Offline & Service Worker Sync
  isOnline: boolean;
  isSimulatedOffline: boolean;
  toggleSimulateOffline: (override?: boolean) => void;
  pendingOfflineSyncCount: number;
  lastCacheSyncedAt: string | null;
  syncOfflineQueueNow: () => Promise<void>;
  isSyncingOffline: boolean;
  offlineQueue: OfflineQueueItem[];
  refreshOfflineCache: () => void;
}

const DEFAULT_SEEKER: JobSeekerProfile = {
  id: 'user_aarav_01',
  fullName: 'Aarav Sharma',
  headline: 'Full Stack Engineer & Distributed Systems Enthusiast',
  email: 'aarav.sharma@example.com',
  phone: '+91 98765 43210',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  location: 'Bangalore, Karnataka',
  currentLat: 12.9716,
  currentLng: 77.5946,
  shareLocation: true,
  expectedSalary: {
    min: 18,
    max: 28,
    currency: 'INR',
    period: 'year',
  },
  preferredRoles: ['Full Stack Developer', 'Frontend Engineer', 'Backend Engineer'],
  preferredLocations: ['Bangalore', 'Remote', 'Hyderabad'],
  skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'Tailwind CSS', 'Redis'],
  languages: ['English (Fluent)', 'Hindi (Native)'],
  bio: 'Final year B.Tech CS undergrad at IIIT Bangalore with 1 previous internship at an early-stage SaaS startup. Passionate about web performance, clean architecture, and Apple design guidelines.',
  education: [
    {
      id: 'edu_1',
      institution: 'IIIT Bangalore',
      degree: 'B.Tech in Computer Science',
      fieldOfStudy: 'Computer Science & Engineering',
      startYear: '2021',
      endYear: '2025',
      grade: '8.9 CGPA',
    },
  ],
  experience: [
    {
      id: 'exp_1',
      company: 'Klarity Technologies',
      role: 'Frontend Engineering Intern',
      location: 'Bangalore (Hybrid)',
      startDate: 'May 2024',
      endDate: 'Aug 2024',
      current: false,
      description: 'Built customer onboarding funnel reducing drop-off by 18%. Refactored dashboard state using TypeScript and React 19.',
    },
  ],
  projects: [
    {
      id: 'proj_1',
      title: 'DevPulse - Realtime Performance Monitor',
      description: 'Distributed latency benchmarking dashboard with WebSockets and Redis timeseries.',
      technologies: ['React', 'TypeScript', 'Go', 'Redis'],
      github: 'https://github.com/aarav/devpulse',
    },
    {
      id: 'proj_2',
      title: 'VocalFlow - Accessible Screen Reader Assistant',
      description: 'AI-grounded browser accessibility extension with zero-latency audio synthesis.',
      technologies: ['TypeScript', 'WebAudio API', 'Tailwind CSS'],
      github: 'https://github.com/aarav/vocalflow',
    },
  ],
  certifications: [
    {
      id: 'cert_1',
      name: 'AWS Certified Cloud Practitioner',
      issuer: 'Amazon Web Services',
      issueDate: 'Jan 2024',
      credentialUrl: 'https://aws.amazon.com',
    },
  ],
  links: {
    github: 'https://github.com/aaravsharma',
    linkedin: 'https://linkedin.com/in/aarav-sharma-dev',
    portfolio: 'https://aarav.dev',
  },
  resumeFileName: 'Aarav_Sharma_Resume_2026.pdf',
  resumeUrl: '#',
  resumeParsedAt: '2026-10-15',
  completenessScore: 85,
  isIdentityVerified: true,
  verificationBadgeAwardedAt: '2026-10-18',
};

const DEFAULT_COMPANY: CompanyProfile = {
  id: 'comp_google',
  name: 'Google India',
  tagline: 'Organizing the world’s information and making it universally accessible and useful.',
  description: 'Google India Engineering centers in Bangalore and Hyderabad develop products for global users across Search, Workspace, Android, Cloud, and Payments.',
  domain: 'google.com',
  workEmail: 'careers-in@google.com',
  phone: '+91 80 6721 8000',
  website: 'https://about.google',
  linkedinUrl: 'https://linkedin.com/company/google',
  gstCinNumber: '29AAACG1234A1Z5',
  verifiedStatus: 'verified',
  logoUrl: 'https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=80',
  headquarters: 'Bangalore, Karnataka',
  companySize: '10,000+ employees',
  industry: 'Technology & Internet',
  foundedYear: '1998',
};

const DEFAULT_BIOMETRICS: BiometricVerificationRecord = {
  id: 'bio_rec_01',
  userId: 'user_aarav_01',
  status: 'verified',
  consentGiven: true,
  consentTimestamp: '2026-10-18T10:30:00Z',
  livenessChecks: {
    blinkDetected: true,
    headTurnDetected: true,
    smileDetected: true,
  },
  idDocumentType: 'aadhaar',
  idDocumentFileName: 'government_id_verified.enc',
  confidenceScore: 97.4,
  verifiedAt: '2026-10-18T10:32:15Z',
  dataEncrypted: true,
};

const DEFAULT_APPLICATIONS: JobApplication[] = [
  {
    id: 'app_01',
    jobId: 'job_google_01',
    seekerId: 'user_aarav_01',
    seekerName: 'Aarav Sharma',
    seekerEmail: 'aarav.sharma@example.com',
    seekerHeadline: 'Full Stack Engineer & Distributed Systems Enthusiast',
    seekerSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
    jobTitle: 'Software Engineer II (Full Stack)',
    companyName: 'Google India',
    appliedDate: 'Oct 20, 2026',
    status: 'interview',
    statusHistory: [
      { status: 'applied', timestamp: 'Oct 20, 2026 09:30 AM' },
      { status: 'viewed', timestamp: 'Oct 20, 2026 02:15 PM' },
      { status: 'shortlisted', timestamp: 'Oct 21, 2026 11:00 AM' },
      { status: 'interview', timestamp: 'Oct 22, 2026 04:30 PM', note: 'Technical Round 1 scheduled for Friday 3:00 PM via Google Meet' },
    ],
    coverLetter: 'Dear Google India Hiring Team, I am deeply excited to apply for the Software Engineer II role. Having engineered performant React architectures and distributed microservices, I look forward to contributing to Google Workspace.',
    matchScore: 94,
  },
  {
    id: 'app_02',
    jobId: 'job_razorpay_02',
    seekerId: 'user_aarav_01',
    seekerName: 'Aarav Sharma',
    seekerEmail: 'aarav.sharma@example.com',
    seekerHeadline: 'Full Stack Engineer & Distributed Systems Enthusiast',
    seekerSkills: ['React', 'TypeScript', 'PostgreSQL', 'Redis'],
    jobTitle: 'Product Engineer - Payments Gateway',
    companyName: 'Razorpay',
    appliedDate: 'Oct 19, 2026',
    status: 'shortlisted',
    statusHistory: [
      { status: 'applied', timestamp: 'Oct 19, 2026 11:15 AM' },
      { status: 'viewed', timestamp: 'Oct 20, 2026 10:00 AM' },
      { status: 'shortlisted', timestamp: 'Oct 21, 2026 03:45 PM', note: 'Recruiter reviewed your GitHub projects and shortlisted your profile' },
    ],
    matchScore: 91,
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [currentRole, setCurrentRole] = useState<UserRole>('seeker');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('mobile_ios');

  // System-wide Theme (Dark / Light)
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dhruva_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark';
  });

  const setTheme = useCallback((newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('dhruva_theme', newTheme);
    } catch {
      // storage unavailable
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('dhruva_theme', next);
      } catch {
        // storage unavailable
      }
      return next;
    });
  }, []);

  // Sync theme with DOM root classList
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
        root.classList.remove('light');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        root.classList.add('light');
        root.style.colorScheme = 'light';
      }
    }
  }, [theme]);

  const [activeTab, setActiveTab] = useState<'home' | 'search' | 'applications' | 'messages' | 'profile'>('home');
  const [companyTab, setCompanyTab] = useState<'dashboard' | 'jobs' | 'applicants' | 'post_job'>('dashboard');

  const [user, setUser] = useState<JobSeekerProfile>(() => {
    const completeness = calculateProfileCompleteness(DEFAULT_SEEKER);
    return { ...DEFAULT_SEEKER, completenessScore: completeness.score };
  });

  const [company, setCompany] = useState<CompanyProfile>(DEFAULT_COMPANY);

  // Offline and Service Worker State
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(() => getSimulatedOfflineState());
  const [isSystemOnline, setIsSystemOnline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [offlineQueue, setOfflineQueue] = useState<OfflineQueueItem[]>(() => getOfflineQueue());
  const [isSyncingOffline, setIsSyncingOffline] = useState<boolean>(false);
  const [lastCacheSyncedAt, setLastCacheSyncedAt] = useState<string | null>(() => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  // Computed online status
  const isOnline = useMemo(() => {
    return isSystemOnline && !isSimulatedOffline;
  }, [isSystemOnline, isSimulatedOffline]);

  // Jobs with Offline Persistence
  const [jobs, setJobs] = useState<JobPosting[]>(() => {
    const cached = loadJobsFromOfflineCache();
    if (cached && cached.length > 0) return cached;
    saveJobsToOfflineCache(INITIAL_JOBS);
    return INITIAL_JOBS;
  });

  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(INITIAL_JOBS[0]);
  const [savedJobIds, setSavedJobIds] = useState<string[]>(['job_stripe_03']);

  // Applications with Offline Persistence
  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const cached = loadApplicationsFromOfflineCache();
    if (cached && cached.length > 0) return cached;
    saveApplicationsToOfflineCache(DEFAULT_APPLICATIONS);
    return DEFAULT_APPLICATIONS;
  });

  const [biometricRecord, setBiometricRecord] = useState<BiometricVerificationRecord>(DEFAULT_BIOMETRICS);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>(DEFAULT_NOTIFICATION_PREFERENCES);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState<boolean>(false);

  // Saved Job Alerts & Push Toasts
  const [savedAlerts, setSavedAlerts] = useState<SavedJobAlert[]>(INITIAL_SAVED_ALERTS);
  const [activePushToast, setActivePushToast] = useState<PushToast | null>(null);
  const [isJobAlertModalOpen, setIsJobAlertModalOpen] = useState<boolean>(false);
  const [prefilledAlertCriteria, setPrefilledAlertCriteria] = useState<Partial<SavedJobAlert> | null>(null);

  // Cover Letter Modal
  const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState<boolean>(false);
  const [coverLetterJob, setCoverLetterJob] = useState<JobPosting | null>(null);

  const [isLocationEnabled, setIsLocationEnabled] = useState<boolean>(true);
  const [currentLocationName, setCurrentLocationName] = useState<string>('Bangalore, Karnataka');

  // Modals
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState<boolean>(false);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState<boolean>(false);
  const [isResumeBuilderOpen, setIsResumeBuilderOpen] = useState<boolean>(false);
  const [isJobSearchFilterOpen, setIsJobSearchFilterOpen] = useState<boolean>(false);

  const toggleJobSearchFilter = useCallback(() => {
    setIsJobSearchFilterOpen((prev) => !prev);
  }, []);

  // AI-Powered Job Recommendations
  const recommendedRankings = useMemo(() => {
    return rankJobsForCandidate(jobs, user, savedJobIds, applications);
  }, [jobs, user, savedJobIds, applications]);

  // Unread notification count filtered by preferences
  const unreadNotificationsCount = useMemo(() => {
    return filterNotificationsByPreference(notifications, notificationPreferences).filter((n) => !n.read).length;
  }, [notifications, notificationPreferences]);

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const updateNotificationPreferences = (prefs: Partial<NotificationPreferences>) => {
    setNotificationPreferences((prev) => ({ ...prev, ...prefs }));
  };

  const addNotification = useCallback((notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  }, []);

  // Sync Offline Queue to ATS / Cloud
  const syncOfflineQueueNow = useCallback(async () => {
    const currentQueue = getOfflineQueue();
    if (currentQueue.length === 0) return;

    setIsSyncingOffline(true);
    // Simulate ATS sync roundtrip
    await new Promise((res) => setTimeout(res, 600));

    const pendingCount = currentQueue.length;
    const appliedJobTitles: string[] = [];

    // Process offline applications
    setApplications((prevApps) => {
      let updatedApps = [...prevApps];
      currentQueue.forEach((item) => {
        if (item.type === 'APPLY_JOB') {
          const appIndex = updatedApps.findIndex(
            (a) => a.id === item.payload.applicationId || a.jobId === item.payload.jobId
          );
          if (appIndex >= 0) {
            appliedJobTitles.push(item.payload.jobTitle || 'Role');
            updatedApps[appIndex] = {
              ...updatedApps[appIndex],
              isOfflinePending: false,
              syncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              statusHistory: [
                ...updatedApps[appIndex].statusHistory,
                {
                  status: updatedApps[appIndex].status,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  note: 'Synced with company ATS via background service worker.',
                },
              ],
            };
          }
        }
      });
      saveApplicationsToOfflineCache(updatedApps);
      return updatedApps;
    });

    // Increment applicant counts on jobs
    setJobs((prevJobs) => {
      let updatedJobs = [...prevJobs];
      currentQueue.forEach((item) => {
        if (item.type === 'APPLY_JOB' && item.payload.jobId) {
          updatedJobs = updatedJobs.map((j) =>
            j.id === item.payload.jobId ? { ...j, applicantCount: j.applicantCount + 1 } : j
          );
        }
      });
      saveJobsToOfflineCache(updatedJobs);
      return updatedJobs;
    });

    // Clear queue in localStorage and state
    clearOfflineQueue();
    setOfflineQueue([]);
    setLastCacheSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setIsSyncingOffline(false);

    // Provide feedback toast & in-app notification
    const summary =
      appliedJobTitles.length > 0
        ? `Synchronized ${pendingCount} offline action(s): ${appliedJobTitles.join(', ')} transmitted to recruiter ATS.`
        : `Synchronized ${pendingCount} offline action(s) with cloud server.`;

    setActivePushToast({
      id: `toast_sync_${Date.now()}`,
      title: 'ATS Cloud Synchronized',
      subtitle: 'Service Worker Background Sync',
      message: summary,
      timestamp: 'now',
    });

    addNotification({
      category: 'application_update',
      title: 'Offline Sync Complete',
      message: summary,
    });
  }, [addNotification]);

  // Online / Offline Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsSystemOnline(true);
      if (!isSimulatedOffline) {
        syncOfflineQueueNow();
      }
    };
    const handleOffline = () => {
      setIsSystemOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isSimulatedOffline, syncOfflineQueueNow]);

  const toggleSimulateOffline = (override?: boolean) => {
    setIsSimulatedOffline((prev) => {
      const next = typeof override === 'boolean' ? override : !prev;
      setSimulatedOfflineState(next);
      if (!next && isSystemOnline) {
        setTimeout(() => {
          syncOfflineQueueNow();
        }, 300);
      }
      return next;
    });
  };

  const refreshOfflineCache = () => {
    saveJobsToOfflineCache(jobs);
    saveApplicationsToOfflineCache(applications);
    setLastCacheSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setActivePushToast({
      id: `toast_cache_${Date.now()}`,
      title: 'Offline Cache Refreshed',
      subtitle: `${jobs.length} Jobs & ${applications.length} Applications`,
      message: 'Latest job postings and interview timelines are updated for offline use.',
      timestamp: 'now',
    });
  };

  // Recalculate profile score on updates
  const updateSeekerProfile = (updates: Partial<JobSeekerProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      const { score } = calculateProfileCompleteness(updated);
      return { ...updated, completenessScore: score };
    });
  };

  const updateCompanyProfile = (updates: Partial<CompanyProfile>) => {
    setCompany((prev) => ({ ...prev, ...updates }));
  };

  const toggleSaveJob = (jobId: string) => {
    setSavedJobIds((prev) => {
      const isSaving = !prev.includes(jobId);
      const next = isSaving ? [...prev, jobId] : prev.filter((id) => id !== jobId);
      if (isSaving) {
        const job = jobs.find((j) => j.id === jobId);
        if (job) {
          addNotification({
            category: 'job_match',
            title: isOnline ? 'Role Saved to Tracker' : 'Role Saved (Offline Cache)',
            message: `Added ${job.title} at ${job.companyName} to your saved collection.`,
            jobId,
          });
        }
      }
      if (!isOnline) {
        enqueueOfflineAction(isSaving ? 'SAVE_JOB' : 'UNSAVE_JOB', { jobId });
        setOfflineQueue(getOfflineQueue());
      }
      return next;
    });
  };

  const applyToJob = (jobId: string, coverLetter?: string, answers?: Record<string, string>) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    // Check if already applied
    const existing = applications.find((a) => a.jobId === jobId);
    if (existing) return;

    const appId = `app_${Date.now()}`;
    const isCurrentlyOffline = !isOnline;

    const newApp: JobApplication = {
      id: appId,
      jobId,
      seekerId: user.id,
      seekerName: user.fullName,
      seekerEmail: user.email,
      seekerHeadline: user.headline,
      seekerSkills: user.skills,
      jobTitle: job.title,
      companyName: job.companyName,
      appliedDate: isCurrentlyOffline ? 'Today (Cached)' : 'Today',
      status: 'applied',
      statusHistory: [
        {
          status: 'applied',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          note: isCurrentlyOffline
            ? 'Cached on device. Queued for automatic ATS sync when connection is restored.'
            : 'Submitted directly to employer ATS.',
        },
      ],
      coverLetter,
      screeningAnswers: answers,
      matchScore: Math.floor(Math.random() * 15) + 85,
      isOfflinePending: isCurrentlyOffline,
    };

    const nextApps = [newApp, ...applications];
    setApplications(nextApps);
    saveApplicationsToOfflineCache(nextApps);

    if (isCurrentlyOffline) {
      // Queue offline action
      enqueueOfflineAction('APPLY_JOB', {
        jobId,
        jobTitle: job.title,
        companyName: job.companyName,
        applicationId: appId,
        coverLetter,
        screeningAnswers: answers,
      });
      setOfflineQueue(getOfflineQueue());

      setActivePushToast({
        id: `toast_offline_${Date.now()}`,
        title: 'Application Saved Offline',
        subtitle: `${job.companyName} · Offline Cache`,
        message: `Your verified profile and cover letter are cached on-device. They will be submitted the moment you reconnect.`,
        timestamp: 'now',
        jobId: job.id,
        companyLogo: job.companyLogo,
        location: job.location,
      });

      addNotification({
        category: 'application_update',
        title: 'Application Queued (Offline)',
        message: `Your application for ${job.title} at ${job.companyName} is safely cached and will auto-sync once online.`,
        jobId,
        applicationId: newApp.id,
      });
    } else {
      // Increment applicant count on job
      const nextJobs = jobs.map((j) =>
        j.id === jobId ? { ...j, applicantCount: j.applicantCount + 1 } : j
      );
      setJobs(nextJobs);
      saveJobsToOfflineCache(nextJobs);

      addNotification({
        category: 'application_update',
        title: 'Application Dispatched',
        message: `Your verified profile and resume were delivered to ${job.companyName} for ${job.title}.`,
        jobId,
        applicationId: newApp.id,
      });
    }
  };

  // Job Alert functions
  const createSavedAlert = (data: Omit<SavedJobAlert, 'id' | 'createdAt' | 'matchesCount'>): SavedJobAlert => {
    const newAlert: SavedJobAlert = {
      ...data,
      id: `alert_${Date.now()}`,
      createdAt: 'Just now',
      matchesCount: 0,
    };
    setSavedAlerts((prev) => [newAlert, ...prev]);
    addNotification({
      category: 'job_match',
      title: 'Job Alert Configured',
      message: `Monitoring real-time postings for "${newAlert.title}". You will receive instant notifications on match.`,
    });
    return newAlert;
  };

  const updateSavedAlert = (id: string, updates: Partial<SavedJobAlert>) => {
    setSavedAlerts((prev) =>
      prev.map((alert) => (alert.id === id ? { ...alert, ...updates } : alert))
    );
  };

  const toggleAlertActive = (id: string) => {
    setSavedAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, active: !alert.active } : alert
      )
    );
  };

  const deleteSavedAlert = (id: string) => {
    setSavedAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const dismissPushToast = () => {
    setActivePushToast(null);
  };

  const simulateJobAlertTrigger = (alertId: string) => {
    const alert = savedAlerts.find((a) => a.id === alertId);
    if (!alert) return;

    // Find a matching job in current list, or fallback
    const matching = jobs.find((j) => {
      if (alert.query && !`${j.title} ${j.companyName} ${j.skillsRequired.join(' ')}`.toLowerCase().includes(alert.query.toLowerCase())) {
        return false;
      }
      return true;
    }) || jobs[0];

    // Increment matchesCount and update lastTriggeredAt
    setSavedAlerts((prev) =>
      prev.map((a) =>
        a.id === alertId
          ? { ...a, matchesCount: a.matchesCount + 1, lastTriggeredAt: 'Just now' }
          : a
      )
    );

    // Fire live push notification banner
    setActivePushToast({
      id: `toast_${Date.now()}`,
      title: `Match Alert: ${alert.title}`,
      subtitle: `${matching.companyName} · ${matching.location}`,
      message: `${matching.title} (${matching.salary.displayString}) matches your search criteria. Tap to inspect.`,
      timestamp: 'now',
      jobId: matching.id,
      companyLogo: matching.companyLogo,
      salary: matching.salary.displayString,
      location: matching.location,
    });

    // Also add to in-app notification center
    addNotification({
      category: 'job_match',
      title: `Alert Match: ${matching.companyName}`,
      message: `${matching.title} matched your saved alert "${alert.title}".`,
      jobId: matching.id,
    });
  };

  const postJob = (jobData: Omit<JobPosting, 'id' | 'postedDate' | 'applicantCount'>) => {
    const newJob: JobPosting = {
      ...jobData,
      id: `job_direct_${Date.now()}`,
      postedDate: 'Just now',
      applicantCount: 0,
      source: 'Dhruva Direct',
    };
    setJobs((prev) => [newJob, ...prev]);

    // Check saved alerts against the new job posting
    const matchedAlerts = findMatchingAlertsForJob(newJob, savedAlerts);
    if (matchedAlerts.length > 0) {
      setSavedAlerts((prev) =>
        prev.map((a) => {
          if (matchedAlerts.some((m) => m.id === a.id)) {
            return {
              ...a,
              matchesCount: a.matchesCount + 1,
              lastTriggeredAt: 'Just now',
            };
          }
          return a;
        })
      );

      // Trigger push toast for candidate if any matched alert has pushNotification enabled
      const pushAlert = matchedAlerts.find((a) => a.pushNotification);
      if (pushAlert) {
        setActivePushToast({
          id: `toast_${Date.now()}`,
          title: `Job Alert: ${pushAlert.title}`,
          subtitle: `${newJob.companyName} · ${newJob.location}`,
          message: `${newJob.title} (${newJob.salary.displayString}) just posted! Tap to apply.`,
          timestamp: 'now',
          jobId: newJob.id,
          salary: newJob.salary.displayString,
          location: newJob.location,
        });
      }
    }

    // Send job match notification to seeker
    addNotification({
      category: 'job_match',
      title: `New Verified Job: ${newJob.companyName}`,
      message: `${newJob.title} was just published in ${newJob.location}. High skill alignment.`,
      jobId: newJob.id,
    });
  };

  const updateApplicationStatus = (appId: string, status: ApplicationStatus) => {
    setApplications((prev) =>
      prev.map((app) => {
        if (app.id !== appId) return app;
        const updated = {
          ...app,
          status,
          statusHistory: [
            ...app.statusHistory,
            { status, timestamp: new Date().toLocaleString() },
          ],
        };
        // Trigger candidate notification on status change
        addNotification({
          category: 'application_update',
          title: `Status Update: ${app.companyName}`,
          message: `Your application for ${app.jobTitle} moved to "${status.toUpperCase()}".`,
          applicationId: app.id,
        });
        return updated;
      })
    );
  };

  const updateBiometricRecord = (record: Partial<BiometricVerificationRecord>) => {
    setBiometricRecord((prev) => {
      const updated = { ...prev, ...record };
      if (updated.status === 'verified') {
        updateSeekerProfile({ isIdentityVerified: true });
        addNotification({
          category: 'account_verification',
          title: 'Identity Verification Approved',
          message: 'Biometric liveness confirmed. Your profile now features the Verified Seeker Trust Badge.',
        });
      }
      return updated;
    });
  };

  const deleteBiometricData = () => {
    setBiometricRecord({
      id: `bio_${Date.now()}`,
      userId: user.id,
      status: 'unverified',
      consentGiven: false,
      livenessChecks: {
        blinkDetected: false,
        headTurnDetected: false,
        smileDetected: false,
      },
      confidenceScore: 0,
      dataEncrypted: false,
    });
    updateSeekerProfile({ isIdentityVerified: false });
    addNotification({
      category: 'account_verification',
      title: 'Biometric Data Deleted',
      message: 'Per DPDP Act rights, all facial biometric embeddings and ID scans were permanently purged.',
    });
  };

  const toggleLocation = (enabled: boolean) => {
    setIsLocationEnabled(enabled);
    updateSeekerProfile({ shareLocation: enabled });
    if (enabled && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          updateSeekerProfile({
            currentLat: pos.coords.latitude,
            currentLng: pos.coords.longitude,
          });
          setCurrentLocationName('Current Location (GPS Active)');
        },
        () => {
          setCurrentLocationName('Bangalore, Karnataka (Default)');
        }
      );
    } else {
      setCurrentLocationName('Location Disabled');
    }
  };

  const login = (phoneOrEmail: string, role: UserRole) => {
    setIsAuthenticated(true);
    setCurrentRole(role);
    if (role === 'company') {
      setViewportMode('desktop_company');
    } else {
      setViewportMode('mobile_ios');
    }
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAuthModalOpen(true);
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
    if (role === 'company') {
      setViewportMode('desktop_company');
    } else if (role === 'seeker') {
      setViewportMode('mobile_ios');
    }
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        currentRole,
        user,
        company,
        login,
        logout,
        switchRole,
        viewportMode,
        setViewportMode,
        theme,
        setTheme,
        toggleTheme,
        activeTab,
        setActiveTab,
        companyTab,
        setCompanyTab,
        jobs,
        selectedJob,
        setSelectedJob,
        savedJobIds,
        toggleSaveJob,
        applications,
        applyToJob,
        postJob,
        updateApplicationStatus,
        recommendedRankings,
        notifications,
        notificationPreferences,
        unreadNotificationsCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        updateNotificationPreferences,
        addNotification,
        updateSeekerProfile,
        updateCompanyProfile,
        biometricRecord,
        updateBiometricRecord,
        deleteBiometricData,
        currentLocationName,
        isLocationEnabled,
        toggleLocation,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isBiometricModalOpen,
        setIsBiometricModalOpen,
        isResumeModalOpen,
        setIsResumeModalOpen,
        isResumeBuilderOpen,
        setIsResumeBuilderOpen,
        isNotificationModalOpen,
        setIsNotificationModalOpen,
        isCoverLetterModalOpen,
        setIsCoverLetterModalOpen,
        coverLetterJob,
        setCoverLetterJob,
        savedAlerts,
        createSavedAlert,
        updateSavedAlert,
        toggleAlertActive,
        deleteSavedAlert,
        activePushToast,
        setActivePushToast,
        dismissPushToast,
        simulateJobAlertTrigger,
        isJobAlertModalOpen,
        setIsJobAlertModalOpen,
        prefilledAlertCriteria,
        setPrefilledAlertCriteria,
        isJobSearchFilterOpen,
        setIsJobSearchFilterOpen,
        toggleJobSearchFilter,
        // Offline Sync
        isOnline,
        isSimulatedOffline,
        toggleSimulateOffline,
        pendingOfflineSyncCount: offlineQueue.length,
        lastCacheSyncedAt,
        syncOfflineQueueNow,
        isSyncingOffline,
        offlineQueue,
        refreshOfflineCache,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
