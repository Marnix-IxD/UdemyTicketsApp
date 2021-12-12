import { Message } from 'node-nats-streaming';
import { Listener, OrderCreatedEvent, Subjects } from "@the-future-retro/tickets-common";
import { queueGroupName } from "./queueGroupName";
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
        const order = Order.build({
            id: data.id,
            version: data.version,
            userId: data.userId,
            status: data.status,
            price: data.ticket.price
        });

        await order.save();

        msg.ack();
    }
}