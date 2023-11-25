const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `${level}: ${timestamp} ${message}`;
  });
  
const printLogger = () => {
    return createLogger({
        level: 'debug',
        format: combine(
            timestamp({format: "HH:mm:ss"}),
            format.colorize(),
            myFormat,
          ),

        transports: [
          new transports.Console(),
        ],
      });
}

module.exports = printLogger;