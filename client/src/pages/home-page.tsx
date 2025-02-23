import { useAuth } from "@/hooks/use-auth";
import TaskList from "@/components/task-list";
import TaskForm from "@/components/task-form";
import AiInsights from "@/components/ai-insights";
import ReportGenerator from "@/components/report-generator";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Welcome, {user?.username}</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TaskForm />
            <TaskList />
          </div>
          <div className="space-y-8">
            <AiInsights />
            <ReportGenerator />
          </div>
        </div>
      </main>
    </div>
  );
}