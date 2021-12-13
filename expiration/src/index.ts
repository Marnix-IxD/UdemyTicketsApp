import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { expirationWorker } from './workers/expiration-worker';

const startUpApp = async () => {
  console.log('Starting up Expiration Microservice...');
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

  if(!process.env.REDIS_HOST){
    throw new Error('REDIS_HOST has not been defined in the deployment package, check infra/k8s');
  }

  try{
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID, 
      process.env.NATS_CLIENT_ID, 
      process.env.NATS_URL
    );

    natsWrapper.client.on('close', ()=>{
      console.log('Closing NATS streaming connection');
      process.exit();
    });

    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    expirationWorker;

    new OrderCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error(err);
  }
}

startUpApp();