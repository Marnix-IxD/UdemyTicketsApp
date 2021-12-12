import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderStatus, PaymentCreatedEvent } from '@the-future-retro/tickets-common';
import { PaymentCreatedListener } from '../payment-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';

const setup = async () => {
    // Create the listener
    const listener = new PaymentCreatedListener(natsWrapper.client);

    // Create a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })

    await ticket.save();

    // Create an order
    const order = Order.build({
        userId: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        expiresAt: new Date(),
        ticket
    });

    await order.save();

    // Create a fake data object
    const data: PaymentCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        orderId: order.id,
        stripeId: 'asoifhdsoihfsfdsad'
    };

    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, ticket, order, data, msg };
};

it('updates the order status to complete', async () => {
    const { listener, order, data, msg } = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatus.Complete);
});

it('emits the OrderUpdated event', async () => {
    const { listener, order, data, msg } = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);
    
    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse(
       (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(eventData.id).toEqual(order.id);
});

it('acks the message', async () => {
    const { listener, data, msg } = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure ack function was called
    expect(msg.ack).toHaveBeenCalled();
});