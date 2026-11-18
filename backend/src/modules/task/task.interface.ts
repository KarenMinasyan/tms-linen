import { Nullable } from '@/common/interfaces';
import { Prisma, task_linen, tasks } from '@/database';

export interface ITaskWithLinen extends tasks {
	task_linen: Nullable<task_linen>;
}

export interface ITaskChanges extends Partial<Omit<tasks, 'id'>> {}

export interface IMoveOpenTasksToListing {
	tx: Prisma.TransactionClient;
	listingId: string;
}
