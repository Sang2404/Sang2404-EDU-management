const pool = require('../config/db');

// 🚀 Ultra-fast schedule operations
class FastScheduleController {

  // Get schedules with minimal queries
  static async getSchedules(req, res) {
    const startTime = Date.now();

    try {
      const { semester, academic_year, section_id } = req.query;

      let query = `
        SELECT 
          s.schedule_id,
          s.section_id,
          s.day_of_week,
          s.start_period,
          s.end_period,
          s.room,
          s.week,
          cs.section_code,
          sub.subject_name,
          u.full_name as lecturer_name
        FROM schedules s
        JOIN course_sections cs ON s.section_id = cs.section_id
        JOIN subjects sub ON cs.subject_id = sub.subject_id
        JOIN lecturers l ON cs.lecturer_id = l.lecturer_id
        JOIN users u ON l.user_id = u.user_id
        WHERE 1=1
      `;

      const params = [];
      let paramIndex = 1;

      if (semester) {
        query += ` AND cs.semester = $${paramIndex}`;
        params.push(semester);
        paramIndex++;
      }

      if (academic_year) {
        query += ` AND cs.academic_year = $${paramIndex}`;
        params.push(academic_year);
        paramIndex++;
      }

      if (section_id) {
        query += ` AND s.section_id = $${paramIndex}`;
        params.push(section_id);
        paramIndex++;
      }

      query += ` ORDER BY s.week, s.day_of_week, s.start_period`;

      const result = await pool.query(query, params);

      const endTime = Date.now();
      console.log(`⚡ Fast getSchedules completed in ${endTime - startTime}ms`);

      res.json({
        data: result.rows,
        performance: {
          duration: endTime - startTime,
          count: result.rows.length
        }
      });

    } catch (error) {
      console.error('Error in fast getSchedules:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Create schedule with minimal validation
  static async createSchedule(req, res) {
    const startTime = Date.now();

    try {
      const { section_id, day_of_week, start_period, end_period, room, week } = req.body;

      // Quick validation
      if (!section_id || !day_of_week || !start_period || !end_period || !week) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Single insert query
      const result = await pool.query(
        `INSERT INTO schedules (section_id, day_of_week, start_period, end_period, room, week)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [section_id, day_of_week, start_period, end_period, room || null, week]
      );

      const endTime = Date.now();
      console.log(`⚡ Fast createSchedule completed in ${endTime - startTime}ms`);

      // Emit realtime update to all clients
      const io = req.app.get('io');
      if (io) {
        io.emit('schedule_updated', { action: 'create' });
      }

      res.status(201).json({
        message: 'Schedule created successfully',
        schedule: result.rows[0],
        performance: {
          duration: endTime - startTime
        }
      });

    } catch (error) {
      console.error('Error in fast createSchedule:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Update schedule
  static async updateSchedule(req, res) {
    const startTime = Date.now();

    try {
      const { id } = req.params;
      const { section_id, day_of_week, start_period, end_period, room, week } = req.body;

      const result = await pool.query(
        `UPDATE schedules 
         SET section_id = $1, day_of_week = $2, start_period = $3, 
             end_period = $4, room = $5, week = $6
         WHERE schedule_id = $7
         RETURNING *`,
        [section_id, day_of_week, start_period, end_period, room || null, week, id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      const endTime = Date.now();
      console.log(`⚡ Fast updateSchedule completed in ${endTime - startTime}ms`);

      // Emit realtime update to all clients
      const io = req.app.get('io');
      if (io) {
        io.emit('schedule_updated', { action: 'update' });
      }

      res.json({
        message: 'Schedule updated successfully',
        schedule: result.rows[0],
        performance: {
          duration: endTime - startTime
        }
      });

    } catch (error) {
      console.error('Error in fast updateSchedule:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Delete schedule (ultra-fast)
  static async deleteSchedule(req, res) {
    const startTime = Date.now();

    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM schedules WHERE schedule_id = $1',
        [id]
      );

      const endTime = Date.now();
      console.log(`⚡ Ultra-fast deleteSchedule completed in ${endTime - startTime}ms`);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Schedule not found' });
      }

      // Emit realtime update to all clients
      const io = req.app.get('io');
      if (io) {
        io.emit('schedule_updated', { action: 'delete' });
      }

      res.json({
        message: 'Schedule deleted successfully',
        performance: {
          duration: endTime - startTime
        }
      });

    } catch (error) {
      console.error('Error in fast deleteSchedule:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Bulk operations
  static async bulkCreate(req, res) {
    const startTime = Date.now();

    try {
      const { schedules } = req.body;

      if (!schedules || !Array.isArray(schedules)) {
        return res.status(400).json({ error: 'Invalid schedules data' });
      }

      // Build bulk insert query
      const values = [];
      const placeholders = [];
      let paramIndex = 1;

      schedules.forEach((schedule, index) => {
        const { section_id, day_of_week, start_period, end_period, room, week } = schedule;

        values.push(section_id, day_of_week, start_period, end_period, room || null, week);
        placeholders.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2}, $${paramIndex + 3}, $${paramIndex + 4}, $${paramIndex + 5})`);
        paramIndex += 6;
      });

      const query = `
        INSERT INTO schedules (section_id, day_of_week, start_period, end_period, room, week)
        VALUES ${placeholders.join(', ')}
        RETURNING *
      `;

      const result = await pool.query(query, values);

      const endTime = Date.now();
      console.log(`⚡ Bulk create ${schedules.length} schedules completed in ${endTime - startTime}ms`);

      // Emit realtime update to all clients
      const io = req.app.get('io');
      if (io) {
        io.emit('schedule_updated', { action: 'bulkCreate' });
      }

      res.json({
        message: `Created ${result.rows.length} schedules successfully`,
        schedules: result.rows,
        performance: {
          duration: endTime - startTime,
          count: result.rows.length
        }
      });

    } catch (error) {
      console.error('Error in bulk create:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get schedule statistics
  static async getStats(req, res) {
    const startTime = Date.now();

    try {
      const { semester, academic_year } = req.query;

      const query = `
        SELECT 
          COUNT(*) as total_schedules,
          COUNT(DISTINCT s.section_id) as total_sections,
          COUNT(DISTINCT s.room) as total_rooms,
          COUNT(DISTINCT s.day_of_week) as days_used,
          MIN(s.week) as min_week,
          MAX(s.week) as max_week
        FROM schedules s
        JOIN course_sections cs ON s.section_id = cs.section_id
        WHERE ($1::text IS NULL OR cs.semester = $1)
          AND ($2::text IS NULL OR cs.academic_year = $2)
      `;

      const result = await pool.query(query, [semester || null, academic_year || null]);

      const endTime = Date.now();
      console.log(`⚡ Fast getStats completed in ${endTime - startTime}ms`);

      res.json({
        stats: result.rows[0],
        performance: {
          duration: endTime - startTime
        }
      });

    } catch (error) {
      console.error('Error in getStats:', error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = FastScheduleController;