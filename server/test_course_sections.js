// Simple test script for course sections API
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/academic';

async function testCreateCourseSection() {
  console.log('Testing Create Course Section API...\n');

  // Test 1: Missing required field
  console.log('Test 1: Missing subject_id (should return 400)');
  try {
    await axios.post(`${BASE_URL}/course-sections`, {
      teacher_id: 'GV001',
      semester: 'HK1',
      year: '2024-2025',
      max_students: 60,
      section_code: 'CS101-01'
    });
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 2: Invalid max_students (zero)
  console.log('\nTest 2: max_students = 0 (should return 400)');
  try {
    await axios.post(`${BASE_URL}/course-sections`, {
      subject_id: 'TIN01',
      teacher_id: 'GV001',
      semester: 'HK1',
      year: '2024-2025',
      max_students: 0,
      section_code: 'CS101-02'
    });
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 3: Empty section_code
  console.log('\nTest 3: Empty section_code (should return 400)');
  try {
    await axios.post(`${BASE_URL}/course-sections`, {
      subject_id: 'TIN01',
      teacher_id: 'GV001',
      semester: 'HK1',
      year: '2024-2025',
      max_students: 60,
      section_code: '   '
    });
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 4: Non-existent subject
  console.log('\nTest 4: Non-existent subject_id (should return 400)');
  try {
    await axios.post(`${BASE_URL}/course-sections`, {
      subject_id: 'INVALID',
      teacher_id: 'GV001',
      semester: 'HK1',
      year: '2024-2025',
      max_students: 60,
      section_code: 'CS101-03'
    });
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 5: Non-existent teacher
  console.log('\nTest 5: Non-existent teacher_id (should return 400)');
  try {
    await axios.post(`${BASE_URL}/course-sections`, {
      subject_id: 'TIN01',
      teacher_id: 'INVALID',
      semester: 'HK1',
      year: '2024-2025',
      max_students: 60,
      section_code: 'CS101-04'
    });
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 6: Valid creation (should return 201)
  console.log('\nTest 6: Valid course section (should return 201)');
  try {
    const response = await axios.post(`${BASE_URL}/course-sections`, {
      subject_id: 'TIN01',
      teacher_id: 'GV001',
      semester: 'HK1',
      year: '2024-2025',
      max_students: 60,
      section_code: 'TIN01-HK1-2024'
    });
    console.log('✓ Status:', response.status);
    console.log('✓ Message:', response.data.message);
    console.log('✓ Data:', response.data.data);
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 7: Duplicate section_code (should return 409)
  console.log('\nTest 7: Duplicate section_code (should return 409)');
  try {
    await axios.post(`${BASE_URL}/course-sections`, {
      subject_id: 'TIN01',
      teacher_id: 'GV001',
      semester: 'HK1',
      year: '2024-2025',
      max_students: 60,
      section_code: 'TIN01-HK1-2024'
    });
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  console.log('\n✅ All tests completed!');
}

testCreateCourseSection();
