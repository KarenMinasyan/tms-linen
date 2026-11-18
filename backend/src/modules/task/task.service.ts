import { Nullable } from '@/common/interfaces';
import { listings, Prisma, tasks } from '@/database';
import { recalculateTaskLinenDB } from '@/modules/linen';
import { db } from '@/providers';
import { IMoveOpenTasksToListing, ITaskChanges, ITaskWithLinen } from './task.interface';

const getTasksDB = async (): Promise<ITaskWithLinen[]> =>
	db.tasks.findMany({
		include: { task_linen: true },
		orderBy: [{ planned_start: 'asc' }, { id: 'asc' }],
	});

const getTaskDB = async (taskId: string): Promise<Nullable<ITaskWithLinen>> =>
	db.tasks.findUnique({
		where: { id: taskId },
		include: { task_linen: true },
	});

const getListingDB = async (listingId: string): Promise<Nullable<listings>> =>
	db.listings.findUnique({ where: { id: listingId } });

const getOpenMainCleaningTasksDB = async (
	reservationIds: string[],
	{ tx }: { tx: Prisma.TransactionClient },
): Promise<tasks[]> =>
	tx.tasks.findMany({
		where: {
			reservation_id: { in: reservationIds },
			task_type: 'Main Cleaning',
			status: { notIn: ['Completed', 'Cancelled'] },
		},
		orderBy: [{ planned_start: 'asc' }, { id: 'asc' }],
	});

const moveOpenTasksToListingDB = async (
	reservationId: string,
	{ tx, listingId }: IMoveOpenTasksToListing,
) =>
	tx.tasks.updateMany({
		where: { reservation_id: reservationId, status: { notIn: ['Completed', 'Cancelled'] } },
		data: { listing_id: listingId },
	});

const createTaskDB = async (task: tasks): Promise<ITaskWithLinen> =>
	db.$transaction(async (tx) => {
		const createdTask = await tx.tasks.create({ data: task });

		await recalculateTaskLinenDB(createdTask, { tx, reason: 'Task created' });

		return tx.tasks.findUniqueOrThrow({
			where: { id: createdTask.id },
			include: { task_linen: true },
		});
	});

const updateTaskDB = async (task: tasks, changes: ITaskChanges): Promise<ITaskWithLinen> =>
	db.$transaction(async (tx) => {
		const updatedTask = await tx.tasks.update({ where: { id: task.id }, data: changes });

		const changedFields = (
			['task_type', 'listing_id', 'reservation_id', 'planned_start'] as const
		).filter(
			(field) =>
				changes[field] !== undefined &&
				JSON.stringify(task[field]) !== JSON.stringify(changes[field]),
		);
		if (changedFields.length) {
			await recalculateTaskLinenDB(updatedTask, {
				tx,
				reason: `Task updated: ${changedFields.join(', ')}`,
			});
		}

		return tx.tasks.findUniqueOrThrow({
			where: { id: updatedTask.id },
			include: { task_linen: true },
		});
	});

export {
	createTaskDB,
	getListingDB,
	getOpenMainCleaningTasksDB,
	getTaskDB,
	getTasksDB,
	moveOpenTasksToListingDB,
	updateTaskDB,
};
