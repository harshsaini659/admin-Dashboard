const express = require('express')
const router = express.Router()
const variantAttController = require('../controllers/productVariantAtt.controller')

// Web interface routes
router.get('/', variantAttController.listVariantAtt)
router.get('/create', variantAttController.createVariantAttForm)
router.get('/edit/:id', variantAttController.editVariantAttForm)

// API routes
router.post('/create', variantAttController.createVariantAtt)
router.patch('/edit/:id', variantAttController.editVariantAtt)
router.delete('/delete/:id', variantAttController.deleteVariantAtt)

module.exports = router