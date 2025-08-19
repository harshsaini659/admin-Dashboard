const Product = require('../models/product.model')
const Category = require('../models/category.model')
const Variant = require('../models/productVariant.model')
const VariantAttribute = require('../models/productVariantAtt.model')
const buildCategoryDropdownTree = require('../utils/categoryDropdownTree')

exports.listProduct = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const search = req.query.search || ''
        const status = req.query.status || ''
        const category = req.query.category || ''
        
        // Build query object
        let query = {}
        
        if (search) {
            query.name = { $regex: search, $options: 'i' }
        }
        
        if (status) {
            query.status = status
        }
        
        if (category) {
            query.category = category
        }
        
        // Calculate pagination
        const skip = (page - 1) * limit
        
        // Get total count for pagination
        const total = await Product.countDocuments(query)
        const totalPages = Math.ceil(total / limit)
        
        // Fetch products with populated fields
        const products = await Product.find(query)
            .populate('category', 'name')
            .populate('variant', 'name')
            .populate('variantAttribute', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
        
        // Get categories for filter dropdown
        const categories = await Category.find({ status: 'active' }).sort({ name: 1 })
        
        console.log('Products found:', products.length)
        
        res.render('products/list', {
            title: 'All Products',
            products: products || [],
            categories: categories || [],
            currentPage: page,
            totalPages: totalPages,
            total: total,
            search: search,
            statusFilter: status,
            categoryFilter: category,
            success: req.query.success,
            error: req.query.error
        })
    } catch(err) {
        console.error('Error fetching products:', err)
        res.render('products/list', {
            title: 'All Products',
            products: [],
            categories: [],
            currentPage: 1,
            totalPages: 1,
            total: 0,
            search: '',
            statusFilter: '',
            categoryFilter: '',
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
        const variantAttributes = await VariantAttribute.find({ status: 'active' }).populate('variantName', 'name _id').sort({ name: 1 })
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

        const { name, description, shortDescription, category, status, variant, variantAttribute, price, discount, finalPrice, stock } = req.body
        console.log('Received data:', { name, description, shortDescription, category, status, variant, variantAttribute, price, discount, finalPrice, stock }) // Debug log

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
            price: parseFloat(price) || 0, // Ensure price is a number
            discount: parseFloat(discount) || 0, // Ensure discount is a number
            finalPrice: parseFloat(finalPrice) || 0, // Ensure finalPrice is a number
            stock: parseInt(stock) || 0, // Ensure stock is a number
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

// Delete product
exports.deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id
        const product = await Product.findById(productId)
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        
        // Delete associated image file if exists
        if (product.image) {
            const fs = require('fs')
            const path = require('path')
            const filePath = path.join(__dirname, '../public/uploads/products', product.image)
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) console.error('Error deleting image file:', unlinkErr)
            })
        }
        
        await Product.findByIdAndDelete(productId)
        res.json({ message: "Product deleted successfully" })
    } catch (err) {
        console.error('Error deleting product:', err)
        res.status(500).json({ message: "Server error" })
    }
}

// Toggle product status
exports.toggleProductStatus = async (req, res) => {
    try {
        const productId = req.params.id
        const product = await Product.findById(productId)
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        
        // Toggle status
        const newStatus = product.status === 'active' ? 'inactive' : 'active'
        await Product.findByIdAndUpdate(productId, { status: newStatus })
        
        res.json({ 
            message: `Product ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
            status: newStatus 
        })
    } catch (err) {
        console.error('Error toggling product status:', err)
        res.status(500).json({ message: "Server error" })
    }
}
