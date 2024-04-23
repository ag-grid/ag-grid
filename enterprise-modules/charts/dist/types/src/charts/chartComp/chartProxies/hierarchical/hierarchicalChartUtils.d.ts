export type CATEGORY_LABEL_KEY = 'AG-GRID-DEFAULT-LABEL-KEY';
export declare const CATEGORY_LABEL_KEY: CATEGORY_LABEL_KEY;
export type CategoryItem<T extends object> = {
    [CATEGORY_LABEL_KEY]: string | null;
    children?: Array<CategoryItem<T>>;
} & T;
export declare function createCategoryHierarchy<T extends object>(data: T[], categoryKeys: Array<keyof T>): CategoryItem<T>[];
export declare function createAutoGroupHierarchy<T extends object>(data: T[], getItemLabels: (item: T) => string[] | null): CategoryItem<T>[];
