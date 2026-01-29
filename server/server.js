const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./config/db'); // Import pool

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const academicRoutes = require('./routes/academic');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*', // Allow all origins for dev
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/academic', academicRoutes);

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

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
