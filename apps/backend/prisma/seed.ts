import bcrypt from "bcryptjs";
import { PrismaClient, ProjectRole, TaskPriority, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Password123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "Admin User",
      email: "admin@example.com",
      password
    }
  });

  const member = await prisma.user.upsert({
    where: { email: "member@example.com" },
    update: {},
    create: {
      name: "Member User",
      email: "member@example.com",
      password
    }
  });

  const project = await prisma.project.create({
    data: {
      name: "Website Redesign",
      description: "Interview-ready demo project for team collaboration.",
      members: {
        create: [
          { userId: admin.id, role: ProjectRole.ADMIN },
          { userId: member.id, role: ProjectRole.MEMBER }
        ]
      },
      tasks: {
        create: [
          {
            title: "Finalize landing page wireframe",
            description: "Prepare a clean first-pass layout for review.",
            priority: TaskPriority.HIGH,
            status: TaskStatus.IN_PROGRESS,
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
            assignedToId: member.id,
            createdById: admin.id
          },
          {
            title: "Set up deployment pipeline",
            description: "Connect frontend, backend, and PostgreSQL services on Railway.",
            priority: TaskPriority.MEDIUM,
            status: TaskStatus.TODO,
            dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
            assignedToId: admin.id,
            createdById: admin.id
          }
        ]
      },
      activities: {
        create: {
          userId: admin.id,
          type: "PROJECT_CREATED",
          message: "Created project \"Website Redesign\""
        }
      }
    }
  });

  console.log(`Seeded project ${project.name}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
