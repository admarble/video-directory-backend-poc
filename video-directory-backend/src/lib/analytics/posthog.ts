// Stub analytics functions for internal tracking
// This replaces PostHog for backend components that need analytics tracking

export function useVideoAnalytics() {
  const trackVideoView = (videoId: string, title: string, category?: string) => {
    // Log internally for debugging - no external tracking
    console.log('Video viewed:', { videoId, title, category, timestamp: new Date() });
  };

  const trackVideoSearch = (query: string, resultsCount: number) => {
    console.log('Video searched:', { query, resultsCount, timestamp: new Date() });
  };

  const trackCategoryFilter = (category: string) => {
    console.log('Category filtered:', { category, timestamp: new Date() });
  };

  return {
    trackVideoView,
    trackVideoSearch,
    trackCategoryFilter,
  };
}

// Server-side tracking (for API routes) - just logging
export function trackServerEvent(event: string, properties: Record<string, unknown>) {
  console.log('Server event:', event, properties, { timestamp: new Date() });
}
