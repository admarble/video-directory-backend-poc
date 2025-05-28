declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

// Track page views
export function trackPageView(url: string, title?: string) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
      page_title: title,
    })
  }
}

// Track custom events
export function trackEvent(eventName: string, parameters?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      event_category: 'engagement',
      event_label: parameters?.label,
      value: parameters?.value,
      ...parameters,
    })
  }
}

// Track video interactions
export function trackVideoEvent(action: string, videoId: string, videoTitle?: string) {
  trackEvent('video_interaction', {
    event_category: 'video',
    event_label: videoTitle,
    video_id: videoId,
    action: action,
  })
}

// Track search events
export function trackSearchEvent(searchTerm: string, resultsCount: number) {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  })
}
