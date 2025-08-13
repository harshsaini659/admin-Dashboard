const Product = require('../models/product.model')
const Category = require('../models/category.model')
const Variant = require('../models/productVariant.model')
const VariantAttribute = require('../models/productVariantAtt.model')

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
        res.render('products/create', { 
            title: 'Add Product',
            error: req.query.error,
            categories,
            variants, // Assuming you will fetch variants from the database
            variantAttributes // Assuming you will fetch variant attributes from the database
        })
    } catch(err) {
        console.error(err)
        res.render('products/create', { 
            title: 'Add Product',
            error: 'Error loading form',
            categories: [],
            variants: [],
            variantAttributes: []
        })
    }
}

// Create product (API method - keep existing)
exports.createProduct = async (req, res) => {
    try {
        const { name, description, category, status, variant, variantAttribute } = req.body
        console.log('Received data:', { name, category, description, status, variant, variantAttribute }) // Debug log
        
        const newProduct = new Product({
            name: name.trim(), 
            description: description.trim(),
            category: category, // ObjectId - no trim needed
            status: status || 'active', // Simplified
            variant: variant || null,
            variantAttribute: variantAttribute || null
        })

        const savedProduct = await newProduct.save()
        console.log('Saved product:', savedProduct) // Debug log
        res.status(201).json({ message: "Product created successfully", product: savedProduct })
    } catch (err) {
        console.error(err)
        if(err.code === 11000) {
            return res.status(400).json({ message: "Product with this name already exists" })
        }
        res.status(500).json({ message: "Server error" })
    }
}
