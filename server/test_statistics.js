const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/admin/statistics';

// Helper function to log test results
const logTest = (testName, success, data = null) => {
  console.log('\n' + '='.repeat(60));
  console.log(`TEST: ${testName}`);
  console.log('='.repeat(60));
  if (success) {
    console.log('✅ SUCCESS');
    if (data) console.log('Response:', JSON.stringify(data, null, 2));
  } else {
    console.log('❌ FAILED');
    if (data) console.log('Error:', data);
  }
};

// Test 1: Get system overview
async function test1_getOverview() {
  try {
    const response = await axios.get(`${BASE_URL}/overview`);
    
    logTest('Get System Overview', true, response.data);
    
    // Verify structure
    if (!response.data.users || !response.data.students || !response.data.sections) {
      console.log('⚠️  Warning: Response structure incomplete');
    }
  } catch (error) {
    logTest('Get System Overview', false, error.response?.data || error.message);
  }
}

// Test 2: Get student statistics
async function test2_getStudentStatistics() {
  try {
    const response = await axios.get(`${BASE_URL}/students`);
    
    logTest('Get Student Statistics', true, response.data);
    
    // Verify GPA distribution
    if (response.data.gpa_distribution) {
      const totalPercentage = response.data.gpa_distribution.reduce((sum, item) => sum + item.percentage, 0);
      console.log(`\n📊 GPA Distribution Total Percentage: ${totalPercentage.toFixed(1)}%`);
    }
  } catch (error) {
    logTest('Get Student Statistics', false, error.response?.data || error.message);
  }
}

// Test 3: Get student statistics with filters
async function test3_getStudentStatisticsFiltered() {
  try {
    const response = await axios.get(`${BASE_URL}/students`, {
      params: {
        faculty_id: 'IET'
      }
    });
    
    logTest('Get Student Statistics (Filtered by Faculty)', true, response.data);
  } catch (error) {
    logTest('Get Student Statistics (Filtered by Faculty)', false, error.response?.data || error.message);
  }
}

// Test 4: Get course statistics
async function test4_getCourseStatistics() {
  try {
    const response = await axios.get(`${BASE_URL}/courses`);
    
    logTest('Get Course Statistics', true, response.data);
    
    // Verify enrollment calculations
    if (response.data.enrollment) {
      const { total_students, total_sections, average_per_section, capacity_utilization } = response.data.enrollment;
      console.log(`\n📊 Enrollment Metrics:`);
      console.log(`   Total Students: ${total_students}`);
      console.log(`   Total Sections: ${total_sections}`);
      console.log(`   Average per Section: ${average_per_section}`);
      console.log(`   Capacity Utilization: ${capacity_utilization}%`);
    }
  } catch (error) {
    logTest('Get Course Statistics', false, error.response?.data || error.message);
  }
}

// Test 5: Get course statistics with filters
async function test5_getCourseStatisticsFiltered() {
  try {
    const response = await axios.get(`${BASE_URL}/courses`, {
      params: {
        semester: 'HK1',
        academic_year: '2024-2025'
      }
    });
    
    logTest('Get Course Statistics (Filtered by Semester)', true, response.data);
  } catch (error) {
    logTest('Get Course Statistics (Filtered by Semester)', false, error.response?.data || error.message);
  }
}

// Test 6: Get grade statistics
async function test6_getGradeStatistics() {
  try {
    const response = await axios.get(`${BASE_URL}/grades`);
    
    logTest('Get Grade Statistics', true, response.data);
    
    // Verify grade distribution
    if (response.data.distribution) {
      const totalPercentage = response.data.distribution.reduce((sum, item) => sum + item.percentage, 0);
      console.log(`\n📊 Grade Distribution Total Percentage: ${totalPercentage.toFixed(1)}%`);
    }
    
    // Verify overall statistics
    if (response.data.overall) {
      const { average_grade, total_grades, pass_rate, total_passed, total_failed } = response.data.overall;
      console.log(`\n📊 Overall Grade Metrics:`);
      console.log(`   Average Grade: ${average_grade}`);
      console.log(`   Total Grades: ${total_grades}`);
      console.log(`   Pass Rate: ${pass_rate}%`);
      console.log(`   Passed: ${total_passed}, Failed: ${total_failed}`);
    }
  } catch (error) {
    logTest('Get Grade Statistics', false, error.response?.data || error.message);
  }
}

// Test 7: Get grade statistics with filters
async function test7_getGradeStatisticsFiltered() {
  try {
    const response = await axios.get(`${BASE_URL}/grades`, {
      params: {
        semester: 'HK1',
        academic_year: '2024-2025'
      }
    });
    
    logTest('Get Grade Statistics (Filtered by Semester)', true, response.data);
  } catch (error) {
    logTest('Get Grade Statistics (Filtered by Semester)', false, error.response?.data || error.message);
  }
}

// Test 8: Get request statistics
async function test8_getRequestStatistics() {
  try {
    const response = await axios.get(`${BASE_URL}/requests`);
    
    logTest('Get Request Statistics', true, response.data);
    
    // Verify type distribution
    if (response.data.by_type) {
      const totalPercentage = response.data.by_type.reduce((sum, item) => sum + item.percentage, 0);
      console.log(`\n📊 Request Type Distribution Total Percentage: ${totalPercentage.toFixed(1)}%`);
    }
    
    // Verify status distribution
    if (response.data.by_status) {
      const totalPercentage = response.data.by_status.reduce((sum, item) => sum + item.percentage, 0);
      console.log(`📊 Request Status Distribution Total Percentage: ${totalPercentage.toFixed(1)}%`);
    }
    
    // Verify processing time
    if (response.data.processing_time) {
      const { average_days, median_days, processed_count } = response.data.processing_time;
      console.log(`\n📊 Processing Time Metrics:`);
      console.log(`   Average: ${average_days} days`);
      console.log(`   Median: ${median_days} days`);
      console.log(`   Processed Count: ${processed_count}`);
    }
  } catch (error) {
    logTest('Get Request Statistics', false, error.response?.data || error.message);
  }
}

// Test 9: Get request statistics with date range
async function test9_getRequestStatisticsFiltered() {
  try {
    const response = await axios.get(`${BASE_URL}/requests`, {
      params: {
        start_date: '2024-01-01',
        end_date: '2024-12-31'
      }
    });
    
    logTest('Get Request Statistics (Filtered by Date Range)', true, response.data);
  } catch (error) {
    logTest('Get Request Statistics (Filtered by Date Range)', false, error.response?.data || error.message);
  }
}

// Test 10: Verify calculations
async function test10_verifyCalculations() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('TEST: Verify Calculations');
    console.log('='.repeat(60));
    
    // Get all statistics
    const overview = await axios.get(`${BASE_URL}/overview`);
    const students = await axios.get(`${BASE_URL}/students`);
    const courses = await axios.get(`${BASE_URL}/courses`);
    const grades = await axios.get(`${BASE_URL}/grades`);
    const requests = await axios.get(`${BASE_URL}/requests`);
    
    console.log('✅ All endpoints returned successfully');
    
    // Verify student count consistency
    const overviewStudentCount = overview.data.students.total;
    const studentStatsCount = students.data.total_students;
    console.log(`\n📊 Student Count Consistency:`);
    console.log(`   Overview: ${overviewStudentCount}`);
    console.log(`   Student Stats: ${studentStatsCount}`);
    if (overviewStudentCount === studentStatsCount) {
      console.log('   ✅ Counts match!');
    } else {
      console.log('   ⚠️  Counts do not match');
    }
    
    // Verify percentage totals
    if (students.data.gpa_distribution) {
      const gpaTotal = students.data.gpa_distribution.reduce((sum, item) => sum + item.percentage, 0);
      console.log(`\n📊 GPA Distribution Percentage Total: ${gpaTotal.toFixed(1)}%`);
      if (Math.abs(gpaTotal - 100) < 1) {
        console.log('   ✅ Percentages sum to ~100%');
      } else {
        console.log('   ⚠️  Percentages do not sum to 100%');
      }
    }
    
    if (grades.data.distribution) {
      const gradeTotal = grades.data.distribution.reduce((sum, item) => sum + item.percentage, 0);
      console.log(`\n📊 Grade Distribution Percentage Total: ${gradeTotal.toFixed(1)}%`);
      if (Math.abs(gradeTotal - 100) < 1) {
        console.log('   ✅ Percentages sum to ~100%');
      } else {
        console.log('   ⚠️  Percentages do not sum to 100%');
      }
    }
    
    // Verify pass rate calculation
    if (grades.data.overall) {
      const { total_grades, total_passed, total_failed, pass_rate } = grades.data.overall;
      const calculatedPassRate = total_grades > 0 ? (total_passed / total_grades) * 100 : 0;
      console.log(`\n📊 Pass Rate Verification:`);
      console.log(`   Reported: ${pass_rate}%`);
      console.log(`   Calculated: ${calculatedPassRate.toFixed(1)}%`);
      if (Math.abs(pass_rate - calculatedPassRate) < 0.1) {
        console.log('   ✅ Pass rate calculation correct');
      } else {
        console.log('   ⚠️  Pass rate calculation mismatch');
      }
    }
    
    console.log('\n✅ Calculation verification complete');
  } catch (error) {
    console.log('❌ FAILED');
    console.log('Error:', error.response?.data || error.message);
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Starting Statistics API Tests...\n');
  console.log('⚠️  Make sure:');
  console.log('   1. Server is running on http://localhost:5000');
  console.log('   2. Database has test data');
  console.log('   3. All previous migrations have been run');
  console.log('\n');
  
  await test1_getOverview();
  await test2_getStudentStatistics();
  await test3_getStudentStatisticsFiltered();
  await test4_getCourseStatistics();
  await test5_getCourseStatisticsFiltered();
  await test6_getGradeStatistics();
  await test7_getGradeStatisticsFiltered();
  await test8_getRequestStatistics();
  await test9_getRequestStatisticsFiltered();
  await test10_verifyCalculations();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!');
  console.log('='.repeat(60));
  console.log('\n📝 Summary:');
  console.log('   - System overview statistics');
  console.log('   - Student statistics (GPA distribution, top students)');
  console.log('   - Course statistics (enrollment, capacity utilization)');
  console.log('   - Grade statistics (distribution, pass rates)');
  console.log('   - Request statistics (types, status, processing time)');
  console.log('   - Calculation verification');
  console.log('\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
