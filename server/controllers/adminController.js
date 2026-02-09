const pool = require('../config/db');

exports.approveGrades = async (req, res) => {
  try {
    const { sectionId } = req.params;
    
    // Check if section exists
    const sectionCheck = await pool.query(
      'SELECT section_id FROM course_sections WHERE section_id = $1',
      [sectionId]
    );
    
    if (sectionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course section not found' });
    }
    
    // Check if grades are in SUBMITTED status
    const submittedGrades = await pool.query(
      `SELECT COUNT(*) as count FROM grades 
       WHERE section_id = $1 AND status = 'SUBMITTED'`,
      [sectionId]
    );
    const submittedCount = parseInt(submittedGrades.rows[0].count);
    
    if (submittedCount === 0) {
      return res.status(400).json({ 
        error: 'No grades in SUBMITTED status found. Grades must be submitted before approval.' 
      });
    }
    
    // Update all SUBMITTED grades to APPROVED
    const updateResult = await pool.query(
      `UPDATE grades 
       SET status = 'APPROVED' 
       WHERE section_id = $1 AND status = 'SUBMITTED'
       RETURNING grade_id`,
      [sectionId]
    );
    
    res.json({
      message: 'Phê duyệt bảng điểm thành công',
      data: {
        section_id: parseInt(sectionId),
        grades_approved: updateResult.rows.length,
        status: 'APPROVED'
      }
    });
  } catch (error) {
    console.error('Error approving grades:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.rejectGrades = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { reason } = req.body;
    
    // Check if section exists
    const sectionCheck = await pool.query(
      'SELECT section_id FROM course_sections WHERE section_id = $1',
      [sectionId]
    );
    
    if (sectionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course section not found' });
    }
    
    // Check if grades are in SUBMITTED status
    const submittedGrades = await pool.query(
      `SELECT COUNT(*) as count FROM grades 
       WHERE section_id = $1 AND status = 'SUBMITTED'`,
      [sectionId]
    );
    const submittedCount = parseInt(submittedGrades.rows[0].count);
    
    if (submittedCount === 0) {
      return res.status(400).json({ 
        error: 'No grades in SUBMITTED status found. Only submitted grades can be rejected.' 
      });
    }
    
    // Update all SUBMITTED grades back to DRAFT
    const updateResult = await pool.query(
      `UPDATE grades 
       SET status = 'DRAFT' 
       WHERE section_id = $1 AND status = 'SUBMITTED'
       RETURNING grade_id`,
      [sectionId]
    );
    
    res.json({
      message: 'Từ chối bảng điểm thành công',
      data: {
        section_id: parseInt(sectionId),
        grades_rejected: updateResult.rows.length,
        status: 'DRAFT',
        reason: reason || 'No reason provided'
      }
    });
  } catch (error) {
    console.error('Error rejecting grades:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPendingGrades = async (req, res) => {
  try {
    const query = `
      SELECT 
        cs.section_id,
        cs.section_code,
        s.subject_name,
        u.full_name as lecturer_name,
        cs.semester,
        cs.academic_year,
        COUNT(g.grade_id) as total_grades
      FROM course_sections cs
      JOIN subjects s ON cs.subject_id = s.subject_id
      JOIN lecturers l ON cs.lecturer_id = l.lecturer_id
      JOIN users u ON l.user_id = u.user_id
      JOIN grades g ON cs.section_id = g.section_id
      WHERE g.status = 'SUBMITTED'
      GROUP BY cs.section_id, s.subject_name, u.full_name
      ORDER BY cs.academic_year DESC, cs.semester, s.subject_name
    `;
    
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting pending grades:', error);
    res.status(500).json({ error: error.message });
  }
};

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

exports.getPendingRequests = async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = `
      SELECT 
        ar.request_id,
        ar.student_id,
        u.full_name as student_name,
        u.email as student_email,
        ar.request_type,
        ar.reason,
        ar.grade_id,
        ar.created_at,
        cs.section_code,
        s.subject_name
      FROM academic_requests ar
      JOIN students st ON ar.student_id = st.student_id
      JOIN users u ON st.user_id = u.user_id
      LEFT JOIN grades g ON ar.grade_id = g.grade_id
      LEFT JOIN course_sections cs ON g.section_id = cs.section_id
      LEFT JOIN subjects s ON cs.subject_id = s.subject_id
      WHERE ar.status = 'PENDING'
    `;
    
    const params = [];
    
    // Add type filter if provided
    if (type) {
      params.push(type);
      query += ` AND ar.request_type = $${params.length}`;
    }
    
    query += ' ORDER BY ar.created_at ASC';
    
    const result = await pool.query(query, params);
    
    // Add display names
    const requests = result.rows.map(request => ({
      ...request,
      request_type_display: getRequestTypeDisplay(request.request_type)
    }));
    
    res.json(requests);
  } catch (error) {
    console.error('Error getting pending requests:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const { status, type, student_id } = req.query;
    
    let query = `
      SELECT 
        ar.request_id,
        ar.student_id,
        u.full_name as student_name,
        u.email as student_email,
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
      JOIN students st ON ar.student_id = st.student_id
      JOIN users u ON st.user_id = u.user_id
      LEFT JOIN grades g ON ar.grade_id = g.grade_id
      LEFT JOIN course_sections cs ON g.section_id = cs.section_id
      LEFT JOIN subjects s ON cs.subject_id = s.subject_id
      WHERE 1=1
    `;
    
    const params = [];
    
    // Add filters
    if (status) {
      params.push(status);
      query += ` AND ar.status = $${params.length}`;
    }
    
    if (type) {
      params.push(type);
      query += ` AND ar.request_type = $${params.length}`;
    }
    
    if (student_id) {
      params.push(student_id);
      query += ` AND ar.student_id = $${params.length}`;
    }
    
    query += ' ORDER BY ar.created_at DESC';
    
    const result = await pool.query(query, params);
    
    // Add display names
    const requests = result.rows.map(request => ({
      ...request,
      request_type_display: getRequestTypeDisplay(request.request_type),
      status_display: getStatusDisplay(request.status)
    }));
    
    res.json(requests);
  } catch (error) {
    console.error('Error getting all requests:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.approveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { admin_response } = req.body;
    
    // Validate admin_response
    if (!admin_response) {
      return res.status(400).json({ error: 'admin_response là trường bắt buộc' });
    }
    
    if (admin_response.trim().length < 10) {
      return res.status(400).json({ error: 'Phản hồi phải có ít nhất 10 ký tự' });
    }
    
    // Check request exists and is PENDING
    const requestCheck = await pool.query(
      'SELECT request_id, status FROM academic_requests WHERE request_id = $1',
      [requestId]
    );
    
    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy yêu cầu' });
    }
    
    if (requestCheck.rows[0].status !== 'PENDING') {
      return res.status(409).json({ 
        error: `Chỉ có thể phê duyệt yêu cầu đang chờ xử lý. Trạng thái hiện tại: ${requestCheck.rows[0].status}` 
      });
    }
    
    // Update request
    const updateQuery = `
      UPDATE academic_requests
      SET status = 'APPROVED', 
          admin_response = $1, 
          updated_at = CURRENT_TIMESTAMP
      WHERE request_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [admin_response.trim(), requestId]);
    
    res.json({
      message: 'Phê duyệt yêu cầu thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { admin_response } = req.body;
    
    // Validate admin_response
    if (!admin_response) {
      return res.status(400).json({ error: 'admin_response là trường bắt buộc' });
    }
    
    if (admin_response.trim().length < 10) {
      return res.status(400).json({ error: 'Phản hồi phải có ít nhất 10 ký tự' });
    }
    
    // Check request exists and is PENDING
    const requestCheck = await pool.query(
      'SELECT request_id, status FROM academic_requests WHERE request_id = $1',
      [requestId]
    );
    
    if (requestCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy yêu cầu' });
    }
    
    if (requestCheck.rows[0].status !== 'PENDING') {
      return res.status(409).json({ 
        error: `Chỉ có thể từ chối yêu cầu đang chờ xử lý. Trạng thái hiện tại: ${requestCheck.rows[0].status}` 
      });
    }
    
    // Update request
    const updateQuery = `
      UPDATE academic_requests
      SET status = 'REJECTED', 
          admin_response = $1, 
          updated_at = CURRENT_TIMESTAMP
      WHERE request_id = $2
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [admin_response.trim(), requestId]);
    
    res.json({
      message: 'Từ chối yêu cầu thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error rejecting request:', error);
    res.status(500).json({ error: error.message });
  }
};
