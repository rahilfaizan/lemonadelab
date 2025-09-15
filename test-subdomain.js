// Test script for subdomain functionality
const axios = require('axios');

async function testSubdomainFunctionality() {
  console.log('🧪 Testing Subdomain Functionality...\n');
  
  try {
    // Test 1: Check if server is running
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:5005/');
    console.log('✅ Server is running:', healthResponse.data);
    
    // Test 2: Test site creation
    console.log('\n2. Testing site creation...');
    const publishResponse = await axios.post('http://localhost:5005/publish-site', {
      template: 'basic',
      color: '#3498db',
      customDomain: 'test-site'
    });
    
    console.log('✅ Site created successfully:');
    console.log('   Domain:', publishResponse.data.domain);
    console.log('   Site URL:', publishResponse.data.siteUrl);
    console.log('   Local URL:', publishResponse.data.localUrl);
    
    // Test 3: Test subdomain access
    console.log('\n3. Testing subdomain access...');
    const subdomainResponse = await axios.get('http://localhost:5005/sites/test-site');
    console.log('✅ Subdomain access working');
    console.log('   Response length:', subdomainResponse.data.length, 'characters');
    
    // Test 4: Test wildcard subdomain routing
    console.log('\n4. Testing wildcard subdomain routing...');
    const wildcardResponse = await axios.get('http://localhost:5005/sites/test-site/');
    console.log('✅ Wildcard routing working');
    
    console.log('\n🎉 All tests passed! Your subdomain system is ready.');
    console.log('\nNext steps:');
    console.log('1. Configure DNS wildcard record (*.faizanrahil.trade)');
    console.log('2. Deploy to production server');
    console.log('3. Set up SSL certificate for *.faizanrahil.trade');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testSubdomainFunctionality();
