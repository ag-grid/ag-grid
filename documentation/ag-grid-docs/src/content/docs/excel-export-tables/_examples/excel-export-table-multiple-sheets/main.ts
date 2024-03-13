import { ColDef, GridApi, createGrid, GridOptions, IRowNode, ExcelExportParams, ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ExcelExportModule } from '@ag-grid-enterprise/excel-export';
import { MenuModule } from '@ag-grid-enterprise/menu';
import { SetFilterModule } from '@ag-grid-enterprise/set-filter';
import { IOlympicData, FlagContext } from './interfaces'

ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    ExcelExportModule,
    SetFilterModule,
    MenuModule,
]);

import { CountryCellRenderer } from './countryCellRenderer_typescript'

import { createBase64FlagsFromResponse } from './imageUtils';

const countryCodes: any = {};
const base64flags: any = {};

const columnDefs: ColDef[] = [
    {
        field: 'country',
        headerName: ' ',
        minWidth: 70,
        width: 70,
        maxWidth: 70,
        cellRenderer: CountryCellRenderer,
        cellRendererParams: {
            base64flags: base64flags,
            countryCodes: countryCodes
        }
    },
    { field: 'athlete' },
    { field: 'age' },
    { field: 'year' },
    { field: 'date' },
    { field: 'sport' },
    { field: 'gold' },
    { field: 'silver' },
    { field: 'bronze' },
    { field: 'total' },
]

let gridApi: GridApi<IOlympicData>;

const defaultExcelExportParams: ExcelExportParams = {
    exportAsExcelTable: {
        name: 'TableDemo',
    },
    addImageToCell: (rowIndex, col, value) => {
        if (col.getColId() !== 'country') {
            return
        }

        const countryCode = countryCodes[value];
        return {
            image: {
                id: countryCode,
                base64: base64flags[countryCode],
                imageType: 'png',
                width: 20,
                height: 11,
                position: {
                    offsetX: 30,
                    offsetY: 5.5,
                },
            },
        }
    },
};

const gridOptions: GridOptions<IOlympicData> = {
    columnDefs: columnDefs,
    defaultColDef: {
        width: 150,
        filter: true,
    },
    defaultExcelExportParams,
    context: {
        base64flags: base64flags,
        countryCodes: countryCodes
    } as FlagContext,
    onGridReady: params => {
        fetch('https://www.ag-grid.com/example-assets/small-olympic-winners.json')
            .then(data => createBase64FlagsFromResponse(data, countryCodes, base64flags))
            .then(data => params.api.setGridOption('rowData', data));
    },
}

function onBtExport() {
    const sports: Record<string, boolean> = {}

    gridApi!.forEachNode(function (node) {
        if (!sports[node.data!.sport]) {
            sports[node.data!.sport] = true
        }
    })

    let spreadsheets: string[] = []

    const performExport = async () => {
        for (const sport in sports) {
            await gridApi!.setColumnFilterModel('sport', { values: [sport] })
            gridApi!.onFilterChanged()

            if (gridApi!.getColumnFilterModel('sport') == null) {
                throw new Error('Example error: Filter not applied');
            }

            const sheet = gridApi!.getSheetDataForExcel({
                sheetName: sport,
            });

            if (sheet) {
                spreadsheets.push(sheet)
            }
        }

        await gridApi!.setColumnFilterModel('sport', null)
        gridApi!.onFilterChanged()

        gridApi!.exportMultipleSheetsAsExcel({
            data: spreadsheets,
            fileName: 'ag-grid.xlsx',
        })

        spreadsheets = []
    };

    performExport();
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    const gridDiv = document.querySelector<HTMLElement>('#myGrid')!;
    gridApi = createGrid(gridDiv, gridOptions);
});
