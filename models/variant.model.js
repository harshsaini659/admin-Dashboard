const mongoose = require('mongoose')

const variantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    value: {
        type: [],
        required: true,
    }
}, {
    timestamps: true
})

module.exports = mongoose.model('Variant', variantSchema)