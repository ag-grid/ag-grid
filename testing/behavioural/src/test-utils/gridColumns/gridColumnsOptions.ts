import type { Column, ColumnGroup } from 'ag-grid-community';

import type { GridColumnErrors, GridColumnsErrorFilter } from './columns-validation/gridColumnErrors';

export interface GridColumnsDomColumnValidatorParams {
    column: Column;
    headerElement: HTMLElement;
    columnErrors: GridColumnErrors;
}

export interface GridColumnsDomGroupValidatorParams {
    group: ColumnGroup;
    headerElement: HTMLElement;
    columnErrors: GridColumnErrors;
}

export interface GridColumnsOptions {
    /** If true, the header DOM will be checked. Default is true. */
    checkDom?: boolean;

    /** If true, padding groups are shown in the diagram. Default is false. */
    showPaddingGroups?: boolean;

    /** Sections to include. Default: all non-empty sections. */
    sections?: ('left' | 'center' | 'right')[];

    /** If true, show children of collapsed groups in the diagram with a `hidden` flag. Default is true. */
    printHiddenColumns?: boolean;

    /** Override known bug flags for this test. */
    bugs?: Partial<GridColumnsBugs>;

    /** Optional callback invoked before adding an error. Return false to suppress the error. */
    onError?: GridColumnsErrorFilter;

    /** Optional callback for custom DOM column header validation. Return false to skip default validation. */
    domColumnValidator?: (params: GridColumnsDomColumnValidatorParams) => boolean | void;

    /** Optional callback for custom DOM group header validation. Return false to skip default validation. */
    domGroupValidator?: (params: GridColumnsDomGroupValidatorParams) => boolean | void;
}

export interface GridColumnsBugs {
    // Known bug flags that disable specific validators — add flags as bugs are discovered
}

export const gridColumnsBugs: Readonly<GridColumnsBugs> = Object.freeze({});
