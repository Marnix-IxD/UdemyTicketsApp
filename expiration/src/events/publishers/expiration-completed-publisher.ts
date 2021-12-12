import { Subjects, Publisher, ExpirationCompleteEvent } from "@the-future-retro/tickets-common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}