import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
    // Create an instance of a ticket
    const ticket = Ticket.build({
        title: 'concert',
        price: 5,
        userId: '123'
    })

    // Save the ticket to the database
    await ticket.save();

    // Fetch the ticket twice
    const firstTicketInstance = await Ticket.findById(ticket.id);
    const secondTicketInstance = await Ticket.findById(ticket.id);

    // Make two seperate changes to the tickets we fetched
    firstTicketInstance!.set({ price: 10 });
    secondTicketInstance!.set({ price: 15});

    // Save the first fetched ticket
    await firstTicketInstance!.save();

    // Save the second fetched ticket and expect an error
    try {
        await secondTicketInstance!.save();
    } catch (err) {
        return;
    }

    throw new Error(`Shouldn't ever reach this point in the code`);
});

it('increments the version number on multiple saves', async () => {
    const ticket = Ticket.build({
        title: 'concert',
        price: 5,
        userId: '123'
    })

    await ticket.save();
    expect(ticket.version).toEqual(0);
    await ticket.save();
    expect(ticket.version).toEqual(1);
    await ticket.save();
    expect(ticket.version).toEqual(2);
});