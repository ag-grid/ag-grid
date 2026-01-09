import type { AgColumn, GridApi } from 'ag-grid-community';

import type { GridRows } from '../gridRows';

export class GridRowsValidationState {
    private _showRowGroupColumns: AgColumn[] | undefined = undefined;
    private _groupSelectsDescendants: boolean | undefined = undefined;

    public readonly gridRows: GridRows;
    public readonly api: GridApi;
    public readonly rowModelType: string;
    public readonly csrm: boolean;
    public readonly ssrm: boolean;
    public readonly pivotMode: boolean;
    public readonly groupHideOpenParents: boolean;
    public readonly groupHideParentOfSingleChild: string | boolean;
    public readonly groupAllowUnbalanced: boolean;

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
        this._showRowGroupColumns = undefined;
        this._groupSelectsDescendants = undefined;
    }

    public get showRowGroupColumns(): AgColumn[] {
        if (this._showRowGroupColumns === undefined) {
            const api = this.gridRows.api;
            const columns = api.getColumns() ?? [];
            const displayedColumns = api.getAllDisplayedColumns?.() ?? [];
            const displayedSet = new Set(displayedColumns as AgColumn[]);
            const showRowGroupColumns: AgColumn[] = [];
            for (let i = 0; i < columns.length; ++i) {
                const column = columns[i] as AgColumn;
                if (!displayedSet.has(column)) {
                    continue;
                }
                const showRowGroup = column.getColDef().showRowGroup;
                if (showRowGroup === undefined || showRowGroup === null || showRowGroup === false) {
                    continue;
                }
                showRowGroupColumns.push(column);
            }
            this._showRowGroupColumns = showRowGroupColumns;
        }
        return this._showRowGroupColumns;
    }

    public get groupSelectsDescendants(): boolean {
        if (this._groupSelectsDescendants !== undefined) {
            return this._groupSelectsDescendants;
        }

        const api = this.gridRows.api;
        const selection = api.getGridOption('rowSelection');

        if (selection == null) {
            return (this._groupSelectsDescendants = false);
        }

        if (typeof selection === 'string') {
            return (this._groupSelectsDescendants = !!api.getGridOption('groupSelectsChildren'));
        }

        if (selection.mode !== 'multiRow') {
            return (this._groupSelectsDescendants = false);
        }

        const groupSelects = selection.groupSelects;
        return (this._groupSelectsDescendants =
            groupSelects === 'descendants' || groupSelects === 'filteredDescendants');
    }
}
