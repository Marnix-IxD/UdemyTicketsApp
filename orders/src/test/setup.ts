import { MongoMemoryServer } from 'mongodb-memory-server'; 
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

declare global {
  var getAuthCookie: (id?:string) => Promise<string[]>; //<> <<- this defines how the function resolves, in the case of cookie it's an array of strings.
}

jest.mock('../nats-wrapper');
jest.useFakeTimers("legacy"); // As of Jest 26+ there is something weird about timers now, not fixed or discussed but Lecture 463 onwards covers this part.

let mongo: MongoMemoryServer;

beforeAll(async () => {
  process.env.JWT_KEY = 'asfsfdsf';

  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri/*, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  } as ConnectOptions*/);
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
})

global.getAuthCookie = async (id?: string) => {
  // Build a JWT Payload. { id, email }
  const payload = {
    id: id || new mongoose.Types.ObjectId().toHexString(),
    email: 'test@test.com'
  }
  // Create the JWT! the exclamation mark at the end tells typescript to not sweat it.
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build session object { jwt: MY_JWT }
  const session = { jwt: token };

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session);

  // Take session JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // Return a string that is the cookie with the encoded session.
  return [`express:sess=${base64}`];
};