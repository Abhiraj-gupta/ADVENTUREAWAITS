const express = require('express');
const {
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  isInFavorites
} = require('../controllers/favorites.controller');

const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getFavorites);

router.route('/:type/:id')
  .get(isInFavorites)
  .post(addToFavorites)
  .delete(removeFromFavorites);

module.exports = router; 