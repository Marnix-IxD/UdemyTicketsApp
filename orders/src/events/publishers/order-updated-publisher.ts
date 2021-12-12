import { Publisher, OrderUpdatedEvent, Subjects } from '@the-future-retro/tickets-common';

export class OrderUpdatedPublisher extends Publisher<OrderUpdatedEvent> {
    subject: Subjects.OrderUpdated = Subjects.OrderUpdated;
}