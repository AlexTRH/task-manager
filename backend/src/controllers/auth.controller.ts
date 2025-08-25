import { Request, Response } from 'express';
import { prisma } from '../services/db';
import bcrypt from 'bcryptjs';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.utils';
import { cfg } from '../config';
import crypto from 'crypto';
import { sha256 } from '../utils/hash';

const cookieOpts = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: cfg.cookieSecure,
  domain: cfg.COOKIE_DOMAIN || undefined,
  path: '/api/auth',
};

function setRefreshCookie(res: Response, token: string) {
  res.cookie('refresh_token', token, cookieOpts);
}
function clearRefreshCookie(res: Response) {
  res.clearCookie('refresh_token', { ...cookieOpts, maxAge: 0 });
}

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

  const jti = crypto.randomUUID();
  const accessToken = signAccessToken(user.id);
  const refreshToken = signRefreshToken(user.id, jti);

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { tokenHash: sha256(refreshToken), userId: user.id, expiresAt },
  });

  setRefreshCookie(res, refreshToken);
  return res.json({ accessToken, user: { id: user.id, email: user.email, name: user.name } });
}

export async function me(req: Request & { user?: { id: string } }, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { id: true, email: true, name: true },
  });
  return res.json(user);
}

export async function csrf(_req: Request, res: Response) {
  const token = crypto.randomBytes(24).toString('hex');
  res.json({ csrfToken: token });
}

export async function refresh(req: Request, res: Response) {
  const rt = req.cookies?.refresh_token as string | undefined;
  if (!rt) return res.status(401).json({ error: 'Missing refresh token' });

  try {
    const payload = verifyRefreshToken(rt);
    const row = await prisma.refreshToken.findUnique({ where: { tokenHash: sha256(rt) } });
    if (!row || row.revoked) return res.status(401).json({ error: 'Refresh token invalid' });

    await prisma.refreshToken.update({ where: { tokenHash: sha256(rt) }, data: { revoked: true } });

    const jti = crypto.randomUUID();
    const nextRefresh = signRefreshToken(payload.sub, jti);
    const accessToken = signAccessToken(payload.sub);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { tokenHash: sha256(nextRefresh), userId: payload.sub, expiresAt },
    });

    setRefreshCookie(res, nextRefresh);
    return res.json({ accessToken });
  } catch {
    return res.status(401).json({ error: 'Refresh token invalid/expired' });
  }
}

export async function logout(req: Request, res: Response) {
  const rt = req.cookies?.refresh_token as string | undefined;
  if (rt) await prisma.refreshToken.updateMany({ where: { tokenHash: sha256(rt) }, data: { revoked: true } });
  clearRefreshCookie(res);
  return res.json({ ok: true });
}
