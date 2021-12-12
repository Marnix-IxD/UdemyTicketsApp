import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';

import cookieSession from 'cookie-session';

import { errorHandler, NotFoundError, currentUser } from '@the-future-retro/tickets-common';

import { createOrderRouter } from './routes/new';
import { showOrderRouter } from './routes/show';
import { indexOrderRouter } from './routes/index';
import { patchOrderRouter } from './routes/patch';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test'
  })
);
//Use currentUser always after the cookie check first otherwise it won't work.
app.use(currentUser);

app.use(createOrderRouter);
app.use(showOrderRouter);
app.use(indexOrderRouter);
app.use(patchOrderRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };