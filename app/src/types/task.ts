import type { Nullable } from './misc';

export interface ITaskLinen {
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

export interface ITask {
	task_id: string;
	task_type: string;
	status: string;
	listing_id: Nullable<string>;
	reservation_id: Nullable<string>;
	planned_start: string;
	linen: Nullable<ITaskLinen>;
}

export interface ILinenHistory {
	id: number;
	task_id: string;
	reason: string;
	event_id: Nullable<string>;
	old_values: Nullable<ITaskLinen>;
	new_values: Nullable<ITaskLinen>;
	created_at: string;
}
