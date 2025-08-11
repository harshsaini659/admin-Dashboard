const mongoose = require('mongoose')

const variantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})

variantSchema.virtual('attributes',{
    ref:'VariantAttribute',          //model ka naam jisse data lekar ana hai
    localField: '_id',              // _id variant ki id
    foreignField: 'variantName',    // variant attribute model ka field
    justOne: false                  // many attributes per variant
})

module.exports = mongoose.model('Variant', variantSchema)