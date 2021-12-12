import mongoose from 'mongoose';

import { app } from './app';

const startUpApp = async () => {
  console.log('Starting up Auth Microservice...');
  //Start checking ENV variables being set before startup
  if(!process.env.JWT_KEY){
    throw new Error('JWT_KEY has not been defined in the deployment package, check infra/k8s');
  }

  if(!process.env.MONGO_URI){
    throw new Error('MONGO_URI has not been defined in the deployment package, check infra/k8s');
  }

  try{
    await mongoose.connect(process.env.MONGO_URI/*, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    } as ConnectOptions*/);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () =>{
    console.log('Auth microservice listening on port 3000');
  });
}

startUpApp();