// Test script for Section Students Management
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/academic';
let sectionId = null;

async function testSectionStudents() {
  console.log('=== Testing Section Students Management ===\n');

  // Setup: Create a course section for testing
  console.log('Setup: Creating a course section for testing');
  try {
    const response = await axios.post(`${BASE_URL}/course-sections`, {
      subject_id: 'TIN01',
      teacher_id: 'GV001',
      semester: 'HK1',
      year: '2024-2025',
      max_students: 3, // Small capacity for testing
      section_code: 'TEST-ENROLLMENT-SECTION'
    });
    sectionId = response.data.data.id;
    console.log('✓ Created section ID:', sectionId);
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
    return;
  }

  // Test 1: Add student to section
  console.log('\nTest 1: Add student to section');
  try {
    const response = await axios.post(`${BASE_URL}/course-sections/${sectionId}/students`, {
      student_id: '212480201'
    });
    console.log('✓ Status:', response.status);
    console.log('✓ Message:', response.data.message);
    console.log('✓ Data:', response.data.data);
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 2: Add duplicate student (should return 409)
  console.log('\nTest 2: Add duplicate student (should return 409)');
  try {
    await axios.post(`${BASE_URL}/course-sections/${sectionId}/students`, {
      student_id: '212480201'
    });
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 3: Add non-existent student (should return 400)
  console.log('\nTest 3: Add non-existent student (should return 400)');
  try {
    await axios.post(`${BASE_URL}/course-sections/${sectionId}/students`, {
      student_id: 'INVALID_STUDENT'
    });
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 4: Add student without student_id (should return 400)
  console.log('\nTest 4: Add student without student_id (should return 400)');
  try {
    await axios.post(`${BASE_URL}/course-sections/${sectionId}/students`, {});
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 5: Get students in section
  console.log('\nTest 5: Get students in section');
  try {
    const response = await axios.get(`${BASE_URL}/course-sections/${sectionId}/students`);
    console.log('✓ Status:', response.status);
    console.log('✓ Found', response.data.length, 'student(s)');
    if (response.data.length > 0) {
      console.log('✓ Sample:', {
        student_id: response.data[0].student_id,
        full_name: response.data[0].full_name,
        email: response.data[0].email,
        class_name: response.data[0].class_name
      });
    }
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 6: Get sections for student
  console.log('\nTest 6: Get sections for student');
  try {
    const response = await axios.get(`${BASE_URL}/students/212480201/sections`);
    console.log('✓ Status:', response.status);
    console.log('✓ Found', response.data.length, 'section(s)');
    if (response.data.length > 0) {
      console.log('✓ Sample:', {
        section_code: response.data[0].section_code,
        subject_name: response.data[0].subject_name,
        lecturer_name: response.data[0].lecturer_name,
        semester: response.data[0].semester
      });
    }
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 7: Bulk add students
  console.log('\nTest 7: Bulk add students');
  try {
    const response = await axios.post(`${BASE_URL}/course-sections/${sectionId}/students/bulk`, {
      student_ids: ['212480201', '212480202', 'INVALID_STUDENT', '212480203']
    });
    console.log('✓ Status:', response.status);
    console.log('✓ Message:', response.data.message);
    console.log('✓ Summary:', response.data.summary);
    console.log('✓ Successful:', response.data.details.successful);
    console.log('✓ Failed:', response.data.details.failed);
    console.log('✓ Skipped:', response.data.details.skipped);
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 8: Try to add student to full section (should return 400)
  console.log('\nTest 8: Try to add student to full section (should return 400)');
  try {
    await axios.post(`${BASE_URL}/course-sections/${sectionId}/students`, {
      student_id: '212480204'
    });
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 9: Lock section and try to add student
  console.log('\nTest 9: Lock section and try to add student (should return 400)');
  try {
    // First, lock the section
    await axios.put(`${BASE_URL}/course-sections/${sectionId}`, {
      subject_id: 'TIN01',
      teacher_id: 'GV001',
      semester: 'HK1',
      year: '2024-2025',
      max_students: 10,
      section_code: 'TEST-ENROLLMENT-SECTION',
      is_locked: true
    });
    console.log('✓ Section locked');

    // Try to add student
    await axios.post(`${BASE_URL}/course-sections/${sectionId}/students`, {
      student_id: '212480205'
    });
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Unlock section for removal test
  console.log('\nUnlocking section for removal test');
  try {
    await axios.put(`${BASE_URL}/course-sections/${sectionId}`, {
      subject_id: 'TIN01',
      teacher_id: 'GV001',
      semester: 'HK1',
      year: '2024-2025',
      max_students: 10,
      section_code: 'TEST-ENROLLMENT-SECTION',
      is_locked: false
    });
    console.log('✓ Section unlocked');
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 10: Remove student from section
  console.log('\nTest 10: Remove student from section');
  try {
    const response = await axios.delete(`${BASE_URL}/course-sections/${sectionId}/students/212480201`);
    console.log('✓ Status:', response.status);
    console.log('✓ Message:', response.data.message);
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 11: Remove non-existent enrollment (should return 404)
  console.log('\nTest 11: Remove non-existent enrollment (should return 404)');
  try {
    await axios.delete(`${BASE_URL}/course-sections/${sectionId}/students/999999`);
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 12: Verify student was removed
  console.log('\nTest 12: Verify student was removed');
  try {
    const response = await axios.get(`${BASE_URL}/course-sections/${sectionId}/students`);
    console.log('✓ Status:', response.status);
    console.log('✓ Remaining students:', response.data.length);
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Cleanup: Delete test course section
  console.log('\nCleanup: Deleting test course section');
  try {
    await axios.delete(`${BASE_URL}/course-sections/${sectionId}`);
    console.log('✓ Cleanup completed');
  } catch (error) {
    console.log('✗ Cleanup error:', error.response?.data || error.message);
  }

  console.log('\n✅ All section students tests completed!');
}

testSectionStudents();
