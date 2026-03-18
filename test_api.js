const axios = require('axios');

async function testGradeAPI() {
    const baseURL = 'http://localhost:5001/api';
    
    try {
        console.log('🧪 Testing Grade API...');
        
        // Test 1: Get students with grades for section 39
        console.log('\n1. Testing getStudentsWithGrades for section 39...');
        const studentsResponse = await axios.get(`${baseURL}/academic/course-sections/39/students-with-grades`);
        console.log('Students data:', JSON.stringify(studentsResponse.data, null, 2));
        
        // Test 2: Save a grade
        console.log('\n2. Testing save grade...');
        const gradeData = {
            section_id: 39,
            student_id: '2224802010366',
            attendance: 7,
            midterm: 8,
            final: 9,
            lecturer_id: 'GV002'
        };
        
        const saveResponse = await axios.post(`${baseURL}/grades`, gradeData);
        console.log('Save response:', JSON.stringify(saveResponse.data, null, 2));
        
        // Test 3: Get students again to verify update
        console.log('\n3. Testing getStudentsWithGrades again after save...');
        const studentsResponse2 = await axios.get(`${baseURL}/academic/course-sections/39/students-with-grades`);
        console.log('Updated students data:', JSON.stringify(studentsResponse2.data, null, 2));
        
    } catch (error) {
        console.error('❌ API Test Error:', error.response?.data || error.message);
    }
}

testGradeAPI();