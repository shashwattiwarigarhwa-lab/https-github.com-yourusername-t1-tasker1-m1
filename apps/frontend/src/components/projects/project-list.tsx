"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getProjects } from "@/lib/queries";

export function ProjectList() {
  const { data, isLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: getProjects
  });

  if (isLoading || !data) {
    return <Skeleton className="h-72 w-full" />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.length ? (
        data.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="h-full transition-colors hover:border-primary/60">
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{project.name}</CardTitle>
                    <CardDescription className="mt-2 line-clamp-2">
                      {project.description ?? "No description yet."}
                    </CardDescription>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent className="flex flex-wrap items-center gap-2">
                <Badge variant="info">{project._count?.tasks ?? 0} tasks</Badge>
                <Badge>
                  <Users className="mr-1 h-3 w-3" />
                  {project._count?.members ?? project.members.length} members
                </Badge>
              </CardContent>
            </Card>
          </Link>
        ))
      ) : (
        <Card className="md:col-span-2">
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No projects yet. Create your first project to begin.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
