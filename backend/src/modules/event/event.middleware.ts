import z from 'zod';
import {
	bodyError,
	dateTimeSchema,
	fieldError,
	textSchema,
	validateData,
} from '@/common/middlewares';
import { ReservationEventType } from './event.interface';

const countSchema = (label: string) =>
	z
		.number({ error: fieldError(label, { invalid: `${label} must be a number` }) })
		.int({ error: `${label} must be a whole number` })
		.min(0, { error: `${label} can't be negative` });

const sofabedRequestSchema = z.boolean({
	error: fieldError('Sofa bed request', { invalid: 'Sofa bed request must be true or false' }),
});

const reservationChangeSchema = z.discriminatedUnion(
	'field',
	[
		z.object({ field: z.literal('status'), new: textSchema('Reservation status', { max: 32 }) }),
		z.object({ field: z.literal('listing_id'), new: textSchema('Listing ID', { max: 64 }) }),
		z.object({ field: z.literal('planned_arrival_time'), new: dateTimeSchema('Arrival time') }),
		z.object({
			field: z.literal('planned_departure_time'),
			new: dateTimeSchema('Departure time'),
		}),
		z.object({ field: z.literal('guests_count'), new: countSchema('Number of guests') }),
		z.object({ field: z.literal('infants'), new: countSchema('Number of infants') }),
		z.object({
			field: z.literal('number_of_guests_override'),
			new: countSchema('Guest count override').nullable(),
		}),
		z.object({ field: z.literal('requested_sofabed'), new: sofabedRequestSchema }),
	],
	{ error: 'Unknown change field' },
);

const reservationSchema = z.object(
	{
		reservation_id: textSchema('Reservation ID', { max: 64 }),
		listing_id: textSchema('Listing ID', { max: 64 }),
		status: textSchema('Reservation status', { max: 32 }),
		planned_arrival_time: dateTimeSchema('Arrival time'),
		planned_departure_time: dateTimeSchema('Departure time'),
		guests_count: countSchema('Number of guests'),
		infants: countSchema('Number of infants'),
		customFields: z.object(
			{
				number_of_guests_override: countSchema('Guest count override').nullable(),
				requested_sofabed: sofabedRequestSchema,
			},
			{ error: 'Reservation custom fields are required' },
		),
	},
	{ error: 'Reservation details must be an object' },
);

const reservationEventSchema = z
	.object(
		{
			event_id: textSchema('Event ID', { max: 128 }),
			aggregate_id: textSchema('Reservation ID', { max: 64 }),
			event_type: z.enum(ReservationEventType, {
				error: fieldError('Event type', {
					invalid: `Event type must be one of: ${Object.values(ReservationEventType).join(', ')}`,
				}),
			}),
			created_at: dateTimeSchema('Event time'),
			changes: z.array(reservationChangeSchema, { error: 'Changes must be a list' }).default([]),
			reservation: reservationSchema.optional(),
		},
		{ error: bodyError },
	)
	.refine(
		(event) =>
			event.event_type !== ReservationEventType.Created ||
			event.reservation?.reservation_id === event.aggregate_id,
		{ error: 'A new reservation event must include the reservation with the same reservation ID' },
	);

const validateReservationEvent = validateData({ body: reservationEventSchema });

export { validateReservationEvent };
