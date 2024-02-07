import {partition} from '../../utils/array';

export type CATEGORY_LABEL_KEY = 'AG-GRID-DEFAULT-LABEL-KEY';
export const CATEGORY_LABEL_KEY: CATEGORY_LABEL_KEY = 'AG-GRID-DEFAULT-LABEL-KEY';

export interface CategoryGroup<T extends object, K extends keyof T> {
    [CATEGORY_LABEL_KEY]: T[K];
    children: Array<CategoryGroup<T, K>> | Array<CategoryItem<T, K>>;
}

export type CategoryItem<T extends object, K extends keyof T> = {
    [CATEGORY_LABEL_KEY]: T[K] | null;
} & T;

export function createCategoryHierarchy<T extends object, K extends keyof T>(
    data: T[],
    categoryKeys: Array<K>
): Array<CategoryGroup<T, K>> | Array<CategoryItem<T, K>> {
    // If there are no categories, return a flat list of leaves with no category labels
    if (categoryKeys.length === 0) return data.map((item) => ({ [CATEGORY_LABEL_KEY]: null, ...item }));
    const [key, ...remainingKeys] = categoryKeys;
    // If this is the deepest category level, return a flat list of leaves with their respective category keys
    if (remainingKeys.length === 0) return data.map((item) => ({ [CATEGORY_LABEL_KEY]: item[key], ...item }));
    // Otherwise nest the data recursively, grouping by the value corresponding to the current category level key
    const groupedData = partition(data, (item) => item[key]);
    return Array.from(groupedData.entries()).map(([labelValue, items]) => ({
        [CATEGORY_LABEL_KEY]: labelValue,
        children: createCategoryHierarchy<T, K>(items, remainingKeys),
    }));
}
