import { test, expect } from '@playwright/test';

// Copy the function from the API route to test it directly
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  
  const hours = (match?.[1] && parseInt(match[1])) || 0;
  const minutes = (match?.[2] && parseInt(match[2])) || 0;
  const seconds = (match?.[3] && parseInt(match[3])) || 0;
  
  return hours * 3600 + minutes * 60 + seconds;
}

test.describe('YouTube Duration Parsing', () => {
  
  test('should correctly parse ISO 8601 duration format', () => {
    // Just seconds
    expect(parseDuration('PT30S')).toBe(30);
    
    // Minutes and seconds
    expect(parseDuration('PT5M30S')).toBe(330); // 5*60 + 30 = 330
    
    // Hours, minutes and seconds
    expect(parseDuration('PT1H30M15S')).toBe(5415); // 1*3600 + 30*60 + 15 = 5415
    
    // Hours and seconds (no minutes)
    expect(parseDuration('PT1H45S')).toBe(3645); // 1*3600 + 45 = 3645
    
    // Hours only
    expect(parseDuration('PT2H')).toBe(7200); // 2*3600 = 7200
    
    // Minutes only
    expect(parseDuration('PT45M')).toBe(2700); // 45*60 = 2700
    
    // Invalid format
    expect(parseDuration('Invalid')).toBe(0);
    
    // Empty string
    expect(parseDuration('')).toBe(0);
  });
  
}); 