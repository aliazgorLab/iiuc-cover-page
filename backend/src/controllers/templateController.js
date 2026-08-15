import Template from '../models/Template.js';
import { sendSuccess, sendError } from '../utils/response.js';

// Default IIUC Templates Seed Data
const defaultTemplates = [
  {
    name: 'Official IIUC Assignment Cover',
    slug: 'iiuc-official-assignment',
    type: 'ASSIGNMENT',
    description: 'Official IIUC assignment cover page layout with topic title, course matrix, and faculty box.',
    department: 'All Departments',
    university: 'IIUC',
    status: 'ACTIVE',
    isDefault: true,
  },
  {
    name: 'Standard IIUC Lab Report Cover',
    slug: 'iiuc-standard-lab-report',
    type: 'LAB_REPORT',
    description: 'Standard lab report cover template featuring experiment number, title, course code, and supervisor details.',
    department: 'All Departments',
    university: 'IIUC',
    status: 'ACTIVE',
    isDefault: true,
  },
  {
    name: 'Standard IIUC Lab Index Matrix',
    slug: 'iiuc-standard-lab-index',
    type: 'LAB_INDEX',
    description: 'Lab index table matrix padded with minimum 10 auto-padded rows for experiment dates, marks, and faculty signatures.',
    department: 'All Departments',
    university: 'IIUC',
    status: 'ACTIVE',
    isDefault: true,
  },
  {
    name: 'Standard IIUC Group Project Cover',
    slug: 'iiuc-standard-group-project',
    type: 'PROJECT',
    description: 'Multi-member flexbox grid project report cover supporting team projects with 1 to 4 students.',
    department: 'All Departments',
    university: 'IIUC',
    status: 'ACTIVE',
    isDefault: true,
  },
];

export const getTemplates = async (req, res, next) => {
  try {
    let templates = await Template.find({ status: 'ACTIVE' }).sort({ isDefault: -1, createdAt: -1 });

    // Auto-seed default IIUC templates if collection is empty
    if (templates.length === 0) {
      await Template.insertMany(defaultTemplates);
      templates = await Template.find({ status: 'ACTIVE' }).sort({ isDefault: -1, createdAt: -1 });
    }

    return sendSuccess(res, 'Templates retrieved successfully', templates);
  } catch (error) {
    next(error);
  }
};

export const getTemplateById = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return sendError(res, 'Template not found', 404);
    return sendSuccess(res, 'Template retrieved successfully', template);
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (req, res, next) => {
  try {
    const { name, slug, type, description, department, university, isDefault, configuration } = req.body;
    const template = await Template.create({
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      type,
      description,
      department,
      university,
      isDefault,
      configuration,
    });
    return sendSuccess(res, 'Template created successfully', template, 201);
  } catch (error) {
    next(error);
  }
};
