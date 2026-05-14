"use client";

import { AlertTriangle, CheckCircle2, Clock3, ListTodo } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getDashboard } from "@/lib/queries";
import { formatDate } from "@/lib/utils";

export function DashboardView() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard
  });

  if (isLoading || !data) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-normal">Dashboard</h2>
        <p className="mt-1 text-sm text-muted-foreground">A quick view of workload, progress, and deadlines.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total tasks" value={data.totalTasks} icon={ListTodo} />
        <MetricCard label="In progress" value={data.tasksByStatus.IN_PROGRESS} icon={Clock3} />
        <MetricCard label="Done" value={data.tasksByStatus.DONE} icon={CheckCircle2} />
        <MetricCard label="Overdue" value={data.overdueTasks.length} icon={AlertTriangle} />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks per user</CardTitle>
            <CardDescription>Assigned workload across your accessible projects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.tasksPerUser.length ? (
              data.tasksPerUser.map((item) => (
                <div key={item.user?.id ?? "unknown"} className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <p className="font-medium">{item.user?.name ?? "Unassigned"}</p>
                    <p className="text-sm text-muted-foreground">{item.user?.email}</p>
                  </div>
                  <Badge variant="info">{item.total} tasks</Badge>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No assigned work yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overdue tasks</CardTitle>
            <CardDescription>Tasks past due and not marked done.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.overdueTasks.length ? (
              data.overdueTasks.map((task) => (
                <div key={task.id} className="rounded-md border border-destructive/30 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{task.title}</p>
                    <Badge variant="danger">{formatDate(task.dueDate)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{task.assignedTo?.name ?? "Unassigned"}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No overdue tasks. Nice and tidy.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Latest project and task changes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.recentActivity.length ? (
            data.recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium">{activity.message}</p>
                  <p className="text-sm text-muted-foreground">by {activity.user.name}</p>
                </div>
                <span className="text-xs text-muted-foreground">{formatDate(activity.createdAt)}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">Activity will appear here as your team works.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
