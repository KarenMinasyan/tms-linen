import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layout';
import { ROUTES } from './routes';

const NotFound = lazy(() => import('@/pages/NotFound'));

const AppRoutes = () => (
	<Routes>
		<Route element={<AppLayout />}>
			{ROUTES.map(({ id, ...route }) => (
				<Route key={id} {...route} />
			))}
			<Route
				path="*"
				element={
					<Suspense fallback={<p>Loading…</p>}>
						<NotFound />
					</Suspense>
				}
			/>
		</Route>
	</Routes>
);

export default AppRoutes;
