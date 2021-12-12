import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { NotAuthorizedError, NotFoundError, validateRequest, requireAuth } from '@the-future-retro/tickets-common';
import { param } from 'express-validator';
import { Order, OrderStatus } from '../models/order';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.patch('/api/orders/:id', requireAuth , 
  [ 
    param('id')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('Order ID must be provided')
  ], 
  validateRequest,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id).populate('ticket');

    if (!order){
      throw new NotFoundError();
    }
    if (order.userId != req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    // Publish an event saying this was cancelled!
    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      version: order.version,
      ticket: {
        id: order.ticket.id
      }
    });

    res.status(200).send(order);
});

export { router as patchOrderRouter };