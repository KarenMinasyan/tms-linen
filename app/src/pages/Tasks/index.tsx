import { Link } from 'react-router-dom';
import { formatDateTime } from '@/utils';
import { useTasks } from './model';

const Tasks = () => {
	const { tasks, isLoading, errorMessage } = useTasks();

	if (isLoading) return <p>Loading…</p>;
	if (errorMessage) return <p>{errorMessage}</p>;

	return (
		<div className="tms-tasks-page">
			<h1 className="tms-tasks-page__title">Tasks</h1>

			<table className="tms-tasks-page__table">
				<thead>
					<tr>
						<th>Task</th>
						<th>Type</th>
						<th>Status</th>
						<th>Planned start</th>
						<th>Reservation</th>
						<th>Linen</th>
					</tr>
				</thead>
				<tbody>
					{tasks.map(({ task_id, task_type, status, planned_start, reservation_id, linen }) => (
						<tr key={task_id}>
							<td>
								<Link to={`/tasks/${task_id}`}>{task_id}</Link>
							</td>
							<td>{task_type}</td>
							<td>
								<span className="tms-status" data-status={status}>
									{status}
								</span>
							</td>
							<td>{formatDateTime(planned_start)}</td>
							<td>{reservation_id ?? '—'}</td>
							<td>
								{linen
									? `${linen.sheets} sheets · ${linen.towels} towels · ${linen.prepared_for_guests} guests`
									: '—'}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default Tasks;
