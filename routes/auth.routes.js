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

module.exports = router