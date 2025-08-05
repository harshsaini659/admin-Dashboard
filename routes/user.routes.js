const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const authMiddleware = require('../middlewares/auth.middleware')

// All routes here will be prefixed with /admin/user/
// and should be protected with authentication middleware

router.get('/dashboard', authMiddleware, userController.dashboard)  // /admin/user/dashboard
router.get('/profile', authMiddleware, userController.profile)      // /admin/user/profile
router.get('/settings', authMiddleware, userController.settings)    // /admin/user/settings

// Add more protected routes as needed
// router.get('/products', authMiddleware, userController.products)
// router.get('/orders', authMiddleware, userController.orders)
// router.get('/sellers', authMiddleware, userController.sellers)

module.exports = router
