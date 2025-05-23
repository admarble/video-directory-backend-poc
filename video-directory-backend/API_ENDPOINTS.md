# Video Directory Backend API Endpoints

## Overview
This document outlines all the API endpoints available for the Video Directory Backend, built with Payload CMS 3.33.0.

## Core Homepage Endpoints (Priority 1)

### GET /api/tutorials/featured
Returns tutorials marked as `isFeatured: true` for the homepage hero section.

**Response:**
```json
{
  "data": [
    {
      "id": "tutorial-1",
      "title": "How to Build a SaaS MVP in One Week",
      "description": "Learn how to rapidly build...",
      "thumbnailUrl": "https://i.ytimg.com/vi/...",
      "slug": "how-to-build-saas-mvp-one-week",
      "channelName": "Indie Hacker Pro",
      "views": 125,
      "topics": ["SaaS", "MVP", "Web Development"],
      "tools": ["React", "Node.js"],
      "skillLevel": "beginner",
      "publishedAt": "2025-05-21T10:00:00Z",
      "isFeatured": true
    }
  ]
}
```

### GET /api/tutorials/latest
Returns recently published tutorials, sorted by `publishedDate`.

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 12) - Number of results per page

**Response:**
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 45,
    "totalPages": 4,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### GET /api/tutorials/popular
Returns tutorials sorted by `views` in descending order for trending section.

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 12) - Number of results per page

**Response:** Same format as `/api/tutorials/latest`

## Navigation & Discovery (Priority 2)

### GET /api/categories/topics
Returns unique topics (categories) for filter/navigation.

**Response:**
```json
{
  "data": ["SaaS", "MVP", "SEO", "Marketing", "Automation"]
}
```

### GET /api/categories/tools
Returns unique tools/technologies for technology-based filtering.

**Response:**
```json
{
  "data": ["React", "Node.js", "Python", "Docker", "AWS"]
}
```

### GET /api/tutorials/search
Search endpoint with filtering capabilities.

**Query Parameters:**
- `q` (string) - Search query for title/description
- `topic` (string) - Filter by topic/category name
- `tool` (string) - Filter by tool/technology name
- `skillLevel` (string) - Filter by skill level (beginner, intermediate, advanced)
- `creator` (string) - Filter by creator ID
- `page` (number, default: 1) - Page number
- `limit` (number, default: 12) - Results per page

**Response:** Same format as other tutorial endpoints with pagination

## Site Metadata (Priority 3)

### GET /api/stats
Returns basic site statistics for homepage.

**Response:**
```json
{
  "totalTutorials": 45,
  "totalChannels": 12,
  "totalViews": 2847,
  "lastUpdated": "2025-05-21T10:00:00Z"
}
```

## Individual Tutorial & Analytics (Priority 4)

### GET /api/tutorials/{id}
Individual tutorial details by ID.

**Response:**
```json
{
  "data": {
    "id": "tutorial-1",
    "title": "How to Build a SaaS MVP in One Week",
    "description": "Learn how to rapidly build...",
    "thumbnailUrl": "https://i.ytimg.com/vi/...",
    "slug": "how-to-build-saas-mvp-one-week",
    "channelName": "Indie Hacker Pro",
    "views": 125,
    "topics": ["SaaS", "MVP"],
    "tools": ["React", "Node.js"],
    "skillLevel": "beginner",
    "publishedAt": "2025-05-21T10:00:00Z",
    "videoUrl": "https://www.youtube.com/watch?v=...",
    "duration": 1800
  }
}
```

### POST /api/tutorials/{id}/views
Track page views for analytics (increments view count).

**Response:**
```json
{
  "views": 126,
  "message": "View count updated successfully"
}
```

## Content Management & Automation

### GET /api/youtube
Fetch YouTube video metadata and automatically create related entities.

**Query Parameters:**
- `url` (string, required) - YouTube video URL
- `uploadThumbnail` (boolean, default: false) - Whether to upload thumbnail to local media collection

**Response:**
```json
{
  "title": "How to Build a SaaS MVP in One Week",
  "description": "Learn how to rapidly build...",
  "duration": 1800,
  "thumbnailUrl": "https://i.ytimg.com/vi/...",
  "publishedDate": "2025-05-21T10:00:00Z",
  "thumbnailId": "media-id-123",
  "tagIds": ["tag-1", "tag-2"],
  "creatorId": "creator-123",
  "categoryIds": ["category-1", "category-2"]
}
```

**Features:**
- Automatically detects and creates categories based on content keywords
- Creates or finds existing creators based on YouTube channel
- Processes video tags and creates corresponding tag entities
- Optionally uploads thumbnails to local media collection
- Intelligent category mapping for indie hacker/developer content

### POST /api/seed
Seed the database with core categories for indie hackers and developers.

**Response:**
```json
{
  "success": true,
  "message": "Category seeding completed",
  "results": {
    "totalProcessed": 8,
    "created": 5,
    "existing": 3,
    "errors": 0
  },
  "details": {
    "created": [...],
    "existing": [...],
    "errors": [...]
  },
  "allCategories": [...]
}
```

### GET /api/seed
View current categories in the database.

**Response:**
```json
{
  "success": true,
  "categories": [
    {
      "id": "category-1",
      "name": "Business Strategy",
      "description": "Learn about idea validation, business models..."
    }
  ],
  "total": 8
}
```

## Legacy/Additional Endpoints

### GET /api/videos/search
Legacy search endpoint (still functional but consider using `/api/tutorials/search`).

**Query Parameters:**
- `search` or `q` - Search query
- `category` or `topic` - Category filter
- `tag` or `tool` - Tag filter
- `creator` - Creator filter
- `page`, `limit` - Pagination

### GET /api/videos/{id}
Legacy endpoint for individual video details.

## Payload CMS Built-in Endpoints

### REST API
Payload CMS automatically generates REST API endpoints for all collections:

- `GET /api/videos` - List all videos (with filtering, pagination, sorting)
- `POST /api/videos` - Create new video (authenticated)
- `GET /api/videos/{id}` - Get video by ID
- `PATCH /api/videos/{id}` - Update video (authenticated)
- `DELETE /api/videos/{id}` - Delete video (authenticated)

Similar endpoints exist for:
- `/api/categories`
- `/api/tags`
- `/api/creators`
- `/api/users`
- `/api/media`

### GraphQL API
- `GET /api/graphql` - GraphQL endpoint for complex queries
- `GET /api/graphql-playground` - GraphQL Playground interface

### Admin Panel
- `/admin` - Payload CMS admin interface
- `/admin/login` - Admin login page

## Data Model Updates

### Videos Collection Changes
- Added `isFeatured` (boolean) - Mark tutorials as featured
- Added `views` (number) - Track view count for popularity
- Added `slug` (text) - SEO-friendly URL slug (auto-generated from title)
- Added `skillLevel` (select) - Beginner, Intermediate, Advanced

### Tags Collection Changes
- Added `type` (select) - Distinguish between 'general' tags and 'tool' tags

### Categories Collection
Core categories for indie hackers and developers:
- Business Strategy
- AI & Automation
- No-Code/Low-Code
- Marketing & Growth
- Web Development
- SaaS Building
- Product Management
- Analytics & Data

## Response Format Notes

All tutorial endpoints return a consistent format with:
- `id` - Unique identifier
- `title` - Tutorial title
- `description` - Tutorial description
- `thumbnailUrl` - Direct URL to thumbnail image
- `slug` - SEO-friendly URL slug
- `channelName` - Creator/channel name
- `views` - View count
- `topics` - Array of category names
- `tools` - Array of tool/technology names (only if present)
- `skillLevel` - Difficulty level
- `publishedAt` - ISO date string
- Additional fields may be included for detailed views

## Authentication

### Access Control
- **Public Access**: Read access to published videos, categories, tags, creators
- **Authenticated Access**: Full CRUD operations on all collections
- **Admin Panel**: Full administrative interface with user management

### API Authentication
For authenticated endpoints, include JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found (for individual resources)
- `500` - Internal server error

Error responses follow this format:
```json
{
  "error": "Error message description"
}
```

## Rate Limiting & Performance

- YouTube API integration respects rate limits
- Built-in pagination for large datasets
- Optimized queries with depth control for relationships
- Automatic thumbnail caching and optimization

## Environment Variables

Required environment variables:
- `YOUTUBE_API_KEY` - For YouTube data fetching
- `DATABASE_URI` - MongoDB connection string
- `PAYLOAD_SECRET` - Payload CMS secret key
- `SMTP_*` - Email configuration (optional)
