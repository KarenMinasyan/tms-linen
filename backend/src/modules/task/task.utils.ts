import { ITaskWithLinen } from './task.interface';

const mapToTaskResponse = (task: ITaskWithLinen) => {
	const linen = task.task_linen;

	return {
		task_id: task.id,
		task_type: task.task_type,
		status: task.status,
		listing_id: task.listing_id,
		reservation_id: task.reservation_id,
		planned_start: task.planned_start,
		linen: linen && {
			sheets: linen.sheets,
			towels: linen.towels,
			bathmats: linen.bathmats,
			handtowels: linen.handtowels,
			dishtowels: linen.dishtowels,
			prepared_for_guests: linen.prepared_for_guests,
			requested_sofabeds_count: linen.requested_sofabeds_count,
			actual_guests: linen.actual_guests,
			infants: linen.infants,
			number_of_guests_override: linen.number_of_guests_override,
			requested_sofabed: linen.requested_sofabed,
		},
	};
};

export { mapToTaskResponse };
