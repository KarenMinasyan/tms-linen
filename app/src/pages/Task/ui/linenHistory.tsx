import type { ILinenHistory } from '@/types';
import { formatDateTime } from '@/utils';
import { LINEN_LABELS } from '../constants';
import { getLinenChanges } from '../lib';

interface ILinenHistoryProps {
	history: ILinenHistory[];
}

const LinenHistory = ({ history }: ILinenHistoryProps) => (
	<section className="tms-linen-history">
		<h2 className="tms-linen-history__title">Change history</h2>

		{!history.length && <p className="tms-linen-history__empty">No changes yet.</p>}

		<ol className="tms-linen-history__list">
			{history.map((entry) => {
				const changes = getLinenChanges(entry);

				return (
					<li key={entry.id} className="tms-linen-history__list-entry">
						<div className="tms-linen-history__list-entry__header">
							<span>{formatDateTime(entry.created_at)}</span>
							<strong>{entry.reason}</strong>
							{entry.event_id && <code>{entry.event_id}</code>}
						</div>

						{changes.length ? (
							<table className="tms-linen-history__list-entry__changes">
								<tbody>
									{changes.map(({ field, oldValue, newValue }) => (
										<tr key={field}>
											<td>{LINEN_LABELS[field]}</td>
											<td>{oldValue}</td>
											<td>→</td>
											<td>{newValue}</td>
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<p className="tms-linen-history__list-entry__unchanged">
								Recalculated, nothing changed.
							</p>
						)}
					</li>
				);
			})}
		</ol>
	</section>
);

export default LinenHistory;
