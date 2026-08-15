import Cover from '../models/Cover.js';
import { sendSuccess } from '../utils/response.js';

export const importPreviousLabExperiments = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const rawCourseCode = (req.params.courseCode || '').trim();

    if (!rawCourseCode) {
      return res.status(400).json({
        success: false,
        message: 'Course code is required for lab experiment import.',
        experiments: [],
      });
    }

    // Flexible regex for course code (e.g., EEE-1122, EEE 1122, EEE1122)
    const codeRegex = new RegExp(rawCourseCode.replace(/[\s-]/g, '[\\s-]?'), 'i');

    const labReports = await Cover.find({
      userId,
      coverType: 'LAB_REPORT',
      $or: [
        { 'coverData.courseCode': codeRegex },
        { 'coverData.code': codeRegex },
        { 'coverData.courseTitle': codeRegex },
      ],
    }).sort({ createdAt: 1 });

    const expMap = new Map();

    for (const item of labReports) {
      const data = item.coverData || {};
      const rawNum = (data.experimentNo || data.experimentNumber || data.no || '').toString().trim();
      const rawName = (data.experimentTitle || data.experimentName || data.title || '').trim();
      const rawDate = data.submissionDate || data.date || item.createdAt || '';
      const pageNo = data.pageNo || '';
      const remarks = data.remarks || '';

      let formattedNum = rawNum;
      if (/^\d+$/.test(rawNum)) {
        formattedNum = rawNum.padStart(2, '0');
      }

      const key = formattedNum || rawName.toLowerCase();
      let formattedDate = rawDate;
      if (rawDate instanceof Date) {
        formattedDate = rawDate.toISOString().split('T')[0];
      }

      if (key) {
        expMap.set(key, {
          number: formattedNum || '01',
          name: rawName || 'Lab Experiment',
          date: formattedDate || new Date().toISOString().split('T')[0],
          pageNo: pageNo || '',
          remarks: remarks || '',
        });
      }
    }

    const experiments = Array.from(expMap.values()).sort((a, b) => {
      const numA = parseInt(a.number, 10);
      const numB = parseInt(b.number, 10);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.number.localeCompare(b.number);
    });

    return res.json({
      success: true,
      courseCode: rawCourseCode,
      count: experiments.length,
      experiments,
    });
  } catch (error) {
    next(error);
  }
};
