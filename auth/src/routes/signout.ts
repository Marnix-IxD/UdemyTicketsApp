import express from 'express';

const router = express.Router();

router.post('/api/users/signout', (req, res) => {
  //Cookie-session handles this.
  req.session = null;

  res.send({});
});

export { router as signoutRouter };