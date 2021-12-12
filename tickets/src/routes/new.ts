import express, { Request, Response } from 'express';
import db from 'mongoose';
import { body } from 'express-validator';
import { requireAuth, validateRequest, DatabaseConnectionError} from '@the-future-retro/tickets-common';
import { Ticket } from '../models/ticket';
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/tickets', requireAuth, [
  body('title').not().isEmpty().withMessage('Title is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be greater than 0')
], validateRequest, async (req: Request, res: Response) => {
  const { title, price } = req.body;

  const ticket = Ticket.build({
    title,
    price,
    //RequireAuth middleware already checks currentUser availability
    userId: req.currentUser!.id
  });

  //Initialize MongoDB transaction
  const SESSION = await db.startSession();
  await SESSION.startTransaction();

  //Transaction execution
  try{
    await ticket.save();
    await new TicketCreatedPublisher(natsWrapper.client).publish({
      userId: ticket.userId,
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      version: ticket.version
    });

    await SESSION.commitTransaction();
    res.status(201).send(ticket);
  } catch (err) {
    // Catch any errors during failed transaction
    await SESSION.abortTransaction();
    throw new DatabaseConnectionError();
  } finally {
    // Close MongoDB session
    SESSION.endSession();
  }

});

export { router as createTicketRouter };