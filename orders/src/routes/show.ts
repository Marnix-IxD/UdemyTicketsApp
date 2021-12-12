import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { NotAuthorizedError, NotFoundError, validateRequest, requireAuth } from '@the-future-retro/tickets-common';
import { param } from 'express-validator';
import { Order } from '../models/order';

const router = express.Router();

router.get('/api/orders/:id', requireAuth , 
  [ 
    param('id')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('Order ID must be provided')
  ], 
  validateRequest,
  async (req: Request, res: Response) =>{
    const order = await Order.findById(req.params.id).populate('ticket');

    if (!order){
      throw new NotFoundError();
    }
    if (order.userId !== req.currentUser!.id){
      throw new NotAuthorizedError();
    }

    res.send(order);
  }
);

export { router as showOrderRouter };