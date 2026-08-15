import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const coursesFilePath = path.resolve(__dirname, '../../../frontend/src/data/courses.js');
const coursesContent = fs.readFileSync(coursesFilePath, 'utf-8');

const coursesArrayMatch = coursesContent.match(/export const coursesData = (\[[\s\S]*?\]);/);
let rawCourses = [];
if (coursesArrayMatch && coursesArrayMatch[1]) {
  rawCourses = eval(coursesArrayMatch[1]);
}

const totalRaw = rawCourses.length;

const missingCodeOrTitle = [];
const codeMap = new Map();
const duplicateCodes = new Map();

for (let i = 0; i < rawCourses.length; i++) {
  const item = rawCourses[i];
  if (!item.code || !item.code.trim() || !item.title || !item.title.trim()) {
    missingCodeOrTitle.push({ index: i, item });
    continue;
  }

  const cleanCode = item.code.trim().toUpperCase();
  if (codeMap.has(cleanCode)) {
    if (!duplicateCodes.has(cleanCode)) {
      duplicateCodes.set(cleanCode, [codeMap.get(cleanCode)]);
    }
    duplicateCodes.get(cleanCode).push(item);
  } else {
    codeMap.set(cleanCode, item);
  }
}

const validUniqueCount = codeMap.size;
const totalDuplicatesCount = rawCourses.length - missingCodeOrTitle.length - validUniqueCount;

console.log("=" .repeat(65));
console.log("📊 COURSES DATASET DIFFERENCE ANALYSIS REPORT");
console.log("=" .repeat(65));
console.log(`1. Total Original Records in courses.js:   ${totalRaw}`);
console.log(`2. Unique Valid Courses Inserted to DB:     ${validUniqueCount}`);
console.log(`3. Total Skipped Entries (Duplicates):      ${totalDuplicatesCount}`);
console.log(`4. Total Missing Code/Title Entries:        ${missingCodeOrTitle.length}`);
console.log(`5. Number of Duplicate Course Code Keys:    ${duplicateCodes.size}`);
console.log("=" .repeat(65));

console.log(`\n5. Duplicate Course Codes List (${duplicateCodes.size} unique code keys affected):`);
for (const [code, items] of duplicateCodes.entries()) {
  console.log(`   - Course Code "${code}" appears ${items.length} times:`);
  items.forEach((it, idx) => console.log(`       [${idx + 1}] Title: "${it.title}" | Dept: "${it.department || 'N/A'}"`));
}

console.log("=" .repeat(65));
