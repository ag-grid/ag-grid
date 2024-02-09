import {partition} from '../../utils/array';

export type CATEGORY_LABEL_KEY = 'AG-GRID-DEFAULT-LABEL-KEY';
export const CATEGORY_LABEL_KEY: CATEGORY_LABEL_KEY = 'AG-GRID-DEFAULT-LABEL-KEY';

export interface CategoryGroup<T extends object> {
    [CATEGORY_LABEL_KEY]: string;
    children: Array<CategoryGroup<T>> | Array<CategoryItem<T>>;
}

export type CategoryItem<T extends object> = {
    [CATEGORY_LABEL_KEY]: string | null;
} & T;

export function createCategoryHierarchy<T extends object>(
    data: T[],
    categoryKeys: Array<keyof T>
): Array<CategoryGroup<T>> | Array<CategoryItem<T>> {
    // If there are no categories, return a flat list of leaves with no category labels
    if (categoryKeys.length === 0) return data.map((item) => ({ [CATEGORY_LABEL_KEY]: null, ...item }));
    const [key, ...remainingKeys] = categoryKeys;
    // If this is the deepest category level, return a flat list of leaves with their respective category keys
    if (remainingKeys.length === 0) return data.map((item) => ({ [CATEGORY_LABEL_KEY]: String(item[key]), ...item }));
    // Otherwise nest the data recursively, grouping by the value corresponding to the current category level key
    const groupedData = partition(data, (item) => item[key]);
    return Array.from(groupedData.entries()).map(([labelValue, items]) => ({
        [CATEGORY_LABEL_KEY]: String(labelValue),
        children: createCategoryHierarchy(items, remainingKeys),
    }));
}
