import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCreatedListener } from '../order-created-listener';
import { OrderCreatedEvent, OrderStatus } from '@the-future-retro/tickets-common';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // Create an instance of the listener
    const listener = new OrderCreatedListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 15,
        userId: new mongoose.Types.ObjectId().toHexString()
    });

    await ticket.save();

    // Create the fake data event

        const EXPIRATION_WINDOW_SECONDS = 15*60;
        // Calculate an expiration date for this order
        let expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS); 

        const data: OrderCreatedEvent['data'] = {
            id: new mongoose.Types.ObjectId().toHexString(),
            version: 0,
            status: OrderStatus.Created,
            expiresAt: expiration.toISOString(),
            userId: new mongoose.Types.ObjectId().toHexString(),
            ticket: {
                id: ticket.id,
                price: ticket.price
            }
        }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, ticket, data, msg };
}

it('sets the orderId of the ticket', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket =  await Ticket.findById(ticket);

    expect(updatedTicket!.orderId).toEqual(data.id);
});

it('acks the message', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})

it('publishes a ticket updated event', async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    // How to write tests in relation to mocked functions in Jest lecture 414
    const ticketUpdatedData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1]);
    expect(data.id).toEqual(ticketUpdatedData.orderId);
});