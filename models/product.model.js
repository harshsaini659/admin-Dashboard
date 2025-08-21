const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    variants: [{
        variant: { type: mongoose.Schema.Types.ObjectId,
        ref: 'Variant', 
        required: true
        },
        variantAttribute: { type: mongoose.Schema.Types.ObjectId, 
        ref: 'VariantAttribute', 
        required: true 
        }
    }],
    price: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    finalPrice: {
        type: Number,
        required: true
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    shortDescription: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Product', productSchema)