import { AppNotification, NotificationPreferences, NotificationCategory } from '../types';

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  pushEnabled: true,
  emailEnabled: true,
  inAppEnabled: true,
  jobMatches: true,
  applicationUpdates: true,
  interviewReminders: true,
  recruiterMessages: true,
  verificationAlerts: true,
  emailDigestCadence: 'daily',
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    category: 'interview_reminder',
    title: 'Interview Scheduled: Google India',
    message: 'Technical Round 1 is set for Friday, 3:00 PM IST via Google Meet. Review key distributed systems topics.',
    timestamp: '10 mins ago',
    read: false,
    actionLabel: 'Join Google Meet',
    actionUrl: 'https://meet.google.com/abc-defg-hij',
    applicationId: 'app_01',
  },
  {
    id: 'notif_2',
    category: 'application_update',
    title: 'Application Shortlisted',
    message: 'Razorpay has shortlisted your profile for Product Engineer - Payments Gateway.',
    timestamp: '2 hours ago',
    read: false,
    applicationId: 'app_02',
  },
  {
    id: 'notif_3',
    category: 'job_match',
    title: '95% Match: Stripe Remote Role',
    message: 'Global Frontend Infrastructure Engineer at Stripe ($130k - $175k/yr) matches 5 of your skills.',
    timestamp: '5 hours ago',
    read: false,
    jobId: 'job_stripe_03',
  },
  {
    id: 'notif_4',
    category: 'recruiter_message',
    title: 'New Message from Priya Sundaram',
    message: '“Our engineering team reviewed your DevPulse real-time project and was impressed with the Redis latency architecture...”',
    timestamp: 'Yesterday',
    read: true,
  },
  {
    id: 'notif_5',
    category: 'account_verification',
    title: 'Identity Verification Approved',
    message: 'Your facial biometric liveness check and Aadhaar document have been encrypted and verified. Verified Seeker badge is active.',
    timestamp: '2 days ago',
    read: true,
  },
];

export function filterNotificationsByPreference(
  notifications: AppNotification[],
  prefs: NotificationPreferences,
  categoryFilter: 'ALL' | NotificationCategory = 'ALL'
): AppNotification[] {
  return notifications.filter((notif) => {
    // Category filter
    if (categoryFilter !== 'ALL' && notif.category !== categoryFilter) {
      return false;
    }

    // User granular preferences
    if (notif.category === 'job_match' && !prefs.jobMatches) return false;
    if (notif.category === 'application_update' && !prefs.applicationUpdates) return false;
    if (notif.category === 'interview_reminder' && !prefs.interviewReminders) return false;
    if (notif.category === 'recruiter_message' && !prefs.recruiterMessages) return false;
    if (notif.category === 'account_verification' && !prefs.verificationAlerts) return false;

    return true;
  });
}
