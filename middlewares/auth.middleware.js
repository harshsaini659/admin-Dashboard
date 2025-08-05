const jwt = require('jsonwebtoken')
const User = require('../models/user.model')

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from cookie or Authorization header
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return res.redirect('/admin/login')
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id)

    if (!user) {
      return res.redirect('/admin/login')
    }

    req.user = user
    next()
  } catch (error) {
    console.error(error)
    res.redirect('/admin/login')
  }
}

module.exports = authMiddleware
