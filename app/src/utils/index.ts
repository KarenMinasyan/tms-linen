import type { SerializedError } from '@reduxjs/toolkit';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { IErrorResponse, TParams } from '@/types';

export const generatePath = (path: string, params: TParams) =>
	Object.entries(params).reduce(
		(result, [key, value]) => result.replace(`:${key}`, encodeURIComponent(value)),
		path,
	);

export const formatDateTime = (value: string) =>
	`${new Date(value).toLocaleString('en-GB', {
		dateStyle: 'medium',
		timeStyle: 'short',
		timeZone: 'UTC',
	})} UTC`;

export const getErrorMessage = (error?: FetchBaseQueryError | SerializedError) => {
	if (!error) return null;
	if (!('status' in error)) return 'Something went wrong';
	if (error.status === 'FETCH_ERROR') return 'Could not reach the server';

	const message = (error.data as IErrorResponse | undefined)?.message;
	if (!message) return 'Something went wrong';

	return Array.isArray(message) ? message.join(', ') : message;
};
