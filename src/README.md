
# TalentSleuth AI - Your Virtual Talent Analyst

TalentSleuth AI is an intelligent platform designed to streamline the hiring process for HR teams and assist job seekers in finding opportunities. It leverages AI to parse resumes, discover candidate profiles, assess role fitment, detect potential red flags, and generate interview questions, providing a comprehensive toolkit for talent acquisition. Candidate data, job requisitions, and applications are persistently stored using Firebase Firestore. Students can view and apply for open positions, including uploading their resumes during signup for automated profile creation and generating custom resumes for specific jobs.

## Core Features

*   **AI Resume Parsing & Firestore Persistence:** Automatically extract key candidate information (contact details, education, experience, skills, certifications) from resumes (TXT, PDF, DOCX) using Gemini. Parsed resumes create or update candidate profiles stored in Firebase Firestore, managed via React Context for real-time updates.
*   **Candidate Dossier & Profile View:** Detailed view for each candidate showing parsed information, and sections for AI-driven insights:
    *   **Simulated Cross-Platform Profile Discovery:** AI (simulates) finding and summarizing candidate data from platforms like LinkedIn, GitHub, and Naukri based on name and email (discovery is more effective if resume text contains links to these platforms).
    *   **Red Flag Detection:** AI analyzes resume text against (simulated) profile data to identify discrepancies, frequent job switching, or incomplete/dated information.
    *   **Sentiment Analysis:** Analyze the sentiment of text (e.g., endorsements, reviews) related to a candidate.
*   **AI Role Fitment Matching:** Upload a job description and select a candidate to get an AI-generated fitment score (0-100) and justification. Scores are updated in the candidate's Firestore record.
*   **AI Interview Question Generator:** Generate tailored interview questions based on job title and candidate skills. Can auto-fill details by selecting an existing candidate from the database.
*   **Side-by-Side Candidate Comparison:** A dashboard to compare key details of multiple candidates (recruiter-side).
*   **Basic ATS - Job Requisition Management:** Recruiters can create, view, and manage job postings (title, description, location, salary, status), stored in Firestore. (Editing job requisitions is planned).
*   **Basic ATS - Candidate Application Tracking:**
    *   Recruiters can assign existing candidates to jobs.
    *   Recruiters can view all job applications and update their status (Applied, Screening, Interviewing, Offered, Hired, Rejected).
*   **Student Job Portal & Application System:**
    *   Students can sign up, providing their name, email, password, and resume.
    *   On signup, the resume is uploaded to **Firebase Storage**, parsed by AI, and a candidate profile is created/updated in Firestore with a `resumeUrl` (to the stored file) and structured `digitalResume` data.
    *   Students can view open job requisitions.
    *   Students can apply for jobs using:
        *   Their main profile resume (can be updated during application if a new file is uploaded).
        *   A **custom-generated resume**: AI generates a resume tailored to the specific job description using the student's `digitalResume` data. This custom resume text is saved to the student's profile (under `candidates/{uid}/customResumes/{jobId}`) and included in the job application record.
    *   An application record linking the student and job is created in Firestore, indicating if a profile or custom resume was used.
    *   Students can view their profile, download their main resume, see their application statuses, and view their saved custom resumes.
*   **User Authentication:** Secure sign-up, login for both recruiters (dashboard access) and students (portal access) using Firebase Authentication.
*   **Candidate Deletion:** Ability for recruiters to delete candidate profiles from Firestore.

## Planned ATS Features (Future Development)

The application aims to expand its ATS capabilities by integrating with Google Workspace APIs and other features:

### 1. **Job Requisition Management (Enhanced)**
    *   Edit existing job postings.
    *   Optionally sync/share via Google Drive as Docs or PDFs.

### 2. **Automated Resume Intake (via Gmail & Drive)**
    *   **Gmail API Integration**: Monitor a recruitment inbox for new applications, auto-fetch attachments.
    *   **Drive API Integration**: Automatically store and organize resume files.

### 3. **Candidate Application Tracking (Enhanced)**
    *   More detailed status updates and UI.
    *   (Partially Implemented: Recruiters can update status).

### 4. **Interview Scheduling & Virtual Meetings (Google Calendar + Meet)**
    *   **Calendar API**: Schedule interviews, check availability.
    *   **Meet API**: Auto-generate Meet links.

### 5. **Email Communication Logging (Gmail API)**
    *   Track email threads with candidates.
    *   Optional: Display recent communications in candidate profiles.

### 6. **Document & Note Management (Drive API)**
    *   Allow recruiters to upload/write notes and documents (portfolios, assessments).
    *   Store metadata in Firestore and files in Drive.

### 7. **Task Reminders & Follow-ups (Google Calendar API)**
    *   Set reminders for interview prep, follow-ups, application reviews.

### 8. **Team Collaboration**
    *   Shared access to candidate dossiers and notes.
    *   Assign reviewers/interviewers.

### 9. **Analytics & Reporting (Optional)**
    *   Visualize pipeline metrics (applicants per job, time in stage, offer ratios).


## Tech Stack

-   **Frontend:**
    *   **Next.js 15:** React framework with App Router for server components and optimized routing.
    *   **React 18:** JavaScript library for building user interfaces.
    *   **TypeScript:** Superset of JavaScript for static typing.
-   **UI & Styling:**
    *   **ShadCN UI:** Re-usable UI components built with Radix UI and Tailwind CSS.
    *   **Tailwind CSS:** Utility-first CSS framework for rapid styling.
    *   **Lucide React:** Icon library.
    *   **Inter Font:** For a clean, modern aesthetic.
-   **AI & Backend Logic:**
    *   **Genkit (by Google):** Toolkit for building AI-powered applications. Used for defining and running AI flows.
        *   `@genkit-ai/googleai` plugin for Google Gemini.
    *   **Google Gemini Pro (via `gemini-1.5-flash-latest` model):** Leveraged for generative AI tasks.
-   **Database & Storage:**
    *   **Firebase Firestore:** NoSQL cloud database for storing and syncing candidate data, job requisitions, and job applications (including custom resume text).
    *   **Firebase Storage:** For storing uploaded resume files.
-   **Authentication:**
    *   **Firebase Authentication:** Manages user sign-up, login, and session management for recruiters and students.
-   **Client-Side State Management:**
    *   **React Context API:** Used for managing global UI state like authentication status and the dynamic list of candidates (synced with Firestore).
-   **Development Tools:**
    *   **npm/yarn:** Package management.

## Project Structure

```
talentsleuth-ai/
├── .env                  # Environment variables (GOOGLE_API_KEY, Google Workspace API Keys)
├── README.md             # This file
├── components.json       # ShadCN UI configuration
├── next.config.ts        # Next.js configuration
├── package.json          # Project dependencies and scripts
├── postcss.config.js     # PostCSS configuration (for Tailwind)
├── public/               # Static assets (images, fonts, etc.)
├── src/
│   ├── ai/               # Genkit AI-related files
│   │   ├── dev.ts        # Genkit development server entry point (imports flows)
│   │   ├── genkit.ts     # Genkit global configuration (plugins, default model)
│   │   └── flows/        # Definitions for various AI flows
│   │       ├── profile-discovery.ts
│   │       ├── red-flag-detection.ts
│   │       ├── resume-parsing.ts
│   │       ├── role-matching.ts
│   │       ├── interview-question-generator.ts
│   │       ├── sentiment-analysis.ts
│   │       └── generate-custom-resume.ts # New Flow
│   ├── app/              # Next.js App Router directory
│   │   ├── (auth)/         # Recruiter authentication pages
│   │   ├── dashboard/      # Main application dashboard routes (for recruiters)
│   │   │   ├── ats/        # Applicant Tracking System features
│   │   │   │   ├── jobs/
│   │   │   │   │   ├── create/page.tsx
│   │   │   │   │   ├── [id]/page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── applications/page.tsx # View all applications
│   │   │   ├── candidates/
│   │   │   │   ├── [id]/page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── compare-candidates/page.tsx
│   │   │   ├── upload-jd/page.tsx
│   │   │   ├── upload-resume/page.tsx
│   │   │   ├── interview-prep/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── student/          # Student-facing portal
│   │   │   ├── (auth)/       # Student authentication pages
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── signup/page.tsx
│   │   │   ├── jobs/page.tsx       # Page for students to view and apply for jobs
│   │   │   ├── profile/page.tsx    # Student profile page
│   │   │   └── layout.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── domain/
│   │   ├── layout/
│   │   └── ui/
│   ├── context/
│   │   ├── auth-context.tsx
│   │   └── candidate-context.tsx
│   ├── hooks/
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── mock-data.ts
│   │   └── utils.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Prerequisites

Before you begin, ensure you have the following installed:
-   **Node.js:** Version 18.x or 20.x is recommended.
-   **npm** or **yarn**.
-   **Google Gemini API Key:** Store as `GOOGLE_API_KEY` in `.env`.
-   **Firebase Project:**
    *   Enable **Authentication** (Email/Password).
    *   Enable **Firestore Database**.
    *   Enable **Firebase Storage**.
-   **(Optional for planned ATS features) Google Cloud Project & API Keys.**

## Setup and Running Locally

1.  **Download and Extract** project files.
2.  **Navigate to Project Directory** via terminal.
3.  **Install Dependencies:** `npm install` or `yarn install`.
4.  **Configure Firebase (`src/lib/firebase.ts`):** Ensure `firebaseConfig` matches your project, especially `storageBucket`.
5.  **Set Up Environment Variables (`.env` file):**
    ```env
    GOOGLE_API_KEY=your_actual_gemini_api_key_here
    # Optional Google Workspace Keys (for planned features)
    GOOGLE_DRIVE_API_KEY=
    GOOGLE_MEET_API_KEY=
    GOOGLE_CALENDAR_API_KEY=
    GOOGLE_GMAIL_API_KEY=
    ```
6.  **Firebase Security Rules (CRUCIAL):**
    *   Go to your Firebase Console -> Firestore Database -> Rules.
    *   **Example Firestore Rules:**
        ```
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            match /users/{userId}/{document=**} {
              allow read, write: if request.auth != null && request.auth.uid == userId;
            }
            match /candidates/{candidateId} {
                // Allow authenticated users (recruiters) to read all.
                // Students can write/update their own profile if candidateId matches their auth.uid.
                allow read: if request.auth != null;
                allow write: if request.auth != null && (request.auth.uid == candidateId || /* add recruiter role check here for full write by recruiters */ false);
                // Subcollection for custom resumes
                match /customResumes/{jobId} {
                  allow read, write: if request.auth != null && request.auth.uid == candidateId;
                }
            }
            match /jobRequisitions/{jobId} {
                allow read: if true; 
                allow create, update, delete: if request.auth != null; 
            }
            match /jobApplications/{applicationId} {
                allow create: if request.auth != null && 
                                (request.resource.data.candidateEmail == request.auth.token.email || request.resource.data.candidateId == request.auth.uid);
                allow read: if request.auth != null; // Recruiters can read all. Students can read their own (needs refinement).
                allow update: if request.auth != null; // Recruiters can update status (needs refinement for specific fields).
            }
          }
        }
        ```
    *   Go to your Firebase Console -> Storage -> Rules.
    *   **Example Storage Rules:**
        ```
        rules_version = '2';
        service firebase.storage {
          match /b/{bucket}/o {
            // Allow authenticated users to upload resumes to a path specific to their UID
            match /resumes/{userId}/{allPaths=**} {
              allow read: if request.auth != null; // Allow authenticated users to read (e.g., student their own, recruiter if linked)
              allow write: if request.auth != null && request.auth.uid == userId;
            }
          }
        }
        ```
    *   **For production, you MUST define more granular security rules.**
7.  **Firestore Composite Indexes:**
    *   For student job listing (`/student/jobs`):
        *   Collection ID: `jobRequisitions`
        *   Fields: `status` (Ascending), `createdAt` (Descending)
    *   For student profile applications (`/student/profile`):
        *   Collection ID: `jobApplications`
        *   Fields: `candidateId` (Ascending), `applicationDate` (Descending)
    *   For student profile custom resumes (`/student/profile`):
        *   Collection ID: `customResumes` (Subcollection under `candidates`)
        *   Path: `candidates/{candidateId}/customResumes`
        *   Fields: `createdAt` (Descending)
    *   Firebase usually provides direct links in console errors to create missing indexes.
8.  **Run Genkit Development Server:** `npm run genkit:dev` or `npm run genkit:watch`.
9.  **Run Next.js Development Server:** In a new terminal: `npm run dev`.
10. **Access:** [http://localhost:9002](http://localhost:9002)

## Available Scripts
-   `npm run dev`: Starts Next.js dev server.
-   `npm run build`: Builds Next.js for production.
-   `npm run start`: Starts Next.js production server.
-   `npm run lint`: Lints code.
-   `npm run typecheck`: Type checks.
-   `npm run genkit:dev`: Starts Genkit dev server.
-   `npm run genkit:watch`: Starts Genkit dev server with watch mode.

## Further Development & Considerations
*   Implement remaining ATS features, especially Google Workspace API integrations (OAuth 2.0 setup will be necessary).
*   Robust Firestore & Storage Security Rules.
*   Error Handling and UI Polish.
*   Security: API key management, Firebase App Check.
*   Scalability: Firestore data structuring, indexing, query optimization.
*   User Roles for more granular access control.
*   Student Profile Management: Allow students to fully edit their profiles, upload new main resumes directly, delete custom resumes.
```