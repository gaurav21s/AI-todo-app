import { useQuery, useMutation } from "@tanstack/react-query";
import { Task } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";

export default function TaskList() {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (taskId: number) => {
      await apiRequest("DELETE", `/api/tasks/${taskId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: number; completed: boolean }) => {
      await apiRequest("PATCH", `/api/tasks/${taskId}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  if (isLoading) {
    return <div>Loading tasks...</div>;
  }

  const priorityColors = {
    high: "bg-red-100 text-red-800",
    medium: "bg-yellow-100 text-yellow-800",
    low: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-4">
      {tasks?.map((task) => (
        <Card key={task.id} className={task.completed ? "opacity-60" : ""}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) =>
                  toggleMutation.mutate({ taskId: task.id, completed: !!checked })
                }
              />
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <h3 className={`font-medium ${task.completed ? "line-through" : ""}`}>
                    {task.title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMutation.mutate(task.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className={priorityColors[task.priority as keyof typeof priorityColors]}>
                    {task.priority}
                  </Badge>
                  
                  {task.dueDate && (
                    <Badge variant="outline">
                      Due: {format(new Date(task.dueDate), "PPP")}
                    </Badge>
                  )}
                  
                  {task.aiTags?.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
