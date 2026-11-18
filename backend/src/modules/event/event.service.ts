import { conflictError, notFoundError } from '@/common/exceptions';
import { Nullable } from '@/common/interfaces';
import { Prisma, reservations } from '@/database';
import { recalculateTaskLinenDB } from '@/modules/linen';
import { getListingDB, getOpenMainCleaningTasksDB, moveOpenTasksToListingDB } from '@/modules/task';
import { db } from '@/providers';
import {
	IApplyReservationChanges,
	IProcessedEvent,
	IRecalculateReservationTasks,
	IReservationEvent,
	ReservationChangeField,
	ReservationEventType,
} from './event.interface';

const getPreviousReservationDB = async (
	reservation: reservations,
	{ tx }: { tx: Prisma.TransactionClient },
): Promise<Nullable<reservations>> =>
	tx.reservations.findFirst({
		where: {
			listing_id: reservation.listing_id,
			planned_arrival_time: { lt: reservation.planned_arrival_time },
			status: { notIn: ['Canceled', 'NoShow', 'CheckedOut'] },
		},
		orderBy: [{ planned_arrival_time: 'desc' }, { id: 'desc' }],
	});

const recalculateReservationTasksDB = async (
	reservation: reservations,
	{ tx, reason, eventId }: IRecalculateReservationTasks,
) => {
	const previousReservation = await getPreviousReservationDB(reservation, { tx });
	const reservationIds = previousReservation
		? [reservation.id, previousReservation.id]
		: [reservation.id];

	const tasks = await getOpenMainCleaningTasksDB(reservationIds, { tx });
	for (const task of tasks) {
		await recalculateTaskLinenDB(task, { tx, reason, eventId });
	}

	return tasks.map((task) => task.id);
};

const createReservationDB = async (
	reservation: reservations,
	{ tx, event }: IApplyReservationChanges,
) => {
	if (await tx.reservations.findUnique({ where: { id: reservation.id } })) {
		throw conflictError(`Reservation ${reservation.id} already exists`);
	}
	if (!(await getListingDB(reservation.listing_id))) {
		throw notFoundError(`Listing ${reservation.listing_id} not found`);
	}

	const createdReservation = await tx.reservations.create({ data: reservation });

	return recalculateReservationTasksDB(createdReservation, {
		tx,
		reason: event.eventType,
		eventId: event.eventId,
	});
};

const updateReservationDB = async (
	reservationId: string,
	{ tx, event }: IApplyReservationChanges,
) => {
	const reservation = await tx.reservations.findUnique({ where: { id: reservationId } });
	if (!reservation) throw notFoundError(`Reservation ${reservationId} not found`);

	const changedFields = (Object.keys(event.changes) as ReservationChangeField[]).filter(
		(field) => JSON.stringify(reservation[field]) !== JSON.stringify(event.changes[field]),
	);
	if (!changedFields.length) return [];

	const { listing_id: newListingId } = event.changes;
	if (newListingId && changedFields.includes('listing_id') && !(await getListingDB(newListingId))) {
		throw notFoundError(`Listing ${newListingId} not found`);
	}

	const updatedReservation = await tx.reservations.update({
		where: { id: reservationId },
		data: event.changes,
	});

	if (changedFields.includes('listing_id')) {
		await moveOpenTasksToListingDB(reservationId, {
			tx,
			listingId: updatedReservation.listing_id,
		});
	}

	const triggerFields = changedFields.filter(
		(field) =>
			[
				'guests_count',
				'infants',
				'planned_arrival_time',
				'listing_id',
				'number_of_guests_override',
				'requested_sofabed',
			].includes(field) ||
			(field === 'status' && ['InHouse', 'CheckedOut'].includes(updatedReservation.status)),
	);
	if (!triggerFields.length) return [];

	return recalculateReservationTasksDB(updatedReservation, {
		tx,
		reason: `${event.eventType}: ${triggerFields.join(', ')}`,
		eventId: event.eventId,
	});
};

const processReservationEventDB = async (event: IReservationEvent): Promise<IProcessedEvent> => {
	const duplicate: IProcessedEvent = { status: 'duplicate', recalculatedTaskIds: [] };

	try {
		return await db.$transaction(async (tx) => {
			await tx.event_idempotency.create({
				data: { event_id: event.eventId, event_type: event.eventType },
			});

			const recalculatedTaskIds =
				event.eventType === ReservationEventType.Created && event.reservation
					? await createReservationDB(event.reservation, { tx, event })
					: await updateReservationDB(event.aggregateId, { tx, event });

			return { status: 'processed', recalculatedTaskIds };
		});
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
			return duplicate;
		}
		throw error;
	}
};

export { processReservationEventDB };
