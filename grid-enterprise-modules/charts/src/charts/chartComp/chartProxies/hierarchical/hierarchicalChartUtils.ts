export type CATEGORY_LABEL_KEY = 'AG-GRID-DEFAULT-LABEL-KEY';
export const CATEGORY_LABEL_KEY: CATEGORY_LABEL_KEY = 'AG-GRID-DEFAULT-LABEL-KEY';

export interface CategoryGroup<T extends object> {
    [CATEGORY_LABEL_KEY]: string | null;
    children: Array<CategoryGroup<T> | CategoryItem<T>>;
}

export type CategoryItem<T extends object> = {
    [CATEGORY_LABEL_KEY]: string | null;
} & T;

export function createCategoryHierarchy<T extends object>(
    data: T[],
    categoryKeys: Array<keyof T>
): Array<CategoryGroup<T> | CategoryItem<T>> {
    const hierarchy = buildNestedHierarchy(data, getItemDepth, getItemCategoryLabel);
    return formatCategoryHierarchy(hierarchy);

    function getItemDepth(item: T) {
        return categoryKeys.length;
    }

    function getItemCategoryLabel(item: T, categoryIndex: number): string | null {
        const categoryKey = categoryKeys[categoryIndex];
        const categoryValue = item[categoryKey];
        return getCategoryLabel(categoryValue);
    }

    function getCategoryLabel(value: unknown): string | null {
        if (value == null) return null;
        return String(value);
    }
}

export function createAutoGroupHierarchy<T extends object>(
    data: T[],
    getItemLabels: (item: T) => string[] | null
): Array<CategoryGroup<T> | CategoryItem<T>> {
    const hierarchy = buildNestedHierarchy(data, getItemDepth, getItemGroupLabel);
    return formatCategoryHierarchy(hierarchy);

    function getItemDepth(item: T) {
        return getItemLabels(item)?.length ?? 0;
    }

    function getItemGroupLabel(item: T, groupIndex: number): string | null {
        const labels = getItemLabels(item);
        if (!labels) return null;
        // Autogroup label values are ordered from the leaf outwards
        const labelIndex = labels.length - 1 - groupIndex;
        return labels[labelIndex];
    }
}

/* Utility functions for building and formatting nested category hierarchies */

/** Convert an abstract nested hierarchy structure into an ag-charts-compatible 'category-grouped' data structure */
function formatCategoryHierarchy<T extends object>(
    hierarchy: Tree<string | null, T>
): Array<CategoryGroup<T> | CategoryItem<T>> {
    const { depth, leaves, children } = hierarchy;
    // If there are no remaining levels of nesting, return a flat list of leaves with no category labels
    if (depth === 0) return leaves.map((item) => ({ [CATEGORY_LABEL_KEY]: null, ...item }));
    const results = new Array<CategoryGroup<T> | CategoryItem<T>>();
    // Push all branches and leaves into the result set, grouping results by the input tree hierarchy path
    for (const [key, childHierarchy] of children.entries()) {
        if (childHierarchy.depth === 0) {
            // If this the deepest parent level, return a flat list of child leaves with their respective category keys
            results.push(...childHierarchy.leaves.map((item) => ({ [CATEGORY_LABEL_KEY]: key, ...item })));
        } else {
            // Otherwise nest the grouped data recursively (ignoring any leaves defined at the current parent level)
            results.push({ [CATEGORY_LABEL_KEY]: key, children: formatCategoryHierarchy(childHierarchy) });
        }
    }
    return results;
}

/** Data structure that represents an arbitrarily deeply nested tree of keyed values */
type Tree<K, V> = {
    /** Number of child levels nested within this path of the tree (leaves do not count towards the depth) */
    depth: number;
    /** Items defined at this path within the tree */
    leaves: V[];
    /** Child levels contained within this path of the tree, grouped by child key */
    children: Map<K, Tree<K, V>>;
};

/** Build an arbitrarily deeply nested hierarchy from a flat list of input items */
function buildNestedHierarchy<K, V extends object>(
    data: V[],
    getItemDepth: (item: V) => number,
    getItemGroupKey: (item: V, depthIndex: number) => K,
): Tree<K, V> {
    const hierarchy: Tree<K, V> = { depth: 0, leaves: [], children: new Map() };
    return data.reduce((hierarchy, item) => {
        const itemDepth = getItemDepth(item);
        const currentDepth = 0;
        return createNestedItemHierarchy(item, itemDepth, getItemGroupKey, currentDepth, hierarchy);
    }, hierarchy);

    function createNestedItemHierarchy(
        item: V,
        itemDepth: number,
        getItemGroupKey: (item: V, depthIndex: number) => K,
        currentDepth: number,
        hierarchy: Tree<K, V>
    ): Tree<K, V> {
        if (currentDepth === itemDepth) {
            hierarchy.leaves.push(item);
            return hierarchy;
        } else {
            const key = getItemGroupKey(item, currentDepth);
            const existingChildHierarchy = hierarchy.children.get(key);
            const childHierarchy = createNestedItemHierarchy(
                item,
                itemDepth,
                getItemGroupKey,
                currentDepth + 1,
                existingChildHierarchy || { depth: 0, leaves: [], children: new Map() }
            );
            hierarchy.children.set(key, childHierarchy);
            hierarchy.depth = Math.max(1 + childHierarchy.depth, hierarchy.depth);
            return hierarchy;
        }
    }
}
