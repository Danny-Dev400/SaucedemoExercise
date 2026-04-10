import winston from 'winston';

export const logger = winston.createLogger({
  level: 'debug', // leves: debug, info, warn, error
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.printf(({ level, message }) => `[${level}] ${message}`)
  ),
  transports: [new winston.transports.Console()],
});
