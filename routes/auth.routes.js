const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')

//render signup and login pages
router.get('/signup', (req, res) => {  //jab user browser me /admin/signup type karega to...
  res.render('auth/signup') // ...ye path follow hota hai views/auth/signup.ejs or page render hoti hai
})
router.get('/login', (req, res) => { //jab user browser me /admin/login type karega to...
  res.render('auth/login') // ...ye path follow hota hai views/auth/login.ejs or page render hoti hai
})

//handle signup and login requests
router.post('/signup',authController.signup) // user ke form bharne ke bad means submit krne ke bad ye route hit hota hai
router.post('/login', authController.login) // user ke login form bharne ke bad means submit krne ke bad ye route hit hota hai

// Logout route
router.get('/logout', (req, res) => {
  res.clearCookie('token')
  res.redirect('/admin/login')
})

module.exports = router