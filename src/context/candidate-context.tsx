
"use client";

import type { ReactNode} from "react";
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { unifiedMockCandidates as initialMockCandidates, type UnifiedCandidate, generateResumeTextContent } from "@/lib/mock-data";
import type { ParseResumeOutput } from "@/ai/flows/resume-parsing";
import { db } from "@/lib/firebase"; // Import Firestore instance
import { collection, doc, setDoc, getDocs, deleteDoc, query, orderBy } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface CandidateContextType {
  candidates: UnifiedCandidate[];
  addCandidate: (parsedData: ParseResumeOutput, resumeOriginalDataUri: string) => Promise<UnifiedCandidate | null>;
  getCandidateById: (id: string) => UnifiedCandidate | undefined;
  updateCandidateFitScore: (id: string, fitScore: number, justification?: string) => void; // Keep this local for now or extend to Firestore
  deleteCandidate: (id: string) => Promise<void>;
  loadingCandidates: boolean;
}

const CandidateContext = createContext<CandidateContextType | undefined>(undefined);

export const CandidateProvider = ({ children }: { children: ReactNode }) => {
  const [candidates, setCandidates] = useState<UnifiedCandidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const { toast } = useToast();

  // Fetch candidates from Firestore on mount
  useEffect(() => {
    const fetchCandidates = async () => {
      setLoadingCandidates(true);
      try {
        const candidatesCollectionRef = collection(db, "candidates");
        // Optionally, order by a field if you add a timestamp later, e.g., query(candidatesCollectionRef, orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(candidatesCollectionRef);
        const fetchedCandidates: UnifiedCandidate[] = [];
        querySnapshot.forEach((doc) => {
          // It's good practice to ensure the data matches the type
          const data = doc.data();
          // Ensure all required fields are present, especially if schema varies
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
          description: "Could not load candidate data from the database. Displaying initial mock data.",
          variant: "destructive",
        });
        // Fallback to mock data if Firestore fetch fails or is empty for the first time
        // This could be removed if you only want to rely on Firestore
        if (candidates.length === 0 && initialMockCandidates.length > 0) {
           // setCandidates(initialMockCandidates); // Or decide if you want to seed Firestore with mock data once
        }
      } finally {
        setLoadingCandidates(false);
      }
    };

    fetchCandidates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array means this runs once on mount

  const addCandidate = useCallback(async (parsedData: ParseResumeOutput, resumeOriginalDataUri: string): Promise<UnifiedCandidate | null> => {
    // Generate a new ID (could also use Firestore's auto-generated IDs if preferred)
    // For consistency with delete by specific ID, generating it client-side is fine
    // This ID generation logic needs to be robust if multiple users add candidates concurrently
    // A truly unique ID from Firestore (e.g. const newDocRef = doc(collection(db, "candidates")); newId = newDocRef.id;)
    // is safer in multi-user scenarios before setDoc.
    // For simplicity, we'll keep client-generated ID for now.
    const newId = doc(collection(db, "temp_ids")).id; // Firestore auto-ID for uniqueness

    const initials = (parsedData.name || "New Candidate")
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
    
    const resumeTextContent = generateResumeTextContent(parsedData);

    const newCandidate: UnifiedCandidate = {
      ...parsedData,
      id: newId, // Use the Firestore-generated unique ID
      avatarUrl: `https://placehold.co/80x80.png?text=${initials}`,
      role: parsedData.experience?.split('\n')[0]?.trim() || "Role not specified", 
      topSkill: parsedData.skills?.split(',')[0]?.trim() || "Skill not specified", 
      resumeOriginalDataUri,
      resumeTextContent, 
      // fitScore and justification would typically be added later
    };

    try {
      const candidateDocRef = doc(db, "candidates", newCandidate.id);
      await setDoc(candidateDocRef, newCandidate);
      setCandidates(prevCandidates => [newCandidate, ...prevCandidates]); // Add to start of list for visibility
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

  const updateCandidateFitScore = useCallback((id: string, fitScore: number, justification?: string) => {
    // This updates local state. To persist, also update Firestore here.
    // For now, keeping it simple and only updating local state.
    // Example for Firestore update:
    // const candidateDocRef = doc(db, "candidates", id);
    // await updateDoc(candidateDocRef, { fitScore, justification });
    setCandidates(prevCandidates =>
      prevCandidates.map(c =>
        c.id === id ? { ...c, fitScore, justification } : c 
      )
    );
    // Optionally, inform the user that the local view has been updated.
    // toast({ title: "Fit Score Updated (Locally)", description: `Score for candidate ${id} updated.` });
  }, []);

  const deleteCandidate = useCallback(async (id: string) => {
    const candidateToDelete = candidates.find(c => c.id === id);
    const candidateName = candidateToDelete?.name || "The candidate";
    try {
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
