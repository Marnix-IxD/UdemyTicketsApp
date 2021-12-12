import request from 'supertest';
import { app } from '../../app';

it('Returns a 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);
});

it('Returns a 400 on invalid e-mail usage during signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test.com',
      password: 'password'
    })
    .expect(400);
});

it('Returns a 400 on an invalid password during signup', async () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'test.com',
      password: '2'
    })
    .expect(400);
});

it('Returns a 400 on missing either the e-mail or password attribute', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com'
    })
    .expect(400);

  await request(app)
    .post('/api/users/signup')
    .send({
      password: 'password'
    })
    .expect(400);
});

it('Disallows the usage of duplicate e-mail addresses', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(400);
});

it('A cookie is set after successful signup', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'test@test.com',
      password: 'password'
    })
    .expect(201);
  
  expect(response.get('Set-Cookie')).toBeDefined();
});