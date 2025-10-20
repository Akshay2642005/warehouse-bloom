import fetch from 'node-fetch';

const baseUrl = 'http://localhost:4000';
const clientUrl = 'http://localhost:8080';

async function testAnalyticsEndpoint() {
  try {
    console.log('Testing analytics endpoint (should work without auth)...');
    const response = await fetch(`${baseUrl}/api/analytics/summary`);
    console.log(`Analytics endpoint status: ${response.status}`);
    if (response.ok) {
      const data = await response.json();
      console.log('Analytics data received successfully');
      console.log('✅ Analytics endpoint is now public');
    } else {
      console.log('❌ Analytics endpoint failed');
    }
  } catch (error) {
    console.log('❌ Error testing analytics:', error.message);
  }
}

async function testPublicPages() {
  try {
    console.log('Testing public pages...');
    
    // Test root page
    const rootResponse = await fetch(clientUrl);
    console.log(`Root page status: ${rootResponse.status}`);
    if (rootResponse.ok) {
      console.log('✅ Root page is now public');
    } else {
      console.log('❌ Root page failed');
    }
    
    // Test analytics page
    const analyticsResponse = await fetch(`${clientUrl}/analytics`);
    console.log(`Analytics page status: ${analyticsResponse.status}`);
    if (analyticsResponse.ok) {
      console.log('✅ Analytics page is accessible');
    } else {
      console.log('❌ Analytics page failed');
    }
    
  } catch (error) {
    console.log('❌ Error testing public pages:', error.message);
  }
}

async function main() {
  console.log('🔧 Testing critical fixes...\n');
  
  await testAnalyticsEndpoint();
  console.log('');
  await testPublicPages();
  
  console.log('\n✨ Testing completed!');
}

main();