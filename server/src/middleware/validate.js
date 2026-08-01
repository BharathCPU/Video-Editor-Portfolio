const { body, validationResult } = require('express-validator');

/**
 * Validation rules for the POST /api/quotes endpoint.
 * Each rule trims, escapes (to neutralise HTML/XSS), and enforces
 * format and length constraints. Prisma parameterised queries already
 * prevent SQL injection, but we sanitise input here as defence-in-depth.
 */
const quoteValidationRules = [
  body('fullName')
    .trim()
    .escape()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 200 }).withMessage('Name must be 2-200 characters'),

  body('email')
    .trim()
    .normalizeEmail()
    .isEmail().withMessage('A valid email address is required')
    .isLength({ max: 320 }).withMessage('Email must not exceed 320 characters'),

  body('phone')
    .trim()
    .escape()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[\+]?[\d\s\-\(\)]{7,20}$/).withMessage('Please provide a valid phone number'),

  body('businessName')
    .optional({ values: 'falsy' })
    .trim()
    .escape()
    .isLength({ max: 200 }).withMessage('Business name must not exceed 200 characters'),

  body('monthlyBudget')
    .optional({ values: 'falsy' })
    .trim()
    .escape()
    .isLength({ max: 100 }).withMessage('Monthly budget must not exceed 100 characters'),

  body('projectDetails')
    .trim()
    .escape()
    .notEmpty().withMessage('Project details are required')
    .isLength({ min: 2, max: 5000 }).withMessage('Project details must be 2-5000 characters'),
];

/**
 * Middleware that checks validation results and returns 422 with
 * structured errors if any rule failed.
 */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
}

module.exports = { quoteValidationRules, handleValidationErrors };
