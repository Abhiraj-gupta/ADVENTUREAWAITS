const express = require('express');
const {
  getSavedBudgets,
  getSavedBudget,
  createSavedBudget,
  updateSavedBudget,
  deleteSavedBudget,
  getSavedBudgetSummary
} = require('../controllers/savedBudget.controller');

const router = express.Router();

// Protect all routes
const { protect } = require('../middleware/auth');
router.use(protect);

// Get summary stats
router.route('/summary').get(getSavedBudgetSummary);

// Main routes
router.route('/')
  .get(getSavedBudgets)
  .post(createSavedBudget);

router.route('/:id')
  .get(getSavedBudget)
  .put(updateSavedBudget)
  .delete(deleteSavedBudget);

module.exports = router; 