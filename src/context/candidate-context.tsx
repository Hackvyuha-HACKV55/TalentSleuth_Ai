
"use client";

import type { ReactNode} from "react";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ParseResumeOutput } from "@/ai/flows/resume-parsing";
import { db } from "@/lib/firebase"; // Import Firestore instance
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, Timestamp } from "firebase/firestore"; // Added Timestamp
import { useToast } from "@/hooks/use-toast";
import { generateResumeTextContent } from "@/lib/mock-data"; // For resumeTextContent generation


export interface UnifiedCandidate extends ParseResumeOutput {
  id: string;
  role?: string;
  avatarUrl?: string;
  resumeOriginalDataUri?: string; 
  resumeTextContent: string; 
  topSkill?: string; 
  fitScore?: number;
  justification?: string; 
  // Firebase Timestamps for creation/update, if needed
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}


interface CandidateContextType {
  candidates: UnifiedCandidate[];
  addCandidate: (parsedData: ParseResumeOutput, resumeOriginalDataUri: string) => Promise<UnifiedCandidate | null>; // Recruiter adding candidate
  getCandidateById: (id: string) => UnifiedCandidate | undefined;
  updateCandidateFitScore: (id: string, fitScore: number, justification?: string) => void; 
  deleteCandidate: (id: string) => Promise<void>;
  loadingCandidates: boolean;
  // New functions for student application flow to update local state
  addCandidateToLocalState: (candidate: UnifiedCandidate) => void;
  refreshCandidateInLocalState: (candidateId: string, updatedData: Partial<UnifiedCandidate>) => void;
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined);

export const CandidateProvider = ({ children }: { children: ReactNode }) => {
  const [candidates, setCandidates] = useState<UnifiedCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const { toast } = useToast();

  const sortCandidates = (candidateList: UnifiedCandidate[]) => {
    return [...candidateList].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  };
  
  useEffect(() => {
    const fetchCandidates = async () => {
      setLoadingCandidates(true);
      try {
        const candidatesCollectionRef = collection(db, "candidates");
        const q = query(candidatesCollectionRef, orderBy("name"));
        const querySnapshot = await getDocs(q);
        const fetchedCandidates: UnifiedCandidate[] = [];
        querySnapshot.forEach((docSnap) => { // Renamed doc to docSnap to avoid conflict
          const data = docSnap.data();
          // Ensure all fields are correctly mapped, especially Timestamps
          const candidate: UnifiedCandidate = {
            id: docSnap.id,
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
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt : undefined,
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : undefined,
          };
          fetchedCandidates.push(candidate);
        });
        setCandidates(sortCandidates(fetchedCandidates));
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

  // For recruiter adding new candidate
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
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    try {
      const candidateDocRef = doc(db, "candidates", newCandidate.id);
      await setDoc(candidateDocRef, newCandidate);
      setCandidates(prev => sortCandidates([newCandidate, ...prev]));
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
        await updateDoc(candidateDocRef, { fitScore, justification, updatedAt: Timestamp.now() });
        setCandidates(prevCandidates =>
          sortCandidates(prevCandidates.map(c =>
            c.id === id ? { ...c, fitScore, justification, updatedAt: Timestamp.now() } : c 
          ))
        );
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
      const candidateDocRef = doc(db, "candidates", id);
      await deleteDoc(candidateDocRef);
      setCandidates(prevCandidates => sortCandidates(prevCandidates.filter(candidate => candidate.id !== id)));
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

  // Called by student application flow after they successfully create/update in Firestore
  const addCandidateToLocalState = useCallback((candidate: UnifiedCandidate) => {
    setCandidates(prev => {
      // Avoid duplicates if somehow called multiple times for the same new candidate
      if (prev.find(c => c.id === candidate.id)) return prev;
      return sortCandidates([candidate, ...prev]);
    });
  }, []);
  
  // Called by student application flow after they successfully update in Firestore
  const refreshCandidateInLocalState = useCallback((candidateId: string, updatedData: Partial<UnifiedCandidate>) => {
    setCandidates(prev => sortCandidates(
      prev.map(c => c.id === candidateId ? { ...c, ...updatedData, id: candidateId } : c) // Ensure id is preserved
    ));
  }, []);


  return (
    <CandidateContext.Provider value={{ 
        candidates, 
        addCandidate, 
        getCandidateById, 
        updateCandidateFitScore, 
        deleteCandidate, 
        loadingCandidates,
        addCandidateToLocalState,
        refreshCandidateInLocalState
    }}>
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
