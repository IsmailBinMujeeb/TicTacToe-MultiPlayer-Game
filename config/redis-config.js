const redis = require('redis');
const { logDebug, logError, logInfo } = require('../Services/loggerService');

console.log(process.env.REDIS_URL)
const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
});

redisClient
    .connect()
    .then(()=>logDebug('Connected to Redis'))
    .catch((e) => logInfo(e));

module.exports = redisClient;
