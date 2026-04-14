import express from 'express';
import { prisma } from '../index';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { Role } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';

const router = express.Router();
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Create Invite (Admin/SuperAdmin only)
router.post('/', authenticate, authorize([Role.SUPERADMIN, Role.ADMIN]), async (req: AuthRequest, res) => {
  const { email, role } = req.body;
  
  if (!email || !role) {
    return res.status(400).json({ message: 'Email and role are required' });
  }

  try {
    const requesterRole = (req as AuthRequest).user?.role;

    // Hierarchy Enforcement
    if (requesterRole === Role.SUPERADMIN && role !== Role.ADMIN) {
      return res.status(403).json({ message: 'SuperAdmins can only authorize new Administrative nodes' });
    }

    if (requesterRole === Role.ADMIN && role === Role.ADMIN) {
      return res.status(403).json({ message: 'Only SuperAdmins can authorize additional Administrative nodes' });
    }

    if (role === Role.SUPERADMIN) {
      return res.status(403).json({ message: 'SuperAdmin nodes must be provisioned manually' });
    }

    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const invitation = await prisma.invitation.create({
      data: {
        email,
        token,
        role: role as Role,
        organizationId: (req as AuthRequest).user?.organizationId || '',
        expiresAt,
      },
    });

    const inviteLink = `${process.env.FRONTEND_URL}/invite?token=${token}&email=${email}`;

    // Send email via Resend
    if (resend) {
      await resend.emails.send({
        from: 'Beth Rewards <onboarding@resend.dev>',
        to: email,
        subject: 'Invitation to Beth Reward System',
        html: `
          <h1>Welcome to Beth</h1>
          <p>You have been invited as a <strong>${role}</strong>.</p>
          <p>Click the link below to create your account:</p>
          <a href="${inviteLink}">${inviteLink}</a>
          <p>This link expires in 7 days.</p>
        `,
      });
    }

    res.json({ 
      message: 'Invitation sent successfully', 
      invitation,
      inviteLink 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating invitation' });
  }
});

// Get all invites (Admin only)
router.get('/', authenticate, authorize([Role.SUPERADMIN, Role.ADMIN]), async (req, res) => {
  try {
    const invites = await prisma.invitation.findMany({
      orderBy: { expiresAt: 'desc' },
    });
    res.json(invites);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching invitations' });
  }
});

export default router;
