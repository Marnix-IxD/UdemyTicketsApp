import mongoose, { ConnectOptions } from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';
import { OrderCreatedListener } from './events/listeners/order-created-listener';

const startUpApp = async () => {
  console.log('Starting up Payments Microservice...');
  //Start checking ENV variables being set before startup
  if(!process.env.NATS_CLIENT_ID){
    throw new Error('NATS_CLIENT_ID has not been defined in the deployment package, check infra/k8s');
  }

  if(!process.env.NATS_URL){
    throw new Error('NATS_URL has not been defined in the deployment package, check infra/k8s');
  }

  if(!process.env.NATS_CLUSTER_ID){
    throw new Error('NATS_CLUSTER_ID has not been defined in the deployment package, check infra/k8s');
  }

  if(!process.env.JWT_KEY){
    throw new Error('JWT_KEY has not been defined in the deployment package, check infra/k8s');
  }

  if(!process.env.MONGO_URI){
    throw new Error('MONGO_URI has not been defined in the deployment package, check infra/k8s');
  }

  try{
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID, 
      process.env.NATS_CLIENT_ID, 
      process.env.NATS_URL
    );

    natsWrapper.client.on('close', ()=>{
      console.log('Payments microservice is closing NATS streaming connection');
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI/*, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    } as ConnectOptions*/);
    console.log('Payments microservice connected to MongoDB');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () =>{
    console.log('Payments microservice listening on port 3000');
  });
}

startUpApp();