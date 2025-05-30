# PostHog Analytics Setup for Frontend

## Overview

PostHog analytics has been moved from the backend to the frontend where it belongs. This guide will help you set up PostHog analytics in your Astro frontend application.

## Step 1: Install PostHog

In your frontend directory (`/Users/tony/Documents/Projects/indie-hacker-videos`), install PostHog:

```bash
cd /Users/tony/Documents/Projects/indie-hacker-videos
npm install posthog-js
```

## Step 2: Environment Variables

Add PostHog environment variables to your `.env` file:

```bash
# PostHog Configuration
PUBLIC_POSTHOG_KEY=your_posthog_project_key_here
PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

**Note**: Use `PUBLIC_` prefix for Astro environment variables that need to be available on the client side.

## Step 3: Create PostHog Components

### Create Analytics Provider

Create `src/components/analytics/PostHogProvider.tsx`:

```tsx
import { useEffect } from 'react';
import posthog from 'posthog-js';

interface PostHogProviderProps {
  children: React.ReactNode;
}

export function PostHogProvider({ children }: PostHogProviderProps) {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    const posthogKey = import.meta.env.PUBLIC_POSTHOG_KEY;
    const posthogHost = import.meta.env.PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

    // Validate PostHog key
    if (!posthogKey || posthogKey === 'your_posthog_project_key_here') {
      console.log('PostHog not initialized: No valid API key found');
      return;
    }

    // Initialize PostHog
    posthog.init(posthogKey, {
      api_host: posthogHost,
      capture_pageview: false, // We'll manually track page views
      loaded: (posthog) => {
        if (import.meta.env.DEV) {
          console.log('✅ PostHog initialized successfully');
          posthog.debug();
        }
      },
    });

    // Track initial page view
    posthog.capture('$pageview');

    return () => {
      posthog.reset();
    };
  }, []);

  return <>{children}</>;
}
```

### Create Analytics Hooks

Create `src/components/analytics/useVideoAnalytics.ts`:

```ts
import posthog from 'posthog-js';

export function useVideoAnalytics() {
  const trackVideoView = (videoId: string, title: string, category?: string, creator?: string) => {
    posthog.capture('video_viewed', {
      video_id: videoId,
      video_title: title,
      category: category,
      creator: creator,
      timestamp: new Date().toISOString(),
    });
  };

  const trackVideoSearch = (query: string, resultsCount: number, filters?: Record<string, any>) => {
    posthog.capture('video_searched', {
      search_query: query,
      results_count: resultsCount,
      filters: filters,
      timestamp: new Date().toISOString(),
    });
  };

  const trackCategoryFilter = (category: string, resultCount: number) => {
    posthog.capture('category_filtered', {
      category: category,
      result_count: resultCount,
      timestamp: new Date().toISOString(),
    });
  };

  const trackCreatorFilter = (creator: string, resultCount: number) => {
    posthog.capture('creator_filtered', {
      creator: creator,
      result_count: resultCount,
      timestamp: new Date().toISOString(),
    });
  };

  const trackVideoClick = (videoId: string, title: string, position: number, context: string) => {
    posthog.capture('video_clicked', {
      video_id: videoId,
      video_title: title,
      position: position,
      context: context, // 'search_results', 'category_page', 'home_page', etc.
      timestamp: new Date().toISOString(),
    });
  };

  const trackPageView = (pageName: string, properties?: Record<string, any>) => {
    posthog.capture('$pageview', {
      $current_url: window.location.href,
      page_name: pageName,
      ...properties,
    });
  };

  const trackUserInteraction = (action: string, element: string, properties?: Record<string, any>) => {
    posthog.capture('user_interaction', {
      action,
      element,
      page: window.location.pathname,
      ...properties,
      timestamp: new Date().toISOString(),
    });
  };

  return {
    trackVideoView,
    trackVideoSearch,
    trackCategoryFilter,
    trackCreatorFilter,
    trackVideoClick,
    trackPageView,
    trackUserInteraction,
  };
}
```

## Step 4: Integrate with Astro

### Update Main Layout

Update your main Astro layout file (likely `src/layouts/Layout.astro`) to include PostHog:

```astro
---
// src/layouts/Layout.astro
import { PostHogProvider } from '../components/analytics/PostHogProvider';

interface Props {
  title: string;
  description?: string;
}

const { title, description = "A curated directory of video tutorials for indie hackers" } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content={description} />
    <title>{title}</title>
  </head>
  <body>
    <PostHogProvider client:load>
      <slot />
    </PostHogProvider>
  </body>
</html>
```

### Create Analytics Script Component

For better performance, you can also create a script component that loads PostHog directly:

Create `src/components/analytics/PostHogScript.astro`:

```astro
---
// Only include in production or when explicitly enabled
const shouldLoadPostHog = !import.meta.env.DEV || import.meta.env.PUBLIC_POSTHOG_DEV === 'true';
const posthogKey = import.meta.env.PUBLIC_POSTHOG_KEY;
---

{shouldLoadPostHog && posthogKey && (
  <script>
    !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]);t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys getNextSurveyStep onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
    
    posthog.init('{posthogKey}', {
      api_host: '{import.meta.env.PUBLIC_POSTHOG_HOST || "https://app.posthog.com"}',
      capture_pageview: false,
      loaded: function(posthog) {
        posthog.capture('$pageview');
      }
    });
  </script>
)}
```

## Step 5: Usage Examples

### In React Components

```tsx
// src/components/VideoCard.tsx
import { useVideoAnalytics } from '../analytics/useVideoAnalytics';

export function VideoCard({ video, position, context }: VideoCardProps) {
  const { trackVideoClick } = useVideoAnalytics();

  const handleClick = () => {
    trackVideoClick(video.id, video.title, position, context);
    // Navigate to video...
  };

  return (
    <div onClick={handleClick}>
      {/* Video card content */}
    </div>
  );
}
```

### In Search Components

```tsx
// src/components/SearchForm.tsx
import { useVideoAnalytics } from '../analytics/useVideoAnalytics';

export function SearchForm() {
  const { trackVideoSearch } = useVideoAnalytics();

  const handleSearch = async (query: string, filters: any) => {
    const results = await searchVideos(query, filters);
    trackVideoSearch(query, results.length, filters);
    // Handle results...
  };

  return (
    // Search form JSX...
  );
}
```

### In Astro Pages

```astro
---
// src/pages/category/[slug].astro
import Layout from '../../layouts/Layout.astro';
import { useVideoAnalytics } from '../../components/analytics/useVideoAnalytics';

const { slug } = Astro.params;
// Fetch category data...
---

<Layout title={`${category.name} Videos`}>
  <script>
    // Track category page view
    import('../../components/analytics/useVideoAnalytics').then(({ useVideoAnalytics }) => {
      const { trackPageView } = useVideoAnalytics();
      trackPageView('category_page', { 
        category: '{category.name}',
        slug: '{slug}' 
      });
    });
  </script>
  
  <!-- Category content -->
</Layout>
```

## Step 6: Event Tracking Strategy

### Core Events to Track

1. **Video Interactions**
   - `video_viewed` - When a video page is loaded
   - `video_clicked` - When a video is clicked from listings
   - `video_external_link_clicked` - When clicking to YouTube/external source

2. **Search & Discovery**
   - `video_searched` - Search queries and results
   - `category_filtered` - Category filtering
   - `creator_filtered` - Creator filtering
   - `skill_level_filtered` - Skill level filtering

3. **Navigation**
   - `$pageview` - Page views (automatic)
   - `page_navigation` - Navigation between sections

4. **User Engagement**
   - `user_interaction` - General UI interactions
   - `feature_used` - Specific feature usage

### Properties to Include

- **Video Properties**: ID, title, category, creator, skill level, duration
- **User Context**: Page location, search filters, position in results
- **Session Data**: Timestamp, user agent, referrer

## Step 7: Testing

### Test PostHog Integration

1. **Development Testing**:
   ```bash
   # Enable PostHog in development
   echo "PUBLIC_POSTHOG_DEV=true" >> .env
   ```

2. **Browser Console**:
   - Open browser dev tools
   - Look for PostHog initialization messages
   - Check Network tab for PostHog requests

3. **PostHog Dashboard**:
   - Go to your PostHog project
   - Check Live Events to see real-time tracking
   - Verify events are being captured with correct properties

## Step 8: Privacy & Performance

### Privacy Considerations

```tsx
// Add to PostHogProvider
posthog.init(posthogKey, {
  api_host: posthogHost,
  respect_dnt: true, // Respect Do Not Track
  opt_out_capturing_by_default: false,
  opt_out_capturing_persistence_type: 'localStorage',
  disable_session_recording: true, // Disable if not needed
  disable_surveys: true, // Disable if not needed
});
```

### Performance Optimization

```tsx
// Lazy load PostHog
const loadPostHog = async () => {
  const { default: posthog } = await import('posthog-js');
  // Initialize...
};

// Load only when needed
useEffect(() => {
  if (shouldTrackAnalytics) {
    loadPostHog();
  }
}, []);
```

## Step 9: Environment-Specific Configuration

### Development
```bash
PUBLIC_POSTHOG_KEY=phc_development_key
PUBLIC_POSTHOG_HOST=https://app.posthog.com
PUBLIC_POSTHOG_DEV=true
```

### Production
```bash
PUBLIC_POSTHOG_KEY=phc_production_key
PUBLIC_POSTHOG_HOST=https://app.posthog.com
PUBLIC_POSTHOG_DEV=false
```

## Migration Complete

✅ **Backend cleanup completed:**
- Removed PostHog dependencies from backend package.json
- Removed PostHog providers and analytics components
- Cleaned up layout files
- Backed up original files for reference

✅ **Frontend setup ready:**
- Complete PostHog integration guide
- Analytics hooks for video-specific tracking
- Astro-compatible implementation
- Privacy and performance considerations

Your backend is now clean and focused on its role as a CMS/API, while your frontend will handle all user analytics properly!
