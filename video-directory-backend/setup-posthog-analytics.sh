#!/bin/bash

echo "🚀 Setting up PostHog Analytics (Lowest Lift Solution)"
echo "=============================================="

# Install PostHog
echo "📦 Installing PostHog..."
npm install posthog-js posthog-node

# Create PostHog provider component
echo "🔧 Creating PostHog provider..."
mkdir -p src/providers

cat > src/providers/PostHogProvider.tsx << 'EOF'
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { ReactNode } from 'react'

if (typeof window !== 'undefined') {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
    loaded: (posthog) => {
      if (process.env.NODE_ENV === 'development') posthog.debug()
    }
  })
}

export function CSPostHogProvider({ children }: { children: ReactNode }) {
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
EOF

# Create PostHog analytics utility
cat > src/lib/analytics/posthog.ts << 'EOF'
import { usePostHog } from 'posthog-js/react'

// Custom hook for video tracking
export function useVideoAnalytics() {
  const posthog = usePostHog()
  
  const trackVideoView = (videoId: string, title: string, category?: string) => {
    posthog?.capture('video_viewed', {
      video_id: videoId,
      video_title: title,
      category: category,
    })
  }
  
  const trackVideoSearch = (query: string, resultsCount: number) => {
    posthog?.capture('video_searched', {
      search_query: query,
      results_count: resultsCount,
    })
  }
  
  const trackCategoryFilter = (category: string) => {
    posthog?.capture('category_filtered', {
      category: category,
    })
  }
  
  return {
    trackVideoView,
    trackVideoSearch,
    trackCategoryFilter,
  }
}

// Server-side tracking (for API routes)
export function trackServerEvent(event: string, properties: Record<string, any>) {
  // You can add server-side PostHog tracking here if needed
  console.log('Server event:', event, properties)
}
EOF

# Add environment variables
echo "🔐 Adding environment variables..."
cat >> .env.local << 'EOF'

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
EOF

cat >> .env.example << 'EOF'

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_key_here
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
EOF

echo "✅ PostHog setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. Sign up at https://posthog.com (free)"
echo "2. Get your project key from Project Settings"
echo "3. Add it to .env.local as NEXT_PUBLIC_POSTHOG_KEY"
echo "4. Wrap your app with PostHogProvider in layout.tsx"
echo ""
echo "📊 You'll get automatically:"
echo "- Page views"
echo "- User sessions"
echo "- Click tracking"
echo "- Search behavior"
echo "- Video interactions"
echo "- Session recordings"
echo "- Heatmaps"
echo ""
echo "💡 Zero additional configuration needed!" 