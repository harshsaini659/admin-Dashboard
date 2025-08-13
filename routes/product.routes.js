const express = require('express')
const router = express.Router()
const productController = require('../controllers/product.controller')

// Route for showing create product form
router.get('/', productController.listProduct)
router.get('/create', productController.createProductForm)

router.post('/create',productController.createProduct)

module.exports = router
