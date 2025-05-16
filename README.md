
# TalentSleuth AI - Your Virtual Talent Analyst

TalentSleuth AI is an intelligent platform designed to streamline the hiring process for HR teams. It leverages AI to parse resumes, discover candidate profiles, assess role fitment, detect potential red flags, and generate interview questions, providing a comprehensive toolkit for talent acquisition.

## Core Features

*   **AI Resume Parsing:** Automatically extract key candidate information (contact details, education, experience, skills, certifications) from resumes (TXT, PDF, DOCX) using Gemini.
*   **Dynamic Candidate Pool:** Parsed resumes create new candidate profiles within the application, managed via client-side state.
*   **Candidate Dossier & Profile View:** Detailed view for each candidate showing parsed information, and sections for AI-driven insights.
*   **Cross-Platform Profile Discovery (Simulated):** AI simulates finding and summarizing candidate data from platforms like LinkedIn, GitHub, and Naukri based on name and email.
*   **Red Flag Detection:** AI analyzes resume text against (simulated) profile data to identify discrepancies, frequent job switching, or incomplete/dated information.
*   **AI Role Fitment Matching:** Upload a job description and select a candidate to get an AI-generated fitment score (0-100) and justification.
*   **AI Interview Question Generator:** Generate tailored interview questions based on job title and candidate skills (can be pre-filled by selecting a candidate).
*   **User Authentication:** Secure sign-up, login, and password reset functionality using Firebase Authentication.

## Tech Stack

-   **Frontend:**
    -   **Next.js 15:** React framework with App Router for server components and optimized routing.
    -   **React 18:** JavaScript library for building user interfaces.
    -   **TypeScript:** Superset of JavaScript for static typing.
-   **UI & Styling:**
    -   **ShadCN UI:** Re-usable UI components built with Radix UI and Tailwind CSS.
    -   **Tailwind CSS:** Utility-first CSS framework for rapid styling.
    -   **Lucide React:** Icon library.
-   **AI & Backend Logic:**
    -   **Genkit (by Google):** Toolkit for building AI-powered applications. Used for defining and running AI flows.
        -   `@genkit-ai/googleai` plugin for Google Gemini.
    -   **Google Gemini Pro (via `gemini-1.5-flash-latest` model):** Leveraged for generative AI tasks (resume parsing, profile discovery, red flag detection, role matching, interview question generation).
-   **Authentication:**
    -   **Firebase Authentication:** Manages user sign-up, login, and session management.
-   **Client-Side State Management:**
    -   **React Context API:** Used for managing global UI state like authentication status and the dynamic list of candidates.
-   **Development Tools:**
    -   **npm/yarn:** Package management.
    -   **ESLint & Prettier:** (Assumed for code quality, though not explicitly configured by me in this session)

## Project Structure

```
talentsleuth-ai/
├── .env                  # Environment variables (e.g., GOOGLE_API_KEY)
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
│   │       └── interview-question-generator.ts # New
│   ├── app/              # Next.js App Router directory
│   │   ├── (auth)/         # Authentication-related pages (login, signup, forgot-password)
│   │   ├── dashboard/      # Main application dashboard routes
│   │   │   ├── candidates/
│   │   │   │   ├── [id]/page.tsx # Candidate detail page
│   │   │   │   └── page.tsx      # Candidate listing page
│   │   │   ├── upload-jd/page.tsx
│   │   │   ├── upload-resume/page.tsx
│   │   │   ├── interview-prep/page.tsx # New
│   │   │   ├── settings/page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx      # Dashboard overview
│   │   ├── globals.css     # Global styles and Tailwind directives
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Landing page
│   ├── components/
│   │   ├── domain/         # Application-specific components (e.g., CandidateCard, ResumeUploader)
│   │   ├── layout/         # Layout components (Navbar, Footer, DashboardSidebarNav)
│   │   └── ui/             # ShadCN UI components (Button, Card, etc.)
│   ├── context/            # React Context API providers
│   │   ├── auth-context.tsx
│   │   └── candidate-context.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   ├── lib/                # Utility functions and configurations
│   │   ├── firebase.ts     # Firebase initialization
│   │   ├── mock-data.ts    # Mock candidate data (used for initial state)
│   │   └── utils.ts        # General utility functions (e.g., cn for Tailwind)
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## Prerequisites

Before you begin, ensure you have the following installed:
-   **Node.js:** Version 18.x or 20.x is recommended. You can download it from [nodejs.org](https://nodejs.org/).
-   **npm** (comes with Node.js) or **yarn** (optional, install via `npm install -g yarn`).
-   **Google Gemini API Key:** You need an API key from Google AI Studio to use the AI features. You can get one [here](https://aistudio.google.com/app/apikey).

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
    The `package.json` file lists all necessary dependencies. This is the equivalent of a `requirements.txt` file for Node.js projects. Install them using npm or yarn:
    ```bash
    npm install
    ```
    or
    ```bash
    yarn install
    ```
    This command reads `package.json` and downloads the required packages into the `node_modules` folder.

4.  **Set Up Environment Variables:**
    You need to provide your Google Gemini API key.
    *   Create a new file named `.env` in the root directory of the project.
    *   Add your API key to this file:
        ```env
        GOOGLE_API_KEY=your_actual_gemini_api_key_here
        ```
        Replace `your_actual_gemini_api_key_here` with your real Gemini API key.

5.  **Run Genkit Development Server:**
    Genkit flows run on a separate development server. Start it by running:
    ```bash
    npm run genkit:dev
    ```
    Alternatively, for automatic reloading when you change flow files:
    ```bash
    npm run genkit:watch
    ```
    This server typically starts on `http://localhost:4000` (or the port configured in your Genkit setup) and will show logs for Genkit operations. Keep this terminal window open.

6.  **Run Next.js Development Server:**
    In a **new** terminal window or tab (while the Genkit server is still running), start the Next.js frontend application:
    ```bash
    npm run dev
    ```
    This command starts the Next.js development server, usually on `http://localhost:9002` (as configured in `package.json`).

7.  **Access the Application:**
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

*   **Data Persistence:** Currently, newly added candidates are stored in client-side React Context and will be lost on browser refresh. For persistent storage, integrate Firebase Firestore to save and retrieve candidate data.
*   **Real-time Profile Discovery:** The current profile discovery is simulated by the AI. True cross-platform scraping would require significant additional backend infrastructure and adherence to platform terms of service.
*   **Error Handling and UI Polish:** Enhance error handling for AI flows and refine the UI for a more robust user experience.
*   **File Handling Robustness:** Improve handling and user feedback for various resume file types, sizes, and potential parsing issues (e.g., image-only PDFs).
*   **Security:** For a production application, ensure API keys are managed securely (e.g., using environment variables on the server or dedicated secret management services) and not exposed on the client-side if possible.
*   **Advanced AI Features:** Explore implementing other planned features like sentiment analysis, engagement tracking, or ATS integration.
```