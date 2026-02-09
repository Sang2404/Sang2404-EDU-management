// Test script for Lecturer Sections
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const LECTURER_ID = 'GV001';
let sectionId = null;

async function testLecturerSections() {
  console.log('=== Testing Lecturer Sections ===\n');

  // Setup: Create a course section for testing
  console.log('Setup: Creating a course section for testing');
  try {
    const response = await axios.post(`${BASE_URL}/academic/course-sections`, {
      subject_id: 'TIN01',
      teacher_id: LECTURER_ID,
      semester: 'HK1',
      year: '2024-2025',
      max_students: 60,
      section_code: 'TEST-LECTURER-SECTION'
    });
    sectionId = response.data.data.id;
    console.log('✓ Created section ID:', sectionId);

    // Add some students
    await axios.post(`${BASE_URL}/academic/course-sections/${sectionId}/students`, {
      student_id: '212480201'
    });
    console.log('✓ Added student to section');

    // Add schedule
    await axios.post(`${BASE_URL}/academic/schedules`, {
      section_id: sectionId,
      day_of_week: 2,
      start_period: 1,
      end_period: 3,
      room: 'A101'
    });
    console.log('✓ Added schedule to section');
  } catch (error) {
    console.log('✗ Setup error:', error.response?.data || error.message);
    return;
  }

  // Test 1: Get lecturer's sections (no filter)
  console.log('\nTest 1: Get lecturer\'s sections (no filter)');
  try {
    const response = await axios.get(`${BASE_URL}/lecturers/${LECTURER_ID}/sections`);
    console.log('✓ Status:', response.status);
    console.log('✓ Found', response.data.length, 'section(s)');
    if (response.data.length > 0) {
      console.log('✓ Sample:', {
        section_code: response.data[0].section_code,
        subject_name: response.data[0].subject_name,
        semester: response.data[0].semester,
        enrolled_count: response.data[0].enrolled_count,
        schedules_count: response.data[0].schedules.length
      });
    }
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 2: Get lecturer's sections with semester filter
  console.log('\nTest 2: Get lecturer\'s sections with semester filter');
  try {
    const response = await axios.get(`${BASE_URL}/lecturers/${LECTURER_ID}/sections?semester=HK1`);
    console.log('✓ Status:', response.status);
    console.log('✓ Found', response.data.length, 'section(s) for HK1');
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 3: Get lecturer's sections with academic_year filter
  console.log('\nTest 3: Get lecturer\'s sections with academic_year filter');
  try {
    const response = await axios.get(`${BASE_URL}/lecturers/${LECTURER_ID}/sections?academic_year=2024-2025`);
    console.log('✓ Status:', response.status);
    console.log('✓ Found', response.data.length, 'section(s) for 2024-2025');
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 4: Get lecturer's sections with both filters
  console.log('\nTest 4: Get lecturer\'s sections with both filters');
  try {
    const response = await axios.get(`${BASE_URL}/lecturers/${LECTURER_ID}/sections?semester=HK1&academic_year=2024-2025`);
    console.log('✓ Status:', response.status);
    console.log('✓ Found', response.data.length, 'section(s) for HK1 2024-2025');
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 5: Get section details (success)
  console.log('\nTest 5: Get section details (success)');
  try {
    const response = await axios.get(`${BASE_URL}/lecturers/${LECTURER_ID}/sections/${sectionId}`);
    console.log('✓ Status:', response.status);
    console.log('✓ Section:', {
      section_code: response.data.section_code,
      subject_name: response.data.subject_name,
      enrolled_count: response.data.enrolled_count,
      students_count: response.data.students.length,
      schedules_count: response.data.schedules.length
    });
    if (response.data.students.length > 0) {
      console.log('✓ Sample student:', {
        student_id: response.data.students[0].student_id,
        full_name: response.data.students[0].full_name
      });
    }
    if (response.data.schedules.length > 0) {
      console.log('✓ Sample schedule:', {
        day_name: response.data.schedules[0].day_name,
        start_period: response.data.schedules[0].start_period,
        end_period: response.data.schedules[0].end_period,
        room: response.data.schedules[0].room
      });
    }
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 6: Get section details (not assigned - should return 403)
  console.log('\nTest 6: Get section details (not assigned - should return 403)');
  try {
    await axios.get(`${BASE_URL}/lecturers/GV999/sections/${sectionId}`);
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 7: Get section details (not found - should return 404)
  console.log('\nTest 7: Get section details (not found - should return 404)');
  try {
    await axios.get(`${BASE_URL}/lecturers/${LECTURER_ID}/sections/99999`);
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 8: Get lecturer statistics (no filter)
  console.log('\nTest 8: Get lecturer statistics (no filter)');
  try {
    const response = await axios.get(`${BASE_URL}/lecturers/${LECTURER_ID}/statistics`);
    console.log('✓ Status:', response.status);
    console.log('✓ Lecturer:', response.data.full_name);
    console.log('✓ Statistics:', {
      total_sections: response.data.statistics.total_sections,
      total_students: response.data.statistics.total_students,
      average_class_size: response.data.statistics.average_class_size
    });
    if (response.data.statistics.sections_by_subject.length > 0) {
      console.log('✓ Sections by subject:', response.data.statistics.sections_by_subject);
    }
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 9: Get lecturer statistics with filters
  console.log('\nTest 9: Get lecturer statistics with filters');
  try {
    const response = await axios.get(`${BASE_URL}/lecturers/${LECTURER_ID}/statistics?semester=HK1&academic_year=2024-2025`);
    console.log('✓ Status:', response.status);
    console.log('✓ Semester:', response.data.semester);
    console.log('✓ Academic Year:', response.data.academic_year);
    console.log('✓ Statistics:', {
      total_sections: response.data.statistics.total_sections,
      total_students: response.data.statistics.total_students,
      average_class_size: response.data.statistics.average_class_size
    });
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 10: Get statistics for non-existent lecturer (should return 404)
  console.log('\nTest 10: Get statistics for non-existent lecturer (should return 404)');
  try {
    await axios.get(`${BASE_URL}/lecturers/INVALID_LECTURER/statistics`);
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Cleanup: Delete test course section
  console.log('\nCleanup: Deleting test course section');
  try {
    await axios.delete(`${BASE_URL}/academic/course-sections/${sectionId}`);
    console.log('✓ Cleanup completed');
  } catch (error) {
    console.log('✗ Cleanup error:', error.response?.data || error.message);
  }

  console.log('\n✅ All lecturer sections tests completed!');
}

testLecturerSections();
