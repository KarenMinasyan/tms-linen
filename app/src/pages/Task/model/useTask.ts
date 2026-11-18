import { useParams } from 'react-router-dom';
import { useGetTaskLinenHistoryQuery, useGetTaskQuery } from '@/store';
import { getErrorMessage } from '@/utils';

export const useTask = () => {
	const { id = '' } = useParams();

	const { data: task, isLoading: isTaskLoading, error: taskError } = useGetTaskQuery(id);
	const {
		data: history = [],
		isLoading: isHistoryLoading,
		error: historyError,
	} = useGetTaskLinenHistoryQuery(id);

	return {
		task,
		history,
		isLoading: isTaskLoading || isHistoryLoading,
		errorMessage: getErrorMessage(taskError ?? historyError),
	};
};
