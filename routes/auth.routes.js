const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')

//render signup and login pages
router.get('/signup', (req, res) => {
  res.render('auth/signup')
})
router.get('/login', (req, res) => {
  res.render('auth/login')
})

//handle signup and login requests
router.post('/signup',authController.signup)
router.post('/login', authController.login)

// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('token')
  res.redirect('/admin/login')
})

module.exports = router