// Fix schedules functions to remove 'week' column references
const fs = require('fs');
const path = require('path');

const controllerPath = path.join(__dirname, 'controllers', 'academicController.js');
let content = fs.readFileSync(controllerPath, 'utf8');

// Remove week from createSchedule function
content = content.replace(
  /const { section_id, day_of_week, start_period, end_period, room, week, override_conflicts } = req\.body;/,
  'const { section_id, day_of_week, start_period, end_period, room, override_conflicts } = req.body;'
);

// Remove week validation
content = content.replace(
  /if \(!week\) \{\s*return res\.status\(400\)\.json\({ error: 'week is required' }\);\s*\}/,
  ''
);

// Remove week from updateSchedule function
content = content.replace(
  /const { section_id, day_of_week, start_period, end_period, room, week, override_conflicts } = req\.body;/,
  'const { section_id, day_of_week, start_period, end_period, room, override_conflicts } = req.body;'
);

// Remove week validation in update
content = content.replace(
  /if \(typeof week !== 'number' \|\| week < 1 \|\| week > 16\) \{\s*return res\.status\(400\)\.json\({ error: 'week must be between 1 and 16' }\);\s*\}/,
  ''
);

// Remove week from all SQL queries
content = content.replace(/AND s\.week = \$\d+/g, '');
content = content.replace(/s\.week,/g, '');
content = content.replace(/, s\.week/g, '');
content = content.replace(/week = \$\d+,?/g, '');
content = content.replace(/week,?/g, '');

// Fix parameter indices in queries
content = content.replace(/\$(\d+)/g, (match, num) => {
  const n = parseInt(num);
  if (n > 3) return `$${n-1}`;
  return match;
});

fs.writeFileSync(controllerPath, content);
console.log('Fixed schedules functions');