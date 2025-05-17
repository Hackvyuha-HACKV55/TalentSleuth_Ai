
import { JobDescriptionUploader } from "@/components/domain/job-description-uploader";
import { Card } from "@/components/ui/card"; // Import Card for consistent styling

export default function UploadJobDescriptionPage() {
  return (
    <div className="space-y-8 w-full max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Upload Job Description & Match Role</h1>
        <p className="text-muted-foreground">
          Provide a job description and select a candidate to assess their fit using AI.
        </p>
      </div>
      {/* Wrap JobDescriptionUploader in a Card for styling consistency if it isn't already a Card */}
      <Card className="rounded-lg shadow-lg bg-card border p-0"> {/* Apply styles here if JobDescriptionUploader is not a Card */}
        <JobDescriptionUploader />
      </Card>
    </div>
  );
}
