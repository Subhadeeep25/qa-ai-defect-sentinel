import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logDir = path.resolve(__dirname, '../logs');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});

export class Logger {
  static info(message, meta) {
    logger.info(message, meta);
  }

  static warn(message, meta) {
    logger.warn(message, meta);
  }

  static error(message, meta) {
    logger.error(message, meta);
  }

  static debug(message, meta) {
    logger.debug(message, meta);
  }

  static testStart(testName) {
    logger.info(`=== TEST START: ${testName} ===`);
  }

  static testEnd(testName, status, duration) {
    logger.info(`=== TEST END: ${testName} | Status: ${status} | Duration: ${duration}ms ===`);
  }

  static step(stepName) {
    logger.info(`  >> STEP: ${stepName}`);
  }
}