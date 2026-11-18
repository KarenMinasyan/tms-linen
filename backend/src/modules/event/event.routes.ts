import { Router } from 'express';
import { receiveReservationEvent } from './event.controller';
import { validateReservationEvent } from './event.middleware';

const eventRouter = Router();

eventRouter.post('/reservation', validateReservationEvent, receiveReservationEvent);

export { eventRouter };
