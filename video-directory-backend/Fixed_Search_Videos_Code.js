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

// Helper function to build query parameters manually
function buildQueryParams(params) {
  const queryParts = [];
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      // Encode key and value to handle special characters
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(String(value));
      queryParts.push(`${encodedKey}=${encodedValue}`);
    }
  }
  
  return queryParts.join('&');
}

// Build search parameters object
const searchParameters = {
  search: query.trim()
};

// Add filters if provided
if (filters.limit && typeof filters.limit === 'number') {
  searchParameters.limit = filters.limit.toString();
} else {
  searchParameters.limit = '10'; // Default limit
}

if (filters.page && typeof filters.page === 'number') {
  searchParameters.page = filters.page.toString();
}

if (filters.published !== undefined) {
  searchParameters['where[published][equals]'] = filters.published.toString();
}

if (filters.skillLevel && typeof filters.skillLevel === 'string') {
  searchParameters['where[skillLevel][equals]'] = filters.skillLevel;
}

if (filters.category && typeof filters.category === 'string') {
  searchParameters['where[categories][in]'] = filters.category;
}

if (filters.tag && typeof filters.tag === 'string') {
  searchParameters['where[tags][in]'] = filters.tag;
}

// Build the final query string
const queryString = buildQueryParams(searchParameters);

console.log('Search parameters built:', searchParameters);
console.log('Query string:', queryString);

return [{
  json: {
    searchParams: queryString,
    query: query.trim(),
    filters: filters,
    success: true,
    debug: {
      rawParameters: searchParameters,
      queryString: queryString
    }
  }
}];