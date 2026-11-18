import cors from 'cors';
import express from 'express';
import { httpErrorHandler, notFoundError } from '@/common/exceptions';
import { db } from '@/providers';
import apiRouter from './router';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', async (_req, res) => {
	await db.$queryRaw`SELECT 1`;
	res.status(200).send('OK');
});

app.use(apiRouter);

app.use((req, _res, next) => next(notFoundError(`Route ${req.method} ${req.path} not found`)));

app.use(httpErrorHandler);

export { app };
