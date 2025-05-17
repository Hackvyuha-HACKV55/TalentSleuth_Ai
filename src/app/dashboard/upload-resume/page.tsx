
import { ResumeUploader } from "@/components/domain/resume-uploader";
import { Card } from "@/components/ui/card"; // Import Card

export default function UploadResumePage() {
  return (
    <div className="space-y-8 w-full max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Upload & Parse Resume</h1>
        <p className="text-muted-foreground">
          Use our AI-powered tool to quickly extract valuable information from candidate resumes.
        </p>
      </div>
      {/* Wrap ResumeUploader in a Card for styling consistency if it isn't already a Card */}
      <Card className="rounded-lg shadow-lg bg-card border p-0"> {/* Apply styles here */}
         <ResumeUploader />
      </Card>
    </div>
  );
}
