import { JobPosting, TrustBadge } from '../types';

export interface ScamEvaluationResult {
  riskScore: number;
  riskFactors: string[];
  trustBadge: TrustBadge;
  isSafeToApply: boolean;
  cautionNotes: string[];
}

const SUSPICIOUS_KEYWORDS = [
  'registration fee',
  'processing fee',
  'security deposit',
  'laptop deposit',
  'send money',
  'pay to start',
  'telegram task',
  'youtube like earn',
  'daily payout guaranteed',
  'earn 5000 daily',
  'no interview direct joining',
  'no skills required high salary',
  'whatsapp resume directly to personal',
  'urgent requirement pay after training',
];

const FREE_EMAIL_DOMAINS = [
  'gmail.com',
  'yahoo.com',
  'hotmail.com',
  'outlook.com',
  'rediffmail.com',
  'protonmail.com',
];

export function evaluateJobRisk(job: Partial<JobPosting>): ScamEvaluationResult {
  const riskFactors: string[] = [];
  const cautionNotes: string[] = [];
  let riskScore = 0;

  const contentToCheck = `${job.title || ''} ${job.description || ''} ${(job.requirements || []).join(' ')}`.toLowerCase();

  // 1. Keyword analysis
  for (const keyword of SUSPICIOUS_KEYWORDS) {
    if (contentToCheck.includes(keyword)) {
      riskFactors.push(`Contains high-risk scam phrase: "${keyword}"`);
      riskScore += 35;
    }
  }

  // 2. Email domain mismatch for companies claiming established identity
  if (job.contactEmail) {
    const domain = job.contactEmail.split('@')[1]?.toLowerCase();
    if (domain && FREE_EMAIL_DOMAINS.includes(domain)) {
      riskFactors.push('Uses free email address (e.g. Gmail) instead of verified corporate domain');
      riskScore += 25;
      cautionNotes.push('Recruiter is using a free email account. Never pay any fee.');
    }
  }

  // 3. Company verification status
  if (!job.companyVerified) {
    riskScore += 15;
    cautionNotes.push('Employer is currently unverified on Dhruva.');
  }

  // 4. Source reliability
  if (job.source === 'Dhruva Direct' && job.companyVerified) {
    riskScore = Math.max(0, riskScore - 20);
  }

  // Normalize score between 0 and 100
  riskScore = Math.min(100, Math.max(0, riskScore));

  let trustBadge: TrustBadge = 'verified_job';
  if (riskScore >= 40) {
    trustBadge = 'caution';
  } else if (job.companyVerified) {
    trustBadge = 'verified_company';
  }

  return {
    riskScore,
    riskFactors,
    trustBadge,
    isSafeToApply: riskScore < 50,
    cautionNotes,
  };
}
