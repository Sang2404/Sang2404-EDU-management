const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
require('dotenv').config();
const pool = require('./config/db'); // Import pool

// Import Routes
const authRoutes = require('./routes/auth');
const academicRoutes = require('./routes/academic');
const schedulesRoutes = require('./routes/schedules');
const fastSchedulesRoutes = require('./routes/fastSchedules');
const lecturersRoutes = require('./routes/lecturers');
const gradesRoutes = require('./routes/grades');
const adminRoutes = require('./routes/admin');
const requestsRoutes = require('./routes/requests');
const statisticsRoutes = require('./routes/statistics');
const attendanceRoutes = require('./routes/attendance');
const notificationRoutes = require('./routes/notifications');
const aiChatRoutes = require('./routes/aiChat');

// Import Socket.io handler
const setupSocketHandlers = require('./services/socketHandler');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Make io accessible to routes
app.set('io', io);

const port = process.env.PORT || 5000;

// Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use(cors({
  origin: '*', // Allow all origins for dev
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Serve static files (for chatbot demo)
app.use(express.static('public'));

// Security Headers Middleware
app.use((req, res, next) => {
  // Allow cross-origin opener policy for OAuth popups
  res.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.set('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

// Cache Control Middleware
app.use((req, res, next) => {
  // Set cache headers based on file type
  if (req.path.match(/\.(js|css)$/)) {
    // Versioned assets (with content hash) - cache for 1 year
    res.set('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (req.path.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/)) {
    // Images - cache for 30 days
    res.set('Cache-Control', 'public, max-age=2592000');
  } else if (req.path.endsWith('.html')) {
    // HTML files - cache for 1 hour with revalidation
    res.set('Cache-Control', 'public, max-age=3600, must-revalidate');
  } else if (req.path.startsWith('/api/')) {
    // API responses - Không dùng cache tĩnh để đảm bảo tính real-time hoạt động đúng
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  } else {
    // Default - no cache
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/fast-schedules', fastSchedulesRoutes);
app.use('/api/lecturers', lecturersRoutes);
app.use('/api/grades', gradesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/academic-requests', requestsRoutes);
app.use('/api/admin/statistics', statisticsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai-chat', aiChatRoutes);

// Setup Socket.io handlers
setupSocketHandlers(io);

// Route cơ bản
app.get('/', (req, res) => {
  res.send('API Quản lý Sinh viên đang chạy...');
});

// Route test kết nối Database
app.get('/api/test-db', async (req, res) => {
  try {
    // Thử truy vấn cơ sở dữ liệu
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'success',
      message: 'Kết nối Database thành công',
      server_time: result.rows[0].now,
      db_config: {
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
        // Không hiển thị mật khẩu vì lý do bảo mật
      }
    });
  } catch (err) {
    console.error('Lỗi Kết nối Database tại /api/test-db:', err);
    res.status(500).json({
      status: 'error',
      message: 'Kết nối Database thất bại',
      error_detail: err.message,
      code: err.code
    });
  }
});

server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🔌 Socket.io server ready for real-time notifications`);
});
