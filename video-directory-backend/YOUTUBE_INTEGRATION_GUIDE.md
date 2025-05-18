# YouTube API Integration Setup Guide

## Overview

This implementation provides a straightforward YouTube API integration for your Payload CMS video directory. Here's what it does:

1. **Custom UI Field**: Adds a "Fetch YouTube Data" button to the video creation form
2. **Auto-fill**: Automatically populates title, description, duration, and publish date
3. **Thumbnail Upload**: Optionally downloads and uploads the video thumbnail to your media collection
4. **Error Handling**: Provides clear feedback for invalid URLs or API errors

## Setup Instructions

### 1. Environment Configuration

Make sure you have a YouTube API key set in your `.env` file:

```env
YOUTUBE_API_KEY=your-actual-youtube-api-key-here
```

To get a YouTube API key:
1. Go to [Google Developers Console](https://console.developers.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Optionally restrict the key to YouTube Data API for security

### 2. Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3001/admin/collections/videos/create`
3. Enter a YouTube URL in the "YouTube Video URL" field
4. Click "Fetch YouTube Data" in the sidebar
5. Watch as the form fields are automatically populated!

### 3. How It Works

#### Frontend Component (`/src/fields/YouTubeField.tsx`)
- Uses Payload's `useFormFields` hook to interact with form state
- Validates YouTube URLs client-side before making API calls
- Provides visual feedback (loading, success, error states)
- Optional checkbox to control thumbnail uploading

#### Backend API (`/src/app/api/youtube/route.ts`)
- Extracts video ID from various YouTube URL formats
- Calls YouTube Data API v3 to fetch video metadata
- Converts ISO 8601 duration to seconds
- Optionally downloads and uploads thumbnails to Payload's media collection

#### Collection Configuration (`/src/collections/Videos.ts`)
- Added as a UI field positioned in the sidebar
- Non-intrusive: doesn't affect your data schema

## Features

### ✅ What's Included
- Auto-fill: title, description, duration, publish date
- URL validation with helpful error messages
- Loading states and success feedback
- Optional thumbnail download and upload
- Handles various YouTube URL formats:
  - `https://www.youtube.com/watch?v=VIDEO_ID`
  - `https://youtu.be/VIDEO_ID`
  - `https://www.youtube.com/embed/VIDEO_ID`
  - With timestamps and playlists

### 🔄 Future Enhancements
You could extend this further by:
- Auto-extracting and creating creator records
- Parsing video tags for automatic tag creation
- Adding category detection based on video content
- Implementing batch processing for multiple videos
- Adding webhook support for automatic updates

## Error Handling

The implementation handles several error cases:
- Invalid YouTube URLs
- Videos that don't exist or are private
- API key not configured
- Network errors
- Thumbnail download failures (gracefully degrades)

## Security Considerations

- API key is stored server-side only
- Client-side URL validation prevents unnecessary API calls
- Thumbnail uploads go through Payload's standard file handling
- No sensitive data is exposed to the frontend

## Testing

Your existing test suite (`tests/youtube-api.spec.ts`) covers:
- Valid YouTube URL processing
- Invalid URL handling
- Missing parameter validation
- API key configuration checks

Run tests with: `npm test`

## Troubleshooting

### Common Issues

1. **"YouTube API key is not configured"**
   - Check your `.env` file has `YOUTUBE_API_KEY=...`
   - Restart your development server after adding the key

2. **"Invalid YouTube URL"**
   - Ensure the URL contains a valid 11-character video ID
   - Check for typos in the URL

3. **"Video not found or not accessible"**
   - Video might be private, deleted, or region-restricted
   - Check the video exists by opening it in a browser

4. **Thumbnail upload fails**
   - This is non-critical; other fields will still be populated
   - Check console for specific error messages

### API Quota Management

YouTube API has a default quota of 10,000 units per day. Each video detail request costs 1 unit, so you can fetch details for ~10,000 videos daily. Monitor usage in the Google Developers Console.

## Usage Tips

1. **Workflow**: Enter the YouTube URL first, then click fetch. This prevents API calls for incomplete URLs.

2. **Bulk Import**: For importing many videos, consider implementing a batch processing feature to respect API rate limits.

3. **Validation**: The system validates URLs client-side to provide immediate feedback, then validates server-side for security.

4. **Customization**: Easily modify which fields get populated by updating the `dispatchFields` calls in `YouTubeField.tsx`.

## Next Steps

With this foundation in place, you can:
1. Test the integration with various YouTube URLs
2. Customize the UI styling to match your admin panel theme
3. Add additional fields or processing logic as needed
4. Consider implementing creator auto-detection and creation
5. Set up automated testing for your specific use cases

The implementation follows Payload CMS best practices and maintains a clean separation between frontend UI, backend API, and data management.