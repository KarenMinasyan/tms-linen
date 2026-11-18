import { Link } from 'react-router-dom';
import { formatDateTime } from '@/utils';
import { useTask } from './model';
import { LinenDetails, LinenHistory } from './ui';

const Task = () => {
	const { task, history, isLoading, errorMessage } = useTask();

	if (isLoading) return <p>Loading…</p>;
	if (errorMessage || !task) return <p>{errorMessage ?? 'Task not found'}</p>;

	return (
		<div className="tms-task-page">
			<div className="tms-task-page__header">
				<Link to="/">← Back to tasks</Link>
				<h1 className="tms-task-page__header-title">{task.task_id}</h1>
			</div>

			<dl className="tms-task-page__details">
				<div>
					<dt>Type</dt>
					<dd>{task.task_type}</dd>
				</div>
				<div>
					<dt>Status</dt>
					<dd>
						<span className="tms-status" data-status={task.status}>
							{task.status}
						</span>
					</dd>
				</div>
				<div>
					<dt>Planned start</dt>
					<dd>{formatDateTime(task.planned_start)}</dd>
				</div>
				<div>
					<dt>Listing</dt>
					<dd>{task.listing_id ?? '—'}</dd>
				</div>
				<div>
					<dt>Reservation</dt>
					<dd>{task.reservation_id ?? '—'}</dd>
				</div>
			</dl>

			{task.linen && <LinenDetails linen={task.linen} />}

			<LinenHistory history={history} />
		</div>
	);
};

export default Task;
