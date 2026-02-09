// Test script for Course Sections CRUD operations
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/academic';
let createdSectionId = null;

async function testCourseSectionsCRUD() {
  console.log('=== Testing Course Sections CRUD Operations ===\n');

  // Test 1: Create a course section (for testing update/delete)
  console.log('Test 1: Create course section for testing');
  try {
    const response = await axios.post(`${BASE_URL}/course-sections`, {
      subject_id: 'TIN01',
      teacher_id: 'GV001',
      semester: 'HK1',
      year: '2024-2025',
      max_students: 60,
      section_code: 'TEST-CRUD-001'
    });
    createdSectionId = response.data.data.id;
    console.log('✓ Created section ID:', createdSectionId);
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
    return;
  }

  // Test 2: Get all course sections
  console.log('\nTest 2: Get all course sections');
  try {
    const response = await axios.get(`${BASE_URL}/course-sections`);
    console.log('✓ Status:', response.status);
    console.log('✓ Found', response.data.length, 'course sections');
    if (response.data.length > 0) {
      console.log('✓ Sample:', {
        section_id: response.data[0].section_id,
        subject_name: response.data[0].subject_name,
        lecturer_name: response.data[0].lecturer_name,
        section_code: response.data[0].section_code,
        enrolled_count: response.data[0].enrolled_count
      });
    }
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 3: Get all with semester filter
  console.log('\nTest 3: Get course sections filtered by semester');
  try {
    const response = await axios.get(`${BASE_URL}/course-sections?semester=HK1`);
    console.log('✓ Status:', response.status);
    console.log('✓ Found', response.data.length, 'course sections for HK1');
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 4: Get all with academic_year filter
  console.log('\nTest 4: Get course sections filtered by academic year');
  try {
    const response = await axios.get(`${BASE_URL}/course-sections?academic_year=2024-2025`);
    console.log('✓ Status:', response.status);
    console.log('✓ Found', response.data.length, 'course sections for 2024-2025');
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 5: Get single course section by ID
  console.log('\nTest 5: Get course section by ID');
  try {
    const response = await axios.get(`${BASE_URL}/course-sections/${createdSectionId}`);
    console.log('✓ Status:', response.status);
    console.log('✓ Data:', {
      section_id: response.data.section_id,
      subject_name: response.data.subject_name,
      lecturer_name: response.data.lecturer_name,
      section_code: response.data.section_code,
      enrolled_count: response.data.enrolled_count
    });
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 6: Get non-existent course section (should return 404)
  console.log('\nTest 6: Get non-existent course section (should return 404)');
  try {
    await axios.get(`${BASE_URL}/course-sections/99999`);
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 7: Update course section
  console.log('\nTest 7: Update course section');
  try {
    const response = await axios.put(`${BASE_URL}/course-sections/${createdSectionId}`, {
      subject_id: 'TIN01',
      teacher_id: 'GV001',
      semester: 'HK2',
      year: '2024-2025',
      max_students: 70,
      section_code: 'TEST-CRUD-001-UPDATED',
      room_default: 'A102',
      is_locked: false
    });
    console.log('✓ Status:', response.status);
    console.log('✓ Message:', response.data.message);
    console.log('✓ Updated data:', response.data.data);
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 8: Update with invalid data (should return 400)
  console.log('\nTest 8: Update with invalid max_students (should return 400)');
  try {
    await axios.put(`${BASE_URL}/course-sections/${createdSectionId}`, {
      subject_id: 'TIN01',
      teacher_id: 'GV001',
      semester: 'HK2',
      year: '2024-2025',
      max_students: 0,
      section_code: 'TEST-CRUD-001-UPDATED'
    });
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 9: Update non-existent course section (should return 404)
  console.log('\nTest 9: Update non-existent course section (should return 404)');
  try {
    await axios.put(`${BASE_URL}/course-sections/99999`, {
      subject_id: 'TIN01',
      teacher_id: 'GV001',
      semester: 'HK2',
      year: '2024-2025',
      max_students: 70,
      section_code: 'TEST-CRUD-999'
    });
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 10: Create another section to test duplicate section_code
  console.log('\nTest 10: Create another section');
  let secondSectionId = null;
  try {
    const response = await axios.post(`${BASE_URL}/course-sections`, {
      subject_id: 'TIN01',
      teacher_id: 'GV001',
      semester: 'HK1',
      year: '2024-2025',
      max_students: 60,
      section_code: 'TEST-CRUD-002'
    });
    secondSectionId = response.data.data.id;
    console.log('✓ Created second section ID:', secondSectionId);
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 11: Update to duplicate section_code (should return 409)
  if (secondSectionId) {
    console.log('\nTest 11: Update to duplicate section_code (should return 409)');
    try {
      await axios.put(`${BASE_URL}/course-sections/${secondSectionId}`, {
        subject_id: 'TIN01',
        teacher_id: 'GV001',
        semester: 'HK1',
        year: '2024-2025',
        max_students: 60,
        section_code: 'TEST-CRUD-001-UPDATED' // Same as first section
      });
    } catch (error) {
      console.log('✓ Status:', error.response?.status);
      console.log('✓ Error:', error.response?.data?.error);
    }
  }

  // Test 12: Delete course section
  console.log('\nTest 12: Delete course section');
  try {
    const response = await axios.delete(`${BASE_URL}/course-sections/${createdSectionId}`);
    console.log('✓ Status:', response.status);
    console.log('✓ Message:', response.data.message);
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 13: Delete second course section
  if (secondSectionId) {
    console.log('\nTest 13: Delete second course section');
    try {
      const response = await axios.delete(`${BASE_URL}/course-sections/${secondSectionId}`);
      console.log('✓ Status:', response.status);
      console.log('✓ Message:', response.data.message);
    } catch (error) {
      console.log('✗ Error:', error.response?.data || error.message);
    }
  }

  // Test 14: Delete non-existent course section (should return 404)
  console.log('\nTest 14: Delete non-existent course section (should return 404)');
  try {
    await axios.delete(`${BASE_URL}/course-sections/99999`);
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  console.log('\n✅ All CRUD tests completed!');
}

testCourseSectionsCRUD();
