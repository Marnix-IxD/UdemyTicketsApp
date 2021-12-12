import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import jwt from 'jsonwebtoken';

import { validateRequest, BadRequestError } from '@the-future-retro/tickets-common';
import { User } from '../models/user';

const router = express.Router();

router.post('/api/users/signup', [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid e-mail address.'),
    body('password')
      .trim()
      .isLength({min: 4, max: 40})
      .withMessage('Please provide a password with a minimum length of 4, and a maximum of 40 characters')
  ],
  validateRequest, 
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if( existingUser ) {
      throw new BadRequestError('E-mail is already in use.');
    }

    const user = User.build({ email, password });
    await user.save();

    //Generate JWT
    const userJWT = jwt.sign({
        id: user.id,
        email: user.email
      },
      process.env.JWT_KEY! //the exclamation mark tells TypeScript we've already checked this in index.ts
    );

    //Store it on the session object
    req.session = {
      jwt: userJWT
    };

    res.status(201).send(user);
});

export { router as signupRouter };