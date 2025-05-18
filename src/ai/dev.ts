
import { config } from 'dotenv';
config();

import '@/ai/flows/red-flag-detection.ts';
import '@/ai/flows/profile-discovery.ts';
import '@/ai/flows/role-matching.ts';
import '@/ai/flows/resume-parsing.ts';
import '@/ai/flows/interview-question-generator.ts';
import '@/ai/flows/sentiment-analysis.ts';
import '@/ai/flows/generate-custom-resume.ts'; // Ensure this line is present
    
