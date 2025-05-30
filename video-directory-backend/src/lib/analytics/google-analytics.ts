// Google Analytics stub functions
// These can be implemented later if you want Google Analytics

declare global {
  interface Window {
    gtag: (command: string, ...args: unknown[]) => void;
  }
}

export function trackPageView(url: string) {
  // Log internally for debugging
  console.log('Page view tracked:', { url, timestamp: new Date() });
  
  // If Google Analytics is loaded, track the page view
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}

export function trackEvent(action: string, category: string, label?: string, value?: number) {
  console.log('Event tracked:', { action, category, label, value, timestamp: new Date() });
  
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}
