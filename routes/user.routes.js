const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const authMiddleware = require('../middlewares/auth.middleware')

// All routes here will be prefixed with /admin/user/
// and should be protected with authentication middleware

router.get('/dashboard', authMiddleware, userController.dashboard)    // /admin/user/dashboard
router.use('/categories', require('./category.routes'))              // /admin/user/categories
router.use('/variants',require('./productVariant.routes'))           // /admin/user/variants
router.use('/variantAtt',require('./productVariantAtt.routes'))           // /admin/user/variants
router.use('/products', require('./product.routes'))                         // /admin/user/products
router.use('/usersList', require('./usersList.routes'))                           // /admin/user/users

module.exports = router
