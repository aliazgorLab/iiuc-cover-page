import mongoose from 'mongoose';

const recordExperimentSchema = new mongoose.Schema({
  number: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  date: { type: String, default: '' },
  pageNo: { type: String, default: '' },
  remarks: { type: String, default: '' },
});

const labIndexRecordSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseCode: { type: String, required: true, uppercase: true, trim: true },
    courseTitle: { type: String, required: true, trim: true },
    studentName: { type: String, default: '' },
    studentId: { type: String, default: '' },
    section: { type: String, default: '' },
    experiments: [recordExperimentSchema],
    totalExperiments: { type: Number, default: 0 },
    completedExperiments: { type: Number, default: 0 },
    source: {
      type: String,
      enum: ['OFFICIAL_TEMPLATE', 'PREVIOUS_IMPORT', 'SAVED_RECORD', 'MANUAL'],
      default: 'MANUAL',
    },
  },
  { timestamps: true }
);

labIndexRecordSchema.index({ userId: 1, courseCode: 1 }, { unique: true });

labIndexRecordSchema.pre('save', function (next) {
  if (this.experiments) {
    this.totalExperiments = this.experiments.length;
    this.completedExperiments = this.experiments.filter(
      (e) => (e.date && e.date.trim().length > 0)
    ).length;
  }
  next();
});

export default mongoose.model('LabIndexRecord', labIndexRecordSchema, 'labindexrecords');
