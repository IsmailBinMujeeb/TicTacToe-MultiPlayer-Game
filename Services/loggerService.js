const { logger } = require('../config/logger-config')

const logInfo = (message)=>{
    logger.info(message)
}

const logWarn = (message)=>{
    logger.warn(message);
}

const logError = (message)=>{
    logger.error(message)
}

const logDebug = (message)=>{
    logger.debug(message);
}

module.exports = { logInfo, logWarn, logError, logDebug };