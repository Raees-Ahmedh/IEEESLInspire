// Test the optimized analytics endpoint
fetch('http://localhost:4000/api/admin/optimized-analytics')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Optimized Analytics Response:', data);
  })
  .catch(error => {
    console.error('❌ Error:', error);
  });