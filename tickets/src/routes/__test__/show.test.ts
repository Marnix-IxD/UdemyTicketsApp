import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import mongoose, { mongo } from 'mongoose';

it('returns a 404 if the ticket is not found', async () =>{
  //Generate a real id based on Mongo requirements
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .get(`/api/tickets/${id}`)
    .send()
    .expect(404);
});

it('returns the ticket if the ticket has been found', async () =>{
  const title = 'Testing concert';
  const price = 20;

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', await global.getAuthCookie())
    .send({
      title, price
    })
    .expect(201);
  
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);
  
  expect(ticketResponse.body.title).toEqual(title);
  expect(ticketResponse.body.price).toEqual(price);
});