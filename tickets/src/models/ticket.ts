import mongoose from 'mongoose';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

//Class 256
//attrs defines the attributes that are required to create a ticket record
interface TicketAttrs {
  title: string;
  price: number;
  userId: string;
}

//doc defines the attributes that are stored in mongoDB and can contain extra attributes like createdDate etc.
interface TicketDoc extends mongoose.Document{
  title: string;
  price: number;
  userId: string;
  version: number;
  orderId?: string; 
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  //Expects TicketAttrs, and returns TicketDoc
  build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  orderId: {
    type: String
  }
}, {
  toJSON:{
    transform(doc, ret){
      ret.id = ret._id;
      delete ret._id;
    }
  }
});

ticketSchema.set('versionKey', 'version');
ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) =>{
  return new Ticket(attrs);
};

const Ticket = mongoose.model<TicketDoc, TicketModel>('Ticket', ticketSchema);

export { Ticket };