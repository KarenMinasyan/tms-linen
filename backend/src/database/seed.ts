import { readFileSync } from 'node:fs';
import path from 'node:path';
import { SEED_DATA_DIR } from '@/common/helpers';
import { Nullable } from '@/common/interfaces';
import { createLogger } from '@/common/utils';
import { calculateTaskLinenDB, upsertTaskLinenDB } from '@/modules/linen';
import { db } from '@/providers';

const logger = createLogger('database.seed');

interface IListingJson {
	listing_id: string;
	name: string;
	linen_attribute: string;
}

interface IReservationJson {
	reservation_id: string;
	listing_id: string;
	status: string;
	planned_arrival_time: string;
	planned_departure_time: string;
	guests_count: number;
	infants: number;
	customFields: {
		number_of_guests_override: Nullable<number>;
		requested_sofabed: boolean;
	};
}

interface ITaskJson {
	task_id: string;
	task_type: string;
	status: string;
	listing_id: Nullable<string>;
	reservation_id: Nullable<string>;
	planned_start: string;
}

const readSeedFile = <T>(fileName: string): T[] =>
	JSON.parse(readFileSync(path.join(SEED_DATA_DIR, fileName), 'utf8')) as T[];

const seed = async () => {
	const listings = readSeedFile<IListingJson>('listings.json');
	const reservations = readSeedFile<IReservationJson>('reservations.json');
	const tasks = readSeedFile<ITaskJson>('tasks.json');

	const linenCount = await db.$transaction(
		async (tx) => {
			// Start from a clean state so the seed can be re-run before replaying events.
			await tx.event_idempotency.deleteMany();
			await tx.linen_history.deleteMany();
			await tx.task_linen.deleteMany();
			await tx.tasks.deleteMany();
			await tx.reservations.deleteMany();
			await tx.listings.deleteMany();

			await tx.listings.createMany({
				data: listings.map((listing) => ({
					id: listing.listing_id,
					name: listing.name,
					linen_attribute: listing.linen_attribute,
				})),
			});

			await tx.reservations.createMany({
				data: reservations.map((reservation) => ({
					id: reservation.reservation_id,
					listing_id: reservation.listing_id,
					status: reservation.status,
					planned_arrival_time: new Date(reservation.planned_arrival_time),
					planned_departure_time: new Date(reservation.planned_departure_time),
					guests_count: reservation.guests_count,
					infants: reservation.infants,
					number_of_guests_override: reservation.customFields.number_of_guests_override,
					requested_sofabed: reservation.customFields.requested_sofabed,
				})),
			});

			await tx.tasks.createMany({
				data: tasks.map((task) => ({
					id: task.task_id,
					task_type: task.task_type,
					status: task.status,
					listing_id: task.listing_id,
					reservation_id: task.reservation_id,
					planned_start: new Date(task.planned_start),
				})),
			});

			// The initial calculation is the starting state, not a recalculation, so no history is written.
			let created = 0;
			for (const task of await tx.tasks.findMany()) {
				const linen = await calculateTaskLinenDB(task, { tx });
				if (!linen) continue;

				await upsertTaskLinenDB(task.id, { tx, linen });
				created++;
			}

			return created;
		},
		{ timeout: 30_000 },
	);

	logger.info('Seed completed', {
		listings: listings.length,
		reservations: reservations.length,
		tasks: tasks.length,
		task_linen: linenCount,
	});
};

seed()
	.catch((error) => {
		logger.error('Seed failed', { error: error?.message ?? error });
		process.exitCode = 1;
	})
	.finally(() => db.$disconnect());
