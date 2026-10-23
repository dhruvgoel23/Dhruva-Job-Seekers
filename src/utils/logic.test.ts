import test from 'node:test';
import assert from 'node:assert/strict';
import { createOtpSession, verifyOtpCode, getResendCooldownRemaining, isRateLimited } from './otp.ts';
import { calculateProfileCompleteness } from './profileScore.ts';
import { evaluateJobRisk } from './scamDetector.ts';
import { extractSkillsFromText, parseResumeContent } from './resumeParser.ts';
import { calculateJobMatch } from './recommendationEngine.ts';
import { filterNotificationsByPreference, DEFAULT_NOTIFICATION_PREFERENCES, INITIAL_NOTIFICATIONS } from './notificationService.ts';
import { matchJobAgainstAlert, findMatchingAlertsForJob } from './jobAlertService.ts';
import { JobSeekerProfile, SavedJobAlert } from '../types/index.ts';

test('OTP session creation and verification', () => {
  const session = createOtpSession('+919876543210', '482910');
  assert.equal(session.code, '482910');
  assert.equal(session.destination, '+919876543210');

  // Test invalid attempt
  const wrongAttempt = verifyOtpCode(session, '000000');
  assert.equal(wrongAttempt.success, false);
  assert.equal(wrongAttempt.remainingAttempts, 4);

  // Test correct attempt
  const rightAttempt = verifyOtpCode(session, '482910');
  assert.equal(rightAttempt.success, true);
});

test('OTP expiry handling', () => {
  const session = createOtpSession('+919876543210', '123456');
  // Simulate time after expiry
  const expiredTime = session.expiresAt + 1000;
  const result = verifyOtpCode(session, '123456', expiredTime);
  assert.equal(result.success, false);
  assert.equal(result.isExpired, true);
});

test('OTP resend cooldown & rate limiting', () => {
  const now = 1000000;
  const cooldown = getResendCooldownRemaining(now - 15000, 45, now);
  assert.equal(cooldown, 30); // 45 - 15 = 30s remaining

  // Rate limit check
  const sends = [now - 10000, now - 8000, now - 5000, now - 1000];
  const blocked = isRateLimited(sends, 4, 3600000, now);
  assert.equal(blocked, true);
});

test('Profile completeness calculation', () => {
  const mockProfile: JobSeekerProfile = {
    id: 'user_1',
    fullName: 'Aarav Sharma',
    headline: 'Full Stack Engineer',
    email: 'aarav@example.com',
    phone: '+919876543210',
    location: 'Bangalore, India',
    shareLocation: true,
    expectedSalary: { min: 12, max: 20, currency: 'INR', period: 'year' },
    preferredRoles: ['Frontend Developer', 'Full Stack Developer'],
    preferredLocations: ['Bangalore', 'Remote'],
    skills: ['React', 'TypeScript', 'Node.js'],
    languages: ['English', 'Hindi'],
    bio: 'Passionate developer',
    education: [
      {
        id: 'edu_1',
        institution: 'IIT Bangalore',
        degree: 'B.Tech',
        fieldOfStudy: 'Computer Science',
        startYear: '2020',
        endYear: '2024',
      },
    ],
    experience: [],
    projects: [
      {
        id: 'proj_1',
        title: 'Job Portal',
        description: 'Engineered job portal',
        technologies: ['React', 'Node.js'],
      },
    ],
    certifications: [],
    links: { github: 'https://github.com/aarav' },
    resumeFileName: 'Aarav_Resume.pdf',
    completenessScore: 0,
    isIdentityVerified: false,
  };

  const result = calculateProfileCompleteness(mockProfile);
  // All criteria complete except identity verification (10% weight) -> score should be 90
  assert.equal(result.score, 90);
  assert.equal(result.missingCriteria.length, 1);
  assert.equal(result.missingCriteria[0].key, 'identity_verified');
});

test('Scam detector flags suspicious phrases and free email on enterprise roles', () => {
  const scamJob = {
    title: 'Data Entry Assistant - Google India Partner',
    description: 'Urgent requirement! Pay 500 registration fee for laptop deposit. Earn 5000 daily payout guaranteed.',
    requirements: ['No skills required high salary'],
    contactEmail: 'google.hr.recruitment@gmail.com',
    companyVerified: false,
  };

  const result = evaluateJobRisk(scamJob);
  assert.equal(result.isSafeToApply, false);
  assert.equal(result.trustBadge, 'caution');
  assert.ok(result.riskScore >= 50);
  assert.ok(result.riskFactors.some((f) => f.includes('registration fee')));
  assert.ok(result.riskFactors.some((f) => f.includes('free email')));
});

test('Resume skill and contact extraction', () => {
  const resumeText = `
    Rohan Verma
    rohan.verma@example.com | +91 98765 43210
    Software Engineering student at National Institute of Technology.
    Skilled in React, TypeScript, Python, Docker and PostgreSQL.
  `;

  const skills = extractSkillsFromText(resumeText);
  assert.ok(skills.includes('React'));
  assert.ok(skills.includes('TypeScript'));
  assert.ok(skills.includes('Python'));
  assert.ok(skills.includes('Docker'));
  assert.ok(skills.includes('PostgreSQL'));

  const parsed = parseResumeContent(resumeText);
  assert.equal(parsed.email, 'rohan.verma@example.com');
  assert.ok(parsed.skills.length >= 4);
});

test('Job recommendation engine produces multi-factor match and explainability reasons', () => {
  const profile: JobSeekerProfile = {
    id: 'user_test',
    fullName: 'Pooja Iyer',
    headline: 'Senior Frontend Engineer',
    email: 'pooja@example.com',
    phone: '+919876543210',
    location: 'Bangalore, Karnataka',
    shareLocation: true,
    expectedSalary: { min: 30, max: 45, currency: 'INR', period: 'year' },
    preferredRoles: ['Frontend Engineer', 'Full Stack Engineer'],
    preferredLocations: ['Bangalore', 'Remote'],
    skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js'],
    languages: ['English'],
    bio: 'Passionate frontend engineer',
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    links: {},
    completenessScore: 80,
    isIdentityVerified: true,
  };

  const highMatchJob: any = {
    id: 'job_high',
    title: 'Senior Frontend Engineer (React/TypeScript)',
    companyName: 'Acme Technologies',
    location: 'Bangalore, Karnataka',
    workMode: 'hybrid',
    salary: { min: 35, max: 50, currency: 'INR', period: 'year', displayString: '₹35 - 50 LPA' },
    skillsRequired: ['React', 'TypeScript', 'Tailwind CSS'],
    trustBadge: 'verified_company',
  };

  const result = calculateJobMatch(highMatchJob, profile);
  assert.ok(result.overallScore >= 85);
  assert.equal(result.matchingSkills.length, 3);
  assert.ok(result.reasons.some((r) => r.includes('Matches 3 key skills')));
  assert.ok(result.reasons.some((r) => r.includes('preferred role')));
});

test('Notification service filtering honors user toggles and categories', () => {
  const prefs = { ...DEFAULT_NOTIFICATION_PREFERENCES, jobMatches: false };
  const filtered = filterNotificationsByPreference(INITIAL_NOTIFICATIONS, prefs);

  // Since jobMatches is false, no notifications with category 'job_match' should appear
  assert.equal(filtered.some((n) => n.category === 'job_match'), false);

  // Category specific filter
  const onlyInterviews = filterNotificationsByPreference(INITIAL_NOTIFICATIONS, DEFAULT_NOTIFICATION_PREFERENCES, 'interview_reminder');
  assert.ok(onlyInterviews.every((n) => n.category === 'interview_reminder'));
  assert.ok(onlyInterviews.length >= 1);
});

test('Real-time job alert matcher identifies matching postings and respects criteria', () => {
  const alert: SavedJobAlert = {
    id: 'alert_test',
    title: 'React Devs in Bangalore',
    query: 'React',
    location: 'Bangalore',
    workMode: 'hybrid',
    currency: 'INR',
    minSalary: 25,
    frequency: 'instant',
    pushNotification: true,
    emailNotification: true,
    active: true,
    createdAt: 'Today',
    matchesCount: 0,
  };

  const matchingJob: any = {
    title: 'Senior React Developer',
    companyName: 'Zepto',
    skillsRequired: ['React', 'TypeScript'],
    description: 'High performance web apps',
    location: 'Bangalore, Karnataka',
    workMode: 'hybrid',
    salary: { min: 25, max: 35, currency: 'INR' },
  };

  const nonMatchingJob: any = {
    title: 'Java Backend Architect',
    companyName: 'Fintech Corp',
    skillsRequired: ['Java', 'Spring'],
    description: 'Core banking systems',
    location: 'Mumbai, Maharashtra',
    workMode: 'on-site',
    salary: { min: 20, max: 24, currency: 'INR' },
  };

  assert.equal(matchJobAgainstAlert(matchingJob, alert), true);
  assert.equal(matchJobAgainstAlert(nonMatchingJob, alert), false);

  const matchedList = findMatchingAlertsForJob(matchingJob, [alert]);
  assert.equal(matchedList.length, 1);
  assert.equal(matchedList[0].id, 'alert_test');
});

