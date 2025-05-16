
"use client";

import type { ReactNode} from "react";
import React, { createContext, useContext, useState, useCallback } from "react";
import { unifiedMockCandidates, type UnifiedCandidate, generateResumeTextContent } from "@/lib/mock-data";
import type { ParseResumeOutput } from "@/ai/flows/resume-parsing";

interface CandidateContextType {
  candidates: UnifiedCandidate[];
  addCandidate: (parsedData: ParseResumeOutput, resumeOriginalDataUri: string) => UnifiedCandidate;
  getCandidateById: (id: string) => UnifiedCandidate | undefined;
  updateCandidateFitScore: (id: string, fitScore: number, justification?: string) => void;
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined);

export const CandidateProvider = ({ children }: { children: ReactNode }) => {
  const [candidates, setCandidates] = useState<UnifiedCandidate[]>(unifiedMockCandidates);

  const addCandidate = useCallback((parsedData: ParseResumeOutput, resumeOriginalDataUri: string): UnifiedCandidate => {
    const newId = (Math.max(0, ...candidates.map(c => parseInt(c.id, 10))) + 1).toString();
    const initials = (parsedData.name || "New Candidate")
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    
    const resumeTextContent = generateResumeTextContent(parsedData);

    const newCandidate: UnifiedCandidate = {
      ...parsedData,
      id: newId,
      avatarUrl: `https://placehold.co/80x80.png?text=${initials}`,
      role: parsedData.experience?.split('\n')[0] || "Pending Role", // Basic role inference
      topSkill: parsedData.skills?.split(',')[0]?.trim() || "Pending Skill", // Basic top skill
      resumeOriginalDataUri,
      resumeTextContent, // Store the generated text content
      // fitScore will be undefined initially
    };
    setCandidates(prevCandidates => [...prevCandidates, newCandidate]);
    return newCandidate;
  }, [candidates]);

  const getCandidateById = useCallback((id: string): UnifiedCandidate | undefined => {
    return candidates.find(candidate => candidate.id === id);
  }, [candidates]);

  const updateCandidateFitScore = useCallback((id: string, fitScore: number, justification?: string) => {
    setCandidates(prevCandidates =>
      prevCandidates.map(c =>
        c.id === id ? { ...c, fitScore, justification } : c // `justification` would need to be added to UnifiedCandidate if used
      )
    );
  }, []);


  return (
    <CandidateContext.Provider value={{ candidates, addCandidate, getCandidateById, updateCandidateFitScore }}>
      {children}
    </CandidateContext.Provider>
  );
};

export const useCandidateContext = (): CandidateContextType => {
  const context = useContext(CandidateContext);
  if (context === undefined) {
    throw new Error("useCandidateContext must be used within a CandidateProvider");
  }
  return context;
};
