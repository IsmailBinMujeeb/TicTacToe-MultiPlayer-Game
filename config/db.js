const mongoose = require('mongoose');
const { logDebug, logError } = require('../Services/loggerService');

module.exports = mongoose
    .connect(process.env.DB_CONN_STR)
    .then(() => {
        logDebug('Connected to MongoDB');
    })
    .catch((e) => logError(e));
