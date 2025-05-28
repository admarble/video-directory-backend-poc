import helmet from 'helmet'
import compression from 'compression'
import rateLimit from 'express-rate-limit'
import cors from 'cors'
import { Request, Response, NextFunction } from 'express'

// Security headers middleware
export const securityMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "*.youtube.com", "*.googleapis.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "*.ytimg.com", "*.youtube.com", "*.googlevideo.com"],
      frameSrc: ["'self'", "*.youtube.com"],
      connectSrc: ["'self'", "*.googleapis.com"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for YouTube embeds
})

// Compression middleware for better performance
export const compressionMiddleware = compression({
  threshold: 1024, // Only compress responses larger than 1KB
  level: 6,
  chunkSize: 16384,
  filter: (req: Request, res: Response) => {
    // Don't compress if the request includes a cache control header indicating no compression
    if (req.headers['x-no-compression']) {
      return false
    }
    // Use compression filter function
    return compression.filter(req, res)
  },
})

// Rate limiting middleware
export const rateLimitMiddleware = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000),
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    if (req.path === '/api/health' || req.path === '/health') {
      return true
    }
    // Skip for authenticated API requests with valid automation user token
    const authHeader = req.headers.authorization
    if (authHeader?.startsWith('Bearer ') && req.path.startsWith('/api/')) {
      // In production, you'd verify the token here
      return false // For now, apply rate limiting to all requests
    }
    return false
  },
})

// CORS middleware with dynamic origins
export const corsMiddleware = cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true)
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:4321',
      'http://localhost:4322',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:4321',
      'http://127.0.0.1:4322',
      ...(process.env.CORS_ORIGIN?.split(',') || []),
    ]
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true, // Allow cookies to be sent
  optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
})

// Input validation middleware
export const inputValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Basic input sanitization
  if (req.body) {
    // Remove any potential XSS attempts
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      }
    }
  }
  
  // Basic SQL injection protection for query parameters
  if (req.query) {
    for (const key in req.query) {
      if (typeof req.query[key] === 'string') {
        const value = req.query[key] as string
        if (value.toLowerCase().includes('union') || 
            value.toLowerCase().includes('select') || 
            value.toLowerCase().includes('drop') ||
            value.toLowerCase().includes('delete')) {
          return res.status(400).json({ error: 'Invalid query parameters detected' })
        }
      }
    }
  }
  
  next()
}

// Health check endpoint
export const healthCheckMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/health' || req.path === '/api/health') {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    })
  }
  next()
}
