import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    faculty: { type: String, default: 'Faculty of Science & Engineering', trim: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    branding: {
      primaryColor: { type: String, default: '#006A4E' },
      secondaryColor: { type: String, default: '#F3CF45' },
    },
    logo: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model('Department', departmentSchema);
