const pool = require('../config/db');

// --- FACULTIES ---
exports.getAllFaculties = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM faculties ORDER BY faculty_name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createFaculty = async (req, res) => {
  try {
    const { faculty_id, faculty_name, description } = req.body;
    await pool.query(
      'INSERT INTO faculties (faculty_id, faculty_name, description) VALUES ($1, $2, $3)',
      [faculty_id, faculty_name, description]
    );
    res.status(201).json({ message: 'Tạo Khoa thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { faculty_name, description } = req.body;
    await pool.query(
      'UPDATE faculties SET faculty_name = $1, description = $2 WHERE faculty_id = $3',
      [faculty_name, description, id]
    );
    res.json({ message: 'Cập nhật Khoa thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM faculties WHERE faculty_id = $1', [id]);
    res.json({ message: 'Xóa Khoa thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- MAJORS ---
exports.getMajorsByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const result = await pool.query('SELECT * FROM majors WHERE faculty_id = $1', [facultyId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createMajor = async (req, res) => {
  try {
    const { major_id, faculty_id, major_name, total_credits } = req.body;
    await pool.query(
      'INSERT INTO majors (major_id, faculty_id, major_name, total_credits) VALUES ($1, $2, $3, $4)',
      [major_id, faculty_id, major_name, total_credits]
    );
    res.status(201).json({ message: 'Tạo Ngành thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMajor = async (req, res) => {
  try {
    const { id } = req.params;
    const { major_name, total_credits } = req.body;
    await pool.query(
      'UPDATE majors SET major_name = $1, total_credits = $2 WHERE major_id = $3',
      [major_name, total_credits, id]
    );
    res.json({ message: 'Cập nhật Ngành thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMajor = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM majors WHERE major_id = $1', [id]);
    res.json({ message: 'Xóa Ngành thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- SUBJECTS ---
exports.getAllSubjects = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subjects ORDER BY subject_name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { subject_id, subject_name, credits, description } = req.body;
    await pool.query(
      'INSERT INTO subjects (subject_id, subject_name, credits, description) VALUES ($1, $2, $3, $4)',
      [subject_id, subject_name, credits, description]
    );
    res.status(201).json({ message: 'Tạo Môn học thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_name, credits, description } = req.body;
    await pool.query(
      'UPDATE subjects SET subject_name = $1, credits = $2, description = $3 WHERE subject_id = $4',
      [subject_name, credits, description, id]
    );
    res.json({ message: 'Cập nhật Môn học thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM subjects WHERE subject_id = $1', [id]);
    res.json({ message: 'Xóa Môn học thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// --- COURSE SECTIONS ---
exports.createCourseSection = async (req, res) => {
  try {
    // Extract request body parameters - accept both lecturer_id and teacher_id
    const { subject_id, teacher_id, lecturer_id, semester, year, academic_year, max_students, max_capacity, section_code, room_default } = req.body;
    
    console.log('DEBUG: Creating course section with:', { subject_id, teacher_id, lecturer_id, semester, year, academic_year, max_students, max_capacity, section_code });
    
    // Use lecturer_id if provided, otherwise use teacher_id
    const finalLecturerId = lecturer_id || teacher_id;
    const finalAcademicYear = academic_year || year;
    const finalMaxCapacity = max_capacity || max_students;
    
    console.log('DEBUG: Final values:', { finalLecturerId, finalAcademicYear, finalMaxCapacity });
    
    // Validate required fields
    if (!subject_id) {
      return res.status(400).json({ error: 'subject_id is required' });
    }
    if (!finalLecturerId) {
      return res.status(400).json({ error: 'lecturer_id is required' });
    }
    if (!semester) {
      return res.status(400).json({ error: 'semester is required' });
    }
    if (!finalAcademicYear) {
      return res.status(400).json({ error: 'academic_year is required' });
    }
    if (finalMaxCapacity === undefined || finalMaxCapacity === null) {
      return res.status(400).json({ error: 'max_capacity is required' });
    }
    if (!section_code) {
      return res.status(400).json({ error: 'section_code is required' });
    }
    
    // Validate data type and constraints
    if (typeof finalMaxCapacity !== 'number' || finalMaxCapacity <= 0) {
      return res.status(400).json({ error: 'max_capacity must be a positive integer' });
    }
    
    // Validate section_code is not empty or whitespace
    if (typeof section_code === 'string' && section_code.trim().length === 0) {
      return res.status(400).json({ error: 'section_code cannot be empty' });
    }
    
    // Validate subject exists
    const subjectCheck = await pool.query(
      'SELECT subject_id FROM subjects WHERE subject_id = $1',
      [subject_id]
    );
    if (subjectCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Subject does not exist' });
    }
    
    // Validate teacher exists
    const teacherCheck = await pool.query(
      'SELECT lecturer_id FROM lecturers WHERE lecturer_id = $1',
      [finalLecturerId]
    );
    if (teacherCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Teacher does not exist' });
    }
    
    // Check for duplicate section code
    const sectionCodeCheck = await pool.query(
      'SELECT section_code FROM course_sections WHERE section_code = $1',
      [section_code]
    );
    if (sectionCodeCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Mã lớp học phần đã tồn tại' });
    }
    
    // Insert new course section
    const insertResult = await pool.query(
      `INSERT INTO course_sections 
       (subject_id, lecturer_id, semester, academic_year, max_capacity, section_code, room_default) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING section_id, subject_id, lecturer_id, semester, academic_year, max_capacity, section_code, room_default`,
      [subject_id, finalLecturerId, semester, finalAcademicYear, finalMaxCapacity, section_code, room_default || null]
    );
    
    const createdSection = insertResult.rows[0];
    
    res.status(201).json({ 
      message: 'Tạo lớp học phần thành công',
      data: {
        id: createdSection.section_id,
        subject_id: createdSection.subject_id,
        teacher_id: createdSection.lecturer_id,
        semester: createdSection.semester,
        year: createdSection.academic_year,
        max_students: createdSection.max_capacity,
        section_code: createdSection.section_code
      }
    });
  } catch (error) {
    console.error('Error creating course section:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

exports.getAllCourseSections = async (req, res) => {
  try {
    const { semester, academic_year } = req.query;
    
    const query = `
      SELECT 
        cs.section_id,
        cs.subject_id,
        s.subject_name,
        cs.lecturer_id,
        u.full_name as lecturer_name,
        cs.semester,
        cs.academic_year,
        cs.max_capacity,
        cs.section_code,
        cs.room_default,
        cs.is_locked,
        COUNT(ss.student_id) as enrolled_count
      FROM course_sections cs
      LEFT JOIN subjects s ON cs.subject_id = s.subject_id
      LEFT JOIN lecturers l ON cs.lecturer_id = l.lecturer_id
      LEFT JOIN users u ON l.user_id = u.user_id
      LEFT JOIN section_students ss ON cs.section_id = ss.section_id
      WHERE ($1::text IS NULL OR cs.semester = $1)
        AND ($2::text IS NULL OR cs.academic_year = $2)
      GROUP BY cs.section_id, s.subject_name, cs.lecturer_id, u.full_name
      ORDER BY cs.academic_year DESC, cs.semester, s.subject_name
    `;
    
    const result = await pool.query(query, [semester || null, academic_year || null]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting course sections:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getCourseSectionById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT 
        cs.section_id,
        cs.subject_id,
        s.subject_name,
        s.credits,
        cs.lecturer_id,
        u.full_name as lecturer_name,
        cs.semester,
        cs.academic_year,
        cs.room_default,
        cs.max_capacity,
        cs.section_code,
        cs.is_locked,
        COUNT(ss.student_id) as enrolled_count
      FROM course_sections cs
      LEFT JOIN subjects s ON cs.subject_id = s.subject_id
      LEFT JOIN lecturers l ON cs.lecturer_id = l.lecturer_id
      LEFT JOIN users u ON l.user_id = u.user_id
      LEFT JOIN section_students ss ON cs.section_id = ss.section_id
      WHERE cs.section_id = $1
      GROUP BY cs.section_id, s.subject_name, s.credits, cs.lecturer_id, u.full_name
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Course section not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error getting course section:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateCourseSection = async (req, res) => {
  try {
    const { id } = req.params;
    // Accept both teacher_id and lecturer_id for compatibility
    const { subject_id, teacher_id, lecturer_id: lecturerId, semester, year, academic_year: academicYear, max_students, max_capacity: maxCapacity, section_code, room_default, is_locked } = req.body;
    
    // Check if course section exists
    const existsCheck = await pool.query(
      'SELECT section_id FROM course_sections WHERE section_id = $1',
      [id]
    );
    if (existsCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course section not found' });
    }
    
    // Use provided values or fallback to alternatives
    const finalLecturerId = lecturerId || teacher_id;
    const finalAcademicYear = academicYear || year;
    const finalMaxCapacity = maxCapacity || max_students;
    
    // Validate required fields
    if (!subject_id) {
      return res.status(400).json({ error: 'subject_id is required' });
    }
    if (!finalLecturerId) {
      return res.status(400).json({ error: 'lecturer_id is required' });
    }
    if (!semester) {
      return res.status(400).json({ error: 'semester is required' });
    }
    if (!finalAcademicYear) {
      return res.status(400).json({ error: 'academic_year is required' });
    }
    if (finalMaxCapacity === undefined || finalMaxCapacity === null) {
      return res.status(400).json({ error: 'max_capacity is required' });
    }
    if (!section_code) {
      return res.status(400).json({ error: 'section_code is required' });
    }
    
    // Validate data type and constraints
    if (typeof finalMaxCapacity !== 'number' || finalMaxCapacity <= 0) {
      return res.status(400).json({ error: 'max_capacity must be a positive integer' });
    }
    
    // Validate section_code is not empty or whitespace
    if (typeof section_code === 'string' && section_code.trim().length === 0) {
      return res.status(400).json({ error: 'section_code cannot be empty' });
    }
    
    // Validate subject exists
    const subjectCheck = await pool.query(
      'SELECT subject_id FROM subjects WHERE subject_id = $1',
      [subject_id]
    );
    if (subjectCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Subject does not exist' });
    }
    
    // Validate teacher exists
    const teacherCheck = await pool.query(
      'SELECT lecturer_id FROM lecturers WHERE lecturer_id = $1',
      [finalLecturerId]
    );
    if (teacherCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Teacher does not exist' });
    }
    
    // Check for duplicate section code (excluding current record)
    const sectionCodeCheck = await pool.query(
      'SELECT section_code FROM course_sections WHERE section_code = $1 AND section_id != $2',
      [section_code, id]
    );
    if (sectionCodeCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Mã lớp học phần đã tồn tại' });
    }
    
    // Update course section
    const updateResult = await pool.query(
      `UPDATE course_sections 
       SET subject_id = $1,
           lecturer_id = $2,
           semester = $3,
           academic_year = $4,
           max_capacity = $5,
           section_code = $6,
           room_default = $7,
           is_locked = $8
       WHERE section_id = $9
       RETURNING section_id, subject_id, lecturer_id, semester, academic_year, max_capacity, section_code, room_default, is_locked`,
      [subject_id, finalLecturerId, semester, finalAcademicYear, finalMaxCapacity, section_code, room_default || null, is_locked || false, id]
    );
    
    const updatedSection = updateResult.rows[0];
    
    res.json({ 
      message: 'Cập nhật lớp học phần thành công',
      data: {
        section_id: updatedSection.section_id,
        subject_id: updatedSection.subject_id,
        teacher_id: updatedSection.lecturer_id,
        semester: updatedSection.semester,
        year: updatedSection.academic_year,
        max_students: updatedSection.max_capacity,
        section_code: updatedSection.section_code,
        room_default: updatedSection.room_default,
        is_locked: updatedSection.is_locked
      }
    });
  } catch (error) {
    console.error('Error updating course section:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCourseSection = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if course section exists
    const existsCheck = await pool.query(
      'SELECT section_id FROM course_sections WHERE section_id = $1',
      [id]
    );
    if (existsCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course section not found' });
    }
    
    // Check if students are enrolled
    const enrolledCheck = await pool.query(
      'SELECT COUNT(*) as count FROM section_students WHERE section_id = $1',
      [id]
    );
    const enrolledCount = parseInt(enrolledCheck.rows[0].count);
    
    if (enrolledCount > 0) {
      return res.status(400).json({ 
        error: `Cannot delete course section with ${enrolledCount} enrolled student(s). Please remove students first.` 
      });
    }
    
    // Delete course section (will cascade delete schedules)
    await pool.query('DELETE FROM course_sections WHERE section_id = $1', [id]);
    
    res.json({ message: 'Xóa lớp học phần thành công' });
  } catch (error) {
    console.error('Error deleting course section:', error);
    res.status(500).json({ error: error.message });
  }
};


// --- SCHEDULES ---
// Helper function to get day name in Vietnamese
const getDayName = (day_of_week) => {
  const dayNames = {
    2: 'Thứ 2',
    3: 'Thứ 3',
    4: 'Thứ 4',
    5: 'Thứ 5',
    6: 'Thứ 6',
    7: 'Thứ 7',
    8: 'Chủ nhật'
  };
  return dayNames[day_of_week] || '';
};

exports.getAllSchedules = async (req, res) => {
  try {
    const { semester, academic_year, day_of_week } = req.query;
    
    const query = `
      SELECT 
        s.schedule_id,
        s.section_id,
        s.day_of_week,
        s.start_period as period_start,
        s.end_period as period_end,
        s.room,
        s.week,
        cs.section_code,
        sub.subject_name,
        u.full_name as lecturer_name,
        cs.semester,
        cs.academic_year
      FROM schedules s
      JOIN course_sections cs ON s.section_id = cs.section_id
      JOIN subjects sub ON cs.subject_id = sub.subject_id
      JOIN lecturers l ON cs.lecturer_id = l.lecturer_id
      JOIN users u ON l.user_id = u.user_id
      WHERE ($1::text IS NULL OR cs.semester = $1)
        AND ($2::text IS NULL OR cs.academic_year = $2)
        AND ($3::integer IS NULL OR s.day_of_week = $3)
      ORDER BY s.week, s.day_of_week, s.start_period, s.room
    `;
    
    const result = await pool.query(query, [
      semester || null, 
      academic_year || null,
      day_of_week ? parseInt(day_of_week) : null
    ]);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting all schedules:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { section_id, day_of_week, start_period, end_period, room, week, override_conflicts } = req.body;
    
    // Validate required fields
    if (!section_id) {
      return res.status(400).json({ error: 'section_id is required' });
    }
    if (!day_of_week) {
      return res.status(400).json({ error: 'day_of_week is required' });
    }
    if (!start_period) {
      return res.status(400).json({ error: 'start_period is required' });
    }
    if (!end_period) {
      return res.status(400).json({ error: 'end_period is required' });
    }
    if (!week) {
      return res.status(400).json({ error: 'week is required' });
    }
    
    // Validate data types and ranges
    if (typeof day_of_week !== 'number' || day_of_week < 2 || day_of_week > 8) {
      return res.status(400).json({ error: 'day_of_week must be between 2 and 8' });
    }
    if (typeof start_period !== 'number' || start_period < 1 || start_period > 15) {
      return res.status(400).json({ error: 'start_period must be between 1 and 15' });
    }
    if (typeof end_period !== 'number' || end_period < 1 || end_period > 15) {
      return res.status(400).json({ error: 'end_period must be between 1 and 15' });
    }
    if (start_period >= end_period) {
      return res.status(400).json({ error: 'start_period must be less than end_period' });
    }
    
    // Check if course section exists
    const sectionCheck = await pool.query(
      'SELECT section_id, lecturer_id, semester, academic_year FROM course_sections WHERE section_id = $1',
      [section_id]
    );
    if (sectionCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Course section does not exist' });
    }
    
    const section = sectionCheck.rows[0];
    const conflicts = [];
    
    // Check for room conflict
    if (room) {
      const roomConflict = await pool.query(
        `SELECT s.schedule_id, s.room, s.start_period, s.end_period, cs.section_code, sub.subject_name
         FROM schedules s
         JOIN course_sections cs ON s.section_id = cs.section_id
         JOIN subjects sub ON cs.subject_id = sub.subject_id
         WHERE s.room = $1
           AND s.day_of_week = $2
           AND s.week = $3
           AND cs.semester = $4
           AND cs.academic_year = $5
           AND (
             (s.start_period <= $6 AND s.end_period > $6) OR
             (s.start_period < $7 AND s.end_period >= $7) OR
             (s.start_period >= $6 AND s.end_period <= $7)
           )`,
        [room, day_of_week, week, section.semester, section.academic_year, start_period, end_period]
      );
      
      if (roomConflict.rows.length > 0) {
        conflicts.push({
          type: 'room',
          message: `Phòng ${room} đã có lớp ${roomConflict.rows[0].section_code} (${roomConflict.rows[0].subject_name}) vào ${getDayName(day_of_week)} tuần ${week} từ tiết ${roomConflict.rows[0].start_period} đến ${roomConflict.rows[0].end_period}`
        });
      }
    }
    
    // Check for lecturer conflict
    const lecturerConflict = await pool.query(
      `SELECT s.schedule_id, s.start_period, s.end_period, sub.subject_name, s.room, s.week, cs.section_code
       FROM schedules s
       JOIN course_sections cs ON s.section_id = cs.section_id
       JOIN subjects sub ON cs.subject_id = sub.subject_id
       WHERE cs.lecturer_id = $1
         AND s.day_of_week = $2
         AND s.week = $3
         AND cs.semester = $4
         AND cs.academic_year = $5
         AND (
           (s.start_period <= $6 AND s.end_period > $6) OR
           (s.start_period < $7 AND s.end_period >= $7) OR
           (s.start_period >= $6 AND s.end_period <= $7)
         )`,
      [section.lecturer_id, day_of_week, week, section.semester, section.academic_year, start_period, end_period]
    );
    
    if (lecturerConflict.rows.length > 0) {
      conflicts.push({
        type: 'lecturer',
        message: `Giảng viên đang dạy lớp ${lecturerConflict.rows[0].section_code} (${lecturerConflict.rows[0].subject_name}) tại phòng ${lecturerConflict.rows[0].room} vào ${getDayName(day_of_week)} tuần ${week} từ tiết ${lecturerConflict.rows[0].start_period} đến ${lecturerConflict.rows[0].end_period}`
      });
    }
    
    // Check for student conflicts
    const studentConflict = await pool.query(
      `SELECT DISTINCT ss.student_id, u.full_name, s.schedule_id, s.start_period, s.end_period, 
              sub.subject_name, s.room, s.week, cs.section_code
       FROM section_students ss
       JOIN schedules s ON s.section_id = $1
       JOIN course_sections cs ON s.section_id = cs.section_id
       JOIN subjects sub ON cs.subject_id = sub.subject_id
       JOIN users u ON ss.student_id = u.user_id
       WHERE ss.student_id IN (
         SELECT ss2.student_id
         FROM section_students ss2
         JOIN schedules s2 ON s2.section_id = ss2.section_id
         WHERE s2.day_of_week = $2
           AND s2.week = $3
           AND (
             (s2.start_period <= $4 AND s2.end_period > $4) OR
             (s2.start_period < $5 AND s2.end_period >= $5) OR
             (s2.start_period >= $4 AND s2.end_period <= $5)
           )
       )
       LIMIT 5`,
      [section_id, day_of_week, week, start_period, end_period]
    );
    
    if (studentConflict.rows.length > 0) {
      const conflictCount = studentConflict.rows.length;
      conflicts.push({
        type: 'student',
        message: `${conflictCount} sinh viên có xung đột lịch học vào ${getDayName(day_of_week)} tuần ${week} từ tiết ${start_period} đến ${end_period}`
      });
    }
    
    // If there are conflicts and override is not set, return warning
    if (conflicts.length > 0 && !override_conflicts) {
      return res.status(409).json({ 
        error: 'Phát hiện xung đột lịch học',
        conflicts: conflicts,
        warning: 'Vui lòng kiểm tra các xung đột trên. Nếu muốn bỏ qua, hãy gửi lại yêu cầu với override_conflicts: true'
      });
    }
    
    // Insert schedule
    const insertResult = await pool.query(
      `INSERT INTO schedules (section_id, day_of_week, start_period, end_period, room, week)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING schedule_id, section_id, day_of_week, start_period, end_period, room, week`,
      [section_id, day_of_week, start_period, end_period, room || null, week]
    );
    
    const createdSchedule = insertResult.rows[0];
    
    res.status(201).json({
      message: 'Tạo lịch học thành công',
      data: createdSchedule,
      conflicts_overridden: conflicts.length > 0 ? conflicts : null
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getSchedulesBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    
    const result = await pool.query(
      `SELECT schedule_id, section_id, day_of_week, start_period, end_period, room
       FROM schedules
       WHERE section_id = $1
       ORDER BY day_of_week, start_period`,
      [sectionId]
    );
    
    // Add day names
    const schedules = result.rows.map(schedule => ({
      ...schedule,
      day_name: getDayName(schedule.day_of_week)
    }));
    
    res.json(schedules);
  } catch (error) {
    console.error('Error getting schedules:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getScheduleById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT s.schedule_id, s.section_id, s.day_of_week, s.start_period, s.end_period, s.room,
              cs.section_code, sub.subject_name
       FROM schedules s
       JOIN course_sections cs ON s.section_id = cs.section_id
       JOIN subjects sub ON cs.subject_id = sub.subject_id
       WHERE s.schedule_id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    const schedule = {
      ...result.rows[0],
      day_name: getDayName(result.rows[0].day_of_week)
    };
    
    res.json(schedule);
  } catch (error) {
    console.error('Error getting schedule:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    const { section_id, day_of_week, start_period, end_period, room, week, override_conflicts } = req.body;
    
    // Check if schedule exists
    const existsCheck = await pool.query(
      'SELECT schedule_id FROM schedules WHERE schedule_id = $1',
      [id]
    );
    if (existsCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    // Validate required fields
    if (!section_id) {
      return res.status(400).json({ error: 'section_id is required' });
    }
    if (!day_of_week) {
      return res.status(400).json({ error: 'day_of_week is required' });
    }
    if (!start_period) {
      return res.status(400).json({ error: 'start_period is required' });
    }
    if (!end_period) {
      return res.status(400).json({ error: 'end_period is required' });
    }
    if (!week) {
      return res.status(400).json({ error: 'week is required' });
    }
    
    // Validate data types and ranges
    if (typeof day_of_week !== 'number' || day_of_week < 2 || day_of_week > 8) {
      return res.status(400).json({ error: 'day_of_week must be between 2 and 8' });
    }
    if (typeof start_period !== 'number' || start_period < 1 || start_period > 15) {
      return res.status(400).json({ error: 'start_period must be between 1 and 15' });
    }
    if (typeof end_period !== 'number' || end_period < 1 || end_period > 15) {
      return res.status(400).json({ error: 'end_period must be between 1 and 15' });
    }
    if (start_period >= end_period) {
      return res.status(400).json({ error: 'start_period must be less than end_period' });
    }
    if (typeof week !== 'number' || week < 1 || week > 16) {
      return res.status(400).json({ error: 'week must be between 1 and 16' });
    }
    
    // Check if course section exists
    const sectionCheck = await pool.query(
      'SELECT section_id, lecturer_id, semester, academic_year FROM course_sections WHERE section_id = $1',
      [section_id]
    );
    if (sectionCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Course section does not exist' });
    }
    
    const section = sectionCheck.rows[0];
    const conflicts = [];
    
    // Check for room conflict (excluding current schedule)
    if (room) {
      const roomConflict = await pool.query(
        `SELECT s.schedule_id, s.room, s.start_period, s.end_period, cs.section_code, sub.subject_name
         FROM schedules s
         JOIN course_sections cs ON s.section_id = cs.section_id
         JOIN subjects sub ON cs.subject_id = sub.subject_id
         WHERE s.room = $1
           AND s.day_of_week = $2
           AND s.week = $3
           AND cs.semester = $4
           AND cs.academic_year = $5
           AND s.schedule_id != $6
           AND (
             (s.start_period <= $7 AND s.end_period > $7) OR
             (s.start_period < $8 AND s.end_period >= $8) OR
             (s.start_period >= $7 AND s.end_period <= $8)
           )`,
        [room, day_of_week, week, section.semester, section.academic_year, id, start_period, end_period]
      );
      
      if (roomConflict.rows.length > 0) {
        conflicts.push({
          type: 'room',
          message: `Phòng ${room} đã có lớp ${roomConflict.rows[0].section_code} (${roomConflict.rows[0].subject_name}) vào ${getDayName(day_of_week)} tuần ${week} từ tiết ${roomConflict.rows[0].start_period} đến ${roomConflict.rows[0].end_period}`
        });
      }
    }
    
    // Check for lecturer conflict (excluding current schedule, same week)
    const lecturerConflict = await pool.query(
      `SELECT s.schedule_id, s.start_period, s.end_period, sub.subject_name, s.room, s.week, cs.section_code
       FROM schedules s
       JOIN course_sections cs ON s.section_id = cs.section_id
       JOIN subjects sub ON cs.subject_id = sub.subject_id
       WHERE cs.lecturer_id = $1
         AND s.day_of_week = $2
         AND s.week = $3
         AND cs.semester = $4
         AND cs.academic_year = $5
         AND s.schedule_id != $6
         AND (
           (s.start_period <= $7 AND s.end_period > $7) OR
           (s.start_period < $8 AND s.end_period >= $8) OR
           (s.start_period >= $7 AND s.end_period <= $8)
         )`,
      [section.lecturer_id, day_of_week, week, section.semester, section.academic_year, id, start_period, end_period]
    );
    
    if (lecturerConflict.rows.length > 0) {
      conflicts.push({
        type: 'lecturer',
        message: `Giảng viên đang dạy lớp ${lecturerConflict.rows[0].section_code} (${lecturerConflict.rows[0].subject_name}) tại phòng ${lecturerConflict.rows[0].room} vào ${getDayName(day_of_week)} tuần ${week} từ tiết ${lecturerConflict.rows[0].start_period} đến ${lecturerConflict.rows[0].end_period}`
      });
    }
    
    // Check for student conflicts
    const studentConflict = await pool.query(
      `SELECT DISTINCT ss.student_id, u.full_name, s.schedule_id, s.start_period, s.end_period, 
              sub.subject_name, s.room, s.week, cs.section_code
       FROM section_students ss
       JOIN schedules s ON s.section_id = $1
       JOIN course_sections cs ON s.section_id = cs.section_id
       JOIN subjects sub ON cs.subject_id = sub.subject_id
       JOIN users u ON ss.student_id = u.user_id
       WHERE ss.student_id IN (
         SELECT ss2.student_id
         FROM section_students ss2
         JOIN schedules s2 ON s2.section_id = ss2.section_id
         WHERE s2.day_of_week = $2
           AND s2.week = $3
           AND s2.schedule_id != $4
           AND (
             (s2.start_period <= $5 AND s2.end_period > $5) OR
             (s2.start_period < $6 AND s2.end_period >= $6) OR
             (s2.start_period >= $5 AND s2.end_period <= $6)
           )
       )
       LIMIT 5`,
      [section_id, day_of_week, week, id, start_period, end_period]
    );
    
    if (studentConflict.rows.length > 0) {
      const conflictCount = studentConflict.rows.length;
      conflicts.push({
        type: 'student',
        message: `${conflictCount} sinh viên có xung đột lịch học vào ${getDayName(day_of_week)} tuần ${week} từ tiết ${start_period} đến ${end_period}`
      });
    }
    
    // If there are conflicts and override is not set, return warning
    if (conflicts.length > 0 && !override_conflicts) {
      return res.status(409).json({ 
        error: 'Phát hiện xung đột lịch học',
        conflicts: conflicts,
        warning: 'Vui lòng kiểm tra các xung đột trên. Nếu muốn bỏ qua, hãy gửi lại yêu cầu với override_conflicts: true'
      });
    }
    
    // Update schedule
    const updateResult = await pool.query(
      `UPDATE schedules
       SET section_id = $1, day_of_week = $2, start_period = $3, end_period = $4, room = $5, week = $6
       WHERE schedule_id = $7
       RETURNING schedule_id, section_id, day_of_week, start_period, end_period, room, week`,
      [section_id, day_of_week, start_period, end_period, room || null, week, id]
    );
    
    res.json({
      message: 'Cập nhật lịch học thành công',
      data: updateResult.rows[0],
      conflicts_overridden: conflicts.length > 0 ? conflicts : null
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if schedule exists
    const existsCheck = await pool.query(
      'SELECT schedule_id FROM schedules WHERE schedule_id = $1',
      [id]
    );
    if (existsCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Schedule not found' });
    }
    
    // Delete schedule
    await pool.query('DELETE FROM schedules WHERE schedule_id = $1', [id]);
    
    res.json({ message: 'Xóa lịch học thành công' });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({ error: error.message });
  }
};


// --- SECTION STUDENTS (Enrollment Management) ---
exports.addStudentToSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { student_id } = req.body;
    
    // Validate required field
    if (!student_id) {
      return res.status(400).json({ error: 'student_id is required' });
    }
    
    // Check if student exists
    const studentCheck = await pool.query(
      'SELECT student_id FROM students WHERE student_id = $1',
      [student_id]
    );
    if (studentCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Student does not exist' });
    }
    
    // Check if section exists and get details
    const sectionCheck = await pool.query(
      'SELECT section_id, max_capacity, is_locked FROM course_sections WHERE section_id = $1',
      [sectionId]
    );
    if (sectionCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Course section does not exist' });
    }
    
    const section = sectionCheck.rows[0];
    
    // Check if section is locked
    if (section.is_locked) {
      return res.status(400).json({ error: 'Course section is locked and not accepting new enrollments' });
    }
    
    // Check current enrollment count
    const enrollmentCount = await pool.query(
      'SELECT COUNT(*) as count FROM section_students WHERE section_id = $1',
      [sectionId]
    );
    const currentCount = parseInt(enrollmentCount.rows[0].count);
    
    // Check if section is full
    if (currentCount >= section.max_capacity) {
      return res.status(400).json({ 
        error: `Course section is full (${currentCount}/${section.max_capacity})` 
      });
    }
    
    // Check for duplicate enrollment
    const duplicateCheck = await pool.query(
      'SELECT * FROM section_students WHERE section_id = $1 AND student_id = $2',
      [sectionId, student_id]
    );
    if (duplicateCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Student is already enrolled in this course section' });
    }
    
    // Insert enrollment
    const insertResult = await pool.query(
      `INSERT INTO section_students (section_id, student_id)
       VALUES ($1, $2)
       RETURNING section_id, student_id, registered_at`,
      [sectionId, student_id]
    );
    
    res.status(201).json({
      message: 'Thêm sinh viên vào lớp thành công',
      data: insertResult.rows[0]
    });
  } catch (error) {
    console.error('Error adding student to section:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.removeStudentFromSection = async (req, res) => {
  try {
    const { sectionId, studentId } = req.params;
    
    // Check if enrollment exists
    const enrollmentCheck = await pool.query(
      'SELECT * FROM section_students WHERE section_id = $1 AND student_id = $2',
      [sectionId, studentId]
    );
    if (enrollmentCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    // Delete enrollment
    await pool.query(
      'DELETE FROM section_students WHERE section_id = $1 AND student_id = $2',
      [sectionId, studentId]
    );
    
    res.json({ message: 'Xóa sinh viên khỏi lớp thành công' });
  } catch (error) {
    console.error('Error removing student from section:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentsInSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    
    const query = `
      SELECT 
        s.student_id,
        u.full_name,
        u.email,
        s.class_id,
        c.class_name,
        ss.registered_at
      FROM section_students ss
      JOIN students s ON ss.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      LEFT JOIN classes c ON s.class_id = c.class_id
      WHERE ss.section_id = $1
      ORDER BY s.student_id
    `;
    
    const result = await pool.query(query, [sectionId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting students in section:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get students with their grades in a single query (optimized for grade entry)
exports.getStudentsWithGrades = async (req, res) => {
  try {
    const { sectionId } = req.params;
    
    const query = `
      SELECT 
        s.student_id,
        u.full_name,
        u.email,
        s.class_id,
        c.class_name,
        ss.registered_at,
        g.grade_id,
        g.attendance,
        g.midterm,
        g.final,
        g.total_10,
        g.total_4,
        g.grade_char,
        g.status
      FROM section_students ss
      JOIN students s ON ss.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      LEFT JOIN classes c ON s.class_id = c.class_id
      LEFT JOIN grades g ON ss.section_id = g.section_id AND ss.student_id = g.student_id
      WHERE ss.section_id = $1
      ORDER BY s.student_id
    `;
    
    const result = await pool.query(query, [sectionId]);
    
    // Format response with default values for missing grades
    const students = result.rows.map(row => ({
      student_id: row.student_id,
      full_name: row.full_name,
      email: row.email,
      class_id: row.class_id,
      class_name: row.class_name,
      registered_at: row.registered_at,
      grade_id: row.grade_id,
      attendance: row.attendance,
      midterm: row.midterm,
      final: row.final,
      total_10: row.total_10,
      total_4: row.total_4,
      grade_char: row.grade_char,
      status: row.status || 'DRAFT'
    }));
    
    res.json(students);
  } catch (error) {
    console.error('Error getting students with grades:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getSectionsForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // Get sections for student
    const sectionsQuery = `
      SELECT 
        cs.section_id,
        cs.section_code,
        cs.subject_id,
        sub.subject_name,
        sub.credits,
        u.full_name as lecturer_name,
        cs.semester,
        cs.academic_year,
        cs.room_default,
        ss.registered_at
      FROM section_students ss
      JOIN course_sections cs ON ss.section_id = cs.section_id
      JOIN subjects sub ON cs.subject_id = sub.subject_id
      JOIN lecturers l ON cs.lecturer_id = l.lecturer_id
      JOIN users u ON l.user_id = u.user_id
      WHERE ss.student_id = $1
      ORDER BY cs.academic_year DESC, cs.semester, sub.subject_name
    `;
    
    const sectionsResult = await pool.query(sectionsQuery, [studentId]);
    const sections = sectionsResult.rows;
    
    // Get schedules for each section
    for (let section of sections) {
      const schedulesQuery = `
        SELECT 
          schedule_id,
          day_of_week,
          start_period,
          end_period,
          room,
          week
        FROM schedules
        WHERE section_id = $1
        ORDER BY week, day_of_week, start_period
      `;
      
      const schedulesResult = await pool.query(schedulesQuery, [section.section_id]);
      section.schedules = schedulesResult.rows;
    }
    
    res.json(sections);
  } catch (error) {
    console.error('Error getting sections for student:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.bulkAddStudentsToSection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    const { student_ids } = req.body;
    
    // Validate required field
    if (!student_ids || !Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ error: 'student_ids array is required and must not be empty' });
    }
    
    // Check if section exists and get details
    const sectionCheck = await pool.query(
      'SELECT section_id, max_capacity, is_locked FROM course_sections WHERE section_id = $1',
      [sectionId]
    );
    if (sectionCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Course section does not exist' });
    }
    
    const section = sectionCheck.rows[0];
    
    // Check if section is locked
    if (section.is_locked) {
      return res.status(400).json({ error: 'Course section is locked and not accepting new enrollments' });
    }
    
    // Get current enrollment count
    const enrollmentCount = await pool.query(
      'SELECT COUNT(*) as count FROM section_students WHERE section_id = $1',
      [sectionId]
    );
    let currentCount = parseInt(enrollmentCount.rows[0].count);
    
    const results = {
      successful: [],
      failed: [],
      skipped: []
    };
    
    // Process each student
    for (const student_id of student_ids) {
      try {
        // Check if section is full
        if (currentCount >= section.max_capacity) {
          results.failed.push({
            student_id,
            reason: `Course section is full (${currentCount}/${section.max_capacity})`
          });
          continue;
        }
        
        // Check if student exists
        const studentCheck = await pool.query(
          'SELECT student_id FROM students WHERE student_id = $1',
          [student_id]
        );
        if (studentCheck.rows.length === 0) {
          results.failed.push({
            student_id,
            reason: 'Student does not exist'
          });
          continue;
        }
        
        // Check for duplicate enrollment
        const duplicateCheck = await pool.query(
          'SELECT * FROM section_students WHERE section_id = $1 AND student_id = $2',
          [sectionId, student_id]
        );
        if (duplicateCheck.rows.length > 0) {
          results.skipped.push(student_id);
          continue;
        }
        
        // Insert enrollment
        await pool.query(
          'INSERT INTO section_students (section_id, student_id) VALUES ($1, $2)',
          [sectionId, student_id]
        );
        
        results.successful.push(student_id);
        currentCount++;
      } catch (error) {
        results.failed.push({
          student_id,
          reason: error.message
        });
      }
    }
    
    const summary = {
      total: student_ids.length,
      successful: results.successful.length,
      failed: results.failed.length,
      skipped: results.skipped.length
    };
    
    res.json({
      message: `Đã thêm ${summary.successful} sinh viên vào lớp`,
      summary,
      details: results
    });
  } catch (error) {
    console.error('Error bulk adding students:', error);
    res.status(500).json({ error: error.message });
  }
};
