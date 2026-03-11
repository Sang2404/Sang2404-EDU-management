const pool = require('../config/db');

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

exports.getLecturerSections = async (req, res) => {
  try {
    const { lecturerId } = req.params;
    const { semester, academic_year } = req.query;
    
    // Query sections
    const sectionsQuery = `
      SELECT 
        cs.section_id,
        cs.section_code,
        cs.subject_id,
        s.subject_name,
        s.credits,
        cs.semester,
        cs.academic_year,
        cs.max_capacity,
        cs.room_default,
        cs.is_locked,
        COUNT(DISTINCT ss.student_id) as enrolled_count
      FROM course_sections cs
      JOIN subjects s ON cs.subject_id = s.subject_id
      LEFT JOIN section_students ss ON cs.section_id = ss.section_id
      WHERE cs.lecturer_id = $1
        AND ($2::text IS NULL OR cs.semester = $2)
        AND ($3::text IS NULL OR cs.academic_year = $3)
      GROUP BY cs.section_id, s.subject_name, s.credits
      ORDER BY cs.academic_year DESC, cs.semester, s.subject_name
    `;
    
    const sectionsResult = await pool.query(sectionsQuery, [
      lecturerId,
      semester || null,
      academic_year || null
    ]);
    
    // For each section, fetch schedules
    const sections = await Promise.all(
      sectionsResult.rows.map(async (section) => {
        const schedulesQuery = `
          SELECT schedule_id, day_of_week, start_period, end_period, room, week
          FROM schedules
          WHERE section_id = $1
          ORDER BY week, day_of_week, start_period
        `;
        
        const schedulesResult = await pool.query(schedulesQuery, [section.section_id]);
        
        const schedules = schedulesResult.rows.map(schedule => ({
          ...schedule,
          day_name: getDayName(schedule.day_of_week)
        }));
        
        return {
          ...section,
          enrolled_count: parseInt(section.enrolled_count),
          schedules
        };
      })
    );
    
    res.json(sections);
  } catch (error) {
    console.error('Error getting lecturer sections:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getLecturerSectionDetails = async (req, res) => {
  try {
    const { lecturerId, sectionId } = req.params;
    
    // Query section details and verify lecturer assignment
    const sectionQuery = `
      SELECT 
        cs.section_id,
        cs.section_code,
        cs.subject_id,
        s.subject_name,
        s.credits,
        cs.lecturer_id,
        cs.semester,
        cs.academic_year,
        cs.max_capacity,
        cs.room_default,
        cs.is_locked,
        COUNT(DISTINCT ss.student_id) as enrolled_count
      FROM course_sections cs
      JOIN subjects s ON cs.subject_id = s.subject_id
      LEFT JOIN section_students ss ON cs.section_id = ss.section_id
      WHERE cs.section_id = $1
      GROUP BY cs.section_id, s.subject_name, s.credits
    `;
    
    const sectionResult = await pool.query(sectionQuery, [sectionId]);
    
    if (sectionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Course section not found' });
    }
    
    const section = sectionResult.rows[0];
    
    // Verify lecturer is assigned to this section
    if (section.lecturer_id !== lecturerId) {
      return res.status(403).json({ error: 'You are not assigned to this course section' });
    }
    
    // Fetch enrolled students
    const studentsQuery = `
      SELECT 
        st.student_id,
        u.full_name,
        u.email,
        c.class_name
      FROM section_students ss
      JOIN students st ON ss.student_id = st.student_id
      JOIN users u ON st.user_id = u.user_id
      LEFT JOIN classes c ON st.class_id = c.class_id
      WHERE ss.section_id = $1
      ORDER BY st.student_id
    `;
    
    const studentsResult = await pool.query(studentsQuery, [sectionId]);
    
    // Fetch schedules
    const schedulesQuery = `
      SELECT schedule_id, day_of_week, start_period, end_period, room, week
      FROM schedules
      WHERE section_id = $1
      ORDER BY week, day_of_week, start_period
    `;
    
    const schedulesResult = await pool.query(schedulesQuery, [sectionId]);
    
    const schedules = schedulesResult.rows.map(schedule => ({
      ...schedule,
      day_name: getDayName(schedule.day_of_week)
    }));
    
    // Remove lecturer_id from response
    delete section.lecturer_id;
    
    res.json({
      ...section,
      enrolled_count: parseInt(section.enrolled_count),
      students: studentsResult.rows,
      schedules
    });
  } catch (error) {
    console.error('Error getting lecturer section details:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getLecturerStatistics = async (req, res) => {
  try {
    const { lecturerId } = req.params;
    const { semester, academic_year } = req.query;
    
    // Get lecturer name
    const lecturerQuery = `
      SELECT u.full_name
      FROM lecturers l
      JOIN users u ON l.user_id = u.user_id
      WHERE l.lecturer_id = $1
    `;
    
    const lecturerResult = await pool.query(lecturerQuery, [lecturerId]);
    
    if (lecturerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lecturer not found' });
    }
    
    const lecturerName = lecturerResult.rows[0].full_name;
    
    // Query statistics
    const statsQuery = `
      SELECT 
        COUNT(DISTINCT cs.section_id) as total_sections,
        COUNT(DISTINCT ss.student_id) as total_students
      FROM course_sections cs
      LEFT JOIN section_students ss ON cs.section_id = ss.section_id
      WHERE cs.lecturer_id = $1
        AND ($2::text IS NULL OR cs.semester = $2)
        AND ($3::text IS NULL OR cs.academic_year = $3)
    `;
    
    const statsResult = await pool.query(statsQuery, [
      lecturerId,
      semester || null,
      academic_year || null
    ]);
    
    const stats = statsResult.rows[0];
    const totalSections = parseInt(stats.total_sections);
    const totalStudents = parseInt(stats.total_students);
    const averageClassSize = totalSections > 0 ? Math.round(totalStudents / totalSections) : 0;
    
    // Query grade statistics
    const gradeStatsQuery = `
      SELECT 
        ROUND(AVG(g.total_10), 2) as average_grade,
        COUNT(g.grade_id) as total_grades,
        COUNT(*) FILTER (WHERE g.total_10 >= 4.0) as passed,
        COUNT(*) FILTER (WHERE g.total_10 < 4.0) as failed
      FROM grades g
      JOIN course_sections cs ON g.section_id = cs.section_id
      WHERE cs.lecturer_id = $1
        AND g.status = 'APPROVED'
        AND ($2::text IS NULL OR cs.semester = $2)
        AND ($3::text IS NULL OR cs.academic_year = $3)
    `;
    
    const gradeStatsResult = await pool.query(gradeStatsQuery, [
      lecturerId,
      semester || null,
      academic_year || null
    ]);
    
    const gradeStats = gradeStatsResult.rows[0];
    const totalGrades = parseInt(gradeStats.total_grades) || 0;
    const passedCount = parseInt(gradeStats.passed) || 0;
    const failedCount = parseInt(gradeStats.failed) || 0;
    const passRate = totalGrades > 0 ? Math.round((passedCount / totalGrades) * 1000) / 10 : 0;
    const failRate = totalGrades > 0 ? Math.round((failedCount / totalGrades) * 1000) / 10 : 0;
    
    // Query sections by subject
    const subjectStatsQuery = `
      SELECT 
        s.subject_name,
        COUNT(DISTINCT cs.section_id) as section_count,
        COUNT(DISTINCT ss.student_id) as student_count,
        ROUND(AVG(g.total_10), 2) as average_grade,
        COUNT(*) FILTER (WHERE g.total_10 >= 4.0) as passed,
        COUNT(*) FILTER (WHERE g.total_10 < 4.0) as failed
      FROM course_sections cs
      JOIN subjects s ON cs.subject_id = s.subject_id
      LEFT JOIN section_students ss ON cs.section_id = ss.section_id
      LEFT JOIN grades g ON cs.section_id = g.section_id AND g.status = 'APPROVED'
      WHERE cs.lecturer_id = $1
        AND ($2::text IS NULL OR cs.semester = $2)
        AND ($3::text IS NULL OR cs.academic_year = $3)
      GROUP BY s.subject_name
      ORDER BY section_count DESC, s.subject_name
    `;
    
    const subjectStatsResult = await pool.query(subjectStatsQuery, [
      lecturerId,
      semester || null,
      academic_year || null
    ]);
    
    const sectionsBySubject = subjectStatsResult.rows.map(row => {
      const subjectTotal = parseInt(row.passed || 0) + parseInt(row.failed || 0);
      const subjectPassRate = subjectTotal > 0 ? Math.round((parseInt(row.passed || 0) / subjectTotal) * 1000) / 10 : 0;
      
      return {
        subject_name: row.subject_name,
        section_count: parseInt(row.section_count),
        student_count: parseInt(row.student_count),
        average_grade: parseFloat(row.average_grade) || 0,
        passed: parseInt(row.passed) || 0,
        failed: parseInt(row.failed) || 0,
        pass_rate: subjectPassRate
      };
    });
    
    res.json({
      lecturer_id: lecturerId,
      full_name: lecturerName,
      semester: semester || 'All',
      academic_year: academic_year || 'All',
      statistics: {
        total_sections: totalSections,
        total_students: totalStudents,
        average_class_size: averageClassSize,
        grade_statistics: {
          total_grades: totalGrades,
          average_grade: parseFloat(gradeStats.average_grade) || 0,
          passed: passedCount,
          failed: failedCount,
          pass_rate: passRate,
          fail_rate: failRate
        },
        sections_by_subject: sectionsBySubject
      }
    });
  } catch (error) {
    console.error('Error getting lecturer statistics:', error);
    res.status(500).json({ error: error.message });
  }
};


exports.getSectionGrades = async (req, res) => {
  try {
    const { lecturerId, sectionId } = req.params;
    
    // Verify lecturer is assigned to section
    const sectionCheck = await pool.query(
      'SELECT lecturer_id FROM course_sections WHERE section_id = $1',
      [sectionId]
    );
    
    if (sectionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course section not found' });
    }
    
    if (sectionCheck.rows[0].lecturer_id !== lecturerId) {
      return res.status(403).json({ error: 'You are not assigned to this course section' });
    }
    
    // Query grades with student info
    const query = `
      SELECT 
        g.grade_id,
        g.student_id,
        u.full_name,
        g.attendance,
        g.midterm,
        g.final,
        g.total_10,
        g.total_4,
        g.grade_char,
        g.status
      FROM grades g
      JOIN students st ON g.student_id = st.student_id
      JOIN users u ON st.user_id = u.user_id
      WHERE g.section_id = $1
      ORDER BY g.student_id
    `;
    
    const result = await pool.query(query, [sectionId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting section grades:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.submitGrades = async (req, res) => {
  try {
    const { lecturerId, sectionId } = req.params;
    
    // Verify lecturer is assigned to section
    const sectionCheck = await pool.query(
      'SELECT lecturer_id FROM course_sections WHERE section_id = $1',
      [sectionId]
    );
    
    if (sectionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Course section not found' });
    }
    
    if (sectionCheck.rows[0].lecturer_id !== lecturerId) {
      return res.status(403).json({ error: 'You are not assigned to this course section' });
    }
    
    // Check all enrolled students have grades
    const enrolledCount = await pool.query(
      'SELECT COUNT(*) as count FROM section_students WHERE section_id = $1',
      [sectionId]
    );
    const totalStudents = parseInt(enrolledCount.rows[0].count);
    
    const gradesCount = await pool.query(
      'SELECT COUNT(*) as count FROM grades WHERE section_id = $1',
      [sectionId]
    );
    const totalGrades = parseInt(gradesCount.rows[0].count);
    
    if (totalGrades < totalStudents) {
      return res.status(400).json({ 
        error: `All students must have grades entered. ${totalGrades}/${totalStudents} students have grades.` 
      });
    }
    
    // Check all grades have complete components
    const incompleteGrades = await pool.query(
      `SELECT COUNT(*) as count FROM grades 
       WHERE section_id = $1 
       AND (attendance IS NULL OR midterm IS NULL OR final IS NULL)`,
      [sectionId]
    );
    const incompleteCount = parseInt(incompleteGrades.rows[0].count);
    
    if (incompleteCount > 0) {
      return res.status(400).json({ 
        error: `All grades must have complete components (attendance, midterm, final). ${incompleteCount} incomplete grades found.` 
      });
    }
    
    // Update all grades status to SUBMITTED
    const updateResult = await pool.query(
      `UPDATE grades 
       SET status = 'SUBMITTED' 
       WHERE section_id = $1 AND status = 'DRAFT'
       RETURNING grade_id`,
      [sectionId]
    );
    
    res.json({
      message: 'Gửi bảng điểm để duyệt thành công',
      data: {
        section_id: parseInt(sectionId),
        total_students: totalStudents,
        grades_submitted: updateResult.rows.length,
        status: 'SUBMITTED'
      }
    });
  } catch (error) {
    console.error('Error submitting grades:', error);
    res.status(500).json({ error: error.message });
  }
};
