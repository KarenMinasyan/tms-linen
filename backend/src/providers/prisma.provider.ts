import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { config } from '@/config';
import { PrismaClient } from '@/database';

const databaseUrl = new URL(config.DATABASE_URL);

const adapter = new PrismaMariaDb({
	host: databaseUrl.hostname,
	port: databaseUrl.port ? parseInt(databaseUrl.port) : 3306,
	user: decodeURIComponent(databaseUrl.username),
	password: decodeURIComponent(databaseUrl.password),
	database: databaseUrl.pathname.slice(1),
	// MySQL 8 uses caching_sha2_password; without TLS the driver must fetch the server's public key.
	allowPublicKeyRetrieval: true,
});

const db = new PrismaClient({ adapter });

export { db };
