import mongoose from 'mongoose';
import { OrderStatus } from '@the-future-retro/tickets-common';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

export { OrderStatus };

interface OrderAttrs {
    id: string;
    version: number;
    userId: string;
    status: OrderStatus;
    price: number;
}

interface OrderDoc extends mongoose.Document {
    version: number;
    userId: string;
    status: OrderStatus;
    price: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        enum: Object.values(OrderStatus),
        default: OrderStatus.Created
    },
    price:{
        type: Number,
        required: true
    }
},{
    toJSON:{
      transform(doc, ret){
        ret.id = ret._id;
        delete ret._id;
      }
    }
});

orderSchema.set('versionKey', 'version');
orderSchema.plugin(updateIfCurrentPlugin);

orderSchema.statics.build = (attrs: OrderAttrs) => {
    return new Order({
        _id: attrs.id,
        version: attrs.version,
        userId: attrs.userId,
        status: attrs.status,
        price: attrs.price
    });
}

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };