import mongoose from 'mongoose';
import request from 'supertest';
import { OrderStatus } from '@the-future-retro/tickets-common';
import { app } from '../../app';
import { Order } from '../../models/order';
import { stripe } from '../../stripe';
import { Payment } from '../../models/payment';

//jest.mock('../../stripe');

it('returns a 404 when purchasing an order that does not exist', async () => {
    await request(app)
      .post('/api/payments')
      .set('Cookie', await global.getAuthCookie())
      .send({
        token: 'thisisajibberishtoken',
        orderId: new mongoose.Types.ObjectId().toHexString()
      })
      .expect(404);
});

it('returns a 401 when purchasing an order that does not belong to the signed in user', async () => {
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: new mongoose.Types.ObjectId().toHexString(),
        price: 20,
        status: OrderStatus.Created
    });

    await order.save();
    
    await request(app)
      .post('/api/payments')
      .set('Cookie', await global.getAuthCookie())
      .send({
        token: 'thisisajibberishtoken',
        orderId: order.id
      })
      .expect(401);
});

it('returns a 400 when purchasing a cancelled order', async () => {
    const userId = new mongoose.Types.ObjectId().toHexString();
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        userId: userId,
        price: 20,
        status: OrderStatus.Cancelled
    });

    await order.save();

    await request(app)
      .post('/api/payments')
      .set('Cookie', await global.getAuthCookie(userId))
      .send({
        token: 'thisisajibberishtoken',
        orderId: order.id
      })
      .expect(400);
});

it('returns a 201 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString();
  const order = Order.build({
      id: new mongoose.Types.ObjectId().toHexString(),
      version: 0,
      userId: userId,
      price: 20,
      status: OrderStatus.Created
  });

  await order.save();

  await request(app)
    .post('/api/payments')
    .set('Cookie', await global.getAuthCookie(userId))
    .send({
      token: 'tok_visa', //Test token that always works for stripe lecture 460
      orderId: order.id
    })
    .expect(201);

  /* Old mocked version
  const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0];
  expect(chargeOptions.source).toEqual('tok_visa');
  expect(chargeOptions.amount).toEqual(order.price*100);
  expect(chargeOptions.currency).toEqual('usd');*/

  const stripeCharges = await stripe.charges.list({ limit: 50 });

  const stripeCharge = stripeCharges.data.find(charge =>{
    return charge.metadata.user_id === userId && charge.metadata.order_id === order.id
  });

  expect(stripeCharge).toBeDefined();
  expect(stripeCharge!.amount).toEqual(order.price*100);
  expect(stripeCharge!.currency).toEqual('usd');

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id
  });

  expect(payment).not.toBeNull();
  expect(payment!.version).toBeGreaterThanOrEqual(0);
});