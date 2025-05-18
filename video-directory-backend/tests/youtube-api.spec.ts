import { test, expect } from '@playwright/test';

test.describe('YouTube API Endpoint', () => {

  test('should return video details for valid YouTube URL', async ({ request }) => {
    // Mocking the YouTube API response is a bit complex in this direct API test,
    // so we'll perform the actual request but check the response structure.
    
    // Make sure to have YOUTUBE_API_KEY set up in your environment
    const response = await request.get('/api/youtube?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    
    // We should either get a valid response or a 500 if the API key isn't configured
    if (response.status() === 200) {
      const data = await response.json();
      
      // Check response structure
      expect(data).toHaveProperty('title');
      expect(data).toHaveProperty('description');
      expect(data).toHaveProperty('duration');
      expect(data).toHaveProperty('thumbnailUrl');
      expect(data).toHaveProperty('publishedDate');
      
      // Validate data types
      expect(typeof data.title).toBe('string');
      expect(typeof data.description).toBe('string');
      expect(typeof data.duration).toBe('number');
      expect(typeof data.thumbnailUrl).toBe('string');
      expect(typeof data.publishedDate).toBe('string');
    } else if (response.status() === 500) {
      const data = await response.json();
      expect(data.error).toBe('YouTube API key is not configured');
    }
  });
  
  test('should return error for invalid YouTube URL', async ({ request }) => {
    const response = await request.get('/api/youtube?url=https://invalid-url.com');
    
    // Check status code
    expect(response.status()).toBe(400);
    
    // Check error message
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('Invalid YouTube URL');
  });
  
  test('should return error when URL parameter is missing', async ({ request }) => {
    const response = await request.get('/api/youtube');
    
    // Check status code
    expect(response.status()).toBe(400);
    
    // Check error message
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toBe('URL parameter is required');
  });
}); 