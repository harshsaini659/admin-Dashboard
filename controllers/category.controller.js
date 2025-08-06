const Category = require('../models/category.model')

exports.createCategory = async (req, res) =>{
    try {
        const { name, parent} = req.body
        if (!name) return res.status(400).json({ message: "Name is required" })
        const category = new Category({ name, parent })
        await category.save()
        res.status(201).json({ message: "Category created successfully", category })
    }catch(err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
}

exports.listCategory = async (req, res) =>{
    try {
        const categories = await Category.find().populate('parent', 'name')
        res.status(200).json({ categories })
    }catch(err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
}

exports.editCategory = async (req, res) =>{
    try {
        const {id} = req.params
        const {name,parent} = req.body
        if(!name) return res.status(400).json({ message: "Name is required" })
        const category = await Category.findByIdAndUpdate(id, {name,parent}, {new: true})
        res.status(200).json({
            success: true,
            message: "Category updated successfully", 
            category
        })
    }catch(err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
}

exports.deleteCategory = async (req, res) =>{
    try {
        const {id} = req.params
        const category = await Category.findByIdAndDelete(id)
        if (!category) return res.status(404).json({ message: "Category not found" })
        res.status(200).json({
            success: true,
            message: "Category deleted successfully", 
            category
        })
    }catch(err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
}
