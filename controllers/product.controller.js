const Product = require('../models/product.model')
const Category = require('../models/category.model')
const Variant = require('../models/productVariant.model')
const VariantAttribute = require('../models/productVariantAtt.model')
const buildCategoryDropdownTree = require('../utils/categoryDropdownTree')

exports.listProduct = async (req, res) => {
    try {
        const products = await Product.find().populate('category').sort({ createdAt: -1 })
        console.log('Products found:', products.length)
        
        res.render('products/list', {
            title: 'All Products',
            products: products || [],
            currentPage: 1,
            totalPages: 1, // Add this for pagination
            success: req.query.success,
            error: req.query.error
        })
    } catch(err) {
        console.error('Error fetching products:', err)
        res.render('products/list', {
            title: 'All Products',
            products: [],
            currentPage: 1,
            totalPages: 1, // Add this for pagination
            error: 'Error loading products'
        })
    }
}

// Show create product form (for web interface)
exports.createProductForm = async (req, res) => {
    console.log("log1")
    try {
        const categories = await Category.find({ status: 'active' }).sort({ name: 1 })
        const variants = await Variant.find({ status: 'active' }).sort({ name: 1 })
        const variantAttributes = await VariantAttribute.find({ status: 'active' }).sort({ name: 1 })
        // console.log('Active categories:', categories) // Debug log

        // Build category tree for dropdown
        const categoryTree = buildCategoryDropdownTree(categories)

        res.render('products/create', { 
            title: 'Add Product',
            error: req.query.error,
            categoryTree: categoryTree,
            variants, // Assuming you will fetch variants from the database
            variantAttributes // Assuming you will fetch variant attributes from the database
        })
    } catch(err) {
        console.error(err)
        res.render('products/create', { 
            title: 'Add Product',
            error: 'Error loading form',
            categoryTree: [],
            variants: [],
            variantAttributes: []
        })
    }
}

// Create product (API method - keep existing)
exports.createProduct = async (req, res) => {
    try {
        console.log('=== Product Creation Request ===')
        console.log('Body:', req.body)
        console.log('File:', req.file)
        console.log('================================')
        
        const { name, description, shortDescription, category, status, variant, variantAttribute } = req.body
        console.log('Received data:', { name, description, shortDescription, category, status, variant, variantAttribute }) // Debug log
        
        // Validate required fields
        if (!name || !name.trim()) {
            return res.status(400).json({ message: "Product name is required" })
        }
        
        if (!description || !description.trim()) {
            return res.status(400).json({ message: "Product description is required" })
        }
        
        if (!shortDescription || !shortDescription.trim()) {
            return res.status(400).json({ message: "Short description is required" })
        }
        
        if (!category) {
            return res.status(400).json({ message: "Category is required" })
        }
        
        // Handle image upload
        let imagePath = null
        if (req.file) {
            // Store relative path from public directory
            imagePath = `/uploads/products/${req.file.filename}`
            console.log('Image uploaded:', imagePath)
        }
        
        const newProduct = new Product({
            name: name.trim(), 
            description: description.trim(),
            shortDescription: shortDescription.trim(),
            category: category, // ObjectId - no trim needed
            status: status || 'active', // Simplified
            variant: variant || null,
            variantAttribute: variantAttribute || null,
            image: imagePath
        })

        const savedProduct = await newProduct.save()
        console.log('Saved product:', savedProduct) // Debug log
        res.status(201).json({ message: "Product created successfully", product: savedProduct })
    } catch (err) {
        console.error('=== Product Creation Error ===')
        console.error('Error details:', err)
        console.error('Error message:', err.message)
        console.error('Error stack:', err.stack)
        console.error('=============================')
        
        // Clean up uploaded file if database save fails
        if (req.file) {
            const fs = require('fs')
            const path = require('path')
            const filePath = path.join(__dirname, '../public/uploads/products', req.file.filename)
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting file:', unlinkErr)
            })
        }
        
        if(err.code === 11000) {
            return res.status(400).json({ message: "Product with this name already exists" })
        }
        res.status(500).json({ message: "Server error" })
    }
}
