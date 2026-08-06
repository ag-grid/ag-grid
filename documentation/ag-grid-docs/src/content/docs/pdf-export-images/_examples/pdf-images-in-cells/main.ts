import type { GridApi, GridOptions, PdfCellImageCallbackParams } from 'ag-grid-community';
import { ClientSideRowModelModule, ModuleRegistry, createGrid, enableDevValidations } from 'ag-grid-community';
import { ColumnMenuModule, ContextMenuModule, PdfExportModule } from 'ag-grid-enterprise';

import { CountryCellRenderer } from './countryCellRenderer_typescript';
import { flagImages } from './data';
import type { CountryData, ImageContext } from './interfaces';

// Enable extended validations only for development
if (process.env.NODE_ENV !== 'production') {
    enableDevValidations();
}

ModuleRegistry.registerModules([ClientSideRowModelModule, PdfExportModule, ColumnMenuModule, ContextMenuModule]);

let gridApi: GridApi<CountryData>;

const rows: CountryData[] = [
    { country: 'United Kingdom', countryCode: 'gb', capital: 'London', population: '68.3 million' },
    { country: 'United States', countryCode: 'us', capital: 'Washington, D.C.', population: '340.1 million' },
    { country: 'Germany', countryCode: 'de', capital: 'Berlin', population: '84.7 million' },
    { country: 'Brazil', countryCode: 'br', capital: 'Brasília', population: '212.6 million' },
];

const gridOptions: GridOptions<CountryData> = {
    columnDefs: [
        {
            field: 'country',
            minWidth: 190,
            cellRenderer: CountryCellRenderer,
        },
        { field: 'capital', minWidth: 170 },
        { field: 'population', minWidth: 150 },
    ],
    defaultColDef: {
        flex: 1,
    },
    defaultPdfExportParams: {
        addImageToCell: (params: PdfCellImageCallbackParams<CountryData>) => {
            const countryCode = params.node.data?.countryCode;
            const flagImage = countryCode ? flagImages[countryCode] : undefined;
            if (params.column.getColId() !== 'country' || !countryCode || !flagImage) {
                return;
            }

            return {
                image: {
                    id: `flag-${countryCode}`,
                    base64: flagImage,
                    imageType: 'png',
                    width: 20,
                    height: 10,
                    altText: `${params.value} flag`,
                },
                value: params.value,
            };
        },
    },
    context: {
        flagImages,
    } as ImageContext,
    rowData: rows,
};

function onBtExport() {
    gridApi.exportDataAsPdf();
}

document.addEventListener('DOMContentLoaded', () => {
    gridApi = createGrid(document.querySelector<HTMLElement>('#myGrid')!, gridOptions);
});
