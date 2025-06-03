#!/usr/bin/env node

/**
 * Gallery API Test Suite
 * Tests the gallery API endpoints including:
 * - Admin authentication
 * - Gallery image creation (Instagram posts)
 * - Gallery image retrieval
 * - Gallery image updates
 * - Gallery image deletion
 * - Public gallery access
 */

console.log('🔌 Gallery API Test Suite\n');

const BASE_URL = 'http://localhost:5000';

// Test configuration
const TEST_CONFIG = {
  adminCredentials: {
    username: 'admin',
    password: '5SAoqv3xeQLX1AL'
  },
  testInstagramUrl: 'https://www.instagram.com/p/C1KjNvOL4fV/',
  testTitle: 'Test Instagram Post for API Testing'
};

// Utility functions
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    const data = await response.text();
    let jsonData;
    try {
      jsonData = JSON.parse(data);
    } catch {
      jsonData = { message: data };
    }

    return {
      ok: response.ok,
      status: response.status,
      data: jsonData,
      headers: Object.fromEntries(response.headers.entries())
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      data: { message: error.message },
      headers: {}
    };
  }
}

async function authenticateAdmin() {
  console.log('🔐 Authenticating admin user...');
  
  const response = await makeRequest(`${BASE_URL}/api/admin-auth/verify`, {
    method: 'POST',
    body: JSON.stringify(TEST_CONFIG.adminCredentials)
  });

  if (!response.ok) {
    throw new Error(`Authentication failed: ${response.data.message}`);
  }

  if (!response.data.sessionToken) {
    throw new Error('No session token received');
  }

  console.log('✅ Admin authentication successful');
  return response.data.sessionToken;
}

function getAuthHeaders(token) {
  return {
    'Authorization': `Bearer ${token}`,
    'X-Admin-Session': token
  };
}

async function runTests() {
  let passedTests = 0;
  let totalTests = 0;
  let sessionToken;
  let createdImageId;

  try {
    // Test 1: Admin Authentication
    totalTests++;
    console.log('🧪 Test 1: Admin Authentication');
    try {
      sessionToken = await authenticateAdmin();
      console.log('✅ Authentication test passed\n');
      passedTests++;
    } catch (error) {
      console.log(`❌ Authentication test failed: ${error.message}\n`);
      return; // Can't continue without auth
    }

    // Test 2: Create Instagram Gallery Image
    totalTests++;
    console.log('🧪 Test 2: Create Instagram Gallery Image');
    try {
      const response = await makeRequest(`${BASE_URL}/api/admin/gallery/add`, {
        method: 'POST',
        headers: getAuthHeaders(sessionToken),
        body: JSON.stringify({
          instagramUrl: TEST_CONFIG.testInstagramUrl,
          title: TEST_CONFIG.testTitle,
          description: 'Test description for API testing',
          category: 'test'
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to create gallery image: ${response.data.message}`);
      }

      const imageData = response.data;
      createdImageId = imageData.id;

      // Validate response structure
      const requiredFields = ['id', 'instagramUrl', 'embedHtml', 'title', 'category', 'isActive'];
      const missingFields = requiredFields.filter(field => !(field in imageData));
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate data content
      if (imageData.instagramUrl !== 'https://www.instagram.com/p/C1KjNvOL4fV') {
        throw new Error(`Wrong instagram URL: ${imageData.instagramUrl}`);
      }

      if (!imageData.embedHtml.includes('blockquote class="instagram-media"')) {
        throw new Error('Invalid embed HTML structure');
      }

      console.log('✅ Gallery image creation test passed');
      console.log(`   Created image ID: ${createdImageId}`);
      console.log(`   Instagram URL: ${imageData.instagramUrl}`);
      console.log(`   Title: ${imageData.title}\n`);
      passedTests++;
    } catch (error) {
      console.log(`❌ Gallery image creation test failed: ${error.message}\n`);
    }

    // Test 3: Retrieve Gallery Images (Admin)
    totalTests++;
    console.log('🧪 Test 3: Retrieve Gallery Images (Admin)');
    try {
      const response = await makeRequest(`${BASE_URL}/api/admin/gallery`, {
        method: 'GET',
        headers: getAuthHeaders(sessionToken)
      });

      if (!response.ok) {
        throw new Error(`Failed to retrieve gallery images: ${response.data.message}`);
      }

      const images = response.data;
      if (!Array.isArray(images)) {
        throw new Error('Response is not an array');
      }

      if (createdImageId) {
        const createdImage = images.find(img => img.id === createdImageId);
        if (!createdImage) {
          throw new Error('Created image not found in gallery list');
        }
      }

      console.log('✅ Gallery retrieval test passed');
      console.log(`   Retrieved ${images.length} images\n`);
      passedTests++;
    } catch (error) {
      console.log(`❌ Gallery retrieval test failed: ${error.message}\n`);
    }

    // Test 4: Update Gallery Image
    if (createdImageId) {
      totalTests++;
      console.log('🧪 Test 4: Update Gallery Image');
      try {
        const updateData = {
          title: 'Updated Test Title',
          description: 'Updated description',
          category: 'updated-test'
        };

        const response = await makeRequest(`${BASE_URL}/api/admin/gallery/${createdImageId}`, {
          method: 'PUT',
          headers: getAuthHeaders(sessionToken),
          body: JSON.stringify(updateData)
        });

        if (!response.ok) {
          throw new Error(`Failed to update gallery image: ${response.data.message}`);
        }

        const updatedImage = response.data;
        if (updatedImage.title !== updateData.title) {
          throw new Error(`Title not updated: expected "${updateData.title}", got "${updatedImage.title}"`);
        }

        console.log('✅ Gallery image update test passed');
        console.log(`   Updated title: ${updatedImage.title}\n`);
        passedTests++;
      } catch (error) {
        console.log(`❌ Gallery image update test failed: ${error.message}\n`);
      }
    }

    // Test 5: Public Gallery Access
    totalTests++;
    console.log('🧪 Test 5: Public Gallery Access');
    try {
      const response = await makeRequest(`${BASE_URL}/api/gallery`, {
        method: 'GET'
      });

      if (!response.ok) {
        throw new Error(`Failed to access public gallery: ${response.data.message}`);
      }

      const images = response.data;
      if (!Array.isArray(images)) {
        throw new Error('Response is not an array');
      }

      // Should only return active images
      const inactiveImages = images.filter(img => !img.isActive);
      if (inactiveImages.length > 0) {
        throw new Error('Public gallery returned inactive images');
      }

      console.log('✅ Public gallery access test passed');
      console.log(`   Public gallery has ${images.length} active images\n`);
      passedTests++;
    } catch (error) {
      console.log(`❌ Public gallery access test failed: ${error.message}\n`);
    }

    // Test 6: Unauthorized Access Protection
    totalTests++;
    console.log('🧪 Test 6: Unauthorized Access Protection');
    try {
      const response = await makeRequest(`${BASE_URL}/api/admin/gallery`, {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token',
          'X-Admin-Session': 'invalid-token'
        }
      });

      if (response.ok) {
        throw new Error('Admin endpoint should reject invalid tokens');
      }

      if (response.status !== 401) {
        throw new Error(`Expected 401 status, got ${response.status}`);
      }

      console.log('✅ Unauthorized access protection test passed\n');
      passedTests++;
    } catch (error) {
      console.log(`❌ Unauthorized access protection test failed: ${error.message}\n`);
    }

    // Test 7: Delete Gallery Image (Cleanup)
    if (createdImageId) {
      totalTests++;
      console.log('🧪 Test 7: Delete Gallery Image');
      try {
        const response = await makeRequest(`${BASE_URL}/api/admin/gallery/${createdImageId}`, {
          method: 'DELETE',
          headers: getAuthHeaders(sessionToken)
        });

        if (!response.ok) {
          throw new Error(`Failed to delete gallery image: ${response.data.message}`);
        }

        // Verify deletion
        const verifyResponse = await makeRequest(`${BASE_URL}/api/admin/gallery`, {
          method: 'GET',
          headers: getAuthHeaders(sessionToken)
        });

        if (verifyResponse.ok) {
          const images = verifyResponse.data;
          const deletedImage = images.find(img => img.id === createdImageId);
          if (deletedImage) {
            throw new Error('Image was not properly deleted');
          }
        }

        console.log('✅ Gallery image deletion test passed');
        console.log(`   Deleted image ID: ${createdImageId}\n`);
        passedTests++;
      } catch (error) {
        console.log(`❌ Gallery image deletion test failed: ${error.message}\n`);
      }
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }

  // Summary
  console.log('📊 Test Results:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All API tests passed! Gallery API is working correctly.');
    process.exit(0);
  } else {
    console.log('\n❌ Some API tests failed. Check the output above for details.');
    process.exit(1);
  }
}

// Check if server is running
async function checkServer() {
  try {
    const response = await makeRequest(`${BASE_URL}/api/gallery`);
    return response.status !== 0;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🔍 Checking if server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('❌ Server is not running on http://localhost:5000');
    console.log('   Please start the server with: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Server is running\n');
  await runTests();
}

main().catch(console.error);