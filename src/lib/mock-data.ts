
// @ts-nocheck
// Disabling TypeScript checking for this mock data file.
// In a real application, you'd want to ensure types are correct.

import type { ParseResumeOutput } from "@/ai/flows/resume-parsing";
import type { UnifiedCandidate as CandidateInterface } from "@/context/candidate-context"; // Use the one from context

// Re-export UnifiedCandidate if it's defined here, or ensure it matches the context one.
// For simplicity, we'll rely on the one exported from candidate-context.tsx
export type { CandidateInterface as UnifiedCandidate };


// Helper function to generate a simple text summary from parsed data
// This will be used for the `resumeTextContent` if only parsed data is available.
export function generateResumeTextContent(parsedData: ParseResumeOutput): string {
  let content = `Name: ${parsedData.name || 'N/A'}\nEmail: ${parsedData.email || 'N/A'}\nPhone: ${parsedData.phone || 'N/A'}\n\nEducation:\n${parsedData.education || 'N/A'}\n\nExperience:\n${parsedData.experience || 'N/A'}\n\nSkills:\n${parsedData.skills || 'N/A'}`;
  if (parsedData.certifications) {
    content += `\n\nCertifications:\n${parsedData.certifications}`;
  }
  return content;
}

// This initial mock data will be fetched from Firestore on app load if the DB is empty
// or if you choose to seed it. Otherwise, Firestore becomes the source of truth.
export const unifiedMockCandidates: CandidateInterface[] = [
  // Keep this empty or with a few examples if you plan to seed Firestore manually.
  // The application now primarily loads from Firestore.
  // {
  //   id: "1",
  //   name: "Alice Wonderland",
  //   email: "alice.w@example.com",
  //   phone: "123-456-7890",
  //   education: "M.S. in AI, Wonderland University",
  //   experience: "5 years as AI Engineer at Mad Hatter Inc. Developed several NLP models.",
  //   skills: "Python, TensorFlow, PyTorch, NLP, Computer Vision",
  //   certifications: "Certified AI Professional",
  //   role: "Senior AI Engineer",
  //   avatarUrl: "https://placehold.co/80x80.png?text=AW",
  //   resumeTextContent: "Alice Wonderland\nalice@example.com\n123-456-7890\nEducation: M.S. in AI, Wonderland University\nExperience: 5 years as AI Engineer at Mad Hatter Inc. Developed several NLP models.\nSkills: Python, TensorFlow, PyTorch, NLP, Computer Vision\nCertifications: Certified AI Professional",
  //   topSkill: "AI Development",
  //   fitScore: 85,
  // },
];
