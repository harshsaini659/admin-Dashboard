require('dotenv').config()
const mongoose = require('mongoose')
const Variant = require('../models/productVariant.model')

async function cleanupDuplicateVariants() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI)
        console.log('Connected to MongoDB')

        // Find all variants
        const variants = await Variant.find().sort({ createdAt: 1 })
        console.log(`Found ${variants.length} variants`)

        const seenNames = new Set()
        const duplicatesToDelete = []

        // Identify duplicates (keep the first one created)
        for (const variant of variants) {
            const normalizedName = variant.name.toLowerCase().trim()
            
            if (seenNames.has(normalizedName)) {
                duplicatesToDelete.push(variant._id)
                console.log(`Duplicate found: "${variant.name}" (ID: ${variant._id})`)
            } else {
                seenNames.add(normalizedName)
            }
        }

        if (duplicatesToDelete.length > 0) {
            console.log(`\nDeleting ${duplicatesToDelete.length} duplicate variants...`)
            
            const result = await Variant.deleteMany({ _id: { $in: duplicatesToDelete } })
            console.log(`Successfully deleted ${result.deletedCount} duplicate variants`)
        } else {
            console.log('No duplicate variants found')
        }

        // Now create the unique index
        try {
            await Variant.collection.createIndex({ name: 1 }, { unique: true, sparse: true })
            console.log('Unique index created successfully')
        } catch (indexError) {
            if (indexError.code === 11000) {
                console.log('Unique index already exists')
            } else {
                console.error('Error creating unique index:', indexError)
            }
        }

        console.log('\nCleanup completed successfully!')
        
    } catch (error) {
        console.error('Error during cleanup:', error)
    } finally {
        await mongoose.disconnect()
        console.log('Disconnected from MongoDB')
    }
}

// Run the cleanup
cleanupDuplicateVariants()
