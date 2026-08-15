import Department from '../models/Department.js';
import User from '../models/User.js';
import Teacher from '../models/Teacher.js';
import Course from '../models/Course.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAdminActivity } from '../utils/activityLogger.js';

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    return sendSuccess(res, 'Departments retrieved', departments);
  } catch (error) {
    next(error);
  }
};

export const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return sendError(res, 'Department not found', 404);

    const [studentsCount, teachersCount, coursesCount] = await Promise.all([
      User.countDocuments({ department: { $regex: department.code, $options: 'i' } }),
      Teacher.countDocuments({ department: { $regex: department.name, $options: 'i' } }),
      Course.countDocuments({ department: { $regex: department.name, $options: 'i' } }),
    ]);

    return sendSuccess(res, 'Department details retrieved', {
      ...department.toObject(),
      studentsCount,
      teachersCount,
      coursesCount,
    });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, faculty, status, branding } = req.body;
    if (!name || !code) return sendError(res, 'Name and code are required', 400);

    const department = await Department.create({
      name,
      code,
      faculty: faculty || 'Faculty of Science & Engineering',
      status: status || 'ACTIVE',
      branding,
    });

    if (req.user) {
      await logAdminActivity({
        adminId: req.user._id,
        adminName: req.user.name,
        action: 'DEPARTMENT_CREATED',
        module: 'SYSTEM',
        targetId: department._id.toString(),
        targetName: department.name,
        description: `Created department: ${department.name} (${department.code})`,
      });
    }

    return sendSuccess(res, 'Department created successfully', department, 201);
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!department) return sendError(res, 'Department not found', 404);

    if (req.user) {
      await logAdminActivity({
        adminId: req.user._id,
        adminName: req.user.name,
        action: 'DEPARTMENT_UPDATED',
        module: 'SYSTEM',
        targetId: department._id.toString(),
        targetName: department.name,
        description: `Updated department: ${department.name}`,
      });
    }

    return sendSuccess(res, 'Department updated successfully', department);
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return sendError(res, 'Department not found', 404);

    if (req.user) {
      await logAdminActivity({
        adminId: req.user._id,
        adminName: req.user.name,
        action: 'DEPARTMENT_DELETED',
        module: 'SYSTEM',
        targetId: req.params.id,
        targetName: department.name,
        description: `Deleted department: ${department.name}`,
      });
    }

    return sendSuccess(res, 'Department deleted successfully');
  } catch (error) {
    next(error);
  }
};
