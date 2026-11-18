import type { ITaskLinen } from '@/types';
import { LINEN_DETAILS_FIELDS, LINEN_LABELS } from '../constants';
import { formatLinenValue } from '../lib';

interface ILinenDetailsProps {
	linen: ITaskLinen;
}

const LinenDetails = ({ linen }: ILinenDetailsProps) => {
	const fields = LINEN_DETAILS_FIELDS.filter(
		(field) => field !== 'requested_sofabeds_count' || linen.requested_sofabeds_count > 0,
	);

	return (
		<section className="tms-linen-details">
			<h2 className="tms-linen-details__title">Linen</h2>

			<dl className="tms-linen-details__list">
				{fields.map((field) => (
					<div key={field} className="tms-linen-details__list-item">
						<dt>{LINEN_LABELS[field]}</dt>
						<dd>{formatLinenValue(linen[field])}</dd>
					</div>
				))}
			</dl>
		</section>
	);
};

export default LinenDetails;
