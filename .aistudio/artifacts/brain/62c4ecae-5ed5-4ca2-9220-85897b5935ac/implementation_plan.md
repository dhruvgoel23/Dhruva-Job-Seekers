# Dhruva: The Unified Job Operating System

Dhruva is an all-in-one job discovery, verification, and recruitment operating system uniting job seekers and employers into a seamless, Apple Human Interface Guidelines-inspired platform.

***

### User Review & Critical Decisions

> [!IMPORTANT]
> The following product configurations were confirmed and incorporated into the architectural blueprint:

- **Confirmed Presentation Mode**: Switchable Apple device frame (iPhone 16 Pro / Android Pixel 9 frame with status bars and native navigation bar) alongside a 1440px desktop Company Portal and Admin Moderation Console, accessible via an elegant top-level viewport switcher.
- **Confirmed Verification Engine**: Real browser webcam stream with biometric liveness checks (head turn challenge, blink/smile detection, camera lighting analysis) paired with government/college ID document upload and face matching, complete with DPDP/GDPR consent and data deletion controls.
- **Confirmed Market & Salary Standard**: Dual-currency architecture supporting both Indian tech & fresher roles (INR ₹ Lakhs per annum / monthly stipend) and international tech listings (USD $k/year).
- **Execution Plan**: Executing **Phase 1: Auth, OTP, Profiles, AI Resume Parsing, and Biometric Verification** while laying the robust full-stack foundation for subsequent phases (Job Aggregation, Kanban ATS, Chat, and Moderation).

***

### 1. Overview & Core Concept

- **What It Does**: Dhruva consolidates fragmented job platforms (LinkedIn, Indeed, Naukri, Internshala, Instahyre) into a single verified ecosystem. Job seekers authenticate via phone/email OTP, build or parse resumes into rich profiles, verify their identity with camera liveness, and discover verified roles. Companies register, verify their corporate identity (GST/CIN/domain), publish listings, and evaluate candidates in a streamlined ATS dashboard.
- **Target Audience / Personas**:
  1. *Job Seekers*: College students, freshers, and experienced professionals seeking authentic, scam-free jobs with one-tap applications.
  2. *Employers & Recruiters*: Hiring managers and talent partners needing verified applicants and high-signal screening.
  3. *Admins*: Compliance moderators reviewing reported postings, company credentials, and identity verification queues.
- **Key Value**: Eradicates ghost jobs and recruitment fraud through biometrics, company domain/tax validation, and transparent salary/source aggregation.

***

### 2. User Experience & Visual Design

#### Key User Flows
1. **Authentication & Role Selection**:
   - Phone or Email input $\rightarrow$ 6-digit OTP entry with real 45-second countdown timer, rate-limiting indicator, and resend trigger.
   - Dual-role branching: "Looking for Jobs" (Seeker) vs "Hiring Talent" (Company / Recruiter).
2. **Seeker Onboarding & Profile Building**:
   - Personal details, target roles, preferred locations, dual-currency expected compensation.
   - **Resume Drag & Drop**: Accepts PDF/DOCX/TXT; extracts skills, education, projects, work history, and contact information via server-side `@google/genai` (Gemini 3.8 Flash) with a reliable deterministic parser fallback.
   - **In-App Resume Builder**: Instant visual resume preview with clean typography templates and profile completeness meter (0–100%).
3. **Biometric Face Liveness & ID Verification**:
   - Transparent consent modal stating DPDP Act 2023 & GDPR data privacy rights and "Delete My Data" trigger.
   - Live camera view with an Apple-style oval face alignment guide, real-time lighting probe, and randomized interactive prompt ("Tilt head right", "Smile", "Blink").
   - ID document scanner (Aadhaar / PAN / College ID / Passport) with instant face comparison score and trust badge award (`Verified Seeker`).
4. **Geolocation & Jobs Near Me**:
   - Optional GPS permission toggle with radius slider ($5\text{km}$ to $50\text{km}$); filters opportunities in Bangalore, Mumbai, Delhi-NCR, Hyderabad, Pune, or remote hubs.
5. **Company Dashboard Experience**:
   - Corporate profile creation (GSTIN, LinkedIn URL, domain verification status).
   - Job composer with screening questions, dual salary ranges, and direct publishing.
   - Applicant review queue with candidate cards, resume preview, and status progression.

#### Visual Identity & Theme (Apple HIG Aesthetics)
- **Aesthetic Direction**: Apple iOS / macOS aesthetic — generous negative space, crisp hairline dividers (`rgba(0,0,0,0.06)` / `rgba(255,255,255,0.08)`), frosted glass backdrops (`backdrop-blur-xl bg-white/80 dark:bg-slate-900/80`), and deliberate visual restraint.
- **Color Palette & Discipline (60-30-10)**:
  - *60% Neutral Canvas*: Clean crisp canvas (`#FFFFFF` in light mode, `#0B0F19` deep space gray in dark mode).
  - *30% Structural Surfaces*: Subtle cards with hairline borders (`#F8FAFC` / `#161E2E`, `border-slate-200/80 dark:border-slate-800`), standard text hierarchy.
  - *10% Accent Budget*: Apple System Blue (`#0071E3` / `#0A84FF`), paired with system semantic tints (Emerald `#10B981` for verified badges, Amber `#F59E0B` for caution notes).
- **Zero-Pill & Anti-Slop Enforcement**:
  - No static pill badges on metadata; tags, dates, and locations use clean typography with middle-dot separators (`Bangalore · Full-time · ₹18–24 LPA`).
  - No code comments in headings (`// 01 ARCHITECTURE`), no fake telemetry tickers.
  - Natural Apple-style segmented tabs (`<button>` with smooth sliding pill highlight) for interactive filtering.
- **Typography**: Display & headings in `Plus Jakarta Sans`, body and metadata in clean `DM Sans`, metrics in tabular numbers (`tabular-nums`).

***

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Dual-Mode Platform Switcher**:
  - *Chosen Approach*: Top bar includes a clean Apple-style segmented switcher allowing instant toggling between "Mobile App (Seeker)" (encased in an authentic iPhone/Pixel device bezel with touch gestures and bottom tab bar) and "Company Web Portal" (a responsive 1440px desktop ATS workspace).
  - *Why*: Delivers the requested mobile experience for candidates while honoring the desktop dashboard requirement for hiring managers in one cohesive testable applet.
- **Decision 2: Real Biometric Webcam Liveness Engine**:
  - *Chosen Approach*: Uses HTML5 `navigator.mediaDevices.getUserMedia` feeding an interactive canvas analyzer that evaluates frame brightness, face presence, motion deltas for head tilts, and snapshot capture, coupled with document inspection.
  - *Why*: Provides genuine interactive security without requiring heavyweight cloud biometrics subscriptions, strictly respecting local privacy with instant local deletion.
- **Decision 3: AI Resume Parsing Pipeline**:
  - *Chosen Approach*: Server-side endpoint powered by `gemini-3.8-flash` via `@google/genai` (structured JSON schema extraction) with client-side fallback parsing.
  - *Why*: Accurate parsing of messy resumes into structured fields (skills, projects, education) in under 2 seconds.

***

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DHRUVA PLATFORM SHELL                          │
│   [ Device Switcher: Mobile iPhone / Android Frame  |  Desktop ATS ]  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
       ┌────────────────────────────┴─────────────────────────────┐
       ▼                                                          ▼
┌───────────────────────────────┐               ┌───────────────────────────────┐
│     MOBILE CANDIDATE APP      │               │     COMPANY WEB DASHBOARD     │
│ ┌───────────────────────────┐ │               │ ┌───────────────────────────┐ │
│ │ • Auth (OTP & Role Select)│ │               │ │ • Company Registration    │ │
│ │ • Profile Completeness    │ │               │ │ • Verification & Tax Check│ │
│ │ • Resume Upload & Builder │ │               │ │ • Job Posting Engine      │ │
│ │ • Biometric Liveness & ID │ │               │ │ • Applicant Review & Notes│ │
│ │ • Jobs Near Me (GPS/Map)  │ │               │ │ • ATS Stage Kanban        │ │
│ │ • Bottom Tab Bar (5 tabs) │ │               │ └───────────────────────────┘ │
│ └───────────────────────────┘ │               └───────────────────────────────┘
└──────────────┬────────────────┘                               │
               │                                                │
               ▼                                                ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        SHARED CORE STATE & APIS                       │
│  • Auth Store (User, Session, Role, Token, OTP Rate-Limiter)          │
│  • Jobs Store (Normalized Listings: INR/USD, Verified Badges, Search) │
│  • Biometric & ID Store (Liveness status, Consent, Encryption status) │
│  • Applications & Saved Jobs Store (Kanban statuses)                  │
│  • Server Routes: `/api/ai/parse-resume`, `/api/ai/cover-letter`      │
└────────────────────────────────────────────────────────────────────────┘
```

#### Core Data Entities
- **User / Seeker**: `id`, `name`, `email`, `phone`, `role`, `headline`, `bio`, `education[]`, `skills[]`, `experience[]`, `projects[]`, `links`, `preferredRoles[]`, `preferredLocations[]`, `salaryMin`, `salaryMax`, `currency` (INR/USD), `verifiedStatus` (`unverified` | `pending` | `verified`), `profileScore`.
- **Company**: `id`, `name`, `domain`, `gstCinNumber`, `website`, `linkedIn`, `logoUrl`, `verifiedStatus`, `openJobsCount`.
- **JobPosting**: `id`, `title`, `companyId`, `companyName`, `location`, `isRemote`, `jobType`, `experienceLevel`, `skills[]`, `salaryDisplay`, `currency`, `source`, `riskScore`, `trustBadge` (`verified_company` | `verified_job` | `caution`), `postedAt`, `deadline`.
- **BiometricRecord**: `id`, `userId`, `consentAcceptedAt`, `livenessPassed`, `idDocumentType`, `verifiedAt`, `faceMatchConfidence`.

***

### 5. Verification & Acceptance Criteria

1. **Auth & OTP Journey**: Enter phone/email $\rightarrow$ OTP screen with active 45s timer $\rightarrow$ enter test OTP (e.g., `123456`) $\rightarrow$ select role $\rightarrow$ redirected to appropriate onboarding flow.
2. **Resume Upload & Parsing Journey**: Drop sample resume or select sample file $\rightarrow$ auto-populates skills, education, and experience $\rightarrow$ profile completeness meter updates to $85\%+$ $\rightarrow$ view styled resume in builder.
3. **Biometric Liveness Verification**: Launch camera $\rightarrow$ grant consent $\rightarrow$ execute head tilt/blink prompt $\rightarrow$ capture selfie + upload ID $\rightarrow$ verification badge granted.
4. **AI-Powered Cover Letter Generator & Recommendation Engine**: Multi-tone cover letter generator using Gemini with deterministic fallback, paired with candidate skill/role/salary match scoring.
5. **Real-Time Job Alert System**:
   - Save search queries with custom criteria (keywords, location, work mode, currency, minimum salary).
   - Instant Apple iOS push banner toast simulation with "Tap to inspect & one-tap apply".
   - Integrated with Notification Center and company job posting dispatch.
6. **Company & Seeker Switching**: Toggle between iPhone mobile frame and Desktop company dashboard seamlessly without loss of session state.
