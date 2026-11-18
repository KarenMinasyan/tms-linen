import { NextFunction, Request, Response } from 'express';
import { z, ZodError } from 'zod';
import { validationError } from './exceptions';
import { extractZodMessages } from './helpers';
import { sanitize } from './utils';

interface IValidationSchemas {
	body?: z.ZodType;
	params?: z.ZodType;
}

export const validateData = (schemas: IValidationSchemas) => {
	return async (req: Request, _res: Response, next: NextFunction) => {
		try {
			if (schemas.body) req.body = await schemas.body.parseAsync(req.body);
			if (schemas.params) {
				req.params = (await schemas.params.parseAsync(req.params)) as typeof req.params;
			}

			next();
		} catch (err) {
			if (err instanceof ZodError) return next(validationError(extractZodMessages(err)));
			next(err);
		}
	};
};

export const fieldError =
	(label: string, { invalid }: { invalid: string }) =>
	(issue: { input?: unknown }) =>
		issue.input === undefined ? `${label} is required` : invalid;

export const bodyError = (issue: { code?: string; keys?: string[] }) =>
	issue.code === 'unrecognized_keys' && issue.keys
		? `Field ${issue.keys.map((key) => `"${key}"`).join(', ')} is not allowed`
		: 'Request body must be a JSON object';

export const textSchema = (label: string, { max }: { max: number }) =>
	z
		.string({ error: fieldError(label, { invalid: `${label} must be text` }) })
		.trim()
		.min(1, { error: `${label} is required` })
		.max(max, { error: `${label} must be at most ${max} characters` })
		.transform((input) => sanitize(input));

export const dateTimeSchema = (label: string) =>
	z.iso
		.datetime({
			offset: true,
			error: fieldError(label, {
				invalid: `${label} must be a date and time, for example 2026-03-12T10:00:00Z`,
			}),
		})
		.transform((input) => new Date(input));
