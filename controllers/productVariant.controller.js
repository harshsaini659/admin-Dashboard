const Variant = require('../models/productVariant.model')

// Show create variant form (for web interface)
exports.createVariantForm = async (req, res) => {
    try {
        res.render('variants/create', { 
            title: 'Add Product Variant',
            error: req.query.error
        })
    } catch(err) {
        console.error(err)
        res.render('variants/create', { 
            title: 'Add Product Variant',
            error: 'Error loading form'
        })
    }
}

// Create variant (API method - keep existing)
exports.createVariant = async (req, res) => {
    try{
        const { name, status } = req.body
        
        console.log('Received data:', { name, status }) // Debug log
        
        if(!name) return res.status(400).json({ message: "Name is required" })

        // Check if variant with this name already exists
        const existingVariant = await Variant.findOne({ name: name.trim().toLowerCase() })
        if(existingVariant) {
            return res.status(400).json({ message: "Variant with this name already exists" })
        }

        const newVariant = new Variant({
            name: name.trim(), //trim is used to remove whitespaces
            status: status && status.trim() !== '' ? status : 'active' // Ensure status is set properly
        })

        const savedVariant = await newVariant.save()
        console.log('Saved variant:', savedVariant) // Debug log
        
        res.status(201).json({ message: "Variant created successfully", variant: savedVariant })
        // res.redirect('/admin/user/variants?success=' + encodeURIComponent('Variant created successfully'))
    }catch(err){
        console.error(err)
        if(err.code === 11000) {
            return res.status(400).json({ message: "Variant with this name already exists" })
        }
        res.status(500).json({ message: "Server error" })
    }
}

// List variants (for web interface)
exports.listVariant = async (req, res) => {
    try{
        const variants = await Variant.find()
        res.render('variants/list', { 
            title: 'All Product Variants',
            variants,
            success: req.query.success,
            error: req.query.error
        })
    }catch(err){
        console.error(err)
        res.render('variants/list', { 
            title: 'All Product Variants',
            variants: [],
            error: 'Error loading variants'
        })
    }
}

// Show edit variant form (for web interface)
exports.editVariantForm = async (req, res) => {
    try {
        const { id } = req.params
        const variant = await Variant.findById(id)
        
        if (!variant) {
            return res.redirect('/admin/user/variants?error=' + encodeURIComponent('Variant not found'))
        }
        
        res.render('variants/edit', { 
            title: 'Edit Product Variant',
            variant,
            error: req.query.error
        })
    } catch(err) {
        console.error(err)
        res.redirect('/admin/user/variants?error=' + encodeURIComponent('Error loading variant'))
    }
}

// Edit variant (API method - keep existing)
exports.editVariant = async (req, res) => {
    try{
        const { id } = req.params
        const { name, status } = req.body

        console.log('Edit received data:', { name, status }) // Debug log

        if(!name) return res.status(400).json({ message: "Name is required" })

        // Check if another variant with this name already exists (excluding current variant)
        const existingVariant = await Variant.findOne({ 
            name: name.trim().toLowerCase(),
            _id: { $ne: id }
        })
        if(existingVariant) {
            return res.status(400).json({ message: "Another variant with this name already exists" })
        }

        const updatedVariant = await Variant.findByIdAndUpdate(
            id,
            {
                name: name.trim(),
                status: status && status.trim() !== '' ? status : 'active' // Ensure status is set properly
            },
            { new: true}  //This option returns the updated document...
            //ye nahi lagaya to old data hi reflect hota api hit hone par 2nd time hit karne par new data dikhega
        )
        if (!updatedVariant) return res.status(404).json({ message: "Variant not found" })
        
        console.log('Updated variant:', updatedVariant) // Debug log
        
        res.status(200).json({ message: "Variant updated successfully", variant: updatedVariant })
    }catch(err){
        console.error(err)
        if(err.code === 11000) {
            return res.status(400).json({ message: "Another variant with this name already exists" })
        }
        res.status(500).json({ message: "Server error" })
    }
}

// Delete variant (API method - keep existing)
exports.deleteVariant = async (req, res) => {
    try {
        const { id } = req.params
        const deletedVariant = await Variant.findByIdAndDelete(id)
        if (!deletedVariant) return res.status(404).json({ message: "Variant not found" })
        res.status(200).json({ message: "Variant deleted successfully",variant: deletedVariant })
    }catch(err){
        console.error(err)
        res.status(500).json({ message: "Server error" })
    }
}
