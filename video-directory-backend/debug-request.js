const http = require('http');

// Create a simple HTTP server that logs all requests
const server = http.createServer((req, res) => {
  console.log(`\n=== HTTP REQUEST DEBUG ===`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Headers:`, req.headers);
  console.log(`Full Request URL: ${req.url}`);
  
  // Parse the URL to see the video ID
  const urlParts = req.url.split('/');
  console.log(`URL Parts:`, urlParts);
  
  if (urlParts.length >= 4 && urlParts[2] === 'videos') {
    console.log(`Video ID extracted: "${urlParts[3]}"`);
    console.log(`Video ID length: ${urlParts[3] ? urlParts[3].length : 'undefined'}`);
    console.log(`Video ID type: ${typeof urlParts[3]}`);
  }
  
  console.log(`========================\n`);
  
  // Respond with the extracted info
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    method: req.method,
    url: req.url,
    urlParts: urlParts,
    videoId: urlParts[3] || null,
    headers: req.headers
  }, null, 2));
});

server.listen(3002, () => {
  console.log('Debug server running on http://localhost:3002');
  console.log('Change your n8n URL to: http://host.docker.internal:3002/api/videos/{{$json.videoId}}');
  console.log('Then run your workflow to see what URL is being requested...');
});
