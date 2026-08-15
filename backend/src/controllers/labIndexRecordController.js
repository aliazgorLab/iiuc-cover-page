import LabIndexRecord from '../models/LabIndexRecord.js';
import { sendSuccess } from '../utils/response.js';

// Get student's saved lab index record for a course
export const getLabIndexRecordByCourse = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const rawCourseCode = (req.params.courseCode || '').trim();

    if (!rawCourseCode) {
      return res.status(400).json({ success: false, message: 'Course code is required.' });
    }

    const codeRegex = new RegExp(`^${rawCourseCode.replace(/[\s-]/g, '[\\s-]?')}$`, 'i');
    const record = await LabIndexRecord.findOne({ userId, courseCode: codeRegex });

    if (!record) {
      return res.json({
        success: true,
        recordFound: false,
        courseCode: rawCourseCode,
        record: null,
      });
    }

    return res.json({
      success: true,
      recordFound: true,
      courseCode: record.courseCode,
      record,
    });
  } catch (error) {
    next(error);
  }
};

// Create or Auto-Save / Upsert Student Lab Index Record
export const saveOrUpdateLabIndexRecord = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { courseCode, courseTitle, studentName, studentId, section, experiments, source } = req.body;

    const cleanCode = (courseCode || '').trim().toUpperCase();
    const cleanTitle = (courseTitle || '').trim();

    if (!cleanCode) {
      return res.status(400).json({ success: false, message: 'Course code is required.' });
    }

    const cleanExps = Array.isArray(experiments)
      ? experiments.map((e, idx) => ({
          number: e.no || e.number || String(idx + 1).padStart(2, '0'),
          title: (e.name || e.title || '').trim(),
          date: (e.date || '').trim(),
          pageNo: (e.pageNo || '').trim(),
          remarks: (e.remarks || '').trim(),
        }))
      : [];

    const record = await LabIndexRecord.findOneAndUpdate(
      { userId, courseCode: cleanCode },
      {
        $set: {
          userId,
          courseCode: cleanCode,
          courseTitle: cleanTitle || 'Lab Course',
          studentName: studentName || '',
          studentId: studentId || '',
          section: section || '',
          experiments: cleanExps,
          totalExperiments: cleanExps.length,
          completedExperiments: cleanExps.filter((e) => e.date && e.date.length > 0).length,
          source: source || 'SAVED_RECORD',
        },
      },
      { upsert: true, new: true, runValidators: true }
    );

    return res.json({
      success: true,
      message: 'Lab index record saved automatically',
      record,
    });
  } catch (error) {
    next(error);
  }
};

// Update Lab Index Record by ID
export const updateLabIndexRecordById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const record = await LabIndexRecord.findOne({ _id: req.params.id, userId });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Lab index record not found.' });
    }

    const { courseTitle, studentName, studentId, section, experiments, source } = req.body;

    if (courseTitle) record.courseTitle = courseTitle.trim();
    if (studentName !== undefined) record.studentName = studentName;
    if (studentId !== undefined) record.studentId = studentId;
    if (section !== undefined) record.section = section;
    if (source) record.source = source;

    if (Array.isArray(experiments)) {
      record.experiments = experiments.map((e, idx) => ({
        number: e.no || e.number || String(idx + 1).padStart(2, '0'),
        title: (e.name || e.title || '').trim(),
        date: (e.date || '').trim(),
        pageNo: (e.pageNo || '').trim(),
        remarks: (e.remarks || '').trim(),
      }));
    }

    await record.save();

    return res.json({
      success: true,
      message: 'Lab index record updated successfully',
      record,
    });
  } catch (error) {
    next(error);
  }
};

// Delete Lab Index Record by ID
export const deleteLabIndexRecordById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const record = await LabIndexRecord.findOneAndDelete({ _id: req.params.id, userId });

    if (!record) {
      return res.status(404).json({ success: false, message: 'Lab index record not found.' });
    }

    return sendSuccess(res, 'Lab index record deleted successfully.');
  } catch (error) {
    next(error);
  }
};

// Get all saved lab index records for current logged-in student
export const getUserLabIndexRecords = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const records = await LabIndexRecord.find({ userId }).sort({ updatedAt: -1 });

    return res.json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};
