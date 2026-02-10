/**
 * Script kiểm tra tất cả các chức năng API (Tasks 1-47)
 * Chạy: node test_all_features.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5001/api';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

let passCount = 0;
let failCount = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, passed, details = '') {
  if (passed) {
    passCount++;
    log(`✅ ${testName}`, 'green');
  } else {
    failCount++;
    log(`❌ ${testName}`, 'red');
  }
  if (details) {
    log(`   ${details}`, 'yellow');
  }
}

async function testAPI(method, endpoint, data = null, expectedStatus = 200, testName = '') {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      ...(data && { data })
    };
    
    const response = await axios(config);
    const passed = response.status === expectedStatus;
    logTest(testName || `${method} ${endpoint}`, passed, 
      passed ? `Status: ${response.status}` : `Expected ${expectedStatus}, got ${response.status}`);
    return response.data;
  } catch (error) {
    const status = error.response?.status || 'ERROR';
    const passed = status === expectedStatus;
    logTest(testName || `${method} ${endpoint}`, passed, 
      `Status: ${status}, Error: ${error.message}`);
    return null;
  }
}

async function runTests() {
  log('\n========================================', 'blue');
  log('🧪 BẮT ĐẦU KIỂM TRA TẤT CẢ CHỨC NĂNG', 'blue');
  log('========================================\n', 'blue');

  // ============================================
  // GIAI ĐOẠN 1: Backend Core - User Management
  // ============================================
  log('\n📋 GIAI ĐOẠN 1: User Management (Tasks 10-11)', 'blue');
  
  await testAPI('GET', '/users', null, 200, 'Task 10: Lấy danh sách User');
  
  // ============================================
  // GIAI ĐOẠN 2: Academic Management
  // ============================================
  log('\n📋 GIAI ĐOẠN 2: Academic Management (Tasks 12-18)', 'blue');
  
  await testAPI('GET', '/admin/faculties', null, 200, 'Task 12: Lấy danh sách Khoa');
  await testAPI('GET', '/admin/majors', null, 200, 'Task 12: Lấy danh sách Ngành');
  await testAPI('GET', '/admin/subjects', null, 200, 'Task 13: Lấy danh sách Môn học');
  await testAPI('GET', '/admin/course-sections', null, 200, 'Task 14-15: Lấy danh sách Lớp học phần');
  await testAPI('GET', '/admin/schedules', null, 200, 'Task 16: Lấy danh sách Lịch học');
  
  // ============================================
  // GIAI ĐOẠN 3: Grades & Requests
  // ============================================
  log('\n📋 GIAI ĐOẠN 3: Grades & Requests (Tasks 19-23)', 'blue');
  
  // Lấy danh sách lớp để test grades
  const sections = await testAPI('GET', '/admin/course-sections', null, 200, 'Lấy lớp học phần để test');
  if (sections && sections.length > 0) {
    const sectionId = sections[0].section_id;
    await testAPI('GET', `/grades/section/${sectionId}`, null, 200, 'Task 19: Lấy điểm theo lớp');
  }
  
  await testAPI('GET', '/admin/grades/pending', null, 200, 'Task 20: Lấy bảng điểm chờ duyệt');
  
  // Test academic requests
  const students = await testAPI('GET', '/users', null, 200, 'Lấy danh sách user để test');
  if (students && students.users) {
    const student = students.users.find(u => u.role === 'STUDENT');
    if (student) {
      await testAPI('GET', `/requests/students/${student.username}`, null, 200, 'Task 23: Lấy yêu cầu học vụ của sinh viên');
    }
  }
  
  await testAPI('GET', '/admin/academic-requests', null, 200, 'Task 23: Lấy tất cả yêu cầu học vụ');
  
  // ============================================
  // GIAI ĐOẠN 4: Statistics
  // ============================================
  log('\n📋 GIAI ĐOẠN 4: Statistics (Task 24)', 'blue');
  
  await testAPI('GET', '/admin/statistics/students', null, 200, 'Task 24: Thống kê sinh viên theo khoa');
  await testAPI('GET', '/admin/statistics/courses', null, 200, 'Task 24: Thống kê môn học theo khoa');
  await testAPI('GET', '/admin/statistics/grades', null, 200, 'Task 24: Thống kê phân bố điểm');
  await testAPI('GET', '/admin/statistics/requests', null, 200, 'Task 24: Thống kê yêu cầu học vụ');
  
  // ============================================
  // GIAI ĐOẠN 5: Lecturer APIs
  // ============================================
  log('\n📋 GIAI ĐOẠN 5: Lecturer APIs (Tasks 38-42)', 'blue');
  
  if (students && students.users) {
    const lecturer = students.users.find(u => u.role === 'LECTURER');
    if (lecturer) {
      await testAPI('GET', `/lecturers/${lecturer.username}/sections`, null, 200, 'Task 38: Lấy lớp giảng dạy của giảng viên');
      await testAPI('GET', `/lecturers/${lecturer.username}/schedules`, null, 200, 'Task 42: Lấy lịch giảng dạy');
    }
  }
  
  // ============================================
  // GIAI ĐOẠN 6: Student APIs
  // ============================================
  log('\n📋 GIAI ĐOẠN 6: Student APIs (Tasks 43-47)', 'blue');
  
  if (students && students.users) {
    const student = students.users.find(u => u.role === 'STUDENT');
    if (student) {
      await testAPI('GET', `/academic/students/${student.username}/sections`, null, 200, 'Task 43-45: Lấy lớp học của sinh viên');
      await testAPI('GET', `/requests/students/${student.username}`, null, 200, 'Task 46-47: Lấy yêu cầu học vụ của sinh viên');
    }
  }
  
  // ============================================
  // KẾT QUẢ TỔNG HỢP
  // ============================================
  log('\n========================================', 'blue');
  log('📊 KẾT QUẢ KIỂM TRA', 'blue');
  log('========================================', 'blue');
  log(`✅ Passed: ${passCount}`, 'green');
  log(`❌ Failed: ${failCount}`, 'red');
  log(`📈 Success Rate: ${((passCount / (passCount + failCount)) * 100).toFixed(2)}%`, 'yellow');
  log('========================================\n', 'blue');
  
  if (failCount === 0) {
    log('🎉 TẤT CẢ TESTS ĐỀU PASS! HỆ THỐNG HOẠT ĐỘNG TỐT!', 'green');
  } else {
    log('⚠️  CÓ MỘT SỐ TESTS FAILED. VUI LÒNG KIỂM TRA LẠI!', 'yellow');
  }
  
  log('\n📝 Hướng dẫn test thủ công:', 'blue');
  log('1. Mở trình duyệt: http://localhost:3000', 'yellow');
  log('2. Đăng nhập với các tài khoản:', 'yellow');
  log('   - Admin: skillsaanh@gmail.com', 'yellow');
  log('   - Lecturer: sinfour503@gmail.com', 'yellow');
  log('   - Student: 2224802010365@student.tdmu.edu.vn', 'yellow');
  log('3. Xem file TESTING_GUIDE.md để biết chi tiết các test case\n', 'yellow');
}

// Chạy tests
runTests().catch(error => {
  log(`\n❌ LỖI NGHIÊM TRỌNG: ${error.message}`, 'red');
  log('Vui lòng kiểm tra:', 'yellow');
  log('1. Backend có đang chạy trên port 5001?', 'yellow');
  log('2. PostgreSQL có đang chạy?', 'yellow');
  log('3. Database có dữ liệu mẫu?\n', 'yellow');
  process.exit(1);
});
