import * as winston from 'winston';

/**
 * Creates a logger that prints readable lines locally and JSON everywhere else.
 *
 * @param loggerName - a name added to every message, e.g. `task.controller`
 */
export const createLogger = (loggerName: string): winston.Logger =>
	winston.createLogger({
		level: 'info',
		defaultMeta: { name: loggerName },
		transports: [new winston.transports.Console()],
		format: winston.format.combine(
			winston.format.timestamp(),
			(process.env.ENV_NAME ?? 'local') === 'local'
				? winston.format.printf(({ level, message, timestamp, name, ...rest }) => {
						const otherInfo = Object.keys(rest).length ? JSON.stringify(rest) : '';
						return `[${level.toUpperCase()}] [${timestamp}] [${name}] ${message} ${otherInfo}`;
					})
				: winston.format.json(),
		),
	});

export const sanitize = (input: string) => input.replaceAll(/[<>"&']/gim, '');
