import type { Column, RowNode } from 'ag-grid-community';

import type { GridRowsBugs } from './rows-validation/bugs';
import type { GridRowErrors, GridRowsErrorFilter } from './rows-validation/gridRowErrors';

export interface GridRowsDomCellValidatorParams {
    row: RowNode;
    column: Column;
    cellElement: HTMLElement;
    rowErrors: GridRowErrors;
}

export interface GridRowsDomRowValidatorParams {
    row: RowNode;
    rowElements: HTMLElement[];
    rowErrors: GridRowErrors;
}

export interface GridRowsOptions {
    /** If true, the DOM will be checked as well. Default is true. */
    checkDom?: boolean;

    /**
     * Columns to include when making the diagram. If true, or undefined, all columns will be included.
     * If an array, it must contain the id of the columns to include. Default is false, no columns.
     * Default is true. There is usually no need to defined this and can be useful only if you have way too many columns.
     */
    forcedColumns?: (string | Column)[] | boolean;

    /** If true, the diagram will show hidden rows, like the children of collapsed groups, also if they do not appear in the displayed rows. Default is true */
    printHiddenRows?: boolean;

    /** Forces treeData to be checked as true or false. There is usually no need to set this. */
    forcedTreeData?: boolean;

    /** Adds data field values to the snapshot, e.g. ['group'] -> data.group:"value" */
    nodeDataProps?: string[];

    /** If set to false, the formatter gets disabled when printing the rows. Default is true. */
    useFormatter?: boolean;

    /** Override known bug flags for this test. Merged with the defaults from `gridRowsBugs`. */
    bugs?: Partial<GridRowsBugs>;

    /**
     * Optional callback invoked before adding an error. Return false to suppress the error.
     * Useful for ignoring known issues in specific tests.
     */
    onError?: GridRowsErrorFilter;

    /**
     * Optional callback for custom DOM cell validation.
     * Called for each cell before default validation. Return false to skip the default cell validation.
     */
    domCellValidator?: (params: GridRowsDomCellValidatorParams) => boolean | void;

    /**
     * Optional callback for custom DOM row validation.
     * Called for each row before default validation. Return false to skip the default row validation.
     */
    domRowValidator?: (params: GridRowsDomRowValidatorParams) => boolean | void;

    /** If true, edit state will be included in diagrams and validated in DOM. Auto-detected from edit module presence if not set. */
    checkEditState?: boolean;

    /** If true, batch edit state will be included in diagrams. Auto-detected from batch edit module presence if not set. */
    checkBatchState?: boolean;
}
