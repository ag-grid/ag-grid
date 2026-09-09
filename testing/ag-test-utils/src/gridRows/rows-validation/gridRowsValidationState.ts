import type { AgColumn, GridApi } from 'ag-grid-community';

import type { GridRows } from '../gridRows';

export class GridRowsValidationState {
    private _showRowGroupColumns: AgColumn[] | undefined = undefined;
    private _groupSelectsDescendants: boolean | undefined = undefined;
    private _hasPostSortRows: boolean | undefined = undefined;

    public readonly gridRows: GridRows;
    public readonly api: GridApi;
    public readonly rowModelType: string;
    public readonly csrm: boolean;
    public readonly ssrm: boolean;
    public readonly pivotMode: boolean;
    public readonly groupHideOpenParents: boolean;
    public readonly groupHideParentOfSingleChild: string | boolean;
    public readonly groupAllowUnbalanced: boolean;
    /** When groupDisplayType is 'multipleColumns', all displayed rows get uiLevel=0 (set by enterprise flattenStage). */
    public readonly isGroupMultiAutoColumn: boolean;

    public constructor(gridRows: GridRows) {
        const api = gridRows.api;
        this.gridRows = gridRows;
        this.api = api;
        const rowModelType = api.getGridOption('rowModelType') || 'clientSide';
        this.rowModelType = rowModelType;
        this.csrm = rowModelType === 'clientSide';
        this.ssrm = rowModelType === 'serverSide';
        this.pivotMode = !!api.getGridOption('pivotMode');
        this.groupHideOpenParents = !!api.getGridOption('groupHideOpenParents');
        this.groupHideParentOfSingleChild = api.getGridOption('groupHideParentOfSingleChild') ?? false;
        this.groupAllowUnbalanced = !!api.getGridOption('groupAllowUnbalanced');
        this.isGroupMultiAutoColumn = api.getGridOption('groupDisplayType') === 'multipleColumns';
    }

    public get hasPostSortRows(): boolean {
        let result = this._hasPostSortRows;
        if (result !== undefined) {
            return result;
        }
        result = typeof this.api.getGridOption('postSortRows') === 'function';
        this._hasPostSortRows = result;
        return result;
    }

    public get showRowGroupColumns(): AgColumn[] {
        let result = this._showRowGroupColumns;
        if (result !== undefined) {
            return result;
        }
        const api = this.gridRows.api;
        const columns = api.getColumns() ?? [];
        const displayedColumns = api.getAllDisplayedColumns?.() ?? [];
        const displayedSet = new Set(displayedColumns as AgColumn[]);
        result = [];
        for (let i = 0; i < columns.length; ++i) {
            const column = columns[i] as AgColumn;
            if (!displayedSet.has(column)) {
                continue;
            }
            const showRowGroup = column.getColDef().showRowGroup;
            if (showRowGroup === undefined || showRowGroup === null || showRowGroup === false) {
                continue;
            }
            result.push(column);
        }
        this._showRowGroupColumns = result;
        return result;
    }

    public get groupSelectsDescendants(): boolean {
        let result = this._groupSelectsDescendants;
        if (result !== undefined) {
            return result;
        }
        const api = this.gridRows.api;
        const selection = api.getGridOption('rowSelection');
        if (selection == null) {
            result = false;
        } else if (typeof selection === 'string') {
            result = !!api.getGridOption('groupSelectsChildren');
        } else if (selection.mode !== 'multiRow') {
            result = false;
        } else {
            const groupSelects = selection.groupSelects;
            result = groupSelects === 'descendants' || groupSelects === 'filteredDescendants';
        }
        this._groupSelectsDescendants = result;
        return result;
    }
}
