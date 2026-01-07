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
  body('cardProductId')
    .isUUID()
    .withMessage('Valid cardProductId is required'),
  body('nickname')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Nickname must be less than 100 characters'),
  body('codeLast4')
    .matches(/^\d{4}$/)
    .withMessage('Last 4 digits must be exactly 4 numbers'),
  body('fullCode')
    .optional()
    .matches(/^[\d\s]+$/)
    .withMessage('Card code must contain only digits and spaces'),
  body('balance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Balance cannot be negative'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('expiresAt must be a valid ISO8601 date'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
];

