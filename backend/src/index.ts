import { createLogger } from '@/common/utils';
import { config } from '@/config';
import { db } from '@/providers';
import { app } from './app';

const logger = createLogger('entrypoint');

const start = async () => {
	await db.$connect();
	logger.info('Connected to MySQL');

	const server = app.listen(config.PORT, () => {
		logger.info(`Server is running on port ${config.PORT}`);
	});

	const handleShutdown = (exitCode: number) => {
		logger.info('Closing server gracefully...');
		server.close(() => {
			db.$disconnect()
				.then(() => logger.info('MySQL connection closed'))
				.catch((error) => logger.error('Failed to close MySQL connection', { error }))
				.finally(() => process.exit(exitCode));
		});
	};

	process.on('SIGINT', () => handleShutdown(0));
	process.on('SIGTERM', () => handleShutdown(0));

	process.on('unhandledRejection', (reason) => {
		logger.error('Unhandled promise rejection', { reason });
	});
};

start().catch((error) => {
	logger.error('Error starting the server', { error: error?.message ?? error });
	process.exit(1);
});
