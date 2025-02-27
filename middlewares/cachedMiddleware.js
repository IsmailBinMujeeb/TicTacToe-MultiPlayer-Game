const redisClient = require('../config/redis-config');
const { logError } = require('../Services/loggerService');

const cachedMiddleware = (key) => async (req, res, next) => {
    try {
        const userProfile = await redisClient.get(`user:${req[key].user}`);
        const user = req.isAuthenticated() ? req.user : null;

        if (userProfile && key == 'query')
            return res
                .status(200)
                .render('profilePage', {
                    user,
                    userProfile: JSON.parse(userProfile),
                });
        if (userProfile && key == 'params')
            return res.status(200).json(JSON.parse(userProfile));
        next();
    } catch (error) {
        logError(error);
        next();
    }
};

module.exports = cachedMiddleware;
