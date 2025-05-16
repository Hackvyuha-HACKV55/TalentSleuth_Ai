import { config } from 'dotenv';
config();

import '@/ai/flows/red-flag-detection.ts';
import '@/ai/flows/profile-discovery.ts';
import '@/ai/flows/role-matching.ts';
import '@/ai/flows/resume-parsing.ts';