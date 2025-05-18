import { test, expect } from '@playwright/test';

// Copy the function from the API route to test it directly
function extractVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

test.describe('YouTube URL Utilities', () => {
  
  test('should extract video ID from various YouTube URL formats', () => {
    // Standard youtube.com URL
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    
    // URL with additional parameters
    expect(extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s')).toBe('dQw4w9WgXcQ');
    
    // Short youtu.be URL
    expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    
    // Embed URL
    expect(extractVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ');
    
    // Invalid URLs should return null
    expect(extractVideoId('https://www.example.com')).toBeNull();
    expect(extractVideoId('not a url')).toBeNull();
    
    // URL with invalid video ID format (not 11 characters)
    expect(extractVideoId('https://www.youtube.com/watch?v=short')).toBeNull();
  });
  
}); 