const express = require('express')
const router = express.Router()
const productController = require('../controllers/product.controller')

// Web interface routes (for rendering pages)
router.get('/products', productController.listProducts)
router.get('/products/create', productController.createProductForm)
router.get('/products/edit/:id', productController.editProductForm)

// API routes (for CRUD operations)
router.post('/api/products', productController.createProduct)
router.get('/api/products/:id', productController.getProduct)
router.put('/api/products/:id', productController.updateProduct)
router.patch('/api/products/:id', productController.updateProduct)
router.delete('/api/products/:id', productController.deleteProduct)
router.patch('/api/products/:id/toggle-status', productController.toggleProductStatus)

// Image upload routes
router.post('/api/products/upload-image', productController.uploadProductImage)
router.post('/api/products/upload-images', productController.uploadProductImages)
router.delete('/api/products/delete-image/:filename', productController.deleteProductImage)

module.exports = router
