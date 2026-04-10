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

exports.getStudentSchedule = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { semester, academic_year, week } = req.query;
    
    const query = `
      SELECT 
        s.schedule_id,
        cs.section_id,
        cs.subject_id,
        sub.subject_name,
        u.full_name as lecturer_name,
        s.day_of_week,
        s.start_period,
        s.end_period,
        s.room,
        s.week,
        cs.semester,
        cs.academic_year,
        cs.section_code
      FROM schedules s
      JOIN course_sections cs ON s.section_id = cs.section_id
      JOIN section_students ss ON cs.section_id = ss.section_id
      JOIN subjects sub ON cs.subject_id = sub.subject_id
      JOIN lecturers l ON cs.lecturer_id = l.lecturer_id
      JOIN users u ON l.user_id = u.user_id
      WHERE ss.student_id = $1
        AND ($2::text IS NULL OR cs.semester = $2)
        AND ($3::text IS NULL OR cs.academic_year = $3)
        AND ($4::integer IS NULL OR s.week = $4)
      ORDER BY s.day_of_week, s.start_period
    `;
    
    const weekNumber = week ? parseInt(week.replace('week', '')) : null;
    const result = await pool.query(query, [studentId, semester || null, academic_year || null, weekNumber]);
    
    // Add day names
    const schedules = result.rows.map(schedule => ({
      ...schedule,
      day_name: getDayName(schedule.day_of_week)
    }));
    
    res.json(schedules);
  } catch (error) {
    console.error('Error getting student schedule:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getLecturerSchedule = async (req, res) => {
  try {
    const { lecturerId } = req.params;
    
    const query = `
      SELECT 
        s.schedule_id,
        cs.section_id,
        cs.subject_id,
        sub.subject_name,
        s.day_of_week,
        s.start_period,
        s.end_period,
        s.room,
        cs.semester,
        cs.academic_year,
        cs.section_code,
        cs.max_capacity,
        COUNT(ss.student_id) as enrolled_count
      FROM schedules s
      JOIN course_sections cs ON s.section_id = cs.section_id
      JOIN subjects sub ON cs.subject_id = sub.subject_id
      LEFT JOIN section_students ss ON cs.section_id = ss.section_id
      WHERE cs.lecturer_id = $1
      GROUP BY s.schedule_id, cs.section_id, sub.subject_name, cs.section_code, cs.max_capacity
      ORDER BY s.day_of_week, s.start_period
    `;
    
    const result = await pool.query(query, [lecturerId]);
    
    // Add day names
    const schedules = result.rows.map(schedule => ({
      ...schedule,
      day_name: getDayName(schedule.day_of_week)
    }));
    
    res.json(schedules);
  } catch (error) {
    console.error('Error getting lecturer schedule:', error);
    res.status(500).json({ error: error.message });
  }
};
