const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const outputDir = 'd:/Do an 2/Sang2404-EDU-management/database/templates';
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function createExcel(filename, data) {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, path.join(outputDir, filename));
    console.log(`Created ${filename}`);
}

// 1. Faculties
const facultiesData = [
    { faculty_id: 'CNTT', faculty_name: 'Công nghệ Thông tin', description: 'Khoa Công nghệ Thông tin' },
    { faculty_id: 'KTDN', faculty_name: 'Kinh tế Doanh nghiệp', description: 'Khoa Kinh tế Doanh nghiệp' },
    { faculty_id: 'NN', faculty_name: 'Ngoại ngữ', description: 'Khoa Ngoại ngữ' },
    { faculty_id: 'DL', 'faculty_name': 'Du lịch', description: 'Khoa Du lịch' },
    { faculty_id: 'Y', faculty_name: 'Y học', description: 'Khoa Y học' }
];
createExcel('faculties_template.xlsx', facultiesData);

// 2. Users
const usersData = [
    { email: 'skillsaanh@gmail.com', username: 'ADMIN01', full_name: 'Quản trị viên', role: 'ADMIN', is_active: 'true' },
    { email: 'gv01@edu.vn', username: 'GV001', full_name: 'Nguyễn Văn A', role: 'LECTURER', is_active: 'true' },
    { email: 'gv02@edu.vn', username: 'GV002', full_name: 'Trần Thị B', role: 'LECTURER', is_active: 'true' },
    { email: 'gv03@edu.vn', username: 'GV003', full_name: 'Lê Văn C', role: 'LECTURER', is_active: 'true' }
];
for (let i = 1; i <= 15; i++) {
    usersData.push({ email: `sv${i}@student.edu.vn`, username: `${2224000 + i}`, full_name: `Sinh viên ${i}`, role: 'STUDENT', is_active: 'true' });
}
createExcel('users_template.xlsx', usersData);

// 3. Subjects
const subjectsData = [
    { subject_id: 'TIN01', subject_name: 'Lập trình C', credits: 3 },
    { subject_id: 'TIN02', subject_name: 'Cấu trúc dữ liệu', credits: 4 },
    { subject_id: 'TIN03', subject_name: 'Cơ sở dữ liệu', credits: 3 },
    { subject_id: 'TOAN01', subject_name: 'Toán Cao Cấp', credits: 4 },
    { subject_id: 'ENG01', subject_name: 'Tiếng Anh 1', credits: 2 },
    { subject_id: 'QT01', subject_name: 'Quản trị học', credits: 3 },
    { subject_id: 'KT01', subject_name: 'Nguyên lý kế toán', credits: 3 }
];
createExcel('subjects_template.xlsx', subjectsData);

// 4. Course Sections
const courseSectionsData = [
    { subject_id: 'TIN01', lecturer_id: 'GV001', semester: 'HK1', academic_year: '2024-2025', section_code: 'TIN01-01', max_capacity: 50, room_default: 'A101', is_locked: 'false' },
    { subject_id: 'TIN02', lecturer_id: 'GV001', semester: 'HK1', academic_year: '2024-2025', section_code: 'TIN02-01', max_capacity: 40, room_default: 'A201', is_locked: 'false' },
    { subject_id: 'TIN03', lecturer_id: 'GV002', semester: 'HK1', academic_year: '2024-2025', section_code: 'TIN03-01', max_capacity: 45, room_default: 'A301', is_locked: 'false' },
    { subject_id: 'TOAN01', lecturer_id: 'GV002', semester: 'HK1', academic_year: '2024-2025', section_code: 'TOAN01-01', max_capacity: 60, room_default: 'B101', is_locked: 'false' },
    { subject_id: 'QT01', lecturer_id: 'GV003', semester: 'HK1', academic_year: '2024-2025', section_code: 'QT01-01', max_capacity: 50, room_default: 'C101', is_locked: 'false' },
    { subject_id: 'KT01', lecturer_id: 'GV005', semester: 'HK1', academic_year: '2024-2025', section_code: 'KT01-01', max_capacity: 40, room_default: 'D101', is_locked: 'false' }
];
createExcel('course_sections_template.xlsx', courseSectionsData);

// 5. Schedules
const schedulesData = [
    { section_code: 'TIN01-01', day_of_week: 2, start_period: 1, end_period: 3, room: 'A101' },
    { section_code: 'TIN02-01', day_of_week: 2, start_period: 4, end_period: 6, room: 'A201' },
    { section_code: 'TIN03-01', day_of_week: 3, start_period: 1, end_period: 3, room: 'A301' },
    { section_code: 'TOAN01-01', day_of_week: 4, start_period: 1, end_period: 4, room: 'B101' },
    { section_code: 'QT01-01', day_of_week: 5, start_period: 1, end_period: 3, room: 'C101' },
    { section_code: 'KT01-01', day_of_week: 6, start_period: 1, end_period: 3, room: 'D101' }
];
createExcel('schedules_template.xlsx', schedulesData);
