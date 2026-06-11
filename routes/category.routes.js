const express = require('express');
const router = express.Router();

const categoryController = require('../controllers/category.controller');
const auth = require('../middlewares/auth.middleware');
const admin = require('../middlewares/admin.middleware');

router.post('/', auth, admin, categoryController.createCategory);
router.get('/', auth, admin, categoryController.getAllCategories);
router.get('/dropdown', auth, admin, categoryController.getCategoryDropdown);
router.get('/:id', auth, admin, categoryController.getCategoryById);
router.put('/:id', auth, admin, categoryController.updateCategory);
router.delete('/:id', auth, admin, categoryController.deleteCategory);
router.patch('/:id/status', auth, admin, categoryController.toggleCategoryStatus);

module.exports = router;