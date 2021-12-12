import nats from 'node-nats-streaming';
import { TicketCreatedPublisher } from './events/ticket-created-publisher';

console.clear();

//CLASS 279 Client ID generation
const stan = nats.connect('ticketapp', 'abc', {
  url: 'http://localhost:4222'
});

stan.on('connect', async () =>{
  console.log(`Publisher connected to NATS.`);
  const publisher = new TicketCreatedPublisher(stan);
  try {
    await publisher.publish({
      id: '123',
      title: 'concert',
      price: 20
    });
  } catch (err) {
    console.error(err);
  }

  /*const data = JSON.stringify({
    id: '214',
    title: 'concert',
    price: 20
  });

  stan.publish('ticket:created', data, ()=>{
    console.log('Event published: Ticket Created')
  });*/
});