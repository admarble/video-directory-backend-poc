#!/usr/bin/env node

// Test different URL patterns that could work in n8n
const testVideoId = "6832420b4458c13e98cb862f";

console.log("=== n8n Expression Testing Guide ===\n");

console.log("✅ WORKING: Hardcoded URL");
console.log("http://host.docker.internal:3001/api/videos/6832420b4458c13e98cb862f\n");

console.log("🧪 TEST THESE URL PATTERNS IN YOUR n8n WORKFLOW:\n");

console.log("1. Basic expression (what you tried):");
console.log("   http://host.docker.internal:3001/api/videos/{{$json.videoId}}\n");

console.log("2. Alternative bracket syntax:");
console.log("   http://host.docker.internal:3001/api/videos/{{ $json.videoId }}\n");

console.log("3. Node reference syntax (recommended fix):");
console.log("   http://host.docker.internal:3001/api/videos/{{ $('n8n Trigger').item.json.videoId }}\n");

console.log("4. Alternative node syntax (v2):");
console.log("   http://host.docker.internal:3001/api/videos/{{ $node['n8n Trigger'].json.videoId }}\n");

console.log("5. Direct access without spaces:");
console.log("   http://host.docker.internal:3001/api/videos/{{$json['videoId']}}\n");

console.log("6. Array index access:");
console.log("   http://host.docker.internal:3001/api/videos/{{ $input.all()[0].json.videoId }}\n");

console.log("7. Item access:");
console.log("   http://host.docker.internal:3001/api/videos/{{ $item(0).json.videoId }}\n");

console.log("=== DEBUGGING STEPS ===\n");

console.log("STEP 1: Add a Set node before HTTP Request with this code:");
console.log(`
{
  "testUrl": "http://host.docker.internal:3001/api/videos/{{ $json.videoId }}",
  "videoId": "{{ $json.videoId }}",
  "fullJson": "{{ $json }}",
  "triggerData": "{{ $('n8n Trigger').item.json }}"
}
`);

console.log("\nSTEP 2: Check what the Set node outputs to see which expression works\n");

console.log("STEP 3: Most likely fixes based on n8n version 1.88.0:");
console.log("   - Use: {{ $('n8n Trigger').item.json.videoId }}");
console.log("   - Or: {{ $node['n8n Trigger'].json.videoId }}\n");

console.log("=== QUICK TEST ===");
console.log("Replace your URL with this EXACT string:");
console.log("http://host.docker.internal:3001/api/videos/{{ $('n8n Trigger').item.json.videoId }}");
