import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Brain, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface Insights {
  taskGroups: { name: string; tasks: string[] }[];
  recommendations: string[];
  completionRate: string;
}

export default function AiInsights() {
  const { toast } = useToast();
  const { data: insights, isLoading, error } = useQuery<Insights>({
    queryKey: ["/api/insights"],
    refetchInterval: false,
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/insights/refresh", { method: "POST" });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to generate insights');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/insights"] });
      toast({
        title: "AI Insights Updated",
        description: "Your tasks have been analyzed with fresh AI insights.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Generate Insights",
        description: error.message || "Please check if you have tasks added and try again.",
        variant: "destructive",
      });
    },
  });

  function renderContent() {
    if (error || refreshMutation.error) {
      return (
        <div className="text-destructive text-center py-4">
          <p className="font-medium">Failed to load insights</p>
          <p className="text-sm mt-1">Please check your connection and try again</p>
        </div>
      );
    }

    if (isLoading || refreshMutation.isPending) {
      return (
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-[100px] w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-[60px] w-full" />
          </div>
        </div>
      );
    }

    if (!insights) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No insights available yet</p>
          <p className="text-sm mt-1">Click Generate Insights to analyze your tasks</p>
        </div>
      );
    }

    return (
      <>
        <div>
          <h3 className="font-medium mb-2">Task Groups & Categories</h3>
          <ScrollArea className="h-[200px]">
            {insights.taskGroups.map((group, index) => (
              <div key={index} className="mb-4">
                <Badge className="mb-2">{group.name}</Badge>
                <ul className="text-sm space-y-1">
                  {group.tasks.map((task, taskIndex) => (
                    <li key={taskIndex} className="text-muted-foreground">
                      • {task}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </ScrollArea>
        </div>

        <div>
          <h3 className="font-medium mb-2">AI Recommendations</h3>
          <ul className="text-sm space-y-2">
            {insights.recommendations.map((rec, index) => (
              <li key={index} className="text-muted-foreground">
                • {rec}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-medium mb-2">Task Completion Rate</h3>
          <p className="text-2xl font-bold">{insights.completionRate}</p>
        </div>
      </>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Insights
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
          Generate Insights
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {renderContent()}
      </CardContent>
    </Card>
  );
}