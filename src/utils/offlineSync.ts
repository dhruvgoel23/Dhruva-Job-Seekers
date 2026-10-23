import { JobPosting, JobApplication, ApplicationStatus } from '../types';

export type OfflineActionType =
  | 'APPLY_JOB'
  | 'SAVE_JOB'
  | 'UNSAVE_JOB'
  | 'UPDATE_APPLICATION_STATUS';

export interface OfflineQueueItem {
  id: string;
  type: OfflineActionType;
  timestamp: string;
  payload: {
    jobId?: string;
    jobTitle?: string;
    companyName?: string;
    applicationId?: string;
    coverLetter?: string;
    screeningAnswers?: Record<string, string>;
    status?: ApplicationStatus;
    [key: string]: any;
  };
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  retryCount: number;
}

export interface OfflineCacheStats {
  cachedJobsCount: number;
  cachedApplicationsCount: number;
  pendingSyncCount: number;
  lastSyncedAt: string | null;
  storageUsageKb: number;
  isServiceWorkerActive: boolean;
}

const STORAGE_KEYS = {
  JOBS: 'dhruva_offline_jobs_v1',
  APPLICATIONS: 'dhruva_offline_applications_v1',
  QUEUE: 'dhruva_offline_queue_v1',
  LAST_SYNC: 'dhruva_offline_last_sync_v1',
  SIMULATE_OFFLINE: 'dhruva_simulate_offline_v1',
};

// Safe localStorage wrapper
function safeGetItem(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(key);
    }
  } catch (e) {
    console.warn(`[OfflineSync] Unable to read localStorage key: ${key}`, e);
  }
  return null;
}

function safeSetItem(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(key, value);
    }
  } catch (e) {
    console.warn(`[OfflineSync] Unable to write localStorage key: ${key}`, e);
  }
}

// Job Cache Operations
export function saveJobsToOfflineCache(jobs: JobPosting[]): void {
  safeSetItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  safeSetItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
}

export function loadJobsFromOfflineCache(): JobPosting[] | null {
  const data = safeGetItem(STORAGE_KEYS.JOBS);
  if (!data) return null;
  try {
    return JSON.parse(data) as JobPosting[];
  } catch (e) {
    console.error('[OfflineSync] Failed to parse cached jobs', e);
    return null;
  }
}

// Applications Cache Operations
export function saveApplicationsToOfflineCache(applications: JobApplication[]): void {
  safeSetItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
}

export function loadApplicationsFromOfflineCache(): JobApplication[] | null {
  const data = safeGetItem(STORAGE_KEYS.APPLICATIONS);
  if (!data) return null;
  try {
    return JSON.parse(data) as JobApplication[];
  } catch (e) {
    console.error('[OfflineSync] Failed to parse cached applications', e);
    return null;
  }
}

// Offline Queue Operations
export function getOfflineQueue(): OfflineQueueItem[] {
  const data = safeGetItem(STORAGE_KEYS.QUEUE);
  if (!data) return [];
  try {
    return JSON.parse(data) as OfflineQueueItem[];
  } catch (e) {
    console.error('[OfflineSync] Failed to parse offline queue', e);
    return [];
  }
}

export function saveOfflineQueue(queue: OfflineQueueItem[]): void {
  safeSetItem(STORAGE_KEYS.QUEUE, JSON.stringify(queue));
}

export function enqueueOfflineAction(
  type: OfflineActionType,
  payload: OfflineQueueItem['payload']
): OfflineQueueItem {
  const queue = getOfflineQueue();
  const newItem: OfflineQueueItem = {
    id: `sync_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type,
    timestamp: new Date().toISOString(),
    payload,
    status: 'pending',
    retryCount: 0,
  };

  // Prevent duplicate applications for the same job in queue
  if (type === 'APPLY_JOB' && payload.jobId) {
    const existingIndex = queue.findIndex(
      (item) => item.type === 'APPLY_JOB' && item.payload.jobId === payload.jobId
    );
    if (existingIndex >= 0) {
      queue[existingIndex] = newItem; // update with latest answers/cover letter
      saveOfflineQueue(queue);
      return newItem;
    }
  }

  const updatedQueue = [...queue, newItem];
  saveOfflineQueue(updatedQueue);
  return newItem;
}

export function removeOfflineAction(id: string): void {
  const queue = getOfflineQueue();
  const filtered = queue.filter((item) => item.id !== id);
  saveOfflineQueue(filtered);
}

export function clearOfflineQueue(): void {
  safeSetItem(STORAGE_KEYS.QUEUE, JSON.stringify([]));
}

// Pure function for draining and synchronizing the queue
export async function processOfflineQueue(
  queue: OfflineQueueItem[],
  syncHandler: (item: OfflineQueueItem) => Promise<boolean>
): Promise<{
  syncedItems: OfflineQueueItem[];
  failedItems: OfflineQueueItem[];
  remainingQueue: OfflineQueueItem[];
}> {
  const syncedItems: OfflineQueueItem[] = [];
  const failedItems: OfflineQueueItem[] = [];
  const remainingQueue: OfflineQueueItem[] = [];

  for (const item of queue) {
    try {
      const success = await syncHandler(item);
      if (success) {
        syncedItems.push({ ...item, status: 'synced' });
      } else {
        const retried = {
          ...item,
          retryCount: item.retryCount + 1,
          status: item.retryCount >= 3 ? ('failed' as const) : ('pending' as const),
        };
        failedItems.push(retried);
        remainingQueue.push(retried);
      }
    } catch {
      const retried = {
        ...item,
        retryCount: item.retryCount + 1,
        status: item.retryCount >= 3 ? ('failed' as const) : ('pending' as const),
      };
      failedItems.push(retried);
      remainingQueue.push(retried);
    }
  }

  saveOfflineQueue(remainingQueue);
  return { syncedItems, failedItems, remainingQueue };
}

// Offline Filter & Search Logic (Works purely offline)
export function filterOfflineJobs(
  jobs: JobPosting[],
  query?: string,
  roleCategory?: string,
  workMode?: string,
  maxSalary?: number
): JobPosting[] {
  return jobs.filter((job) => {
    if (query && query.trim() !== '') {
      const q = query.toLowerCase().trim();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchCompany = job.companyName.toLowerCase().includes(q);
      const matchSkills = job.skillsRequired.some((s) => s.toLowerCase().includes(q));
      const matchLocation = job.location.toLowerCase().includes(q);
      if (!matchTitle && !matchCompany && !matchSkills && !matchLocation) {
        return false;
      }
    }

    if (roleCategory && roleCategory !== 'ALL' && roleCategory !== '') {
      if (job.roleCategory.toLowerCase() !== roleCategory.toLowerCase()) {
        return false;
      }
    }

    if (workMode && workMode !== 'ALL' && workMode !== '') {
      if (job.workMode.toLowerCase() !== workMode.toLowerCase()) {
        return false;
      }
    }

    if (maxSalary && maxSalary > 0) {
      if (job.salary.min > maxSalary) {
        return false;
      }
    }

    return true;
  });
}

// Simulated offline state toggle (for quick testing inside the preview frame)
export function getSimulatedOfflineState(): boolean {
  return safeGetItem(STORAGE_KEYS.SIMULATE_OFFLINE) === 'true';
}

export function setSimulatedOfflineState(offline: boolean): void {
  safeSetItem(STORAGE_KEYS.SIMULATE_OFFLINE, offline ? 'true' : 'false');
}

// Offline Storage Metrics
export function getOfflineStorageStats(): OfflineCacheStats {
  const jobs = loadJobsFromOfflineCache();
  const apps = loadApplicationsFromOfflineCache();
  const queue = getOfflineQueue();
  const lastSync = safeGetItem(STORAGE_KEYS.LAST_SYNC);

  let totalBytes = 0;
  for (const key of Object.values(STORAGE_KEYS)) {
    const val = safeGetItem(key);
    if (val) totalBytes += val.length * 2; // UTF-16 chars ~2 bytes
  }

  const isSwActive =
    typeof navigator !== 'undefined' &&
    'serviceWorker' in navigator &&
    !!navigator.serviceWorker.controller;

  return {
    cachedJobsCount: jobs ? jobs.length : 0,
    cachedApplicationsCount: apps ? apps.length : 0,
    pendingSyncCount: queue.filter((i) => i.status === 'pending').length,
    lastSyncedAt: lastSync,
    storageUsageKb: Math.round(totalBytes / 1024),
    isServiceWorkerActive: isSwActive,
  };
}
