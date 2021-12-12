import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from "@the-future-retro/tickets-common";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";
import { Order } from '../../../models/order';

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const data: OrderCreatedEvent['data'] = {
        version: 0,
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        expiresAt: new Date().toISOString(),
        ticket: {
            id: new mongoose.Types.ObjectId().toHexString(),
            price: 10
        }
    }

    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, data, msg }
}

it('replicates the order info', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data,msg);

    const order = await Order.findById(data.id);
    expect(order!.price).toEqual(data.ticket.price);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data,msg);
    
    expect(msg.ack).toHaveBeenCalled();
});