// Test script for Grades Management
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const LECTURER_ID = 'GV001';
const STUDENT_ID = '212480201';
let sectionId = null;

async function testGrades() {
  console.log('=== Testing Grades Management ===\n');

  // Setup
  console.log('Setup: Creating test data');
  try {
    const sectionRes = await axios.post(`${BASE_URL}/academic/course-sections`, {
      subject_id: 'TIN01',
      teacher_id: LECTURER_ID,
      semester: 'HK1',
      year: '2024-2025',
      max_students: 60,
      section_code: 'TEST-GRADES-SECTION'
    });
    sectionId = sectionRes.data.data.id;
    
    await axios.post(`${BASE_URL}/academic/course-sections/${sectionId}/students`, {
      student_id: STUDENT_ID
    });
    console.log('✓ Setup completed');
  } catch (error) {
    console.log('✗ Setup error:', error.response?.data || error.message);
    return;
  }

  // Test 1: Enter grade
  console.log('\nTest 1: Enter grade');
  try {
    const response = await axios.post(`${BASE_URL}/grades`, {
      section_id: sectionId,
      student_id: STUDENT_ID,
      lecturer_id: LECTURER_ID,
      attendance: 8.5,
      midterm: 7.0,
      final: 8.0
    });
    console.log('✓ Status:', response.status);
    console.log('✓ Message:', response.data.message);
    console.log('✓ Calculated grades:', {
      total_10: response.data.data.total_10,
      total_4: response.data.data.total_4,
      grade_char: response.data.data.grade_char,
      status: response.data.data.status
    });
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 2: Update grade
  console.log('\nTest 2: Update grade');
  try {
    const response = await axios.post(`${BASE_URL}/grades`, {
      section_id: sectionId,
      student_id: STUDENT_ID,
      lecturer_id: LECTURER_ID,
      attendance: 9.0,
      midterm: 8.0,
      final: 9.0
    });
    console.log('✓ Status:', response.status);
    console.log('✓ Message:', response.data.message);
    console.log('✓ Updated grades:', {
      total_10: response.data.data.total_10,
      total_4: response.data.data.total_4,
      grade_char: response.data.data.grade_char
    });
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 3: Get section grades
  console.log('\nTest 3: Get section grades');
  try {
    const response = await axios.get(`${BASE_URL}/lecturers/${LECTURER_ID}/sections/${sectionId}/grades`);
    console.log('✓ Status:', response.status);
    console.log('✓ Found', response.data.length, 'grade(s)');
    if (response.data.length > 0) {
      console.log('✓ Sample:', response.data[0]);
    }
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 4: Submit grades
  console.log('\nTest 4: Submit grades');
  try {
    const response = await axios.post(`${BASE_URL}/lecturers/${LECTURER_ID}/sections/${sectionId}/grades/submit`);
    console.log('✓ Status:', response.status);
    console.log('✓ Message:', response.data.message);
    console.log('✓ Summary:', response.data.data);
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 5: Try to update submitted grade (should fail)
  console.log('\nTest 5: Try to update submitted grade (should return 403)');
  try {
    await axios.post(`${BASE_URL}/grades`, {
      section_id: sectionId,
      student_id: STUDENT_ID,
      lecturer_id: LECTURER_ID,
      attendance: 10.0,
      midterm: 10.0,
      final: 10.0
    });
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 6: Get pending grades (admin)
  console.log('\nTest 6: Get pending grades (admin)');
  try {
    const response = await axios.get(`${BASE_URL}/admin/grades/pending`);
    console.log('✓ Status:', response.status);
    console.log('✓ Found', response.data.length, 'pending section(s)');
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 7: Approve grades (admin)
  console.log('\nTest 7: Approve grades (admin)');
  try {
    const response = await axios.post(`${BASE_URL}/admin/sections/${sectionId}/grades/approve`);
    console.log('✓ Status:', response.status);
    console.log('✓ Message:', response.data.message);
    console.log('✓ Summary:', response.data.data);
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 8: Get student grades (only approved)
  console.log('\nTest 8: Get student grades (only approved)');
  try {
    const response = await axios.get(`${BASE_URL}/grades/students/${STUDENT_ID}`);
    console.log('✓ Status:', response.status);
    console.log('✓ Found', response.data.length, 'approved grade(s)');
    if (response.data.length > 0) {
      console.log('✓ Sample:', {
        subject_name: response.data[0].subject_name,
        total_10: response.data[0].total_10,
        grade_char: response.data[0].grade_char
      });
    }
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Cleanup
  console.log('\nCleanup');
  try {
    await axios.delete(`${BASE_URL}/academic/course-sections/${sectionId}`);
    console.log('✓ Cleanup completed');
  } catch (error) {
    console.log('✗ Cleanup error:', error.response?.data || error.message);
  }

  console.log('\n✅ All grades tests completed!');
}

testGrades();
