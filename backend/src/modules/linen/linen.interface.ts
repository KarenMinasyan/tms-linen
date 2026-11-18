import { Nullable } from '@/common/interfaces';
import { Prisma, reservations } from '@/database';

export interface IApartmentBeds {
	beds: number;
	bedSpots: number;
	sofabeds: number;
	sofaSpots: number;
}

export interface ISleepingPlan {
	sheets: number;
	towels: number;
	openedSofabeds: number;
}

export interface IGetSleepingPlan {
	guests: number;
	isSofabedRequested: boolean;
	isDefault: boolean;
}

export interface ICalculateLinen {
	preparedFor: reservations;
	isDefault: boolean;
}

export interface IGetNextReservation {
	tx: Prisma.TransactionClient;
	listingId: string;
}

export interface IRecalculateTaskLinen {
	tx: Prisma.TransactionClient;
	reason: string;
	eventId?: string;
}

export interface ICreateLinenHistory {
	tx: Prisma.TransactionClient;
	reason: string;
	eventId?: string;
	oldLinen: Nullable<ILinenValues>;
	newLinen: Nullable<ILinenValues>;
}

export interface IUpsertTaskLinen {
	tx: Prisma.TransactionClient;
	linen: ILinenValues;
}

export interface ILinenValues {
	sheets: number;
	towels: number;
	bathmats: number;
	handtowels: number;
	dishtowels: number;
	prepared_for_guests: number;
	requested_sofabeds_count: number;
	actual_guests: number;
	infants: number;
	number_of_guests_override: Nullable<number>;
	requested_sofabed: boolean;
}
