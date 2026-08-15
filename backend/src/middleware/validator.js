import { sendError } from '../utils/response.js';

export const validateGoogleAuthPayload = (req, res, next) => {
  const { credential, userInfo } = req.body;
  const hasCredential = credential && typeof credential === 'string' && credential.trim() !== '';
  const hasUserInfo = userInfo && typeof userInfo === 'object' && Boolean(userInfo.email);
  
  if (!hasCredential && !hasUserInfo) {
    return sendError(res, 'Google authentication payload (credential token or userInfo) is required.', 400);
  }
  next();
};

export const validateProfileUpdatePayload = (req, res, next) => {
  const { name, studentId, department } = req.body;
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return sendError(res, 'Student name is required.', 400);
  }
  if (!studentId || typeof studentId !== 'string' || studentId.trim() === '') {
    return sendError(res, 'Student ID matrix is required.', 400);
  }
  if (!department || typeof department !== 'string' || department.trim() === '') {
    return sendError(res, 'Department is required.', 400);
  }
  next();
};

export const validateCoverSavePayload = (req, res, next) => {
  const { coverType, coverData } = req.body;
  if (!coverType || !['ASSIGNMENT', 'LAB_REPORT', 'LAB_INDEX', 'PROJECT'].includes(coverType)) {
    return sendError(res, 'Valid coverType (ASSIGNMENT, LAB_REPORT, LAB_INDEX, PROJECT) is required.', 400);
  }
  if (!coverData || typeof coverData !== 'object') {
    return sendError(res, 'Structured coverData payload object is required.', 400);
  }
  next();
};
