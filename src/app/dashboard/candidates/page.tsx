
"use client";

import { CandidateCard, type Candidate } from "@/components/domain/candidate-card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";
import { useState } from "react";

const mockCandidates: Candidate[] = [
  { id: "1", name: "Alice Wonderland", email: "alice.w@example.com", topSkill: "AI Development", fitScore: 85, avatarUrl: "https://placehold.co/80x80.png?text=AW", role: "Senior AI Engineer" },
  { id: "2", name: "Bob The Builder", email: "bob.b@example.com", topSkill: "Project Management", fitScore: 78, avatarUrl: "https://placehold.co/80x80.png?text=BB", role: "Lead Project Manager" },
  { id: "3", name: "Charlie Brown", email: "charlie.b@example.com", topSkill: "UX Design", fitScore: 92, avatarUrl: "https://placehold.co/80x80.png?text=CB", role: "Principal UX Designer" },
  { id: "4", name: "Diana Prince", email: "diana.p@example.com", topSkill: "Cybersecurity", fitScore: 88, avatarUrl: "https://placehold.co/80x80.png?text=DP", role: "Security Analyst" },
  { id: "5", name: "Edward Scissorhands", email: "edward.s@example.com", topSkill: "Frontend Development", fitScore: 75, avatarUrl: "https://placehold.co/80x80.png?text=ES", role: "Frontend Developer" },
  { id: "6", name: "Fiona Gallagher", email: "fiona.g@example.com", topSkill: "Data Analysis", fitScore: 90, avatarUrl: "https://placehold.co/80x80.png?text=FG", role: "Data Scientist" },
];

export default function CandidatesListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSkill, setFilterSkill] = useState("all");

  const filteredCandidates = mockCandidates.filter(candidate => {
    const nameMatch = candidate.name.toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = candidate.email.toLowerCase().includes(searchTerm.toLowerCase());
    const skillMatch = filterSkill === "all" || candidate.topSkill.toLowerCase().includes(filterSkill.toLowerCase());
    return (nameMatch || emailMatch) && skillMatch;
  });
  
  const uniqueSkills = ["all", ...new Set(mockCandidates.map(c => c.topSkill))];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Candidates</h1>
        <p className="text-muted-foreground">Browse and manage your talent pool.</p>
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

      {filteredCandidates.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCandidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-xl text-muted-foreground">No candidates found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}
