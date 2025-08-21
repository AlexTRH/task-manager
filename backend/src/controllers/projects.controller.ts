import { Request, Response } from 'express';
import { prisma } from '../services/db';

export async function listProjects(req: Request & { user?: { id: string } }, res: Response) {
  const projects = await prisma.project.findMany({
    where: { ownerId: req.user!.id },
    orderBy: { createdAt: 'desc' }
  });
  res.json(projects);
}

export async function getProject(req: Request & { user?: { id: string } }, res: Response) {
  const { id } = req.params;
  const project = await prisma.project.findFirst({ where: { id, ownerId: req.user!.id } });
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
}

export async function createProject(req: Request & { user?: { id: string } }, res: Response) {
  const { name, description } = req.body;
  const project = await prisma.project.create({ data: { name, description, ownerId: req.user!.id } });
  res.status(201).json(project);
}

export async function updateProject(req: Request & { user?: { id: string } }, res: Response) {
  const { id } = req.params;
  const { name, description } = req.body;
  const project = await prisma.project.update({
    where: { id },
    data: { name, description }
  }).catch(() => null);
  if (!project) return res.status(404).json({ error: 'Not found' });
  res.json(project);
}

export async function deleteProject(req: Request & { user?: { id: string } }, res: Response) {
  const { id } = req.params;
  await prisma.task.deleteMany({ where: { projectId: id } });
  await prisma.project.delete({ where: { id } }).catch(() => null);
  res.json({ ok: true });
}
