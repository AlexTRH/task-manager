import { Request, Response } from 'express';
import { prisma } from '../services/db';

export async function listProjectTasks(req: Request & { user?: { id: string } }, res: Response) {
  const { projectId } = req.params;
  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: req.user!.id } });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const tasks = await prisma.task.findMany({ where: { projectId }, orderBy: { createdAt: 'desc' } });
  res.json(tasks);
}

export async function createTask(req: Request & { user?: { id: string } }, res: Response) {
  const { projectId } = req.params;
  const { title, description } = req.body;
  const project = await prisma.project.findFirst({ where: { id: projectId, ownerId: req.user!.id } });
  if (!project) return res.status(404).json({ error: 'Project not found' });
  const task = await prisma.task.create({ data: { title, description, projectId } });
  res.status(201).json(task);
}

export async function updateTask(req: Request & { user?: { id: string } }, res: Response) {
  const { id } = req.params;
  const { title, description, status } = req.body;
  const task = await prisma.task.findUnique({ where: { id }, include: { project: true } });
  if (!task || task.project.ownerId !== req.user!.id) return res.status(404).json({ error: 'Task not found' });
  const updated = await prisma.task.update({ where: { id }, data: { title, description, status } });
  res.json({ ...updated });
}

export async function deleteTask(req: Request & { user?: { id: string } }, res: Response) {
  const { id } = req.params;
  const task = await prisma.task.findUnique({ where: { id }, include: { project: true } });
  if (!task || task.project.ownerId !== req.user!.id) return res.status(404).json({ error: 'Task not found' });
  await prisma.task.delete({ where: { id } });
  res.json({ ok: true });
}
