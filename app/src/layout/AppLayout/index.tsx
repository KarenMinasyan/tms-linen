import { Link, Outlet } from 'react-router-dom';

const AppLayout = () => (
	<div className="tms-app-layout">
		<header className="tms-app-layout__header">
			<Link className="tms-app-layout__header-title" to="/">
				TMS Linen
			</Link>
		</header>

		<main className="tms-app-layout__content">
			<Outlet />
		</main>
	</div>
);

export default AppLayout;
