const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `${level}: ${timestamp} ${message}`;
  });
  
const productionLogger = () => {
    return createLogger({
        level: 'info',
        format: combine(
            timestamp(),
            myFormat,
            format.json(),
          ),

        transports: [
          new transports.File({ filename: './logger/logs/error.log', level: 'error' }),
          new transports.File({ filename: './logger/logs/combined.log' }),
        ],
      });
}

module.exports = productionLogger;