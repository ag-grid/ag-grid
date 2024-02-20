"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAutoGroupHierarchy = exports.createCategoryHierarchy = exports.CATEGORY_LABEL_KEY = void 0;
exports.CATEGORY_LABEL_KEY = 'AG-GRID-DEFAULT-LABEL-KEY';
function createCategoryHierarchy(data, categoryKeys) {
    const hierarchy = buildNestedHierarchy(data, getItemDepth, getItemCategoryLabel);
    return formatCategoryHierarchy(hierarchy);
    function getItemDepth(item) {
        return categoryKeys.length;
    }
    function getItemCategoryLabel(item, categoryIndex) {
        const categoryKey = categoryKeys[categoryIndex];
        const categoryValue = item[categoryKey];
        return getCategoryLabel(categoryValue);
    }
    function getCategoryLabel(value) {
        if (value == null)
            return null;
        return String(value);
    }
}
exports.createCategoryHierarchy = createCategoryHierarchy;
function createAutoGroupHierarchy(data, getItemLabels) {
    const hierarchy = buildNestedHierarchy(data, getItemDepth, getItemGroupLabel);
    return formatCategoryHierarchy(hierarchy);
    function getItemDepth(item) {
        var _a, _b;
        return (_b = (_a = getItemLabels(item)) === null || _a === void 0 ? void 0 : _a.length) !== null && _b !== void 0 ? _b : 0;
    }
    function getItemGroupLabel(item, groupIndex) {
        const labels = getItemLabels(item);
        if (!labels)
            return null;
        // Autogroup label values are ordered from the leaf outwards
        const labelIndex = labels.length - 1 - groupIndex;
        return labels[labelIndex];
    }
}
exports.createAutoGroupHierarchy = createAutoGroupHierarchy;
/* Utility functions for building and formatting nested category hierarchies */
/** Convert an abstract nested hierarchy structure into an ag-charts-compatible 'category-grouped' data structure */
function formatCategoryHierarchy(hierarchy) {
    const { depth, leaves, children } = hierarchy;
    // If there are no remaining levels of nesting, return a flat list of leaves with no category labels
    if (depth === 0)
        return leaves.map((item) => (Object.assign({ [exports.CATEGORY_LABEL_KEY]: null }, item)));
    const results = new Array();
    // Push all branches and leaves into the result set, grouping results by the input tree hierarchy path
    for (const [key, childHierarchy] of children.entries()) {
        if (childHierarchy.depth === 0) {
            // If this the deepest parent level, return a flat list of child leaves with their respective category keys
            results.push(...childHierarchy.leaves.map((item) => (Object.assign({ [exports.CATEGORY_LABEL_KEY]: key }, item))));
        }
        else {
            // Otherwise nest the grouped data recursively (ignoring any leaves defined at the current parent level)
            results.push({ [exports.CATEGORY_LABEL_KEY]: key, children: formatCategoryHierarchy(childHierarchy) });
        }
    }
    return results;
}
/** Build an arbitrarily deeply nested hierarchy from a flat list of input items */
function buildNestedHierarchy(data, getItemDepth, getItemGroupKey) {
    const hierarchy = { depth: 0, leaves: [], children: new Map() };
    return data.reduce((hierarchy, item) => {
        const itemDepth = getItemDepth(item);
        const currentDepth = 0;
        return createNestedItemHierarchy(item, itemDepth, getItemGroupKey, currentDepth, hierarchy);
    }, hierarchy);
    function createNestedItemHierarchy(item, itemDepth, getItemGroupKey, currentDepth, hierarchy) {
        if (currentDepth === itemDepth) {
            hierarchy.leaves.push(item);
            return hierarchy;
        }
        else {
            const key = getItemGroupKey(item, currentDepth);
            const existingChildHierarchy = hierarchy.children.get(key);
            const childHierarchy = createNestedItemHierarchy(item, itemDepth, getItemGroupKey, currentDepth + 1, existingChildHierarchy || { depth: 0, leaves: [], children: new Map() });
            hierarchy.children.set(key, childHierarchy);
            hierarchy.depth = Math.max(1 + childHierarchy.depth, hierarchy.depth);
            return hierarchy;
        }
    }
}
