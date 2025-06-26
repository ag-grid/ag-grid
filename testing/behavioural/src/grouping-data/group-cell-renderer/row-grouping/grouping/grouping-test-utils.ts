import type { GridOptions } from 'ag-grid-community';

import type { TestPermutation } from '../../util';
import {
    findSnapshotter,
    getExpandedConcern,
    getGridOptions_checkboxes as sharedGetGridOptions_checkboxes,
    getGridOptions_colDefInnerRendererGroupCol as sharedGetGridOptions_correctValue_colDefInnerRendererGroupCol,
    getGridOptions_correctValue_defaultRenderer as sharedGetGridOptions_correctValue_defaultRenderer,
    getGridOptions_correctValue_innerRenderer as sharedGetGridOptions_correctValue_innerRenderer,
    getGridOptions_masterDetail as sharedGetGridOptions_masterDetail,
    getGridOptions_pivot as sharedGetGridOptions_pivot,
    getGridOptions_suppressCount as sharedGetGridOptions_suppressCount,
    getTestConcerns_grouping_checkboxes,
    getTestConcerns_grouping_correctRenderer,
    getTestConcerns_grouping_correctValue,
    getTestConcerns_grouping_masterDetail,
    getTestConcerns_grouping_pivot,
    getTestConcerns_grouping_suppressCount,
    groupCellSnapshotter,
} from '../../shared-test-utils';

// Re-export commonly used functions
export { findSnapshotter, getExpandedConcern, groupCellSnapshotter };

// Export functions with original names for backward compatibility
export function getTestConcerns_masterDetail(gridOptions: GridOptions): TestPermutation[] {
    return getTestConcerns_grouping_masterDetail(gridOptions);
}

export function getGridOptions_masterDetail(gridOptions: GridOptions): GridOptions {
    return sharedGetGridOptions_masterDetail(gridOptions);
}

export function getTestConcerns_pivot(gridOptions: GridOptions): TestPermutation[] {
    return getTestConcerns_grouping_pivot(gridOptions);
}

export function getGridOptions_pivot(gridOptions: GridOptions): GridOptions {
    return sharedGetGridOptions_pivot(gridOptions);
}

export function getTestConcerns_correctRenderer(gridOptions: GridOptions): TestPermutation[] {
    // Grouping supports groupRows, so include it (default behavior)
    return getTestConcerns_grouping_correctRenderer(gridOptions, true);
}

export function getGridOptions_correctRenderer(gridOptions: GridOptions): GridOptions {
    return { ...gridOptions };
}

export function getTestConcerns_correctValue(gridOptions: GridOptions): TestPermutation[] {
    // Grouping supports groupRows, so include it (default behavior)
    return getTestConcerns_grouping_correctValue(gridOptions, true);
}

export function getGridOptions_correctValue_defaultRenderer(gridOptions: GridOptions): GridOptions {
    return sharedGetGridOptions_correctValue_defaultRenderer(gridOptions);
}

export function getGridOptions_correctValue_innerRenderer(gridOptions: GridOptions): GridOptions {
    return sharedGetGridOptions_correctValue_innerRenderer(gridOptions);
}

export function getGridOptions_correctValue_colDefInnerRendererGroupCol(gridOptions: GridOptions) {
    return sharedGetGridOptions_correctValue_colDefInnerRendererGroupCol(gridOptions);
}

export function getTestConcerns_suppressCount(gridOptions: GridOptions): TestPermutation[] {
    return getTestConcerns_grouping_suppressCount(gridOptions);
}

export function getGridOptions_suppressCount(gridOptions: GridOptions): GridOptions {
    return sharedGetGridOptions_suppressCount(gridOptions);
}

export function getTestConcerns_checkboxes(gridOptions: GridOptions): TestPermutation[] {
    return getTestConcerns_grouping_checkboxes(gridOptions);
}

export function getGridOptions_checkboxes(gridOptions: GridOptions): GridOptions {
    return sharedGetGridOptions_checkboxes(gridOptions);
}
