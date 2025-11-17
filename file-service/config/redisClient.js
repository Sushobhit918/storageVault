//  /backend/file-service/config/redisClient.js

import Redis from 'ioredis';

// This creates the connection.
// It automatically looks for Redis on localhost (127.0.0.1:6379)
const client = new Redis();

client.on('connect', () => {
  console.log('Connected to Redis successfully!');
});

client.on('error', (err) => {
  console.error(' Could not connect to Redis:', err);
});

export default client;