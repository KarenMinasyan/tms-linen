import { Link } from 'react-router-dom';

const NotFound = () => (
	<div className="tms-not-found-page">
		<h1 className="tms-not-found-page__title">Page not found</h1>
		<Link to="/">Back to tasks</Link>
	</div>
);

export default NotFound;
