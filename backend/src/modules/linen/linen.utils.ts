import { listings } from '@/database';
import {
	IApartmentBeds,
	ICalculateLinen,
	IGetSleepingPlan,
	ILinenValues,
	ISleepingPlan,
} from './linen.interface';

const getBathroomsCount = (listingName: string) => {
	if (listingName.includes('SS')) return 0;
	if (listingName.includes('2BA')) return 2;
	return 1;
};

const getSleepingPlan = (
	apartment: IApartmentBeds,
	{ guests, isSofabedRequested, isDefault }: IGetSleepingPlan,
): ISleepingPlan => {
	const { beds, bedSpots, sofabeds, sofaSpots } = apartment;
	const bedsOnly = { sheets: beds, towels: bedSpots, openedSofabeds: 0 };

	if (isDefault || guests <= beds) return bedsOnly;

	if (guests > bedSpots) {
		return {
			sheets: beds + sofabeds,
			towels: Math.max(guests, bedSpots + Math.min(sofabeds, sofaSpots)),
			openedSofabeds: sofabeds,
		};
	}

	if (!isSofabedRequested) return bedsOnly;

	const openedSofabeds = Math.min(guests - beds, sofabeds);
	if (openedSofabeds === 0) return bedsOnly;

	if (beds === 1 && sofabeds === 1 && guests === 2) {
		return { sheets: 2, towels: 2, openedSofabeds: 1 };
	}

	if (openedSofabeds === sofabeds) {
		return { sheets: beds + sofabeds, towels: bedSpots + sofaSpots, openedSofabeds };
	}

	return { sheets: guests, towels: bedSpots + openedSofabeds, openedSofabeds };
};

const calculateLinen = (
	listing: listings,
	{ preparedFor, isDefault }: ICalculateLinen,
): ILinenValues => {
	const linenAttribute = Object.fromEntries(
		listing.linen_attribute.split(';').map((pair) => pair.split(':')),
	);
	const apartment = {
		beds: Number(linenAttribute.Beds) || 0,
		bedSpots: Number(linenAttribute.BedSpots) || 0,
		sofabeds: Number(linenAttribute.Sofabeds) || 0,
		sofaSpots: Number(linenAttribute.SofaSpots) || 0,
	};

	const { sheets, towels, openedSofabeds } = getSleepingPlan(apartment, {
		guests: Math.max(preparedFor.guests_count, preparedFor.number_of_guests_override ?? 0),
		isSofabedRequested: preparedFor.requested_sofabed,
		isDefault,
	});
	const bathrooms = getBathroomsCount(listing.name);

	return {
		sheets,
		towels,
		bathmats: bathrooms,
		handtowels: bathrooms === 0 ? 0 : towels + bathrooms,
		dishtowels: listing.name.includes('BR') || listing.name.includes('ST') ? 1 : 0,
		prepared_for_guests: towels,
		requested_sofabeds_count: openedSofabeds,
		actual_guests: preparedFor.guests_count,
		infants: preparedFor.infants,
		number_of_guests_override: preparedFor.number_of_guests_override,
		requested_sofabed: preparedFor.requested_sofabed,
	};
};

export { calculateLinen };
