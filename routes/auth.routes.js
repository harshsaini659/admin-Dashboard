const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')

router.get('/signup', (req, res) => {
  res.render('auth/signup')
})
router.get('/login', (req, res) => {
  res.render('auth/login')
})
router.post('/signup',authController.signup)
router.post('/login', authController.login)

// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('token');
  res.redirect('/admin/login');
});

module.exports = router