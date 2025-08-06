const express = require('express')
const router = express.Router()
const userController = require('../controllers/user.controller')
const authMiddleware = require('../middlewares/auth.middleware')

// All routes here will be prefixed with /admin/user/
// and should be protected with authentication middleware

router.get('/dashboard', authMiddleware, userController.dashboard)  // /admin/user/dashboard
// router.get('/profile', authMiddleware, userController.profile)      // /admin/user/profile
// router.get('/settings', authMiddleware, userController.settings)    // /admin/user/settings

router.use('/categories', require('./category.routes')) // /admin/user/categories

module.exports = router
