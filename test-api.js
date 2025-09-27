#!/usr/bin/env node

// Simple test for optimized analytics API
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/admin/optimized-analytics',
  method: 'GET',
  timeout: 10000
};

console.log('🧪 Testing optimized analytics API...');
console.log('📡 Making request to: http://localhost:4000/api/admin/optimized-analytics');

const req = http.request(options, (res) => {
  console.log(`📊 Response Status: ${res.statusCode} ${res.statusMessage}`);
  console.log('📋 Response Headers:', JSON.stringify(res.headers, null, 2));
  
  let body = '';
  
  res.on('data', (chunk) => {
    body += chunk;
  });
  
  res.on('end', () => {
    try {
      if (res.statusCode === 200) {
        const data = JSON.parse(body);
        console.log('✅ Success! Analytics data received:');
        console.log('🎯 Dashboard metrics:', data.dashboard_metrics || 'missing');
        console.log('🗄️ Database completion:', data.database_completion || 'missing');
        console.log('👥 User analytics:', data.user_analytics || 'missing');
        console.log('📚 Course analytics:', data.course_analytics || 'missing');
      } else {
        console.log('❌ Error response:');
        console.log(body);
      }
    } catch (error) {
      console.log('❌ Failed to parse response:');
      console.log(body);
    }
  });
});

req.on('timeout', () => {
  console.log('⏰ Request timeout after 10 seconds');
  req.destroy();
});

req.on('error', (error) => {
  console.log('🚨 Request error:', error.message);
});

req.end();