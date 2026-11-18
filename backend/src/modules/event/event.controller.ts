import { Request, Response } from 'express';
import { createLogger } from '@/common/utils';
import { processReservationEventDB } from './event.service';

const logger = createLogger('event.controller');

const receiveReservationEvent = async (req: Request, res: Response) => {
	logger.info('POST receiveReservationEvent method');
	const { event_id, aggregate_id, event_type, changes, reservation } = req.body;

	const result = await processReservationEventDB({
		eventId: event_id,
		aggregateId: aggregate_id,
		eventType: event_type,
		changes: Object.fromEntries(
			changes.map((change: { field: string; new: unknown }) => [change.field, change.new]),
		),
		reservation: reservation && {
			id: reservation.reservation_id,
			listing_id: reservation.listing_id,
			status: reservation.status,
			planned_arrival_time: reservation.planned_arrival_time,
			planned_departure_time: reservation.planned_departure_time,
			guests_count: reservation.guests_count,
			infants: reservation.infants,
			number_of_guests_override: reservation.customFields.number_of_guests_override,
			requested_sofabed: reservation.customFields.requested_sofabed,
		},
	});

	logger.info('Reservation event handled', { event_id, status: result.status });

	res.status(200).json({
		event_id,
		status: result.status,
		recalculated_task_ids: result.recalculatedTaskIds,
	});
};

export { receiveReservationEvent };
