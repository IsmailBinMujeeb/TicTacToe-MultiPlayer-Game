const redis = require('redis');
const { logDebug, logError } = require('../Services/loggerService');

const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
});

redisClient
    .connect()
    .then(()=>logDebug('Connected to Redis'))
    .catch((e) => logError(e));

module.exports = redisClient;
