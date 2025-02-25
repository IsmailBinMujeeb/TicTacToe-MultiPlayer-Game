const morgan = require("morgan");
const { logger } = require('../config/logger-config');

const morganFormat = ":method :url :status :response-time ms";

const morganLogger = morgan(morganFormat, {

    stream: {
        write: (message) => {
            const logStr = `${message.split(" ")[0]} ${message.split(" ")[1]} ${message.split(" ")[2]} ${message.split(" ")[3]}`
            logger.info(logStr);
        }
    }
})

module.exports = morganLogger;