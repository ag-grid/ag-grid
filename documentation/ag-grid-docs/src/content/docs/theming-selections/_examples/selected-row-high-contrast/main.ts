import type {
    ColDef,
    GridApi,
    GridOptions,
    RowDragCancelEvent,
    RowDragEndEvent,
    RowDragLeaveEvent,
    RowDragMoveEvent,
} from 'ag-grid-community';
import { ModuleRegistry, createGrid, enableDevValidations, themeQuartz } from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';

if (process.env.NODE_ENV !== 'production') {
    // Enable extended validations only for development
    enableDevValidations();
}

ModuleRegistry.registerModules([AllEnterpriseModule]);

const myTheme = themeQuartz.withParams({
    // inverted colours, defined relative to the theme so they work in light
    // and dark mode: 30% accent colour mixed into the foreground colour, with
    // text in the background colour
    selectedRowBackgroundColor: { ref: 'accentColor', mix: 0.3, onto: 'foregroundColor' },
    selectedRowTextColor: { ref: 'backgroundColor' },

    // invert the checkboxes to match
    selectedRowCheckboxCheckedBackgroundColor: { ref: 'backgroundColor' },
    selectedRowCheckboxCheckedBorderColor: { ref: 'backgroundColor' },
    selectedRowCheckboxCheckedShapeColor: { ref: 'selectedRowBackgroundColor' },
    selectedRowCheckboxUncheckedBackgroundColor: { ref: 'selectedRowBackgroundColor' },
    selectedRowCheckboxUncheckedBorderColor: { ref: 'backgroundColor' },
    selectedRowCheckboxIndeterminateBackgroundColor: { ref: 'backgroundColor' },
    selectedRowCheckboxIndeterminateBorderColor: { ref: 'backgroundColor' },
    selectedRowCheckboxIndeterminateShapeColor: { ref: 'selectedRowBackgroundColor' },

    // keep borders, the drag handle and the drop indicator visible
    selectedRowRangeSelectionBorderColor: { ref: 'backgroundColor' },
    selectedRowDragHandleColor: { ref: 'backgroundColor' },
    selectedRowDragIndicatorColor: { ref: 'backgroundColor' },
});

const columnDefs: ColDef[] = [
    { field: 'athlete', minWidth: 170, rowDrag: true },
    { field: 'country' },
    { field: 'age' },
    {
        headerName: 'Gold Medal',
        colId: 'goldMedal',
        valueGetter: (params) => (params.data?.gold ?? 0) > 0,
        valueSetter: (params) => {
            params.data.gold = params.newValue ? 1 : 0;
            return true;
        },
        cellDataType: 'boolean',
        filter: false,
        width: 120,
    },
    {
        headerName: 'Silver Medal',
        colId: 'silverMedal',
        valueGetter: (params) => (params.data?.silver ?? 0) > 0,
        valueSetter: (params) => {
            params.data.silver = params.newValue ? 1 : 0;
            return true;
        },
        cellDataType: 'boolean',
        filter: false,
        width: 120,
    },
    {
        headerName: 'Bronze Medal',
        colId: 'bronzeMedal',
        valueGetter: (params) => (params.data?.bronze ?? 0) > 0,
        valueSetter: (params) => {
            params.data.bronze = params.newValue ? 1 : 0;
            return true;
        },
        cellDataType: 'boolean',
        filter: false,
        width: 120,
    },
];

let gridApi: GridApi<IOlympicData>;

const gridOptions: GridOptions<IOlympicData> = {
    theme: myTheme,
    columnDefs: columnDefs,
    rowSelection: { mode: 'multiRow' },
    cellSelection: true,
    onRowDragMove: onRowDragMove,
    onRowDragEnd: onRowDragEnd,
    onRowDragLeave: onRowDragLeave,
    onRowDragCancel: onRowDragCancel,
    defaultColDef: {
        editable: true,
        filter: true,
    },
    onFirstDataRendered: (params) => {
        params.api.forEachNode((node) => {
            if (
                node.rowIndex === 2 ||
                node.rowIndex === 3 ||
                node.rowIndex === 4 ||
                node.rowIndex === 5 ||
                node.rowIndex === 6
            ) {
                node.setSelected(true);
            }
        });
    },
};

function onRowDragMove(e: RowDragMoveEvent) {
    const overNodeTop = e.overNode?.rowTop ?? 0;
    const overNodeHeight = e.overNode?.rowHeight ?? 0;
    const yRatio = (e.y - overNodeTop - overNodeHeight / 2) / overNodeHeight;

    e.api.setRowDropPositionIndicator({
        row: e.overNode,
        dropIndicatorPosition: yRatio < 0 ? 'above' : 'below',
    });
}

function onRowDragEnd(e: RowDragEndEvent) {
    e.api.setRowDropPositionIndicator(null);
}

function onRowDragLeave(e: RowDragLeaveEvent) {
    e.api.setRowDropPositionIndicator(null);
}

function onRowDragCancel(e: RowDragCancelEvent) {
    e.api.setRowDropPositionIndicator(null);
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);

    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then((response) => response.json())
        .then((data: IOlympicData[]) => {
            gridApi.setGridOption('rowData', data);
        });
});
