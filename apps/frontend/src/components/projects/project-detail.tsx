"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Clock3, ListTodo } from "lucide-react";
import { MetricCard } from "@/components/dashboard/metric-card";
import { MemberManager } from "@/components/projects/member-manager";
import { CreateTaskForm } from "@/components/tasks/create-task-form";
import { TaskBoard } from "@/components/tasks/task-board";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getProject, getProjectDashboard } from "@/lib/queries";

export function ProjectDetail({ projectId }: { projectId: string }) {
  const projectQuery = useQuery({
    queryKey: ["project", projectId],
    queryFn: () => getProject(projectId)
  });

  const dashboardQuery = useQuery({
    queryKey: ["project-dashboard", projectId],
    queryFn: () => getProjectDashboard(projectId)
  });

  if (projectQuery.isLoading || !projectQuery.data) {
    return <Skeleton className="h-96 w-full" />;
  }

  const project = projectQuery.data;
  const dashboard = dashboardQuery.data;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">{project.name}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{project.description ?? "No description yet."}</p>
      </div>

      {dashboard ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total tasks" value={dashboard.totalTasks} icon={ListTodo} />
          <MetricCard label="In progress" value={dashboard.tasksByStatus.IN_PROGRESS} icon={Clock3} />
          <MetricCard label="Done" value={dashboard.tasksByStatus.DONE} icon={CheckCircle2} />
          <MetricCard label="Overdue" value={dashboard.overdueTasks.length} icon={AlertTriangle} />
        </div>
      ) : (
        <Card>
          <CardContent className="p-5">
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          <MemberManager project={project} />
          <CreateTaskForm project={project} />
        </div>
        <TaskBoard projectId={project.id} />
      </div>
    </div>
  );
}
