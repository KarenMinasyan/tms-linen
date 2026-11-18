import { defineConfig, env } from 'prisma/config';

import 'dotenv/config';

// Paths are resolved relative to this file.
export default defineConfig({
	schema: '../database/prisma/schema.prisma',
	migrations: {
		path: '../database/prisma/migrations',
		seed: 'tsx src/database/seed.ts',
	},
	datasource: {
		url: env('DATABASE_URL'),
	},
});
