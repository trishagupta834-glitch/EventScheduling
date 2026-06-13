import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { MongoClient } from 'mongodb';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 8091);
const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || 'trisha_events';
const collectionName = process.env.MONGODB_COLLECTION || 'event_details';

if (!mongoUri) {
  throw new Error('MONGODB_URI is required');
}

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const client = new MongoClient(mongoUri);
let collectionPromise;

const getCollection = async () => {
  if (!collectionPromise) {
    collectionPromise = client.connect().then(async () => {
      const collection = client.db(dbName).collection(collectionName);
      await collection.createIndex({ eventId: 1 }, { unique: true });
      await collection.createIndex({ approvalStatus: 1 });
      await collection.createIndex({ creator: 1 });
      return collection;
    });
  }

  return collectionPromise;
};

const toEventDocument = (event, deleted = false) => ({
  eventId: String(event.id),
  title: event.title || '',
  description: event.description || '',
  eventType: event.eventType || '',
  guestCount: event.guestCount ?? null,
  venue: event.venue || '',
  speaker: event.speaker || '',
  scheduledDate: event.scheduledDate || null,
  completed: Boolean(event.completed),
  completedAt: event.completedAt || null,
  approvalStatus: event.approvalStatus || 'APPROVED',
  hashtags: Array.isArray(event.hashtags) ? event.hashtags : [],
  creator: event.creator || event.createdBy?.username || event.createdBy?.email || '',
  createdBy: event.createdBy || null,
  createdAt: event.createdAt || null,
  deleted,
  rawEvent: event,
  syncedAt: new Date()
});

app.get('/health', async (_request, response) => {
  const collection = await getCollection();
  await collection.findOne({}, { projection: { _id: 1 } });
  response.json({ status: 'ok', database: dbName, collection: collectionName });
});

app.post('/events/sync', async (request, response) => {
  const event = request.body;

  if (!event || event.id === undefined || event.id === null) {
    return response.status(400).json({ error: 'Event payload with id is required' });
  }

  const collection = await getCollection();
  const document = toEventDocument(event);
  await collection.updateOne(
    { eventId: document.eventId },
    { $set: document, $setOnInsert: { firstSyncedAt: new Date() } },
    { upsert: true }
  );

  return response.json({ message: 'Event synced to MongoDB', eventId: document.eventId });
});

app.post('/events/bulk-sync', async (request, response) => {
  const events = Array.isArray(request.body?.events) ? request.body.events : [];

  if (events.length === 0) {
    return response.status(400).json({ error: 'events array is required' });
  }

  const collection = await getCollection();
  const operations = events
    .filter((event) => event && event.id !== undefined && event.id !== null)
    .map((event) => {
      const document = toEventDocument(event);
      return {
        updateOne: {
          filter: { eventId: document.eventId },
          update: { $set: document, $setOnInsert: { firstSyncedAt: new Date() } },
          upsert: true
        }
      };
    });

  if (operations.length > 0) {
    await collection.bulkWrite(operations);
  }

  return response.json({ message: 'Events synced to MongoDB', count: operations.length });
});

app.delete('/events/:eventId', async (request, response) => {
  const collection = await getCollection();
  await collection.updateOne(
    { eventId: String(request.params.eventId) },
    {
      $set: {
        deleted: true,
        deletedAt: new Date(),
        syncedAt: new Date()
      }
    },
    { upsert: true }
  );

  return response.json({ message: 'Event marked deleted in MongoDB', eventId: String(request.params.eventId) });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: error.message || 'Mongo event service error' });
});

app.listen(port, () => {
  console.log(`Mongo event service running on http://127.0.0.1:${port}`);
});
