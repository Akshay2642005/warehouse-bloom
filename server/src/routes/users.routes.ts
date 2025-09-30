import { Router } from 'express';
import { requireAuth } from '../middlewares/requireAuth';
import { getUsers } from '../controllers/users.controller';

export const usersRouter = Router();

usersRouter.get('/', requireAuth, getUsers);