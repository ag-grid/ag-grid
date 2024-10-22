export type CATEGORY_LABEL_KEY = 'AG-GRID-DEFAULT-LABEL-KEY';
export const CATEGORY_LABEL_KEY: CATEGORY_LABEL_KEY = 'AG-GRID-DEFAULT-LABEL-KEY';

export type CategoryItem<T extends object> = {
    [CATEGORY_LABEL_KEY]: string | null;
    children?: Array<CategoryItem<T>>;
} & T;

export function createCategoryHierarchy<T extends object>(data: T[], categoryKeys: Array<keyof T>): CategoryItem<T>[] {
    const hierarchy = buildNestedHierarchy(data, getItemDepth, getItemCategoryLabel);
    return formatCategoryHierarchy(hierarchy);

    function getItemDepth(_item: T) {
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
): CategoryItem<T>[] {
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
    hierarchy: Tree<T>,
    key: string | null = null,
    isChild?: boolean
): CategoryItem<T>[] {
    const { depth, rootValues, value, children: inputChildren } = hierarchy;
    if (rootValues) {
        return rootValues.map((item) => ({ [CATEGORY_LABEL_KEY]: key, ...item }));
    } else if (depth === 0) {
        return [{ [CATEGORY_LABEL_KEY]: key, ...value! }];
    }

    const children: CategoryItem<T>[] = [];
    for (const [childKey, childHierarchy] of inputChildren.entries()) {
        children.push(...formatCategoryHierarchy(childHierarchy, childKey, true));
    }

    return isChild
        ? [
              {
                  [CATEGORY_LABEL_KEY]: key,
                  children,
                  ...(value ?? ({} as T)),
              },
          ]
        : children;
}

/** Data structure that represents an arbitrarily deeply nested tree of keyed values */
type Tree<V> = {
    /** Number of child levels nested within this path of the tree (leaves do not count towards the depth) */
    depth: number;
    rootValues?: V[];
    value?: V;
    /** Child levels contained within this path of the tree, grouped by child key */
    children: Map<string | null, Tree<V>>;
};

/** Build an arbitrarily deeply nested hierarchy from a flat list of input items */
function buildNestedHierarchy<V extends object>(
    data: V[],
    getItemDepth: (item: V) => number,
    getItemGroupKey: (item: V, depthIndex: number) => string | null
): Tree<V> {
    const hierarchy: Tree<V> = { depth: 0, children: new Map() };
    data.forEach((item) => {
        const itemDepth = getItemDepth(item);
        createNestedItemHierarchy(item, itemDepth, getItemGroupKey, 0, hierarchy);
    });
    return hierarchy;

    function createNestedItemHierarchy(
        item: V,
        itemDepth: number,
        getItemGroupKey: (item: V, depthIndex: number) => string | null,
        currentDepth: number,
        hierarchy: Tree<V>
    ): Tree<V> {
        if (currentDepth === itemDepth) {
            if (currentDepth === 0) {
                if (!hierarchy.rootValues) {
                    hierarchy.rootValues = [];
                }
                hierarchy.rootValues.push(item);
            } else {
                hierarchy.value = item;
            }
            return hierarchy;
        } else {
            const key = getItemGroupKey(item, currentDepth);
            const existingChildHierarchy = hierarchy.children.get(key);
            const childHierarchy = createNestedItemHierarchy(
                item,
                itemDepth,
                getItemGroupKey,
                currentDepth + 1,
                existingChildHierarchy || { depth: 0, children: new Map() }
            );
            hierarchy.children.set(key, childHierarchy);
            hierarchy.depth = Math.max(1 + childHierarchy.depth, hierarchy.depth);
            return hierarchy;
        }
    }
}
