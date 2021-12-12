import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { PasswordHandler } from '../services/password-handler';
import { User } from '../models/user';
import { validateRequest, BadRequestError } from '@the-future-retro/tickets-common';

const router = express.Router();

router.post('/api/users/signin', 
  [
    body('email')
      .isEmail()
      .withMessage('Please provide the e-mail address for your account.'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Please provide your password.')
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const{ email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if(!existingUser){
      throw new BadRequestError('The given credentials are invalid.');
    }

    const passwordsMatch = await PasswordHandler.compare(existingUser.password, password);
    if(!passwordsMatch){
      throw new BadRequestError('The given credentials are invalid.');
    }

    //Generate JWT
    const userJWT = jwt.sign({
        id: existingUser.id,
        email: existingUser.email
      },
      process.env.JWT_KEY! //the exclamation mark tells TypeScript we've already checked this in index.ts
    );

    //Store it on the session object
    req.session = {
      jwt: userJWT
    };

    res.status(200).send(existingUser);
  }
);

export { router as signinRouter };