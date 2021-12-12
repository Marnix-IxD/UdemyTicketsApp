import mongoose from 'mongoose';
import { PasswordHandler } from '../services/password-handler';

// An interface that describes the properties that are required to create a new User.
interface UserAttrs {
  email: string;
  password: string;
}

// An interface that describes the properties that a User model has.
// Class 139
interface UserModel extends mongoose.Model<UserDocument> {
  build(attrs: UserAttrs): UserDocument;
}

// An interface that describes the properties that a User document has.
interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
}, {
  toJSON: {
    transform(doc, ret) {
      ret.id = ret._id; //Mongoose always sets a _id attribute, instead for consistency among other Databases we want to return id
      delete ret._id; //Clear the old _id attribute
      delete ret.password; //Removes a prop of the returned object (ret = returned object)
      delete ret.__v; //We could also use toJSON.versionKey = false
    }
  }
});

// Not using an arrow function here because otherwise we would lose this context on the User being created.
userSchema.pre('save', async function(done){
  if (this.isModified('password')){
    const hashedPassword = await PasswordHandler.toHash(this.get('password'));
    this.set('password', hashedPassword);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDocument, UserModel>('User', userSchema);

export { User };