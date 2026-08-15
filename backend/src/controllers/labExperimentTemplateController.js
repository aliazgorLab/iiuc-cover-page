import LabExperimentTemplate from '../models/LabExperimentTemplate.js';
import { sendSuccess } from '../utils/response.js';

// Public / Student: Fetch lab template by course code
export const getLabTemplateByCourseCode = async (req, res, next) => {
  try {
    const rawCourseCode = (req.params.courseCode || '').trim();
    if (!rawCourseCode) {
      return res.status(400).json({
        success: false,
        templateFound: false,
        message: 'Course code parameter is required.',
        experiments: [],
      });
    }

    const codeRegex = new RegExp(`^${rawCourseCode.replace(/[\s-]/g, '[\\s-]?')}$`, 'i');
    const template = await LabExperimentTemplate.findOne({ courseCode: codeRegex });

    if (!template) {
      return res.json({
        success: true,
        templateFound: false,
        courseCode: rawCourseCode,
        totalExperiments: 0,
        experiments: [],
      });
    }

    return res.json({
      success: true,
      templateFound: true,
      courseCode: template.courseCode,
      courseTitle: template.courseTitle,
      department: template.department,
      totalExperiments: template.totalExperiments || template.experiments.length,
      experiments: template.experiments || [],
    });
  } catch (error) {
    next(error);
  }
};

// Admin: List all lab experiment templates
export const getAdminLabTemplates = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '15', 10);
    const search = (req.query.search || '').trim();

    let filter = {};
    if (search) {
      const regex = new RegExp(search, 'i');
      filter.$or = [{ courseCode: regex }, { courseTitle: regex }, { department: regex }];
    }

    const total = await LabExperimentTemplate.countDocuments(filter);
    const totalPages = Math.ceil(total / limit) || 1;
    const templates = await LabExperimentTemplate.find(filter)
      .sort({ courseCode: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      success: true,
      data: {
        templates,
        total,
        page,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Admin: Create lab template
export const createLabTemplate = async (req, res, next) => {
  try {
    const { courseCode, courseTitle, department, experiments } = req.body;
    const cleanCode = (courseCode || '').trim().toUpperCase();
    const cleanTitle = (courseTitle || '').trim();

    if (!cleanCode || !cleanTitle) {
      return res.status(400).json({ success: false, message: 'Course code and title are required.' });
    }

    const existing = await LabExperimentTemplate.findOne({ courseCode: cleanCode });
    if (existing) {
      return res.status(400).json({ success: false, message: `Lab template for course ${cleanCode} already exists.` });
    }

    const template = await LabExperimentTemplate.create({
      courseCode: cleanCode,
      courseTitle: cleanTitle,
      department: department || 'CSE',
      experiments: Array.isArray(experiments) ? experiments : [],
      totalExperiments: Array.isArray(experiments) ? experiments.length : 0,
    });

    return sendSuccess(res, 'Lab template created successfully!', template, 201);
  } catch (error) {
    next(error);
  }
};

// Admin: Update lab template
export const updateLabTemplate = async (req, res, next) => {
  try {
    const { courseCode, courseTitle, department, experiments } = req.body;
    const template = await LabExperimentTemplate.findById(req.params.id);

    if (!template) {
      return res.status(404).json({ success: false, message: 'Lab template not found.' });
    }

    if (courseCode) template.courseCode = courseCode.trim().toUpperCase();
    if (courseTitle) template.courseTitle = courseTitle.trim();
    if (department) template.department = department.trim();
    if (Array.isArray(experiments)) {
      template.experiments = experiments;
      template.totalExperiments = experiments.length;
    }

    await template.save();
    return sendSuccess(res, 'Lab template updated successfully!', template);
  } catch (error) {
    next(error);
  }
};

// Admin: Delete lab template
export const deleteLabTemplate = async (req, res, next) => {
  try {
    const template = await LabExperimentTemplate.findByIdAndDelete(req.params.id);
    if (!template) {
      return res.status(404).json({ success: false, message: 'Lab template not found.' });
    }
    return sendSuccess(res, 'Lab template deleted successfully.');
  } catch (error) {
    next(error);
  }
};
