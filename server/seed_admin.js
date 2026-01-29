const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const run = async () => {
    try {
        await pool.query("INSERT INTO users (email, username, role, full_name) VALUES ('skillsanh@gmail.com', 'ADMIN_SKILLS', 'ADMIN', 'Skills Anh') ON CONFLICT (email) DO UPDATE SET role = 'ADMIN'");
        console.log('✅ User skillsanh@gmail.com added/updated as ADMIN successfully');
    } catch (e) {
        console.error('Error:', e);
    } finally {
        pool.end();
    }
};

run();
