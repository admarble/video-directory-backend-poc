# Video Directory Backend - Indie Hacker Edition

A specialized video directory backend built with Payload CMS 3.33.0, tailored for indie hackers, developers, and entrepreneurs. Features intelligent category detection and automated content curation from YouTube.

## 🎯 Core Features

- **Smart YouTube Integration**: Automatically extracts and categorizes video content
- **Specialized Categories**: 8 focused categories for indie hackers and developers
- **Auto-Content Creation**: Automatically creates creators, categories, and tags
- **Advanced Keyword Detection**: Over 100 specialized keywords for accurate categorization
- **Thumbnail Management**: Optional automatic thumbnail downloading and storage

## 🏗️ Core Categories

1. **Business Strategy** - Idea validation, business models, pricing strategies
2. **AI & Automation** - AI tools, Cursor, Copilot, workflow automation
3. **No-Code/Low-Code** - Supabase, Webflow, Zapier, visual builders
4. **Marketing & Growth** - SEO, growth hacking, viral marketing
5. **Web Development** - React, Next.js, full-stack development
6. **SaaS Building** - Subscription models, user onboarding, SaaS metrics
7. **Product Management** - UX/UI, user research, product roadmaps
8. **Analytics & Data** - Tracking, KPIs, data-driven decisions

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file with:
```env
YOUTUBE_API_KEY=your-youtube-api-key
DATABASE_URI=your-mongodb-uri
PAYLOAD_SECRET=your-secret-key
```

### 3. Seed Core Categories
```bash
npm run seed-categories
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3001/admin` to access the admin panel.

## 📖 Usage

### Adding YouTube Videos

1. Navigate to `Collections > Videos > Create New`
2. Enter a YouTube URL in the "YouTube Video URL" field
3. Click "Fetch YouTube Data" in the sidebar
4. Watch as the form auto-populates with:
   - Title and description
   - Duration and publish date
   - Automatically detected categories
   - Creator information
   - Relevant tags
   - Optional thumbnail

### Category Detection

The system intelligently categorizes content using:
- YouTube's primary category mapping
- Advanced keyword analysis of titles and descriptions
- Fallback to "Web Development" if no categories detected

## 🛠️ Development

### Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run test suite
- `npm run seed-categories` - Populate core categories
- `npm run generate:types` - Generate TypeScript types

### Project Structure
```
src/
├── collections/        # Payload collections (Videos, Categories, etc.)
├── fields/            # Custom fields (YouTube integration)
├── app/api/           # API routes
├── scripts/           # Utility scripts
└── globals/           # Global configurations
```

## 🔧 Customization

### Adding New Categories
1. Update `CATEGORY_KEYWORDS` in `/src/app/api/youtube/route.ts`
2. Run the seed script to add new categories
3. Restart the development server

### Modifying Keyword Detection
Edit the keyword arrays in `/src/app/api/youtube/route.ts` to improve categorization accuracy for your specific use cases.

## 📊 API Endpoints

- `GET /api/youtube?url={youtube-url}` - Fetch video metadata and categorize
- Standard Payload CMS REST and GraphQL APIs for all collections

## 🧪 Testing

The project includes comprehensive tests for:
- YouTube URL parsing and validation
- Category detection algorithms
- API integration functionality

Run tests with: `npm test`

## 📚 Documentation

- [YouTube Integration Guide](./YOUTUBE_INTEGRATION_GUIDE.md) - Detailed setup and usage
- [Payload CMS Docs](https://payloadcms.com/docs) - Official Payload documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🎉 What's Next?

- [ ] Add subcategories for more granular organization
- [ ] Implement learning paths connecting related videos
- [ ] Add difficulty levels (Beginner, Intermediate, Advanced)
- [ ] Create recommendation engine based on user preferences
- [ ] Add community features like comments and ratings

Built with ❤️ for the indie hacker community.
