import { Subjects, Publisher, PaymentCreatedEvent } from '@the-future-retro/tickets-common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}