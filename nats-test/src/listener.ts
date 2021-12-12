import nats from 'node-nats-streaming';
import { randomBytes } from 'crypto';
import { TicketCreatedListener } from './events/ticket-created-listener';
//kubectl get pods
//Port forwarding: kubectl port-forward <insert pod id> 4222:4222
//Port forwarding: kubectl port-forward <insert pod id> 8222:8222
//Monitoring http://localhost:8222/streaming/channelsz?subs=1
console.clear();

const stan = nats.connect('ticketapp', randomBytes(4).toString('hex'), {
  url: 'http://localhost:4222'
});

stan.on('connect',()=>{
  console.log('Listener connected to NATS');

  stan.on('close', ()=>{
    console.log('Closing NATS streaming connection');
    process.exit();
  });

  new TicketCreatedListener(stan).listen();
});

process.on('SIGINT', () => stan.close());
process.on('SIGTERM', () => stan.close());

