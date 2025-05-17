
# TalentSleuth AI - Your Virtual Talent Analyst

TalentSleuth AI is an intelligent platform designed to streamline the hiring process for HR teams. It leverages AI to parse resumes, discover candidate profiles, assess role fitment, detect potential red flags, and generate interview questions, providing a comprehensive toolkit for talent acquisition. Candidate data is persistently stored using Firebase Firestore.

## Core Features

*   **AI Resume Parsing:** Automatically extract key candidate information (contact details, education, experience, skills, certifications) from resumes (TXT, PDF, DOCX) using Gemini.
*   **Dynamic Candidate Pool & Firestore Persistence:** Parsed resumes create new candidate profiles stored in Firebase Firestore, managed via React Context. Data persists across sessions.
*   **Candidate Dossier & Profile View:** Detailed view for each candidate showing parsed information, and sections for AI-driven insights (Profile Discovery, Red Flag Detection, Sentiment Analysis).
*   **Cross-Platform Profile Discovery (Simulated):** AI simulates finding and summarizing candidate data from platforms like LinkedIn, GitHub, and Naukri based on name and email (discovery is more effective if resume text contains links to these platforms).
*   **Red Flag Detection:** AI analyzes resume text against (simulated) profile data to identify discrepancies, frequent job switching, or incomplete/dated information.
*   **AI Role Fitment Matching:** Upload a job description and select a candidate to get an AI-generated fitment score (0-100) and justification. Scores are updated in Firestore.
*   **AI Interview Question Generator:** Generate tailored interview questions based on job title and candidate skills. Can auto-fill details by selecting an existing candidate from the database.
*   **User Authentication:** Secure sign-up, login, and password reset functionality using Firebase Authentication.
*   **Candidate Deletion:** Ability to delete candidate profiles from the database.
*   **Side-by-Side Candidate Comparison:** A dashboard to compare key details of multiple candidates.
*   **Sentiment Analysis:** Analyze the sentiment of text (e.g., endorsements, reviews) related to a candidate.
*   **Job Requisition Management (Basic ATS):** Create and manage job postings, stored in Firestore.

## Planned ATS Features (Future Development)
The application aims to expand its ATS capabilities by integrating with Google Workspace APIs:
*   **Automated Resume Intake:** Via Gmail API & Google Drive API.
*   **Candidate Workflow & Status Tracking:** Detailed application stage management.
*   **Interview Scheduling:** Google Calendar & Google Meet API integration.
*   **Communication Logs:** Gmail API for tracking email threads.
*   **Document & Note Management:** Enhanced file storage in Google Drive.
*   **Task Reminders & Follow-ups:** Google Calendar integration.
*   **Team Collaboration Features.**
*   **Analytics Dashboard.**

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
    *   **Firebase Firestore:** NoSQL cloud database for storing and syncing candidate data and job requisitions.
-   **Authentication:**
    *   **Firebase Authentication:** Manages user sign-up, login, and session management.
-   **Client-Side State Management:**
    *   **React Context API:** Used for managing global UI state like authentication status and the dynamic list of candidates (synced with Firestore).
-   **Development Tools:**
    *   **npm/yarn:** Package management.
    *   **ESLint & Prettier:** (Assumed for code quality)

## Project Structure

```
talentsleuth-ai/
├── .env                  # Environment variables (GOOGLE_API_KEY, Google Workspace API Keys)
├── README.md             # This file
├── components.json       # ShadCN UI configuration
├── next.config.ts        # Next.js configuration
├── package.json          # Project dependencies and scripts (serves as requirements list)
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
│   │   ├── (auth)/         # Authentication-related pages (login, signup, forgot-password)
│   │   ├── dashboard/      # Main application dashboard routes
│   │   │   ├── ats/
│   │   │   │   └── jobs/
│   │   │   │       ├── create/page.tsx  # Create new job requisition
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
│   │   ├── mock-data.ts    # Initial mock candidate data (used if Firestore is empty/for reference)
│   │   └── utils.ts        # General utility functions (e.g., cn for Tailwind)
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Prerequisites

Before you begin, ensure you have the following installed:
-   **Node.js:** Version 18.x or 20.x is recommended. You can download it from [nodejs.org](https://nodejs.org/).
-   **npm** (comes with Node.js) or **yarn** (optional, install via `npm install -g yarn`).
-   **Google Gemini API Key:** You need an API key from Google AI Studio to use the AI features. Get one [here](https://aistudio.google.com/app/apikey).
-   **Firebase Project:**
    *   Create a Firebase project at [firebase.google.com](https://firebase.google.com/).
    *   Enable **Authentication** (Email/Password sign-in method).
    *   Enable **Firestore Database** in your Firebase project. Start in test mode for easy setup (but configure security rules for production).
-   **(Optional for future ATS features) Google Cloud Project & API Keys:**
    *   For features like Google Drive, Gmail, Calendar, and Meet integration, you'll need a Google Cloud Platform project with these APIs enabled.
    *   You'll also need to generate API keys or OAuth 2.0 credentials for these services. **Securely manage these credentials.**

## Setup and Running Locally

Follow these steps to get the project running on your local machine:

1.  **Download and Extract:**
    Download the project files (e.g., as a ZIP) and extract them to a folder on your computer.

2.  **Navigate to Project Directory:**
    Open your terminal or command prompt and navigate into the project's root folder:
    ```bash
    cd path/to/your/talentsleuth-ai-folder
    ```

3.  **Install Dependencies (Requirements):**
    The `package.json` file lists all necessary dependencies (this is the Node.js equivalent of a `requirements.txt` file). Install them using npm or yarn:
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
    *   Replace the placeholder `firebaseConfig` object with your actual Firebase project's configuration. You can find this in your Firebase project settings (Project settings > General > Your apps > Web app > SDK setup and configuration > Config).

5.  **Set Up Environment Variables:**
    *   Create a new file named `.env` in the root directory of the project (if it doesn't exist).
    *   Add your **Google Gemini API Key**:
        ```env
        GOOGLE_API_KEY=your_actual_gemini_api_key_here
        ```
    *   **(Optional, for planned ATS features)** If you have API keys for Google Drive, Gmail, Calendar, or Meet, add them as well (placeholders are provided in the file).
        ```env
        GOOGLE_DRIVE_API_KEY=your_drive_api_key
        GOOGLE_MEET_API_KEY=your_meet_api_key
        GOOGLE_CALENDAR_API_KEY=your_calendar_api_key
        GOOGLE_GMAIL_API_KEY=your_gmail_api_key
        ```
        Replace placeholders with your actual keys. **Remember the security implications of handling these keys.**

6.  **Firebase Security Rules (Important for Firestore):**
    *   Go to your Firebase Console -> Firestore Database -> Rules.
    *   For initial development, you can use rules that allow authenticated users to read/write. **Example (use with caution, refine for production):**
        ```
        rules_version = '2';
        service cloud.firestore {
          match /databases/{database}/documents {
            // Allow authenticated users to read/write their own data or specific collections
            match /users/{userId}/{document=**} {
              allow read, write: if request.auth != null && request.auth.uid == userId;
            }
            match /candidates/{candidateId} {
                allow read, write: if request.auth != null; // Example: All auth users can manage candidates
            }
            match /jobRequisitions/{jobId} {
                allow read, write: if request.auth != null; // Example: All auth users can manage jobs
            }
          }
        }
        ```
    *   **For production, you MUST define more granular security rules.**

7.  **Run Genkit Development Server:**
    Genkit flows run on a separate development server. Start it by running:
    ```bash
    npm run genkit:dev
    ```
    Alternatively, for automatic reloading when you change flow files:
    ```bash
    npm run genkit:watch
    ```
    This server typically starts on `http://localhost:4000` (or the port configured in your Genkit setup) and will show logs for Genkit operations. Keep this terminal window open.

8.  **Run Next.js Development Server:**
    In a **new** terminal window or tab (while the Genkit server is still running), start the Next.js frontend application:
    ```bash
    npm run dev
    ```
    This command starts the Next.js development server, usually on `http://localhost:9002` (as configured in `package.json`).

9.  **Access the Application:**
    Open your web browser and navigate to:
    [http://localhost:9002](http://localhost:9002)

    You should now see the TalentSleuth AI application running. You can sign up for an account, log in, and start using the features.

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

*   **Full ATS Feature Implementation:** Gradually build out the remaining ATS features, including Google Workspace API integrations (OAuth 2.0 setup will be necessary for user-specific data access).
*   **Robust Firestore Security Rules:** This is paramount for any production application.
*   **Error Handling and UI Polish:** Enhance error handling for AI flows, API calls, and Firestore operations.
*   **File Handling Robustness:** Improve handling and user feedback for various resume file types, sizes, and potential parsing issues.
*   **Security:** Ensure API keys are managed securely and not exposed on the client-side if possible for services that require server-to-server calls.
*   **Scalability:** For larger applications, consider Firestore data structuring, indexing, and query optimization.
