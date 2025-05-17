
"use client";

import type { ReactNode} from "react";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { unifiedMockCandidates as initialMockCandidates, type UnifiedCandidate, generateResumeTextContent } from "@/lib/mock-data";
import type { ParseResumeOutput } from "@/ai/flows/resume-parsing";
import { db } from "@/lib/firebase"; // Import Firestore instance
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

export interface UnifiedCandidate extends ParseResumeOutput { // Exporting this for use in other files
  id: string;
  role?: string;
  avatarUrl?: string;
  resumeOriginalDataUri?: string; 
  resumeTextContent: string; 
  topSkill?: string; 
  fitScore?: number;
  justification?: string; // Added justification field
}


interface CandidateContextType {
  candidates: UnifiedCandidate[];
  addCandidate: (parsedData: ParseResumeOutput, resumeOriginalDataUri: string) => Promise<UnifiedCandidate | null>;
  getCandidateById: (id: string) => UnifiedCandidate | undefined;
  updateCandidateFitScore: (id: string, fitScore: number, justification?: string) => void; 
  deleteCandidate: (id: string) => Promise<void>;
  loadingCandidates: boolean;
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined);

export const CandidateProvider = ({ children }: { children: ReactNode }) => {
  const [candidates, setCandidates] = useState<UnifiedCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoadingCandidates(true);
      try {
        const candidatesCollectionRef = collection(db, "candidates");
        const q = query(candidatesCollectionRef, orderBy("name")); // Order by name for consistent listing
        const querySnapshot = await getDocs(q);
        const fetchedCandidates: UnifiedCandidate[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          const candidate: UnifiedCandidate = {
            id: doc.id,
            name: data.name || "N/A",
            email: data.email || "N/A",
            phone: data.phone || "N/A",
            education: data.education || "N/A",
            experience: data.experience || "N/A",
            skills: data.skills || "N/A",
            certifications: data.certifications,
            role: data.role,
            avatarUrl: data.avatarUrl,
            resumeOriginalDataUri: data.resumeOriginalDataUri,
            resumeTextContent: data.resumeTextContent || generateResumeTextContent(data as ParseResumeOutput),
            topSkill: data.topSkill,
            fitScore: data.fitScore,
            justification: data.justification,
          };
          fetchedCandidates.push(candidate);
        });
        setCandidates(fetchedCandidates);
      } catch (error) {
        console.error("Error fetching candidates from Firestore:", error);
        toast({
          title: "Error Fetching Data",
          description: "Could not load candidate data from the database.",
          variant: "destructive",
        });
      } finally {
        setLoadingCandidates(false);
      }
    };

    fetchCandidates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  const addCandidate = useCallback(async (parsedData: ParseResumeOutput, resumeOriginalDataUri: string): Promise<UnifiedCandidate | null> => {
    const newId = doc(collection(db, "temp_ids")).id; 

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
      role: parsedData.experience?.split('\n')[0]?.trim() || "Role not specified", 
      topSkill: parsedData.skills?.split(',')[0]?.trim() || "Skill not specified", 
      resumeOriginalDataUri,
      resumeTextContent, 
    };

    try {
      const candidateDocRef = doc(db, "candidates", newCandidate.id);
      await setDoc(candidateDocRef, newCandidate);
      setCandidates(prevCandidates => [newCandidate, ...prevCandidates].sort((a, b) => (a.name || "").localeCompare(b.name || ""))); // Keep sorted
      toast({
        title: "Candidate Added",
        description: `${newCandidate.name} has been successfully saved to the database.`,
      });
      return newCandidate;
    } catch (error) {
      console.error("Error adding candidate to Firestore:", error);
      toast({
        title: "Database Error",
        description: `Failed to save ${newCandidate.name || 'candidate'} to the database.`,
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const getCandidateById = useCallback((id: string): UnifiedCandidate | undefined => {
    return candidates.find(candidate => candidate.id === id);
  }, [candidates]);

  const updateCandidateFitScore = useCallback(async (id: string, fitScore: number, justification?: string) => {
    try {
        const candidateDocRef = doc(db, "candidates", id);
        await setDoc(candidateDocRef, { fitScore, justification }, { merge: true }); // Use setDoc with merge:true to update or create
        setCandidates(prevCandidates =>
          prevCandidates.map(c =>
            c.id === id ? { ...c, fitScore, justification } : c 
          )
        );
        // toast({ title: "Fit Score Updated", description: `Score for candidate ${id} saved to database.` });
      } catch (error) {
        console.error("Error updating fit score in Firestore:", error);
        toast({
          title: "Database Error",
          description: `Failed to save fit score for candidate ${id}.`,
          variant: "destructive",
        });
      }
  }, [toast]);

  const deleteCandidate = useCallback(async (id: string) => {
    const candidateToDelete = candidates.find(c => c.id === id);
    const candidateName = candidateToDelete?.name || "The candidate";
    try {
      // Before deleting candidate, consider if you need to delete related jobApplications
      // For now, this is not implemented to keep it simpler. In a real app, you'd handle cascading deletes or cleanup.
      const candidateDocRef = doc(db, "candidates", id);
      await deleteDoc(candidateDocRef);
      setCandidates(prevCandidates => prevCandidates.filter(candidate => candidate.id !== id));
      toast({
        title: "Candidate Deleted",
        description: `${candidateName} has been removed from the database.`,
      });
    } catch (error) {
      console.error("Error deleting candidate from Firestore:", error);
      toast({
        title: "Database Error",
        description: `Failed to delete ${candidateName} from the database.`,
        variant: "destructive",
      });
    }
  }, [candidates, toast]);


  return (
    <CandidateContext.Provider value={{ candidates, addCandidate, getCandidateById, updateCandidateFitScore, deleteCandidate, loadingCandidates }}>
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

    