import type { ITaskLinen } from '@/types';

export const LINEN_LABELS: Record<keyof ITaskLinen, string> = {
	towels: 'Towels',
	sheets: 'Sheets',
	bathmats: 'Bathmats',
	handtowels: 'Handtowels',
	dishtowels: 'Dishtowels',
	prepared_for_guests: 'Total guests',
	infants: 'Infants (included in total)',
	requested_sofabed: 'Requested sofabed',
	requested_sofabeds_count: 'Requested sofabed count',
	actual_guests: 'Reservation guests',
	number_of_guests_override: 'Guests override',
};

export const LINEN_DETAILS_FIELDS: (keyof ITaskLinen)[] = [
	'towels',
	'sheets',
	'bathmats',
	'handtowels',
	'dishtowels',
	'prepared_for_guests',
	'infants',
	'requested_sofabed',
	'requested_sofabeds_count',
];
