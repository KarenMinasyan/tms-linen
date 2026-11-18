import { readFileSync } from 'node:fs';
import path from 'node:path';
import { SEED_DATA_DIR } from '@/common/helpers';
import { createLogger } from '@/common/utils';
import { config } from '@/config';

const logger = createLogger('scripts.replay-events');

interface IApiResponse {
	status?: string;
	message?: string | string[];
	recalculated_task_ids?: string[];
}

const API_URL = process.env.API_URL ?? `http://localhost:${config.PORT}`;

const DATE_CHANGE_TASK_ID = 'T-date-change-A';
const DATE_CHANGE_PLANNED_START = '2026-03-12T10:00:00Z';

const sendRequest = async (method: string, { url, body }: { url: string; body: unknown }) => {
	const response = await fetch(`${API_URL}${url}`, {
		method,
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});

	return { status: response.status, data: (await response.json()) as IApiResponse };
};

const replayEvents = async () => {
	const events = JSON.parse(readFileSync(path.join(SEED_DATA_DIR, 'events.json'), 'utf8'));

	for (const event of events) {
		const { status, data } = await sendRequest('POST', {
			url: '/events/reservation',
			body: event,
		});

		logger.info(`${event.event_id}: ${status} ${data.status ?? data.message}`, {
			recalculated_task_ids: data.recalculated_task_ids,
		});
	}

	const { status } = await sendRequest('PATCH', {
		url: `/tasks/${DATE_CHANGE_TASK_ID}`,
		body: { planned_start: DATE_CHANGE_PLANNED_START },
	});

	logger.info(`PATCH ${DATE_CHANGE_TASK_ID} planned_start=${DATE_CHANGE_PLANNED_START}: ${status}`);
};

replayEvents().catch((error) => {
	logger.error('Replay failed, is the server running?', {
		api_url: API_URL,
		error: error?.message,
	});
	process.exitCode = 1;
});
