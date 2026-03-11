const pool = require('../config/db');

// Helper function to calculate grades
const calculateGrades = (attendance, midterm, final) => {
  // Calculate total_10 with formula: attendance*0.1 + midterm*0.3 + final*0.6
  const total_10 = Math.round(
    (attendance * 0.1 + midterm * 0.3 + final * 0.6) * 100
  ) / 100;
  
  // Determine total_4 and grade_char based on scale
  let total_4, grade_char;
  
  if (total_10 >= 9.0) {
    total_4 = 4.0;
    grade_char = 'A+';  // 9.0-10: Xuất sắc
  } else if (total_10 >= 8.0) {
    total_4 = 4.0;
    grade_char = 'A';   // 8.0-8.9: Giỏi
  } else if (total_10 >= 7.5) {
    total_4 = 3.5;
    grade_char = 'B+';  // 7.5-7.9: Khá giỏi
  } else if (total_10 >= 7.0) {
    total_4 = 3.0;
    grade_char = 'B';   // 7.0-7.4: Khá
  } else if (total_10 >= 6.0) {
    total_4 = 2.5;
    grade_char = 'C+';  // 6.0-6.9: Trung bình khá
  } else if (total_10 >= 5.0) {
    total_4 = 2.0;
    grade_char = 'C';   // 5.0-5.9: Trung bình
  } else if (total_10 >= 4.5) {
    total_4 = 1.5;
    grade_char = 'D+';  // 4.5-4.9: Trung bình yếu
  } else if (total_10 >= 4.0) {
    total_4 = 1.0;
    grade_char = 'D';   // 4.0-4.4: Yếu
  } else {
    total_4 = 0.0;
    grade_char = 'F';   // Dưới 4.0: Kém (Học lại)
  }
  
  return { total_10, total_4, grade_char };
};

exports.enterGrade = async (req, res) => {
  try {
    const { section_id, student_id, attendance, midterm, final, lecturer_id } = req.body;
    
    console.log('DEBUG: enterGrade called with:', { section_id, student_id, attendance, midterm, final, lecturer_id });
    
    // Validate required fields
    if (!section_id) {
      return res.status(400).json({ error: 'section_id is required' });
    }
    if (!student_id) {
      return res.status(400).json({ error: 'student_id is required' });
    }
    if (!lecturer_id) {
      return res.status(400).json({ error: 'lecturer_id is required' });
    }
    
    // Validate grade values
    if (attendance !== null && attendance !== undefined) {
      if (typeof attendance !== 'number' || attendance < 0 || attendance > 10) {
        return res.status(400).json({ error: 'attendance must be between 0 and 10' });
      }
    }
    if (midterm !== null && midterm !== undefined) {
      if (typeof midterm !== 'number' || midterm < 0 || midterm > 10) {
        return res.status(400).json({ error: 'midterm must be between 0 and 10' });
      }
    }
    if (final !== null && final !== undefined) {
      if (typeof final !== 'number' || final < 0 || final > 10) {
        return res.status(400).json({ error: 'final must be between 0 and 10' });
      }
    }
    
    // Verify lecturer is assigned to section
    const sectionCheck = await pool.query(
      'SELECT lecturer_id FROM course_sections WHERE section_id = $1',
      [section_id]
    );
    
    if (sectionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course section not found' });
    }
    
    if (sectionCheck.rows[0].lecturer_id !== lecturer_id) {
      return res.status(403).json({ error: 'You are not assigned to this course section' });
    }
    
    // Check student enrollment
    const enrollmentCheck = await pool.query(
      'SELECT * FROM section_students WHERE section_id = $1 AND student_id = $2',
      [section_id, student_id]
    );
    
    if (enrollmentCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Student is not enrolled in this course section' });
    }
    
    // Check if grade exists and its status
    const existingGrade = await pool.query(
      'SELECT grade_id, status FROM grades WHERE section_id = $1 AND student_id = $2',
      [section_id, student_id]
    );
    
    if (existingGrade.rows.length > 0) {
      const status = existingGrade.rows[0].status;
      if (status !== 'DRAFT') {
        return res.status(403).json({ 
          error: `Cannot modify grades with status: ${status}. Grades must be in DRAFT status.` 
        });
      }
    }
    
    // Calculate grades if all components provided
    let total_10 = null, total_4 = null, grade_char = null;
    
    if (attendance !== null && attendance !== undefined && 
        midterm !== null && midterm !== undefined && 
        final !== null && final !== undefined) {
      const calculated = calculateGrades(attendance, midterm, final);
      total_10 = calculated.total_10;
      total_4 = calculated.total_4;
      grade_char = calculated.grade_char;
    }
    
    // Insert or update grade
    const upsertQuery = `
      INSERT INTO grades (
        section_id, student_id, attendance, midterm, final,
        total_10, total_4, grade_char, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'DRAFT')
      ON CONFLICT (section_id, student_id)
      DO UPDATE SET
        attendance = EXCLUDED.attendance,
        midterm = EXCLUDED.midterm,
        final = EXCLUDED.final,
        total_10 = EXCLUDED.total_10,
        total_4 = EXCLUDED.total_4,
        grade_char = EXCLUDED.grade_char,
        status = 'DRAFT'
      RETURNING *
    `;
    
    const result = await pool.query(upsertQuery, [
      section_id, student_id, attendance, midterm, final,
      total_10, total_4, grade_char
    ]);
    
    const isNew = existingGrade.rows.length === 0;
    
    res.status(isNew ? 201 : 200).json({
      message: isNew ? 'Nhập điểm thành công' : 'Cập nhật điểm thành công',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error entering grade:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentGrades = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const query = `
      SELECT 
        g.grade_id,
        cs.section_id,
        cs.section_code,
        cs.subject_id,
        s.subject_name,
        s.credits,
        u.full_name as lecturer_name,
        cs.semester,
        cs.academic_year,
        g.attendance,
        g.midterm,
        g.final,
        g.total_10,
        g.total_4,
        g.grade_char,
        g.status
      FROM grades g
      JOIN course_sections cs ON g.section_id = cs.section_id
      JOIN subjects s ON cs.subject_id = s.subject_id
      JOIN lecturers l ON cs.lecturer_id = l.lecturer_id
      JOIN users u ON l.user_id = u.user_id
      WHERE g.student_id = $1
      ORDER BY cs.academic_year DESC, cs.semester, s.subject_name
    `;
    
    const result = await pool.query(query, [studentId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting student grades:', error);
    res.status(500).json({ error: error.message });
  }
};


// Submit grades for approval
exports.submitGradesForApproval = async (req, res) => {
  try {
    const { section_id, lecturer_id } = req.body;
    
    if (!section_id || !lecturer_id) {
      return res.status(400).json({ error: 'section_id and lecturer_id are required' });
    }
    
    // Verify lecturer is assigned to section
    const sectionCheck = await pool.query(
      'SELECT lecturer_id FROM course_sections WHERE section_id = $1',
      [section_id]
    );
    
    if (sectionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course section not found' });
    }
    
    if (sectionCheck.rows[0].lecturer_id !== lecturer_id) {
      return res.status(403).json({ error: 'You are not assigned to this course section' });
    }
    
    // Check if all students have grades
    const studentsQuery = `
      SELECT COUNT(*) as total_students
      FROM section_students
      WHERE section_id = $1
    `;
    const studentsResult = await pool.query(studentsQuery, [section_id]);
    const totalStudents = parseInt(studentsResult.rows[0].total_students);
    
    const gradesQuery = `
      SELECT COUNT(*) as graded_students
      FROM grades
      WHERE section_id = $1 
        AND attendance IS NOT NULL 
        AND midterm IS NOT NULL 
        AND final IS NOT NULL
        AND status = 'DRAFT'
    `;
    const gradesResult = await pool.query(gradesQuery, [section_id]);
    const gradedStudents = parseInt(gradesResult.rows[0].graded_students);
    
    if (gradedStudents < totalStudents) {
      return res.status(400).json({ 
        error: `Chưa nhập đủ điểm. Đã nhập: ${gradedStudents}/${totalStudents} sinh viên` 
      });
    }
    
    // Update all grades status to SUBMITTED
    const updateQuery = `
      UPDATE grades
      SET status = 'SUBMITTED'
      WHERE section_id = $1 AND status = 'DRAFT'
      RETURNING *
    `;
    
    const result = await pool.query(updateQuery, [section_id]);
    
    res.json({
      message: 'Gửi bảng điểm thành công',
      submitted_count: result.rows.length
    });
  } catch (error) {
    console.error('Error submitting grades:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get grades by section (for lecturer to view)
exports.getGradesBySection = async (req, res) => {
  try {
    const { sectionId } = req.params;
    
    const query = `
      SELECT 
        g.*,
        s.student_id,
        u.full_name,
        u.email,
        c.class_name
      FROM grades g
      JOIN students s ON g.student_id = s.student_id
      JOIN users u ON s.user_id = u.user_id
      LEFT JOIN classes c ON s.class_id = c.class_id
      WHERE g.section_id = $1
      ORDER BY s.student_id
    `;
    
    const result = await pool.query(query, [sectionId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting grades by section:', error);
    res.status(500).json({ error: error.message });
  }
};
