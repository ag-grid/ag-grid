export declare type CATEGORY_LABEL_KEY = 'AG-GRID-DEFAULT-LABEL-KEY';
export declare const CATEGORY_LABEL_KEY: CATEGORY_LABEL_KEY;
export interface CategoryGroup<T extends object> {
    [CATEGORY_LABEL_KEY]: string | null;
    children: Array<CategoryGroup<T> | CategoryItem<T>>;
}
export declare type CategoryItem<T extends object> = {
    [CATEGORY_LABEL_KEY]: string | null;
} & T;
export declare function createCategoryHierarchy<T extends object>(data: T[], categoryKeys: Array<keyof T>): Array<CategoryGroup<T> | CategoryItem<T>>;
export declare function createAutoGroupHierarchy<T extends object>(data: T[], getItemLabels: (item: T) => string[] | null): Array<CategoryGroup<T> | CategoryItem<T>>;
