import type { ILinenHistory, ITaskLinen, Nullable } from '@/types';
import { LINEN_LABELS } from '../constants';

export const formatLinenValue = (value?: Nullable<number | boolean>) => {
	if (typeof value === 'boolean') return value ? 'Yes' : 'No';

	return value ?? '—';
};

export const getLinenChanges = ({ old_values, new_values }: ILinenHistory) =>
	(Object.keys(LINEN_LABELS) as (keyof ITaskLinen)[])
		.filter((field) => old_values?.[field] !== new_values?.[field])
		.map((field) => ({
			field,
			oldValue: formatLinenValue(old_values?.[field]),
			newValue: formatLinenValue(new_values?.[field]),
		}));
