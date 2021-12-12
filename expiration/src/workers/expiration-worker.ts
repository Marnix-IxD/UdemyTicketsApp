import { redisConfig } from '../redis-config';
import { expirationQueue, Payload } from '../queues/expiration-queue';
import { Worker, Job } from 'bullmq';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-completed-publisher';
import { natsWrapper } from '../nats-wrapper';

const expirationWorker = new Worker<Payload>(expirationQueue.name, async (job: Job) => {
    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId: job.data.orderId
    });
},{
    connection: redisConfig
});

expirationWorker.on('completed', (job: Job, returnvalue: any) => {
    console.log('Expiration event publish completed on', new Date());
});

expirationWorker.on('error', err => {
    console.error(err);
});

export { expirationWorker };