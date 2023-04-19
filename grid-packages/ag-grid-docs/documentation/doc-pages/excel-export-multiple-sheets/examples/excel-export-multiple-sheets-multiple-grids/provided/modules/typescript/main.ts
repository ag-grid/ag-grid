import '@ag-grid-community/styles/ag-grid.css';
import "@ag-grid-community/styles/ag-theme-alpine.css";
import { ColDef, Grid, GridOptions, GridReadyEvent, ICellRendererComp, ICellRendererParams, GetRowIdParams } from "@ag-grid-community/core";
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';

// Register the required feature modules with the Grid
ModuleRegistry.registerModules([ClientSideRowModelModule, MenuModule, ExcelExportModule])

class SportRenderer implements ICellRendererComp {
    eGui!: HTMLElement;

    init(params: ICellRendererParams) {
        this.eGui = document.createElement('i');

        this.eGui.addEventListener('click', function () {
            params.api.applyTransaction({ remove: [params.node.data] });
        });

        this.eGui.classList.add('far', 'fa-trash-alt');
        this.eGui.style.cursor = 'pointer';
    }

    getGui() {
        return this.eGui;
    }

    refresh(params: ICellRendererParams): boolean {
        return false;
    }
}

const leftColumnDefs: ColDef[] = [
    {
        rowDrag: true,
        maxWidth: 50,
        suppressMenu: true,
        rowDragText: (params, dragItemCount) => {
            if (dragItemCount > 1) {
                return dragItemCount + ' athletes';
            }
            return params.rowNode!.data.athlete;
        },
    },
    { field: "athlete" },
    { field: "sport" }
];

const rightColumnDefs: ColDef[] = [
    {
        rowDrag: true,
        maxWidth: 50,
        suppressMenu: true,
        rowDragText: (params, dragItemCount) => {
            if (dragItemCount > 1) {
                return dragItemCount + ' athletes';
            }
            return params.rowNode!.data.athlete;
        },
    },
    { field: "athlete" },
    { field: "sport" },
    {
        suppressMenu: true,
        maxWidth: 50,
        cellRenderer: SportRenderer
    }
];

const leftGridOptions: GridOptions = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: true,
        filter: true,
        resizable: true
    },
    rowSelection: 'multiple',
    rowDragMultiRow: true,
    getRowId: (params: GetRowIdParams) => {
        return params.data.athlete;
    },
    rowDragManaged: true,
    suppressMoveWhenRowDragging: true,
    columnDefs: leftColumnDefs,
    animateRows: true,
    onGridReady: (params) => {
        addGridDropZone(params);
    }
};

const rightGridOptions: GridOptions = {
    defaultColDef: {
        flex: 1,
        minWidth: 100,
        sortable: true,
        filter: true,
        resizable: true
    },
    getRowId: (params: GetRowIdParams) => {
        return params.data.athlete;
    },
    rowDragManaged: true,
    columnDefs: rightColumnDefs,
    animateRows: true
};

function addGridDropZone(params: GridReadyEvent) {
    const dropZoneParams = rightGridOptions.api!.getRowDropZoneParams({
        onDragStop: (params) => {
            const nodes = params.nodes;

            leftGridOptions.api!.applyTransaction({
                remove: nodes.map(function (node) {
                    return node.data;
                })
            });
        }
    });

    params.api.addRowDropZone(dropZoneParams);
}

function loadGrid(options: GridOptions, side: string, data: any[]) {
    const grid = document.querySelector<HTMLElement>('#e' + side + 'Grid')!;

    if (options && options.api) {
        options.api.destroy();
    }

    options.rowData = data;
    new Grid(grid, options);
}

function loadGrids() {
    fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        .then(response => response.json())
        .then(function (data) {
            const athletes: any[] = [];
            let i = 0;

            while (athletes.length < 20 && i < data.length) {
                const pos = i++;
                if (athletes.some(function (rec) {
                    return rec.athlete === data[pos].athlete;
                })) {
                    continue;
                }
                athletes.push(data[pos]);
            }

            loadGrid(leftGridOptions, 'Left', athletes.slice(0, athletes.length / 2));
            loadGrid(rightGridOptions, 'Right', athletes.slice(athletes.length / 2));
        });
}

function onExcelExport() {
    const spreadsheets = [];

    spreadsheets.push(
        leftGridOptions.api!.getSheetDataForExcel({ sheetName: 'Athletes' })!,
        rightGridOptions.api!.getSheetDataForExcel({ sheetName: 'Selected Athletes' })!
    );

    // could be leftGridOptions or rightGridOptions
    leftGridOptions.api!.exportMultipleSheetsAsExcel({
        data: spreadsheets,
        fileName: 'ag-grid.xlsx'
    });
}


const resetBtn = document.querySelector('button.reset')!;
const exportBtn = document.querySelector('button.excel')!;

resetBtn.addEventListener('click', function () {
    loadGrids();
});

exportBtn.addEventListener('click', function () {
    onExcelExport();
});

loadGrids();

