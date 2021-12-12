import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose, { mongo } from 'mongoose';
import { Order, OrderStatus } from '../../models/order';
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

it('marks an order as cancelled', async () => {
  // create a ticket with Ticket model
  const ticket = await buildTicket();
  const user = await global.getAuthCookie();

  // make a request to create an order
  const { body: newOrder } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make a request to cancel the order
  await request(app)
    .patch(`/api/orders/${newOrder.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  // expectation to make sure the thing is cancelled
  const updatedOrder = await Order.findById(newOrder.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
})

it('returns a 404 if the order is not found', async () => {
  //Generate a real id based on Mongo requirements
  const id = new mongoose.Types.ObjectId().toHexString();
  const user = await global.getAuthCookie();

  await request(app)
    .patch(`/api/orders/${id}`)
    .set('Cookie', user)
    .send()
    .expect(404);

});

it('emits an order cancelled event', async () => {
  // create a ticket with Ticket model
  const ticket = await buildTicket();
  const user = await global.getAuthCookie();

  // make a request to create an order
  const { body: newOrder } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  // make a request to cancel the order
  await request(app)
    .patch(`/api/orders/${newOrder.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});