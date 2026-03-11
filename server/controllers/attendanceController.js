const pool = require('../config/db');

// Create attendance record
exports.createAttendance = async (req, res) => {
  try {
    const { section_id, student_id, week, day_of_week, status, notes } = req.body;
    const lecturer_id = req.user?.username; // From auth middleware

    // Validate required fields
    if (!section_id || !student_id || !week || !day_of_week || !status) {
      return res.status(400).json({ 
        error: 'Thiếu thông tin bắt buộc (section_id, student_id, week, day_of_week, status)' 
      });
    }

    // Validate week
    if (week < 1 || week > 16) {
      return res.status(400).json({ error: 'Tuần học phải từ 1-16' });
    }

    // Validate day_of_week
    if (day_of_week < 2 || day_of_week > 8) {
      return res.status(400).json({ error: 'Thứ phải từ 2-8' });
    }

    // Validate status
    const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Trạng thái không hợp lệ. Phải là: ${validStatuses.join(', ')}` 
      });
    }

    // Check if section exists
    const sectionCheck = await pool.query(
      'SELECT section_id FROM course_sections WHERE section_id = $1',
      [section_id]
    );
    if (sectionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Lớp học phần không tồn tại' });
    }

    // Check if student is enrolled in section
    const enrollmentCheck = await pool.query(
      'SELECT * FROM section_students WHERE section_id = $1 AND student_id = $2',
      [section_id, student_id]
    );
    if (enrollmentCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Sinh viên không đăng ký lớp này' });
    }

    // Check if lecturer teaches this section
    const lecturerCheck = await pool.query(
      `SELECT cs.section_id FROM course_sections cs
       WHERE cs.section_id = $1 AND cs.lecturer_id = $2`,
      [section_id, lecturer_id]
    );
    if (lecturerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Bạn không phải giảng viên của lớp này' });
    }

    // Insert attendance record
    const result = await pool.query(
      `INSERT INTO attendances (section_id, student_id, week, day_of_week, status, notes, recorded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (section_id, student_id, week, day_of_week) 
       DO UPDATE SET status = $5, notes = $6, recorded_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [section_id, student_id, week, day_of_week, status, notes || null, lecturer_id]
    );

    res.json({
      message: 'Ghi danh thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating attendance:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get attendance for a section
exports.getSectionAttendance = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const lecturer_id = req.user?.username;

    // Check if section exists and lecturer teaches it
    const sectionCheck = await pool.query(
      `SELECT cs.section_id FROM course_sections cs
       WHERE cs.section_id = $1 AND cs.lecturer_id = $2`,
      [sectionId, lecturer_id]
    );
    if (sectionCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Bạn không có quyền xem danh sách này' });
    }

    // Get all attendance records for the section
    const result = await pool.query(
      `SELECT 
        a.attendance_id,
        a.section_id,
        a.student_id,
        u.full_name as student_name,
        a.week,
        a.day_of_week,
        a.status,
        a.notes,
        a.recorded_at,
        a.recorded_by
       FROM attendances a
       JOIN students s ON a.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       WHERE a.section_id = $1
       ORDER BY a.week, a.day_of_week, a.student_id`,
      [sectionId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting section attendance:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get attendance for a specific student in a section
exports.getStudentAttendance = async (req, res) => {
  try {
    const { sectionId, studentId } = req.params;

    // Get attendance records
    const result = await pool.query(
      `SELECT 
        a.attendance_id,
        a.section_id,
        a.student_id,
        a.week,
        a.day_of_week,
        a.status,
        a.notes,
        a.recorded_at
       FROM attendances a
       WHERE a.section_id = $1 AND a.student_id = $2
       ORDER BY a.week, a.day_of_week`,
      [sectionId, studentId]
    );

    // Calculate attendance statistics
    const totalClasses = result.rows.length;
    const presentCount = result.rows.filter(r => r.status === 'PRESENT').length;
    const lateCount = result.rows.filter(r => r.status === 'LATE').length;
    const absentCount = result.rows.filter(r => r.status === 'ABSENT').length;
    const excusedCount = result.rows.filter(r => r.status === 'EXCUSED').length;

    // Calculate attendance score (0-10)
    // Formula: (Present + Late*0.5 + Excused*0.8) / Total * 10
    const attendanceScore = totalClasses > 0 
      ? ((presentCount + lateCount * 0.5 + excusedCount * 0.8) / totalClasses * 10).toFixed(2)
      : 0;

    res.json({
      student_id: studentId,
      section_id: sectionId,
      records: result.rows,
      statistics: {
        total_classes: totalClasses,
        present: presentCount,
        late: lateCount,
        absent: absentCount,
        excused: excusedCount,
        attendance_score: parseFloat(attendanceScore)
      }
    });
  } catch (error) {
    console.error('Error getting student attendance:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update attendance record
exports.updateAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const { status, notes } = req.body;
    const lecturer_id = req.user?.username;

    // Validate status
    if (status) {
      const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ 
          error: `Trạng thái không hợp lệ. Phải là: ${validStatuses.join(', ')}` 
        });
      }
    }

    // Check if attendance exists and lecturer can edit it
    const attendanceCheck = await pool.query(
      `SELECT a.* FROM attendances a
       JOIN course_sections cs ON a.section_id = cs.section_id
       WHERE a.attendance_id = $1 AND cs.lecturer_id = $2`,
      [attendanceId, lecturer_id]
    );
    if (attendanceCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Bạn không có quyền chỉnh sửa bản ghi này' });
    }

    // Update attendance
    const result = await pool.query(
      `UPDATE attendances 
       SET status = COALESCE($1, status), 
           notes = COALESCE($2, notes),
           recorded_at = CURRENT_TIMESTAMP
       WHERE attendance_id = $3
       RETURNING *`,
      [status || null, notes || null, attendanceId]
    );

    res.json({
      message: 'Cập nhật danh sách thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete attendance record
exports.deleteAttendance = async (req, res) => {
  try {
    const { attendanceId } = req.params;
    const lecturer_id = req.user?.username;

    // Check if attendance exists and lecturer can delete it
    const attendanceCheck = await pool.query(
      `SELECT a.* FROM attendances a
       JOIN course_sections cs ON a.section_id = cs.section_id
       WHERE a.attendance_id = $1 AND cs.lecturer_id = $2`,
      [attendanceId, lecturer_id]
    );
    if (attendanceCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa bản ghi này' });
    }

    // Delete attendance
    await pool.query('DELETE FROM attendances WHERE attendance_id = $1', [attendanceId]);

    res.json({ message: 'Xóa danh sách thành công' });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get attendance summary for a section (for statistics)
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { sectionId } = req.params;

    // Get attendance summary by student
    const result = await pool.query(
      `SELECT 
        a.student_id,
        u.full_name as student_name,
        COUNT(*) as total_classes,
        SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) as present_count,
        SUM(CASE WHEN a.status = 'LATE' THEN 1 ELSE 0 END) as late_count,
        SUM(CASE WHEN a.status = 'ABSENT' THEN 1 ELSE 0 END) as absent_count,
        SUM(CASE WHEN a.status = 'EXCUSED' THEN 1 ELSE 0 END) as excused_count,
        ROUND(
          (SUM(CASE WHEN a.status = 'PRESENT' THEN 1 ELSE 0 END) + 
           SUM(CASE WHEN a.status = 'LATE' THEN 1 ELSE 0 END) * 0.5 +
           SUM(CASE WHEN a.status = 'EXCUSED' THEN 1 ELSE 0 END) * 0.8) / 
          COUNT(*) * 10, 2
        ) as attendance_score
       FROM attendances a
       JOIN students s ON a.student_id = s.student_id
       JOIN users u ON s.user_id = u.user_id
       WHERE a.section_id = $1
       GROUP BY a.student_id, u.full_name
       ORDER BY a.student_id`,
      [sectionId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Error getting attendance summary:', error);
    res.status(500).json({ error: error.message });
  }
};

// Bulk create/update attendance (for marking attendance in class)
exports.bulkUpdateAttendance = async (req, res) => {
  try {
    const { section_id, week, day_of_week, records } = req.body;
    const lecturer_id = req.user?.username;

    // Validate required fields
    if (!section_id || !week || !day_of_week || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ 
        error: 'Thiếu thông tin bắt buộc (section_id, week, day_of_week, records)' 
      });
    }

    // Check if lecturer teaches this section
    const lecturerCheck = await pool.query(
      `SELECT cs.section_id FROM course_sections cs
       WHERE cs.section_id = $1 AND cs.lecturer_id = $2`,
      [section_id, lecturer_id]
    );
    if (lecturerCheck.rows.length === 0) {
      return res.status(403).json({ error: 'Bạn không phải giảng viên của lớp này' });
    }

    const results = {
      success: [],
      errors: []
    };

    // Process each record
    for (const record of records) {
      try {
        const { student_id, status, notes } = record;

        if (!student_id || !status) {
          results.errors.push({
            student_id,
            error: 'Thiếu student_id hoặc status'
          });
          continue;
        }

        // Validate status
        const validStatuses = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];
        if (!validStatuses.includes(status)) {
          results.errors.push({
            student_id,
            error: `Trạng thái không hợp lệ: ${status}`
          });
          continue;
        }

        // Check if student is enrolled
        const enrollmentCheck = await pool.query(
          'SELECT * FROM section_students WHERE section_id = $1 AND student_id = $2',
          [section_id, student_id]
        );
        if (enrollmentCheck.rows.length === 0) {
          results.errors.push({
            student_id,
            error: 'Sinh viên không đăng ký lớp này'
          });
          continue;
        }

        // Insert or update attendance
        const result = await pool.query(
          `INSERT INTO attendances (section_id, student_id, week, day_of_week, status, notes, recorded_by)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT (section_id, student_id, week, day_of_week) 
           DO UPDATE SET status = $5, notes = $6, recorded_at = CURRENT_TIMESTAMP
           RETURNING *`,
          [section_id, student_id, week, day_of_week, status, notes || null, lecturer_id]
        );

        results.success.push({
          student_id,
          attendance_id: result.rows[0].attendance_id,
          status
        });
      } catch (error) {
        results.errors.push({
          student_id: record.student_id,
          error: error.message
        });
      }
    }

    res.json({
      message: `Cập nhật ${results.success.length} bản ghi thành công, ${results.errors.length} lỗi`,
      results
    });
  } catch (error) {
    console.error('Error bulk updating attendance:', error);
    res.status(500).json({ error: error.message });
  }
};
