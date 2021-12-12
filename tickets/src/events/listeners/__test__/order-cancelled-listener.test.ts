import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { OrderCancelledListener } from "../order-cancelled-listener";
import { OrderCancelledEvent } from "@the-future-retro/tickets-common";
import { natsWrapper } from "../../../nats-wrapper";
import { Ticket } from "../../../models/ticket";

const setup = async () => {
    // Create an instance of the listener
    const listener = new OrderCancelledListener(natsWrapper.client);

    const orderId = new mongoose.Types.ObjectId().toHexString();
    // Create and save a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 15,
        userId: new mongoose.Types.ObjectId().toHexString()
    });

    ticket.set({orderId});

    await ticket.save();

    const data: OrderCancelledEvent['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return { listener, ticket, data, msg, orderId };
}

it('updates the ticket', async () => {
    const { listener, ticket, orderId, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket =  await Ticket.findById(ticket);

    expect(updatedTicket!.orderId).not.toBeDefined();
});

it('acks the message', async () => {
    const { listener, ticket, orderId, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
})

it('publishes a ticket updated event', async () => {
    const { listener, ticket, orderId, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});