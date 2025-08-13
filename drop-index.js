const mongoose = require('mongoose')

async function dropSlugIndex() {
    try {
        // Connect to MongoDB
        await mongoose.connect('mongodb://127.0.0.1:27017/admin-dashboard')
        console.log('Connected to MongoDB')
        
        // Drop the slug index
        await mongoose.connection.db.collection('products').dropIndex('slug_1')
        console.log('✅ Slug index dropped successfully!')
        
    } catch (err) {
        if (err.code === 27) {
            console.log('✅ Index not found (already dropped)')
        } else {
            console.log('❌ Error:', err.message)
        }
    } finally {
        await mongoose.disconnect()
        console.log('Disconnected from MongoDB')
        process.exit(0)
    }
}

dropSlugIndex()
