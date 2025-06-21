import { AgChartsEnterpriseModule } from 'ag-charts-enterprise';

import type {
    AgColumn,
    BeanCollection,
    BodyScrollEvent,
    CellCtrl,
    CellEditingStartedEvent,
    CellEditingStoppedEvent,
    CellValueChangedEvent,
    EditStrategyType,
    EditingCellPosition,
    GridApi,
    GridOptions,
    IAggFuncParams,
    ICellRendererParams,
    IRowNode,
    ModelUpdatedEvent,
    RowEditingStartedEvent,
    RowEditingStoppedEvent,
    RowPinnedType,
    ValueFormatterParams,
    ValueGetterParams,
    ValueSetterParams,
} from 'ag-grid-community';
import {
    CheckboxEditorModule,
    ClientSideRowModelApiModule,
    ClientSideRowModelModule,
    HighlightChangesModule,
    ModuleRegistry,
    NumberEditorModule,
    PinnedRowModule,
    RenderApiModule,
    RowApiModule,
    RowDragModule,
    RowSelectionModule,
    TextEditorModule,
    TextFilterModule,
    UndoRedoEditModule,
    ValidationModule,
    createGrid,
} from 'ag-grid-community';
import {
    AggregationModule,
    BatchEditModule,
    CellSelectionModule,
    ClipboardModule,
    ColumnMenuModule,
    ColumnsToolPanelModule,
    ContextMenuModule,
    ExcelExportModule,
    FiltersToolPanelModule,
    IntegratedChartsModule,
    PivotModule,
    RowGroupingPanelModule,
    RowNumbersModule,
    StatusBarModule,
} from 'ag-grid-enterprise';

import { CustomCellRenderer } from './custom-renderer';
import { getData } from './data';
import {
    _decorate,
    _getAllLeafSiblings,
    _getAncestors,
    _getCellCtrl,
    _getDependentCells,
    _getRelatedRows,
} from './utils';

ModuleRegistry.registerModules([
    NumberEditorModule,
    ColumnsToolPanelModule,
    ColumnMenuModule,
    ContextMenuModule,
    PivotModule,
    FiltersToolPanelModule,
    RowGroupingPanelModule,
    CellSelectionModule,
    TextEditorModule,
    PinnedRowModule,
    ClientSideRowModelModule,
    ExcelExportModule,
    UndoRedoEditModule,
    HighlightChangesModule,
    RowDragModule,
    AggregationModule,
    ClientSideRowModelApiModule,
    StatusBarModule,
    CheckboxEditorModule,
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
    RowSelectionModule,
    CheckboxEditorModule,
    RowApiModule,
    TextFilterModule,
    ClipboardModule,
    BatchEditModule,
    RenderApiModule,
    RowNumbersModule,
    ValidationModule /* Development Only */,
]);

let gridApi: GridApi;

// distinct count of first names
const uniqOrDots = (params: IAggFuncParams) => {
    const uniqueNames = new Set<string>();
    const values: string[] = [];

    params.values.forEach((value) => {
        if (value?.values) {
            value.values.forEach((v: any) => {
                uniqueNames.add(v);
                values.push(v);
            });
        } else {
            uniqueNames.add(value);
            values.push(value);
        }
    });

    const str = `${uniqueNames.size} / ${values.length}`;

    return {
        toString: () => str,
        values,
    };
};

let node: IRowNode | undefined;

const gridOptions: GridOptions = {
    columnDefs: [
        {
            headerName: 'Name',
            children: [
                {
                    field: 'firstName',
                    enableRowGroup: true,
                    enablePivot: true,
                    aggFunc: uniqOrDots,
                    rowGroup: true,
                    rowDrag: true,
                    valueFormatter: (params: ValueFormatterParams) => {
                        node = params.node as IRowNode;
                        return params.value ?? '';
                    },
                },
                {
                    field: 'lastName',
                    enableRowGroup: true,
                    enablePivot: true,
                    aggFunc: uniqOrDots,
                },
                {
                    field: 'lastName',
                    enableRowGroup: true,
                    enablePivot: true,
                    aggFunc: uniqOrDots,
                },
                {
                    headerName: 'Details',
                    colId: 'details',
                    cellRenderer: CustomCellRenderer,
                    editable: false,
                    minWidth: 145,
                },
                {
                    headerName: 'DetailsFn',
                    colId: 'detailsFn',
                    cellRenderer: (params: ICellRendererParams) => {
                        return `
                            <div  class="athlete-info">
                                <span>${params.data?.firstName ?? ''} </span>
                                <span>${params.data?.lastName ?? ''}</span>
                            </div>
                            <span>${params.data?.age ?? ''}</span>
                        `;
                    },
                    editable: false,
                    minWidth: 145,
                },
                {
                    headerName: 'DetailsGt',
                    colId: 'detailsGt',
                    valueGetter: (params: ValueGetterParams) => {
                        return `${params.data?.firstName ?? ''} ${params.data?.lastName ?? ''}`;
                    },
                    editable: false,
                    minWidth: 145,
                },
                {
                    headerName: 'DetailsFmt',
                    colId: 'detailsFmt',
                    valueFormatter: (params: ValueFormatterParams) => {
                        return `${params.data?.firstName ?? ''} ${params.data?.lastName ?? ''}`;
                    },
                    editable: false,
                    minWidth: 145,
                },
            ],
        },
        { field: 'gender', enableRowGroup: true, enablePivot: true, aggFunc: uniqOrDots, rowGroup: true },
        { field: 'exists', cellRenderer: 'agCheckboxCellRenderer', cellEditor: 'agCheckboxCellEditor' },
        { field: 'age', aggFunc: 'sum', cellDataType: 'number', enableValue: true },
        { field: 'mood', enableRowGroup: true, enablePivot: true, aggFunc: uniqOrDots },
        { field: 'country', enableRowGroup: true, enablePivot: true, aggFunc: uniqOrDots },
        { field: 'address', minWidth: 550 },
    ],
    defaultColDef: {
        flex: 1,
        minWidth: 110,
        editable: true,
        filter: true,
        enableCellChangeFlash: true,
        equals: (a: any, b: any) => {
            if (a?.values && b?.values) {
                return a.values.length === b.values.length && a.values.every((v: any) => b.values.includes(v));
            }
            return a === b;
        },
    },
    autoGroupColumnDef: {
        headerName: 'Group',
        valueSetter: (_params: ValueSetterParams): boolean => {
            console.log('valueSetter called for autoGroupColumnDef');
            return true;
        },
    },
    grandTotalRow: 'bottom',
    groupTotalRow: 'bottom',
    sideBar: {
        toolPanels: ['columns'],
    },
    pivotPanelShow: 'always',
    rowData: getData(),
    undoRedoCellEditing: true,
    undoRedoCellEditingLimit: 5,
    cellSelection: {
        handle: {
            mode: 'fill',
        },
    },
    enableCharts: true,
    rowNumbers: true,
    rowDragManaged: true,
    enableRowPinning: true,
    groupDisplayType: 'multipleColumns',
    groupDefaultExpanded: 2,
    isRowPinned: (rowNode: IRowNode) => {
        // pinning the first two rows at the top
        if (rowNode.data?.firstName === 'Jane' && rowNode.data?.lastName === 'Wilson') {
            return 'top';
        }
        if (rowNode.data?.firstName === 'John') {
            return 'bottom';
        }
    },
    rowSelection: { mode: 'multiRow' },
    suppressAggFuncInHeader: true,
    statusBar: {
        statusPanels: [
            { statusPanel: 'agTotalAndFilteredRowCountComponent' },
            { statusPanel: 'agTotalRowCountComponent' },
            { statusPanel: 'agFilteredRowCountComponent' },
            { statusPanel: 'agSelectedRowCountComponent' },
            { statusPanel: 'agAggregationComponent' },
        ],
    },
    onRowEditingStarted: (_event: RowEditingStartedEvent) => {
        console.log('rowEditingStarted');
    },
    onRowEditingStopped: (_event: RowEditingStoppedEvent) => {
        console.log('rowEditingStopped');
    },
    onCellEditingStarted: (_event: CellEditingStartedEvent) => {
        console.log('cellEditingStarted');
    },
    onCellEditingStopped: (_event: CellEditingStoppedEvent) => {
        console.log('cellEditingStopped');
    },
    onCellValueChanged: (_event: CellValueChangedEvent) => {
        console.log('Cell value changed');
        getEditingCells();
    },
    onBodyScroll(_event: BodyScrollEvent) {
        decorated && decorateCells();
    },
    onModelUpdated(_event: ModelUpdatedEvent) {
        decorated && decorateCells();
    },
    onCellClicked: () => {
        getEditingCells();
    },
    onCellFocused: (event) => {
        getEditingCells();
    },
    onCellKeyDown: (event) => {
        getEditingCells();
    },
};

let decorated = false;
function decorateCells() {
    if (!node) {
        return;
    }
    const beans = (node as any)['beans'] as BeanCollection;

    const positions = gridApi!.getEditingCells({ includePending: true });

    gridApi.redrawRows();

    decorated = true;

    positions.forEach((position: EditingCellPosition) => {
        const rowCtrl = beans.rowRenderer.getRowByPosition(position);
        if (!rowCtrl) {
            return null;
        }

        const cellCtrl: CellCtrl | null = rowCtrl.getCellCtrl(position.column as AgColumn);

        if (!cellCtrl) {
            return;
        }

        const { rowNode, column } = cellCtrl!;
        const ancestors = _getAncestors(rowNode, { includeRelated: true });
        const leafSiblings = _getAllLeafSiblings(rowNode);
        const relatedNodes = _getRelatedRows(rowNode);

        _decorate(beans, [rowNode], 'ag-cell-batch-edit', column, undefined);
        _decorate(beans, ancestors, 'ancestor-nodes', column, rowNode);
        _decorate(beans, leafSiblings, 'leaf-sibling-nodes', column, rowNode);
        _decorate(beans, relatedNodes, 'related-nodes', column, rowNode);

        relatedNodes.forEach((relatedRowNode: IRowNode) => {
            _getDependentCells(beans, relatedRowNode).forEach((cellCtrl: CellCtrl) => {
                if (cellCtrl.eGui.classList.contains('ag-cell-batch-edit')) {
                    return;
                }
                cellCtrl.comp.toggleCss('dependent-nodes', true);
            });
        });
    });
}

function clearDecorations() {
    decorated = false;
    gridApi.redrawRows();
}

function trim(str?: any) {
    if (!str || typeof str !== 'string') {
        return str;
    }
    const len = Math.min(15, str.length);
    return str.substring?.(0, len) + (str.length > len ? '...' : '') ?? str;
}

function getEditingCells() {
    setTimeout(() => {
        const cells = gridApi!.getEditingCells({ includePending: true });
        console.log(cells);
        document.getElementById('edits-table')!.innerHTML = `
        <thead>
            <tr>
                <th>Idx</th>
                <th>Row</th>
                <th>ColId</th>
                <th>Pinned</th>
                <th>Old</th>
                <th>New</th>
                <th>State</th>
            </tr>
        </thead>
        <tbody>
            ${cells
                .map(
                    (cell, index) => `
                <tr>
                    <td>${index}</td>
                    <td>${cell.rowIndex}</td>
                    <td>${trim(cell.colId)}</td>
                    <td>${cell.rowPinned ?? ''}</td>
                    <td>${trim(cell.oldValue)}</td>
                    <td>${trim(cell.newValue)}</td>
                    <td style="text-decoration: italic">${cell.state}</td>
                </tr>
            `
                )
                .join('')}
        </tbody>
    `;
    });
}

let polling: any = undefined;
function pollState() {
    if (polling) {
        clearInterval(polling);
        polling = undefined;
    } else {
        polling = setInterval(getEditingCells, 1000);
    }

    document.getElementById('enablePoll')!.style.display = polling ? 'none' : 'unset';
    document.getElementById('disablePoll')!.style.display = polling ? 'unset' : 'none';
}

function onBtStartEditing(key?: string, pinned?: RowPinnedType) {
    gridApi!.setFocusedCell(1, 'lastName', pinned);

    gridApi!.startEditingCell({
        rowIndex: 1,
        colKey: 'lastName',
        // set to 'top', 'bottom' or undefined
        rowPinned: pinned,
        key: key,
    });
    getEditingCells();
}

function toggleBatch() {
    const batch = gridApi!.isBatchEditing();

    gridApi!.startBatchEdit();

    document.getElementById('enablePoll')!.style.display = polling ? 'none' : 'unset';
    document.getElementById('disablePoll')!.style.display = polling ? 'unset' : 'none';

    document.getElementById('edits-table')!.style.display = batch ? 'none' : 'block';
}

function createChart() {
    gridApi!.createRangeChart({
        chartType: 'groupedColumn',
        cellRange: {
            rowStartIndex: 14,
            rowEndIndex: 18,
            columns: ['mood', 'age'],
        },
    });
}

function setEditType(editType: EditStrategyType) {
    console.log('Setting edit type to:', editType);
    gridApi!.updateGridOptions({
        editType,
    });
    getEditingCells();
}

function cancelEdit() {
    gridApi!.stopEditing(true);
    getEditingCells();
}

function stopEdit() {
    gridApi!.stopEditing();
    getEditingCells();
}

function onBtExport(type: 'csv' | 'excel') {
    if (type === 'excel') {
        gridApi!.exportDataAsExcel();
    } else {
        gridApi!.exportDataAsCsv({
            fileName: 'batch-editing.csv',
            processCellCallback: (params) => {
                // Example of modifying the cell value before export
                if (params.value && typeof params.value === 'string') {
                    return params.value.toUpperCase(); // Convert string values to uppercase
                }
                return params.value; // Return the original value for other types
            },
        });
    }
}

function onBtUndo() {
    gridApi!.undoCellEditing();
}

function onBtRedo() {
    gridApi!.redoCellEditing();
}

function refreshRows() {
    gridApi!.refreshCells({ force: true });
    getEditingCells();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
    getEditingCells();
});
