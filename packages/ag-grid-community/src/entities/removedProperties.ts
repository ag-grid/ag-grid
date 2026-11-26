/**
 * Type of a property removed in a major version. Assigning a value fails to compile, and the error shows `Hint`
 * and a link to that version's upgrade guide.
 */
export type AgRemovedProperty<
    Version extends number,
    Hint extends string,
> = `Removed in AG Grid v${Version}. ${Hint} See https://www.ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-${Version}/`;

/**
 * Grid options removed in AG Grid v37. They are `protected` so that reading them also fails to compile, and so that
 * `keyof GridOptions` excludes them.
 * See https://www.ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-37/
 */
export declare class GridOptionsRemovedInV37 {
    /** @deprecated v37 Removed - Use `groupHideParentOfSingleChild: true` instead. */
    protected readonly groupRemoveSingleChildren?: AgRemovedProperty<
        37,
        'Use `groupHideParentOfSingleChild: true` instead.'
    >;
    /** @deprecated v37 Removed - Use `groupHideParentOfSingleChild: 'leafGroupsOnly'` instead. */
    protected readonly groupRemoveLowestSingleChildren?: AgRemovedProperty<
        37,
        "Use `groupHideParentOfSingleChild: 'leafGroupsOnly'` instead."
    >;
    /** @deprecated v37 Removed - Use `suppressGroupChangesColumnVisibility: 'suppressHideOnGroup'` instead. */
    protected readonly suppressRowGroupHidesColumns?: AgRemovedProperty<
        37,
        "Use `suppressGroupChangesColumnVisibility: 'suppressHideOnGroup'` instead."
    >;
    /** @deprecated v37 Removed - Use `suppressGroupChangesColumnVisibility: 'suppressShowOnUngroup'` instead. */
    protected readonly suppressMakeColumnVisibleAfterUnGroup?: AgRemovedProperty<
        37,
        "Use `suppressGroupChangesColumnVisibility: 'suppressShowOnUngroup'` instead."
    >;
    /** @deprecated v37 Removed - Use `defaultColDef.sortingOrder` instead. */
    protected readonly sortingOrder?: AgRemovedProperty<37, 'Use `defaultColDef.sortingOrder` instead.'>;
    /** @deprecated v37 Removed - Use `defaultColDef.unSortIcon` instead. */
    protected readonly unSortIcon?: AgRemovedProperty<37, 'Use `defaultColDef.unSortIcon` instead.'>;
    /** @deprecated v37 Removed - Put custom data in `context` instead. */
    protected readonly suppressPropertyNamesCheck?: AgRemovedProperty<37, 'Put custom data in `context` instead.'>;
    /** @deprecated v37 Removed - It had no effect, as the grid always uses the browser's `ResizeObserver`. */
    protected readonly suppressBrowserResizeObserver?: AgRemovedProperty<37, 'It had no effect and can be deleted.'>;
}

/**
 * Column definition properties removed in AG Grid v37. See `GridOptionsRemovedInV37`.
 * See https://www.ag-grid.com/javascript-data-grid/upgrading-to-ag-grid-37/
 */
export declare class ColDefRemovedInV37 {
    /** @deprecated v37 Removed - Use `groupHierarchy` instead. */
    protected readonly rowGroupingHierarchy?: AgRemovedProperty<37, 'Use `groupHierarchy` instead.'>;
}
