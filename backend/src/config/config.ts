import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const getEnvValue = (name: string) => {
	const value = process.env[name];
	if (value === undefined || value === '') {
		throw new Error(`Missing environment variable: ${name}`);
	}
	return value;
};

const config = {
	ENV_NAME: process.env.ENV_NAME || 'local',
	PORT: process.env.PORT ? parseInt(process.env.PORT) : 4000,
	DATABASE_URL: getEnvValue('DATABASE_URL'),
};

export { config };
