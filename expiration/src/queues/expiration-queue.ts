import { Queue, QueueScheduler} from 'bullmq';
import { redisConfig } from '../redis-config';

interface Payload {
    orderId: string;
}

const expirationQueueScheduler = new QueueScheduler('order:expiration', { connection: redisConfig });
const expirationQueue = new Queue<Payload>('order:expiration', { connection: redisConfig });

export { expirationQueue, expirationQueueScheduler, Payload};