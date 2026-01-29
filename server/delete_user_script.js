const pool = require('./config/db');

const deleteUser = async () => {
  try {
    const email = 'admin.demo@gmail.com';
    const result = await pool.query('DELETE FROM users WHERE email = $1 RETURNING *', [email]);
    
    if (result.rowCount > 0) {
      console.log(`✅ User ${email} deleted successfully.`);
      console.log('Deleted user details:', result.rows[0]);
    } else {
      console.log(`⚠️ User ${email} not found.`);
    }
  } catch (error) {
    console.error('❌ Error deleting user:', error);
  } finally {
    pool.end();
  }
};

deleteUser();
