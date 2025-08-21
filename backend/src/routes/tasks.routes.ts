import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';
import { listProjectTasks, createTask, updateTask, deleteTask } from '../controllers/tasks.controller';

const router = Router();

const createTaskSchema = z.object({
  body: z.object({ title: z.string().min(1), description: z.string().optional() }),
  params: z.object({ projectId: z.string() })
});
const updateTaskSchema = z.object({
  body: z.object({ title: z.string().optional(), description: z.string().optional(), status: z.enum(['TODO','IN_PROGRESS','DONE']).optional() }),
  params: z.object({ id: z.string() })
});

router.use(requireAuth);
router.get('/project/:projectId', listProjectTasks);
router.post('/project/:projectId', validate(createTaskSchema), createTask);
router.patch('/:id', validate(updateTaskSchema), updateTask);
router.delete('/:id', deleteTask);

export default router;
