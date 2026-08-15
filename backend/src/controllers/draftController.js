import DraftCover from '../models/DraftCover.js';
import { sendSuccess, sendError } from '../utils/response.js';

export const saveDraft = async (req, res, next) => {
  try {
    const { coverType, coverData } = req.body;
    if (!coverType || !coverData) {
      return sendError(res, 'Cover type and data payload are required', 400);
    }

    // Upsert the user's latest draft for the specified coverType
    const draft = await DraftCover.findOneAndUpdate(
      { userId: req.user._id, coverType, status: 'DRAFT' },
      {
        userId: req.user._id,
        coverType,
        coverData,
        lastEdited: new Date(),
        status: 'DRAFT',
      },
      { new: true, upsert: true }
    );

    return sendSuccess(res, 'Draft cover saved successfully', draft);
  } catch (error) {
    next(error);
  }
};

export const getDrafts = async (req, res, next) => {
  try {
    const drafts = await DraftCover.find({ userId: req.user._id, status: 'DRAFT' })
      .sort({ lastEdited: -1 })
      .limit(5);

    return sendSuccess(res, 'Drafts retrieved', drafts);
  } catch (error) {
    next(error);
  }
};

export const deleteDraft = async (req, res, next) => {
  try {
    const draft = await DraftCover.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!draft) return sendError(res, 'Draft not found', 404);

    return sendSuccess(res, 'Draft deleted successfully');
  } catch (error) {
    next(error);
  }
};
