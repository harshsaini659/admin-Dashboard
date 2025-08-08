const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/category.controller')


// Route for showing create category form and route for handling category creation
router.get('/create', categoryController.createCategoryForm)
router.post('/create', categoryController.createCategory)

//route for listing categories
router.get('/list', categoryController.listCategory)

// Route for showing edit category form
// router.get('/edit/:id', categoryController.editCategoryForm)
// router.post('/edit/:id', categoryController.editCategory)

// router.post('/delete/:id', categoryController.deleteCategory)

module.exports = router