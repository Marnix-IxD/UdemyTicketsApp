import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { TicketCreatedListener } from './events/listeners/ticket-created-listener';
import { TicketUpdatedListener } from './events/listeners/ticket-updated-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-completed-listener';
import { PaymentCreatedListener } from './events/listeners/payment-created-listener';

const startUpApp = async () => {
  console.log('Starting up orders microservice...');

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
      console.log('Orders microservice is closing NATS streaming connection');
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketUpdatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI/*, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    } as ConnectOptions*/);
    console.log('Orders microservice connected to MongoDB');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () =>{
    console.log('Orders microservice listening on port 3000');
  });
}

startUpApp();