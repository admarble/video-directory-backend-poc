# PostHog Deprecation Fix

## Issue Fixed
Fixed the deprecated `on_xhr_error` configuration option that was causing the following console error:
```
Error: [PostHog.js] "on_xhr_error is deprecated. Use on_request_error instead"
```

## Changes Made

### 1. AdminPostHogProvider.tsx
- **Before**: `on_xhr_error: (failedRequest) => { ... }`
- **After**: `on_request_error: (failedRequest) => { ... }`

### 2. PostHogProvider.tsx  
- **Before**: `on_xhr_error: (failedRequest) => { ... }`
- **After**: `on_request_error: (failedRequest) => { ... }`

## Why This Change Was Needed
According to the PostHog.js source code and GitHub issues, the `on_xhr_error` configuration option has been deprecated in favor of `on_request_error`. The new option provides the same functionality but with improved naming consistency across the PostHog SDK.

## Files Modified
- `/src/providers/AdminPostHogProvider.tsx`
- `/src/providers/PostHogProvider.tsx`

## Status
✅ **Fixed**: The deprecation warning should no longer appear in the console.

## Testing
After making these changes:
1. Start your development server: `npm run dev`
2. Open the admin interface
3. Check the browser console - the PostHog deprecation warning should be gone
4. PostHog analytics should continue to work normally

## Additional Notes
- The functionality remains exactly the same
- Error handling for failed PostHog requests is still intact
- No breaking changes to existing analytics tracking
