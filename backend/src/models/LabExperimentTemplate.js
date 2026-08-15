import mongoose from 'mongoose';

const experimentItemSchema = new mongoose.Schema({
  number: { type: String, required: true, trim: true },
  title: { type: String, required: true, trim: true },
  defaultDate: { type: String, default: '' },
  pageNo: { type: String, default: '' },
  remarks: { type: String, default: '' },
});

const labExperimentTemplateSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    courseTitle: { type: String, required: true, trim: true },
    department: { type: String, trim: true, default: 'CSE' },
    experiments: [experimentItemSchema],
    totalExperiments: { type: Number, default: 0 },
  },
  { timestamps: true }
);

labExperimentTemplateSchema.index({ department: 1 });

labExperimentTemplateSchema.pre('save', function (next) {
  if (this.experiments) {
    this.totalExperiments = this.experiments.length;
  }
  next();
});

export default mongoose.model(
  'LabExperimentTemplate',
  labExperimentTemplateSchema,
  'labexperiments'
);
