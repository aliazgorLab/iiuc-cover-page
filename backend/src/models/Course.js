import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    courseCode: { type: String, uppercase: true, trim: true },
    courseTitle: { type: String, trim: true },
    credit: { type: Number, default: 3, min: 1, max: 6 },
    department: { type: String, trim: true, default: 'Dept. of CSE' },
    departments: [{ type: String, trim: true }],
    departmentCount: { type: Number, default: 1 },
    semester: { type: String, trim: true, default: '' },
    assignedTeacher: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

courseSchema.pre('save', function (next) {
  if (this.code && !this.courseCode) this.courseCode = this.code;
  if (this.courseCode && !this.code) this.code = this.courseCode;
  if (this.title && !this.courseTitle) this.courseTitle = this.title;
  if (this.courseTitle && !this.title) this.title = this.courseTitle;
  next();
});

courseSchema.index({ courseCode: 1 });
courseSchema.index({ department: 1 });

export default mongoose.model('Course', courseSchema, 'courses');
