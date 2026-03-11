const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'controllers/academicController.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find and replace the updateCourseSection function
// Replace the line that maps teacher_id to lecturer_id
const oldLine = '    const lecturer_id = teacher_id;';
const newLine = '    const lecturer_id = finalTeacherId;';

// Count occurrences
const count = (content.match(/const lecturer_id = teacher_id;/g) || []).length;
console.log(`Found ${count} occurrences of "const lecturer_id = teacher_id;"`);

// Replace only in updateCourseSection (after the line with finalTeacherId)
const updateSectionStart = content.indexOf('exports.updateCourseSection = async (req, res) => {');
const updateSectionEnd = content.indexOf('exports.deleteCourseSection = async (req, res) => {');

if (updateSectionStart !== -1 && updateSectionEnd !== -1) {
  const beforeUpdate = content.substring(0, updateSectionStart);
  const updateSection = content.substring(updateSectionStart, updateSectionEnd);
  const afterUpdate = content.substring(updateSectionEnd);
  
  // Replace in updateSection only
  const fixedUpdateSection = updateSection.replace(
    '    const lecturer_id = teacher_id;',
    '    const lecturer_id = finalTeacherId;'
  );
  
  content = beforeUpdate + fixedUpdateSection + afterUpdate;
  
  // Write back
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Fixed updateCourseSection function');
} else {
  console.error('❌ Could not find updateCourseSection function');
}
