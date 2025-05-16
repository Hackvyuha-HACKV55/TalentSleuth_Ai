
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ThumbsUp, Info, MessageSquare } from "lucide-react";

interface ScoreCardProps {
  score: number; // 0-100
  title: string;
  description?: string;
  justification?: string;
  recommendation?: string;
}

export function ScoreCard({ score, title, description, justification, recommendation }: ScoreCardProps) {
  const getScoreColor = (value: number) => {
    if (value >= 80) return "bg-green-500";
    if (value >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <Card className="rounded-2xl shadow-lg w-full">
      <CardHeader>
        <CardTitle className="text-xl text-primary flex items-center">
          <Info className="mr-2 h-5 w-5" /> {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="relative inline-block">
            <Progress value={score} className="h-6 w-64 rounded-full" indicatorClassName={getScoreColor(score)} />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-background mix-blend-difference">
                {score}%
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Fitment Score</p>
        </div>

        {justification && (
          <div>
            <h4 className="text-md font-semibold text-foreground mb-1 flex items-center">
              <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" /> Justification:
            </h4>
            <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-lg">{justification}</p>
          </div>
        )}

        {recommendation && (
           <div>
            <h4 className="text-md font-semibold text-foreground mb-1 flex items-center">
              <ThumbsUp className="mr-2 h-4 w-4 text-muted-foreground" /> Recommendation:
            </h4>
            <p className="text-sm text-muted-foreground bg-secondary p-3 rounded-lg">{recommendation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
