import express, { Request, Response } from 'express';
import prisma from '../prismaClient';
import { createLogger } from '../logger';
import { registerSchema, loginSchema } from '../validators/authSchema';
import { hashPassword, comparePassword, signAccessToken, signRefreshToken } from '../auth';

const router = express.Router();
const logger = createLogger('authRoutes');

router.post('/register', async (req: Request, res: Response) => {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
    const { email, password, displayName, tenantDomain } = parsed.data;

    // find or create tenant
    let tenant = await prisma.tenant.findFirst({ where: { domain: tenantDomain ?? undefined } });
    if (!tenant) {
      tenant = await prisma.tenant.create({ data: { name: tenantDomain ?? 'Default Tenant', domain: tenantDomain } });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        tenantId: tenant.id,
        email,
        passwordHash,
        displayName,
        role: 'CUSTOMER'
      }
    });

    const tokenPayload = { userId: user.id, tenantId: tenant.id, role: user.role };
    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    res.json({ user: { id: user.id, email: user.email, displayName: user.displayName }, accessToken, refreshToken });
  } catch (error) {
    logger.error('register error', { error });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.format() });
    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const payload = { userId: user.id, tenantId: user.tenantId, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await prisma.session.create({ data: { userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } });
    res.json({ accessToken, refreshToken });
  } catch (error) {
    logger.error('login error', { error });
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
