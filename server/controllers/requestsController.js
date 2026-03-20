const pool = require('../config/db');

// Helper function to get request type display name in Vietnamese
const getRequestTypeDisplay = (type) => {
  const types = {
    'REVIEW': 'Phúc khảo điểm',
    'RESERVE': 'Bảo lưu',
    'RETAKE': 'Học lại'
  };
  return types[type] || type;
};

// Helper function to get status display name in Vietnamese
const getStatusDisplay = (status) => {
  const statuses = {
    'PENDING': 'Đang chờ xử lý',
    'APPROVED': 'Đã phê duyệt',
    'REJECTED': 'Đã từ chối'
  };
  return statuses[status] || status;
};

exports.createRequest = async (req, res) => {
  try {
    const { student_id, request_type, reason, grade_id, section_id } = req.body;
    
    // Validate required fields
    if (!student_id) {
      return res.status(400).json({ error: 'student_id là trường bắt buộc' });
    }
    if (!request_type) {
      return res.status(400).json({ error: 'request_type là trường bắt buộc' });
    }
    if (!reason) {
      return res.status(400).json({ error: 'reason là trường bắt buộc' });
    }
    
    // Validate request type
    const validTypes = ['REVIEW', 'RESERVE', 'RETAKE'];
    if (!validTypes.includes(request_type)) {
      return res.status(400).json({ 
        error: 'Loại yêu cầu không hợp lệ. Phải là: REVIEW, RESERVE, hoặc RETAKE' 
      });
    }
    
    // Validate reason length
    if (reason.trim().length < 20) {
      return res.status(400).json({ error: 'Lý do phải có ít nhất 20 ký tự' });
    }
    
    // Check student exists
    const studentCheck = await pool.query(
      'SELECT student_id FROM students WHERE student_id = $1',
      [student_id]
    );
    
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy sinh viên' });
    }
    
    // Check grade exists if provided
    if (grade_id) {
      const gradeCheck = await pool.query(
        'SELECT grade_id FROM grades WHERE grade_id = $1',
        [grade_id]
      );
      
      if (gradeCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy điểm' });
      }
    }
    
    // Check section exists if provided (for RESERVE requests)
    if (section_id) {
      const sectionCheck = await pool.query(
        'SELECT section_id FROM course_sections WHERE section_id = $1',
        [section_id]
      );
      
      if (sectionCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Không tìm thấy lớp học phần' });
      }
      
      // Check if student is enrolled in this section
      const enrollmentCheck = await pool.query(
        'SELECT * FROM section_students WHERE section_id = $1 AND student_id = $2',
        [section_id, student_id]
      );
      
      if (enrollmentCheck.rows.length === 0) {
        return res.status(400).json({ error: 'Sinh viên không đăng ký lớp học phần này' });
      }
    }
    
    // For RESERVE requests, we need to convert section_id to grade_id if exists
    let finalGradeId = grade_id;
    if (request_type === 'RESERVE' && section_id && !grade_id) {
      // Try to find existing grade for this student in this section
      const gradeCheck = await pool.query(
        'SELECT grade_id FROM grades WHERE section_id = $1 AND student_id = $2',
        [section_id, student_id]
      );
      
      if (gradeCheck.rows.length > 0) {
        finalGradeId = gradeCheck.rows[0].grade_id;
      }
      // If no grade exists, that's fine for RESERVE requests
    }
    
    // Insert request
    const insertQuery = `
      INSERT INTO academic_requests (
        student_id, request_type, reason, grade_id, status
      ) VALUES ($1, $2, $3, $4, 'PENDING')
      RETURNING *
    `;
    
    const result = await pool.query(insertQuery, [
      student_id,
      request_type,
      reason.trim(),
      finalGradeId || null
    ]);
    
    res.status(201).json({
      message: 'Gửi yêu cầu thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentRequests = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const query = `
      SELECT 
        ar.request_id,
        ar.request_type,
        ar.reason,
        ar.status,
        ar.admin_response,
        ar.grade_id,
        ar.created_at,
        ar.updated_at,
        cs.section_code,
        s.subject_name
      FROM academic_requests ar
      LEFT JOIN grades g ON ar.grade_id = g.grade_id
      LEFT JOIN course_sections cs ON g.section_id = cs.section_id
      LEFT JOIN subjects s ON cs.subject_id = s.subject_id
      WHERE ar.student_id = $1
      ORDER BY ar.created_at DESC
    `;
    
    const result = await pool.query(query, [studentId]);
    
    // Add display names
    const requests = result.rows.map(request => ({
      ...request,
      request_type_display: getRequestTypeDisplay(request.request_type),
      status_display: getStatusDisplay(request.status)
    }));
    
    res.json(requests);
  } catch (error) {
    console.error('Error getting student requests:', error);
    res.status(500).json({ error: error.message });
  }
};
