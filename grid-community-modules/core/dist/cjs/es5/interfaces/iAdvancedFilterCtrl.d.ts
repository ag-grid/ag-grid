// Type definitions for @ag-grid-community/core v30.2.1
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export interface IAdvancedFilterCtrl {
    setupHeaderComp(eCompToInsertBefore: HTMLElement): void;
    focusHeaderComp(): boolean;
    getHeaderHeight(): number;
    toggleFilterBuilder(source: 'api' | 'ui', force?: boolean): void;
}
