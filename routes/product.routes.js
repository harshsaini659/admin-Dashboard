const express = require('express')
const router = express.Router()
const productController = require('../controllers/product.controller')
const upload = require('../middlewares/upload.middleware')

// Route for showing create product form
router.get('/', productController.listProduct)
router.get('/create', productController.createProductForm)

router.post('/create', upload.single, productController.createProduct)

module.exports = router
