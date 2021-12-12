import request from 'supertest';
import { app } from '../../app';

const createTestTicket = async () =>{
  return request(app)
  .post('/api/tickets')
  .set('Cookie', await global.getAuthCookie())
  .send({
    title:'This is another testing ticket',
    price: 30
  });
}

it('can fetch a list of tickets', async () =>{
  await createTestTicket();
  await createTestTicket();
  await createTestTicket();

  const response = await request(app)
    .get('/api/tickets')
    .send()
    .expect(200);
  
  expect(response.body.length).toEqual(3);
})