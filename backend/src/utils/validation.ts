import { body, ValidationChain } from 'express-validator';

export const validateSignup: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, and number'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),
  body('phone')
    .optional()
    .matches(/^[0-9\-+\s()]+$/)
    .withMessage('Invalid phone format'),
];

export const validateLogin: ValidationChain[] = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const validateCard: ValidationChain[] = [
  body('issuerId')
    .isUUID()
    .withMessage('Valid issuer ID is required'),
  body('label')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Label must be between 1 and 50 characters'),
  body('codeLast4')
    .matches(/^\d{4}$/)
    .withMessage('Last 4 digits must be exactly 4 numbers'),
  body('fullCode')
    .optional()
    .matches(/^[\d\s]+$/)
    .withMessage('Card code must contain only digits and spaces'),
  body('valueInitial')
    .isFloat({ min: 0.01 })
    .withMessage('Initial value must be greater than 0'),
  body('valueCurrent')
    .isFloat({ min: 0 })
    .withMessage('Current value cannot be negative'),
  body('expiryDate')
    .isISO8601()
    .toDate()
    .withMessage('Valid expiry date is required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
];

export const validateBalanceUpdate: ValidationChain[] = [
  body('newBalance')
    .isFloat({ min: 0 })
    .withMessage('Balance cannot be negative'),
  body('changeType')
    .optional()
    .isIn(['manual_update', 'purchase', 'refund', 'correction'])
    .withMessage('Invalid change type'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must be less than 500 characters'),
];

