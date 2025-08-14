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

module.exports = buildCategoryDropdownTree;
