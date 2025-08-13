const VariantAtt = require('../models/productVariantAtt.model')
const ProductVariant = require('../models/productVariant.model')

// Show create variant form (for web interface)
exports.createVariantAttForm = async (req, res) => {
    try {
        // Fetch all active product variants for the dropdown
        const variants = await ProductVariant.find({ status: 'active' }).sort({ name: 1 })
        console.log("Fetched active variants:", variants) // Debug log
        
        res.render('variantAttributes/create', { 
            title: 'Add Product Variant Attribute',
            variants,
            error: req.query.error
        })
    } catch(err) {
        console.error(err)
        res.render('variantAttributes/create', { 
            title: 'Add Product Variant Attribute',
            variants: [],
            error: 'Error loading form'
        })
    }
}

// Create variant (API method - keep existing)
exports.createVariantAtt = async (req, res) => {
    try{
        const { name, variantName, status } = req.body

        console.log('Received data:', { name, variantName, status }) // Debug log

        if(!name || !variantName) {
            return res.status(400).json({ message: "Name and variant are required" })
        }

        const existingName = await VariantAtt.findOne({ name: name.trim().toLowerCase()})
        if(existingName) {
            return res.status(400).json({ message: "Variant attribute with this name already exists" })
        }

        const newVariantAtt = new VariantAtt({
            name: name.trim(), //trim is used to remove whitespaces
            variantName: variantName, // Reference to Product Variant
            status: status && status.trim() !== '' ? status : 'active' // Ensure status is set properly
        })

        const savedVariantAtt = await newVariantAtt.save()
        console.log('Saved variant attribute:', savedVariantAtt) // Debug log
        
        res.status(201).json({ message: "Variant attribute created successfully", variant: savedVariantAtt })
    }catch(err){
        console.error(err)
        if(err.code === 11000) {
            return res.status(400).json({ message: "Variant attribute name already exists" })
        }
        res.status(500).json({ message: "Server error" })
    }
}

// List variants (for web interface)
exports.listVariantAtt = async (req, res) => {
    try{
        const variants = await VariantAtt.find().populate('variantName', 'name')
        // console.log('Fetched variant attributes:', variants) // Debug log
        // res.status(200).json({
        //     message: "Variant attributes retrieved successfully",
        //     variants
        // })
        res.render('variantAttributes/list', {
            title: 'All Product Variant Attributes',
            variants,
            success: req.query.success,
            error: req.query.error
        })
    }catch(err){
        console.error(err)
        res.render('variantAttributes/list', { 
            title: 'All Product Variant Attributes',
            variants: [],
            error: 'Error loading variant attributes'
        })
    }
}

// Show edit variant form (for web interface)
exports.editVariantAttForm = async (req, res) => {
    try {
        const { id } = req.params
        const variant = await VariantAtt.findById(id).populate('variantName', 'name')
        
        if (!variant) {
            return res.redirect('/admin/user/variantAtt?error=' + encodeURIComponent('Variant attribute not found'))
        }

        // Fetch all active product variants for the dropdown
        const variants = await ProductVariant.find({ status: 'active' }).sort({ name: 1 })
        
        res.render('variantAttributes/edit', { 
            title: 'Edit Product Variant Attribute',
            variant,
            variants,
            error: req.query.error
        })
    } catch(err) {
        console.error(err)
        res.redirect('/admin/user/variantAtt?error=' + encodeURIComponent('Error loading variant attribute'))
    }
}

// Edit variant (API method - keep existing)
exports.editVariantAtt = async (req, res) => {
    try{
        const { id } = req.params
        const { name, variantName, status } = req.body

        console.log('Edit received data:', { name, variantName, status }) // Debug log

        if(!name || !variantName) {
            return res.status(400).json({ message: "Name and variant are required" })
        }

        // Check if another variant attribute with this name already exists (excluding current)
        const existingVariant = await VariantAtt.findOne({ 
            name: name.trim().toLowerCase(),
            _id: { $ne: id }
        })
        if(existingVariant) {
            return res.status(400).json({ message: "Another variant attribute with this name already exists" })
        }

        const updatedVariant = await VariantAtt.findByIdAndUpdate(
            id,
            {
                name: name.trim(),
                variantName: variantName,
                status: status && status.trim() !== '' ? status : 'active'
            },
            { new: true}
        )
        if (!updatedVariant) return res.status(404).json({ message: "Variant attribute not found" })
        
        console.log('Updated variant attribute:', updatedVariant) // Debug log
        
        res.status(200).json({ message: "Variant attribute updated successfully", variant: updatedVariant })
    }catch(err){
        console.error(err)
        if(err.code === 11000) {
            return res.status(400).json({ message: "Another variant attribute with this name already exists" })
        }
        res.status(500).json({ message: "Server error" })
    }
}

// Delete variant (API method - keep existing)
exports.deleteVariantAtt = async (req, res) => {
    try {
        const { id } = req.params
        const deletedVariant = await VariantAtt.findByIdAndDelete(id)
        if (!deletedVariant) return res.status(404).json({ message: "Variant attribute not found" })
        res.status(200).json({ message: "Variant attribute deleted successfully", variant: deletedVariant })
    }catch(err){
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
}