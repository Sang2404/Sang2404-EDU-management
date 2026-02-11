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

exports.bulkImportUsers = async (req, res) => {
  try {
    const { users } = req.body;
    
    if (!users || !Array.isArray(users) || users.length === 0) {
      return res.status(400).json({ error: 'Dữ liệu người dùng không hợp lệ' });
    }
    
    const results = {
      success: [],
      errors: [],
      skipped: []
    };
    
    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      const rowNum = i + 2; // Excel row number (header is row 1)
      
      try {
        // Validate required fields
        if (!user.email || !user.username || !user.full_name || !user.role) {
          results.errors.push({
            row: rowNum,
            data: user,
            error: 'Thiếu thông tin bắt buộc (email, username, full_name, role)'
          });
          continue;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(user.email)) {
          results.errors.push({
            row: rowNum,
            data: user,
            error: 'Email không hợp lệ'
          });
          continue;
        }
        
        // Validate role
        if (!['STUDENT', 'LECTURER', 'ADMIN'].includes(user.role)) {
          results.errors.push({
            row: rowNum,
            data: user,
            error: 'Vai trò không hợp lệ (phải là STUDENT, LECTURER hoặc ADMIN)'
          });
          continue;
        }
        
        // Check if user already exists
        const existingUser = await pool.query(
          'SELECT * FROM users WHERE email = $1 OR username = $2',
          [user.email, user.username]
        );
        
        if (existingUser.rows.length > 0) {
          const existing = existingUser.rows[0];
          const isActive = user.is_active !== undefined ? user.is_active : true;
          
          // Check if data is identical (skip if same)
          if (existing.email === user.email && 
              existing.username === user.username &&
              existing.full_name === user.full_name &&
              existing.role === user.role &&
              existing.is_active === isActive) {
            results.skipped.push({
              row: rowNum,
              data: user,
              reason: 'Dữ liệu đã tồn tại và giống hệt (bỏ qua)'
            });
            continue;
          }
          
          // Data conflict - same key but different info
          const conflicts = [];
          if (existing.email === user.email && existing.username !== user.username) {
            conflicts.push(`Email ${user.email} đã tồn tại với username khác: ${existing.username}`);
          }
          if (existing.username === user.username && existing.email !== user.email) {
            conflicts.push(`Username ${user.username} đã tồn tại với email khác: ${existing.email}`);
          }
          if (existing.username === user.username && existing.full_name !== user.full_name) {
            conflicts.push(`Username ${user.username} đã tồn tại với tên khác: ${existing.full_name}`);
          }
          if (existing.username === user.username && existing.role !== user.role) {
            conflicts.push(`Username ${user.username} đã tồn tại với vai trò khác: ${existing.role}`);
          }
          
          results.errors.push({
            row: rowNum,
            data: user,
            error: 'Trùng dữ liệu: ' + conflicts.join('; ')
          });
          continue;
        }
        
        // Insert user
        const insertUserQuery = `
          INSERT INTO users (email, username, full_name, role, is_active)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING user_id, email, username, full_name, role
        `;
        
        const isActive = user.is_active !== undefined ? user.is_active : true;
        const userResult = await pool.query(insertUserQuery, [
          user.email,
          user.username,
          user.full_name,
          user.role,
          isActive
        ]);
        
        const newUser = userResult.rows[0];
        
        // Insert into role-specific table
        if (user.role === 'STUDENT') {
          await pool.query(
            'INSERT INTO students (user_id, student_id) VALUES ($1, $2)',
            [newUser.user_id, user.username]
          );
        } else if (user.role === 'LECTURER') {
          await pool.query(
            'INSERT INTO lecturers (user_id, lecturer_id) VALUES ($1, $2)',
            [newUser.user_id, user.username]
          );
        }
        
        results.success.push({
          row: rowNum,
          data: newUser
        });
        
      } catch (error) {
        results.errors.push({
          row: rowNum,
          data: user,
          error: error.message
        });
      }
    }
    
    res.json({
      message: `Thành công: ${results.success.length}, Bỏ qua: ${results.skipped.length}, Lỗi: ${results.errors.length}`,
      results
    });
    
  } catch (error) {
    console.error('Error bulk importing users:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.bulkImportSubjects = async (req, res) => {
  try {
    const { subjects } = req.body;
    
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ error: 'Dữ liệu môn học không hợp lệ' });
    }
    
    const results = {
      success: [],
      errors: [],
      skipped: []
    };
    
    for (let i = 0; i < subjects.length; i++) {
      const subject = subjects[i];
      const rowNum = i + 2; // Excel row number (header is row 1)
      
      try {
        // Validate required fields
        if (!subject.subject_id || !subject.subject_name || !subject.credits) {
          results.errors.push({
            row: rowNum,
            data: subject,
            error: 'Thiếu thông tin bắt buộc (subject_id, subject_name, credits)'
          });
          continue;
        }
        
        // Validate credits
        const credits = parseInt(subject.credits);
        if (isNaN(credits) || credits < 1 || credits > 20) {
          results.errors.push({
            row: rowNum,
            data: subject,
            error: 'Số tín chỉ không hợp lệ (phải từ 1-20)'
          });
          continue;
        }
        
        // Check if subject already exists
        const existingSubject = await pool.query(
          'SELECT * FROM subjects WHERE subject_id = $1',
          [subject.subject_id]
        );
        
        if (existingSubject.rows.length > 0) {
          const existing = existingSubject.rows[0];
          
          // Check if data is identical (skip if same)
          if (existing.subject_name === subject.subject_name &&
              existing.credits === credits &&
              (existing.description || null) === (subject.description || null)) {
            results.skipped.push({
              row: rowNum,
              data: subject,
              reason: 'Dữ liệu đã tồn tại và giống hệt (bỏ qua)'
            });
            continue;
          }
          
          // Data conflict
          const conflicts = [];
          if (existing.subject_name !== subject.subject_name) {
            conflicts.push(`Mã môn ${subject.subject_id} đã tồn tại với tên khác: "${existing.subject_name}"`);
          }
          if (existing.credits !== credits) {
            conflicts.push(`Mã môn ${subject.subject_id} đã tồn tại với số tín chỉ khác: ${existing.credits}`);
          }
          
          results.errors.push({
            row: rowNum,
            data: subject,
            error: 'Trùng dữ liệu: ' + conflicts.join('; ')
          });
          continue;
        }
        
        // Insert subject
        const insertQuery = `
          INSERT INTO subjects (subject_id, subject_name, credits, description)
          VALUES ($1, $2, $3, $4)
          RETURNING *
        `;
        
        const subjectResult = await pool.query(insertQuery, [
          subject.subject_id,
          subject.subject_name,
          credits,
          subject.description || null
        ]);
        
        results.success.push({
          row: rowNum,
          data: subjectResult.rows[0]
        });
        
      } catch (error) {
        results.errors.push({
          row: rowNum,
          data: subject,
          error: error.message
        });
      }
    }
    
    res.json({
      message: `Thành công: ${results.success.length}, Bỏ qua: ${results.skipped.length}, Lỗi: ${results.errors.length}`,
      results
    });
    
  } catch (error) {
    console.error('Error bulk importing subjects:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.bulkImportCourseSections = async (req, res) => {
  try {
    const { sections } = req.body;
    
    if (!sections || !Array.isArray(sections) || sections.length === 0) {
      return res.status(400).json({ error: 'Dữ liệu lớp học phần không hợp lệ' });
    }
    
    const results = {
      success: [],
      errors: [],
      skipped: []
    };
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const rowNum = i + 2;
      
      try {
        // Validate required fields
        if (!section.subject_id || !section.lecturer_id || !section.semester || 
            !section.academic_year || !section.section_code || !section.max_capacity) {
          results.errors.push({
            row: rowNum,
            data: section,
            error: 'Thiếu thông tin bắt buộc (subject_id, lecturer_id, semester, academic_year, section_code, max_capacity)'
          });
          continue;
        }
        
        // Validate semester
        if (!['HK1', 'HK2', 'HK3'].includes(section.semester)) {
          results.errors.push({
            row: rowNum,
            data: section,
            error: 'Học kỳ không hợp lệ (phải là HK1, HK2 hoặc HK3)'
          });
          continue;
        }
        
        // Validate max_capacity
        const maxCapacity = parseInt(section.max_capacity);
        if (isNaN(maxCapacity) || maxCapacity < 1) {
          results.errors.push({
            row: rowNum,
            data: section,
            error: 'Sĩ số tối đa không hợp lệ'
          });
          continue;
        }
        
        // Check if subject exists
        const subjectCheck = await pool.query(
          'SELECT subject_id FROM subjects WHERE subject_id = $1',
          [section.subject_id]
        );
        
        if (subjectCheck.rows.length === 0) {
          results.errors.push({
            row: rowNum,
            data: section,
            error: `Môn học ${section.subject_id} không tồn tại`
          });
          continue;
        }
        
        // Check if lecturer exists
        const lecturerCheck = await pool.query(
          'SELECT lecturer_id FROM lecturers WHERE lecturer_id = $1',
          [section.lecturer_id]
        );
        
        if (lecturerCheck.rows.length === 0) {
          results.errors.push({
            row: rowNum,
            data: section,
            error: `Giảng viên ${section.lecturer_id} không tồn tại`
          });
          continue;
        }
        
        // Check if section_code already exists
        const sectionCheck = await pool.query(
          'SELECT * FROM course_sections WHERE section_code = $1',
          [section.section_code]
        );
        
        if (sectionCheck.rows.length > 0) {
          const existing = sectionCheck.rows[0];
          const isLocked = section.is_locked === true || section.is_locked === 'true';
          
          // Check if data is identical (skip if same)
          if (existing.subject_id === section.subject_id &&
              existing.lecturer_id === section.lecturer_id &&
              existing.semester === section.semester &&
              existing.academic_year === section.academic_year &&
              existing.max_capacity === maxCapacity &&
              (existing.room_default || null) === (section.room_default || null) &&
              existing.is_locked === isLocked) {
            results.skipped.push({
              row: rowNum,
              data: section,
              reason: 'Dữ liệu đã tồn tại và giống hệt (bỏ qua)'
            });
            continue;
          }
          
          // Data conflict
          const conflicts = [];
          if (existing.subject_id !== section.subject_id) {
            conflicts.push(`Mã lớp ${section.section_code} đã tồn tại với môn học khác: ${existing.subject_id}`);
          }
          if (existing.lecturer_id !== section.lecturer_id) {
            conflicts.push(`Mã lớp ${section.section_code} đã tồn tại với giảng viên khác: ${existing.lecturer_id}`);
          }
          if (existing.semester !== section.semester || existing.academic_year !== section.academic_year) {
            conflicts.push(`Mã lớp ${section.section_code} đã tồn tại với học kỳ/năm học khác: ${existing.semester} - ${existing.academic_year}`);
          }
          
          results.errors.push({
            row: rowNum,
            data: section,
            error: 'Trùng dữ liệu: ' + conflicts.join('; ')
          });
          continue;
        }
        
        // Insert course section
        const insertQuery = `
          INSERT INTO course_sections 
          (subject_id, lecturer_id, semester, academic_year, section_code, max_capacity, room_default, is_locked)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          RETURNING *
        `;
        
        const isLocked = section.is_locked === true || section.is_locked === 'true';
        
        const sectionResult = await pool.query(insertQuery, [
          section.subject_id,
          section.lecturer_id,
          section.semester,
          section.academic_year,
          section.section_code,
          maxCapacity,
          section.room_default || null,
          isLocked
        ]);
        
        results.success.push({
          row: rowNum,
          data: sectionResult.rows[0]
        });
        
      } catch (error) {
        results.errors.push({
          row: rowNum,
          data: section,
          error: error.message
        });
      }
    }
    
    res.json({
      message: `Thành công: ${results.success.length}, Bỏ qua: ${results.skipped.length}, Lỗi: ${results.errors.length}`,
      results
    });
    
  } catch (error) {
    console.error('Error bulk importing course sections:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.bulkImportSchedules = async (req, res) => {
  try {
    const { schedules } = req.body;
    
    if (!schedules || !Array.isArray(schedules) || schedules.length === 0) {
      return res.status(400).json({ error: 'Dữ liệu lịch học không hợp lệ' });
    }
    
    const results = {
      success: [],
      errors: [],
      skipped: []
    };
    
    for (let i = 0; i < schedules.length; i++) {
      const schedule = schedules[i];
      const rowNum = i + 2;
      
      try {
        // Validate required fields
        if (!schedule.section_code || !schedule.day_of_week || 
            !schedule.start_period || !schedule.end_period) {
          results.errors.push({
            row: rowNum,
            data: schedule,
            error: 'Thiếu thông tin bắt buộc (section_code, day_of_week, start_period, end_period)'
          });
          continue;
        }
        
        // Validate day_of_week
        const dayOfWeek = parseInt(schedule.day_of_week);
        if (isNaN(dayOfWeek) || dayOfWeek < 2 || dayOfWeek > 8) {
          results.errors.push({
            row: rowNum,
            data: schedule,
            error: 'Thứ không hợp lệ (phải từ 2-8, với 8 là Chủ nhật)'
          });
          continue;
        }
        
        // Validate periods
        const startPeriod = parseInt(schedule.start_period);
        const endPeriod = parseInt(schedule.end_period);
        
        if (isNaN(startPeriod) || isNaN(endPeriod) || 
            startPeriod < 1 || startPeriod > 15 || 
            endPeriod < 1 || endPeriod > 15) {
          results.errors.push({
            row: rowNum,
            data: schedule,
            error: 'Tiết học không hợp lệ (phải từ 1-15)'
          });
          continue;
        }
        
        if (startPeriod >= endPeriod) {
          results.errors.push({
            row: rowNum,
            data: schedule,
            error: 'Tiết kết thúc phải lớn hơn tiết bắt đầu'
          });
          continue;
        }
        
        // Find section_id by section_code
        const sectionCheck = await pool.query(
          'SELECT section_id FROM course_sections WHERE section_code = $1',
          [schedule.section_code]
        );
        
        if (sectionCheck.rows.length === 0) {
          results.errors.push({
            row: rowNum,
            data: schedule,
            error: `Lớp học phần ${schedule.section_code} không tồn tại`
          });
          continue;
        }
        
        const sectionId = sectionCheck.rows[0].section_id;
        
        // Check if exact schedule already exists
        const exactCheck = await pool.query(
          `SELECT * FROM schedules 
           WHERE section_id = $1 
           AND day_of_week = $2 
           AND start_period = $3
           AND end_period = $4`,
          [sectionId, dayOfWeek, startPeriod, endPeriod]
        );
        
        if (exactCheck.rows.length > 0) {
          const existing = exactCheck.rows[0];
          
          // Check if data is identical (skip if same)
          if ((existing.room || null) === (schedule.room || null)) {
            results.skipped.push({
              row: rowNum,
              data: schedule,
              reason: 'Dữ liệu đã tồn tại và giống hệt (bỏ qua)'
            });
            continue;
          }
          
          // Same schedule but different room
          results.errors.push({
            row: rowNum,
            data: schedule,
            error: `Trùng dữ liệu: Lịch học đã tồn tại với phòng khác: ${existing.room || 'Chưa xác định'}`
          });
          continue;
        }
        
        // Check for schedule conflicts (overlapping periods)
        const conflictCheck = await pool.query(
          `SELECT schedule_id FROM schedules 
           WHERE section_id = $1 
           AND day_of_week = $2 
           AND (
             (start_period <= $3 AND end_period > $3) OR
             (start_period < $4 AND end_period >= $4) OR
             (start_period >= $3 AND end_period <= $4)
           )`,
          [sectionId, dayOfWeek, startPeriod, endPeriod]
        );
        
        if (conflictCheck.rows.length > 0) {
          results.errors.push({
            row: rowNum,
            data: schedule,
            error: 'Trùng lịch học (cùng lớp, cùng thứ, tiết bị chồng lấn)'
          });
          continue;
        }
        
        // Insert schedule
        const insertQuery = `
          INSERT INTO schedules (section_id, day_of_week, start_period, end_period, room)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING *
        `;
        
        const scheduleResult = await pool.query(insertQuery, [
          sectionId,
          dayOfWeek,
          startPeriod,
          endPeriod,
          schedule.room || null
        ]);
        
        results.success.push({
          row: rowNum,
          data: scheduleResult.rows[0]
        });
        
      } catch (error) {
        results.errors.push({
          row: rowNum,
          data: schedule,
          error: error.message
        });
      }
    }
    
    res.json({
      message: `Thành công: ${results.success.length}, Bỏ qua: ${results.skipped.length}, Lỗi: ${results.errors.length}`,
      results
    });
    
  } catch (error) {
    console.error('Error bulk importing schedules:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.bulkImportFaculties = async (req, res) => {
  try {
    const { faculties } = req.body;
    
    if (!faculties || !Array.isArray(faculties) || faculties.length === 0) {
      return res.status(400).json({ error: 'Dữ liệu khoa không hợp lệ' });
    }
    
    const results = {
      success: [],
      errors: [],
      skipped: []
    };
    
    for (let i = 0; i < faculties.length; i++) {
      const faculty = faculties[i];
      const rowNum = i + 2;
      
      try {
        // Validate required fields
        if (!faculty.faculty_id || !faculty.faculty_name) {
          results.errors.push({
            row: rowNum,
            data: faculty,
            error: 'Thiếu thông tin bắt buộc (faculty_id, faculty_name)'
          });
          continue;
        }
        
        // Check if faculty already exists
        const existingFaculty = await pool.query(
          'SELECT * FROM faculties WHERE faculty_id = $1',
          [faculty.faculty_id]
        );
        
        if (existingFaculty.rows.length > 0) {
          const existing = existingFaculty.rows[0];
          
          // Check if data is identical (skip if same)
          if (existing.faculty_name === faculty.faculty_name &&
              (existing.description || null) === (faculty.description || null)) {
            results.skipped.push({
              row: rowNum,
              data: faculty,
              reason: 'Dữ liệu đã tồn tại và giống hệt (bỏ qua)'
            });
            continue;
          }
          
          // Data conflict
          const conflicts = [];
          if (existing.faculty_name !== faculty.faculty_name) {
            conflicts.push(`Mã khoa ${faculty.faculty_id} đã tồn tại với tên khác: "${existing.faculty_name}"`);
          }
          
          results.errors.push({
            row: rowNum,
            data: faculty,
            error: 'Trùng dữ liệu: ' + conflicts.join('; ')
          });
          continue;
        }
        
        // Insert faculty
        const insertQuery = `
          INSERT INTO faculties (faculty_id, faculty_name, description)
          VALUES ($1, $2, $3)
          RETURNING *
        `;
        
        const facultyResult = await pool.query(insertQuery, [
          faculty.faculty_id,
          faculty.faculty_name,
          faculty.description || null
        ]);
        
        results.success.push({
          row: rowNum,
          data: facultyResult.rows[0]
        });
        
      } catch (error) {
        results.errors.push({
          row: rowNum,
          data: faculty,
          error: error.message
        });
      }
    }
    
    res.json({
      message: `Thành công: ${results.success.length}, Bỏ qua: ${results.skipped.length}, Lỗi: ${results.errors.length}`,
      results
    });
    
  } catch (error) {
    console.error('Error bulk importing faculties:', error);
    res.status(500).json({ error: error.message });
  }
};
