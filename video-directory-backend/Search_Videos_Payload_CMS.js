// Search Videos Tool - Payload CMS Integration
// This tool uses the Payload CMS search API endpoint directly

// Extract and validate input parameters
const input = $input.all()[0].json;
const query = input.query;
const filters = input.filters || {};

console.log('Search input received:', JSON.stringify(input, null, 2));

// Validate query
if (!query || typeof query !== 'string') {
  console.log('Validation failed: Search query is required');
  return [{
    json: {
      error: 'Search query is required and must be a string',
      success: false
    }
  }];
}

// Build search parameters for Payload CMS API
// Based on your API_ENDPOINTS.md: /api/tutorials/search
const searchParams = [];

// Main search query
searchParams.push(`q=${encodeURIComponent(query.trim())}`);

// Add filters based on your API specification
if (filters.topic && typeof filters.topic === 'string') {
  searchParams.push(`topic=${encodeURIComponent(filters.topic)}`);
}

if (filters.tool && typeof filters.tool === 'string') {
  searchParams.push(`tool=${encodeURIComponent(filters.tool)}`);
}

if (filters.skillLevel && typeof filters.skillLevel === 'string') {
  searchParams.push(`skillLevel=${encodeURIComponent(filters.skillLevel)}`);
}

if (filters.creator && typeof filters.creator === 'string') {
  searchParams.push(`creator=${encodeURIComponent(filters.creator)}`);
}

// Pagination
if (filters.page && typeof filters.page === 'number') {
  searchParams.push(`page=${filters.page}`);
} else {
  searchParams.push('page=1');
}

if (filters.limit && typeof filters.limit === 'number') {
  searchParams.push(`limit=${filters.limit}`);
} else {
  searchParams.push('limit=12'); // Default from your API spec
}

const queryString = searchParams.join('&');
const fullUrl = `/api/tutorials/search?${queryString}`;

console.log('Payload CMS search URL:', fullUrl);
console.log('Search parameters:', searchParams);

// Return the URL and parameters for the HTTP Request node
return [{
  json: {
    url: fullUrl,
    searchQuery: query.trim(),
    filters: filters,
    success: true,
    debug: {
      queryString: queryString,
      fullUrl: fullUrl
    }
  }
}];