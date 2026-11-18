import { lazy, Suspense } from 'react';
import type { IRoute } from '@/types';

const Tasks = lazy(() => import('@/pages/Tasks'));
const Task = lazy(() => import('@/pages/Task'));

export const ROUTES: IRoute[] = [
	{
		id: 'tasks',
		path: '/',
		element: (
			<Suspense fallback={<p>Loading…</p>}>
				<Tasks />
			</Suspense>
		),
	},
	{
		id: 'task',
		path: '/tasks/:id',
		element: (
			<Suspense fallback={<p>Loading…</p>}>
				<Task />
			</Suspense>
		),
	},
];
