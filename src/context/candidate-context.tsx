
"use client";

import type { ReactNode} from "react";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import type { ParseResumeOutput } from "@/ai/flows/resume-parsing";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy, Timestamp, updateDoc, where, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { generateResumeTextContent } from "@/lib/mock-data";

export interface DigitalResume extends ParseResumeOutput {}

export interface UnifiedCandidate {
  id: string; 
  uid?: string; 
  name: string | null;
  email: string | null;
  phone?: string | null;
  education?: string | null;
  experience?: string | null;
  skills?: string | null;
  certifications?: string | null;
  role?: string;
  avatarUrl?: string;
  resumeOriginalDataUri?: string; 
  resumeTextContent: string;
  topSkill?: string;
  fitScore?: number;
  justification?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  resumeUrl?: string; 
  digitalResume?: DigitalResume; 
}


interface CandidateContextType {
  candidates: UnifiedCandidate[];
  addCandidate: (parsedData: ParseResumeOutput, resumeOriginalDataUri: string, name?: string, email?: string, uid?: string) => Promise<UnifiedCandidate | null>;
  getCandidateById: (id: string) => UnifiedCandidate | undefined;
  updateCandidateFitScore: (id: string, fitScore: number, justification?: string) => void;
  deleteCandidate: (id: string) => Promise<void>;
  loadingCandidates: boolean;
  addCandidateToLocalState: (candidate: UnifiedCandidate) => void;
  refreshCandidateInLocalState: (candidateId: string, updatedData: Partial<UnifiedCandidate>) => void;
  fetchCandidateByUid: (uid: string) => Promise<UnifiedCandidate | null>;
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
        const q = query(candidatesCollectionRef, orderBy("name")); // Default sort for recruiter view
        const querySnapshot = await getDocs(q);
        const fetchedCandidates: UnifiedCandidate[] = [];
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const candidate: UnifiedCandidate = {
            id: docSnap.id,
            uid: data.uid,
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
            resumeUrl: data.resumeUrl,
            digitalResume: data.digitalResume,
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

  const addCandidate = useCallback(async (
    parsedData: ParseResumeOutput,
    resumeOriginalDataUri: string, 
    nameInput?: string,
    emailInput?: string,
    uidInput?: string 
  ): Promise<UnifiedCandidate | null> => {
    const candidateId = uidInput || doc(collection(db, "temp_ids")).id; 
    const name = nameInput || parsedData.name;
    const email = emailInput || parsedData.email;

    if (!name || !email) {
        toast({
            title: "Missing Information",
            description: "Cannot add candidate without name and email.",
            variant: "destructive",
        });
        return null;
    }

    const initials = (name)
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const resumeTextContent = generateResumeTextContent(parsedData);

    const newCandidateData: UnifiedCandidate = {
      id: candidateId, 
      uid: uidInput, 
      name,
      email,
      phone: parsedData.phone,
      education: parsedData.education,
      experience: parsedData.experience,
      skills: parsedData.skills,
      certifications: parsedData.certifications,
      avatarUrl: `https://placehold.co/80x80.png?text=${initials}`,
      role: parsedData.experience?.split('\\n')[0]?.trim() || "Role not specified",
      topSkill: parsedData.skills?.split(',')[0]?.trim() || "Skill not specified",
      resumeOriginalDataUri: uidInput ? undefined : resumeOriginalDataUri, 
      resumeTextContent,
      digitalResume: parsedData, 
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    try {
      const candidateDocRef = doc(db, "candidates", candidateId);
      await setDoc(candidateDocRef, newCandidateData); 
      setCandidates(prev => sortCandidates([newCandidateData, ...prev.filter(c => c.id !== candidateId)]));
      toast({
        title: "Candidate Added/Updated",
        description: `${name} has been successfully saved to the database.`,
      });
      return newCandidateData;
    } catch (error) {
      console.error("Error adding/updating candidate in Firestore:", error);
      toast({
        title: "Database Error",
        description: `Failed to save ${name || 'candidate'} to the database.`,
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);

  const getCandidateById = useCallback((id: string): UnifiedCandidate | undefined => {
    return candidates.find(candidate => candidate.id === id);
  }, [candidates]);

  const fetchCandidateByUid = useCallback(async (uid: string): Promise<UnifiedCandidate | null> => {
    if (!uid) return null;
    try {
      const candidateDocRef = doc(db, "candidates", uid); // Use uid as document ID
      const docSnap = await getDoc(candidateDocRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as UnifiedCandidate;
      } else {
        console.log("No candidate document found for UID:", uid);
        return null;
      }
    } catch (error) {
      console.error("Error fetching candidate by UID:", error);
      toast({
        title: "Fetch Error",
        description: "Could not fetch candidate profile by UID.",
        variant: "destructive",
      });
      return null;
    }
  }, [toast]);


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
        title: "DatabaseError",
        description: `Failed to delete ${candidateName} from the database.`,
        variant: "destructive",
      });
    }
  }, [candidates, toast]);

  const addCandidateToLocalState = useCallback((candidate: UnifiedCandidate) => {
    setCandidates(prev => {
      const existingIndex = prev.findIndex(c => c.id === candidate.id);
      if (existingIndex > -1) { 
        const updatedCandidates = [...prev];
        updatedCandidates[existingIndex] = candidate;
        return sortCandidates(updatedCandidates);
      }
      return sortCandidates([candidate, ...prev]); 
    });
  }, []);

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
        refreshCandidateInLocalState,
        fetchCandidateByUid
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
