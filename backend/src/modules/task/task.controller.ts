import { NextFunction, Request, Response } from 'express';
import { conflictError, notFoundError } from '@/common/exceptions';
import { createLogger } from '@/common/utils';
import { getLinenHistoryDB } from '@/modules/linen';
import { createTaskDB, getListingDB, getTaskDB, getTasksDB, updateTaskDB } from './task.service';
import { mapToTaskResponse } from './task.utils';

const logger = createLogger('task.controller');

const getTasks = async (_req: Request, res: Response) => {
	logger.info('GET getTasks method');

	const tasks = await getTasksDB();

	res.status(200).json(tasks.map(mapToTaskResponse));
};

const getTask = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
	logger.info('GET getTask method');
	const { id } = req.params;

	const task = await getTaskDB(id);
	if (!task) return next(notFoundError(`Task ${id} not found`));

	res.status(200).json(mapToTaskResponse(task));
};

const getTaskLinenHistory = async (
	req: Request<{ id: string }>,
	res: Response,
	next: NextFunction,
) => {
	logger.info('GET getTaskLinenHistory method');
	const { id } = req.params;

	const task = await getTaskDB(id);
	if (!task) return next(notFoundError(`Task ${id} not found`));

	const history = await getLinenHistoryDB(id);

	res.status(200).json(history);
};

const createTask = async (req: Request, res: Response, next: NextFunction) => {
	logger.info('POST createTask method');
	const { task_id, task_type, status, listing_id, reservation_id, planned_start } = req.body;

	if (await getTaskDB(task_id)) return next(conflictError(`Task ${task_id} already exists`));
	if (listing_id && !(await getListingDB(listing_id))) {
		return next(notFoundError(`Listing ${listing_id} not found`));
	}

	const task = await createTaskDB({
		id: task_id,
		task_type,
		status,
		listing_id,
		reservation_id,
		planned_start,
	});

	res.status(201).json(mapToTaskResponse(task));
};

const updateTask = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
	logger.info('PATCH updateTask method');
	const { id } = req.params;
	const { task_type, status, listing_id, reservation_id, planned_start } = req.body;

	const currentTask = await getTaskDB(id);
	if (!currentTask) return next(notFoundError(`Task ${id} not found`));
	if (listing_id && !(await getListingDB(listing_id))) {
		return next(notFoundError(`Listing ${listing_id} not found`));
	}

	const task = await updateTaskDB(currentTask, {
		task_type,
		status,
		listing_id,
		reservation_id,
		planned_start,
	});

	res.status(200).json(mapToTaskResponse(task));
};

export { createTask, getTask, getTaskLinenHistory, getTasks, updateTask };
