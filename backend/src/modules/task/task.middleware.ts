import z from 'zod';
import {
	bodyError,
	dateTimeSchema,
	fieldError,
	textSchema,
	validateData,
} from '@/common/middlewares';

const taskIdParamsSchema = z.object({
	id: textSchema('Task ID', { max: 64 }),
});

const taskFieldsSchema = z.strictObject(
	{
		task_type: textSchema('Task type', { max: 64 }),
		status: z.enum(['Pending', 'In Progress', 'Paused', 'Completed', 'Cancelled'], {
			error: fieldError('Status', {
				invalid: 'Status must be one of: Pending, In Progress, Paused, Completed, Cancelled',
			}),
		}),
		listing_id: textSchema('Listing ID', { max: 64 }).nullable(),
		reservation_id: textSchema('Reservation ID', { max: 64 }).nullable(),
		planned_start: dateTimeSchema('Planned start'),
	},
	{ error: bodyError },
);

const createTaskSchema = taskFieldsSchema.extend({
	task_id: textSchema('Task ID', { max: 64 }),
	listing_id: taskFieldsSchema.shape.listing_id.default(null),
	reservation_id: taskFieldsSchema.shape.reservation_id.default(null),
});

const updateTaskSchema = taskFieldsSchema
	.partial()
	.refine((fields) => Object.keys(fields).length > 0, {
		error: 'Send at least one field to update',
	});

const validateTaskId = validateData({ params: taskIdParamsSchema });
const validateCreateTask = validateData({ body: createTaskSchema });
const validateUpdateTask = validateData({ params: taskIdParamsSchema, body: updateTaskSchema });

export { validateCreateTask, validateTaskId, validateUpdateTask };
