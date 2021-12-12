import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
import { Order, OrderStatus } from './order';

interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
 title: string;
 price: number;
 version: number;
 isReserved(): Promise<boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
 build(attrs: TicketAttrs): TicketDoc;
 findByEvent(event: { id: string, version: number }): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
  title:{
    type: String,
    required: true
  },
  price:{
    type: Number,
    required: true,
    min: 0
  }
},{
  toJSON: {
    transform(doc, ret){
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

/*  We could remove the dependency on updateIfCurrentPlugin so we have more control over the versioning.
ticketSchema.pre('save', function(done)  {
  // @ts-ignore

  this.$where = {
    version: this.get('version') -1
  };

  done();
})
*/


ticketSchema.statics.findByEvent = (event: { id: string, version: number }) => {
  return Ticket.findOne({
    _id: event.id,
    version: event.version -1
  });
}

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  const { id, ...rest } = attrs;
  return new Ticket({
    _id: id,
    ...rest,
    title: rest.title,
    price: rest.price,
  });
}

// Make sure the ticket isn't already reserved by another user
// Run DB Query to look at all orders. Find an order where the ticket
// is the ticket we just found *AND* the order's status is *NOT* cancelled.
// If we find an order in the query results, it means the ticket *IS* reserved.
ticketSchema.methods.isReserved = async function () {
  // This === the ticket document we just called 'isReserved' method on
  const existingOrder = await Order.findOne({
    ticket: this as any,
    status: {
      $in: [
        OrderStatus.Created ||
        OrderStatus.AwaitingPayment ||
        OrderStatus.Complete
      ] 
    }
  });

  return !!existingOrder;
}

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };