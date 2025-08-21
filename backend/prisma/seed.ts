import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: passwordHash,
    },
  });

  const project = await prisma.project.create({
    data: {
      name: 'Demo Project',
      description: 'Your first project',
      ownerId: user.id,
      tasks: {
        create: [
          { title: 'Set up project', status: 'DONE' },
          { title: 'Build auth', status: 'IN_PROGRESS' },
          { title: 'Ship MVP', status: 'TODO' },
        ],
      },
    },
  });

  console.log({ user, project });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
