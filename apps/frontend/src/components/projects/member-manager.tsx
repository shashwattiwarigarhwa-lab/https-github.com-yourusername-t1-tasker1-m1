"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { addMember, removeMember } from "@/lib/queries";
import type { Project, ProjectRole } from "@/types";

export function MemberManager({ project }: { project: Project }) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<ProjectRole>("MEMBER");

  const addMutation = useMutation({
    mutationFn: () => addMember(project.id, { email, role }),
    onSuccess: () => {
      setEmail("");
      queryClient.invalidateQueries({ queryKey: ["project", project.id] });
      toast.success("Member added");
    },
    onError: (error) => toast.error(error.message)
  });

  const removeMutation = useMutation({
    mutationFn: (userId: string) => removeMember(project.id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project", project.id] });
      toast.success("Member removed");
    },
    onError: (error) => toast.error(error.message)
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Members</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            addMutation.mutate();
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="member-email">Email</Label>
            <Input
              id="member-email"
              type="email"
              placeholder="teammate@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={role} onChange={(event) => setRole(event.target.value as ProjectRole)}>
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
            </Select>
            <Button type="submit" disabled={addMutation.isPending || !email}>
              <UserPlus className="h-4 w-4" />
              Add
            </Button>
          </div>
        </form>

        <div className="space-y-2">
          {project.members.map((member) => (
            <div key={member.id} className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">{member.user.name}</p>
                <p className="text-xs text-muted-foreground">{member.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={member.role === "ADMIN" ? "warning" : "default"}>{member.role}</Badge>
                <Button
                  aria-label={`Remove ${member.user.name}`}
                  size="icon"
                  variant="ghost"
                  onClick={() => removeMutation.mutate(member.user.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
