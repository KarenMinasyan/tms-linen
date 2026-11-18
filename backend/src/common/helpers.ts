import path from 'node:path';
import { ZodError } from 'zod';
import { HttpStatus } from './interfaces';

// The source JSON files provided with the task live in the repository root.
export const SEED_DATA_DIR = path.resolve(__dirname, '../../..');

export const ERRORS = {
	VALIDATION_ERROR: (message: string | string[]) => ({
		message,
		error: HttpStatus[HttpStatus.UNPROCESSABLE_ENTITY],
		status: HttpStatus.UNPROCESSABLE_ENTITY,
	}),
	NOT_FOUND_ERROR: (message: string) => ({
		message,
		error: HttpStatus[HttpStatus.NOT_FOUND],
		status: HttpStatus.NOT_FOUND,
	}),
	CONFLICT_ERROR: (message: string) => ({
		message,
		error: HttpStatus[HttpStatus.CONFLICT],
		status: HttpStatus.CONFLICT,
	}),
};

export const extractZodMessages = (error: ZodError) => [
	...new Set(error.issues.map((issue) => issue.message)),
];
