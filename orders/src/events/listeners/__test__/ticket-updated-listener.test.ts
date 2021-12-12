import { Message } from 'node-nats-streaming';
import mongoose from 'mongoose';
import { TicketUpdatedEvent } from "@the-future-retro/tickets-common";
import { TicketUpdatedListener } from "../ticket-updated-listener";
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
    // Create a listener
    const listener = new TicketUpdatedListener(natsWrapper.client);

    // Create and save a ticket
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 10 
    });

    await ticket.save();

    // Create a fake data object
    const data: TicketUpdatedEvent['data'] = {
        version: ticket.version + 1,
        id: ticket.id,
        title: 'new concert',
        price: 20,
        userId: new mongoose.Types.ObjectId().toHexString()
    };

    // Create a fake message object
    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    // Return all of this stuff
    return { listener, ticket, data, msg };
}

it('finds, updates and saves a ticket', async () => {
    const { listener, ticket, data, msg } = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure a ticket was created
    const updatedTicket = await Ticket.findById(ticket.id);
    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.version).toEqual(data.version);
});

it('acks the message', async () => {
    const { listener, ticket, data, msg } = await setup();

    // Call the onMessage function with the data object + message object
    await listener.onMessage(data, msg);

    // Write assertions to make sure ack function was called
    expect(msg.ack).toHaveBeenCalled();
});

it('does not call ack if the event has a skipped version numer', async () => {
    const { listener, ticket, data, msg } = await setup();

    // Set the version on data to an incorrect version number resulting in an error in ticket updated listener.
    data.version = 10;

    try {
        await listener.onMessage(data, msg);
    } catch (error) {
        
    }

    expect(msg.ack).not.toHaveBeenCalled();
});