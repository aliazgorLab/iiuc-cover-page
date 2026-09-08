import User from '../models/User.js';
import Template from '../models/Template.js';
import Cover from '../models/Cover.js';
import Teacher from '../models/Teacher.js';
import TeacherImportLog from '../models/TeacherImportLog.js';
import { runIIUCFacultyImport } from '../services/iiucScraperService.js';
import Course from '../models/Course.js';
import AdminActivity from '../models/AdminActivity.js';
import AdminNotification from '../models/AdminNotification.js';
import UserSession from '../models/UserSession.js';
import BroadcastLog from '../models/BroadcastLog.js';
import { sendAnnouncementEmail, validateAcademicEmail, isValidUrl } from '../services/emailService.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { logAdminActivity } from '../utils/activityLogger.js';
import { exportToCSV } from '../utils/csvExporter.js';

/**
 * Utility helper to create admin notification
 */
export const createAdminNotification = async ({ title, message, type = 'INFO', targetRole = 'ALL', meta = {} }) => {
  try {
    await AdminNotification.create({ title, message, type, targetRole, meta });
  } catch (err) {
    console.warn('[Notification] Failed to create notification:', err.message);
  }
};

// ─────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────

export const getAdminStats = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalStudents,
      totalAdmins,
      totalTemplates,
      totalCovers,
      todayCovers,
      totalTeachers,
      totalCourses,
      departments,
      recentUsers,
      recentCovers,
      coversByType,
    ] = await Promise.all([
      User.countDocuments({ role: 'STUDENT' }),
      User.countDocuments({ role: { $in: ['ADMIN', 'SUPER_ADMIN', 'MODERATOR'] } }),
      Template.countDocuments({ status: 'ACTIVE' }),
      Cover.countDocuments(),
      Cover.countDocuments({ createdAt: { $gte: today } }),
      Teacher.countDocuments({ status: 'ACTIVE' }),
      Course.countDocuments(),
      User.distinct('department'),
      User.find({ role: 'STUDENT' }).select('name email studentId department createdAt avatar').sort({ createdAt: -1 }).limit(5),
      Cover.find().populate('userId', 'name email studentId').sort({ createdAt: -1 }).limit(5),
      Cover.aggregate([
        { $group: { _id: '$coverType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const totalDepartments = departments.filter(Boolean).length || 1;

    return sendSuccess(res, 'Admin dashboard stats retrieved', {
      overview: {
        totalStudents,
        totalAdmins,
        totalTemplates,
        totalCovers,
        todayCovers,
        totalTeachers,
        totalCourses,
        totalDepartments,
      },
      analytics: { coversByType },
      recentActivity: { recentUsers, recentCovers },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalStudents,
      activeStudents,
      suspendedStudents,
      totalCovers,
      monthCovers,
      todayCovers,
      totalTeachers,
      coversByType,
      coversByDept,
      teachersByDept,
      dailyTrendRaw,
    ] = await Promise.all([
      User.countDocuments({ role: 'STUDENT' }),
      User.countDocuments({ role: 'STUDENT', accountStatus: 'ACTIVE' }),
      User.countDocuments({ role: 'STUDENT', accountStatus: { $in: ['SUSPENDED', 'BLOCKED'] } }),
      Cover.countDocuments(),
      Cover.countDocuments({ createdAt: { $gte: startOfMonth } }),
      Cover.countDocuments({ createdAt: { $gte: today } }),
      Teacher.countDocuments({ status: 'ACTIVE' }),
      Cover.aggregate([
        { $group: { _id: '$coverType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Cover.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Teacher.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Cover.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: {
              $dateToString: { format: '%m/%d', date: '$createdAt' },
            },
            covers: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const mostUsedTemplate = coversByType.length > 0 && coversByType[0]._id ? `${coversByType[0]._id} Cover` : 'Assignment Cover';
    const mostActiveDept = coversByDept.length > 0 && coversByDept[0]._id ? coversByDept[0]._id : 'Dept. of Computer Science & Engineering';

    const dailyTrendMap = new Map();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const key = `${mm}/${dd}`;
      dailyTrendMap.set(key, 0);
    }

    dailyTrendRaw.forEach((item) => {
      if (item._id && dailyTrendMap.has(item._id)) {
        dailyTrendMap.set(item._id, item.covers);
      }
    });

    const dailyTrend = Array.from(dailyTrendMap.entries()).map(([displayDate, covers]) => ({
      displayDate,
      covers,
    }));

    return sendSuccess(res, 'Analytics data retrieved successfully', {
      kpi: {
        totalStudents,
        activeStudents,
        suspendedStudents,
        totalCovers,
        monthCovers,
        todayCovers,
        mostUsedTemplate,
        mostActiveDept,
        totalTeachers,
      },
      dailyTrend,
      coversByType,
      coversByDept,
      teachersByDept,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// STUDENT MANAGEMENT
// ─────────────────────────────────────────────

export const getAdminStudents = async (req, res, next) => {
  try {
    const { role, department, search, accountStatus, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (role) filter.role = role;
    else filter.role = { $in: ['STUDENT', 'ADMIN', 'SUPER_ADMIN', 'MODERATOR'] };

    if (department) filter.department = department;
    if (accountStatus) filter.accountStatus = accountStatus;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-passwordHash -refreshToken -verificationToken')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter),
    ]);

    return sendSuccess(res, 'Students retrieved successfully', {
      users,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminStudentById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash -refreshToken -verificationToken');
    if (!user) return sendError(res, 'Student not found', 404);

    // Get detailed academic statistics & recent cover history for Student Intelligence System
    const [coverCount, recentCovers, coversByTypeAgg] = await Promise.all([
      Cover.countDocuments({ userId: user._id }),
      Cover.find({ userId: user._id }).sort({ createdAt: -1 }).limit(10),
      Cover.aggregate([
        { $match: { userId: user._id } },
        { $group: { _id: '$coverType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    const mostUsedTemplate = coversByTypeAgg[0]?._id || 'None';

    return sendSuccess(res, 'Student retrieved successfully', {
      ...user.toObject(),
      coverCount,
      mostUsedTemplate,
      recentCovers,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudentStatus = async (req, res, next) => {
  try {
    const { accountStatus, role } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) return sendError(res, 'Student not found', 404);

    const changes = [];

    if (accountStatus && ['ACTIVE', 'SUSPENDED', 'BLOCKED'].includes(accountStatus)) {
      changes.push(`Account status: ${user.accountStatus} → ${accountStatus}`);
      user.accountStatus = accountStatus;
    }

    if (role && ['STUDENT', 'ADMIN', 'SUPER_ADMIN', 'MODERATOR'].includes(role)) {
      changes.push(`Role: ${user.role} → ${role}`);
      user.role = role;
    }

    if (changes.length === 0) return sendError(res, 'No valid changes provided', 400);

    await user.save();

    await logAdminActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      action: accountStatus ? 'STUDENT_STATUS_CHANGED' : 'STUDENT_ROLE_CHANGED',
      module: 'STUDENTS',
      targetId: user._id.toString(),
      targetName: user.name,
      description: `Updated student ${user.name} (${user.studentId || user.email}): ${changes.join(', ')}`,
    });

    await createAdminNotification({
      title: 'Student Status Updated',
      message: `Account status for ${user.name} was set to ${user.accountStatus} by ${req.user.name}.`,
      type: accountStatus === 'SUSPENDED' || accountStatus === 'BLOCKED' ? 'WARNING' : 'INFO',
    });

    return sendSuccess(res, 'Student updated successfully', {
      id: user._id,
      name: user.name,
      email: user.email,
      accountStatus: user.accountStatus,
      role: user.role,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk Student Management — Status Batch Operation
 */
export const bulkUpdateStudentStatus = async (req, res, next) => {
  try {
    const { ids, accountStatus } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return sendError(res, 'Array of student IDs is required', 400);
    }
    if (!['ACTIVE', 'SUSPENDED', 'BLOCKED'].includes(accountStatus)) {
      return sendError(res, 'Valid accountStatus (ACTIVE, SUSPENDED, BLOCKED) is required', 400);
    }

    const result = await User.updateMany(
      { _id: { $in: ids } },
      { $set: { accountStatus } }
    );

    await logAdminActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'STUDENT_STATUS_CHANGED',
      module: 'STUDENTS',
      targetId: ids.join(','),
      targetName: `${ids.length} Students`,
      description: `Bulk updated ${result.modifiedCount} student accounts status to ${accountStatus}`,
    });

    await createAdminNotification({
      title: 'Bulk Student Status Updated',
      message: `${result.modifiedCount} student accounts were set to ${accountStatus} by ${req.user.name}.`,
      type: accountStatus === 'SUSPENDED' ? 'WARNING' : 'INFO',
    });

    return sendSuccess(res, `Successfully updated ${result.modifiedCount} students to ${accountStatus}`, {
      modifiedCount: result.modifiedCount,
      accountStatus,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// TEACHER MANAGEMENT
// ─────────────────────────────────────────────

export const getAdminTeachers = async (req, res, next) => {
  try {
    const { department, faculty, status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (department && department !== 'ALL') filter.department = { $regex: department, $options: 'i' };
    if (faculty && faculty !== 'ALL') filter.faculty = faculty;
    if (status && status !== 'ALL') filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [teachers, total] = await Promise.all([
      Teacher.find(filter).sort({ name: 1 }).skip(skip).limit(limitNum),
      Teacher.countDocuments(filter),
    ]);

    return sendSuccess(res, 'Teachers retrieved', {
      teachers,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminTeacherById = async (req, res, next) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) return sendError(res, 'Teacher not found', 404);

    const assignedCourses = await Course.find({ teacherId: teacher._id }).select('code title department semester');
    const [totalGenerated, lastCover] = await Promise.all([
      Cover.countDocuments({
        $or: [
          { teacherId: teacher._id },
          { 'coverData.teacherName': { $regex: teacher.name, $options: 'i' } }
        ]
      }),
      Cover.findOne({
        $or: [
          { teacherId: teacher._id },
          { 'coverData.teacherName': { $regex: teacher.name, $options: 'i' } }
        ]
      }).sort({ createdAt: -1 }),
    ]);

    return sendSuccess(res, 'Teacher details retrieved', {
      _id: teacher._id,
      name: teacher.name,
      designation: teacher.designation,
      department: teacher.department,
      faculty: teacher.faculty || 'FSE',
      email: teacher.email || '',
      avatar: teacher.avatar || teacher.profileImage || '',
      profileImage: teacher.profileImage || teacher.avatar || '',
      status: teacher.status || 'ACTIVE',
      assignedCourses,
      coverUsage: {
        totalGenerated,
        lastGenerated: lastCover?.createdAt || null,
      },
      source: {
        url: teacher.sourceUrl || '',
        importedAt: teacher.importedAt || teacher.updatedAt,
        source: teacher.source || 'IIUC Website',
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminTeacher = async (req, res, next) => {
  try {
    const { name, designation, department, faculty, email, profileImage, status } = req.body;
    if (!name || !designation || !department) {
      return sendError(res, 'Name, designation, and department are required', 400);
    }

    const teacher = await Teacher.create({
      name,
      designation,
      department,
      faculty: faculty || 'FSE',
      email: email || '',
      profileImage: profileImage || '',
      avatar: profileImage || '',
      status: status || 'ACTIVE',
    });

    await logAdminActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'TEACHER_CREATED',
      module: 'TEACHERS',
      targetId: teacher._id.toString(),
      targetName: teacher.name,
      description: `Created teacher: ${teacher.name} (${teacher.designation}, ${teacher.department})`,
    });

    return sendSuccess(res, 'Teacher created successfully', teacher, 201);
  } catch (error) {
    next(error);
  }
};

export const updateAdminTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!teacher) return sendError(res, 'Teacher not found', 404);

    await logAdminActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'TEACHER_UPDATED',
      module: 'TEACHERS',
      targetId: teacher._id.toString(),
      targetName: teacher.name,
      description: `Updated teacher: ${teacher.name}`,
    });

    return sendSuccess(res, 'Teacher updated successfully', teacher);
  } catch (error) {
    next(error);
  }
};

export const deleteAdminTeacher = async (req, res, next) => {
  try {
    const teacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!teacher) return sendError(res, 'Teacher not found', 404);

    await logAdminActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'TEACHER_DELETED',
      module: 'TEACHERS',
      targetId: req.params.id,
      targetName: teacher.name,
      description: `Deleted teacher: ${teacher.name} (${teacher.designation}, ${teacher.department})`,
    });

    return sendSuccess(res, 'Teacher deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/admin/teachers/import-iiuc
 * Run automated scraper to synchronize IIUC official faculty data
 */
export const importIIUCTeachers = async (req, res, next) => {
  try {
    const executedBy = req.user?.name || req.user?.email || 'System Admin';
    const result = await runIIUCFacultyImport(executedBy);

    await logAdminActivity({
      adminId: req.user?._id,
      adminName: req.user?.name || 'Admin',
      action: 'TEACHERS_IMPORTED_IIUC',
      module: 'TEACHERS',
      targetId: 'iiuc-scraper',
      targetName: 'IIUC Website Scraper',
      description: `Scraped IIUC Faculty Website: ${result.imported} new, ${result.updated} updated`,
    });

    return res.json({
      success: true,
      message: 'IIUC Faculty data synchronized successfully',
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/admin/teachers/import-history
 * Fetch audit log of IIUC faculty imports
 */
export const getIIUCImportHistory = async (req, res, next) => {
  try {
    const logs = await TeacherImportLog.find().sort({ createdAt: -1 }).limit(20);
    return res.json({
      success: true,
      logs,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// COURSE MANAGEMENT
// ─────────────────────────────────────────────

export const getAdminCourses = async (req, res, next) => {
  try {
    const { department, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (department) filter.department = { $regex: department, $options: 'i' };
    if (search) {
      filter.$or = [
        { courseCode: { $regex: search, $options: 'i' } },
        { courseTitle: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [courses, total] = await Promise.all([
      Course.find(filter).sort({ courseCode: 1 }).skip(skip).limit(parseInt(limit)),
      Course.countDocuments(filter),
    ]);

    return sendSuccess(res, 'Courses retrieved', {
      courses,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminCourse = async (req, res, next) => {
  try {
    const { courseCode, courseTitle, credit, department, semester, assignedTeacher } = req.body;
    if (!courseCode || !courseTitle) {
      return sendError(res, 'Course code and course title are required', 400);
    }

    const course = await Course.create({
      courseCode,
      courseTitle,
      credit: credit || 3,
      department,
      semester,
      assignedTeacher: assignedTeacher || '',
    });

    await logAdminActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'COURSE_CREATED',
      module: 'COURSES',
      targetId: course._id.toString(),
      targetName: course.courseCode,
      description: `Created course: ${course.courseCode} — ${course.courseTitle}`,
    });

    return sendSuccess(res, 'Course created successfully', course, 201);
  } catch (error) {
    next(error);
  }
};

export const updateAdminCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!course) return sendError(res, 'Course not found', 404);

    await logAdminActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'COURSE_UPDATED',
      module: 'COURSES',
      targetId: course._id.toString(),
      targetName: course.courseCode,
      description: `Updated course: ${course.courseCode} — ${course.courseTitle}`,
    });

    return sendSuccess(res, 'Course updated successfully', course);
  } catch (error) {
    next(error);
  }
};

export const deleteAdminCourse = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return sendError(res, 'Course not found', 404);

    await logAdminActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'COURSE_DELETED',
      module: 'COURSES',
      targetId: req.params.id,
      targetName: course.courseCode,
      description: `Deleted course: ${course.courseCode} — ${course.courseTitle}`,
    });

    return sendSuccess(res, 'Course deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// TEMPLATE MANAGEMENT
// ─────────────────────────────────────────────

export const getAdminTemplates = async (req, res, next) => {
  try {
    const { status, type, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [templates, total] = await Promise.all([
      Template.find(filter).sort({ isDefault: -1, createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Template.countDocuments(filter),
    ]);

    return sendSuccess(res, 'Templates retrieved', {
      templates,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminTemplate = async (req, res, next) => {
  try {
    const { name, slug, type, description, department, university, isDefault, configuration } = req.body;
    if (!name || !type) return sendError(res, 'Name and type are required', 400);

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

    await logAdminActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'TEMPLATE_CREATED',
      module: 'TEMPLATES',
      targetId: template._id.toString(),
      targetName: template.name,
      description: `Created template: ${template.name} (${template.type})`,
    });

    await createAdminNotification({
      title: 'New Template Created',
      message: `Template "${template.name}" (${template.type}) was published by ${req.user.name}.`,
      type: 'SUCCESS',
    });

    return sendSuccess(res, 'Template created successfully', template, 201);
  } catch (error) {
    next(error);
  }
};

export const updateAdminTemplate = async (req, res, next) => {
  try {
    const { status } = req.body;
    const template = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!template) return sendError(res, 'Template not found', 404);

    const action = status === 'ARCHIVED'
      ? 'TEMPLATE_ARCHIVED'
      : status === 'ACTIVE'
        ? 'TEMPLATE_ACTIVATED'
        : 'TEMPLATE_UPDATED';

    await logAdminActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      action,
      module: 'TEMPLATES',
      targetId: template._id.toString(),
      targetName: template.name,
      description: `${action.replace('_', ' ')}: ${template.name}`,
    });

    return sendSuccess(res, 'Template updated successfully', template);
  } catch (error) {
    next(error);
  }
};

export const deleteAdminTemplate = async (req, res, next) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return sendError(res, 'Template not found', 404);
    if (template.isDefault) return sendError(res, 'Default IIUC templates cannot be deleted', 403);

    await template.deleteOne();

    await logAdminActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'TEMPLATE_DELETED',
      module: 'TEMPLATES',
      targetId: req.params.id,
      targetName: template.name,
      description: `Deleted template: ${template.name}`,
    });

    return sendSuccess(res, 'Template deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ACTIVITY LOGS
// ─────────────────────────────────────────────

export const getActivityLogs = async (req, res, next) => {
  try {
    const { module, adminId, page = 1, limit = 30 } = req.query;
    const filter = {};
    if (module) filter.module = module;
    if (adminId) filter.adminId = adminId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [logs, total] = await Promise.all([
      AdminActivity.find(filter)
        .populate('adminId', 'name email avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      AdminActivity.countDocuments(filter),
    ]);

    return sendSuccess(res, 'Activity logs retrieved', {
      logs,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ADVANCED ANALYTICS (Recharts & KPIs)
// ─────────────────────────────────────────────

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const firstDayOfWeek = new Date();
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() - firstDayOfWeek.getDay());
    firstDayOfWeek.setHours(0, 0, 0, 0);

    const [
      totalStudents,
      activeStudents,
      suspendedStudents,
      totalTeachers,
      totalCourses,
      totalCovers,
      todayCovers,
      weekCovers,
      monthCovers,
      departments,
      coversByType,
      coversByDept,
      mostUsedTemplateAgg,
      dailyTrendAgg,
    ] = await Promise.all([
      User.countDocuments({ role: 'STUDENT' }),
      User.countDocuments({ role: 'STUDENT', accountStatus: 'ACTIVE' }),
      User.countDocuments({ role: 'STUDENT', accountStatus: 'SUSPENDED' }),
      Teacher.countDocuments({ status: 'ACTIVE' }),
      Course.countDocuments(),
      Cover.countDocuments(),
      Cover.countDocuments({ createdAt: { $gte: today } }),
      Cover.countDocuments({ createdAt: { $gte: firstDayOfWeek } }),
      Cover.countDocuments({ createdAt: { $gte: firstDayOfMonth } }),
      User.distinct('department'),
      Cover.aggregate([
        { $group: { _id: '$coverType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Cover.aggregate([
        { $match: { userId: { $ne: null } } },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: { path: '$user', preserveNullAndEmpty: false } },
        { $group: { _id: '$user.department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 6 },
      ]),
      Cover.aggregate([
        { $group: { _id: '$coverType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
      // 30-Day Daily Cover Generation Trend
      Cover.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            covers: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const validDepartments = departments.filter(Boolean);
    const mostUsedTemplate = mostUsedTemplateAgg[0]?._id || 'Assignment Cover';
    const mostActiveDept = coversByDept[0]?._id || (validDepartments[0] || 'Dept. of CSE');

    // Fill missing 30-day dates with 0 for clean continuous LineChart
    const trendMap = new Map(dailyTrendAgg.map((item) => [item._id, item.covers]));
    const dailyTrend = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayDate = d.toLocaleDateString('en-GB', { month: 'short', day: '2-digit' });
      dailyTrend.push({
        date: dateStr,
        displayDate,
        covers: trendMap.get(dateStr) || 0,
      });
    }

    const overview = {
      totalStudents,
      activeStudents,
      suspendedStudents,
      totalTeachers,
      totalCourses,
      totalCovers,
      todayCovers,
      weekCovers,
      monthCovers,
      totalDepartments: validDepartments.length || 1,
      mostUsedTemplate,
      mostActiveDept,
    };

    return sendSuccess(res, 'Analytics retrieved', {
      overview,
      kpi: overview,
      dailyTrend,
      coversByType,
      coversByDept,
      teachersByDept: await Teacher.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      teachersByFaculty: await Teacher.aggregate([
        { $group: { _id: { $ifNull: ['$faculty', 'FSE'] }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentActivity = async (req, res, next) => {
  try {
    const logs = await AdminActivity.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return sendSuccess(res, 'Recent activity retrieved', logs);
  } catch (error) {
    next(error);
  }
};

export const getDatabaseDebug = async (req, res, next) => {
  try {
    const host = mongoose.connection.host || '127.0.0.1';
    const port = mongoose.connection.port || 27017;
    const dbName = mongoose.connection.name || 'iiuc_cover_page';
    const collectionName = Teacher.collection.name; // 'teachers'
    const count = await Teacher.countDocuments();

    return res.status(200).json({
      success: true,
      host: `${host}:${port}`,
      database: dbName,
      collection: collectionName,
      count,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// CSV REPORTING EXPORT ENDPOINTS
// ─────────────────────────────────────────────

export const exportStudentsCSV = async (req, res, next) => {
  try {
    const students = await User.find({ role: 'STUDENT' })
      .select('name email studentId department batch semester section accountStatus createdAt')
      .lean();

    const formatted = students.map((s) => ({
      Name: s.name,
      Email: s.email,
      StudentID: s.studentId || 'N/A',
      Department: s.department || 'N/A',
      Batch: s.batch || 'N/A',
      Semester: s.semester || 'N/A',
      Section: s.section || 'N/A',
      Status: s.accountStatus || 'ACTIVE',
      JoinedDate: new Date(s.createdAt).toISOString().split('T')[0],
    }));

    const csv = exportToCSV(formatted);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=IIUC_Students_Report_${Date.now()}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

export const exportCoversCSV = async (req, res, next) => {
  try {
    const covers = await Cover.find()
      .populate('userId', 'name email studentId department')
      .sort({ createdAt: -1 })
      .lean();

    const formatted = covers.map((c) => ({
      CoverID: c._id,
      Type: c.coverType,
      CourseCode: c.coverData?.courseCode || 'N/A',
      CourseTitle: c.coverData?.courseTitle || 'N/A',
      TeacherName: c.coverData?.teacherName || 'N/A',
      StudentName: c.userId?.name || c.coverData?.studentName || 'Guest User',
      StudentID: c.userId?.studentId || c.coverData?.studentId || 'N/A',
      Department: c.userId?.department || c.coverData?.department || 'N/A',
      CreatedDate: new Date(c.createdAt).toISOString().split('T')[0],
    }));

    const csv = exportToCSV(formatted);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=IIUC_Cover_Generation_Report_${Date.now()}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

export const exportActivityCSV = async (req, res, next) => {
  try {
    const logs = await AdminActivity.find().sort({ createdAt: -1 }).lean();

    const formatted = logs.map((l) => ({
      AdminName: l.adminName,
      Action: l.action,
      Module: l.module,
      TargetName: l.targetName || 'N/A',
      Description: l.description,
      Timestamp: new Date(l.createdAt).toISOString(),
    }));

    const csv = exportToCSV(formatted);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=IIUC_Admin_Activity_Audit_${Date.now()}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

export const exportTeachersCSV = async (req, res, next) => {
  try {
    const teachers = await Teacher.find().sort({ department: 1, name: 1 }).lean();

    const formatted = teachers.map((t) => ({
      TeacherID: t._id,
      Name: t.name,
      Designation: t.designation || 'Faculty Member',
      Department: t.department || 'N/A',
      Faculty: t.faculty || 'N/A',
      Email: t.email || 'N/A',
      Status: t.status || 'ACTIVE',
      SourceUrl: t.sourceUrl || 'N/A',
      Source: t.source || 'IIUC Website',
    }));

    const csv = exportToCSV(formatted);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=IIUC_Faculty_Teachers_Report_${Date.now()}.csv`);
    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ADMIN NOTIFICATION CENTER
// ─────────────────────────────────────────────

export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await AdminNotification.find()
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await AdminNotification.countDocuments({ isRead: false });

    return sendSuccess(res, 'Notifications retrieved', { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await AdminNotification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) return sendError(res, 'Notification not found', 404);
    return sendSuccess(res, 'Notification marked as read', notification);
  } catch (error) {
    next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await AdminNotification.findByIdAndDelete(req.params.id);
    if (!notification) return sendError(res, 'Notification not found', 404);
    return sendSuccess(res, 'Notification deleted');
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ADMIN PROFILE & SECURITY SESSIONS
// ─────────────────────────────────────────────

export const getAdminSessions = async (req, res, next) => {
  try {
    const targetUserId = req.query.userId || req.user._id;
    const sessions = await UserSession.find({ userId: targetUserId })
      .sort({ loginTime: -1 })
      .limit(10);

    return sendSuccess(res, 'Security sessions retrieved', sessions);
  } catch (error) {
    next(error);
  }
};

export const revokeAdminSession = async (req, res, next) => {
  try {
    const session = await UserSession.findByIdAndUpdate(
      req.params.id,
      { isActive: false, logoutTime: new Date() },
      { new: true }
    );
    if (!session) return sendError(res, 'Session not found', 404);

    await logAdminActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'SESSION_REVOKED',
      module: 'AUTH',
      targetId: session._id.toString(),
      targetName: session.userEmail,
      description: `Revoked active security login session for ${session.userEmail}`,
    });

    return sendSuccess(res, 'Session revoked successfully', session);
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// ADMIN EMAIL BROADCAST & ANNOUNCEMENT SYSTEM
// ─────────────────────────────────────────────

export const getBroadcastRecipientsCount = async (req, res, next) => {
  try {
    const { targetType = 'ALL', department = '', selectedUserIds = [] } = req.body;

    let query = { accountStatus: { $ne: 'BLOCKED' } };

    if (targetType === 'DEPARTMENT') {
      if (!department) {
        return sendError(res, 'Department name is required for department target.', 400);
      }
      query.department = new RegExp(`^${department.trim()}$`, 'i');
    } else if (targetType === 'SELECTIVE') {
      if (!Array.isArray(selectedUserIds) || selectedUserIds.length === 0) {
        return sendError(res, 'At least one student must be selected for selective target.', 400);
      }
      query._id = { $in: selectedUserIds };
    }

    const eligibleUsers = await User.find(query)
      .select('name email studentId department')
      .lean();

    const validRecipients = eligibleUsers.filter((u) => u.email && u.email.trim().length > 0);

    return sendSuccess(res, 'Recipient count calculated', {
      targetType,
      department,
      recipientCount: validRecipients.length,
      recipients: validRecipients.map((u) => ({
        id: u._id,
        name: u.name,
        email: u.email,
        studentId: u.studentId || 'N/A',
        department: u.department || 'N/A',
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const sendTestAnnouncementEmail = async (req, res, next) => {
  try {
    const { to, testEmail, subject, title, badgeText, announcementBody, ctaUrl, ctaText } = req.body;
    const recipient = (to || testEmail || '').trim();

    if (!recipient) {
      return sendError(res, 'A valid test recipient email address is required.', 400, { errorCode: 'INVALID_RECIPIENT' });
    }

    if (!announcementBody || announcementBody.trim().length === 0) {
      return sendError(res, 'Announcement message body is required.', 400, { errorCode: 'INVALID_ANNOUNCEMENT' });
    }

    const info = await sendAnnouncementEmail({
      to: recipient,
      subject,
      title,
      badgeText,
      announcementBody,
      ctaUrl,
      ctaText,
    });

    return sendSuccess(res, `Test announcement email sent successfully to ${recipient}`, {
      messageId: info?.messageId || null,
      recipient,
    });
  } catch (error) {
    console.error('[Test Email Broadcast Error]:', error.message);

    const isAuthError =
      error.code === 'EAUTH' ||
      error.responseCode === 535 ||
      error.message?.includes('535') ||
      error.message?.includes('Invalid credentials');

    if (isAuthError) {
      return sendError(
        res,
        'SMTP authentication failed. Please verify the configured SMTP credentials or provider authentication method.',
        400,
        { errorCode: 'SMTP_AUTH_FAILED' }
      );
    }

    return sendError(
      res,
      `Failed to send test email: ${error.message}`,
      500,
      { errorCode: 'SMTP_SEND_FAILED' }
    );
  }
};

export const sendBroadcastEmail = async (req, res, next) => {
  try {
    const {
      broadcastId,
      targetType = 'ALL',
      department = '',
      selectedUserIds = [],
      subject,
      title,
      badgeText,
      announcementBody,
      ctaUrl,
      ctaText,
    } = req.body;

    if (!subject || subject.trim().length === 0) {
      return sendError(res, 'Email subject line is required.', 400);
    }

    if (!title || title.trim().length === 0) {
      return sendError(res, 'Announcement title is required.', 400);
    }

    if (!announcementBody || announcementBody.trim().length === 0) {
      return sendError(res, 'Announcement message body is required.', 400);
    }

    const safeBroadcastId = broadcastId || `bcast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Idempotency check: prevent duplicate broadcast execution
    const existingLog = await BroadcastLog.findOne({ broadcastId: safeBroadcastId });
    if (existingLog) {
      return sendError(
        res,
        `Broadcast with ID "${safeBroadcastId}" is already processing or completed. Duplicate request blocked.`,
        409
      );
    }

    // Server-side source of truth query for recipients
    let query = { accountStatus: { $ne: 'BLOCKED' } };
    if (targetType === 'DEPARTMENT') {
      if (!department) return sendError(res, 'Department name is required.', 400);
      query.department = new RegExp(`^${department.trim()}$`, 'i');
    } else if (targetType === 'SELECTIVE') {
      if (!Array.isArray(selectedUserIds) || selectedUserIds.length === 0) {
        return sendError(res, 'At least one student must be selected.', 400);
      }
      query._id = { $in: selectedUserIds };
    }

    const eligibleUsers = await User.find(query).select('email name studentId department').lean();
    const validUsers = eligibleUsers.filter((u) => u.email && u.email.trim().length > 0);

    if (validUsers.length === 0) {
      return sendError(res, 'No eligible active recipients found for this broadcast target.', 400);
    }

    // Create initial BroadcastLog in database
    const broadcastRecord = await BroadcastLog.create({
      broadcastId: safeBroadcastId,
      subject: subject.trim(),
      title: title.trim(),
      badgeText: badgeText ? badgeText.trim() : 'IIUC ANNOUNCEMENT',
      announcementBody: announcementBody.trim(),
      ctaUrl: ctaUrl ? ctaUrl.trim() : '',
      ctaText: ctaText ? ctaText.trim() : 'Explore Upgrade',
      targetType,
      department: department ? department.trim() : '',
      recipientCount: validUsers.length,
      successCount: 0,
      failedCount: 0,
      status: 'SENDING',
      createdBy: req.user._id,
      createdByName: req.user.name || 'Administrator',
      startedAt: new Date(),
    });

    // Controlled Batch Processing Constants
    const BATCH_SIZE = 25;
    const BATCH_DELAY_MS = 1000;

    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < validUsers.length; i += BATCH_SIZE) {
      const batch = validUsers.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map((userItem) =>
          sendAnnouncementEmail({
            to: userItem.email,
            subject: subject.trim(),
            title: title.trim(),
            badgeText: badgeText ? badgeText.trim() : 'IIUC ANNOUNCEMENT',
            announcementBody: announcementBody.trim(),
            ctaUrl,
            ctaText,
          })
        )
      );

      for (const resItem of results) {
        if (resItem.status === 'fulfilled') {
          successCount++;
        } else {
          failedCount++;
          console.warn('[Broadcast] Individual recipient send failed:', resItem.reason?.message || resItem.reason);
        }
      }

      if (i + BATCH_SIZE < validUsers.length) {
        await new Promise((resolve) => setTimeout(resolve, BATCH_DELAY_MS));
      }
    }

    const finalStatus = failedCount > 0 ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED';

    broadcastRecord.successCount = successCount;
    broadcastRecord.failedCount = failedCount;
    broadcastRecord.status = finalStatus;
    broadcastRecord.completedAt = new Date();
    await broadcastRecord.save();

    // Log admin audit activity
    await logAdminActivity({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'BROADCAST_EMAIL_SENT',
      module: 'SYSTEM',
      targetId: broadcastRecord._id.toString(),
      targetName: safeBroadcastId,
      description: `Sent email broadcast "${title}" to ${targetType} (${validUsers.length} total recipients). Success: ${successCount}, Failed: ${failedCount}.`,
      meta: {
        targetType,
        department,
        total: validUsers.length,
        successful: successCount,
        failed: failedCount,
      },
    });

    return sendSuccess(res, 'Email broadcast process completed', {
      broadcastId: safeBroadcastId,
      status: finalStatus,
      total: validUsers.length,
      successful: successCount,
      failed: failedCount,
    });
  } catch (error) {
    console.error('[Broadcast Controller Error]:', error);
    next(error);
  }
};

export const getBroadcastLogs = async (req, res, next) => {
  try {
    const logs = await BroadcastLog.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('createdBy', 'name email role')
      .lean();

    return sendSuccess(res, 'Broadcast logs retrieved', logs);
  } catch (error) {
    next(error);
  }
};

