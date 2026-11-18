import { Router } from 'express';
import { eventRouter } from '@/modules/event';
import { taskRouter } from '@/modules/task';

const apiRouter = Router();

apiRouter.use('/events', eventRouter);
apiRouter.use('/tasks', taskRouter);

export default apiRouter;
