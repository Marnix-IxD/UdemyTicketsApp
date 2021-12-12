import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { natsWrapper } from '../../nats-wrapper';

it(`returns a 404 if the provided ticket id doesn't exist`, async () =>{
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', await global.getAuthCookie())
    .send({
      title: 'This ticket should not exist in the system',
      price: 40
    })
    .expect(404);
});

it(`returns a 401 if the user is not authenticated`, async () =>{
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'This ticket should not be allowed to be added in the database',
      price: 15
    })
    .expect(401);
});

it(`returns a 401 if the user doesn't own the ticket`, async () =>{
  const title = 'We will try to update this ticket by someone who is not the owner';

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', await global.getAuthCookie())
    .send({
      title,
      price: 10
    });
  
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', await global.getAuthCookie())
    .send({
      title: 'This title should never be set',
      price: 5
    })
    .expect(401);
});

it(`returns a 400 if the user provides an invalid title or price`, async () =>{
  const cookie = await global.getAuthCookie();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie )
    .send({
      title: 'This ticket will be attempted to be overwritten with jibberish',
      price: 10
    });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: ' ',
      price: 20
    })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: null,
      price: 20
    })
    .expect(400);
   
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'This has an invalid price',
      price: -20
    })
    .expect(400);
});

it(`updates the ticket with provided valid inputs`, async () =>{
  const cookie = await global.getAuthCookie();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie )
    .send({
      title: 'This ticket will be successfully edited',
      price: 10
    });
  
  const updatedTitle = 'This ticket has been updated!';  
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: updatedTitle,
      price: 100
    })
    .expect(200)
  
  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();
  
  expect(ticketResponse.body.title).toEqual(updatedTitle);
  expect(ticketResponse.body.price).toEqual(100);
});

it('publishes an event', async () => {
  const cookie = await global.getAuthCookie();
  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie )
    .send({
      title: 'This ticket will be successfully edited',
      price: 10
    });
  
  const updatedTitle = 'This ticket has been updated!';  
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: updatedTitle,
      price: 100
    })
    .expect(200)
  
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it('rejects updates if the ticket is reserved', async () => {
  const cookie = await global.getAuthCookie();

  const response = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie )
    .send({
      title: 'We will not allow this ticket to be edited',
      price: 10
    });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  const updatedTitle = 'This ticket will not be updated!';  
  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: updatedTitle,
      price: 100
    })
    .expect(400);

});