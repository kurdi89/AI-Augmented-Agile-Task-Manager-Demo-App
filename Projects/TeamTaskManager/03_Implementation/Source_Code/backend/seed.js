const { PrismaClient } = require('./generated/prisma');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Create demo user
    const demoUser = await prisma.User.upsert({
      where: { email: 'demo@example.com' },
      update: {},
      create: {
        id: uuidv4(),
        email: 'demo@example.com',
        password_hash: 'password123',
        first_name: 'Demo',
        last_name: 'User',
      },
    });

    console.log('✅ Demo user created:', demoUser.email);

    // Create sample projects
    const project1 = await prisma.Project.upsert({
      where: { id: 'project-1' },
      update: {},
      create: {
        id: 'project-1',
        name: 'Frontend Development',
        description: 'React application development with TypeScript',
        status: 'ACTIVE',
        tags: JSON.stringify(['react', 'typescript', 'frontend']),
        owner_id: demoUser.id,
      },
    });

    const project2 = await prisma.Project.upsert({
      where: { id: 'project-2' },
      update: {},
      create: {
        id: 'project-2',
        name: 'Backend API',
        description: 'Node.js API development with Express',
        status: 'ACTIVE',
        tags: JSON.stringify(['nodejs', 'express', 'api']),
        owner_id: demoUser.id,
      },
    });

    console.log('✅ Sample projects created');

    // Create sample tasks
    const tasks = await Promise.all([
      prisma.Task.upsert({
        where: { id: 'task-1' },
        update: {},
        create: {
          id: 'task-1',
          title: 'Implement user authentication',
          description: 'Add JWT-based authentication system',
          status: 'IN_PROGRESS',
          priority: 'HIGH',
          project_id: project1.id,
          created_by: demoUser.id,
        },
      }),
      prisma.Task.upsert({
        where: { id: 'task-2' },
        update: {},
        create: {
          id: 'task-2',
          title: 'Create dashboard component',
          description: 'Build responsive dashboard with statistics',
          status: 'TODO',
          priority: 'MEDIUM',
          project_id: project1.id,
          created_by: demoUser.id,
        },
      }),
      prisma.Task.upsert({
        where: { id: 'task-3' },
        update: {},
        create: {
          id: 'task-3',
          title: 'Set up database schema',
          description: 'Create Prisma schema with all models',
          status: 'COMPLETED',
          priority: 'HIGH',
          project_id: project2.id,
          created_by: demoUser.id,
        },
      }),
      prisma.Task.upsert({
        where: { id: 'task-4' },
        update: {},
        create: {
          id: 'task-4',
          title: 'Implement file upload',
          description: 'Add file upload functionality with multer',
          status: 'TODO',
          priority: 'LOW',
          project_id: project2.id,
          created_by: demoUser.id,
        },
      }),
    ]);

    console.log('✅ Sample tasks created');

    // Create project members
    await prisma.ProjectMember.upsert({
      where: {
        project_id_user_id: {
          project_id: project1.id,
          user_id: demoUser.id,
        }
      },
      update: {},
      create: {
        project_id: project1.id,
        user_id: demoUser.id,
        role: 'OWNER',
      },
    });

    await prisma.ProjectMember.upsert({
      where: {
        project_id_user_id: {
          project_id: project2.id,
          user_id: demoUser.id,
        }
      },
      update: {},
      create: {
        project_id: project2.id,
        user_id: demoUser.id,
        role: 'OWNER',
      },
    });

    console.log('✅ Project members created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📋 Demo Credentials:');
    console.log('Email: demo@example.com');
    console.log('Password: password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed(); 