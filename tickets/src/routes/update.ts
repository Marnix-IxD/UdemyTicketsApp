import express, { Request, Response } from 'express';
import db from 'mongoose';
import { body } from 'express-validator';
import { requireAuth, validateRequest, NotFoundError, NotAuthorizedError, DatabaseConnectionError, BadRequestError } from '@the-future-retro/tickets-common';
import { Ticket } from '../models/ticket';
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put('/api/tickets/:id', 
  requireAuth,
  [
    body('title').trim().not().isEmpty().withMessage('Title is required'),
    body('price').isFloat({gt: 0}).withMessage('Price must be greater than 0')
  ],
  validateRequest, 
  async ( req: Request, res: Response ) =>{
    const ticket = await Ticket.findById(req.params.id);

    if(!ticket){
      throw new NotFoundError();
    }

    if(ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if(ticket.orderId){
      throw new BadRequestError('Cannot edit a reserved ticket');
    }

    ticket.set({
      title: req.body.title,
      price: req.body.price
    });

    //Initialize MongoDB transaction
    const SESSION = await db.startSession();
    await SESSION.startTransaction();

    //Transaction execution
    try{
      //Persists changes to MongoDB, Class 267 also updates ticket in current context to be in perfect state.
      await ticket.save();
      await new TicketUpdatedPublisher(natsWrapper.client).publish({
        userId: ticket.userId,
        id: ticket.id,
        title: ticket.title,
        price: ticket.price,
        version: ticket.version
      });

      await SESSION.commitTransaction();
      res.send(ticket);

    } catch (err) {
      // Catch any errors during failed transaction
      await SESSION.abortTransaction();
      throw new DatabaseConnectionError();

    } finally {
      // Close MongoDB session
      SESSION.endSession();

    }
});

export { router as updateTicketRouter };