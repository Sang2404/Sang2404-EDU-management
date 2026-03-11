const pool = require('../config/db');
const emailService = require('./emailService');

// Store active socket connections by user_id
const userSockets = new Map();

class NotificationService {
  // Register user socket connection
  static registerUserSocket(userId, socketId) {
    if (!userSockets.has(userId)) {
      userSockets.set(userId, []);
    }
    userSockets.get(userId).push(socketId);
  }

  // Unregister user socket connection
  static unregisterUserSocket(userId, socketId) {
    if (userSockets.has(userId)) {
      const sockets = userSockets.get(userId);
      const index = sockets.indexOf(socketId);
      if (index > -1) {
        sockets.splice(index, 1);
      }
      if (sockets.length === 0) {
        userSockets.delete(userId);
      }
    }
  }

  // Get user socket IDs
  static getUserSockets(userId) {
    return userSockets.get(userId) || [];
  }

  // Save notification to database
  static async saveNotification(userId, title, message, type = 'info') {
    try {
      const result = await pool.query(
        `INSERT INTO notifications (user_id, title, message, is_read, created_at)
         VALUES ($1, $2, $3, false, CURRENT_TIMESTAMP)
         RETURNING *`,
        [userId, title, message]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error saving notification:', error);
      throw error;
    }
  }

  // Send notification to user
  static async sendNotification(io, userId, title, message, type = 'info') {
    try {
      // Save to database
      const notification = await this.saveNotification(userId, title, message, type);

      // Send via Socket.io if user is online
      const socketIds = this.getUserSockets(userId);
      if (socketIds.length > 0) {
        socketIds.forEach(socketId => {
          io.to(socketId).emit('notification', {
            notification_id: notification.notification_id,
            title,
            message,
            type,
            created_at: notification.created_at
          });
        });
      }

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Send notification to multiple users
  static async sendBulkNotification(io, userIds, title, message, type = 'info') {
    try {
      const notifications = [];
      for (const userId of userIds) {
        const notification = await this.sendNotification(io, userId, title, message, type);
        notifications.push(notification);
      }
      return notifications;
    } catch (error) {
      console.error('Error sending bulk notifications:', error);
      throw error;
    }
  }

  // Send grade approval notification
  static async notifyGradeApproved(io, sectionId) {
    try {
      // Get section details
      const sectionResult = await pool.query(
        `SELECT cs.section_id, cs.section_code, s.subject_name, u.user_id as lecturer_user_id
         FROM course_sections cs
         JOIN subjects s ON cs.subject_id = s.subject_id
         JOIN lecturers l ON cs.lecturer_id = l.lecturer_id
         JOIN users u ON l.user_id = u.user_id
         WHERE cs.section_id = $1`,
        [sectionId]
      );

      if (sectionResult.rows.length === 0) return;

      const section = sectionResult.rows[0];

      // Get all students in the section with their grades
      const studentsResult = await pool.query(
        `SELECT DISTINCT u.user_id, u.full_name, u.email, st.student_id
         FROM section_students ss
         JOIN students st ON ss.student_id = st.student_id
         JOIN users u ON st.user_id = u.user_id
         WHERE ss.section_id = $1`,
        [sectionId]
      );

      const title = 'Bảng điểm đã được phê duyệt';
      const message = `Bảng điểm môn ${section.subject_name} (${section.section_code}) đã được phê duyệt. Vui lòng kiểm tra điểm của bạn.`;

      // Send to all students
      for (const student of studentsResult.rows) {
        // Send in-app notification
        await this.sendNotification(io, student.user_id, title, message, 'success');

        // Get student grades for email
        const gradesResult = await pool.query(
          `SELECT s.subject_name, g.total_score
           FROM grades g
           JOIN course_sections cs ON g.section_id = cs.section_id
           JOIN subjects s ON cs.subject_id = s.subject_id
           WHERE g.student_id = $1 AND g.section_id = $2`,
          [student.student_id, sectionId]
        );

        // Send email notification
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
          await emailService.sendGradeApprovedEmail(student.user_id, gradesResult.rows);
        }
      }

      // Notify lecturer
      const lecturerTitle = 'Bảng điểm đã được phê duyệt';
      const lecturerMessage = `Bảng điểm ${section.section_code} đã được Admin phê duyệt và công bố cho sinh viên.`;
      await this.sendNotification(io, section.lecturer_user_id, lecturerTitle, lecturerMessage, 'success');
    } catch (error) {
      console.error('Error notifying grade approval:', error);
    }
  }

  // Send academic request notification
  static async notifyRequestProcessed(io, requestId, status, adminResponse) {
    try {
      // Get request details
      const requestResult = await pool.query(
        `SELECT ar.request_id, ar.student_id, ar.request_type, ar.status,
                u.user_id, u.full_name
         FROM academic_requests ar
         JOIN students st ON ar.student_id = st.student_id
         JOIN users u ON st.user_id = u.user_id
         WHERE ar.request_id = $1`,
        [requestId]
      );

      if (requestResult.rows.length === 0) return;

      const request = requestResult.rows[0];
      const requestTypeMap = {
        'REVIEW': 'Phúc khảo',
        'RESERVE': 'Bảo lưu',
        'RETAKE': 'Học lại'
      };

      const statusMap = {
        'APPROVED': 'được phê duyệt',
        'REJECTED': 'bị từ chối'
      };

      const title = `Yêu cầu ${requestTypeMap[request.request_type]} ${statusMap[status]}`;
      const message = `Yêu cầu ${requestTypeMap[request.request_type]} của bạn ${statusMap[status]}. ${adminResponse ? `Phản hồi: ${adminResponse}` : ''}`;
      const notificationType = status === 'APPROVED' ? 'success' : 'error';

      // Send in-app notification
      await this.sendNotification(io, request.user_id, title, message, notificationType);

      // Send email notification
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        await emailService.sendRequestProcessedEmail(
          request.user_id,
          request.request_type,
          status,
          adminResponse
        );
      }
    } catch (error) {
      console.error('Error notifying request processed:', error);
    }
  }

  // Send upcoming schedule notification
  static async notifyUpcomingSchedule(io, lecturerId, scheduleId) {
    try {
      // Get schedule details
      const scheduleResult = await pool.query(
        `SELECT s.schedule_id, s.day_of_week, s.start_period, s.end_period, s.room,
                cs.section_code, subj.subject_name, l.user_id as lecturer_user_id,
                COUNT(ss.student_id) as student_count
         FROM schedules s
         JOIN course_sections cs ON s.section_id = cs.section_id
         JOIN subjects subj ON cs.subject_id = subj.subject_id
         JOIN lecturers l ON cs.lecturer_id = l.lecturer_id
         LEFT JOIN section_students ss ON cs.section_id = ss.section_id
         WHERE s.schedule_id = $1 AND l.lecturer_id = $2
         GROUP BY s.schedule_id, cs.section_code, subj.subject_name, l.user_id`,
        [scheduleId, lecturerId]
      );

      if (scheduleResult.rows.length === 0) return;

      const schedule = scheduleResult.rows[0];
      const dayNames = ['', '', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

      const title = 'Lịch dạy sắp tới';
      const message = `Bạn có lớp ${schedule.section_code} (${schedule.subject_name}) vào ${dayNames[schedule.day_of_week]} tiết ${schedule.start_period}-${schedule.end_period} tại phòng ${schedule.room}`;

      // Send in-app notification
      await this.sendNotification(io, schedule.lecturer_user_id, title, message, 'info');

      // Send email notification
      if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
        await emailService.sendUpcomingClassEmail(lecturerId, {
          subject_name: schedule.subject_name,
          section_code: schedule.section_code,
          room: schedule.room,
          day_name: dayNames[schedule.day_of_week],
          periods: `${schedule.start_period}-${schedule.end_period}`,
          student_count: schedule.student_count
        });
      }
    } catch (error) {
      console.error('Error notifying upcoming schedule:', error);
    }
  }

  // Send upcoming class notification to students
  static async notifyUpcomingClass(io, sectionId, scheduleId) {
    try {
      // Get schedule details
      const scheduleResult = await pool.query(
        `SELECT s.schedule_id, s.day_of_week, s.start_period, s.end_period, s.room,
                cs.section_code, subj.subject_name, l.full_name as lecturer_name
         FROM schedules s
         JOIN course_sections cs ON s.section_id = cs.section_id
         JOIN subjects subj ON cs.subject_id = subj.subject_id
         JOIN lecturers l ON cs.lecturer_id = l.lecturer_id
         WHERE s.schedule_id = $1 AND cs.section_id = $2`,
        [scheduleId, sectionId]
      );

      if (scheduleResult.rows.length === 0) return;

      const schedule = scheduleResult.rows[0];
      const dayNames = ['', '', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];

      // Get all students in the section
      const studentsResult = await pool.query(
        `SELECT DISTINCT u.user_id, u.email
         FROM section_students ss
         JOIN students st ON ss.student_id = st.student_id
         JOIN users u ON st.user_id = u.user_id
         WHERE ss.section_id = $1`,
        [sectionId]
      );

      const title = 'Lịch học sắp tới';
      const message = `Bạn có lớp ${schedule.section_code} (${schedule.subject_name}) vào ${dayNames[schedule.day_of_week]} tiết ${schedule.start_period}-${schedule.end_period} tại phòng ${schedule.room}`;

      // Send to all students
      for (const student of studentsResult.rows) {
        // Send in-app notification
        await this.sendNotification(io, student.user_id, title, message, 'info');

        // Send email notification
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
          await emailService.sendUpcomingScheduleEmail(student.user_id, {
            subject_name: schedule.subject_name,
            section_code: schedule.section_code,
            room: schedule.room,
            day_name: dayNames[schedule.day_of_week],
            periods: `${schedule.start_period}-${schedule.end_period}`,
            lecturer_name: schedule.lecturer_name
          });
        }
      }
    } catch (error) {
      console.error('Error notifying upcoming class:', error);
    }
  }

  // Get user notifications
  static async getUserNotifications(userId, limit = 20) {
    try {
      const result = await pool.query(
        `SELECT * FROM notifications
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId) {
    try {
      const result = await pool.query(
        `UPDATE notifications
         SET is_read = true
         WHERE notification_id = $1
         RETURNING *`,
        [notificationId]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  static async markAllNotificationsAsRead(userId) {
    try {
      const result = await pool.query(
        `UPDATE notifications
         SET is_read = true
         WHERE user_id = $1 AND is_read = false
         RETURNING *`,
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  // Get unread notification count
  static async getUnreadCount(userId) {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) as count FROM notifications
         WHERE user_id = $1 AND is_read = false`,
        [userId]
      );
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
