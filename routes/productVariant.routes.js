const express = require('express')
const router = express.Router()
const variantController = require('../controllers/productVariant.controller')

// Web interface routes
router.get('/', variantController.listVariant)
router.get('/create', variantController.createVariantForm)
router.get('/edit/:id', variantController.editVariantForm)

// API routes
router.post('/create', variantController.createVariant)
router.patch('/edit/:id', variantController.editVariant)
router.delete('/delete/:id', variantController.deleteVariant)

module.exports = router