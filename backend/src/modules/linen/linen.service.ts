import { Nullable } from '@/common/interfaces';
import { linen_history, Prisma, reservations, tasks } from '@/database';
import { db } from '@/providers';
import {
	ICreateLinenHistory,
	IGetNextReservation,
	ILinenValues,
	IRecalculateTaskLinen,
	IUpsertTaskLinen,
} from './linen.interface';
import { calculateLinen } from './linen.utils';

const getNextReservationDB = async (
	reservation: reservations,
	{ tx, listingId }: IGetNextReservation,
): Promise<Nullable<reservations>> =>
	tx.reservations.findFirst({
		where: {
			listing_id: listingId,
			planned_arrival_time: { gt: reservation.planned_arrival_time },
			status: { notIn: ['Canceled', 'NoShow'] },
		},
		orderBy: [{ planned_arrival_time: 'asc' }, { id: 'asc' }],
	});

const calculateTaskLinenDB = async (
	task: tasks,
	{ tx }: { tx: Prisma.TransactionClient },
): Promise<Nullable<ILinenValues>> => {
	if (task.task_type !== 'Main Cleaning') return null;
	if (!task.listing_id || !task.reservation_id) return null;

	const listing = await tx.listings.findUnique({ where: { id: task.listing_id } });
	const reservation = await tx.reservations.findUnique({ where: { id: task.reservation_id } });
	if (!listing || !reservation) return null;

	const nextReservation = await getNextReservationDB(reservation, {
		tx,
		listingId: task.listing_id,
	});
	const hoursUntilNextGuests = nextReservation
		? (nextReservation.planned_arrival_time.getTime() - task.planned_start.getTime()) / 3_600_000
		: null;
	// Next guests count only if they arrive within 72 hours after the cleaning starts.
	const nextGuests =
		hoursUntilNextGuests !== null && hoursUntilNextGuests >= 0 && hoursUntilNextGuests < 72
			? nextReservation
			: null;

	return calculateLinen(listing, {
		preparedFor: nextGuests ?? reservation,
		isDefault: !nextGuests,
	});
};

const getTaskLinenDB = async (
	taskId: string,
	{ tx }: { tx: Prisma.TransactionClient },
): Promise<Nullable<ILinenValues>> =>
	tx.task_linen.findUnique({ where: { task_id: taskId }, omit: { task_id: true } });

const upsertTaskLinenDB = async (taskId: string, { tx, linen }: IUpsertTaskLinen) =>
	tx.task_linen.upsert({
		where: { task_id: taskId },
		create: { task_id: taskId, ...linen },
		update: linen,
	});

const deleteTaskLinenDB = async (taskId: string, { tx }: { tx: Prisma.TransactionClient }) =>
	tx.task_linen.delete({ where: { task_id: taskId } });

const getLinenHistoryDB = async (taskId: string): Promise<linen_history[]> =>
	db.linen_history.findMany({
		where: { task_id: taskId },
		orderBy: [{ created_at: 'asc' }, { id: 'asc' }],
	});

const createLinenHistoryDB = async (
	taskId: string,
	{ tx, reason, eventId, oldLinen, newLinen }: ICreateLinenHistory,
) =>
	tx.linen_history.create({
		data: {
			task_id: taskId,
			reason,
			event_id: eventId,
			old_values: oldLinen ? { ...oldLinen } : Prisma.DbNull,
			new_values: newLinen ? { ...newLinen } : Prisma.DbNull,
		},
	});

const recalculateTaskLinenDB = async (
	task: tasks,
	{ tx, reason, eventId }: IRecalculateTaskLinen,
) => {
	if (['Completed', 'Cancelled'].includes(task.status)) return;

	const oldLinen = await getTaskLinenDB(task.id, { tx });
	const newLinen = await calculateTaskLinenDB(task, { tx });
	if (!oldLinen && !newLinen) return;

	if (newLinen) {
		await upsertTaskLinenDB(task.id, { tx, linen: newLinen });
	} else {
		await deleteTaskLinenDB(task.id, { tx });
	}

	await createLinenHistoryDB(task.id, { tx, reason, eventId, oldLinen, newLinen });
};

export { calculateTaskLinenDB, getLinenHistoryDB, recalculateTaskLinenDB, upsertTaskLinenDB };
