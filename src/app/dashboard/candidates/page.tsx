
"use client";

import { CandidateCard } from "@/components/domain/candidate-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Loader2 } from "lucide-react";
import { useState } from "react";
import { useCandidateContext } from "@/context/candidate-context"; 
import type { UnifiedCandidate } from "@/context/candidate-context"; 

export default function CandidatesListPage() {
  const { candidates, loadingCandidates } = useCandidateContext(); 
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSkill, setFilterSkill] = useState("all");

  const filteredCandidates = candidates.filter(candidate => {
    const nameMatch = candidate.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const emailMatch = candidate.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const skillMatch = filterSkill === "all" || (candidate.topSkill && candidate.topSkill.toLowerCase().includes(filterSkill.toLowerCase()));
    return (nameMatch || emailMatch) && skillMatch;
  });
  
  const uniqueSkills = ["all", ...new Set(candidates.map(c => c.topSkill).filter(Boolean) as string[])];


  return (
    <div className="space-y-8 w-full"> {/* Removed max-w and mx-auto */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Candidates</h1>
        <p className="text-muted-foreground">Browse and manage your talent pool from the central database.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative w-full md:flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10 rounded-lg"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <Select value={filterSkill} onValueChange={setFilterSkill}>
            <SelectTrigger className="w-full md:w-[200px] rounded-lg">
              <SelectValue placeholder="Filter by skill" />
            </SelectTrigger>
            <SelectContent>
              {uniqueSkills.map(skill => (
                <SelectItem key={skill} value={skill}>{skill === "all" ? "All Skills" : skill}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loadingCandidates ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
          <p className="text-lg text-muted-foreground">Loading candidates from database...</p>
        </div>
      ) : filteredCandidates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCandidates.map((candidate) => (
             candidate.id && candidate.name && candidate.email ? 
            <CandidateCard key={candidate.id} candidate={candidate} />
            : null
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">
            {candidates.length === 0 ? "No candidates found in the database." : "No candidates found matching your criteria."}
          </p>
          <p className="text-sm text-muted-foreground">
            {candidates.length === 0 ? "Try uploading a resume to add new candidates." : "Adjust your search or filter."}
          </p>
        </div>
      )}
    </div>
  );
}
