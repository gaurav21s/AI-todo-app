import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TaskReport {
  executiveSummary: {
    summary: string;
    metrics: string[];
  };
  taskAnalysis: string;
  productivityMetrics: string;
  workStyleAnalysis: string;
  recommendations: string[];
}

export default function ReportGenerator() {
  const { toast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const { data: report, refetch, isLoading } = useQuery<TaskReport>({
    queryKey: ["/api/report"],
    enabled: false,
  });

  const generateAndDownload = async () => {
    try {
      setIsDownloading(true);
      const result = await refetch();
      
      if (!result.data) {
        throw new Error("No report data received from server");
      }
      
      const report = result.data;

      // Create downloadable content
      const content = `# Task Management Report
${report.executiveSummary.summary}

## Key Metrics
${report.executiveSummary.metrics.map(metric => `- ${metric}`).join('\n')}

## Task Analysis
${report.taskAnalysis}

## Productivity Metrics
${report.productivityMetrics}

## Work Style Analysis
${report.workStyleAnalysis}

## Strategic Recommendations
${report.recommendations.map(rec => `- ${rec}`).join('\n')}
`;

      // Create and trigger download
      const blob = new Blob([content], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `task-report-${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Report Generated",
        description: "Your report has been generated and downloaded successfully.",
      });
    } catch (error) {
      console.error('Report generation error:', error);
      toast({
        title: "Report Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate report. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Task Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Generate a comprehensive report of your tasks, including AI-powered insights,
          productivity metrics, and personalized recommendations.
        </p>
        <Button 
          onClick={generateAndDownload}
          disabled={isLoading || isDownloading}
          className="w-full"
        >
          {isLoading || isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Report...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generate & Download Report
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}