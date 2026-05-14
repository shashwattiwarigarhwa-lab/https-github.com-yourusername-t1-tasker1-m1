"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Circle, Clock3, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { deleteTask, getTasks, updateTask, updateTaskStatus } from "@/lib/queries";
import { formatDate, isOverdue } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "@/types";

const columns: Array<{ status: TaskStatus; label: string; icon: typeof Circle }> = [
  { status: "TODO", label: "To do", icon: Circle },
  { status: "IN_PROGRESS", label: "In progress", icon: Clock3 },
  { status: "DONE", label: "Done", icon: CheckCircle2 }
];

export function TaskBoard({ projectId }: { projectId: string }) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "ALL">("ALL");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "ALL">("ALL");
  const { data, isLoading } = useQuery({
    queryKey: ["tasks", projectId, statusFilter, priorityFilter],
    queryFn: () =>
      getTasks(projectId, {
        status: statusFilter === "ALL" ? undefined : statusFilter,
        priority: priorityFilter === "ALL" ? undefined : priorityFilter
      })
  });

  const statusMutation = useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: TaskStatus }) => updateTaskStatus(taskId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-dashboard", projectId] });
    },
    onError: (error) => toast.error(error.message)
  });

  const updateMutation = useMutation({
    mutationFn: ({ taskId, input }: { taskId: string; input: Parameters<typeof updateTask>[1] }) =>
      updateTask(taskId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-dashboard", projectId] });
      toast.success("Task updated");
    },
    onError: (error) => toast.error(error.message)
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["project-dashboard", projectId] });
      toast.success("Task deleted");
    },
    onError: (error) => toast.error(error.message)
  });

  if (isLoading || !data) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-card p-3">
        <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as TaskStatus | "ALL")}>
          <option value="ALL">All statuses</option>
          <option value="TODO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="DONE">Done</option>
        </Select>
        <Select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value as TaskPriority | "ALL")}
        >
          <option value="ALL">All priorities</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </Select>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        {columns.map((column) => {
          const Icon = column.icon;
          const tasks = data.filter((task) => task.status === column.status);
          return (
            <Card key={column.status}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {column.label}
                  </span>
                  <Badge>{tasks.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tasks.length ? (
                  tasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onStatusChange={(status) => statusMutation.mutate({ taskId: task.id, status })}
                      onUpdate={(input) => updateMutation.mutate({ taskId: task.id, input })}
                      onDelete={() => deleteMutation.mutate(task.id)}
                    />
                  ))
                ) : (
                  <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">No tasks here.</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onStatusChange,
  onUpdate,
  onDelete
}: {
  task: Task;
  onStatusChange: (status: TaskStatus) => void;
  onUpdate: (input: Parameters<typeof updateTask>[1]) => void;
  onDelete: () => void;
}) {
  const overdue = isOverdue(task.dueDate, task.status);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task.priority);

  if (editing) {
    return (
      <form
        className="space-y-3 rounded-md border bg-background p-4"
        onSubmit={(event) => {
          event.preventDefault();
          onUpdate({ title, description, priority });
          setEditing(false);
        }}
      >
        <div className="flex items-center justify-between">
          <p className="font-medium">Edit task</p>
          <Button type="button" size="icon" variant="ghost" onClick={() => setEditing(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Textarea value={description} onChange={(event) => setDescription(event.target.value)} />
        </div>
        <Select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </Select>
        <Button type="submit" size="sm" disabled={title.length < 2}>
          Save
        </Button>
      </form>
    );
  }

  return (
    <div className="space-y-3 rounded-md border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{task.title}</p>
          {task.description ? <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{task.description}</p> : null}
        </div>
        {overdue ? (
          <Badge variant="danger">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Overdue
          </Badge>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant={task.priority === "HIGH" ? "danger" : task.priority === "MEDIUM" ? "warning" : "success"}>
          {task.priority}
        </Badge>
        <Badge>{formatDate(task.dueDate)}</Badge>
      </div>
      <div className="flex items-center justify-between gap-3">
        <p className="truncate text-sm text-muted-foreground">{task.assignedTo?.name ?? "Unassigned"}</p>
        <Select value={task.status} onChange={(event) => onStatusChange(event.target.value as TaskStatus)}>
          <option value="TODO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="DONE">Done</option>
        </Select>
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
          <Pencil className="h-4 w-4" />
          Edit
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
      </div>
    </div>
  );
}
