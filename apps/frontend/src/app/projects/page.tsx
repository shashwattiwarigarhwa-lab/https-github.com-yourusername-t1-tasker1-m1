import { AppShell } from "@/components/layout/app-shell";
import { CreateProjectForm } from "@/components/projects/create-project-form";
import { ProjectList } from "@/components/projects/project-list";

export default function ProjectsPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal">Projects</h2>
          <p className="mt-1 text-sm text-muted-foreground">Create projects and open team workspaces.</p>
        </div>
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <CreateProjectForm />
          <ProjectList />
        </div>
      </div>
    </AppShell>
  );
}
