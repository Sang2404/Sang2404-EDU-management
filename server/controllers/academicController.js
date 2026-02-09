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
    // Extract request body parameters
    const { subject_id, teacher_id, semester, year, max_students, section_code } = req.body;
    
    // Validate required fields
    if (!subject_id) {
      return res.status(400).json({ error: 'subject_id is required' });
    }
    if (!teacher_id) {
      return res.status(400).json({ error: 'teacher_id is required' });
    }
    if (!semester) {
      return res.status(400).json({ error: 'semester is required' });
    }
    if (!year) {
      return res.status(400).json({ error: 'year is required' });
    }
    if (max_students === undefined || max_students === null) {
      return res.status(400).json({ error: 'max_students is required' });
    }
    if (!section_code) {
      return res.status(400).json({ error: 'section_code is required' });
    }
    
    // Validate data type and constraints
    if (typeof max_students !== 'number' || max_students <= 0) {
      return res.status(400).json({ error: 'max_students must be a positive integer' });
    }
    
    // Validate section_code is not empty or whitespace
    if (typeof section_code === 'string' && section_code.trim().length === 0) {
      return res.status(400).json({ error: 'section_code cannot be empty' });
    }
    
    // Map API parameters to database column names
    const lecturer_id = teacher_id;
    const academic_year = year;
    const max_capacity = max_students;
    
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
      [lecturer_id]
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
       (subject_id, lecturer_id, semester, academic_year, max_capacity, section_code) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING section_id, subject_id, lecturer_id, semester, academic_year, max_capacity, section_code`,
      [subject_id, lecturer_id, semester, academic_year, max_capacity, section_code]
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
    console.error('Error creating course section:', error);
    res.status(500).json({ error: error.message });
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
    const { subject_id, teacher_id, semester, year, max_students, section_code, room_default, is_locked } = req.body;
    
    // Check if course section exists
    const existsCheck = await pool.query(
      'SELECT section_id FROM course_sections WHERE section_id = $1',
      [id]
    );
    if (existsCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course section not found' });
    }
    
    // Validate required fields
    if (!subject_id) {
      return res.status(400).json({ error: 'subject_id is required' });
    }
    if (!teacher_id) {
      return res.status(400).json({ error: 'teacher_id is required' });
    }
    if (!semester) {
      return res.status(400).json({ error: 'semester is required' });
    }
    if (!year) {
      return res.status(400).json({ error: 'year is required' });
    }
    if (max_students === undefined || max_students === null) {
      return res.status(400).json({ error: 'max_students is required' });
    }
    if (!section_code) {
      return res.status(400).json({ error: 'section_code is required' });
    }
    
    // Validate data type and constraints
    if (typeof max_students !== 'number' || max_students <= 0) {
      return res.status(400).json({ error: 'max_students must be a positive integer' });
    }
    
    // Validate section_code is not empty or whitespace
    if (typeof section_code === 'string' && section_code.trim().length === 0) {
      return res.status(400).json({ error: 'section_code cannot be empty' });
    }
    
    // Map API parameters to database column names
    const lecturer_id = teacher_id;
    const academic_year = year;
    const max_capacity = max_students;
    
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
      [lecturer_id]
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
      [subject_id, lecturer_id, semester, academic_year, max_capacity, section_code, room_default || null, is_locked || false, id]
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

exports.createSchedule = async (req, res) => {
  try {
    const { section_id, day_of_week, start_period, end_period, room } = req.body;
    
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
    
    // Check for room conflict
    if (room) {
      const roomConflict = await pool.query(
        `SELECT s.schedule_id, s.room, s.start_period, s.end_period
         FROM schedules s
         JOIN course_sections cs ON s.section_id = cs.section_id
         WHERE s.room = $1
           AND s.day_of_week = $2
           AND cs.semester = $3
           AND cs.academic_year = $4
           AND (
             (s.start_period <= $5 AND s.end_period > $5) OR
             (s.start_period < $6 AND s.end_period >= $6) OR
             (s.start_period >= $5 AND s.end_period <= $6)
           )`,
        [room, day_of_week, section.semester, section.academic_year, start_period, end_period]
      );
      
      if (roomConflict.rows.length > 0) {
        return res.status(409).json({ 
          error: `Room ${room} is already booked on ${getDayName(day_of_week)} from period ${roomConflict.rows[0].start_period} to ${roomConflict.rows[0].end_period}` 
        });
      }
    }
    
    // Check for lecturer conflict
    const lecturerConflict = await pool.query(
      `SELECT s.schedule_id, s.start_period, s.end_period, sub.subject_name
       FROM schedules s
       JOIN course_sections cs ON s.section_id = cs.section_id
       JOIN subjects sub ON cs.subject_id = sub.subject_id
       WHERE cs.lecturer_id = $1
         AND s.day_of_week = $2
         AND cs.semester = $3
         AND cs.academic_year = $4
         AND (
           (s.start_period <= $5 AND s.end_period > $5) OR
           (s.start_period < $6 AND s.end_period >= $6) OR
           (s.start_period >= $5 AND s.end_period <= $6)
         )`,
      [section.lecturer_id, day_of_week, section.semester, section.academic_year, start_period, end_period]
    );
    
    if (lecturerConflict.rows.length > 0) {
      return res.status(409).json({ 
        error: `Lecturer is already teaching ${lecturerConflict.rows[0].subject_name} on ${getDayName(day_of_week)} from period ${lecturerConflict.rows[0].start_period} to ${lecturerConflict.rows[0].end_period}` 
      });
    }
    
    // Insert schedule
    const insertResult = await pool.query(
      `INSERT INTO schedules (section_id, day_of_week, start_period, end_period, room)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING schedule_id, section_id, day_of_week, start_period, end_period, room`,
      [section_id, day_of_week, start_period, end_period, room || null]
    );
    
    const createdSchedule = insertResult.rows[0];
    
    res.status(201).json({
      message: 'Tạo lịch học thành công',
      data: createdSchedule
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
    const { section_id, day_of_week, start_period, end_period, room } = req.body;
    
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
    
    // Check for room conflict (excluding current schedule)
    if (room) {
      const roomConflict = await pool.query(
        `SELECT s.schedule_id, s.room, s.start_period, s.end_period
         FROM schedules s
         JOIN course_sections cs ON s.section_id = cs.section_id
         WHERE s.room = $1
           AND s.day_of_week = $2
           AND cs.semester = $3
           AND cs.academic_year = $4
           AND s.schedule_id != $5
           AND (
             (s.start_period <= $6 AND s.end_period > $6) OR
             (s.start_period < $7 AND s.end_period >= $7) OR
             (s.start_period >= $6 AND s.end_period <= $7)
           )`,
        [room, day_of_week, section.semester, section.academic_year, id, start_period, end_period]
      );
      
      if (roomConflict.rows.length > 0) {
        return res.status(409).json({ 
          error: `Room ${room} is already booked on ${getDayName(day_of_week)} from period ${roomConflict.rows[0].start_period} to ${roomConflict.rows[0].end_period}` 
        });
      }
    }
    
    // Check for lecturer conflict (excluding current schedule)
    const lecturerConflict = await pool.query(
      `SELECT s.schedule_id, s.start_period, s.end_period, sub.subject_name
       FROM schedules s
       JOIN course_sections cs ON s.section_id = cs.section_id
       JOIN subjects sub ON cs.subject_id = sub.subject_id
       WHERE cs.lecturer_id = $1
         AND s.day_of_week = $2
         AND cs.semester = $3
         AND cs.academic_year = $4
         AND s.schedule_id != $5
         AND (
           (s.start_period <= $6 AND s.end_period > $6) OR
           (s.start_period < $7 AND s.end_period >= $7) OR
           (s.start_period >= $6 AND s.end_period <= $7)
         )`,
      [section.lecturer_id, day_of_week, section.semester, section.academic_year, id, start_period, end_period]
    );
    
    if (lecturerConflict.rows.length > 0) {
      return res.status(409).json({ 
        error: `Lecturer is already teaching ${lecturerConflict.rows[0].subject_name} on ${getDayName(day_of_week)} from period ${lecturerConflict.rows[0].start_period} to ${lecturerConflict.rows[0].end_period}` 
      });
    }
    
    // Update schedule
    const updateResult = await pool.query(
      `UPDATE schedules
       SET section_id = $1, day_of_week = $2, start_period = $3, end_period = $4, room = $5
       WHERE schedule_id = $6
       RETURNING schedule_id, section_id, day_of_week, start_period, end_period, room`,
      [section_id, day_of_week, start_period, end_period, room || null, id]
    );
    
    res.json({
      message: 'Cập nhật lịch học thành công',
      data: updateResult.rows[0]
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

exports.getSectionsForStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const query = `
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
    
    const result = await pool.query(query, [studentId]);
    res.json(result.rows);
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
