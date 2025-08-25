import { Request, Response, NextFunction } from 'express';
export function requireCsrf(req: Request, res: Response, next: NextFunction) {
  const method = req.method.toUpperCase();
  if (['GET','HEAD','OPTIONS'].includes(method)) return next();
  const token = req.headers['x-csrf-token'];
  if (!token || typeof token !== 'string' || token.length < 8) {
    return res.status(403).json({ error: 'CSRF token missing or invalid' });
  }
  next();
}
