const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    active: {
        type: Boolean,
        default: true
    },
    variants: [{
        variant: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Variant',
            required: true
        },
        selectedValues: [{
            type: String,
            required: true
        }]
    }],
    price: {
        type: Number,
        required: true,
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    images: [{
        type: String, // Store image URLs/paths
        required: true
    }],
    stock: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    // Calculated fields
    finalPrice: {
        type: Number
    },
    slug: {
        type: String,
        unique: true
    }
}, {
    timestamps: true
})

// Pre-save middleware to calculate final price and generate slug
productSchema.pre('save', function(next) {
    // Calculate final price after discount
    this.finalPrice = this.price - (this.price * (this.discount / 100))
    
    // Generate slug from name
    if (this.isModified('name')) {
        this.slug = this.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
    }
    
    next()
})

// Index for better search performance
productSchema.index({ name: 'text', description: 'text' })
productSchema.index({ category: 1 })
productSchema.index({ active: 1 })
productSchema.index({ price: 1 })

module.exports = mongoose.model('Product', productSchema)
