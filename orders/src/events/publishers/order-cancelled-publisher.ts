import { Subjects, Publisher, OrderCancelledEvent } from '@the-future-retro/tickets-common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent>{ 
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
