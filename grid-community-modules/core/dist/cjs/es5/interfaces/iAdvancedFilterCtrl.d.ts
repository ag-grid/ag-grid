// Type definitions for @ag-grid-community/core v31.0.0
// Project: https://www.ag-grid.com/
// Definitions by: Niall Crosby <https://github.com/ag-grid/>
export interface IAdvancedFilterCtrl {
    setupHeaderComp(eCompToInsertBefore: HTMLElement): void;
    focusHeaderComp(): boolean;
    getHeaderHeight(): number;
    toggleFilterBuilder(source: 'api' | 'ui', force?: boolean): void;
}
