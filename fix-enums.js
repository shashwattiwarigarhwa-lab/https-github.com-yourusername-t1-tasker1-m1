const fs = require('fs');
const path = require('path');

const files = [
  'apps/backend/src/modules/tasks/task.service.ts',
  'apps/backend/src/modules/tasks/task.controller.ts',
  'apps/backend/src/modules/projects/project.service.ts',
  'apps/backend/src/modules/dashboard/dashboard.service.ts',
  'apps/backend/src/middleware/role.middleware.ts',
  'apps/backend/prisma/seed.ts'
];

const enumNames = ['ProjectRole', 'TaskPriority', 'TaskStatus', 'ActivityType'];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Find all imports from @prisma/client
  // Usually looks like: import { ActivityType, ProjectRole, TaskPriority, TaskStatus } from "@prisma/client";
  // We'll just replace instances of the enums being imported from @prisma/client
  
  // A simpler approach: Just add the enum imports at the top of the file, and remove them from the @prisma/client import
  let newContent = content;
  let importedEnums = [];
  
  for (const en of enumNames) {
    if (newContent.includes(en)) {
      importedEnums.push(en);
      // Remove from prisma import. This regex handles 'Enum, ', ', Enum', or just 'Enum' inside the curly braces.
      const regex1 = new RegExp(`\\b${en}\\s*,?`, 'g');
      // But we only want to remove it from the import statement.
      // Let's just find the import statement.
      newContent = newContent.replace(/import\s+{([^}]+)}\s+from\s+["']@prisma\/client["'];/, (match, p1) => {
        let parts = p1.split(',').map(s => s.trim()).filter(s => s && s !== en && !s.startsWith('type ' + en));
        if (parts.length === 0) return '';
        return `import { ${parts.join(', ')} } from "@prisma/client";`;
      });
      // Also handle `import type { ... }`
      newContent = newContent.replace(/import\s+type\s+{([^}]+)}\s+from\s+["']@prisma\/client["'];/, (match, p1) => {
        let parts = p1.split(',').map(s => s.trim()).filter(s => s && s !== en);
        if (parts.length === 0) return '';
        return `import type { ${parts.join(', ')} } from "@prisma/client";`;
      });
    }
  }

  if (importedEnums.length > 0) {
    // determine relative path to apps/backend/src/types/enums
    const dir = path.dirname(file);
    let relPath = path.relative(dir, 'apps/backend/src/types/enums');
    if (!relPath.startsWith('.')) relPath = './' + relPath;
    relPath = relPath.replace(/\\/g, '/');
    
    newContent = `import { ${importedEnums.join(', ')} } from "${relPath}";\n` + newContent;
  }
  
  fs.writeFileSync(file, newContent);
}
console.log("Done");
