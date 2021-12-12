import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose, { mongo } from 'mongoose';

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

it('fetches the order' , async () => {
    //Create a ticket
    const ticket = await buildTicket();
    const user = await global.getAuthCookie();

    //Make a request to build an order with this ticket
    const { body: newOrder } = await request(app)
      .post('/api/orders')
      .set('Cookie', user)
      .send({ ticketId: ticket.id })
      .expect(201);

    //Make request to fetch the order
    const { body: fetchedOrder} = await request(app)
      .get(`/api/orders/${newOrder.id}`)
      .set('Cookie', user)
      .send()
      .expect(200);
    
    expect(fetchedOrder.id).toEqual(newOrder.id);
});

it(`returns an error if an user tries to fetch another user's order` , async () => {
  //Create a ticket
  const ticket = await buildTicket();
  const user = await global.getAuthCookie();

  //Make a request to build an order with this ticket
  const { body: newOrder } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201);

  //Make request to fetch the order
  await request(app)
    .get(`/api/orders/${newOrder.id}`)
    .set('Cookie', await global.getAuthCookie())
    .send()
    .expect(401);
});

it('returns a 404 if the order is not found', async () => {
    //Generate a real id based on Mongo requirements
    const id = new mongoose.Types.ObjectId().toHexString();
    const user = await global.getAuthCookie();

    await request(app)
      .get(`/api/orders/${id}`)
      .set('Cookie', user)
      .send()
      .expect(404);
    
});
  