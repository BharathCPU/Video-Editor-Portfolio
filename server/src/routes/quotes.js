const express = require('express');
const prisma = require('../lib/prisma');
const { quoteValidationRules, handleValidationErrors } = require('../middleware/validate');

const router = express.Router();

/**
 * POST /api/quotes
 * Create a new quote request.
 */
router.post('/', quoteValidationRules, handleValidationErrors, async (req, res) => {
  try {
    const { fullName, email, phone, businessName, monthlyBudget, projectDetails } = req.body;

    const quote = await prisma.quoteRequest.create({
      data: {
        fullName,
        email,
        phone,
        businessName: businessName || null,
        monthlyBudget: monthlyBudget || null,
        projectDetails,
      },
    });

    return res.status(201).json({
      message: 'Quote request submitted successfully',
      id: quote.id,
    });
  } catch (error) {
    console.error('[quotes] Error creating quote:', error);
    return res.status(500).json({
      message: 'An unexpected error occurred. Please try again later.',
    });
  }
});

module.exports = router;
