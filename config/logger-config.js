const { createLogger, format, transports } = require('winston');
const { combine, timestamp, json, colorize } = format;
const path = require('path')

const consoleLogFormat = format.combine(
    format.colorize(),
    format.printf(({ level, message, timestamp }) => {
        return`${level}: ${message}`
    })
);

const logger = createLogger(
    {
        level: 'debug',
        format: combine(colorize(), timestamp(), json()),
        transports: [
            new transports.Console({
                format: consoleLogFormat,
            }),

            new transports.File({ filename: path.join(__dirname, '../logs/app.log') })
        ]
    }
);

module.exports = { logger };