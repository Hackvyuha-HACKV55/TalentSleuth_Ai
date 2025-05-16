
// @ts-nocheck
// Disabling TypeScript checking for this mock data file.
// In a real application, you'd want to ensure types are correct.

import type { ParseResumeOutput } from "@/ai/flows/resume-parsing";

export interface UnifiedCandidate extends ParseResumeOutput {
  id: string;
  role?: string;
  avatarUrl?: string;
  resumeOriginalDataUri?: string; // To store the original uploaded file's data URI
  resumeTextContent: string; // Consolidated text from resume for simpler use in some flows
  topSkill?: string; // Summary skill for display
  fitScore?: number;
  // Ensure all fields from ParseResumeOutput are here if not already extended
  // name, email, phone, education, experience, skills, certifications are from ParseResumeOutput
}


// Helper function to generate a simple text summary from parsed data
// This will be used for the `resumeTextContent` if only parsed data is available.
export function generateResumeTextContent(parsedData: ParseResumeOutput): string {
  let content = `Name: ${parsedData.name || 'N/A'}\nEmail: ${parsedData.email || 'N/A'}\nPhone: ${parsedData.phone || 'N/A'}\n\nEducation:\n${parsedData.education || 'N/A'}\n\nExperience:\n${parsedData.experience || 'N/A'}\n\nSkills:\n${parsedData.skills || 'N/A'}`;
  if (parsedData.certifications) {
    content += `\n\nCertifications:\n${parsedData.certifications}`;
  }
  return content;
}


export const unifiedMockCandidates: UnifiedCandidate[] = [
  {
    id: "1",
    name: "Alice Wonderland",
    email: "alice.w@example.com",
    phone: "123-456-7890",
    education: "M.S. in AI, Wonderland University",
    experience: "5 years as AI Engineer at Mad Hatter Inc. Developed several NLP models.",
    skills: "Python, TensorFlow, PyTorch, NLP, Computer Vision",
    certifications: "Certified AI Professional",
    role: "Senior AI Engineer",
    avatarUrl: "https://placehold.co/80x80.png?text=AW",
    resumeTextContent: "Alice Wonderland\nalice@example.com\n123-456-7890\nEducation: M.S. in AI, Wonderland University\nExperience: 5 years as AI Engineer at Mad Hatter Inc. Developed several NLP models.\nSkills: Python, TensorFlow, PyTorch, NLP, Computer Vision\nCertifications: Certified AI Professional",
    topSkill: "AI Development",
    fitScore: 85,
  },
  {
    id: "2",
    name: "Bob The Builder",
    email: "bob.b@example.com", 
    phone: "234-567-8901",
    education: "B.S. in Construction Management, Builder's College",
    experience: "10 years as Lead Project Manager at FixIt Felix Jr. Co. Managed projects up to $10M.",
    skills: "Agile, Scrum, Risk Management, Budgeting, Team Leadership",
    certifications: "PMP Certified",
    role: "Lead Project Manager",
    avatarUrl: "https://placehold.co/80x80.png?text=BB", 
    resumeTextContent: "Bob The Builder\nbob@example.com\n234-567-8901\nEducation: B.S. in Construction Management, Builder's College\nExperience: 10 years as Lead Project Manager at FixIt Felix Jr. Co. Managed projects up to $10M.\nSkills: Agile, Scrum, Risk Management, Budgeting, Team Leadership\nCertifications: PMP Certified",
    topSkill: "Project Management",
    fitScore: 78,
  },
  {
    id: "3",
    name: "Charlie Brown",
    email: "charlie.b@example.com", 
    phone: "345-678-9012",
    education: "B.F.A in Graphic Design, Peanuts Art School",
    experience: "3 years as UX Designer at Good Grief Graphics. Redesigned kite-flying app.",
    skills: "Figma, Sketch, Adobe XD, User Research, Prototyping",
    certifications: undefined, 
    role: "Principal UX Designer",
    avatarUrl: "https://placehold.co/80x80.png?text=CB", 
    resumeTextContent: "Charlie Brown\ncharlie@example.com\n345-678-9012\nEducation: B.F.A in Graphic Design, Peanuts Art School\nExperience: 3 years as UX Designer at Good Grief Graphics. Redesigned kite-flying app.\nSkills: Figma, Sketch, Adobe XD, User Research, Prototyping",
    topSkill: "UX Design",
    fitScore: 92,
  },
  {
    id: "4",
    name: "Diana Prince",
    email: "diana.p@example.com",
    phone: "456-789-0123",
    education: "Ph.D. in Ancient History, Themyscira University",
    experience: "Curator at Louvre Museum, consultant on ancient artifacts.",
    skills: "Archaeology, Cryptography, Ancient Languages, Hand-to-Hand Combat",
    certifications: "Expert in Lasso of Truth",
    role: "Security Analyst",
    avatarUrl: "https://placehold.co/80x80.png?text=DP",
    resumeTextContent: "Diana Prince\ndiana.p@example.com\n456-789-0123\nEducation: Ph.D. in Ancient History, Themyscira University\nExperience: Curator at Louvre Museum, consultant on ancient artifacts. Specialized in threat assessment for valuable items.\nSkills: Archaeology, Cryptography, Ancient Languages, Risk Analysis, Cybersecurity principles",
    topSkill: "Cybersecurity",
    fitScore: 88,
  },
  {
    id: "5",
    name: "Edward Scissorhands",
    email: "edward.s@example.com",
    phone: "567-890-1234",
    education: "Self-taught, various workshops on topiary and ice sculpting",
    experience: "Freelance stylist and artist. Proficient with sharp instruments.",
    skills: "JavaScript, React, CSS, Precision Engineering, Attention to Detail",
    certifications: "Avant-Garde Design Award",
    role: "Frontend Developer",
    avatarUrl: "https://placehold.co/80x80.png?text=ES",
    resumeTextContent: "Edward Scissorhands\nedward.s@example.com\n567-890-1234\nEducation: Self-taught\nExperience: Unique projects requiring intricate designs and precise execution. Developed several innovative user interfaces with unconventional tools.\nSkills: JavaScript, React, CSS, HTML, UI/UX, Creative Problem Solving",
    topSkill: "Frontend Development",
    fitScore: 75,
  },
  {
    id: "6",
    name: "Fiona Gallagher",
    email: "fiona.g@example.com",
    phone: "678-901-2345",
    education: "GED, School of Hard Knocks",
    experience: "Managed multiple small businesses, adept at crisis management and resource allocation.",
    skills: "SQL, Python (Pandas, NumPy), Excel, Data Visualization, Problem Solving",
    certifications: "Certified Resource Manager (self-proclaimed)",
    role: "Data Scientist",
    avatarUrl: "https://placehold.co/80x80.png?text=FG",
    resumeTextContent: "Fiona Gallagher\nfiona.g@example.com\n678-901-2345\nEducation: GED\nExperience: Extensive experience in managing complex datasets for household and small business operations. Proven ability to extract insights from limited information.\nSkills: SQL, Python (Pandas, NumPy), Excel, Data Visualization (Tableau), Statistical Analysis",
    topSkill: "Data Analysis",
    fitScore: 90,
  },
];
