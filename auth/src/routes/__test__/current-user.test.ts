import request from 'supertest';
import { app } from '../../app';

it('Returns the details of the current user on request', async () => {
  const cookie = await global.getAuthCookie();

  const response = await request(app)
    .get('/api/users/currentuser')
    .set('Cookie', cookie)
    .send()
    .expect(200);
  
  expect(response.body.currentUser.email).toEqual('test@test.com');
});

it('Returns null when authentication fails for the current user', async () =>{
  const response = await request(app)
    .get('/api/users/currentuser')
    //.set('Cookie', cookie)
    .send()
    .expect(200);

  expect(response.body.currentUser).toEqual(null);
});