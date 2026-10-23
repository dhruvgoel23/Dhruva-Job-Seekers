import { JobPosting, JobSeekerProfile, JobApplication, JobMatchBreakdown } from '../types';

export function calculateJobMatch(
  job: JobPosting,
  profile: JobSeekerProfile,
  savedJobIds: string[] = [],
  applications: JobApplication[] = []
): JobMatchBreakdown {
  const reasons: string[] = [];

  // 1. Skill Match Calculation (45% Weight)
  const profileSkillsLower = new Set(profile.skills.map((s) => s.toLowerCase().trim()));
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const jobSkill of job.skillsRequired) {
    const sLower = jobSkill.toLowerCase().trim();
    if (profileSkillsLower.has(sLower)) {
      matchingSkills.push(jobSkill);
    } else {
      missingSkills.push(jobSkill);
    }
  }

  const skillCoverage = job.skillsRequired.length > 0
    ? matchingSkills.length / job.skillsRequired.length
    : 0.5;
  const skillScore = Math.round(skillCoverage * 100);

  if (matchingSkills.length > 0) {
    reasons.push(`Matches ${matchingSkills.length} key skill${matchingSkills.length > 1 ? 's' : ''}: ${matchingSkills.slice(0, 3).join(', ')}`);
  }

  // 2. Role Alignment (25% Weight)
  let roleScore = 50;
  const jobTitleLower = job.title.toLowerCase();
  const headlineLower = profile.headline.toLowerCase();

  const matchesPreferredRole = profile.preferredRoles.some((role) =>
    jobTitleLower.includes(role.toLowerCase()) || role.toLowerCase().includes(jobTitleLower)
  );

  if (matchesPreferredRole) {
    roleScore = 100;
    reasons.push('Directly matches your preferred role targets');
  } else if (jobTitleLower.split(' ').some((word) => word.length > 3 && headlineLower.includes(word))) {
    roleScore = 80;
    reasons.push('Aligns with your professional headline');
  }

  // 3. Location & Work Mode Affinity (20% Weight)
  let locationScore = 60;
  if (job.workMode === 'remote') {
    locationScore = 100;
    reasons.push('Remote opportunity available globally');
  } else {
    const jobCity = job.location.split(',')[0].toLowerCase().trim();
    const userCity = profile.location.split(',')[0].toLowerCase().trim();
    const isPreferredCity = profile.preferredLocations.some((loc) =>
      loc.toLowerCase().includes(jobCity) || jobCity.includes(loc.toLowerCase())
    );

    if (jobCity === userCity || isPreferredCity) {
      locationScore = 95;
      reasons.push(`Located in your preferred hub: ${job.location.split(',')[0]}`);
    } else {
      locationScore = 40;
    }
  }

  // 4. Experience & Compensation Alignment (10% Weight)
  let salaryScore = 75;
  if (job.salary.currency === profile.expectedSalary.currency) {
    if (job.salary.max >= profile.expectedSalary.min) {
      salaryScore = 100;
      reasons.push(`Compensation meets your target (${job.salary.displayString})`);
    }
  }

  // 5. History Affinity Bonus (Saved jobs & Applications)
  let affinityBonus = 0;
  if (savedJobIds.includes(job.id)) {
    affinityBonus += 5;
  }
  const hasAppliedToCompany = applications.some((app) => app.companyName === job.companyName);
  if (hasAppliedToCompany) {
    affinityBonus += 5;
    reasons.push(`You have active application traction with ${job.companyName}`);
  }
  if (job.trustBadge === 'verified_company') {
    affinityBonus += 3;
    reasons.push('Verified employer with zero scam risk');
  }

  // Weighted overall calculation
  const weighted =
    skillScore * 0.45 +
    roleScore * 0.25 +
    locationScore * 0.20 +
    salaryScore * 0.10 +
    affinityBonus;

  const overallScore = Math.min(99, Math.max(30, Math.round(weighted)));

  return {
    jobId: job.id,
    overallScore,
    skillScore,
    roleScore,
    locationScore,
    salaryScore,
    matchingSkills,
    missingSkills,
    reasons: reasons.slice(0, 4),
  };
}

export function rankJobsForCandidate(
  jobs: JobPosting[],
  profile: JobSeekerProfile,
  savedJobIds: string[] = [],
  applications: JobApplication[] = []
): { job: JobPosting; match: JobMatchBreakdown }[] {
  return jobs
    .map((job) => ({
      job,
      match: calculateJobMatch(job, profile, savedJobIds, applications),
    }))
    .sort((a, b) => b.match.overallScore - a.match.overallScore);
}
