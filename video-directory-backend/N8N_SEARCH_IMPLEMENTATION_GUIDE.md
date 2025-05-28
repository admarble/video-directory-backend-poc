# n8n Search Videos Tool - Implementation Guide

## Overview
This implementation uses your Payload CMS `/api/tutorials/search` endpoint directly, which is the recommended best practice.

## Workflow Structure

1. **JavaScript Code Node** (Parameter Validation)
2. **HTTP Request Node** (Payload CMS API Call)
3. **Response Processing Node** (Optional formatting)

## Configuration

### 1. JavaScript Code Node
Use the `Search_Videos_Payload_CMS.js` code to validate inputs and build the API URL.

**Input Format:**
```json
{
  "query": "React tutorials",
  "filters": {
    "skillLevel": "beginner",
    "topic": "Web Development",
    "tool": "React",
    "page": 1,
    "limit": 12
  }
}
```

### 2. HTTP Request Node Configuration

**Method:** GET
**URL:** `{{ $node["JavaScript Code"].json["url"] }}`

**Base URL Options:**
- If running locally: `http://localhost:3000{{ $node["JavaScript Code"].json["url"] }}`
- If using custom domain: `https://your-domain.com{{ $node["JavaScript Code"].json["url"] }}`

**Headers:**
```
Content-Type: application/json
Accept: application/json
```

**Authentication:** 
- If your API requires auth, add Bearer token or API key header
- For public search endpoints, usually no auth required

### 3. Expected Response Format

Based on your API_ENDPOINTS.md, the response will be:

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
      "topics": ["SaaS", "MVP"],
      "tools": ["React", "Node.js"],
      "skillLevel": "beginner",
      "publishedAt": "2025-05-21T10:00:00Z"
    }
  ],
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

## Alternative Endpoints (from your API)

### If you want different search behaviors:

1. **Featured Videos:** `/api/tutorials/featured`
2. **Latest Videos:** `/api/tutorials/latest`
3. **Popular Videos:** `/api/tutorials/popular`
4. **Legacy Search:** `/api/videos/search` (still functional)

## Advanced Configuration

### Using Payload CMS Built-in REST API
For more complex queries, you can also use the native Payload endpoints:

```
GET /api/videos?where[title][contains]=your-search-term&limit=10&page=1
```

### Error Handling
Your HTTP Request node should handle these status codes:
- `200` - Success
- `400` - Bad Request (invalid parameters)
- `404` - Not found
- `500` - Server error

## Security Considerations

1. **Rate Limiting:** Your Payload CMS may have rate limits
2. **Authentication:** Add proper auth headers if required
3. **Input Validation:** The JavaScript node validates all inputs
4. **CORS:** Ensure your CMS allows requests from n8n domain

## Benefits of This Approach

✅ **Performance:** Leverages Payload CMS's optimized search
✅ **Consistency:** Uses your existing API specification
✅ **Maintainability:** Changes only needed in one place
✅ **Security:** Proper authentication through Payload CMS
✅ **Features:** Full access to pagination, filtering, sorting
✅ **Type Safety:** Consistent response format
✅ **Caching:** Payload CMS can implement caching strategies

## Environment Variables for HTTP Request

If using authentication, set these in your n8n environment:

```
PAYLOAD_CMS_BASE_URL=http://localhost:3000
PAYLOAD_CMS_API_KEY=your-api-key-here
```

Then use in HTTP Request node:
- URL: `{{ $env.PAYLOAD_CMS_BASE_URL }}{{ $node["JavaScript Code"].json["url"] }}`
- Headers: `Authorization: Bearer {{ $env.PAYLOAD_CMS_API_KEY }}`