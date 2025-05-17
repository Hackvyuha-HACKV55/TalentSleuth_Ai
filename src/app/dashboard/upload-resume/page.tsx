
import { ResumeUploader } from "@/components/domain/resume-uploader";

export default function UploadResumePage() {
  return (
    <div className="space-y-8 w-full max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Upload & Parse Resume</h1>
        <p className="text-muted-foreground">
          Use our AI-powered tool to quickly extract valuable information from candidate resumes.
        </p>
      </div>
      <ResumeUploader />
    </div>
  );
}
