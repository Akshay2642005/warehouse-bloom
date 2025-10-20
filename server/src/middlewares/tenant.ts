import { Request, Response, NextFunction } from 'express';
import { TenantService } from '../services/tenant.service';
import { createResponse } from '../utils/apiResponse';

declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

/**
 * Middleware to enforce tenant isolation
 */
export async function enforceTenantIsolation(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return next(); // Let auth middleware handle this
    }

    // Super admin can access any tenant
    if (req.user.role === 'SUPER_ADMIN') {
      return next();
    }

    // Get user's tenant
    const tenant = await TenantService.getTenantByUserId(req.user.id);
    
    if (!tenant) {
      res.status(403).json(
        createResponse({ 
          success: false, 
          message: "No tenant workspace found. Please contact support." 
        })
      );
      return;
    }

    // Check if tenant is active
    if (!tenant.isActive) {
      res.status(403).json(
        createResponse({ 
          success: false, 
          message: "Workspace not activated. Please complete payment to access your account.",
          data: { requiresPayment: true }
        })
      );
      return;
    }

    // Add tenant ID to request for use in controllers
    req.tenantId = tenant.id;
    next();

  } catch (error) {
    console.error('[TENANT] Error in tenant middleware:', error);
    res.status(500).json(
      createResponse({ 
        success: false, 
        message: "Failed to verify tenant access" 
      })
    );
  }
}

/**
 * Middleware to check tenant limits
 */
export async function checkTenantLimits(resource: 'items' | 'orders' | 'users') {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.tenantId || req.user?.role === 'SUPER_ADMIN') {
        return next();
      }

      const limits = await TenantService.checkTenantLimits(req.tenantId);
      
      if (limits[resource].exceeded) {
        res.status(403).json(
          createResponse({ 
            success: false, 
            message: `${resource} limit exceeded. Please upgrade your plan.`,
            data: { 
              limit: limits[resource].limit,
              current: limits[resource].current,
              resource
            }
          })
        );
        return;
      }

      next();

    } catch (error) {
      res.status(500).json(
        createResponse({ 
          success: false, 
          message: "Failed to check tenant limits" 
        })
      );
    }
  };
}