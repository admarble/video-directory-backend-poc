// Extract and validate input parameters
const input = $input.all()[0].json;

console.log('Input received:', JSON.stringify(input, null, 2));

const youtubeUrl = input.youtubeUrl;
const options = input.options || {};

console.log('YouTube URL:', youtubeUrl);
console.log('Options:', options);

// Validate YouTube URL
if (!youtubeUrl || typeof youtubeUrl !== 'string') {
  console.log('Validation failed: URL missing or not string');
  return [{
    json: {
      error: 'YouTube URL is required and must be a string',
      success: false
    }
  }];
}

// YouTube URL validation regex
const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
if (!youtubeRegex.test(youtubeUrl)) {
  console.log('Validation failed: Invalid URL format');
  return [{
    json: {
      error: 'Invalid YouTube URL format',
      success: false
    }
  }];
}

// Prepare the request payload
const payload = {
  youtubeUrl: youtubeUrl,
  enhanceTags: options.enhanceTags !== false, // default true
  analyzeSkillLevel: options.analyzeSkillLevel !== false, // default true
  uploadThumbnail: options.uploadThumbnail !== false, // default true
  published: options.published === true // default false
};

console.log('Validation passed, payload:', JSON.stringify(payload, null, 2));

return [{
  json: {
    payload: payload,
    success: true
  }
}];