import { Request, Response } from 'express';
import { prisma } from '../services/db';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';

export async function register(req: Request, res: Response) {
  const { email, name, password } = req.body;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return res.status(409).json({ error: 'Email already in use' });
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, name, password: hash } });
  return res.status(201).json({ id: user.id, email: user.email, name: user.name });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({ data: { token: refreshToken, userId: user.id, expiresAt } });

  return res.json({ accessToken, refreshToken, user: { id: user.id, email: user.email, name: user.name } });
}

export async function me(req: Request & { user?: { id: string } }, res: Response) {
  const user = await prisma.user.findUnique({ where: { id: req.user!.id }, select: { id: true, email: true, name: true } });
  return res.json(user);
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'Missing refreshToken' });
  try {
    const payload = verifyRefreshToken(refreshToken);
    const tokenRow = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!tokenRow || tokenRow.revoked) return res.status(401).json({ error: 'Refresh token invalid' });
    const accessToken = signAccessToken(payload.sub);
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: 'Refresh token invalid/expired' });
  }
}

export async function logout(req: Request, res: Response) {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await prisma.refreshToken.updateMany({ where: { token: refreshToken }, data: { revoked: true } });
  }
  return res.json({ ok: true });
}
