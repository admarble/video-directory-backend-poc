const { execSync } = require('child_process');

const testVideo = {
  title: "How to Build a Simple Web App",
  description: "Learn the basics of building a web application from scratch using modern technologies. This tutorial covers everything from setting up your development environment to deploying your first app.",
  videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  duration: 1200,
  published: true,
  publishedDate: new Date().toISOString(),
  isFeatured: true,
  skillLevel: "beginner",
  views: 150
};

// Create the video via curl
const command = `curl -X POST http://localhost:3001/api/videos \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(testVideo)}'`;

try {
  console.log('Creating test video...');
  const result = execSync(command, { encoding: 'utf8' });
  console.log('Response:', result);
} catch (error) {
  console.error('Error creating video:', error.message);
}
