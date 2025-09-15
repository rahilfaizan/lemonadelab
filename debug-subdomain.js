// Debug script to test subdomain functionality
const axios = require('axios');

async function debugSubdomain() {
  console.log('🔍 Debugging Subdomain Issues...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:5005/');
    console.log('✅ Server is running:', healthResponse.data);
    
    // Test 2: Check what sites exist
    console.log('\n2. Checking existing sites...');
    const sitesResponse = await axios.get('http://localhost:5005/debug/sites');
    console.log('📂 Existing sites:', sitesResponse.data);
    
    // Test 3: Create a test site
    console.log('\n3. Creating test site...');
    const createResponse = await axios.post('http://localhost:5005/publish-site', {
      template: 'basic',
      color: '#3498db',
      customDomain: 'debug-test'
    });
    
    console.log('✅ Test site created:');
    console.log('   Domain:', createResponse.data.domain);
    console.log('   Site URL:', createResponse.data.siteUrl);
    console.log('   Local URL:', createResponse.data.localUrl);
    
    // Test 4: Test subdomain access
    console.log('\n4. Testing subdomain access...');
    const subdomainResponse = await axios.get('http://localhost:5005/sites/debug-test');
    console.log('✅ Subdomain access working');
    console.log('   Response length:', subdomainResponse.data.length, 'characters');
    
    // Test 5: Test with path
    console.log('\n5. Testing subdomain with path...');
    try {
      const pathResponse = await axios.get('http://localhost:5005/sites/debug-test/');
      console.log('✅ Subdomain with path working');
    } catch (error) {
      console.log('❌ Subdomain with path failed:', error.response?.status, error.response?.data);
    }
    
    console.log('\n🎉 Debug complete!');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the debug
debugSubdomain();
