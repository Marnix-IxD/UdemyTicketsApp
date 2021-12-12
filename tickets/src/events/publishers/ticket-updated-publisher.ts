import { Publisher, Subjects, TicketUpdatedEvent } from '@the-future-retro/tickets-common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent>{
  readonly subject = Subjects.TicketUpdated;
}