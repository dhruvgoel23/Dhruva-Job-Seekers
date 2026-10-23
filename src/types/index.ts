export type UserRole = 'seeker' | 'company' | 'admin';

export type Currency = 'INR' | 'USD';

export type JobType = 'full-time' | 'internship' | 'part-time' | 'contract';

export type WorkMode = 'remote' | 'hybrid' | 'on-site';

export type TrustBadge = 'verified_company' | 'verified_job' | 'caution';

export type ApplicationStatus =
  | 'saved'
  | 'applied'
  | 'viewed'
  | 'shortlisted'
  | 'interview'
  | 'offer'
  | 'rejected';

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  grade?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl?: string;
}

export interface JobSeekerProfile {
  id: string;
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  location: string;
  currentLat?: number;
  currentLng?: number;
  shareLocation: boolean;
  expectedSalary: {
    min: number;
    max: number;
    currency: Currency;
    period: 'year' | 'month';
  };
  preferredRoles: string[];
  preferredLocations: string[];
  skills: string[];
  languages: string[];
  bio: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  links: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    twitter?: string;
  };
  resumeUrl?: string;
  resumeFileName?: string;
  resumeParsedAt?: string;
  completenessScore: number;
  isIdentityVerified: boolean;
  verificationBadgeAwardedAt?: string;
}

export interface BiometricVerificationRecord {
  id: string;
  userId: string;
  status: 'unverified' | 'in_progress' | 'verified' | 'rejected';
  consentGiven: boolean;
  consentTimestamp?: string;
  livenessChecks: {
    blinkDetected: boolean;
    headTurnDetected: boolean;
    smileDetected: boolean;
  };
  idDocumentType?: 'aadhaar' | 'pan' | 'college_id' | 'passport' | 'drivers_license';
  idDocumentFileName?: string;
  idDocumentDataUrl?: string;
  selfieDataUrl?: string;
  confidenceScore: number;
  verifiedAt?: string;
  dataEncrypted: boolean;
}

export interface CompanyProfile {
  id: string;
  name: string;
  tagline: string;
  description: string;
  domain: string;
  workEmail: string;
  phone: string;
  website: string;
  linkedinUrl: string;
  gstCinNumber: string;
  verifiedStatus: 'unverified' | 'pending' | 'verified';
  logoUrl?: string;
  headquarters: string;
  companySize: string;
  industry: string;
  foundedYear: string;
}

export interface JobPosting {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  companyVerified: boolean;
  title: string;
  roleCategory: string;
  location: string;
  workMode: WorkMode;
  jobType: JobType;
  experienceLevel: 'fresher' | '1-3 years' | '3-5 years' | '5+ years';
  salary: {
    min: number;
    max: number;
    currency: Currency;
    period: 'year' | 'month';
    displayString: string;
  };
  skillsRequired: string[];
  description: string;
  requirements: string[];
  benefits: string[];
  postedDate: string;
  deadline: string;
  source: 'Dhruva Direct' | 'LinkedIn Partner' | 'Instahyre Partner' | 'Naukri RSS' | 'Indeed Partner';
  applyType: 'direct' | 'external';
  applyUrl?: string;
  contactEmail?: string;
  recruiterName?: string;
  riskScore: number; // 0-100, 0 = pure legit, >50 = caution, >80 = high risk
  riskFactors: string[];
  trustBadge: TrustBadge;
  applicantCount: number;
  coordinates?: {
    lat: number;
    lng: number;
  };
  screeningQuestions?: string[];
}

export interface JobApplication {
  id: string;
  jobId: string;
  seekerId: string;
  seekerName: string;
  seekerEmail: string;
  seekerHeadline: string;
  seekerSkills: string[];
  jobTitle: string;
  companyName: string;
  appliedDate: string;
  status: ApplicationStatus;
  statusHistory: {
    status: ApplicationStatus;
    timestamp: string;
    note?: string;
  }[];
  coverLetter?: string;
  screeningAnswers?: Record<string, string>;
  notes?: string[];
  matchScore: number;
  isOfflinePending?: boolean;
  syncedAt?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  currentRole: UserRole;
  user: JobSeekerProfile | null;
  company: CompanyProfile | null;
  phoneNumber?: string;
  email?: string;
}

export type ViewportMode = 'mobile_ios' | 'mobile_android' | 'desktop_company';

export type CoverLetterTone = 'minimalist' | 'impact_metrics' | 'conversational' | 'executive';

export type NotificationCategory =
  | 'job_match'
  | 'application_update'
  | 'interview_reminder'
  | 'recruiter_message'
  | 'account_verification';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  jobId?: string;
  applicationId?: string;
}

export interface NotificationPreferences {
  pushEnabled: boolean;
  emailEnabled: boolean;
  inAppEnabled: boolean;
  jobMatches: boolean;
  applicationUpdates: boolean;
  interviewReminders: boolean;
  recruiterMessages: boolean;
  verificationAlerts: boolean;
  emailDigestCadence: 'instant' | 'daily' | 'weekly';
}

export interface JobMatchBreakdown {
  jobId: string;
  overallScore: number; // 0-100
  skillScore: number;
  roleScore: number;
  locationScore: number;
  salaryScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  reasons: string[];
}

export interface SavedJobAlert {
  id: string;
  title: string;
  query: string;
  location?: string;
  workMode?: 'ALL' | WorkMode;
  currency?: 'ALL' | Currency;
  minSalary?: number;
  frequency: 'instant' | 'daily';
  pushNotification: boolean;
  emailNotification: boolean;
  active: boolean;
  createdAt: string;
  lastTriggeredAt?: string;
  matchesCount: number;
}

export interface PushToast {
  id: string;
  title: string;
  subtitle: string;
  message: string;
  timestamp: string;
  jobId?: string;
  companyLogo?: string;
  salary?: string;
  location?: string;
}


