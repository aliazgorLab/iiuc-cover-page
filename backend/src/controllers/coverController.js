import Cover from '../models/Cover.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const saveCover = async (req, res, next) => {
  try {
    const { templateId, coverType, coverData } = req.body;
    const userId = req.user._id;

    const studentSnapshot = {
      name: coverData?.studentName || req.user?.name || '',
      studentId: coverData?.studentId || req.user?.studentId || '',
      department: coverData?.studentDept || coverData?.department || req.user?.department || '',
      section: coverData?.section || req.user?.section || '',
    };

    const enrichedData = {
      ...coverData,
      studentSnapshot: coverData?.studentSnapshot || studentSnapshot,
    };

    const cover = await Cover.create({
      userId,
      templateId: templateId || 'default',
      coverType,
      coverData: enrichedData,
    });

    return sendSuccess(res, 'Cover page saved to cloud history successfully!', cover, 201);
  } catch (error) {
    next(error);
  }
};

export const generateCover = async (req, res, next) => {
  try {
    const { templateId, coverType, coverData } = req.body;
    const userId = req.user ? req.user._id : null;

    const cover = await Cover.create({
      userId,
      templateId: templateId || 'default',
      coverType,
      coverData,
    });

    return sendSuccess(res, 'Cover log generated successfully', { coverId: cover._id }, 201);
  } catch (error) {
    next(error);
  }
};

export const getCoverHistory = async (req, res, next) => {
  try {
    const history = await Cover.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, 'Cover history retrieved successfully', history);
  } catch (error) {
    next(error);
  }
};

export const getCoverById = async (req, res, next) => {
  try {
    const cover = await Cover.findOne({ _id: req.params.id, userId: req.user._id });
    if (!cover) return sendError(res, 'Saved cover not found', 404);
    return sendSuccess(res, 'Cover retrieved successfully', cover);
  } catch (error) {
    next(error);
  }
};

export const deleteCover = async (req, res, next) => {
  try {
    const cover = await Cover.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!cover) return sendError(res, 'Cover not found or unauthorized', 404);
    return sendSuccess(res, 'Cover removed from cloud history successfully.');
  } catch (error) {
    next(error);
  }
};
