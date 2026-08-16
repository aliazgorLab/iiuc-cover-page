import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    googleId: { type: String, default: null },
    avatar: { type: String, default: '' },
    provider: { type: String, default: 'google' },
    passwordHash: { type: String, default: '' },
    studentId: { type: String, trim: true, default: '' },
    department: { type: String, trim: true, default: '' },
    batch: { type: String, trim: true, default: '' },
    semester: { type: String, trim: true, default: '' },
    section: { type: String, trim: true, default: '' },
    academicProfile: {
      studentName: { type: String, trim: true, default: '' },
      studentId: { type: String, trim: true, default: '' },
      department: { type: String, trim: true, default: '' },
      batch: { type: String, trim: true, default: '' },
      semester: { type: String, trim: true, default: '' },
      section: { type: String, trim: true, default: '' },
    },
    academicInfo: {
      name: { type: String, trim: true, default: '' },
      studentId: { type: String, trim: true, default: '' },
      department: { type: String, trim: true, default: '' },
      section: { type: String, trim: true, default: '' },
      semester: { type: String, trim: true, default: '' },
      batch: { type: String, trim: true, default: '' },
    },
    role: {
      type: String,
      enum: ['STUDENT', 'ADMIN', 'SUPER_ADMIN', 'MODERATOR'],
      default: 'STUDENT',
    },
    // Account lifecycle status for institutional governance
    accountStatus: {
      type: String,
      enum: ['ACTIVE', 'SUSPENDED', 'BLOCKED'],
      default: 'ACTIVE',
    },
    // Future-ready permission layer (beyond role-based access)
    permissions: {
      type: [String],
      enum: ['MANAGE_USERS', 'MANAGE_TEMPLATES', 'MANAGE_COURSES', 'VIEW_ANALYTICS', 'MANAGE_TEACHERS'],
      default: [],
    },
    refreshToken: { type: String, default: null },
    emailVerified: { type: Boolean, default: true },
    verificationToken: { type: String, default: null },
  },
  { timestamps: true }
);

// Production database indexes for query performance
userSchema.index({ studentId: 1 });
userSchema.index({ department: 1 });
userSchema.index({ role: 1 });
userSchema.index({ accountStatus: 1 });
userSchema.index({ createdAt: -1 });

export default mongoose.model('User', userSchema);
