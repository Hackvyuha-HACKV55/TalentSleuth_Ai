
# TalentSleuth AI - Your Virtual Talent Analyst

TalentSleuth AI is an intelligent platform designed to streamline the hiring process for HR teams and assist job seekers in finding opportunities. It leverages AI to parse resumes, discover candidate profiles, assess role fitment, detect potential red flags, and generate interview questions, providing a comprehensive toolkit for talent acquisition. Candidate data, job requisitions, and applications are persistently stored using Firebase Firestore. Students can view and apply for open positions.

## Core Features

*   **AI Resume Parsing & Firestore Persistence:** Automatically extract key candidate information (contact details, education, experience, skills, certifications) from resumes (TXT, PDF, DOCX) using Gemini. Parsed resumes create or update candidate profiles stored in Firebase Firestore, managed via React Context for real-time updates.
*   **Candidate Dossier & Profile View:** Detailed view for each candidate showing parsed information, and sections for AI-driven insights:
    *   **Simulated Cross-Platform Profile Discovery:** AI (simulates) finding and summarizing candidate data from platforms like LinkedIn, GitHub, and Naukri based on name and email (discovery is more effective if resume text contains links to these platforms).
    *   **Red Flag Detection:** AI analyzes resume text against (simulated) profile data to identify discrepancies, frequent job switching, or incomplete/dated information.
    *   **Sentiment Analysis:** Analyze the sentiment of text (e.g., endorsements, reviews) related to a candidate.
*   **AI Role Fitment Matching:** Upload a job description and select a candidate to get an AI-generated fitment score (0-100) and justification. Scores are updated in the candidate's Firestore record.
*   **AI Interview Question Generator:** Generate tailored interview questions based on job title and candidate skills. Can auto-fill details by selecting an existing candidate from the database.
*   **Side-by-Side Candidate Comparison:** A dashboard to compare key details of multiple candidates (recruiter-side).
*   **Basic ATS - Job Requisition Management:** Recruiters can create, view, and manage job postings (title, description, location, salary, status), stored in Firestore.
*   **Basic ATS - Candidate Application Tracking:** Recruiters can assign existing candidates to jobs.
*   **Student Job Portal & Application System:**
    *   Students can view open job requisitions.
    *   Students can apply for jobs by uploading their resume.
    *   The uploaded resume is parsed by AI.
    *   A new candidate profile is created in Firestore if one doesn't exist for the student's email, or an existing profile is updated with the new resume data.
    *   An application record linking the student and job is created in Firestore.
*   **User Authentication:** Secure sign-up, login, and password reset functionality for both recruiters (dashboard access) and students (portal access) using Firebase Authentication.
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
    *   Track candidate applications per job requisition with more detailed status updates (Screening, Interviewing, Offered, Hired, Rejected).
    *   UI to update application statuses.

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
-   **Database:**
    *   **Firebase Firestore:** NoSQL cloud database for storing and syncing candidate data, job requisitions, and job applications.
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
│   │       └── sentiment-analysis.ts
│   ├── app/              # Next.js App Router directory
│   │   ├── (auth)/         # Recruiter authentication pages (login, signup, forgot-password)
│   │   ├── dashboard/      # Main application dashboard routes (for recruiters)
│   │   │   ├── ats/        # Applicant Tracking System features
│   │   │   │   └── jobs/
│   │   │   │       ├── create/page.tsx  # Create new job requisition
│   │   │   │       ├── [id]/page.tsx    # View job requisition & applicants
│   │   │   │       └── page.tsx         # List job requisitions
│   │   │   ├── candidates/
│   │   │   │   ├── [id]/page.tsx # Candidate detail page
│   │   │   │   └── page.tsx      # Candidate listing page
│   │   │   ├── compare-candidates/page.tsx
│   │   │   ├── upload-jd/page.tsx
│   │   │   ├── upload-resume/page.tsx
│   │   │   ├── interview-prep/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx      # Dashboard overview
│   │   ├── student/          # Student-facing portal
│   │   │   ├── (auth)/       # Student authentication pages (login, signup)
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── signup/page.tsx
│   │   │   ├── jobs/page.tsx # Page for students to view and apply for jobs
│   │   │   └── layout.tsx    # Layout for student portal
│   │   ├── globals.css     # Global styles and Tailwind directives
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Landing page
│   ├── components/
│   │   ├── domain/         # Application-specific components (CandidateCard, ResumeUploader)
│   │   ├── layout/         # Layout components (Navbar, Footer, DashboardSidebarNav)
│   │   └── ui/             # ShadCN UI components (Button, Card, etc.)
│   ├── context/            # React Context API providers
│   │   ├── auth-context.tsx
│   │   └── candidate-context.tsx # Manages candidate data with Firestore sync
│   ├── hooks/              # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/                # Utility functions and configurations
│   │   ├── firebase.ts     # Firebase initialization (Auth, Firestore)
│   │   ├── mock-data.ts    # (Not primary data source; Firestore is)
│   │   └── utils.ts        # General utility functions (e.g., cn for Tailwind)
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Prerequisites

Before you begin, ensure you have the following installed:
-   **Node.js:** Version 18.x or 20.x is recommended. You can download it from [nodejs.org](https://nodejs.org/).
-   **npm** (comes with Node.js) or **yarn** (optional, install via `npm install -g yarn`).
-   **Google Gemini API Key:** You need an API key from Google AI Studio to use the AI features. Get one [here](https://aistudio.google.com/app/apikey). Store this as `GOOGLE_API_KEY` in your `.env` file.
-   **Firebase Project:**
    *   Create a Firebase project at [firebase.google.com](https://firebase.google.com/).
    *   Enable **Authentication** (Email/Password sign-in method).
    *   Enable **Firestore Database** in your Firebase project. Start in test mode for easy setup (but configure security rules for production).
-   **(Optional for planned ATS features) Google Cloud Project & API Keys:**
    *   For planned features like Google Drive, Gmail, Calendar, and Meet integration, you'll need a Google Cloud Platform project with these APIs enabled.
    *   You'll also need to generate API keys or OAuth 2.0 credentials for these services. Store these in your `.env` file (e.g., `GOOGLE_DRIVE_API_KEY`, `GOOGLE_GMAIL_API_KEY`, etc.).
    *   **Securely manage these credentials.**

## Setup and Running Locally

Follow these steps to get the project running on your local machine:

1.  **Download and Extract:**
    Download the project files (e.g., as a ZIP) and extract them to a folder on your computer.

2.  **Navigate to Project Directory:**
    Open your terminal or command prompt and navigate into the project's root folder:
    ```bash
    cd path/to/your/talentsleuth-ai-folder
    ```

3.  **Install Dependencies:**
    The `package.json` file lists all necessary dependencies. Install them using npm or yarn:
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```
    This command reads `package.json` and downloads the required packages into the `node_modules` folder.

4.  **Configure Firebase:**
    *   Open `src/lib/firebase.ts`.
    *   Replace the placeholder `firebaseConfig` object with your actual Firebase project's configuration. You can find this in your Firebase project settings (Project settings > General > Your apps > Web app > SDK setup and configuration > Config). **The provided config in the file is for a sample project and should be replaced if it's not already yours.**

5.  **Set Up Environment Variables:**
    *   Create a new file named `.env` in the root directory of the project (if it doesn't exist).
    *   Add your **Google Gemini API Key**:
        ```env
        GOOGLE_API_KEY=your_actual_gemini_api_key_here
        ```
    *   Add the API keys for **Google Workspace APIs** if you have them (needed for planned ATS features):
        ```env
        # Example keys - replace with your actual, secured keys for production
        # These are currently placeholders and will be used for future ATS features.
        GOOGLE_DRIVE_API_KEY=your_drive_api_key_if_you_have_one
        GOOGLE_MEET_API_KEY=your_meet_api_key_if_you_have_one
        GOOGLE_CALENDAR_API_KEY=your_calendar_api_key_if_you_have_one
        GOOGLE_GMAIL_API_KEY=your_gmail_api_key_if_you_have_one
        ```
        Replace placeholders with your actual keys. **Remember the security implications of handling these keys.**

6.  **Firebase Security Rules (Important for Firestore):**
    *   Go to your Firebase Console -> Firestore Database -> Rules.
    *   **For the Student Job Portal to work correctly (allowing anyone to view open jobs, and students to apply), and for recruiters to manage data, you need appropriate rules.**
    *   **Example (use with caution, refine for production):**
        ```
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Allow authenticated users to read/write their own data or specific collections
            match /users/{userId}/{document=**} {
              allow read, write: if request.auth != null && request.auth.uid == userId;
            }
            match /candidates/{candidateId} {
                // Allow authenticated users (recruiters) to read/write.
                // Students effectively write/update their own profile via the student application flow.
                allow read, write: if request.auth != null; 
            }
            match /jobRequisitions/{jobId} {
                // Public can read, only authenticated (recruiters) can create/update/delete
                allow read: if true; // Allows anyone to read job requisitions
                allow create, update, delete: if request.auth != null; // Recruiters need to be logged in to manage jobs
            }
            match /jobApplications/{applicationId} {
                // Allow authenticated users to create applications for themselves (candidateEmail matches their auth email)
                // Allow authenticated recruiters to read all applications.
                allow create: if request.auth != null && request.resource.data.candidateEmail == request.auth.token.email;
                allow read: if request.auth != null; // Simplistic for now, recruiters can read all.
                // Add update/delete rules as needed (e.g., only recruiter can update status).
            }
          }
        }
        ```
    *   **For production, you MUST define more granular security rules.**

7.  **Firestore Composite Index (CRUCIAL for Student Job Portal):**
    *   The student job listing page queries jobs by `status` and orders them by `createdAt`. This requires a composite index in Firestore.
    *   If you see errors in your browser console about a missing index when viewing `/student/jobs`, Firebase will provide a direct link to create it. Follow that link.
    *   The index fields will typically be:
        *   Collection ID: `jobRequisitions`
        *   Fields to index: `status` (Ascending), `createdAt` (Descending)
    *   Wait for the index to finish building in the Firebase console.

8.  **Run Genkit Development Server:**
    Genkit flows run on a separate development server. Start it by running:
    ```bash
    npm run genkit:dev
    ```
    Alternatively, for automatic reloading when you change flow files:
    ```bash
    npm run genkit:watch
    ```
    This server typically starts on `http://localhost:4000`. Keep this terminal window open.

9.  **Run Next.js Development Server:**
    In a **new** terminal window or tab (while the Genkit server is still running), start the Next.js frontend application:
    ```bash
    npm run dev
    ```
    This command starts the Next.js development server, usually on `http://localhost:9002` (as configured in `package.json`).

10. **Access the Application:**
    Open your web browser and navigate to:
    [http://localhost:9002](http://localhost:9002)

    You should now see the TalentSleuth AI application running. Recruiters can sign up/login to access the dashboard. Students can use the "Student Job Portal" link on the landing page (which directs to student login, then to job listings).

## Available Scripts

In the `package.json` file, you'll find several scripts for managing the project:

-   `npm run dev`: Starts the Next.js development server (frontend).
-   `npm run build`: Builds the Next.js application for production.
-   `npm run start`: Starts a Next.js production server (after building).
-   `npm run lint`: Lints the codebase using Next.js's built-in ESLint configuration.
-   `npm run typecheck`: Runs TypeScript to check for type errors.
-   `npm run genkit:dev`: Starts the Genkit development server.
-   `npm run genkit:watch`: Starts the Genkit development server with file watching for auto-reloads.

## Further Development & Considerations

*   **Full ATS Feature Implementation:** Gradually build out the remaining ATS features, including Google Workspace API integrations (OAuth 2.0 setup will be necessary for user-specific data access for Gmail, Calendar, Drive).
*   **Robust Firestore Security Rules:** This is paramount for any production application. Define rules based on user roles.
*   **Error Handling and UI Polish:** Enhance error handling for AI flows, API calls, and Firestore operations.
*   **File Handling Robustness:** Improve handling and user feedback for various resume file types, sizes, and potential parsing issues.
*   **Security:** Ensure API keys are managed securely. Use Firebase App Check.
*   **Scalability:** For larger applications, consider Firestore data structuring, indexing, and query optimization.
*   **User Roles:** Implement more distinct user roles (e.g., in Firestore user profiles) to control access to different parts of the application if needed beyond current auth separation.
*   **Student Profile Management:** Allow students to fully manage their profiles after auto-creation.
```