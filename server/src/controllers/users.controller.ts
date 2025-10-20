import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { createResponse } from '../utils/apiResponse';

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    // Filter by tenant
    const where: any = {};
    if (req.tenantId) {
      where.tenantId = req.tenantId;
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        twoFactorEnabled: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(createResponse({
      data: { users },
      message: 'Users retrieved successfully'
    }));
  } catch (error) {
    res.status(500).json(createResponse({
      success: false,
      message: 'Failed to retrieve users'
    }));
  }
}