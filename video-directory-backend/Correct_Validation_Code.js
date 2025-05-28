// Extract and validate input parameters
const input = $input.all()[0].json;
const youtubeUrl = input.youtubeUrl;
const options = input.options || {};

// Validate YouTube URL exists and is a string
if (!youtubeUrl || typeof youtubeUrl !== 'string') {
  return [{
    json: {
      error: 'YouTube URL is required and must be a string',
      success: false
    }
  }];
}

// Validate YouTube URL format
const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
if (!youtubeRegex.test(youtubeUrl)) {
  return [{
    json: {
      error: 'Invalid YouTube URL format',
      success: false
    }
  }];
}

// If validation passes, prepare the payload
const payload = {
  youtubeUrl: youtubeUrl,
  enhanceTags: options.enhanceTags !== false, // default true
  analyzeSkillLevel: options.analyzeSkillLevel !== false, // default true
  uploadThumbnail: options.uploadThumbnail !== false, // default true
  published: options.published === true // default false
};

return [{
  json: {
    payload: payload,
    success: true
  }
}];