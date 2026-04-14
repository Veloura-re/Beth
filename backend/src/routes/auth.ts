import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../index';
import { Role } from '@prisma/client';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email, organizationId: user.organizationId },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register via Invite Token
router.post('/register', async (req, res) => {
  const { name, email, password, token } = req.body;
  try {
    const invite = await prisma.invitation.findUnique({ where: { token } });

    if (!invite || invite.email !== email || invite.status !== 'PENDING' || invite.expiresAt < new Date()) {
      return res.status(400).json({ message: 'Invalid or expired invitation' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: invite.role,
        organizationId: invite.organizationId,
      },
    });

    await prisma.invitation.update({
      where: { id: invite.id },
      data: { status: 'ACCEPTED' },
    });

    const jwtToken = jwt.sign(
      { id: user.id, role: user.role, email: user.email, organizationId: user.organizationId },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ token: jwtToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
