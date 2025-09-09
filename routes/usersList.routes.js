const express = require('express')
const router = express.Router()
const usersListController = require('../controllers/usersList.controller')

router.get('/', usersListController.listUsers)  // /admin/user/usersList

module.exports = router
