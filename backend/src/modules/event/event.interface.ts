import { Prisma, reservations } from '@/database';

export enum ReservationEventType {
	Created = 'Reservation.Created',
	Updated = 'Reservation.Updated',
	CustomFieldsUpdated = 'Reservation.CustomFields.Updated',
}

export type ReservationChangeField =
	| 'status'
	| 'listing_id'
	| 'planned_arrival_time'
	| 'planned_departure_time'
	| 'guests_count'
	| 'infants'
	| 'number_of_guests_override'
	| 'requested_sofabed';

export interface IReservationChanges extends Partial<Pick<reservations, ReservationChangeField>> {}

export interface IReservationEvent {
	eventId: string;
	aggregateId: string;
	eventType: ReservationEventType;
	changes: IReservationChanges;
	reservation?: reservations;
}

export interface IProcessedEvent {
	status: 'processed' | 'duplicate';
	recalculatedTaskIds: string[];
}

export interface IApplyReservationChanges {
	tx: Prisma.TransactionClient;
	event: IReservationEvent;
}

export interface IRecalculateReservationTasks {
	tx: Prisma.TransactionClient;
	reason: string;
	eventId: string;
}
