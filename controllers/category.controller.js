const Category = require('../models/category.model')

// Helper function to build tree structure for comboTree plugin
const buildCategoryDropdownTree = (categories) => {
    // First, build the hierarchical tree structure
    const buildTree = (parentId = null) => {
        return categories
            .filter(cat => {
                if (parentId === null) {
                    return !cat.parent;
                }
                return cat.parent && cat.parent._id && cat.parent._id.toString() === parentId.toString();
            })
            .map(category => {
                const children = buildTree(category._id);
                const treeNode = {
                    id: category._id.toString(),
                    title: category.name,
                    isSelectable: true
                };
                
                if (children.length > 0) {
                    treeNode.subs = children;
                }
                
                return treeNode;
            });
    };
    
    return buildTree();
};

// Show create category form
exports.createCategoryForm = async (req, res) => {
    try {
        // Get all categories for parent dropdown
        const allCategories = await Category.find().select('name _id parent').populate('parent', 'name')
        
        // Build simple dropdown structure
        const categoryTree = buildCategoryDropdownTree(allCategories)

        res.render('categories/create', {
            title: 'Add Category',
            categoryTree: categoryTree,
            error: req.query.error
        })
    } catch(err) {
        console.error(err)
        res.render('categories/create', { 
            title: 'Add Category',
            categoryTree: [],
            error: 'Error loading form'
        })
    }
}

exports.createCategory = async (req, res) => {
    try {
        const { name, status, parent } = req.body
        
        if (!name) {
            const allCategories = await Category.find().select('name _id parent').populate('parent', 'name')
            const categoryTree = buildCategoryDropdownTree(allCategories)
            return res.render('categories/create', { 
                title: 'Add Category',
                categoryTree: categoryTree,
                error: 'Category name is required'
            })
        }
        
        // Check if category already exists
        const existingCategory = await Category.findOne({ name: name.trim() })
        if (existingCategory) {
            const allCategories = await Category.find().select('name _id parent').populate('parent', 'name')
            const categoryTree = buildCategoryDropdownTree(allCategories)
            return res.render('categories/create', { 
                title: 'Add Category',
                categoryTree: categoryTree,
                error: 'Category with this name already exists'
            })
        }

        const categoryData = {
            name: name.trim(),
            status: status || 'active',
            parent: parent && parent !== '' ? parent : null //(parent && parent !== '')  ye condition true hogi to parent set hoga, nahi to null
        }
        
        const category = new Category(categoryData)
        await category.save()
        
        // Redirect to categories list with success message
        res.redirect('/admin/user/categories/list?success=' + encodeURIComponent('Category created successfully'))
    } catch(err) {
        console.error(err)
        const allCategories = await Category.find().select('name _id parent').populate('parent', 'name')
        const categoryTree = buildCategoryDropdownTree(allCategories)
        res.render('categories/create', { 
            title: 'Add Category',
            categoryTree: categoryTree,
            error: 'Error creating category'
        })
    }
}

// Helper function to build category hierarchy path
const buildCategoryPath = (category, categories) => {
    const path = []
    let current = category
    
    // Build path from current category to root
    while (current) {
        path.unshift(current.name)
        if (current.parent && current.parent._id) {
            current = categories.find(cat => cat._id.toString() === current.parent._id.toString())
        } else {
            current = null
        }
    }
    
    return path.join(' → ')
}

exports.listCategory = async (req, res) => {
    try {
        // Sort by createdAt descending (newest first)
        const categories = await Category.find().populate('parent', 'name').sort({ createdAt: -1 })
        
        // Add hierarchy path to each category
        const categoriesWithPath = categories.map(category => ({
            ...category.toObject(),
            hierarchyPath: buildCategoryPath(category, categories)
        }))
        
        res.render('categories/list', { 
            title: 'All Categories',
            categories: categoriesWithPath,
            success: req.query.success,
            error: req.query.error
        })
    } catch(err) {
        console.error(err)
        res.render('categories/list', { 
            title: 'All Categories',
            categories: [],
            error: 'Error loading categories'
        })
    }
}
