import { Router } from 'express';
import { createTask, getTask, getTaskLinenHistory, getTasks, updateTask } from './task.controller';
import { validateCreateTask, validateTaskId, validateUpdateTask } from './task.middleware';

const taskRouter = Router();

taskRouter.get('/', getTasks);
taskRouter.post('/', validateCreateTask, createTask);
taskRouter.get('/:id', validateTaskId, getTask);
taskRouter.patch('/:id', validateUpdateTask, updateTask);
taskRouter.get('/:id/linen/history', validateTaskId, getTaskLinenHistory);

export { taskRouter };
