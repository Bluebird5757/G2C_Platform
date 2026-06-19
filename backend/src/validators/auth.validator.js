import { body } from 'express-validator';
import { ROLES } from '../config/constants.js';

export const registerValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
  body('role')
    .isIn([ROLES.CONSUMER, ROLES.GROWER])
    .withMessage('Role must be consumer or grower'),
];

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const growerProfileValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('category').optional().trim(),
  body('aadharLast4')
    .optional()
    .matches(/^\d{4}$/)
    .withMessage('Aadhar last 4 digits must be 4 numbers'),
  body('latitude').optional().isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('longitude').optional().isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
];

export const consumerProfileValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
];

export const listingValidator = [
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('items').isArray({ min: 1 }).withMessage('Items must be a non-empty array'),
  body('items.*').trim().notEmpty().withMessage('Each item must be non-empty'),
];

export const searchValidator = [
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('item').trim().notEmpty().withMessage('Item is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
];

export const reviewValidator = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be an integer between 1 and 5'),
  body('comment')
    .optional()
    .trim(),
];

export const orderValidator = [
  body('growerId').isMongoId().withMessage('Valid growerId is required'),
  body('items').isArray({ min: 1 }).withMessage('Order items must be a non-empty array'),
  body('items.*.name').trim().notEmpty().withMessage('Item name is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be an integer >= 1'),
  body('items.*.price').optional().isFloat({ min: 0 }).withMessage('Price must be a number >= 0'),
];
