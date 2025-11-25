import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireOrganization, requireOrgAdmin, requireOrgOwner } from '../middleware/organization.middleware.js';
import * as orgController from '../controllers/organization.controller.js';

export const organizationRouter = Router();

// Organization CRUD
organizationRouter.post('/', requireAuth, orgController.createOrganization);
organizationRouter.get('/', requireAuth, orgController.getUserOrganizations);
organizationRouter.get('/:id', requireAuth, requireOrganization, orgController.getOrganization);
organizationRouter.put('/:id', requireAuth, requireOrganization, requireOrgAdmin, orgController.updateOrganization);
organizationRouter.delete('/:id', requireAuth, requireOrganization, requireOrgOwner, orgController.deleteOrganization);

// Member management
organizationRouter.post('/:id/members/invite', requireAuth, requireOrganization, requireOrgAdmin, orgController.inviteMember);
organizationRouter.delete('/:id/members/:userId', requireAuth, requireOrganization, requireOrgAdmin, orgController.removeMember);
organizationRouter.put('/:id/members/:userId', requireAuth, requireOrganization, requireOrgAdmin, orgController.updateMemberRole);

// Invitations
export const invitationRouter = Router();
invitationRouter.post('/:id/accept', requireAuth, orgController.acceptInvitation);
