import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { generatePath } from '@/utils';
import type { ILinenHistory, ITask } from '@/types';

const apiRoutes = {
	tasks: 'tasks',
	task: 'tasks/:id',
	taskLinenHistory: 'tasks/:id/linen/history',
};

const { tasks, task, taskLinenHistory } = apiRoutes;

export const taskApi = createApi({
	baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BASE_URL }),
	reducerPath: 'taskApi',
	refetchOnMountOrArgChange: true,

	endpoints: (build) => ({
		getTasks: build.query<ITask[], void>({
			query: () => ({
				url: tasks,
				method: 'GET',
			}),
		}),

		getTask: build.query<ITask, string>({
			query: (id) => ({
				url: generatePath(task, { id }),
				method: 'GET',
			}),
		}),

		getTaskLinenHistory: build.query<ILinenHistory[], string>({
			query: (id) => ({
				url: generatePath(taskLinenHistory, { id }),
				method: 'GET',
			}),
		}),
	}),
});

export const { useGetTasksQuery, useGetTaskQuery, useGetTaskLinenHistoryQuery } = taskApi;
