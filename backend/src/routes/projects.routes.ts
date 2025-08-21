import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { z } from 'zod';
import { listProjects, getProject, createProject, updateProject, deleteProject } from '../controllers/projects.controller';

const router = Router();

const projectCreate = z.object({ body: z.object({ name: z.string().min(1), description: z.string().optional() }) });
const projectUpdate = z.object({ body: z.object({ name: z.string().min(1).optional(), description: z.string().optional() }) });

router.use(requireAuth);
router.get('/', listProjects);
router.get('/:id', getProject);
router.post('/', validate(projectCreate), createProject);
router.patch('/:id', validate(projectUpdate), updateProject);
router.delete('/:id', deleteProject);

export default router;
