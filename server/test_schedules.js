// Test script for Schedules Management
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let createdScheduleId = null;
let sectionId = null;

async function testSchedules() {
  console.log('=== Testing Schedules Management ===\n');

  // First, create a course section for testing
  console.log('Setup: Creating a course section for testing');
  try {
    const response = await axios.post(`${BASE_URL}/academic/course-sections`, {
      subject_id: 'TIN01',
      teacher_id: 'GV001',
      semester: 'HK1',
      year: '2024-2025',
      max_students: 60,
      section_code: 'TEST-SCHEDULE-SECTION'
    });
    sectionId = response.data.data.id;
    console.log('✓ Created section ID:', sectionId);
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
    return;
  }

  // Test 1: Create schedule
  console.log('\nTest 1: Create schedule');
  try {
    const response = await axios.post(`${BASE_URL}/academic/schedules`, {
      section_id: sectionId,
      day_of_week: 2,
      start_period: 1,
      end_period: 3,
      room: 'A101'
    });
    createdScheduleId = response.data.data.schedule_id;
    console.log('✓ Status:', response.status);
    console.log('✓ Message:', response.data.message);
    console.log('✓ Created schedule ID:', createdScheduleId);
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 2: Create schedule with invalid day_of_week
  console.log('\nTest 2: Create schedule with invalid day_of_week (should return 400)');
  try {
    await axios.post(`${BASE_URL}/academic/schedules`, {
      section_id: sectionId,
      day_of_week: 10,
      start_period: 1,
      end_period: 3,
      room: 'A102'
    });
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 3: Create schedule with start_period >= end_period
  console.log('\nTest 3: Create schedule with start_period >= end_period (should return 400)');
  try {
    await axios.post(`${BASE_URL}/academic/schedules`, {
      section_id: sectionId,
      day_of_week: 2,
      start_period: 5,
      end_period: 3,
      room: 'A102'
    });
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 4: Create schedule with room conflict
  console.log('\nTest 4: Create schedule with room conflict (should return 409)');
  try {
    await axios.post(`${BASE_URL}/academic/schedules`, {
      section_id: sectionId,
      day_of_week: 2,
      start_period: 2,
      end_period: 4,
      room: 'A101' // Same room, overlapping time
    });
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 5: Get schedules by course section
  console.log('\nTest 5: Get schedules by course section');
  try {
    const response = await axios.get(`${BASE_URL}/academic/course-sections/${sectionId}/schedules`);
    console.log('✓ Status:', response.status);
    console.log('✓ Found', response.data.length, 'schedule(s)');
    if (response.data.length > 0) {
      console.log('✓ Sample:', {
        schedule_id: response.data[0].schedule_id,
        day_name: response.data[0].day_name,
        start_period: response.data[0].start_period,
        end_period: response.data[0].end_period,
        room: response.data[0].room
      });
    }
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 6: Get schedule by ID
  console.log('\nTest 6: Get schedule by ID');
  try {
    const response = await axios.get(`${BASE_URL}/academic/schedules/${createdScheduleId}`);
    console.log('✓ Status:', response.status);
    console.log('✓ Data:', {
      schedule_id: response.data.schedule_id,
      subject_name: response.data.subject_name,
      day_name: response.data.day_name,
      start_period: response.data.start_period,
      end_period: response.data.end_period,
      room: response.data.room
    });
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 7: Get non-existent schedule (should return 404)
  console.log('\nTest 7: Get non-existent schedule (should return 404)');
  try {
    await axios.get(`${BASE_URL}/academic/schedules/99999`);
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 8: Update schedule
  console.log('\nTest 8: Update schedule');
  try {
    const response = await axios.put(`${BASE_URL}/academic/schedules/${createdScheduleId}`, {
      section_id: sectionId,
      day_of_week: 3,
      start_period: 4,
      end_period: 6,
      room: 'B201'
    });
    console.log('✓ Status:', response.status);
    console.log('✓ Message:', response.data.message);
    console.log('✓ Updated data:', response.data.data);
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 9: Update non-existent schedule (should return 404)
  console.log('\nTest 9: Update non-existent schedule (should return 404)');
  try {
    await axios.put(`${BASE_URL}/academic/schedules/99999`, {
      section_id: sectionId,
      day_of_week: 3,
      start_period: 4,
      end_period: 6,
      room: 'B201'
    });
  } catch (error) {
    console.log('✓ Status:', error.response?.status);
    console.log('✓ Error:', error.response?.data?.error);
  }

  // Test 10: Get student schedule (requires enrolled student)
  console.log('\nTest 10: Get student schedule');
  try {
    const response = await axios.get(`${BASE_URL}/schedules/student/212480201`);
    console.log('✓ Status:', response.status);
    console.log('✓ Found', response.data.length, 'schedule(s) for student');
    if (response.data.length > 0) {
      console.log('✓ Sample:', {
        subject_name: response.data[0].subject_name,
        lecturer_name: response.data[0].lecturer_name,
        day_name: response.data[0].day_name,
        start_period: response.data[0].start_period,
        end_period: response.data[0].end_period,
        room: response.data[0].room
      });
    }
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 11: Get lecturer schedule
  console.log('\nTest 11: Get lecturer schedule');
  try {
    const response = await axios.get(`${BASE_URL}/schedules/lecturer/GV001`);
    console.log('✓ Status:', response.status);
    console.log('✓ Found', response.data.length, 'schedule(s) for lecturer');
    if (response.data.length > 0) {
      console.log('✓ Sample:', {
        subject_name: response.data[0].subject_name,
        day_name: response.data[0].day_name,
        start_period: response.data[0].start_period,
        end_period: response.data[0].end_period,
        room: response.data[0].room,
        enrolled_count: response.data[0].enrolled_count
      });
    }
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 12: Delete schedule
  console.log('\nTest 12: Delete schedule');
  try {
    const response = await axios.delete(`${BASE_URL}/academic/schedules/${createdScheduleId}`);
    console.log('✓ Status:', response.status);
    console.log('✓ Message:', response.data.message);
  } catch (error) {
    console.log('✗ Error:', error.response?.data || error.message);
  }

  // Test 13: Delete non-existent schedule (should return 404)
  console.log('\nTest 13: Delete non-existent schedule (should return 404)');
  try {
    await axios.delete(`${BASE_URL}/academic/schedules/99999`);
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

  console.log('\n✅ All schedule tests completed!');
}

testSchedules();
