const express = require('express');
const {
  getAttractions,
  getAttraction,
  createAttraction,
  updateAttraction,
  deleteAttraction,
  searchAttractions,
  getTopRatedAttractions,
  getAttractionsByState,
  getAttractionsByCategory
} = require('../controllers/attraction.controller');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Special routes
router.get('/search', searchAttractions);
router.get('/top-rated', getTopRatedAttractions);
router.get('/by-state/:state', getAttractionsByState);
router.get('/by-category/:category', getAttractionsByCategory);

// Standard CRUD routes
router
  .route('/')
  .get(getAttractions)
  .post(protect, authorize('admin'), createAttraction);

router
  .route('/:id')
  .get(getAttraction)
  .put(protect, authorize('admin'), updateAttraction)
  .delete(protect, authorize('admin'), deleteAttraction);

module.exports = router; 