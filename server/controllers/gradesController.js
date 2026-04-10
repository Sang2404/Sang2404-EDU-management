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
    console.log('DEBUG: lecturer_id type:', typeof lecturer_id);
    
    // Validate required fields
    console.log('DEBUG: Starting validation...');
    if (!section_id) {
      console.log('DEBUG: Missing section_id');
      return res.status(400).json({ error: 'section_id is required' });
    }
    if (!student_id) {
      console.log('DEBUG: Missing student_id');
      return res.status(400).json({ error: 'student_id is required' });
    }
    if (!lecturer_id) {
      console.log('DEBUG: Missing lecturer_id');
      return res.status(400).json({ error: 'lecturer_id is required' });
    }
    console.log('DEBUG: Basic validation passed');
    
    // Validate grade values
    console.log('DEBUG: Starting grade validation...');
    if (attendance !== null && attendance !== undefined) {
      if (typeof attendance !== 'number' || attendance < 0 || attendance > 10) {
        console.log('DEBUG: Invalid attendance:', attendance, typeof attendance);
        return res.status(400).json({ error: 'attendance must be between 0 and 10' });
      }
    }
    if (midterm !== null && midterm !== undefined) {
      if (typeof midterm !== 'number' || midterm < 0 || midterm > 10) {
        console.log('DEBUG: Invalid midterm:', midterm, typeof midterm);
        return res.status(400).json({ error: 'midterm must be between 0 and 10' });
      }
    }
    if (final !== null && final !== undefined) {
      if (typeof final !== 'number' || final < 0 || final > 10) {
        console.log('DEBUG: Invalid final:', final, typeof final);
        return res.status(400).json({ error: 'final must be between 0 and 10' });
      }
    }
    console.log('DEBUG: Grade validation passed');
    
    // Verify lecturer is assigned to section
    console.log('DEBUG: Checking lecturer assignment for section:', section_id);
    const sectionCheck = await pool.query(
      'SELECT lecturer_id FROM course_sections WHERE section_id = $1',
      [section_id]
    );
    
    console.log('DEBUG: Section check result:', sectionCheck.rows);
    
    if (sectionCheck.rows.length === 0) {
      console.log('DEBUG: Course section not found');
      return res.status(404).json({ error: 'Course section not found' });
    }
    
    const dbLecturerId = sectionCheck.rows[0].lecturer_id;
    console.log('DEBUG: DB lecturer_id:', dbLecturerId, 'type:', typeof dbLecturerId);
    console.log('DEBUG: Request lecturer_id:', lecturer_id, 'type:', typeof lecturer_id);
    console.log('DEBUG: Comparison result:', dbLecturerId !== lecturer_id);
    
    if (dbLecturerId !== lecturer_id) {
      console.log('DEBUG: Lecturer not assigned to section - returning 403');
      return res.status(403).json({ error: 'You are not assigned to this course section' });
    }
    
    console.log('DEBUG: Lecturer verification passed');
    
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
    
    console.log('DEBUG: Existing grade check:', existingGrade.rows);
    
    if (existingGrade.rows.length > 0) {
      const status = existingGrade.rows[0].status;
      console.log('DEBUG: Current grade status:', status);
      if (status === 'APPROVED') {
        console.log('DEBUG: Returning 403 - grade is approved');
        return res.status(403).json({ 
          error: `Cannot modify approved grades. Current status: ${status}` 
        });
      }
      if (status === 'SUBMITTED') {
        console.log('DEBUG: Returning 403 - grade is submitted');
        return res.status(403).json({ 
          error: `Cannot modify submitted grades. Current status: ${status}. Please contact admin to revert to draft.` 
        });
      }
    }
    
    console.log('DEBUG: Status check passed, proceeding with grade calculation...');
    
    // Calculate grades if all components provided
    let total_10 = null, total_4 = null, grade_char = null;
    
    console.log('DEBUG: Starting grade calculation...');
    if (attendance !== null && attendance !== undefined && 
        midterm !== null && midterm !== undefined && 
        final !== null && final !== undefined) {
      console.log('DEBUG: All grade components provided, calculating...');
      const calculated = calculateGrades(attendance, midterm, final);
      total_10 = calculated.total_10;
      total_4 = calculated.total_4;
      grade_char = calculated.grade_char;
      console.log('DEBUG: Calculated grades:', { total_10, total_4, grade_char });
    } else {
      console.log('DEBUG: Not all grade components provided, skipping calculation');
    }
    
    console.log('DEBUG: Preparing to insert/update grade...');
    
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
    
    console.log('DEBUG: Executing upsert query with values:', [
      section_id, student_id, attendance, midterm, final,
      total_10, total_4, grade_char
    ]);
    
    const result = await pool.query(upsertQuery, [
      section_id, student_id, attendance, midterm, final,
      total_10, total_4, grade_char
    ]);
    
    console.log('DEBUG: Upsert query result:', result.rows);
    
    const isNew = existingGrade.rows.length === 0;
    console.log('DEBUG: Is new grade:', isNew);
    
    // Convert decimal values to numbers for frontend
    const gradeData = result.rows[0];
    console.log('DEBUG: Raw grade data from DB:', gradeData);
    
    const responseData = {
      ...gradeData,
      attendance: gradeData.attendance ? parseFloat(gradeData.attendance) : null,
      midterm: gradeData.midterm ? parseFloat(gradeData.midterm) : null,
      final: gradeData.final ? parseFloat(gradeData.final) : null,
      total_10: gradeData.total_10 ? parseFloat(gradeData.total_10) : null,
      total_4: gradeData.total_4 ? parseFloat(gradeData.total_4) : null
    };
    
    console.log('DEBUG: Prepared response data:', responseData);
    console.log('DEBUG: Sending response with status:', isNew ? 201 : 200);
    
    res.status(isNew ? 201 : 200).json({
      message: isNew ? 'Nhập điểm thành công' : 'Cập nhật điểm thành công',
      data: responseData
    });
    
    console.log('DEBUG: Response sent successfully');
  } catch (error) {
    console.error('❌ ERROR in enterGrade:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error message:', error.message);
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
    
    console.log('DEBUG: submitGradesForApproval called with:', { section_id, lecturer_id });
    
    if (!section_id || !lecturer_id) {
      return res.status(400).json({ error: 'section_id and lecturer_id are required' });
    }
    
    // Verify lecturer is assigned to section
    const sectionCheck = await pool.query(
      'SELECT lecturer_id FROM course_sections WHERE section_id = $1',
      [section_id]
    );
    
    console.log('DEBUG: Section check result:', sectionCheck.rows);
    
    if (sectionCheck.rows.length === 0) {
      console.log('DEBUG: Course section not found');
      return res.status(404).json({ error: 'Course section not found' });
    }
    
    const dbLecturerId = sectionCheck.rows[0].lecturer_id;
    console.log('DEBUG: DB lecturer_id:', dbLecturerId, 'type:', typeof dbLecturerId);
    console.log('DEBUG: Request lecturer_id:', lecturer_id, 'type:', typeof lecturer_id);
    
    // Trim whitespace and compare as strings
    const trimmedDbLecturerId = String(dbLecturerId).trim();
    const trimmedRequestLecturerId = String(lecturer_id).trim();
    
    console.log('DEBUG: Trimmed DB lecturer_id:', `"${trimmedDbLecturerId}"`);
    console.log('DEBUG: Trimmed Request lecturer_id:', `"${trimmedRequestLecturerId}"`);
    console.log('DEBUG: Trimmed comparison result:', trimmedDbLecturerId === trimmedRequestLecturerId);
    
    if (trimmedDbLecturerId !== trimmedRequestLecturerId) {
      console.log('DEBUG: Lecturer ID mismatch - DB:', `"${trimmedDbLecturerId}"`, 'Request:', `"${trimmedRequestLecturerId}"`);
      return res.status(403).json({ error: `You are not assigned to this course section. Expected: ${trimmedDbLecturerId}, Got: ${trimmedRequestLecturerId}` });
    }
    
    console.log('DEBUG: Lecturer verification passed, checking grades...');
    
    // Check if all students have grades
    const studentsQuery = `
      SELECT COUNT(*) as total_students
      FROM section_students
      WHERE section_id = $1
    `;
    const studentsResult = await pool.query(studentsQuery, [section_id]);
    const totalStudents = parseInt(studentsResult.rows[0].total_students);
    console.log('DEBUG: Total students:', totalStudents);
    
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
    console.log('DEBUG: Graded students:', gradedStudents);
    
    if (gradedStudents < totalStudents) {
      console.log('DEBUG: Not enough grades - returning 400');
      return res.status(400).json({ 
        error: `Chưa nhập đủ điểm. Đã nhập: ${gradedStudents}/${totalStudents} sinh viên` 
      });
    }
    
    console.log('DEBUG: All students have grades, updating status to SUBMITTED...');
    
    // Update all grades status to SUBMITTED
    const updateQuery = `
      UPDATE grades
      SET status = 'SUBMITTED'
      WHERE section_id = $1 AND status = 'DRAFT'
      RETURNING grade_id, student_id, status
    `;
    
    const result = await pool.query(updateQuery, [section_id]);
    console.log('DEBUG: Updated grades:', result.rows);
    console.log('DEBUG: Updated grades count:', result.rows.length);
    
    if (result.rows.length === 0) {
      console.log('DEBUG: No grades were updated - checking current status');
      const statusCheck = await pool.query(
        'SELECT status, COUNT(*) as count FROM grades WHERE section_id = $1 GROUP BY status',
        [section_id]
      );
      console.log('DEBUG: Current grade statuses:', statusCheck.rows);
      return res.status(400).json({ 
        error: 'Không có điểm nào ở trạng thái DRAFT để gửi duyệt',
        current_status: statusCheck.rows
      });
    }
    
    console.log('DEBUG: Submit successful, sending response...');
    
    res.json({
      message: 'Gửi bảng điểm thành công',
      submitted_count: result.rows.length,
      section_id: section_id,
      status: 'SUBMITTED'
    });
  } catch (error) {
    console.error('❌ ERROR in submitGradesForApproval:', error);
    console.error('❌ Error stack:', error.stack);
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
// Mobile app endpoint
exports.getStudentGradesMobile = async (req, res) => {
  try {
    const studentId = req.user.student_id;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Không tìm thấy thông tin sinh viên'
      });
    }

    const query = `
      SELECT 
        g.grade_id,
        g.section_id,
        g.student_id,
        g.attendance,
        g.midterm,
        g.final,
        g.total_10 as average,
        g.grade_char as letter_grade,
        CASE WHEN g.status = 'APPROVED' THEN true ELSE false END as is_complete,
        cs.section_code as section_name,
        cs.semester,
        cs.academic_year,
        sub.subject_name,
        sub.subject_id,
        sub.credits,
        l.full_name as lecturer_name
      FROM grades g
      JOIN course_sections cs ON g.section_id = cs.section_id
      JOIN subjects sub ON cs.subject_id = sub.subject_id
      JOIN lecturers lec ON cs.lecturer_id = lec.lecturer_id
      JOIN users l ON lec.user_id = l.user_id
      WHERE g.student_id = $1
      ORDER BY cs.section_code
    `;

    const result = await pool.query(query, [studentId]);
    
    res.json({
      success: true,
      grades: result.rows
    });
  } catch (error) {
    console.error('Error fetching student grades:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy điểm số',
      error: error.message
    });
  }
};

// Debug endpoint to check GPA calculation for a specific student
exports.debugStudentGPA = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    console.log(`🔍 Debug GPA for student: ${studentId}`);
    
    // Get all grades for the student
    const gradesQuery = `
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
    
    const gradesResult = await pool.query(gradesQuery, [studentId]);
    const grades = gradesResult.rows;
    
    // Calculate GPA step by step
    let totalCredits = 0;
    let totalGradePoints = 0;
    let passedCredits = 0;
    let gradesWithScores = 0;
    
    const gradeDetails = grades.map(grade => {
      const total10 = grade.total_10 != null ? parseFloat(grade.total_10) : null;
      const total4 = grade.total_4 != null ? parseFloat(grade.total_4) : null;
      const credits = grade.credits || 0;
      
      // Check if grade has scores
      const hasScores = total10 != null && !isNaN(total10);
      
      let gradeChar = grade.grade_char;
      let passed = false;
      
      if (hasScores) {
        gradesWithScores++;
        totalCredits += credits;
        totalGradePoints += (total4 || 0) * credits;
        
        // Calculate grade char if not in DB
        if (!gradeChar || gradeChar === 'null') {
          if (total10 >= 9.0) gradeChar = 'A+';
          else if (total10 >= 8.0) gradeChar = 'A';
          else if (total10 >= 7.5) gradeChar = 'B+';
          else if (total10 >= 7.0) gradeChar = 'B';
          else if (total10 >= 6.0) gradeChar = 'C+';
          else if (total10 >= 5.0) gradeChar = 'C';
          else if (total10 >= 4.5) gradeChar = 'D+';
          else if (total10 >= 4.0) gradeChar = 'D';
          else gradeChar = 'F';
        }
        
        // Check if passed
        passed = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D+', 'D'].includes(gradeChar);
        if (passed) {
          passedCredits += credits;
        }
      }
      
      return {
        ...grade,
        calculated_grade_char: gradeChar,
        passed,
        has_scores: hasScores,
        grade_points: hasScores ? (total4 || 0) * credits : 0
      };
    });
    
    const gpa = totalCredits > 0 ? (totalGradePoints / totalCredits) : 0;
    
    res.json({
      student_id: studentId,
      total_subjects: grades.length,
      subjects_with_scores: gradesWithScores,
      total_credits: totalCredits,
      passed_credits: passedCredits,
      total_grade_points: totalGradePoints,
      gpa: parseFloat(gpa.toFixed(2)),
      grade_details: gradeDetails,
      calculation_summary: {
        formula: 'GPA = Total Grade Points / Total Credits',
        total_grade_points_calculation: `Sum of (total_4 * credits) for all subjects with scores`,
        total_credits_calculation: `Sum of credits for all subjects with scores`,
        pass_criteria: 'Grade D (4.0) or above'
      }
    });
    
  } catch (error) {
    console.error('Error in debugStudentGPA:', error);
    res.status(500).json({ error: error.message });
  }
};
// Fix GPA calculation by recalculating total_4 and grade_char for all grades
exports.fixGPACalculation = async (req, res) => {
  try {
    console.log('🔧 Starting GPA calculation fix...');
    
    // Get all grades that have total_10 but missing total_4 or grade_char
    const gradesQuery = `
      SELECT grade_id, total_10, total_4, grade_char
      FROM grades 
      WHERE total_10 IS NOT NULL 
        AND (total_4 IS NULL OR grade_char IS NULL OR grade_char = '')
    `;
    
    const gradesResult = await pool.query(gradesQuery);
    const gradesToFix = gradesResult.rows;
    
    console.log(`📊 Found ${gradesToFix.length} grades to fix`);
    
    let fixedCount = 0;
    const results = [];
    
    for (const grade of gradesToFix) {
      const total10 = parseFloat(grade.total_10);
      
      // Calculate total_4 and grade_char using the same logic as calculateGrades
      let total_4, grade_char;
      
      if (total10 >= 9.0) {
        total_4 = 4.0;
        grade_char = 'A+';
      } else if (total10 >= 8.0) {
        total_4 = 4.0;
        grade_char = 'A';
      } else if (total10 >= 7.5) {
        total_4 = 3.5;
        grade_char = 'B+';
      } else if (total10 >= 7.0) {
        total_4 = 3.0;
        grade_char = 'B';
      } else if (total10 >= 6.0) {
        total_4 = 2.5;
        grade_char = 'C+';
      } else if (total10 >= 5.0) {
        total_4 = 2.0;
        grade_char = 'C';
      } else if (total10 >= 4.5) {
        total_4 = 1.5;
        grade_char = 'D+';
      } else if (total10 >= 4.0) {
        total_4 = 1.0;
        grade_char = 'D';
      } else {
        total_4 = 0.0;
        grade_char = 'F';
      }
      
      // Update the grade
      const updateQuery = `
        UPDATE grades 
        SET total_4 = $1, grade_char = $2
        WHERE grade_id = $3
      `;
      
      await pool.query(updateQuery, [total_4, grade_char, grade.grade_id]);
      
      results.push({
        grade_id: grade.grade_id,
        total_10: total10,
        old_total_4: grade.total_4,
        new_total_4: total_4,
        old_grade_char: grade.grade_char,
        new_grade_char: grade_char
      });
      
      fixedCount++;
    }
    
    console.log(`✅ Fixed ${fixedCount} grades`);
    
    res.json({
      message: `Successfully fixed ${fixedCount} grades`,
      fixed_count: fixedCount,
      total_found: gradesToFix.length,
      results: results.slice(0, 10) // Show first 10 results
    });
    
  } catch (error) {
    console.error('Error fixing GPA calculation:', error);
    res.status(500).json({ error: error.message });
  }
};