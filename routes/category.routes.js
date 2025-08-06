const express = require('express')
const router = express.Router()
const categoryController = require('../controllers/category.controller')

router.get('/create', (req, res) => {
    res.render('category/create')
})
// router.get('/list',(req, res) => {
//     res.render('category/list')
// })
// router.get('/edit/:id',(req,res)=>{
//     res.render('category/edit', { id: req.params.id })
// })
// router.get('/delete/:id',(req,res)=>{
//     res.render('category/delete', { id: req.params.id })
// })

router.post('/create',categoryController.createCategory)
router.get('/list', categoryController.listCategory)
router.patch('/edit/:id', categoryController.editCategory )
router.delete('/delete/:id', categoryController.deleteCategory)

module.exports = router