const fs = require('fs');

const filePath = './controllers/statisticsController.js';
let content = fs.readFileSync(filePath, 'utf8');

// Replace c.faculty_id with m.faculty_id
content = content.replace(/c\.faculty_id = \$/g, 'm.faculty_id = $');

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Fixed statisticsController.js');
