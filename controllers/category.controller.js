const Category = require('../models/category.model')

// Helper function to build category tree (DSA - Tree concept - Hierarchical structure)
const buildCategoryTree = (categories, parentId = null, depth = 0) => {
    const tree = []
    
    categories
        .filter(cat => {
            if (parentId === null) {
                return !cat.parent
            }
            return cat.parent && cat.parent._id && cat.parent._id.toString() === parentId.toString()
        })
        .forEach(category => {
            const categoryObj = {
                ...category.toObject(),
                depth,
                children: buildCategoryTree(categories, category._id, depth + 1)
            }
            tree.push(categoryObj)
        })
    
    return tree
}

// Helper function to flatten tree for display(DSA - Tree concept - Flattening)
const flattenCategoryTree = (tree) => {
    const flattened = []
    
    const traverse = (nodes) => {
        nodes.forEach(node => {
            flattened.push(node)
            if (node.children && node.children.length > 0) {
                traverse(node.children)
            }
        })
    }
    
    traverse(tree)
    return flattened
}

// Show create category form
exports.createCategoryForm = async (req, res) => {
    try {
        // Get all categories for parent dropdown (only root categories initially)
        const parentCategories = await Category.find().select('name _id parent').populate('parent', 'name')
        
        res.render('categories/create', { //jab user browser me /admin/user/categories/create tak phochta hai to yaha se category create form render hota hai
            title: 'Add Category',
            parentCategories,
            error: req.query.error
        })
    } catch(err) {
        console.error(err)
        res.render('categories/create', { 
            title: 'Add Category',
            parentCategories: [],
            error: 'Error loading form'
        })
    }
}

exports.createCategory = async (req, res) =>{
    try {
        const { name, description, status, parent } = req.body
        if (!name) {
            const parentCategories = await Category.find().select('name _id parent').populate('parent', 'name')
            return res.render('categories/create', { 
                title: 'Add Category',
                parentCategories,
                error: 'Category name is required'
            })
        }
        
        const categoryData = {
            name: name.trim(),
            description: description || '',
            status: status || 'active',
            parent: parent && parent !== '' ? parent : null
        }
        
        const category = new Category(categoryData)
        await category.save()
        
        // Redirect to categories list with success message
        res.redirect('/admin/user/categories?success=' + encodeURIComponent('Category created successfully'))
    }catch(err) {
        console.error(err)
        const parentCategories = await Category.find().select('name _id parent').populate('parent', 'name')
        if (err.code === 11000) {
            // Duplicate key error
            res.render('categories/create', { 
                title: 'Add Category',
                parentCategories,
                error: 'Category name already exists'
            })
        } else {
            res.render('categories/create', { 
                title: 'Add Category',
                parentCategories,
                error: 'Error creating category'
            })
        }
    }
}

exports.listCategory = async (req, res) =>{
    try {
        const categories = await Category.find().populate('parent', 'name').sort({ name: 1 })
        
        // Build hierarchical structure
        const categoryTree = buildCategoryTree(categories)
        const flatCategories = flattenCategoryTree(categoryTree)
        // res.status(200).json({
        //     message: 'Categories fetched successfully',
        //     categories: categories
        // })
        
        res.render('categories/list', { 
            title: 'All Categories',
            categories: flatCategories,
            success: req.query.success,
            error: req.query.error
        })
    }catch(err) {
        console.error(err)
        res.render('categories/list', { 
            title: 'All Categories',
            categories: [],
            error: 'Error loading categories'
        })
    }
}

// Show edit category form
exports.editCategoryForm = async (req, res) => {
    try {
        const {id} = req.params
        const category = await Category.findById(id).populate('parent', 'name')
        
        if (!category) {
            return res.redirect('/admin/user/categories?error=' +  ('Category not found'))
        }
        
        // Get all categories for parent dropdown (excluding current category and its descendants)
        const allCategories = await Category.find().populate('parent', 'name')
        
        // Function to get all descendant IDs
        const getDescendantIds = (categoryId, categories) => {
            const descendants = []
            const findChildren = (parentId) => {
                categories.forEach(cat => {
                    if (cat.parent && cat.parent._id && cat.parent._id.toString() === parentId.toString()) {
                        descendants.push(cat._id.toString())
                        findChildren(cat._id.toString())
                    }
                })
            }
            findChildren(categoryId)
            return descendants
        }
        
        const descendantIds = getDescendantIds(id, allCategories)
        const excludeIds = [id, ...descendantIds]
        
        const parentCategories = allCategories.filter(cat => 
            !excludeIds.includes(cat._id.toString())
        )
        
        res.render('categories/edit', { 
            title: 'Edit Category',
            category,
            parentCategories,
            error: req.query.error
        })
    } catch(err) {
        console.error(err)
        res.redirect('/admin/user/categories?error=' + encodeURIComponent('Error loading category'))
    }
}

exports.editCategory = async (req, res) =>{
    try {
        const {id} = req.params
        const {name, description, status, parent} = req.body
        
        if(!name) {
            return res.redirect(`/admin/user/categories/edit/${id}?error=` + encodeURIComponent('Category name is required'))
        }
        
        const updateData = {
            name: name.trim(),
            description: description || '',
            status: status || 'active',
            parent: parent && parent !== '' ? parent : null
        }
        
        const category = await Category.findByIdAndUpdate(id, updateData, {new: true})
        
        if (!category) {
            return res.redirect('/admin/user/categories?error=' + encodeURIComponent('Category not found'))
        }
        
        res.redirect('/admin/user/categories?success=' + encodeURIComponent('Category updated successfully'))
    }catch(err) {
        console.error(err)
        if (err.code === 11000) {
            res.redirect(`/admin/user/categories/edit/${req.params.id}?error=` + encodeURIComponent('Category name already exists'))
        } else {
            res.redirect(`/admin/user/categories/edit/${req.params.id}?error=` + encodeURIComponent('Error updating category'))
        }
    }
}

exports.deleteCategory = async (req, res) =>{
    try {
        const {id} = req.params
        
        // Check if category has children
        const hasChildren = await Category.findOne({ parent: id })
        if (hasChildren) {
            return res.redirect('/admin/user/categories?error=' + encodeURIComponent('Cannot delete category that has subcategories. Please delete subcategories first.'))
        }
        
        const category = await Category.findByIdAndDelete(id)
        
        if (!category) {
            return res.redirect('/admin/user/categories?error=' + encodeURIComponent('Category not found'))
        }
        
        res.redirect('/admin/user/categories?success=' + encodeURIComponent('Category deleted successfully'))
    }catch(err) {
        console.error(err)
        res.redirect('/admin/user/categories?error=' + encodeURIComponent('Error deleting category'))
    }
}
