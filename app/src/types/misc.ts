import type { ReactElement } from 'react';

export type Nullable<T> = T | null;

export type TParams = Record<string, string | number>;

export interface IRoute {
	id: string;
	path: string;
	element: ReactElement;
}

export interface IErrorResponse {
	status: number;
	timestamp: string;
	path: string;
	message: string | string[];
	error: string;
}
