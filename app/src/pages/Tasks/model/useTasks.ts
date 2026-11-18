import { useGetTasksQuery } from '@/store';
import { getErrorMessage } from '@/utils';

export const useTasks = () => {
	const { data: tasks = [], isLoading, error } = useGetTasksQuery();

	return { tasks, isLoading, errorMessage: getErrorMessage(error) };
};
