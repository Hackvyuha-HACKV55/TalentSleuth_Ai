
import { ResumeUploader } from "@/components/domain/resume-uploader";
import { Card } from "@/components/ui/card";

export default function UploadResumePage() {
  return (
    <div className="space-y-8 w-full py-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Upload & Parse Resume</h1>
        <p className="text-muted-foreground">
          Use our AI-powered tool to quickly extract valuable information from candidate resumes.
        </p>
      </div>
      <Card className="rounded-lg shadow-lg bg-card border p-0">
         <ResumeUploader />
      </Card>
    </div>
  );
}
