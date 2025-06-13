// redisClient.ts
import Redis from 'ioredis';

const redisServer = () => {
  const redis = new Redis({
    host: '127.0.0.1', // Redis server host
    port: 6379, // Redis server port
  }); // defaults to localhost:6379

  redis.on('connect', () => {
    redis.set('test', 'Redis is connected');
    console.log('Redis connected');
  });

  redis.on('error', (err) => {
    console.error('Redis error:', err);
  });
  return redis;
};
export const redis = redisServer();
export default redisServer;
