import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import projectsRoutes from './routes/projects.routes';
import tasksRoutes from './routes/tasks.routes';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

const corsOrigins = process.env.CORS_ORIGINS?.split(',').map(s => s.trim()) || ['http://localhost:3000'];
app.use(cors({ origin: corsOrigins, credentials: true }));

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/tasks', tasksRoutes);

app.get('/', (_req, res) => {
  res.json({ name: 'Task Manager API', health: '/health', docs: '/api' });
});

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
});

export default app;
