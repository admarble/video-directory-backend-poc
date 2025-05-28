  }, [])
}
EOF

# Create SEO analytics utilities
cat > src/lib/analytics/seo-analytics.ts << 'EOF'
import { getPayload } from '@/getPayload'
import config from '@payload-config'

interface SEOMetrics {
  totalPages: number
  indexedPages: number
  avgTitleLength: number
  avgDescriptionLength: number
  missingTitles: number
  missingDescriptions: number
  duplicateTitles: number
  duplicateDescriptions: number
}

export async function generateSEOReport(): Promise<SEOMetrics> {
  const payload = await getPayload({ config })

  // Get all published videos for SEO analysis
  const videos = await payload.find({
    collection: 'videos',
    where: { published: { equals: true } },
    limit: 1000,
    select: {
      title: true,
      description: true,
      meta: true,
    },
  })

  const titles = videos.docs.map((video: any) => video.meta?.title || video.title).filter(Boolean)
  const descriptions = videos.docs.map((video: any) => video.meta?.description || video.description).filter(Boolean)

  const metrics: SEOMetrics = {
    totalPages: videos.docs.length,
    indexedPages: videos.docs.filter((video: any) => video.published).length,
    avgTitleLength: titles.length > 0 ? Math.round(titles.reduce((sum, title) => sum + title.length, 0) / titles.length) : 0,
    avgDescriptionLength: descriptions.length > 0 ? Math.round(descriptions.reduce((sum, desc) => sum + desc.length, 0) / descriptions.length) : 0,
    missingTitles: videos.docs.filter((video: any) => !video.meta?.title && !video.title).length,
    missingDescriptions: videos.docs.filter((video: any) => !video.meta?.description && !video.description).length,
    duplicateTitles: titles.length - new Set(titles).size,
    duplicateDescriptions: descriptions.length - new Set(descriptions).size,
  }

  return metrics
}

// Track search engine rankings (placeholder for future implementation)
export async function trackSearchRankings(keywords: string[]) {
  // This would integrate with Google Search Console API or similar
  console.log('Tracking rankings for keywords:', keywords)
  
  // For now, return mock data
  return keywords.map(keyword => ({
    keyword,
    position: Math.floor(Math.random() * 100) + 1,
    impressions: Math.floor(Math.random() * 1000),
    clicks: Math.floor(Math.random() * 100),
    ctr: Math.random() * 0.1,
  }))
}
EOF

# Create Google Analytics component for Next.js app
cat > src/components/GoogleAnalytics.tsx << 'EOF'
import Script from 'next/script'

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

export default function GoogleAnalytics() {
  if (!GA_MEASUREMENT_ID || process.env.NODE_ENV !== 'production') {
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}', {
            page_path: window.location.pathname,
            custom_map: {
              'custom_parameter_1': 'video_id',
              'custom_parameter_2': 'category',
              'custom_parameter_3': 'creator'
            }
          });
        `}
      </Script>
    </>
  )
}
EOF

# Create analytics middleware for API routes
cat > src/middleware/analytics.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'

interface AnalyticsData {
  endpoint: string
  method: string
  responseTime: number
  statusCode: number
  userAgent?: string
  ip?: string
}

export function withAnalytics<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  options: { trackPerformance?: boolean } = {}
): T {
  return (async (req: NextRequest, ...args: any[]) => {
    const startTime = Date.now()
    
    try {
      const response = await handler(req, ...args)
      const endTime = Date.now()
      
      if (options.trackPerformance) {
        const analyticsData: AnalyticsData = {
          endpoint: new URL(req.url).pathname,
          method: req.method,
          responseTime: endTime - startTime,
          statusCode: response.status,
          userAgent: req.headers.get('user-agent') || undefined,
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined,
        }
        
        // Log performance data
        console.log('API Analytics:', analyticsData)
        
        // Add performance headers
        response.headers.set('X-Response-Time', `${analyticsData.responseTime}ms`)
      }
      
      return response
    } catch (error) {
      const endTime = Date.now()
      
      console.error('API Error Analytics:', {
        endpoint: new URL(req.url).pathname,
        method: req.method,
        responseTime: endTime - startTime,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      
      throw error
    }
  }) as T
}
EOF

# Create comprehensive monitoring dashboard API
cat > src/app/api/monitoring/health-detailed/route.ts << 'EOF'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/getPayload'
import config from '@payload-config'
import redis from '@/lib/redis'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {} as any,
    performance: {} as any,
  }

  try {
    // Test database connection
    const payload = await getPayload({ config })
    const dbStart = Date.now()
    
    try {
      await payload.count({ collection: 'videos', limit: 1 })
      health.services.database = {
        status: 'healthy',
        responseTime: Date.now() - dbStart,
      }
    } catch (error) {
      health.services.database = {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Database connection failed',
        responseTime: Date.now() - dbStart,
      }
      health.status = 'degraded'
    }

    // Test Redis connection
    const redisStart = Date.now()
    try {
      await redis.set('health-check', 'ok', 10)
      health.services.redis = {
        status: 'healthy',
        responseTime: Date.now() - redisStart,
      }
    } catch (error) {
      health.services.redis = {
        status: 'unhealthy',
        error: 'Redis connection failed',
        responseTime: Date.now() - redisStart,
      }
    }

    // Memory usage
    const memUsage = process.memoryUsage()
    health.performance.memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      external: Math.round(memUsage.external / 1024 / 1024),
      rss: Math.round(memUsage.rss / 1024 / 1024),
    }

    // System metrics
    health.performance.system = {
      loadAverage: process.platform !== 'win32' ? require('os').loadavg() : [0, 0, 0],
      cpuUsage: process.cpuUsage(),
      platform: process.platform,
      nodeVersion: process.version,
    }

    health.performance.responseTime = Date.now() - startTime

    return NextResponse.json(health, {
      status: health.status === 'healthy' ? 200 : 503,
    })

  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Health check failed',
      responseTime: Date.now() - startTime,
    }, { status: 503 })
  }
}
EOF

# Update environment variables
echo "🔧 Adding analytics environment variables..."
cat >> .env.example << 'EOF'

# Analytics Configuration
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
ENABLE_ANALYTICS=true
ANALYTICS_DEBUG=false
EOF

cat >> .env.production.example << 'EOF'

# Analytics Configuration (Production)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
ENABLE_ANALYTICS=true
ANALYTICS_DEBUG=false
GOOGLE_ANALYTICS_PROPERTY_ID=123456789
EOF

# Add analytics scripts to package.json
echo "📝 Adding analytics npm scripts..."
npm pkg set scripts.analytics:report="node -e \"console.log('Analytics report would be generated here')\""
npm pkg set scripts.seo:audit="node -e \"console.log('SEO audit would be run here')\""

# Create Lighthouse configuration
cat > lighthouse.config.js << 'EOF'
module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--no-sandbox --disable-dev-shm-usage',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
  },
}
EOF

echo "✅ Analytics and monitoring setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Set up Google Analytics 4:"
echo "   - Go to https://analytics.google.com"
echo "   - Create a new property"
echo "   - Copy your Measurement ID to NEXT_PUBLIC_GA_MEASUREMENT_ID"
echo ""
echo "2. Add analytics component to your layout:"
echo "   import GoogleAnalytics from '@/components/GoogleAnalytics'"
echo ""
echo "3. Test analytics in development:"
echo "   npm run dev"
echo "   Open browser dev tools > Network tab"
echo "   Navigate pages to see tracking calls"
echo ""
echo "4. Monitor health endpoints:"
echo "   curl http://localhost:3001/api/monitoring/health-detailed"
echo ""
echo "📊 Analytics features installed:"
echo "- Google Analytics 4 integration"
echo "- Custom event tracking"
echo "- Performance monitoring"
echo "- SEO analytics"
echo "- API performance tracking" 
echo "- Comprehensive health monitoring"
echo "- Core Web Vitals tracking"
