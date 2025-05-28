import winston from 'winston'
import DailyRotateFile from 'winston-daily-rotate-file'
import path from 'path'
import type { LogContext, PerformanceData } from '@/types/api'

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs')

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
)

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`
  })
)

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'video-directory-backend',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    // Error log file - only error messages
    new DailyRotateFile({
      filename: `${logsDir}/error-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxFiles: '14d',
      maxSize: '20m',
      zippedArchive: true,
    }),
    
    // Combined log file - all log levels
    new DailyRotateFile({
      filename: `${logsDir}/combined-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      maxFiles: '30d',
      maxSize: '20m',
      zippedArchive: true,
    }),

    // Performance log file - for tracking API performance
    new DailyRotateFile({
      filename: `${logsDir}/performance-%DATE%.log`,
      datePattern: 'YYYY-MM-DD',
      level: 'info',
      maxFiles: '7d',
      maxSize: '10m',
      zippedArchive: true,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          // Only log performance-related messages
          if (meta.type === 'performance' || (typeof message === 'string' && message.includes('performance'))) {
            return JSON.stringify({ timestamp, level, message, ...meta })
          }
          return ''
        })
      )
    }),
  ],
})

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }))
}

interface RequestWithConnection {
  method: string
  ip?: string
  connection?: {
    remoteAddress?: string
  }
  headers?: {
    'user-agent'?: string
  }
}

// API Performance tracking helper
export const trackApiPerformance = (req: RequestWithConnection, startTime: number, endpoint: string, statusCode: number) => {
  const duration = Date.now() - startTime
  const performanceData: PerformanceData = {
    type: 'performance',
    endpoint,
    method: req.method,
    statusCode,
    duration: `${duration}ms`,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers?.['user-agent'],
    timestamp: new Date().toISOString(),
  }

  // Log slow requests as warnings
  if (duration > 2000) {
    logger.warn('Slow API request detected', performanceData)
  } else {
    logger.info('API request completed', performanceData)
  }
}

// Error tracking helper
export const logError = (error: Error, context?: LogContext) => {
  logger.error('Application error occurred', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
  })
}

// Business event tracking
export const logBusinessEvent = (event: string, data?: LogContext) => {
  logger.info('Business event', {
    type: 'business_event',
    event,
    data,
    timestamp: new Date().toISOString(),
  })
}

// Security event tracking
export const logSecurityEvent = (event: string, req: RequestWithConnection, data?: LogContext) => {
  logger.warn('Security event detected', {
    type: 'security',
    event,
    ip: req.ip || req.connection?.remoteAddress,
    userAgent: req.headers?.['user-agent'],
    data,
    timestamp: new Date().toISOString(),
  })
}

export default logger
