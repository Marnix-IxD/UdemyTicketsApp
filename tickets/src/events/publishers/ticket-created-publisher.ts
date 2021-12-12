import { Publisher, Subjects, TicketCreatedEvent } from '@the-future-retro/tickets-common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
  readonly subject = Subjects.TicketCreated;
}