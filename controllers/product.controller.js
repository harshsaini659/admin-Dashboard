const Product = require('../models/product.model')
const Category = require('../models/category.model')
const Variant = require('../models/productVariant.model')
const upload = require('../middlewares/upload.middleware')
const fs = require('fs')
const path = require('path')

// Show create product form (for web interface)
exports.createProductForm = async (req, res) => {
    try {
        // Get all categories and variants for dropdowns
        const categories = await Category.find({ status: 'active' }).sort({ name: 1 })
        const variants = await Variant.find().sort({ name: 1 })
        
        res.render('products/create', { 
            title: 'Add Product',
            categories,
            variants,
            error: req.query.error
        })
    } catch(err) {
        console.error(err)
        res.render('products/create', { 
            title: 'Add Product',
            categories: [],
            variants: [],
            error: 'Error loading form'
        })
    }
}

// Create product (API method)
exports.createProduct = async (req, res) => {
    try {
        const { 
            name, 
            description, 
            category, 
            variants, 
            price, 
            discount, 
            images, 
            stock, 
            active 
        } = req.body

        // Validation
        if (!name) return res.status(400).json({ message: "Product name is required" })
        if (!description) return res.status(400).json({ message: "Description is required" })
        if (!category) return res.status(400).json({ message: "Category is required" })
        if (!price || price <= 0) return res.status(400).json({ message: "Valid price is required" })
        if (stock < 0) return res.status(400).json({ message: "Stock cannot be negative" })

        // Verify category exists
        const categoryExists = await Category.findById(category)
        if (!categoryExists) {
            return res.status(400).json({ message: "Selected category does not exist" })
        }

        // Process variants if provided
        let processedVariants = []
        if (variants && Array.isArray(variants) && variants.length > 0) {
            for (const variantData of variants) {
                const variantExists = await Variant.findById(variantData.variant)
                if (!variantExists) {
                    return res.status(400).json({ 
                        message: `Variant with ID ${variantData.variant} does not exist` 
                    })
                }
                
                // Validate selected values exist in the variant
                const invalidValues = variantData.selectedValues.filter(
                    value => !variantExists.value.includes(value)
                )
                if (invalidValues.length > 0) {
                    return res.status(400).json({ 
                        message: `Invalid values for variant ${variantExists.name}: ${invalidValues.join(', ')}` 
                    })
                }
                
                processedVariants.push({
                    variant: variantData.variant,
                    selectedValues: variantData.selectedValues
                })
            }
        }

        const newProduct = new Product({
            name: name.trim(),
            description: description.trim(),
            category,
            variants: processedVariants,
            price: parseFloat(price),
            discount: discount ? parseFloat(discount) : 0,
            images: Array.isArray(images) ? images.filter(img => img.trim()) : [],
            stock: parseInt(stock) || 0,
            active: active === true || active === 'true'
        })

        await newProduct.save()
        
        // Populate the response
        await newProduct.populate([
            { path: 'category', select: 'name' },
            { path: 'variants.variant', select: 'name value' }
        ])

        res.status(201).json({ 
            message: "Product created successfully", 
            product: newProduct 
        })
    } catch(err) {
        console.error(err)
        if (err.code === 11000 && err.keyPattern?.slug) {
            return res.status(400).json({ message: "Product with similar name already exists" })
        }
        res.status(500).json({ message: "Server error" })
    }
}

// List products (for web interface)
exports.listProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || 10
        const skip = (page - 1) * limit

        // Build filter query
        const filter = {}
        if (req.query.category) filter.category = req.query.category
        if (req.query.active !== undefined) filter.active = req.query.active === 'true'
        if (req.query.search) {
            filter.$text = { $search: req.query.search }
        }

        const products = await Product.find(filter)
            .populate('category', 'name')
            .populate('variants.variant', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)

        const totalProducts = await Product.countDocuments(filter)
        const totalPages = Math.ceil(totalProducts / limit)

        res.render('products/list', { 
            title: 'All Products',
            products,
            currentPage: page,
            totalPages,
            totalProducts,
            success: req.query.success,
            error: req.query.error
        })
    } catch(err) {
        console.error(err)
        res.render('products/list', { 
            title: 'All Products',
            products: [],
            currentPage: 1,
            totalPages: 1,
            totalProducts: 0,
            error: 'Error loading products'
        })
    }
}

// Get single product (API method)
exports.getProduct = async (req, res) => {
    try {
        const { id } = req.params
        const product = await Product.findById(id)
            .populate('category')
            .populate('variants.variant')
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        
        res.status(200).json({ product })
    } catch(err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
}

// Show edit product form (for web interface)
exports.editProductForm = async (req, res) => {
    try {
        const { id } = req.params
        
        const product = await Product.findById(id)
            .populate('category')
            .populate('variants.variant')
        
        if (!product) {
            return res.redirect('/admin/user/products?error=' + encodeURIComponent('Product not found'))
        }
        
        // Get all categories and variants for dropdowns
        const categories = await Category.find({ status: 'active' }).sort({ name: 1 })
        const variants = await Variant.find().sort({ name: 1 })
        
        res.render('products/edit', { 
            title: 'Edit Product',
            product,
            categories,
            variants,
            error: req.query.error
        })
    } catch(err) {
        console.error(err)
        res.redirect('/admin/user/products?error=' + encodeURIComponent('Error loading product'))
    }
}

// Update product (API method)
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params
        const { 
            name, 
            description, 
            category, 
            variants, 
            price, 
            discount, 
            images, 
            stock, 
            active 
        } = req.body

        // Validation
        if (!name) return res.status(400).json({ message: "Product name is required" })
        if (!description) return res.status(400).json({ message: "Description is required" })
        if (!category) return res.status(400).json({ message: "Category is required" })
        if (!price || price <= 0) return res.status(400).json({ message: "Valid price is required" })

        // Verify category exists
        const categoryExists = await Category.findById(category)
        if (!categoryExists) {
            return res.status(400).json({ message: "Selected category does not exist" })
        }

        // Process variants if provided
        let processedVariants = []
        if (variants && Array.isArray(variants) && variants.length > 0) {
            for (const variantData of variants) {
                const variantExists = await Variant.findById(variantData.variant)
                if (!variantExists) {
                    return res.status(400).json({ 
                        message: `Variant with ID ${variantData.variant} does not exist` 
                    })
                }
                
                processedVariants.push({
                    variant: variantData.variant,
                    selectedValues: variantData.selectedValues
                })
            }
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                name: name.trim(),
                description: description.trim(),
                category,
                variants: processedVariants,
                price: parseFloat(price),
                discount: discount ? parseFloat(discount) : 0,
                images: Array.isArray(images) ? images.filter(img => img.trim()) : [],
                stock: parseInt(stock) || 0,
                active: active === true || active === 'true'
            },
            { new: true, runValidators: true }
        ).populate([
            { path: 'category', select: 'name' },
            { path: 'variants.variant', select: 'name value' }
        ])

        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" })
        }

        res.status(200).json({ 
            message: "Product updated successfully", 
            product: updatedProduct 
        })
    } catch(err) {
        console.error(err)
        if (err.code === 11000 && err.keyPattern?.slug) {
            return res.status(400).json({ message: "Product with similar name already exists" })
        }
        res.status(500).json({ message: "Server error" })
    }
}

// Delete product (API method)
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params
        const deletedProduct = await Product.findByIdAndDelete(id)
        
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" })
        }
        
        res.status(200).json({ 
            message: "Product deleted successfully",
            product: deletedProduct 
        })
    } catch(err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
}

// Toggle product status (API method)
exports.toggleProductStatus = async (req, res) => {
    try {
        const { id } = req.params
        const product = await Product.findById(id)
        
        if (!product) {
            return res.status(404).json({ message: "Product not found" })
        }
        
        product.active = !product.active
        await product.save()
        
        res.status(200).json({ 
            message: `Product ${product.active ? 'activated' : 'deactivated'} successfully`,
            product 
        })
    } catch(err) {
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
}

// Upload product image
exports.uploadProductImage = (req, res) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ 
                success: false, 
                message: err.message 
            })
        }
        
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No file uploaded' 
            })
        }
        
        // Return the image URL
        const imageUrl = '/uploads/products/' + req.file.filename
        res.status(200).json({ 
            success: true, 
            imageUrl: imageUrl,
            message: 'Image uploaded successfully' 
        })
    })
}

// Upload multiple product images
exports.uploadProductImages = (req, res) => {
    upload.multiple('images', 10)(req, res, (err) => {
        if (err) {
            return res.status(400).json({ 
                success: false, 
                message: err.message 
            })
        }
        
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No files uploaded' 
            })
        }
        
        // Return the image URLs
        const imageUrls = req.files.map(file => '/uploads/products/' + file.filename)
        res.status(200).json({ 
            success: true, 
            imageUrls: imageUrls,
            message: `${req.files.length} images uploaded successfully` 
        })
    })
}

// Delete product image
exports.deleteProductImage = (req, res) => {
    try {
        const { filename } = req.params
        const imagePath = path.join(upload.uploadDir, filename)
        
        // Check if file exists
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath)
            res.status(200).json({ 
                success: true, 
                message: 'Image deleted successfully' 
            })
        } else {
            res.status(404).json({ 
                success: false, 
                message: 'Image not found' 
            })
        }
    } catch(err) {
        console.error(err)
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        })
    }
}
