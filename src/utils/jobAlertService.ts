import { JobPosting, SavedJobAlert } from '../types';

export const INITIAL_SAVED_ALERTS: SavedJobAlert[] = [
  {
    id: 'alert_1',
    title: 'React & TypeScript · Bangalore',
    query: 'React',
    location: 'Bangalore',
    workMode: 'ALL',
    currency: 'INR',
    minSalary: 20,
    frequency: 'instant',
    pushNotification: true,
    emailNotification: true,
    active: true,
    createdAt: 'Oct 18, 2026',
    lastTriggeredAt: '2 hours ago',
    matchesCount: 4,
  },
  {
    id: 'alert_2',
    title: 'Remote US/Global Tech Roles',
    query: 'Frontend',
    location: '',
    workMode: 'remote',
    currency: 'USD',
    minSalary: 100,
    frequency: 'instant',
    pushNotification: true,
    emailNotification: false,
    active: true,
    createdAt: 'Oct 20, 2026',
    lastTriggeredAt: 'Yesterday',
    matchesCount: 2,
  },
];

export function matchJobAgainstAlert(job: JobPosting, alert: SavedJobAlert): boolean {
  if (!alert.active) return false;

  // 1. Keyword query match
  if (alert.query?.trim()) {
    const q = alert.query.toLowerCase().trim();
    const searchableText = `${job.title} ${job.companyName} ${job.skillsRequired.join(' ')} ${job.description}`.toLowerCase();
    if (!searchableText.includes(q)) {
      return false;
    }
  }

  // 2. Location match
  if (alert.location?.trim()) {
    const locFilter = alert.location.toLowerCase().trim();
    const jobLoc = job.location.toLowerCase();
    if (!jobLoc.includes(locFilter) && job.workMode !== 'remote') {
      return false;
    }
  }

  // 3. Work mode match
  if (alert.workMode && alert.workMode !== 'ALL') {
    if (job.workMode !== alert.workMode) {
      return false;
    }
  }

  // 4. Currency match
  if (alert.currency && alert.currency !== 'ALL') {
    if (job.salary.currency !== alert.currency) {
      return false;
    }
  }

  // 5. Min salary match
  if (alert.minSalary && alert.minSalary > 0) {
    if (job.salary.max < alert.minSalary) {
      return false;
    }
  }

  return true;
}

export function findMatchingAlertsForJob(
  job: JobPosting,
  alerts: SavedJobAlert[]
): SavedJobAlert[] {
  return alerts.filter((alert) => matchJobAgainstAlert(job, alert));
}
