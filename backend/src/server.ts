import 'dotenv/config';
import app from './app';
import { prisma } from './services/db';

const PORT = process.env.PORT || 4000;

async function start() {
  try {
    await prisma.$connect();
    app.listen(PORT, () => {
      console.log(`API listening on http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error('Failed to start server', e);
    process.exit(1);
  }
}

start();
