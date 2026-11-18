import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from './interfaces';
import { ERRORS } from './helpers';
import { createLogger } from './utils';

const logger = createLogger('exceptions');

export const validationError = (message: string | string[]) => ERRORS.VALIDATION_ERROR(message);
export const notFoundError = (message: string) => ERRORS.NOT_FOUND_ERROR(message);
export const conflictError = (message: string) => ERRORS.CONFLICT_ERROR(message);

export const httpErrorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
	const status: number = err?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;

	// Unexpected errors keep their details in the logs only; the client gets a generic message.
	if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
		logger.error('Unhandled error', { path: req.path, error: err?.message, stack: err?.stack });
	}

	const message =
		status >= HttpStatus.INTERNAL_SERVER_ERROR
			? 'Internal Server Error'
			: (err?.message ?? 'Bad Request');
	const error = err?.error ?? HttpStatus[status] ?? 'INTERNAL_SERVER_ERROR';

	res.status(status).json({
		status,
		timestamp: new Date().toISOString(),
		path: req.path,
		message,
		error,
	});
};
