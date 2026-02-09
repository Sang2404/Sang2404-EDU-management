const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test data
let createdRequestId = null;
let createdRequestId2 = null;
const testStudentId = '212480201'; // Adjust based on your test data
const testGradeId = 1; // Adjust based on your test data

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

// Test 1: Create request with grade_id
async function test1_createRequestWithGrade() {
  try {
    const response = await axios.post(`${BASE_URL}/academic-requests`, {
      student_id: testStudentId,
      request_type: 'REVIEW',
      reason: 'Em xin phúc khảo điểm môn Lập trình Web vì em thấy điểm không phù hợp với bài làm của em.',
      grade_id: testGradeId
    });
    
    createdRequestId = response.data.data.request_id;
    logTest('Create Request with Grade ID', true, response.data);
  } catch (error) {
    logTest('Create Request with Grade ID', false, error.response?.data || error.message);
  }
}

// Test 2: Create request without grade_id
async function test2_createRequestWithoutGrade() {
  try {
    const response = await axios.post(`${BASE_URL}/academic-requests`, {
      student_id: testStudentId,
      request_type: 'RESERVE',
      reason: 'Em xin bảo lưu kết quả học tập do có việc gia đình cần giải quyết trong thời gian dài.'
    });
    
    createdRequestId2 = response.data.data.request_id;
    logTest('Create Request without Grade ID', true, response.data);
  } catch (error) {
    logTest('Create Request without Grade ID', false, error.response?.data || error.message);
  }
}

// Test 3: Create request with invalid student_id
async function test3_createRequestInvalidStudent() {
  try {
    const response = await axios.post(`${BASE_URL}/academic-requests`, {
      student_id: 'INVALID999',
      request_type: 'REVIEW',
      reason: 'This should fail because student does not exist in the system.'
    });
    
    logTest('Create Request with Invalid Student (should fail)', false, 'Should have returned 404');
  } catch (error) {
    if (error.response?.status === 404) {
      logTest('Create Request with Invalid Student (should fail)', true, error.response.data);
    } else {
      logTest('Create Request with Invalid Student (should fail)', false, error.response?.data || error.message);
    }
  }
}

// Test 4: Create request with short reason
async function test4_createRequestShortReason() {
  try {
    const response = await axios.post(`${BASE_URL}/academic-requests`, {
      student_id: testStudentId,
      request_type: 'REVIEW',
      reason: 'Too short'
    });
    
    logTest('Create Request with Short Reason (should fail)', false, 'Should have returned 400');
  } catch (error) {
    if (error.response?.status === 400) {
      logTest('Create Request with Short Reason (should fail)', true, error.response.data);
    } else {
      logTest('Create Request with Short Reason (should fail)', false, error.response?.data || error.message);
    }
  }
}

// Test 5: Get student requests
async function test5_getStudentRequests() {
  try {
    const response = await axios.get(`${BASE_URL}/academic-requests/students/${testStudentId}`);
    
    logTest('Get Student Requests', true, response.data);
  } catch (error) {
    logTest('Get Student Requests', false, error.response?.data || error.message);
  }
}

// Test 6: Get pending requests (admin)
async function test6_getPendingRequests() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/academic-requests/pending`);
    
    logTest('Get Pending Requests (Admin)', true, response.data);
  } catch (error) {
    logTest('Get Pending Requests (Admin)', false, error.response?.data || error.message);
  }
}

// Test 7: Get all requests with filters (admin)
async function test7_getAllRequestsWithFilters() {
  try {
    const response = await axios.get(`${BASE_URL}/admin/academic-requests`, {
      params: {
        type: 'REVIEW',
        status: 'PENDING'
      }
    });
    
    logTest('Get All Requests with Filters (Admin)', true, response.data);
  } catch (error) {
    logTest('Get All Requests with Filters (Admin)', false, error.response?.data || error.message);
  }
}

// Test 8: Approve request
async function test8_approveRequest() {
  if (!createdRequestId) {
    logTest('Approve Request', false, 'No request ID available from previous tests');
    return;
  }
  
  try {
    const response = await axios.post(
      `${BASE_URL}/admin/academic-requests/${createdRequestId}/approve`,
      {
        admin_response: 'Yêu cầu của bạn đã được phê duyệt. Điểm sẽ được xem xét lại trong vòng 7 ngày làm việc.'
      }
    );
    
    logTest('Approve Request', true, response.data);
  } catch (error) {
    logTest('Approve Request', false, error.response?.data || error.message);
  }
}

// Test 9: Reject request
async function test9_rejectRequest() {
  if (!createdRequestId2) {
    logTest('Reject Request', false, 'No request ID available from previous tests');
    return;
  }
  
  try {
    const response = await axios.post(
      `${BASE_URL}/admin/academic-requests/${createdRequestId2}/reject`,
      {
        admin_response: 'Yêu cầu của bạn không được chấp nhận vì không đủ căn cứ và tài liệu chứng minh.'
      }
    );
    
    logTest('Reject Request', true, response.data);
  } catch (error) {
    logTest('Reject Request', false, error.response?.data || error.message);
  }
}

// Test 10: Try to approve already processed request
async function test10_approveProcessedRequest() {
  if (!createdRequestId) {
    logTest('Approve Already Processed Request (should fail)', false, 'No request ID available');
    return;
  }
  
  try {
    const response = await axios.post(
      `${BASE_URL}/admin/academic-requests/${createdRequestId}/approve`,
      {
        admin_response: 'This should fail because request is already approved.'
      }
    );
    
    logTest('Approve Already Processed Request (should fail)', false, 'Should have returned 409');
  } catch (error) {
    if (error.response?.status === 409) {
      logTest('Approve Already Processed Request (should fail)', true, error.response.data);
    } else {
      logTest('Approve Already Processed Request (should fail)', false, error.response?.data || error.message);
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Starting Academic Requests API Tests...\n');
  console.log('⚠️  Make sure:');
  console.log('   1. Server is running on http://localhost:5000');
  console.log('   2. Database has test data (student, grades)');
  console.log('   3. Migration has been run (grade_id column added)');
  console.log('\n');
  
  await test1_createRequestWithGrade();
  await test2_createRequestWithoutGrade();
  await test3_createRequestInvalidStudent();
  await test4_createRequestShortReason();
  await test5_getStudentRequests();
  await test6_getPendingRequests();
  await test7_getAllRequestsWithFilters();
  await test8_approveRequest();
  await test9_rejectRequest();
  await test10_approveProcessedRequest();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All tests completed!');
  console.log('='.repeat(60));
  console.log('\n📝 Summary:');
  console.log('   - Created requests with and without grade_id');
  console.log('   - Tested validation (invalid student, short reason)');
  console.log('   - Retrieved student requests');
  console.log('   - Retrieved pending and all requests (admin)');
  console.log('   - Approved and rejected requests');
  console.log('   - Tested conflict prevention (409)');
  console.log('\n');
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
