const Category = require('../models/category.model')
const buildCategoryDropdownTree = require('../utils/categoryDropdownTree')

// Helper function to build tree structure for comboTree plugin
// const buildCategoryDropdownTree = (categories) => {
//     // First, build the hierarchical tree structure
//     const buildTree = (parentId = null) => {
//         return categories
//             .filter(cat => {
//                 if (parentId === null) {
//                     return !cat.parent;
//                 }
//                 return cat.parent && cat.parent._id && cat.parent._id.toString() === parentId.toString();
//             })
//             .map(category => {
//                 const children = buildTree(category._id);
//                 const treeNode = {
//                     id: category._id.toString(),
//                     title: category.name,
//                     isSelectable: true
//                 };
                
//                 if (children.length > 0) {
//                     treeNode.subs = children;
//                 }
                
//                 return treeNode;
//             });
//     };
    
//     return buildTree();
// };

// Show create category form
exports.createCategoryForm = async (req, res) => {
    try {
        // Get all categories for parent dropdown
        const allCategories = await Category.find().select('name _id parent').populate('parent', 'name')
        
        // Build simple dropdown structure
        const categoryTree = buildCategoryDropdownTree(allCategories)
        // console.log("Category tree for dropdown:", categoryTree) // Debug log

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

////////////////////////////////////////------///////////////////////////////////////

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

exports.editCategoryForm = async (req, res) => {
    try {
        const categoryId = req.params.id
        
        // Get the category to edit
        const category = await Category.findById(categoryId).populate('parent', 'name')
        if (!category) {
            return res.redirect('/admin/user/categories/list?error=' + encodeURIComponent('Category not found'))
        }
        
        // Get all categories except the current one and its descendants for parent dropdown
        const allCategories = await Category.find({ _id: { $ne: categoryId } }).select('name _id parent').populate('parent', 'name')
        
        // Filter out descendants to prevent circular relationships
        const getDescendants = (parentId, categories) => {
            const descendants = []
            const children = categories.filter(cat => cat.parent && cat.parent._id.toString() === parentId.toString())
            children.forEach(child => {
                descendants.push(child._id.toString())
                descendants.push(...getDescendants(child._id, categories))
            })
            return descendants
        }
        
        const descendants = getDescendants(categoryId, allCategories)
        const validCategories = allCategories.filter(cat => !descendants.includes(cat._id.toString()))
        
        // Build category tree for dropdown
        const categoryTree = buildCategoryDropdownTree(validCategories)

        res.render('categories/edit', {
            title: 'Edit Category',
            category: category,
            categoryTree: categoryTree,
            error: req.query.error
        })
    } catch(err) {
        console.error(err)
        res.redirect('/admin/user/categories/list?error=' + encodeURIComponent('Error loading edit form'))
    }
}

exports.editCategory = async (req, res) => {
    try {
        const categoryId = req.params.id
        const { name, status, parent } = req.body
        
        if (!name) {
            return res.redirect(`/admin/user/categories/edit/${categoryId}?error=` + encodeURIComponent('Category name is required'))
        }
        
        // Check if category exists
        const category = await Category.findById(categoryId)
        if (!category) {
            return res.redirect('/admin/user/categories/list?error=' + encodeURIComponent('Category not found'))
        }
        
        // Check if another category with this name already exists (excluding current category)
        const existingCategory = await Category.findOne({ 
            name: name.trim(), 
            _id: { $ne: categoryId } 
        })
        if (existingCategory) {
            return res.redirect(`/admin/user/categories/edit/${categoryId}?error=` + encodeURIComponent('Category with this name already exists'))
        }

        // Validate parent selection (prevent circular relationships)
        if (parent && parent !== '') {
            const parentCategory = await Category.findById(parent)
            if (!parentCategory) {
                return res.redirect(`/admin/user/categories/edit/${categoryId}?error=` + encodeURIComponent('Selected parent category not found'))
            }
            
            // Check if the selected parent is a descendant of current category
            const checkCircularReference = async (checkId, targetId) => {
                if (checkId.toString() === targetId.toString()) {
                    return true
                }
                const cat = await Category.findById(checkId).populate('parent')
                if (cat && cat.parent) {
                    return await checkCircularReference(cat.parent._id, targetId)
                }
                return false
            }
            
            const isCircular = await checkCircularReference(parent, categoryId)
            if (isCircular) {
                return res.redirect(`/admin/user/categories/edit/${categoryId}?error=` + encodeURIComponent('Cannot set a descendant category as parent'))
            }
        }

        // Update category
        const updateData = {
            name: name.trim(),
            status: status || 'active',
            parent: parent && parent !== '' ? parent : null,
            updatedAt: new Date()
        }
        
        await Category.findByIdAndUpdate(categoryId, updateData)
        
        res.redirect('/admin/user/categories/list?success=' + encodeURIComponent('Category updated successfully'))
    } catch(err) {
        console.error(err)
        res.redirect(`/admin/user/categories/edit/${req.params.id}?error=` + encodeURIComponent('Error updating category'))
    }
}

exports.deleteCategory = async (req, res) => {
    try {
        const categoryId = req.params.id
        
        // Check if category exists
        const category = await Category.findById(categoryId)
        if (!category) {
            return res.redirect('/admin/user/categories/list?error=' + encodeURIComponent('Category not found'))
        }
        
        // Check if category has children
        const hasChildren = await Category.findOne({ parent: categoryId })
        if (hasChildren) {
            return res.redirect('/admin/user/categories/list?error=' + encodeURIComponent('Cannot delete category that has subcategories'))
        }
        
        // Check if category is used by products (if you have products model)
        // const hasProducts = await Product.findOne({ category: categoryId })
        // if (hasProducts) {
        //     return res.redirect('/admin/user/categories/list?error=' + encodeURIComponent('Cannot delete category that has products'))
        // }
        
        // Delete the category
        await Category.findByIdAndDelete(categoryId)
        
        res.redirect('/admin/user/categories/list?success=' + encodeURIComponent('Category deleted successfully'))
    } catch(err) {
        console.error(err)
        res.redirect('/admin/user/categories/list?error=' + encodeURIComponent('Error deleting category'))
    }
}
