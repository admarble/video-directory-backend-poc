# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack video directory platform built with Next.js 15.3.0 and Payload CMS 3.39.1. It features AI-powered content curation, YouTube integration, and automated categorization for educational content targeted at developers and indie hackers.

## Key Commands

### Development
```bash
npm run dev              # Start development server on port 3001
npm run dev:blazing      # Turbo mode with increased memory allocation
npm run build            # Build for production
npm run start            # Start production server
```

### Testing
```bash
npm run test             # Run all Playwright tests
npm run test:ui          # Run tests with UI
npm run test:agent       # Test AI agent system integration
```

### Infrastructure
```bash
npm run redis:start      # Start Redis container for caching
npm run docker:ai-stack  # Start full Docker stack (MongoDB, Redis, n8n)
npm run n8n:start        # Start n8n workflow automation engine
```

### Database & Setup
```bash
npm run seed-categories  # Populate initial content categories
npm run db:index         # Create MongoDB performance indexes
npm run agent:setup      # Setup AI automation user with API key
npm run cache:warm       # Pre-warm Redis cache for performance
```

### Utilities
```bash
npm run lint             # Run ESLint
npm run generate:types   # Generate TypeScript types from Payload config
npm run analytics:dashboard  # View analytics dashboard data
npm run logs:errors      # View error logs
```

## Architecture

### Core Stack
- **Next.js 15.3.0** with Turbopack support for fast development
- **Payload CMS 3.39.1** as headless CMS with MongoDB adapter
- **Redis** for caching layer (via ioredis)
- **n8n** for AI agent workflows and automation
- **Sentry** for error monitoring in production

### Project Structure
```
src/
├── app/
│   ├── (frontend)/     # Public-facing pages
│   ├── (payload)/      # Admin panel with custom analytics dashboard
│   └── api/            # API routes including AI tools
├── collections/        # Payload CMS data models
├── lib/               # Utilities (redis, analytics, media)
└── scripts/           # Database operations and utilities
```

### Key Collections
- **Videos**: YouTube video metadata with auto-categorization
- **Categories**: 8 specialized categories for developers
- **Tags**: Auto-generated from video content
- **Creators**: YouTube channel information
- **AutomationUsers**: Special users for AI agent access

### API Endpoints

#### Public APIs
- `GET /api/videos/search` - Search videos with filters
- `GET /api/stats` - Platform statistics
- `GET /api/categories/topics` - Category hierarchy
- `GET /api/public/videos/[id]` - Individual video details

#### AI Tool APIs (for n8n agents)
- `POST /api/ai-tools/create-video` - Create video with AI categorization
- `POST /api/ai-tools/update-video` - Update existing video
- `POST /api/ai-tools/enhanced-tags` - Generate enhanced tags
- `POST /api/ai-tools/skill-level` - Analyze video skill level

#### YouTube Integration
- `GET /api/youtube?url={youtube-url}` - Fetch and categorize YouTube video

### Key Features

1. **YouTube Integration**: Custom field in Videos collection that auto-fetches metadata
2. **AI Categorization**: Keyword-based categorization with 100+ specialized terms
3. **Caching Strategy**: Redis caching for videos, categories, and search results
4. **Performance Optimizations**: 
   - Database indexing on frequently queried fields
   - Turbopack for faster builds
   - Cache warming scripts
5. **Security**: Rate limiting, CORS configuration, API key authentication for agents

### Environment Variables

Required in `.env`:
```
DATABASE_URI          # MongoDB connection string
PAYLOAD_SECRET        # Secret for Payload CMS
YOUTUBE_API_KEY       # For YouTube data fetching
REDIS_URL             # Redis connection (optional, defaults to localhost)
PAYLOAD_PUBLIC_SERVER_URL  # Server URL for API calls
```

### Testing Strategy

Tests are organized by dependency:
- **Unit tests**: YouTube utilities (no server required)
- **API tests**: Server-dependent functionality
- **Integration tests**: Full workflow testing including AI agents

Run specific test categories:
```bash
npm run test:utils   # Utility functions only
npm run test:server  # Server-dependent tests
```

### AI Agent System

The project includes n8n workflow automation:
1. Create automation user: `npm run agent:setup`
2. Import workflows from `n8n-workflows/` directory
3. Workflows communicate via webhook endpoints
4. MCP server integration available in `mcp-server/` directory

### Performance Considerations

- Use Turbo mode (`npm run dev:blazing`) for faster development
- Redis caching reduces database queries by 80%
- Database indexes on: videoId, slug, categories, publishedAt
- Bundle optimization with vendorChunks configuration
- Media served via Cloudinary for optimized delivery

### Common Tasks

**Adding a new API endpoint**: Create route in `src/app/api/` following Next.js app router conventions

**Modifying collections**: Update files in `src/collections/`, then run `npm run generate:types`

**Testing AI categorization**: Use the YouTube API endpoint with any YouTube URL to see categorization logic

**Debugging performance**: Check Redis connection, run `npm run db:index`, enable performance logging

**Production deployment**: Follow checklist in PRODUCTION_LAUNCH_CHECKLIST.md