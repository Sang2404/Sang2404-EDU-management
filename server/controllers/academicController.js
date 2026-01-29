const pool = require('../config/db');

// --- FACULTIES ---
exports.getAllFaculties = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM faculties ORDER BY faculty_name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createFaculty = async (req, res) => {
  try {
    const { faculty_id, faculty_name, description } = req.body;
    await pool.query(
      'INSERT INTO faculties (faculty_id, faculty_name, description) VALUES ($1, $2, $3)',
      [faculty_id, faculty_name, description]
    );
    res.status(201).json({ message: 'Tạo Khoa thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    const { faculty_name, description } = req.body;
    await pool.query(
      'UPDATE faculties SET faculty_name = $1, description = $2 WHERE faculty_id = $3',
      [faculty_name, description, id]
    );
    res.json({ message: 'Cập nhật Khoa thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteFaculty = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM faculties WHERE faculty_id = $1', [id]);
    res.json({ message: 'Xóa Khoa thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- MAJORS ---
exports.getMajorsByFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const result = await pool.query('SELECT * FROM majors WHERE faculty_id = $1', [facultyId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createMajor = async (req, res) => {
  try {
    const { major_id, faculty_id, major_name, total_credits } = req.body;
    await pool.query(
      'INSERT INTO majors (major_id, faculty_id, major_name, total_credits) VALUES ($1, $2, $3, $4)',
      [major_id, faculty_id, major_name, total_credits]
    );
    res.status(201).json({ message: 'Tạo Ngành thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMajor = async (req, res) => {
  try {
    const { id } = req.params;
    const { major_name, total_credits } = req.body;
    await pool.query(
      'UPDATE majors SET major_name = $1, total_credits = $2 WHERE major_id = $3',
      [major_name, total_credits, id]
    );
    res.json({ message: 'Cập nhật Ngành thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMajor = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM majors WHERE major_id = $1', [id]);
    res.json({ message: 'Xóa Ngành thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- SUBJECTS ---
exports.getAllSubjects = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM subjects ORDER BY subject_name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createSubject = async (req, res) => {
  try {
    const { subject_id, subject_name, credits, description } = req.body;
    await pool.query(
      'INSERT INTO subjects (subject_id, subject_name, credits, description) VALUES ($1, $2, $3, $4)',
      [subject_id, subject_name, credits, description]
    );
    res.status(201).json({ message: 'Tạo Môn học thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_name, credits, description } = req.body;
    await pool.query(
      'UPDATE subjects SET subject_name = $1, credits = $2, description = $3 WHERE subject_id = $4',
      [subject_name, credits, description, id]
    );
    res.json({ message: 'Cập nhật Môn học thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM subjects WHERE subject_id = $1', [id]);
    res.json({ message: 'Xóa Môn học thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

