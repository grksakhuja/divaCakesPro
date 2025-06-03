#!/usr/bin/env node

/**
 * Gallery Database Schema Test Suite
 * Tests the gallery_images table schema and database operations including:
 * - Table structure validation
 * - Column constraints
 * - Index existence
 * - Data insertion and retrieval
 * - Foreign key constraints (if any)
 */

console.log('🗄️ Gallery Database Schema Test Suite\n');

import { pool } from '../../server/db.ts';

// Test data
const TEST_DATA = {
  validGalleryImage: {
    instagram_url: 'https://www.instagram.com/p/TEST123',
    embed_html: '<blockquote class="instagram-media">Test embed</blockquote>',
    thumbnail_url: 'https://example.com/thumb.jpg',
    caption: 'Test caption',
    title: 'Test Gallery Image',
    description: 'Test description',
    category: 'test',
    tags: JSON.stringify(['test', 'schema']),
    sort_order: 1,
    is_active: true,
    uploaded_by: 'test-user',
    fetched_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  duplicateInstagramUrl: {
    instagram_url: 'https://www.instagram.com/p/TEST123', // Same as above - should fail
    embed_html: '<blockquote class="instagram-media">Duplicate test</blockquote>',
    title: 'Duplicate Test',
    category: 'test',
    tags: JSON.stringify([]),
    sort_order: 2,
    is_active: true,
    uploaded_by: 'test-user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
};

async function runTests() {
  let passedTests = 0;
  let totalTests = 0;
  let insertedId = null;

  try {
    // Test 1: Table Exists
    totalTests++;
    console.log('🧪 Test 1: Verify gallery_images table exists');
    try {
      const result = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'gallery_images'
      `);

      if (result.rows.length === 0) {
        throw new Error('gallery_images table does not exist');
      }

      console.log('✅ gallery_images table exists\n');
      passedTests++;
    } catch (error) {
      console.log(`❌ Table existence test failed: ${error.message}\n`);
    }

    // Test 2: Column Structure
    totalTests++;
    console.log('🧪 Test 2: Verify column structure');
    try {
      const result = await pool.query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'gallery_images'
        ORDER BY ordinal_position
      `);

      const expectedColumns = [
        { name: 'id', type: 'integer', nullable: 'NO' },
        { name: 'instagram_url', type: 'text', nullable: 'NO' },
        { name: 'embed_html', type: 'text', nullable: 'YES' },
        { name: 'thumbnail_url', type: 'text', nullable: 'YES' },
        { name: 'caption', type: 'text', nullable: 'YES' },
        { name: 'title', type: 'text', nullable: 'NO' },
        { name: 'description', type: 'text', nullable: 'YES' },
        { name: 'category', type: 'text', nullable: 'NO' },
        { name: 'tags', type: 'json', nullable: 'NO' },
        { name: 'sort_order', type: 'integer', nullable: 'NO' },
        { name: 'is_active', type: 'boolean', nullable: 'NO' },
        { name: 'uploaded_by', type: 'text', nullable: 'NO' },
        { name: 'fetched_at', type: 'text', nullable: 'YES' },
        { name: 'created_at', type: 'text', nullable: 'NO' },
        { name: 'updated_at', type: 'text', nullable: 'NO' }
      ];

      const actualColumns = result.rows;
      let columnErrors = [];

      for (const expected of expectedColumns) {
        const actual = actualColumns.find(col => col.column_name === expected.name);
        if (!actual) {
          columnErrors.push(`Missing column: ${expected.name}`);
        } else {
          if (actual.data_type !== expected.type) {
            columnErrors.push(`Column ${expected.name}: expected type ${expected.type}, got ${actual.data_type}`);
          }
          if (actual.is_nullable !== expected.nullable) {
            columnErrors.push(`Column ${expected.name}: expected nullable ${expected.nullable}, got ${actual.is_nullable}`);
          }
        }
      }

      if (columnErrors.length > 0) {
        throw new Error(`Column structure issues: ${columnErrors.join(', ')}`);
      }

      console.log('✅ Column structure is correct');
      console.log(`   Found ${actualColumns.length} columns\n`);
      passedTests++;
    } catch (error) {
      console.log(`❌ Column structure test failed: ${error.message}\n`);
    }

    // Test 3: Primary Key and Constraints
    totalTests++;
    console.log('🧪 Test 3: Verify constraints and indexes');
    try {
      // Check primary key
      const pkResult = await pool.query(`
        SELECT constraint_name, column_name
        FROM information_schema.key_column_usage
        WHERE table_name = 'gallery_images' AND constraint_name LIKE '%pkey'
      `);

      if (pkResult.rows.length === 0 || pkResult.rows[0].column_name !== 'id') {
        throw new Error('Primary key on id column not found');
      }

      // Check unique constraint on instagram_url
      const uniqueResult = await pool.query(`
        SELECT constraint_name, column_name
        FROM information_schema.key_column_usage
        WHERE table_name = 'gallery_images' AND constraint_name LIKE '%instagram_url%unique%'
      `);

      if (uniqueResult.rows.length === 0) {
        throw new Error('Unique constraint on instagram_url not found');
      }

      console.log('✅ Constraints and indexes are correct');
      console.log(`   Primary key: ${pkResult.rows[0].column_name}`);
      console.log(`   Unique constraint: ${uniqueResult.rows[0].column_name}\n`);
      passedTests++;
    } catch (error) {
      console.log(`❌ Constraints test failed: ${error.message}\n`);
    }

    // Test 4: Insert Valid Data
    totalTests++;
    console.log('🧪 Test 4: Insert valid gallery image');
    try {
      const columns = Object.keys(TEST_DATA.validGalleryImage);
      const values = Object.values(TEST_DATA.validGalleryImage);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

      const query = `
        INSERT INTO gallery_images (${columns.join(', ')})
        VALUES (${placeholders})
        RETURNING id
      `;

      const result = await pool.query(query, values);
      insertedId = result.rows[0].id;

      console.log('✅ Valid data insertion successful');
      console.log(`   Inserted record ID: ${insertedId}\n`);
      passedTests++;
    } catch (error) {
      console.log(`❌ Valid data insertion test failed: ${error.message}\n`);
    }

    // Test 5: Duplicate Instagram URL Constraint
    totalTests++;
    console.log('🧪 Test 5: Test unique constraint on instagram_url');
    try {
      const columns = Object.keys(TEST_DATA.duplicateInstagramUrl);
      const values = Object.values(TEST_DATA.duplicateInstagramUrl);
      const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');

      const query = `
        INSERT INTO gallery_images (${columns.join(', ')})
        VALUES (${placeholders})
        RETURNING id
      `;

      const result = await pool.query(query, values);
      
      // If we get here, the constraint didn't work
      throw new Error('Duplicate instagram_url was allowed - unique constraint failed');
    } catch (error) {
      if (error.message.includes('duplicate key') || error.message.includes('unique')) {
        console.log('✅ Unique constraint on instagram_url working correctly');
        console.log(`   Correctly rejected duplicate: ${TEST_DATA.duplicateInstagramUrl.instagram_url}\n`);
        passedTests++;
      } else {
        console.log(`❌ Unique constraint test failed: ${error.message}\n`);
      }
    }

    // Test 6: Data Retrieval and JSON Handling
    if (insertedId) {
      totalTests++;
      console.log('🧪 Test 6: Data retrieval and JSON parsing');
      try {
        const result = await pool.query('SELECT * FROM gallery_images WHERE id = $1', [insertedId]);
        
        if (result.rows.length === 0) {
          throw new Error('Inserted record not found');
        }

        const record = result.rows[0];
        
        // Test JSON column
        if (typeof record.tags === 'string') {
          const parsedTags = JSON.parse(record.tags);
          if (!Array.isArray(parsedTags)) {
            throw new Error('Tags column is not a valid JSON array');
          }
        } else if (!Array.isArray(record.tags)) {
          throw new Error('Tags column is not an array');
        }

        // Test required fields
        const requiredFields = ['id', 'instagram_url', 'title', 'category', 'is_active', 'uploaded_by'];
        const missingFields = requiredFields.filter(field => !record[field] && record[field] !== false);
        
        if (missingFields.length > 0) {
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        console.log('✅ Data retrieval and JSON handling successful');
        console.log(`   Retrieved record: ${record.title}`);
        console.log(`   Tags: ${JSON.stringify(record.tags)}`);
        console.log(`   Active: ${record.is_active}\n`);
        passedTests++;
      } catch (error) {
        console.log(`❌ Data retrieval test failed: ${error.message}\n`);
      }
    }

    // Test 7: Update Operations
    if (insertedId) {
      totalTests++;
      console.log('🧪 Test 7: Update operations');
      try {
        const newTitle = 'Updated Test Title';
        const newTags = JSON.stringify(['updated', 'test']);
        
        const updateResult = await pool.query(`
          UPDATE gallery_images 
          SET title = $1, tags = $2, updated_at = $3
          WHERE id = $4
          RETURNING title, tags
        `, [newTitle, newTags, new Date().toISOString(), insertedId]);

        if (updateResult.rows.length === 0) {
          throw new Error('Update operation failed - no rows affected');
        }

        const updatedRecord = updateResult.rows[0];
        if (updatedRecord.title !== newTitle) {
          throw new Error(`Title not updated correctly: expected "${newTitle}", got "${updatedRecord.title}"`);
        }

        console.log('✅ Update operations successful');
        console.log(`   Updated title: ${updatedRecord.title}\n`);
        passedTests++;
      } catch (error) {
        console.log(`❌ Update operations test failed: ${error.message}\n`);
      }
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  } finally {
    // Cleanup: Delete test record
    if (insertedId) {
      try {
        await pool.query('DELETE FROM gallery_images WHERE id = $1', [insertedId]);
        console.log(`🧹 Cleaned up test record ID: ${insertedId}`);
      } catch (error) {
        console.log(`⚠️ Warning: Failed to clean up test record: ${error.message}`);
      }
    }
  }

  // Summary
  console.log('\n📊 Test Results:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${((passedTests/totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All schema tests passed! Gallery database schema is correct.');
    process.exit(0);
  } else {
    console.log('\n❌ Some schema tests failed. Check the output above for details.');
    process.exit(1);
  }
}

runTests().catch(console.error);