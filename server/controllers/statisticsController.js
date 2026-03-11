const pool = require('../config/db');

// Helper functions for Vietnamese labels
const getGPALabel = (range) => {
  const labels = {
    '3.60-4.00': 'Xuất sắc',
    '3.20-3.59': 'Giỏi',
    '2.50-3.19': 'Khá',
    '2.00-2.49': 'Trung bình',
    '0.00-1.99': 'Yếu'
  };
  return labels[range] || '';
};

const getGradeLabel = (grade) => {
  const labels = {
    'A': 'Xuất sắc',
    'B+': 'Giỏi',
    'B': 'Giỏi',
    'C+': 'Khá',
    'C': 'Khá',
    'D+': 'Trung bình',
    'D': 'Trung bình',
    'F': 'Yếu'
  };
  return labels[grade] || '';
};

const getRequestTypeDisplay = (type) => {
  const types = {
    'REVIEW': 'Phúc khảo điểm',
    'RESERVE': 'Bảo lưu',
    'RETAKE': 'Học lại'
  };
  return types[type] || type;
};

const getStatusDisplay = (status) => {
  const statuses = {
    'PENDING': 'Đang chờ xử lý',
    'APPROVED': 'Đã phê duyệt',
    'REJECTED': 'Đã từ chối'
  };
  return statuses[status] || status;
};

exports.getOverview = async (req, res) => {
  try {
    // Count users
    const usersQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active,
        COUNT(*) FILTER (WHERE is_active = false) as inactive,
        COUNT(*) FILTER (WHERE role = 'ADMIN') as admin_count,
        COUNT(*) FILTER (WHERE role = 'LECTURER') as lecturer_count,
        COUNT(*) FILTER (WHERE role = 'STUDENT') as student_count
      FROM users
    `;
    const usersResult = await pool.query(usersQuery);
    const users = usersResult.rows[0];
    
    // Count students by status
    const studentsQuery = `
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'STUDYING') as studying,
        COUNT(*) FILTER (WHERE status = 'RESERVED') as reserved,
        COUNT(*) FILTER (WHERE status = 'GRADUATED') as graduated,
        COUNT(*) FILTER (WHERE status = 'DROPPED') as dropped
      FROM students
    `;
    const studentsResult = await pool.query(studentsQuery);
    const students = studentsResult.rows[0];
    
    // Count lecturers
    const lecturersResult = await pool.query('SELECT COUNT(*) as total FROM lecturers');
    const lecturers = lecturersResult.rows[0];
    
    // Count subjects
    const subjectsResult = await pool.query('SELECT COUNT(*) as total FROM subjects');
    const subjects = subjectsResult.rows[0];
    
    // Count sections
    const sectionsResult = await pool.query('SELECT COUNT(*) as total FROM course_sections');
    const sections = { total: parseInt(sectionsResult.rows[0].total) };
    
    // Get current semester
    const currentSemesterQuery = `
      SELECT semester, academic_year, COUNT(*) as count
      FROM course_sections
      GROUP BY semester, academic_year
      ORDER BY academic_year DESC, semester DESC
      LIMIT 1
    `;
    const currentSemesterResult = await pool.query(currentSemesterQuery);
    const currentSemester = currentSemesterResult.rows[0] || { semester: null, academic_year: null, count: 0 };
    sections.current_semester = parseInt(currentSemester.count);
    
    // Get top students by GPA
    const topStudentsQuery = `
      SELECT 
        s.student_id,
        u.full_name,
        s.gpa_accumulated as gpa,
        c.class_name
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      LEFT JOIN classes c ON s.class_id = c.class_id
      WHERE s.status = 'STUDYING'
      ORDER BY s.gpa_accumulated DESC
      LIMIT 5
    `;
    const topStudentsResult = await pool.query(topStudentsQuery);
    const topStudents = topStudentsResult.rows.map(row => ({
      student_id: row.student_id,
      full_name: row.full_name,
      gpa: parseFloat(row.gpa),
      class_name: row.class_name
    }));
    
    // Get top subjects by enrollment
    const topSubjectsQuery = `
      SELECT 
        sub.subject_id,
        sub.subject_name,
        COUNT(DISTINCT cs.section_id) as sections,
        COUNT(DISTINCT ss.student_id) as total_students,
        ROUND(AVG(g.total_10), 2) as average_grade
      FROM subjects sub
      LEFT JOIN course_sections cs ON sub.subject_id = cs.subject_id
      LEFT JOIN section_students ss ON cs.section_id = ss.section_id
      LEFT JOIN grades g ON ss.student_id = g.student_id AND cs.section_id = g.section_id AND g.status = 'APPROVED'
      GROUP BY sub.subject_id, sub.subject_name
      HAVING COUNT(DISTINCT ss.student_id) > 0
      ORDER BY total_students DESC
      LIMIT 5
    `;
    const topSubjectsResult = await pool.query(topSubjectsQuery);
    const topSubjects = topSubjectsResult.rows.map(row => ({
      subject_id: row.subject_id,
      subject_name: row.subject_name,
      sections: parseInt(row.sections),
      total_students: parseInt(row.total_students),
      average_grade: parseFloat(row.average_grade) || 0
    }));
    
    res.json({
      users: {
        total: parseInt(users.total),
        active: parseInt(users.active),
        inactive: parseInt(users.inactive),
        by_role: {
          ADMIN: parseInt(users.admin_count),
          LECTURER: parseInt(users.lecturer_count),
          STUDENT: parseInt(users.student_count)
        }
      },
      students: {
        total: parseInt(students.total),
        by_status: {
          STUDYING: parseInt(students.studying),
          RESERVED: parseInt(students.reserved),
          GRADUATED: parseInt(students.graduated),
          DROPPED: parseInt(students.dropped)
        }
      },
      lecturers: {
        total: parseInt(lecturers.total)
      },
      subjects: {
        total: parseInt(subjects.total)
      },
      sections,
      current_semester: {
        semester: currentSemester.semester,
        academic_year: currentSemester.academic_year
      },
      top_students: topStudents,
      top_subjects: topSubjects
    });
  } catch (error) {
    console.error('Error getting overview:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentStatistics = async (req, res) => {
  try {
    const { faculty_id, major_id } = req.query;
    
    // Build WHERE clause for filters
    let whereClause = '1=1';
    const params = [];
    
    if (faculty_id) {
      params.push(faculty_id);
      whereClause += ` AND m.faculty_id = $${params.length}`;
    }
    
    if (major_id) {
      params.push(major_id);
      whereClause += ` AND c.major_id = $${params.length}`;
    }
    
    // GPA distribution
    const gpaQuery = `
      SELECT 
        CASE 
          WHEN s.gpa_accumulated >= 3.6 THEN '3.60-4.00'
          WHEN s.gpa_accumulated >= 3.2 THEN '3.20-3.59'
          WHEN s.gpa_accumulated >= 2.5 THEN '2.50-3.19'
          WHEN s.gpa_accumulated >= 2.0 THEN '2.00-2.49'
          ELSE '0.00-1.99'
        END as range,
        COUNT(*) as count
      FROM students s
      LEFT JOIN classes c ON s.class_id = c.class_id
      LEFT JOIN majors m ON c.major_id = m.major_id
      WHERE ${whereClause}
      GROUP BY range
      ORDER BY range DESC
    `;
    const gpaResult = await pool.query(gpaQuery, params);
    const totalStudents = gpaResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    const gpaDistribution = gpaResult.rows.map(row => ({
      range: row.range,
      label: getGPALabel(row.range),
      count: parseInt(row.count),
      percentage: totalStudents > 0 ? Math.round((parseInt(row.count) / totalStudents) * 1000) / 10 : 0
    }));
    
    // Students by faculty
    const facultyQuery = `
      SELECT 
        f.faculty_id,
        f.faculty_name,
        COUNT(s.student_id) as count
      FROM faculties f
      LEFT JOIN majors m ON f.faculty_id = m.faculty_id
      LEFT JOIN classes c ON m.major_id = c.major_id
      LEFT JOIN students s ON c.class_id = s.class_id
      GROUP BY f.faculty_id, f.faculty_name
      HAVING COUNT(s.student_id) > 0
      ORDER BY count DESC
    `;
    const facultyResult = await pool.query(facultyQuery);
    const byFaculty = facultyResult.rows.map(row => ({
      faculty_id: row.faculty_id,
      faculty_name: row.faculty_name,
      count: parseInt(row.count)
    }));
    
    // Students by major
    const majorQuery = `
      SELECT 
        m.major_id,
        m.major_name,
        COUNT(s.student_id) as count
      FROM majors m
      LEFT JOIN classes c ON m.major_id = c.major_id
      LEFT JOIN students s ON c.class_id = s.class_id
      GROUP BY m.major_id, m.major_name
      HAVING COUNT(s.student_id) > 0
      ORDER BY count DESC
    `;
    const majorResult = await pool.query(majorQuery);
    const byMajor = majorResult.rows.map(row => ({
      major_id: row.major_id,
      major_name: row.major_name,
      count: parseInt(row.count)
    }));
    
    // Top students
    const topQuery = `
      SELECT 
        s.student_id,
        u.full_name,
        s.gpa_accumulated as gpa,
        c.class_name
      FROM students s
      JOIN users u ON s.user_id = u.user_id
      LEFT JOIN classes c ON s.class_id = c.class_id
      WHERE ${whereClause}
      ORDER BY s.gpa_accumulated DESC
      LIMIT 10
    `;
    const topResult = await pool.query(topQuery, params);
    const topStudents = topResult.rows.map(row => ({
      student_id: row.student_id,
      full_name: row.full_name,
      gpa: parseFloat(row.gpa),
      class_name: row.class_name
    }));
    
    res.json({
      gpa_distribution: gpaDistribution,
      by_faculty: byFaculty,
      by_major: byMajor,
      top_students: topStudents,
      total_students: totalStudents
    });
  } catch (error) {
    console.error('Error getting student statistics:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getCourseStatistics = async (req, res) => {
  try {
    const { semester, academic_year, subject_id } = req.query;
    
    // Build WHERE clause
    let whereClause = '1=1';
    const params = [];
    
    if (semester) {
      params.push(semester);
      whereClause += ` AND cs.semester = $${params.length}`;
    }
    
    if (academic_year) {
      params.push(academic_year);
      whereClause += ` AND cs.academic_year = $${params.length}`;
    }
    
    if (subject_id) {
      params.push(subject_id);
      whereClause += ` AND cs.subject_id = $${params.length}`;
    }
    
    // Sections by semester
    const semesterQuery = `
      SELECT 
        cs.semester,
        cs.academic_year,
        COUNT(DISTINCT cs.section_id) as count,
        COUNT(DISTINCT ss.student_id) as total_students
      FROM course_sections cs
      LEFT JOIN section_students ss ON cs.section_id = ss.section_id
      WHERE ${whereClause}
      GROUP BY cs.semester, cs.academic_year
      ORDER BY cs.academic_year DESC, cs.semester DESC
    `;
    const semesterResult = await pool.query(semesterQuery, params);
    const bySemester = semesterResult.rows.map(row => ({
      semester: row.semester,
      academic_year: row.academic_year,
      count: parseInt(row.count),
      total_students: parseInt(row.total_students)
    }));
    
    // Enrollment statistics
    const enrollmentQuery = `
      SELECT 
        COUNT(DISTINCT cs.section_id) as total_sections,
        COUNT(DISTINCT ss.student_id) as total_students,
        SUM(cs.max_capacity) as total_capacity
      FROM course_sections cs
      LEFT JOIN section_students ss ON cs.section_id = ss.section_id
      WHERE ${whereClause}
    `;
    const enrollmentResult = await pool.query(enrollmentQuery, params);
    const enrollment = enrollmentResult.rows[0];
    const totalSections = parseInt(enrollment.total_sections) || 0;
    const totalStudents = parseInt(enrollment.total_students) || 0;
    const totalCapacity = parseInt(enrollment.total_capacity) || 0;
    
    // By subject
    const subjectQuery = `
      SELECT 
        sub.subject_id,
        sub.subject_name,
        COUNT(DISTINCT cs.section_id) as sections,
        COUNT(DISTINCT ss.student_id) as students
      FROM subjects sub
      LEFT JOIN course_sections cs ON sub.subject_id = cs.subject_id AND ${whereClause}
      LEFT JOIN section_students ss ON cs.section_id = ss.section_id
      GROUP BY sub.subject_id, sub.subject_name
      HAVING COUNT(DISTINCT cs.section_id) > 0
      ORDER BY students DESC
    `;
    const subjectResult = await pool.query(subjectQuery, params);
    const bySubject = subjectResult.rows.map(row => ({
      subject_id: row.subject_id,
      subject_name: row.subject_name,
      sections: parseInt(row.sections),
      students: parseInt(row.students),
      avg_students: parseInt(row.sections) > 0 ? Math.round((parseInt(row.students) / parseInt(row.sections)) * 10) / 10 : 0
    }));
    
    // Most enrolled sections
    const mostEnrolledQuery = `
      SELECT 
        cs.section_id,
        cs.section_code,
        sub.subject_name,
        COUNT(ss.student_id) as enrolled,
        cs.max_capacity as capacity
      FROM course_sections cs
      JOIN subjects sub ON cs.subject_id = sub.subject_id
      LEFT JOIN section_students ss ON cs.section_id = ss.section_id
      WHERE ${whereClause}
      GROUP BY cs.section_id, cs.section_code, sub.subject_name, cs.max_capacity
      ORDER BY enrolled DESC
      LIMIT 10
    `;
    const mostEnrolledResult = await pool.query(mostEnrolledQuery, params);
    const mostEnrolled = mostEnrolledResult.rows.map(row => ({
      section_id: row.section_id,
      section_code: row.section_code,
      subject_name: row.subject_name,
      enrolled: parseInt(row.enrolled),
      capacity: row.capacity,
      utilization: row.capacity > 0 ? Math.round((parseInt(row.enrolled) / row.capacity) * 1000) / 10 : 0
    }));
    
    // Least enrolled sections
    const leastEnrolledQuery = `
      SELECT 
        cs.section_id,
        cs.section_code,
        sub.subject_name,
        COUNT(ss.student_id) as enrolled,
        cs.max_capacity as capacity
      FROM course_sections cs
      JOIN subjects sub ON cs.subject_id = sub.subject_id
      LEFT JOIN section_students ss ON cs.section_id = ss.section_id
      WHERE ${whereClause}
      GROUP BY cs.section_id, cs.section_code, sub.subject_name, cs.max_capacity
      ORDER BY enrolled ASC
      LIMIT 10
    `;
    const leastEnrolledResult = await pool.query(leastEnrolledQuery, params);
    const leastEnrolled = leastEnrolledResult.rows.map(row => ({
      section_id: row.section_id,
      section_code: row.section_code,
      subject_name: row.subject_name,
      enrolled: parseInt(row.enrolled),
      capacity: row.capacity,
      utilization: row.capacity > 0 ? Math.round((parseInt(row.enrolled) / row.capacity) * 1000) / 10 : 0
    }));
    
    res.json({
      by_semester: bySemester,
      enrollment: {
        total_students: totalStudents,
        total_sections: totalSections,
        average_per_section: totalSections > 0 ? Math.round((totalStudents / totalSections) * 10) / 10 : 0,
        total_capacity: totalCapacity,
        capacity_utilization: totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 1000) / 10 : 0
      },
      by_subject: bySubject,
      most_enrolled: mostEnrolled,
      least_enrolled: leastEnrolled
    });
  } catch (error) {
    console.error('Error getting course statistics:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getGradeStatistics = async (req, res) => {
  try {
    const { semester, academic_year, subject_id } = req.query;
    
    // Build WHERE clause
    let whereClause = "g.status = 'APPROVED'";
    const params = [];
    
    if (semester) {
      params.push(semester);
      whereClause += ` AND cs.semester = $${params.length}`;
    }
    
    if (academic_year) {
      params.push(academic_year);
      whereClause += ` AND cs.academic_year = $${params.length}`;
    }
    
    if (subject_id) {
      params.push(subject_id);
      whereClause += ` AND cs.subject_id = $${params.length}`;
    }
    
    // Grade distribution
    const distributionQuery = `
      SELECT 
        g.grade_char as grade,
        COUNT(*) as count
      FROM grades g
      JOIN course_sections cs ON g.section_id = cs.section_id
      WHERE ${whereClause}
      GROUP BY g.grade_char
      ORDER BY 
        CASE g.grade_char
          WHEN 'A' THEN 1
          WHEN 'B+' THEN 2
          WHEN 'B' THEN 3
          WHEN 'C+' THEN 4
          WHEN 'C' THEN 5
          WHEN 'D+' THEN 6
          WHEN 'D' THEN 7
          WHEN 'F' THEN 8
        END
    `;
    const distributionResult = await pool.query(distributionQuery, params);
    const totalGrades = distributionResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    const distribution = distributionResult.rows.map(row => ({
      grade: row.grade,
      label: getGradeLabel(row.grade),
      count: parseInt(row.count),
      percentage: totalGrades > 0 ? Math.round((parseInt(row.count) / totalGrades) * 1000) / 10 : 0
    }));
    
    // By subject
    const subjectQuery = `
      SELECT 
        sub.subject_id,
        sub.subject_name,
        ROUND(AVG(g.total_10), 2) as average_grade,
        COUNT(g.grade_id) as total_students,
        COUNT(*) FILTER (WHERE g.total_10 >= 4.0) as passed
      FROM grades g
      JOIN course_sections cs ON g.section_id = cs.section_id
      JOIN subjects sub ON cs.subject_id = sub.subject_id
      WHERE ${whereClause}
      GROUP BY sub.subject_id, sub.subject_name
      ORDER BY average_grade DESC
    `;
    const subjectResult = await pool.query(subjectQuery, params);
    const bySubject = subjectResult.rows.map(row => ({
      subject_id: row.subject_id,
      subject_name: row.subject_name,
      average_grade: parseFloat(row.average_grade),
      total_students: parseInt(row.total_students),
      pass_rate: parseInt(row.total_students) > 0 ? Math.round((parseInt(row.passed) / parseInt(row.total_students)) * 1000) / 10 : 0
    }));
    
    // By semester
    const semesterQuery = `
      SELECT 
        cs.semester,
        cs.academic_year,
        ROUND(AVG(g.total_10), 2) as average_grade,
        COUNT(g.grade_id) as total_grades,
        COUNT(*) FILTER (WHERE g.total_10 >= 4.0) as passed
      FROM grades g
      JOIN course_sections cs ON g.section_id = cs.section_id
      WHERE ${whereClause}
      GROUP BY cs.semester, cs.academic_year
      ORDER BY cs.academic_year DESC, cs.semester DESC
    `;
    const semesterResult = await pool.query(semesterQuery, params);
    const bySemester = semesterResult.rows.map(row => ({
      semester: row.semester,
      academic_year: row.academic_year,
      average_grade: parseFloat(row.average_grade),
      total_grades: parseInt(row.total_grades),
      pass_rate: parseInt(row.total_grades) > 0 ? Math.round((parseInt(row.passed) / parseInt(row.total_grades)) * 1000) / 10 : 0
    }));
    
    // Overall statistics
    const overallQuery = `
      SELECT 
        ROUND(AVG(g.total_10), 2) as average_grade,
        COUNT(g.grade_id) as total_grades,
        COUNT(*) FILTER (WHERE g.total_10 >= 4.0) as total_passed,
        COUNT(*) FILTER (WHERE g.total_10 < 4.0) as total_failed
      FROM grades g
      JOIN course_sections cs ON g.section_id = cs.section_id
      WHERE ${whereClause}
    `;
    const overallResult = await pool.query(overallQuery, params);
    const overall = overallResult.rows[0];
    const overallTotalGrades = parseInt(overall.total_grades) || 0;
    
    res.json({
      distribution,
      by_subject: bySubject,
      by_semester: bySemester,
      overall: {
        average_grade: parseFloat(overall.average_grade) || 0,
        total_grades: overallTotalGrades,
        pass_rate: overallTotalGrades > 0 ? Math.round((parseInt(overall.total_passed) / overallTotalGrades) * 1000) / 10 : 0,
        total_passed: parseInt(overall.total_passed) || 0,
        total_failed: parseInt(overall.total_failed) || 0
      }
    });
  } catch (error) {
    console.error('Error getting grade statistics:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getRequestStatistics = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    
    // Build WHERE clause
    let whereClause = '1=1';
    const params = [];
    
    if (start_date) {
      params.push(start_date);
      whereClause += ` AND created_at >= $${params.length}`;
    }
    
    if (end_date) {
      params.push(end_date);
      whereClause += ` AND created_at <= $${params.length}`;
    }
    
    // By type
    const typeQuery = `
      SELECT 
        request_type as type,
        COUNT(*) as count
      FROM academic_requests
      WHERE ${whereClause}
      GROUP BY request_type
    `;
    const typeResult = await pool.query(typeQuery, params);
    const totalRequests = typeResult.rows.reduce((sum, row) => sum + parseInt(row.count), 0);
    const byType = typeResult.rows.map(row => ({
      type: row.type,
      type_display: getRequestTypeDisplay(row.type),
      count: parseInt(row.count),
      percentage: totalRequests > 0 ? Math.round((parseInt(row.count) / totalRequests) * 1000) / 10 : 0
    }));
    
    // By status
    const statusQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM academic_requests
      WHERE ${whereClause}
      GROUP BY status
    `;
    const statusResult = await pool.query(statusQuery, params);
    const byStatus = statusResult.rows.map(row => ({
      status: row.status,
      status_display: getStatusDisplay(row.status),
      count: parseInt(row.count),
      percentage: totalRequests > 0 ? Math.round((parseInt(row.count) / totalRequests) * 1000) / 10 : 0
    }));
    
    // Trends by month
    const trendsQuery = `
      SELECT 
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as count
      FROM academic_requests
      WHERE ${whereClause}
      GROUP BY month
      ORDER BY month
    `;
    const trendsResult = await pool.query(trendsQuery, params);
    const trends = trendsResult.rows.map(row => ({
      month: row.month,
      count: parseInt(row.count)
    }));
    
    // Processing time
    const processingQuery = `
      SELECT 
        AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) as average_hours,
        PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) as median_hours,
        COUNT(*) as processed_count
      FROM academic_requests
      WHERE status IN ('APPROVED', 'REJECTED') AND ${whereClause}
    `;
    const processingResult = await pool.query(processingQuery, params);
    const processing = processingResult.rows[0];
    const avgHours = parseFloat(processing.average_hours) || 0;
    const medianHours = parseFloat(processing.median_hours) || 0;
    
    res.json({
      by_type: byType,
      by_status: byStatus,
      trends,
      processing_time: {
        average_hours: Math.round(avgHours * 10) / 10,
        average_days: Math.round((avgHours / 24) * 10) / 10,
        median_hours: Math.round(medianHours * 10) / 10,
        median_days: Math.round((medianHours / 24) * 10) / 10,
        processed_count: parseInt(processing.processed_count) || 0
      },
      total_requests: totalRequests
    });
  } catch (error) {
    console.error('Error getting request statistics:', error);
    res.status(500).json({ error: error.message });
  }
};
