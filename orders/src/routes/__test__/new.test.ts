import mongoose from 'mongoose';
import request from 'supertest';
import { app } from '../../app';
import { Order, OrderStatus } from '../../models/order';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

const buildTicket = async () => {
  const ticketId = new mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    id: ticketId,
    title: 'concert',
    price: 20
  });
  await ticket.save();
  return ticket;
}

it('returns an error if the ticket does not exist', async () => {
  const ticketId = new mongoose.Types.ObjectId();
  await request(app)
    .post('/api/orders')
    .set('Cookie', await global.getAuthCookie())
    .send({
      ticketId
    })
    .expect(404);
});

it('returns an error if the ticket is already reserved by another user', async () => {
  const ticket = await buildTicket();
  await ticket.save();

  const order = Order.build({
    ticket,
    userId: 'test_user_id',
    status: OrderStatus.Created,
    expiresAt: new Date()
  });
  await order.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', await global.getAuthCookie())
    .send({
      ticketId: ticket.id
    })
    .expect(400);
});

it('reserves a ticket', async () => {
  const ticket = await buildTicket();
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', await global.getAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(201);
});

it('emits an order created event', async () => {
  const ticket = await buildTicket();
  await ticket.save();

  await request(app)
    .post('/api/orders')
    .set('Cookie', await global.getAuthCookie())
    .send({ ticketId: ticket.id })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
