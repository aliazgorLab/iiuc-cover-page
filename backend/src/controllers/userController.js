import User from '../models/User.js';
import Cover from '../models/Cover.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash -refreshToken');
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, 'Profile retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

export const getStudentAcademicProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('name studentId department section semester batch academicProfile academicInfo');
    if (!user) return sendError(res, 'Student profile not found', 404);

    const academicProfile = {
      studentName: user.academicProfile?.studentName || user.academicInfo?.name || user.name || '',
      studentId: user.academicProfile?.studentId || user.academicInfo?.studentId || user.studentId || '',
      department: user.academicProfile?.department || user.academicInfo?.department || user.department || '',
      batch: user.academicProfile?.batch || user.academicInfo?.batch || user.batch || '',
      semester: user.academicProfile?.semester || user.academicInfo?.semester || user.semester || '',
      section: user.academicProfile?.section || user.academicInfo?.section || user.section || '',
    };

    return res.status(200).json({
      success: true,
      studentName: academicProfile.studentName,
      studentId: academicProfile.studentId,
      department: academicProfile.department,
      batch: academicProfile.batch,
      semester: academicProfile.semester,
      section: academicProfile.section,
      academicProfile,
      academicInfo: academicProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, studentId, department, batch, semester, section } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) return sendError(res, 'User not found', 404);

    if (name) user.name = name;
    if (studentId !== undefined) user.studentId = studentId;
    if (department !== undefined) user.department = department;
    if (batch !== undefined) user.batch = batch;
    if (semester !== undefined) user.semester = semester;
    if (section !== undefined) user.section = section;

    // Maintain synchronized academicProfile and academicInfo subdocuments
    user.academicProfile = {
      studentName: user.name || '',
      studentId: user.studentId || '',
      department: user.department || '',
      batch: user.batch || '',
      semester: user.semester || '',
      section: user.section || '',
    };

    user.academicInfo = {
      name: user.name || '',
      studentId: user.studentId || '',
      department: user.department || '',
      section: user.section || '',
      semester: user.semester || '',
      batch: user.batch || '',
    };

    const updatedUser = await user.save();
    return sendSuccess(res, 'Profile updated successfully', {
      id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      studentId: updatedUser.studentId,
      department: updatedUser.department,
      batch: updatedUser.batch,
      semester: updatedUser.semester,
      section: updatedUser.section,
      academicProfile: updatedUser.academicProfile,
      academicInfo: updatedUser.academicInfo,
      avatar: updatedUser.avatar,
      role: updatedUser.role,
    });
  } catch (error) {
    next(error);
  }
};

export const getStudentDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);

    const [totalCovers, monthlyCovers, recentActivity, topTypeAgg] = await Promise.all([
      Cover.countDocuments({ userId }),
      Cover.countDocuments({ userId, createdAt: { $gte: firstDayOfMonth } }),
      Cover.find({ userId }).sort({ createdAt: -1 }).limit(5),
      Cover.aggregate([
        { $match: { userId } },
        { $group: { _id: '$coverType', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
      ]),
    ]);

    const favoriteTemplate = topTypeAgg[0]?._id || 'Assignment Cover';

    return sendSuccess(res, 'Student dashboard stats retrieved', {
      totalCovers,
      monthlyCovers,
      favoriteTemplate,
      recentActivity,
    });
  } catch (error) {
    next(error);
  }
};
