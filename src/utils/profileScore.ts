import { JobSeekerProfile } from '../types';

export interface ScoreCriterion {
  key: string;
  label: string;
  weight: number;
  isComplete: (profile: JobSeekerProfile) => boolean;
}

export const PROFILE_SCORE_CRITERIA: ScoreCriterion[] = [
  {
    key: 'basic_info',
    label: 'Full Name & Professional Headline',
    weight: 15,
    isComplete: (p) => Boolean(p.fullName?.trim() && p.headline?.trim()),
  },
  {
    key: 'contact',
    label: 'Verified Phone & Email',
    weight: 15,
    isComplete: (p) => Boolean(p.email?.includes('@') && p.phone?.length >= 10),
  },
  {
    key: 'skills',
    label: 'Core Skills (at least 3)',
    weight: 15,
    isComplete: (p) => Array.isArray(p.skills) && p.skills.length >= 3,
  },
  {
    key: 'education',
    label: 'Education Details',
    weight: 15,
    isComplete: (p) => Array.isArray(p.education) && p.education.length > 0,
  },
  {
    key: 'experience_or_projects',
    label: 'Work Experience or Projects',
    weight: 15,
    isComplete: (p) =>
      (Array.isArray(p.experience) && p.experience.length > 0) ||
      (Array.isArray(p.projects) && p.projects.length > 0),
  },
  {
    key: 'resume',
    label: 'Resume Attached / Parsed',
    weight: 15,
    isComplete: (p) => Boolean(p.resumeFileName || p.resumeUrl),
  },
  {
    key: 'identity_verified',
    label: 'Identity & Liveness Verified',
    weight: 10,
    isComplete: (p) => Boolean(p.isIdentityVerified),
  },
];

export function calculateProfileCompleteness(profile: JobSeekerProfile): {
  score: number;
  completedCount: number;
  totalCount: number;
  missingCriteria: { key: string; label: string; weight: number }[];
} {
  let score = 0;
  let completedCount = 0;
  const missingCriteria: { key: string; label: string; weight: number }[] = [];

  for (const criterion of PROFILE_SCORE_CRITERIA) {
    if (criterion.isComplete(profile)) {
      score += criterion.weight;
      completedCount++;
    } else {
      missingCriteria.push({
        key: criterion.key,
        label: criterion.label,
        weight: criterion.weight,
      });
    }
  }

  return {
    score: Math.min(100, Math.max(0, score)),
    completedCount,
    totalCount: PROFILE_SCORE_CRITERIA.length,
    missingCriteria,
  };
}
